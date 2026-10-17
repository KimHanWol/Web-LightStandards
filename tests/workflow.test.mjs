import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {plainText} from '../src/lib/content.mjs';
function run(file,items,refs={}){
  const code=readFileSync(new URL('../n8n/runtime/'+file+'.js',import.meta.url),'utf8');
  return vm.runInNewContext('(function(){'+code+'})()',{$input:{all:()=>items.map(json=>({json})),first:()=>({json:items[0]})},$:name=>({first:()=>({json:refs[name]})}),$execution:{id:'test'},$runIndex:0,$now:{setZone:()=>({toFormat:format=>format==='yyyy-MM'?'2026-10':'2026-10-13'})}});
}
const sources=[1,2].map(n=>({title:'Test '+n,url:'https://example.com/'+n,reviewed:true,checkedAt:'2026-10-13',excerpt:'검증용 자료입니다. '.repeat(100)}));
const row={id:1,article_id:'test-article',intent_key:'test-intent',keyword:'테스트',category:'생활 도구',status:'ready',sources_json:JSON.stringify(sources),revision:0};
const config={paid_enabled:true,reserve_usd:.08,monthly_budget_usd:7,daily_limit:2};

test('the pilot editorial correction cannot reopen a changed manuscript',()=>{
 const changed={...row,id:86,article_id:'docs-guide-63175-20261016',status:'published',revision:1,body_markdown:'changed',topic_map_json:JSON.stringify({batchId:'additional-70-20261016'})};
 assert.notEqual(run('batch-router',[changed])[0].json.action,'repair');
});

test('the lower-cost writer pilot is scoped and records cache-write costs without losing holds',()=>{
 const pilot={...row,article_id:'economy-pilot'};
 const selected=run('select-draft',[pilot],{Configuration:{...config,economy_pilot_article_id:pilot.article_id}})[0].json;
 assert.equal(selected.billing_model,'gpt-5.6-luna');assert.equal(selected.billing_rates.output,1.2);
 assert.equal(run('select-draft',[pilot],{Configuration:{...config,economy_pilot_article_id:'another'}})[0].json.billing_model,'gpt-5.4-mini');
 assert.equal(run('select-draft',[pilot],{Configuration:{...config,economy_enabled:true}})[0].json.billing_model,'gpt-5.6-luna');
 const response={id:'economy-receipt',model:'gpt-5.6-luna',status:'completed',usage:{input_tokens:1000,input_tokens_details:{cached_tokens:200,cache_write_tokens:100},output_tokens:500},output:[{content:[{type:'output_text',text:{canWrite:false,holdReason:'확인된 근거가 부족합니다.'}}]}]};
 const result=run('parse-draft',[response],{'Select Draft':{...selected,actual_usd:.01},Configuration:{}})[0].json;
 assert.ok(Math.abs(result.actual_usd-.010769)<1e-10);assert.equal(result.reserved_usd,0);assert.equal(result.error,'확인된 근거가 부족합니다.');assert.equal(JSON.parse(result.topic_map_json).writingReceipts[0].cacheWriteTokens,100);
 assert.throws(()=>run('parse-draft',[{...response,model:'unpriced-model'}],{'Select Draft':selected,Configuration:{}}),/Unexpected model pricing/);
});

test('an unchanged rejected photo query is not sent to paid selection again during image repair',()=>{
 const stockSearch={query:'physical photo subject',checkedAt:new Date().toISOString(),outcome:'selected',selected:0,responseId:'previous-photo-check'};
 const item={...row,status:'text_ready',images_json:'[]',topic_map_json:JSON.stringify({photoSearchQuery:stockSearch.query,imageRepairAttempts:1,stockSearch})};
 const selected=run('prepare-photo-search',[item],{'Batch Input':item})[0].json;assert.equal(selected.reusePhotoDecision,true);assert.equal(selected.photoSelectionAllowed,false);
 const filtered=run('filter-photo-candidates',[{results:[]}],{'Prepare Photo Search':selected})[0].json;assert.equal(filtered.hasPhotoCandidates,false);assert.equal(JSON.parse(filtered.topic_map_json).stockSearch.responseId,stockSearch.responseId);
 const changed={...item,topic_map_json:JSON.stringify({photoSearchQuery:'different physical subject',imageRepairAttempts:1,stockSearch})};assert.equal(run('prepare-photo-search',[changed],{'Batch Input':changed})[0].json.photoSelectionAllowed,true);
});

test('compact image repair dispatch reloads the actual review instead of calling the writer',()=>{
 const draft={...row,id:37,article_id:'compact-visual-repair',status:'needs_review',revision:2,reserved_usd:0,character_count:4000,body_markdown:'보존할 원고',error:'Editorial review: ["이미지 3: 가짜 글자"]',image_prompt:'["scene one","scene two","replacement scene"]',images_json:'[{"url":"one"},{"url":"two"},{"url":"three"}]',topic_map_json:JSON.stringify({batchId:'additional-70-20261016',reviewIssues:{revision:2,type:'images',responseId:'accepted-review'},imageReplacementPlan:{responseId:'accepted-review',indexes:[3]}})};
 const compact=run('batch-router',[draft])[0].json;assert.equal(compact.action,'repair_images');assert.equal(compact.error,undefined);
 const scope=run('identify-repair-scope',[compact])[0].json;assert.equal(scope.imageOnlyRepair,true);
 const replacement=run('prepare-existing-draft',[draft],{'Batch Input':scope})[0].json;assert.equal(replacement.body_markdown,draft.body_markdown);assert.equal(replacement.status,'text_ready');assert.equal(JSON.parse(replacement.images_json).length,2);assert.equal(replacement.reserved_usd,.003);assert.equal(JSON.parse(replacement.topic_map_json).factCorrectionAttempts,undefined);
 assert.equal(run('prepare-existing-draft',[{...draft,error:'Editorial review: ["본문이 근거와 다릅니다."]',topic_map_json:'{}'}],{'Batch Input':scope}).length,0);
});

