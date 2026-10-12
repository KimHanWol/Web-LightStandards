import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
function run(file,items,refs={}){
  const code=readFileSync(new URL('../n8n/runtime/'+file+'.js',import.meta.url),'utf8');
  return vm.runInNewContext('(function(){'+code+'})()',{$input:{all:()=>items.map(json=>({json})),first:()=>({json:items[0]})},$:name=>({first:()=>({json:refs[name]})}),$execution:{id:'test'},$now:{setZone:()=>({toFormat:()=> '2026-10-13'})}});
}
const sources=[1,2].map(n=>({title:'Test '+n,url:'https://example.com/'+n,reviewed:true,checkedAt:'2026-10-13',excerpt:'검증용 자료입니다. '.repeat(100)}));
const row={id:1,article_id:'test-article',intent_key:'test-intent',keyword:'테스트',category:'생활 도구',status:'ready',sources_json:JSON.stringify(sources),revision:0};
const config={paid_enabled:true,reserve_usd:.08,monthly_budget_usd:7,daily_limit:2};
test('generation refuses disabled budget, exhausted quota, duplicate intent and unreviewed evidence',()=>{
  assert.equal(run('select-draft',[row],{Configuration:config}).length,1);
  for(const c of [{...config,paid_enabled:false},{...config,monthly_budget_usd:.01},{...config,daily_limit:0}])assert.equal(run('select-draft',[row],{Configuration:c}).length,0);
  assert.equal(run('select-draft',[row,{...row,id:2,status:'published'}],{Configuration:config}).length,0);
  assert.equal(run('select-draft',[{...row,sources_json:'[]'}],{Configuration:config}).length,0);
});
test('uncertain model outcomes retain the budget reservation and stop image generation',()=>{
  const output=run('parse-draft',[{error:'timeout'}],{'Select Draft':{...row,reserved_usd:.08}})[0].json;
  assert.equal(output.status,'needs_review');assert.equal(output.reserved_usd,.08);assert.ok(output.error);
});
test('fal receipt validation works without URL global and rejects credentials sent to other hosts',()=>{
  const receipt={request_id:'abc-123',response_url:'https://queue.fal.run/fal-ai/flux/requests/abc-123',status_url:'https://queue.fal.run/fal-ai/flux/requests/abc-123/status'};
  assert.equal(run('save-fal-request',[receipt],{'Check Draft':row})[0].json.status,'image_pending');
  assert.equal(run('save-fal-request',[{...receipt,status_url:receipt.status_url.replace('queue.fal.run','evil.example')}],{'Check Draft':row})[0].json.status,'image_uncertain');
  assert.throws(()=>run('parse-image',[{images:[{url:'https://fal.media@evil.example/a.webp'},{url:'https://fal.media/a.webp'}]}],{'Select Image Request':row}),/Unexpected image host/);
});
test('approval cannot use a stale revision',()=>{
  assert.throws(()=>run('approve',[{...row,status:'needs_review',revision:2}],{Configuration:{article_id:row.article_id,revision:1,approved_by:'Test'}}),/current revision/);
});
