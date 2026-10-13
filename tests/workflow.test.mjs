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
test('draft validation accepts parsed n8n JSON objects and raw API JSON strings',()=>{
  const markdown=['## 첫 확인','## 다음 확인','## 마지막 확인'].map((heading,index)=>heading+'\n\n'+Array.from({length:20},(_,paragraph)=>`${index}-${paragraph} 검증 자료에서 확인한 조건과 적용 범위를 구체적으로 설명합니다. `.repeat(4)).join('\n\n')).join('\n\n')+'\n\n[첫 근거](https://example.com/1) [둘째 근거](https://example.com/2)';
  const draft={canWrite:true,title:'서로 다른 조건을 확인하는 검증용 원고',description:'실제 게시하지 않는 응답 형식 검증용 원고의 설명입니다.',markdown,imagePrompts:Array.from({length:5},(_,i)=>'Distinct educational still life scene '+i+' without words or logos.')};
  for(const text of [draft,JSON.stringify(draft)]){
    const response={id:'response-fixture',status:'completed',usage:{input_tokens:100,output_tokens:1000},output:[{content:[{type:'output_text',text}]}]};
    const result=run('parse-draft',[response],{'Select Draft':{...row,actual_usd:.004}})[0].json;
    assert.equal(result.status,'text_ready',result.error);
    assert.equal(result.body_markdown,markdown);
    assert.equal(result.actual_usd,.00564);
  }
});
test('test-only drafts cannot be approved or selected for publication',()=>{
  assert.throws(()=>run('approve',[{...row,status:'needs_review',revision:1}],{Configuration:{article_id:row.article_id,revision:1,approved_by:'Test'}}),/Test articles/);
  const settings={enabled:true,repo_owner:'test-owner',repo_name:'test-repo',site_url:'https://example.com'};
  assert.equal(run('select-publication',[{...row,status:'approved',scheduled_at:'2026-10-12T00:00:00Z'}],{Configuration:settings}).length,0);
});
test('fal receipt validation works without URL global and rejects credentials sent to other hosts',()=>{
  const receipt={request_id:'abc-123',response_url:'https://queue.fal.run/fal-ai/flux/requests/abc-123',status_url:'https://queue.fal.run/fal-ai/flux/requests/abc-123/status'};
  assert.equal(run('save-fal-request',[receipt],{'Check Draft':row})[0].json.status,'image_pending');
  assert.equal(run('save-fal-request',[{...receipt,status_url:receipt.status_url.replace('queue.fal.run','evil.example')}],{'Check Draft':row})[0].json.status,'image_uncertain');
  assert.throws(()=>run('parse-image',[{images:[{url:'https://fal.media@evil.example/a.webp'}]}],{'Select Image Request':row}),/Unexpected image host/);
});

test('image receipts accumulate to five scenes without duplicate charges',()=>{
  let current={...row,images_json:'[]',actual_usd:0.01,reserved_usd:0.015};
  for(let index=0;index<5;index++){
    const receipt={images:[{url:'https://fal.media/image-'+index+'.png'}],has_nsfw_concepts:[false]};
    current=run('parse-image',[receipt],{'Select Image Request':current})[0].json;
    assert.equal(JSON.parse(current.images_json).length,index+1);
    assert.equal(current.status,index===4?'needs_review':'image_more_needed');
    assert.ok(Math.abs(current.actual_usd-(0.01+0.003*(index+1)))<1e-9);
    assert.ok(Math.abs(current.reserved_usd-(4-index)*0.003)<1e-9);
    if(index<4)assert.throws(()=>run('parse-image',[receipt],{'Select Image Request':current}),/already recorded/);
  }
  assert.throws(()=>run('parse-image',[{images:[{url:'https://fal.media/extra.png'}]}],{'Select Image Request':current}),/remaining illustration/);
});
test('approval cannot use a stale revision',()=>{
  assert.throws(()=>run('approve',[{...row,status:'needs_review',revision:2}],{Configuration:{article_id:row.article_id,revision:1,approved_by:'Test'}}),/current revision/);
});