test('exhausted paragraph or image repairs cannot fall back to a full paid rewrite',()=>{
 for(const error of ['Editorial review: ["이미지 3: 문제가 남음"]','근거가 본문을 뒷받침하지 못합니다.']){
  const item={...row,id:74,article_id:'bounded-repair',status:'needs_review',character_count:4000,body_markdown:'이미 작성한 본문입니다. '.repeat(400),openai_response_id:'accepted',reserved_usd:0,error,topic_map_json:JSON.stringify({batchId:'additional-70-20261016',automaticWritingAttempts:1,factCorrectionAttempts:2,imageRepairAttempts:2,reviewIssues:{revision:1,type:'images'}}),revision:1};
  assert.equal(run('batch-router',[item])[0].json.action,'finished');
  assert.equal(run('select-draft',[item],{Configuration:{...config,batch_mode:true,target_article_id:item.article_id}}).length,0);
 }
});

test('confirmed recovery clears only the inspected provider hold before resuming',()=>{
 const completed={...row,id:73,article_id:'chrome-guide-95472-20261016',status:'needs_review',revision:4,character_count:4000,error:'',image_prompt:'["a","b","c"]',images_json:'[{},{},{}]',topic_map_json:JSON.stringify({batchId:'additional-70-20261016',providerUnavailable:{receiptExecutionId:'4449'}})};
 const action=run('batch-router',[completed])[0].json;assert.equal(action.action,'repair');assert.equal(action.status,'needs_review');
 const map=JSON.parse(action.topic_map_json);assert.equal(map.providerUnavailable,undefined);assert.equal(map.providerRestored.resultExecutionId,'4467');
 assert.notEqual(run('batch-router',[{...completed,revision:5}])[0].json.action,'repair');
});

test('citation repair sends the original paragraphs once and preserves all evidence',()=>{
 const manuscript='## 조건\n\n'+('기존의 올바른 설명을 보존합니다. '.repeat(180))+'\n\n## 방법\n\n절차입니다.\n\n## 확인\n\n확인합니다.';
 const item={...row,id:74,article_id:'citation-repair',status:'needs_review',character_count:4000,body_markdown:manuscript,openai_response_id:'accepted',reserved_usd:0,error:'Sources missing or unexpected links',topic_map_json:JSON.stringify({batchId:'additional-70-20261016',coreQuestion:'독립 질문',providerRecovery:{verbose:'internal state'}})};
 const action=run('batch-router',[item])[0].json;assert.equal(action.action,'generate');
 const selected=run('select-draft',[item],{Configuration:{...config,batch_mode:true,target_article_id:item.article_id}})[0].json;
 const brief=JSON.parse(selected.brief);assert.equal(selected.factCorrectionMode,true);assert.equal(brief.correction.previousMarkdown,undefined);assert.equal(brief.actualParagraphs.map(p=>p.text).join('\n\n'),manuscript);assert.deepEqual(brief.sources,JSON.parse(item.sources_json));assert.equal(brief.candidateTopic.providerRecovery,undefined);assert.equal(brief.existingTitles,undefined);assert.equal(brief.existingTopics,undefined);assert.equal(brief.categoryTopicMap,undefined);assert.equal(brief.correction.citationCheck.missingSourceUrls.length,2);
 const retry={...item,error:'Expected specific factual corrections',topic_map_json:JSON.stringify({...JSON.parse(item.topic_map_json),factCorrectionAttempts:1})};
 assert.equal(run('batch-router',[retry])[0].json.action,'generate');
 const next=run('select-draft',[retry],{Configuration:{...config,batch_mode:true,target_article_id:item.article_id}})[0].json;assert.equal(next.factCorrectionMode,true);assert.equal(JSON.parse(next.topic_map_json).factCorrectionAttempts,2);
 assert.equal(run('select-draft',[{...retry,topic_map_json:next.topic_map_json}],{Configuration:{...config,batch_mode:true,target_article_id:item.article_id}}).length,0);
});

test('compact photo selection reuses the description as caption and retains licensing',()=>{
 const candidate={id:'real',url:'https://live.staticflickr.com/123/photo_b.jpg',title:'Real subject',creator:'Photographer',pageUrl:'https://www.flickr.com/photos/author/123',license:'by',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',provider:'flickr'};
 const prepared={...row,image_prompt:'["a","b","c"]',images_json:'[]',body_markdown:'## 장면\n\n본문',candidates:[candidate],actual_usd:.1,reserved_usd:.009,topic_map_json:JSON.stringify({stockSearch:{checkedAt:'2026-10-17T00:00:00Z'}})};
 const request=JSON.parse(run('build-photo-review-request',[prepared],{'Filter Photo Candidates':prepared})[0].json.photoRequestBody);assert.equal(request.reasoning.effort,'low');assert.equal(request.max_output_tokens,1000);assert.equal(request.text.format.schema.properties.selected.items.properties.index.maximum,0);assert.ok(!request.text.format.schema.properties.selected.items.required.includes('caption'));
 const response={model:'gpt-5.4-mini',status:'completed',usage:{input_tokens:10,output_tokens:10},output:[{content:[{type:'output_text',text:{selected:[{index:0,alt:'설명에 실제로 관련된 장면',sectionHeading:'장면'}]}}]}]};
 const result=run('merge-photo-selection',[response],{'Filter Photo Candidates':prepared})[0].json,image=JSON.parse(result.images_json)[0];assert.equal(result.error,'');assert.equal(image.caption,image.alt);assert.equal(image.stock.creator,candidate.creator);assert.equal(result.reserved_usd,.006);
});

test('inspected fourth-image decline reuses three paid images without another generation request',()=>{
 const input={...row,id:73,article_id:'chrome-guide-95472-20261016',status:'image_submitting',revision:2,character_count:4000,body_markdown:'Existing paid manuscript',image_prompt:'["a","b","c","d","e"]',images_json:'[{"url":"one"},{"url":"two"},{"url":"three"}]',fal_request_id:'01a14884-1a28-75b1-b0f6-845fc34fc609',error:'',actual_usd:.09,reserved_usd:.006,topic_map_json:JSON.stringify({batchId:'additional-70-20261016'})};
 const action=run('batch-router',[input])[0].json;assert.equal(action.action,'apply_image_policy');
 const saved=run('prepare-existing-draft',[input],{'Batch Input':action})[0].json;
 assert.equal(saved.status,'needs_review');assert.equal(saved.revision,3);assert.equal(saved.reserved_usd,0);assert.equal(saved.images_json,input.images_json);assert.equal(saved.body_markdown,input.body_markdown);assert.equal(saved.actual_usd,input.actual_usd);assert.equal(JSON.parse(saved.image_prompt).length,3);
 assert.equal(run('batch-router',[saved])[0].json.action,'review');
 assert.equal(run('batch-router',[{...saved,error:'Editorial review: ["Needs correction"]'}])[0].json.action,'finished');
 assert.equal(run('batch-router',[{...saved,status:'approved'}])[0].json.action,'publish');
 assert.equal(run('prepare-existing-draft',[{...input,revision:3}],{'Batch Input':action}).length,0);
});

test('three and four image plans stop generation at the planned count and reserve only missing images',()=>{
 for(const target of [3,4]){
  let current={...row,image_prompt:JSON.stringify(Array.from({length:target},(_,i)=>'Scene '+i)),images_json:'[]',actual_usd:0,reserved_usd:target*.003};
  for(let i=0;i<target;i++){
   current=run('parse-image',[{images:[{url:'https://fal.media/planned-'+i+'.png'}]}],{'Select Image Request':current})[0].json;
   assert.equal(JSON.parse(current.images_json).length,i+1);
   assert.equal(current.status,i===target-1?'needs_review':'image_more_needed');
   assert.ok(Math.abs(current.reserved_usd-(target-i-1)*.003)<1e-9);
  }
  assert.ok(Math.abs(current.actual_usd-target*.003)<1e-9);
  assert.throws(()=>run('parse-image',[{images:[{url:'https://fal.media/extra.png'}]}],{'Select Image Request':current}),/remaining illustration/);
  const article={...current,article_id:'actual-plan-'+target,status:'needs_review',revision:1,title:'근거에 따른 검토 대상 원고',character_count:4000,error:'',sources_json:JSON.stringify(sources)};
  const selected=run('select-review',[article],{Configuration:{article_id:article.article_id,revision:1,approved_by:'Offline check'}})[0].json;
  const schema=JSON.parse(selected.imageReviewSchema);
  assert.equal(schema.properties.imageAlts.minItems,target);assert.equal(schema.properties.imageAlts.maxItems,target);
  assert.equal(schema.properties.replacementPrompts.items.properties.index.maximum,target);
 }
});

test('licensed photos fill a three-image plan before generated fallback is requested',()=>{
 const candidate={id:'licensed-id',url:'https://live.staticflickr.com/123/photo_b.jpg',title:'Relevant scene',creator:'Photographer',pageUrl:'https://www.flickr.com/photos/author/123',license:'by',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',provider:'flickr'};
 const prepared={...row,image_prompt:'["a","b","c"]',images_json:JSON.stringify([1,2].map(i=>({url:'https://fal.media/accepted-'+i+'.png',generated:true}))),body_markdown:'## 확인\n\n설명',candidates:[candidate],actual_usd:.1,reserved_usd:.003,topic_map_json:JSON.stringify({stockSearch:{checkedAt:'2026-10-17T00:00:00.000Z'}})};
 const response={model:'gpt-5.4-mini',status:'completed',usage:{input_tokens:10,output_tokens:10},output:[{content:[{type:'output_text',text:{selected:[{index:0,alt:'실제 관련 사진',caption:'설명에 필요한 자료 사진',sectionHeading:'확인'}]}}]}]};
 const result=run('merge-photo-selection',[response],{'Filter Photo Candidates':prepared})[0].json;
 assert.equal(result.status,'needs_review');assert.equal(result.reserved_usd,0);
 const photos=JSON.parse(result.images_json);assert.equal(photos.length,3);assert.equal(photos[2].generated,false);assert.equal(photos[2].stock.creator,candidate.creator);
 const brief=JSON.parse(run('build-photo-review-request',[prepared],{'Filter Photo Candidates':prepared})[0].json.photoRequestBody);
 assert.equal(brief.text.format.schema.properties.selected.maxItems,1);
});

test('user-confirmed funding recovers only the inspected rejected request once',()=>{
 const declined={...row,id:73,article_id:'chrome-guide-95472-20261016',status:'image_uncertain',revision:2,images_json:'[{}]',fal_request_id:'',reserved_usd:.012,topic_map_json:JSON.stringify({batchId:'additional-70-20261016'})};
 const action=run('batch-router',[declined])[0].json;
 assert.equal(action.action,'repair');assert.equal(action.status,'text_ready');assert.equal(action.previous_status,'image_uncertain');
 const map=JSON.parse(action.topic_map_json);assert.equal(map.providerRecovery.receiptExecutionId,'4340');assert.equal(map.providerRecovery.requestAccepted,false);
 assert.equal(run('batch-router',[{...declined,topic_map_json:action.topic_map_json}])[0].json.action,'finished');
 assert.equal(run('batch-router',[{...declined,revision:3}])[0].json.action,'finished');
});

test('uncertain image charges and explicit provider blocks prevent further paid batch stages',()=>{
 const waiting={...row,id:37,article_id:'waiting',topic_map_json:JSON.stringify({batchId:'additional-70-20261016'})};
 for(const status of ['image_uncertain','provider_blocked']){
  const stopped=run('batch-router',[waiting,{...waiting,id:38,article_id:'blocked',status,reserved_usd:.012}])[0].json;
  assert.equal(stopped.action,'finished');assert.match(stopped.reason,/provider|reconciliation/i);
 }
 const approved={...waiting,status:'approved'};
 assert.equal(run('batch-router',[approved,{...waiting,id:38,article_id:'blocked',status:'provider_blocked'}])[0].json.action,'publish');
});

test('explicit fal balance rejection is distinct from an uncertain paid request',()=>{
 const blocked={error:{status:403,message:'User is locked. Reason: Exhausted balance.'},details:{httpCode:'403',body:{detail:'User is locked. Reason: Exhausted balance.'}}};
 const input={...row,reserved_usd:.012};
 for(const [file,ref] of [['save-fal-request','Find Free Photos'],['save-next-fal-request','Validate Images']]){
  const result=run(file,[blocked],{[ref]:input})[0].json;assert.equal(result.status,'provider_blocked');assert.equal(result.reserved_usd,0);assert.match(result.error,/balance/);
  const uncertain=run(file,[{error:{message:'timeout'}}],{[ref]:input})[0].json;assert.equal(uncertain.status,'image_uncertain');assert.equal(uncertain.reserved_usd,.012);
 }
});

test('batch action crosses the workflow boundary without full article payloads',()=>{
 const item={...row,id:37,article_id:'requested-new',topic_map_json:JSON.stringify({batchId:'additional-70-20261016'}),sources_json:'x'.repeat(100000),body_markdown:'x'.repeat(100000),publish_payload:'x'.repeat(100000)};
 const action=run('batch-router',[item])[0].json;
 assert.equal(action.article_id,item.article_id);assert.equal(action.action,'generate');
 assert.equal(action.sources_json,undefined);assert.equal(action.body_markdown,undefined);assert.equal(action.publish_payload,undefined);
 assert.ok(JSON.stringify(action).length<1000);
 const held={...item,status:'needs_review',body_markdown:'',error:'Confirmed response needs correction',openai_response_id:'confirmed',reserved_usd:0};
 const correction=run('batch-router',[held])[0].json;
 assert.equal(correction.action,'repair');assert.equal(correction.id,held.id);
 assert.equal(JSON.parse(correction.topic_map_json).batchId,'additional-70-20261016');
});

test('batch coordinator persists waits and isolates full-table reads in a short helper',()=>{
 const workflows=JSON.parse(readFileSync(new URL('../n8n/generated/current-workflows.json',import.meta.url),'utf8'));
 const router=workflows.find(w=>w.id==='thOXjRSewyYeWfRS');
 assert.ok(router.settings.saveExecutionProgress);
 const wait=router.nodes.find(n=>n.name==='Wait Before State Check');assert.equal(wait.parameters.unit,'seconds');
 const delay=(action,iteration)=>vm.runInNewContext(wait.parameters.amount.slice(3,-2).trim(),{$runIndex:iteration,$json:{previous_action:action}});
 assert.equal(delay('generate',0),1);assert.equal(delay('review',1),1);assert.equal(delay('images',2),5);assert.equal(delay('publish',3),20);assert.equal(delay('wait',4),10);
 assert.equal(delay('generate',7),70);assert.equal(delay('images',15),70);
 const checkpoint=router.nodes.find(n=>n.name==='Keep Batch Checkpoint').parameters.assignments.assignments;assert.equal(checkpoint.find(a=>a.name==='runner_version').value,'paced-v2');
 assert.equal(router.nodes.filter(n=>n.type==='n8n-nodes-base.dataTable'&&n.parameters.operation==='get').length,0);
 const action=router.nodes.find(n=>n.name==='Choose Next Safe Action');assert.equal(action.type,'n8n-nodes-base.executeWorkflow');
 const helper=workflows.find(w=>w.id===action.parameters.workflowId.value);
 assert.ok(helper.nodes.some(n=>n.type==='n8n-nodes-base.dataTable'&&n.parameters.returnAll));
 assert.ok(!helper.nodes.some(n=>/openAi|httpRequest|scheduleTrigger/.test(n.type)));
 assert.ok(helper.settings.executionTimeout<=120);
});

test('a legacy runner finishes before another paid stage while a paced runner proceeds',()=>{
 const candidate={...row,id:37,article_id:'next-row',topic_map_json:JSON.stringify({batchId:'additional-70-20261016'})};
 const old=run('batch-router',[candidate],{'Batch Input':{checkpoint_at:'2026-10-17T08:30:00Z'}})[0].json;assert.equal(old.action,'finished');assert.equal(old.complete,false);assert.match(old.reason,/safe handoff/);
 const next=run('batch-router',[candidate],{'Batch Input':{checkpoint_at:'2026-10-17T08:30:00Z',runner_version:'paced-v2'}})[0].json;assert.equal(next.action,'generate');
});

test('70 article batch is isolated, counts only its own publications and includes all monthly reservations',()=>{
 const candidate={...row,id:37,article_id:'new-requested',topic_map_json:JSON.stringify({batchId:'additional-70-20261016'})};
 const old={...row,id:4,article_id:'old-batch',status:'published',budget_month:'2026-10',actual_usd:3.2,reserved_usd:.08};
 const next=run('batch-router',[old,candidate])[0].json;
 assert.equal(next.article_id,candidate.article_id);assert.equal(next.target,70);assert.equal(next.completed,0);
 const stopped=run('batch-router',[{...old,actual_usd:6.82},candidate])[0].json;
 assert.equal(stopped.action,'finished');assert.match(stopped.reason,/Monthly budget/);
 assert.equal(run('batch-router',[old,{...candidate,status:'published'}])[0].json.completed,1);
});

test('review budget and daily caps terminate the batch instead of polling refused calls',()=>{
 const candidate={...row,id:37,article_id:'new-requested',topic_map_json:JSON.stringify({batchId:'additional-70-20261016'}),status:'needs_review',error:'',character_count:4000,image_prompt:JSON.stringify([1,2,3,4,5]),images_json:JSON.stringify([1,2,3,4,5])};
 const cost={...row,id:2,article_id:'ledger',status:'cost_uncertain',budget_month:'2026-10',actual_usd:6.95,reserved_usd:.03};
 assert.match(run('batch-router',[cost,candidate])[0].json.reason,/before review/);
 const dayRows=Array.from({length:40},(_,i)=>({...row,id:100+i,article_id:'old-'+i,status:'published',generation_day:'2026-10-13'}));
 assert.match(run('batch-router',[...dayRows,{...candidate,status:'ready'}])[0].json.reason,/Daily generation limit/);
});

test('writer topic context drops payment and image ledgers without dropping semantic scopes',()=>{
 const previous={...row,id:2,article_id:'existing',intent_key:'existing',keyword:'다른 질문',title:'이미 작성한 글',status:'published',character_count:4000,topic_map_json:JSON.stringify({coreQuestion:'기존 질문',scope:'독립 범위',stockSearch:{huge:'x'.repeat(90000)},imageReplacementPlan:{indexes:[1]},aliases:['이전 질문']})};
 const selected=run('select-draft',[row,previous],{Configuration:config})[0].json;
 const brief=JSON.parse(selected.brief);assert.equal(brief.existingTopics[0].scope,'독립 범위');assert.equal(brief.existingTopics[0].stockSearch,undefined);assert.ok(selected.brief.length<10000);
});
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
test('topic maps reject aliases across categories and expose scoped topics to the writer',()=>{
  const candidate={...row,article_id:'real-new',intent_key:'new-intent',keyword:'크롬 캐시 지우기',category:'새 분류'};
  const previous={...row,id:2,article_id:'real-existing',status:'published',title:'크롬 캐시 삭제 방법과 적용 범위',character_count:6100,intent_key:'old-intent',keyword:'크롬 캐시 삭제',topic_map_json:JSON.stringify({coreQuestion:'캐시 삭제 방법',aliases:['크롬 캐시 지우기'],scope:'Chrome'})};
  assert.equal(run('select-draft',[candidate,previous],{Configuration:config}).length,0);
  const unrelated={...candidate,keyword:'다른 도구의 독립적인 질문'};
  const selected=run('select-draft',[unrelated,previous],{Configuration:config})[0].json;
  assert.equal(JSON.parse(selected.brief).existingTopics[0].scope,'Chrome');
  assert.equal(run('select-draft',[{...unrelated,topic_map_json:'broken-json'}],{Configuration:config}).length,0);
});

test('queued and rejected empty drafts do not masquerade as existing articles',()=>{
  const candidate={...row,article_id:'drive-sharing',intent_key:'drive-sharing',keyword:'드라이브 공유 권한'};
  const queued={...row,id:2,article_id:'drive-folders',intent_key:'drive-folders',keyword:'드라이브 폴더 관리'};
  const rejected={...queued,id:3,article_id:'drive-search',intent_key:'drive-search',keyword:'드라이브 검색',status:'needs_review',title:'',character_count:0};
  const completed={...queued,id:4,article_id:'chrome-alerts',intent_key:'chrome-alerts',keyword:'크롬 알림 차단',status:'publishing',title:'크롬 사이트 알림을 차단하는 방법',character_count:6115};
  const selected=run('select-draft',[candidate,queued,rejected,completed],{Configuration:config})[0].json;
  const brief=JSON.parse(selected.brief);
  assert.deepEqual(brief.existingTopics.map(topic=>topic.articleId),['chrome-alerts']);
  assert.equal(run('select-draft',[candidate,{...queued,keyword:candidate.keyword}],{Configuration:config}).length,0);
});
test('draft validation accepts parsed n8n JSON objects and raw API JSON strings',()=>{
  const markdown=['## 첫 확인','## 다음 확인','## 마지막 확인'].map((heading,index)=>heading+'\n\n'+Array.from({length:20},(_,paragraph)=>`${index}-${paragraph} 검증 자료에서 확인한 조건과 적용 범위를 구체적으로 설명합니다. `.repeat(4)).join('\n\n')).join('\n\n')+'\n\n[첫 근거](https://example.com/1) [둘째 근거](https://example.com/2)';
  const draft={canWrite:true,title:'서로 다른 조건을 확인하는 검증용 원고',description:'실제 게시하지 않는 응답 형식 검증용 원고의 설명입니다.',markdown,imagePrompts:Array.from({length:3},(_,i)=>'Distinct educational still life scene '+i+' without words or logos.')};
  for(const text of [draft,JSON.stringify(draft)]){
    const response={id:'response-fixture',model:'gpt-5.4-mini',status:'completed',usage:{input_tokens:100,output_tokens:1000},output:[{content:[{type:'output_text',text}]}]};
    const result=run('parse-draft',[response],{'Select Draft':{...row,actual_usd:.004},Configuration:{input_usd_per_million:.75,cached_input_usd_per_million:.075,output_usd_per_million:4.5}})[0].json;
    assert.equal(result.status,'text_ready',result.error);
    assert.equal(result.body_markdown,markdown);
    assert.equal(result.actual_usd,.008575);
  }
});

test('draft, independent review, approval and routing agree on the 3500 minimum',()=>{
 const prefix='## 시작\n\n## 실행\n\n## 결과\n\n[첫 근거](https://example.com/1) [둘째 근거](https://example.com/2)';
 for(const size of [3499,3500,4000]){
  const markdown=prefix+'\n\n'+'가'.repeat(size-[...plainText(prefix)].length-1);
  const article={...row,id:35,article_id:'windows-screenshots-20261016',intent_key:'screenshots',revision:1,title:'길이 경계를 확인하는 검증용 원고',description:'실제로 발행하거나 유료 생성하지 않는 길이 경계 검사입니다.',body_markdown:markdown,character_count:size,status:'needs_review',image_prompt:JSON.stringify([1,2,3]),images_json:JSON.stringify(Array.from({length:3},(_,i)=>({url:'https://fal.media/fixture-'+i+'.png',alt:'검증용 이미지',generated:true}))),error:'',reserved_usd:0};
  const draft={canWrite:true,title:article.title,description:article.description,markdown,imagePrompts:Array.from({length:3},(_,i)=>'Distinct physical objects for educational scene '+i+' without lettering.')};
  const response={id:'fixture-response',model:'gpt-5.4-mini',status:'completed',usage:{input_tokens:100,output_tokens:100},output:[{content:[{type:'output_text',text:draft}]}]};
  const parsed=run('parse-draft',[response],{'Select Draft':article,Configuration:{input_usd_per_million:.75,cached_input_usd_per_million:.075,output_usd_per_million:4.5}})[0].json;
  assert.equal(parsed.character_count,size);assert.equal(parsed.error,size<3500?'Body length check failed':'');
  const reviewConfig={article_id:article.article_id,revision:1,approved_by:'Offline fixture'};
  assert.equal(run('select-review',[article],{Configuration:reviewConfig}).length,size<3500?0:1);
  if(size<3500)assert.throws(()=>run('approve',[article],{Configuration:reviewConfig}),/editorial errors/);
  else assert.equal(run('approve',[article],{Configuration:reviewConfig})[0].json.status,'approved');
  assert.equal(run('batch-router',[article])[0].json.action,size<3500?'finished':'review');
 }
});

test('a held automatic correction preserves the previous draft instead of erasing it',()=>{
 const previous={...row,title:'이전에 작성한 원고 제목',body_markdown:'기존의 올바른 설명을 보존합니다.',character_count:4921};
 const response={id:'hold-response',status:'completed',output:[{content:[{type:'output_text',text:{canWrite:false,holdReason:'근거 보강이 필요한 하위 질문'}}]}]};
 const out=run('parse-draft',[response],{'Select Draft':previous})[0].json;
 assert.equal(out.status,'needs_review');assert.equal(out.body_markdown,previous.body_markdown);assert.equal(out.character_count,4921);assert.equal(out.error,'근거 보강이 필요한 하위 질문');
});

test('confirmed short drafts use bounded additions without another full rewrite',()=>{
 const short={...row,id:7,article_id:'drive-help',status:'needs_review',body_markdown:'기존에 작성한 근거 있는 설명입니다. '.repeat(140),character_count:3200,error:'Body length check failed',openai_response_id:'confirmed',reserved_usd:0,topic_map_json:JSON.stringify({automaticWritingAttempts:2})};
 const selected=run('select-draft',[short],{Configuration:{...config,batch_mode:true}})[0].json;
 assert.equal(selected.completionMode,true);assert.equal(JSON.parse(selected.topic_map_json).automaticWritingAttempts,2);assert.equal(JSON.parse(selected.topic_map_json).completionAttempts,1);
 assert.equal(JSON.parse(selected.brief).correction.requiredAdditionalCharacters,800);
 assert.equal(run('select-draft',[{...short,reserved_usd:.12}],{Configuration:{...config,batch_mode:true}}).length,0);
 assert.equal(run('select-draft',[{...short,topic_map_json:JSON.stringify({automaticWritingAttempts:2,completionAttempts:2})}],{Configuration:{...config,batch_mode:true}}).length,0);
});

test('completion merges actual additions into the existing section and retains original text',()=>{
 const initial='## 적용 조건\n\n'+Array.from({length:45},(_,i)=>`${i} 적용 환경에 따라 작업 순서를 구분하는 기존 설명입니다. `.repeat(3)).join('\n\n')+'\n\n## 실행 순서\n\n기존 절차입니다.\n\n## 결과 확인\n\n[첫 근거](https://example.com/1) [둘째 근거](https://example.com/2)';
 const previous={...row,completionMode:true,title:'기존 원고의 제목을 그대로 보존합니다',description:'제공한 근거의 적용 조건을 정리한 기존 원고의 설명입니다.',body_markdown:initial,image_prompt:JSON.stringify(Array.from({length:5},(_,i)=>'Photographic physical objects scene '+i+' without text.')),images_json:'[]'};
 const added=Array.from({length:20},(_,i)=>`${i} 원고에서 아직 다루지 않은 확인 기준을 근거에 따라 추가로 설명합니다. `.repeat(3)).join('\n\n');
 const response={id:'completion-response',model:'gpt-5.4-mini',status:'completed',usage:{input_tokens:100,output_tokens:1000},output:[{content:[{type:'output_text',text:{canWrite:true,additions:[{afterHeading:'## 실행 순서',markdown:added}],photoSearchQuery:'physical objects'}}]}]};
 const out=run('parse-draft',[response],{'Select Draft':previous,Configuration:{input_usd_per_million:.75,cached_input_usd_per_million:.075,output_usd_per_million:4.5}})[0].json;
 assert.equal(out.status,'text_ready',out.error);assert.equal(out.title,previous.title);assert.ok(out.body_markdown.includes('기존 절차입니다.'));assert.ok(out.body_markdown.indexOf(added)<out.body_markdown.indexOf('## 결과 확인'));assert.ok(out.character_count>=5000);
});
test('test-only drafts cannot be approved or selected for publication',()=>{
  assert.throws(()=>run('approve',[{...row,status:'needs_review',revision:1}],{Configuration:{article_id:row.article_id,revision:1,approved_by:'Test'}}),/Test articles/);
  const settings={enabled:true,repo_owner:'test-owner',repo_name:'test-repo',site_url:'https://example.com'};
  assert.equal(run('select-publication',[{...row,status:'approved',scheduled_at:'2026-10-12T00:00:00Z'}],{Configuration:settings}).length,0);
});
test('fal receipt validation works without URL global and rejects credentials sent to other hosts',()=>{
  const receipt={request_id:'abc-123',response_url:'https://queue.fal.run/fal-ai/flux/requests/abc-123',status_url:'https://queue.fal.run/fal-ai/flux/requests/abc-123/status'};
  assert.equal(run('save-fal-request',[receipt],{'Find Free Photos':row})[0].json.status,'image_pending');
  assert.equal(run('save-fal-request',[{...receipt,status_url:receipt.status_url.replace('queue.fal.run','evil.example')}],{'Find Free Photos':row})[0].json.status,'image_uncertain');
  assert.throws(()=>run('parse-image',[{images:[{url:'https://fal.media@evil.example/a.webp'}]}],{'Select Image Request':row}),/Unexpected image host/);
});

test('image receipts accumulate to five scenes without duplicate charges',()=>{
  let current={...row,image_prompt:JSON.stringify([1,2,3,4,5]),images_json:'[]',actual_usd:0.01,reserved_usd:0.015};
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

test('automatic writing is scoped and stops after the bounded correction',()=>{
  assert.equal(run('select-draft',[row],{Configuration:{...config,target_article_id:'different-article'}}).length,0);
  const exhausted={...row,topic_map_json:JSON.stringify({automaticWritingAttempts:2})};
  assert.equal(run('select-draft',[exhausted],{Configuration:config}).length,0);
  const retry={...row,body_markdown:'A completed short response',character_count:4100,error:'Body length check failed',topic_map_json:JSON.stringify({automaticWritingAttempts:1})};
  const next=run('select-draft',[retry],{Configuration:config})[0].json;
  assert.equal(JSON.parse(next.topic_map_json).automaticWritingAttempts,2);
  assert.equal(JSON.parse(next.brief).correction.previousMarkdown,retry.body_markdown);
});

test('batch router excludes unrelated rows and never retries an uncertain charge',()=>{
  const uncertain={...row,id:4,article_id:'real-article',status:'needs_review',error:'timeout',openai_response_id:'',reserved_usd:.08};
  const action=run('batch-router',[uncertain,{...row,id:80,article_id:'unrelated'}])[0].json;
  assert.equal(action.action,'finished');
  const confirmed={...uncertain,reserved_usd:0,openai_response_id:'confirmed-response',error:'Body length check failed'};
  assert.equal(run('batch-router',[confirmed])[0].json.action,'repair');
  const exhausted={...confirmed,topic_map_json:JSON.stringify({automaticWritingAttempts:2})};
  assert.equal(run('batch-router',[exhausted])[0].json.action,'finished');
});

test('the requested example is routed without including unrelated rows after the original batch',()=>{
 const example={...row,id:35,article_id:'windows-screenshots-20261016',intent_key:'windows-screenshots',keyword:'윈도우 화면 캡처'};
 const action=run('batch-router',[example,{...example,id:36,article_id:'not-requested'}])[0].json;
 assert.equal(action.article_id,example.article_id);assert.equal(action.action,'generate');assert.equal(action.target,32);
 const next={...example,id:36,article_id:'gmail-schedule-send-20261016',intent_key:'gmail-schedule-send',keyword:'지메일 예약 발송'};
 assert.equal(run('batch-router',[{...example,status:'published'},next])[0].json.article_id,next.article_id);
 const uncertain={...example,status:'needs_review',error:'timeout',reserved_usd:.12};
 assert.equal(run('batch-router',[uncertain])[0].json.action,'finished');
});

test('corrections beyond the original row range require an explicit target and keep the retry cap',()=>{
 const short={...row,id:35,article_id:'windows-screenshots-20261016',status:'needs_review',error:'Body length check failed',openai_response_id:'confirmed',reserved_usd:0,body_markdown:'설명이 있는 본문입니다. '.repeat(200),character_count:2800,topic_map_json:'{}'};
 const scoped={...config,batch_mode:true,target_article_id:short.article_id};
 assert.equal(run('select-draft',[short],{Configuration:scoped})[0].json.completionMode,true);
 assert.equal(run('select-draft',[short],{Configuration:{...scoped,target_article_id:''}}).length,0);
 assert.equal(run('select-draft',[{...short,topic_map_json:JSON.stringify({completionAttempts:2})}],{Configuration:scoped}).length,0);
});

test('category input separates queued scopes from completed same-category and cross-category articles',()=>{
 const current={...row,article_id:'new-topic',category:'IT·디지털'};
 const existing={...row,id:2,article_id:'actual',intent_key:'actual-intent',keyword:'다른 질문',category:'문서 작업',status:'published',title:'실제 발행한 다른 질문에 대한 글',character_count:6000};
 const queued={...row,id:3,article_id:'queued',intent_key:'queued-intent',keyword:'대기 질문',category:'IT·디지털'};
 const navigation_sections_json=JSON.stringify([{label:'IT·디지털',articleCategories:['문서 작업','IT·디지털']}]);
 const brief=JSON.parse(run('select-draft',[current,existing,queued],{Configuration:{...config,navigation_sections_json}})[0].json.brief);
 assert.equal(brief.categoryTopicMap.existingTopicIds[0],'actual');assert.equal(brief.categoryTopicMap.plannedTopics[0].articleId,'queued');assert.equal(brief.categoryTopicMap.plannedTopics[0].status,'planned');
});

test('stock selection keeps accepted images and uses only real licensed candidate metadata',()=>{
 const accepted=Array.from({length:4},(_,i)=>({url:'https://fal.media/accepted-'+i+'.png',alt:'검토한 기존 장면 '+i,generated:true}));
 const candidate={id:'actual-photo-id',url:'https://live.staticflickr.com/123/photo_b.jpg',title:'Laundry dryer',creator:'Actual photographer',pageUrl:'https://www.flickr.com/photos/author/123',license:'by',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',provider:'flickr'};
 const prepared={...row,image_prompt:JSON.stringify([1,2,3,4,5]),status:'text_ready',images_json:JSON.stringify(accepted),body_markdown:'## 필터 확인\n\n본문',candidates:[candidate],photoQuery:'clothes dryer',actual_usd:.1,reserved_usd:.003,topic_map_json:JSON.stringify({stockSearch:{checkedAt:'2026-10-15T08:00:00.000Z'}})};
 const response={id:'actual-response',model:'gpt-5.4-mini-2026-03-17',status:'completed',usage:{input_tokens:100,output_tokens:50},output:[{content:[{type:'output_text',text:JSON.stringify({selected:[{index:0,alt:'세탁실에 놓인 의류 건조기',caption:'건조기 관리를 설명하는 자료 사진입니다.',sectionHeading:'필터 확인'}]})}]}]};
 const out=run('merge-photo-selection',[response],{'Filter Photo Candidates':prepared})[0].json;
 const images=JSON.parse(out.images_json);
 assert.equal(out.status,'needs_review');assert.equal(images.length,5);assert.equal(images[0].url,accepted[0].url);assert.equal(images[4].generated,false);assert.equal(images[4].stock.creator,candidate.creator);assert.equal(images[4].sourceUrl,candidate.pageUrl);assert.equal(out.reserved_usd,0);
 const unknown=run('merge-photo-selection',[{error:'timeout'}],{'Filter Photo Candidates':prepared})[0].json;
 assert.equal(unknown.status,'stock_uncertain');assert.equal(unknown.reserved_usd,.033);assert.equal(JSON.parse(unknown.images_json).length,4);
});

test('image-only repair preserves text and keeps the rejected image prompt in its replacement slot',()=>{
 const draft={...row,id:21,article_id:'actual-article',status:'needs_review',revision:3,reserved_usd:0,character_count:5100,body_markdown:'검토한 기존 본문',error:'Editorial review: ["이미지 2: 읽을 수 있는 가짜 글자가 있습니다."]',images_json:JSON.stringify(Array.from({length:5},(_,i)=>({url:'https://fal.media/original-'+i+'.png',generated:true}))),image_prompt:JSON.stringify(['scene 1','replacement scene 2','scene 3','scene 4','scene 5'])};
 const out=run('prepare-existing-draft',[draft],{'Batch Input':{article_id:draft.article_id,action:'repair_images'}})[0].json;
 assert.equal(out.body_markdown,draft.body_markdown);assert.equal(out.status,'text_ready');assert.equal(JSON.parse(out.images_json).length,4);assert.equal(JSON.parse(out.image_prompt)[4],'replacement scene 2');assert.equal(out.approved_revision,0);
 const combined=run('prepare-existing-draft',[{...draft,error:'Editorial review: ["이미지 1, 3, 4~5에 읽을 수 있는 가짜 글자가 있습니다."]'}],{'Batch Input':{article_id:draft.article_id,action:'repair_images'}})[0].json;
 assert.deepEqual(Array.from(JSON.parse(combined.topic_map_json).replacedImageIndexes),[0,2,3,4]);assert.equal(JSON.parse(combined.images_json).length,1);
});

test('factual review issues route to text patches and only the specified paragraph changes',()=>{
 const markdown='## 적용 환경\n\n잘못된 플랫폼 설명입니다.\n\n'+Array.from({length:50},(_,i)=>`${i} 확인한 조건과 절차를 설명하는 기존 문단입니다. `.repeat(4)).join('\n\n')+'\n\n## 실행 순서\n\n기존 절차입니다.\n\n## 결과 확인\n\n[첫 근거](https://example.com/1) [둘째 근거](https://example.com/2)';
 const previous={...row,id:28,article_id:'actual-fact-correction',status:'needs_review',error:'Editorial review: ["플랫폼 설명이 근거와 다릅니다."]',openai_response_id:'confirmed',reserved_usd:0,character_count:6000,body_markdown:markdown,title:'근거에 따라 적용 조건을 구분하는 원고입니다',description:'기존 원고에서 적용 환경에 맞지 않는 설명만 수정합니다.',topic_map_json:JSON.stringify({automaticWritingAttempts:2,repairFeedback:'과거 이미지 오류'}),image_prompt:JSON.stringify(Array.from({length:5},(_,i)=>'Existing distinct photographic scene '+i+' without text.')),images_json:JSON.stringify(Array.from({length:5},(_,i)=>({url:'https://fal.media/existing-'+i+'.png',generated:true})))};
 const route=run('identify-repair-scope',[{...previous,action:'repair_images'}])[0].json;
 assert.equal(route.imageOnlyRepair,false);
 const selected=run('select-draft',[previous],{Configuration:{...config,batch_mode:true}})[0].json;
 assert.equal(selected.factCorrectionMode,true);assert.equal(JSON.parse(selected.brief).correction.feedback,previous.error);
 const response={id:'factual-response',model:'gpt-5.4-mini',status:'completed',usage:{input_tokens:100,output_tokens:100},output:[{content:[{type:'output_text',text:{canWrite:true,replacements:[{paragraphIndex:1,replacementMarkdown:'근거에서 확인한 플랫폼에서만 지원하는 기능입니다.'}],photoSearchQuery:'physical objects'}}]}]};
 const out=run('parse-draft',[response],{'Select Draft':selected,Configuration:{input_usd_per_million:.75,cached_input_usd_per_million:.075,output_usd_per_million:4.5}})[0].json;
 assert.equal(out.status,'needs_review',out.error);assert.equal(out.error,'');assert.equal(out.images_json,previous.images_json);assert.ok(out.body_markdown.includes('기존 절차입니다.'));assert.ok(!out.body_markdown.includes('잘못된 플랫폼 설명입니다.'));
});
