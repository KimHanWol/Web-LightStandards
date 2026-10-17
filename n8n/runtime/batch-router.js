const chooseNextAction=()=>{
const rows=$input.all().map(i=>i.json);
// Explicitly requested additions join the completed batch; unrelated rows stay excluded.
const additionalArticleIds=['windows-screenshots-20261016','gmail-schedule-send-20261016'];
const newBatchId='additional-70-20261016';
const mapOf=r=>JSON.parse(r.topic_map_json||'{}');
const newBatch=rows.some(r=>mapOf(r).batchId===newBatchId);
const targetCount=newBatch?70:30+additionalArticleIds.length;
const targets=rows.filter(r=>(newBatch?mapOf(r).batchId===newBatchId:((Number(r.id)>=4&&Number(r.id)<=33)||additionalArticleIds.includes(r.article_id)))&&!r.article_id?.startsWith('test-'));
const completed=targets.filter(r=>r.status==='published').length;
const stageOnly=false;
const base={batch:newBatch?newBatchId:'additional-30-20261015',completed,target:targetCount,requestedTotal:targetCount+(newBatch?34:2)};
// Older in-flight coordinators finish at a read-only boundary before a paced restart.
const runnerInput=$('Batch Input').first().json||{};
if(runnerInput.checkpoint_at&&runnerInput.runner_version!=='paced-v2')return [{json:{...base,action:'finished',complete:false,reason:'Coordinator pacing upgrade: safe handoff before another paid stage'}}];
const month=$now.setZone('Asia/Seoul').toFormat('yyyy-MM');
const today=$now.setZone('Asia/Seoul').toFormat('yyyy-MM-dd');
const used=rows.filter(r=>r.budget_month===month).reduce((s,r)=>s+Number(r.actual_usd||0)+Number(r.reserved_usd||0),0);
if(newBatch&&month!=='2026-10')return [{json:{...base,action:'finished',reason:'This batch has no automatic authorization for another month',used}}];
const imagesOf=r=>JSON.parse(r.images_json||'[]');
const targetOf=r=>Math.min(5,Math.max(3,JSON.parse(r.image_prompt||'[]').length));
const imageOnly=r=>{try{const review=mapOf(r).reviewIssues;if(Number(review?.revision)===Number(r.revision))return review.type==='images';const issues=JSON.parse(r.error.slice('Editorial review: '.length));return issues.length>0&&issues.every(s=>/^(?:이미지\s*\d+|\d+번\s*이미지|\d+장\s*중)/.test(s));}catch{return false;}};
if($runIndex>2400)throw new Error('Batch polling limit reached; inspect state before continuing');
const publishing=targets.find(r=>['approved','publishing'].includes(r.status));
if(!stageOnly&&publishing)return [{json:{...base,...publishing,action:'publish',workflowId:'yihoqk3fpBOC8P04'}}];
// A real paid request (4465) and completed image receipt (4467) confirmed recovery.
const recovered=targets.find(r=>r.id===73&&r.article_id==='chrome-guide-95472-20261016'&&r.status==='needs_review'&&Number(r.revision)===4&&imagesOf(r).length===3&&!r.error&&mapOf(r).providerUnavailable?.receiptExecutionId==='4449');
if(recovered){const map=mapOf(recovered);delete map.providerUnavailable;return [{json:{...base,action:'repair',id:recovered.id,article_id:recovered.article_id,status:'needs_review',previous_status:'needs_review',reserved_usd:Number(recovered.reserved_usd||0),error:'',topic_map_json:JSON.stringify({...map,providerRestored:{requestExecutionId:'4465',resultExecutionId:'4467',checkedAt:'2026-10-17',status:'COMPLETED'}})}}];}
const salvage=targets.find(r=>r.id===73&&r.article_id==='chrome-guide-95472-20261016'&&r.status==='image_submitting'&&Number(r.revision)===2&&imagesOf(r).length===3&&targetOf(r)===5&&r.fal_request_id==='01a14884-1a28-75b1-b0f6-845fc34fc609'&&!r.error);
if(salvage)return [{json:{...base,...salvage,action:'apply_image_policy',workflowId:'HUqCE3BE3JSNPhI3'}}];
// Only audited no-op executions may carry a failed visual review forward.
const visualRecoveryRegistry=[{"id":76,"articleId":"docs-guide-143346-20261016","revision":3,"executionId":"4512","bodySignature":"4664:7fac2244","imagesSignature":"454:f96305ef","expectedError":"Expected specific factual corrections","originalReviewError":"Editorial review: [\"이미지 3: 개념 이미지인데 인쇄물에 읽을 수 없는 가짜 본문·제목처럼 보이는 문자 장면이 있어 실제 문서 예시로 오해될 수 있습니다.\"]","reviewResponseId":"resp_0b6c9db871f44994016ad3238049e887d2a8f3b5be52076580","reviewRevision":2},{"id":78,"articleId":"docs-guide-10296604-20261016","revision":3,"executionId":"4543","bodySignature":"4166:c20d0bfe","imagesSignature":"472:bf88ce1e","expectedError":"Expected specific factual corrections","originalReviewError":"Editorial review: [\"이미지 1: 자·종이 위에 ‘PAGE’와 숫자가 또렷하게 보여 개념 이미지로 보기 어려운 글자 소품이 있습니다.\",\"이미지 2: 책 펼친 장면에 ‘Page1 page’, ‘Landscape’ 등 읽을 수 있는 가짜 글자가 많아 실제 문서 예시처럼 오해될 수 있습니다.\"]","reviewResponseId":"resp_0b8cc8bddb7ea4fb016ad3281161d087d2aa68fe7a625283d0","reviewRevision":2},{"id":79,"articleId":"chrome-guide-95617-20261016","revision":2,"executionId":"4557","bodySignature":"4501:a17ef00c","imagesSignature":"430:44526abe","expectedError":"Expected specific factual corrections","originalReviewError":"Editorial review: [\"이미지 2: 브라우저 화면과 페이지의 읽을 수 있는 가짜 문구(‘Securati’)가 실제 Chrome 보안 확인 화면처럼 보일 수 있습니다.\",\"이미지 2: 검색창·주소창·자물쇠 장면이 다른 두 이미지와 매우 비슷해 구도 반복으로 보입니다.\"]","reviewResponseId":"resp_09330b165d0aa19e016ad329f434ec87d29254b036dbff5d65","reviewRevision":1},{"id":80,"articleId":"docs-guide-11526892-20261016","revision":2,"executionId":"4570","bodySignature":"4143:651e4ffc","imagesSignature":"445:3d8916b4","expectedError":"Expected specific factual corrections","originalReviewError":"Editorial review: [\"이미지 1: 책 페이지에 읽을 수 없는 듯 보이지만 문장형 가짜 글자가 들어가 있어 실제 문서/취재 사진처럼 오해될 수 있습니다.\",\"이미지 2: 펼친 책 안쪽에 문장처럼 보이는 가짜 글자가 반복되어 개념 이미지보다 실제 자료 화면처럼 보일 수 있습니다.\",\"이미지 3: 종이 위 ‘SECTION BREAKS’와 주변의 가짜 인쇄문자가 또렷해 기능 화면·실제 안내문처럼 오해될 수 있습니다.\"]","reviewResponseId":"resp_06690e735a574624016ad32bd2fbb087d2ae9cf2f7960bae82","reviewRevision":1},{"id":82,"articleId":"docs-guide-13820512-20261016","revision":3,"executionId":"4601","bodySignature":"4388:d7a97915","imagesSignature":"493:dced8396","expectedError":"Expected specific factual corrections","originalReviewError":"Editorial review: [\"이미지 1: 개념 이미지인데 종이 위 제목·본문이 읽히는 가짜 글자처럼 보여 실제 문서 화면으로 오해될 수 있습니다.\",\"이미지 2: 책장 옆 숫자가 보여 줄 번호 설명과는 연결되지만, 개념 이미지에서 읽히는 숫자 요소가 포함돼 있습니다.\",\"이미지 3: 문서 제목과 본문이 판독되는 가짜 글자 장면이라 실제 출력물·시험 결과 사진처럼 오해할 수 있습니다.\"]","reviewResponseId":"resp_02b2af0b729becc9016ad3301c893887d2b7b99d9cd4dba404","reviewRevision":2},{"id":83,"articleId":"chrome-guide-11032183-20261016","revision":3,"executionId":"4619","bodySignature":"4604:c10a17a8","imagesSignature":"469:484ad33d","expectedError":"검수에서 지적된 문제는 이미지의 가짜 글자이지만, 이번 단계에서는 이미지 오류를 수정하지 않습니다. 원고 본문에서 근거와 어긋나는 문단은 확인되지 않았습니다.","originalReviewError":"Editorial review: [\"이미지 2: 하단 소품에 읽을 수 있는 가짜 글자(‘Theme?’, ‘Footer’)가 있어 개념 이미지 기준에 맞지 않습니다.\"]","reviewResponseId":"resp_063a120594bae17c016ad33246fb4487d2baeb82b4ef8156f9","reviewRevision":2},{"id":84,"articleId":"docs-guide-2839588-20261016","revision":2,"executionId":"4632","bodySignature":"7802:77827fb5","imagesSignature":"466:85c4a91","expectedError":"Expected specific factual corrections","originalReviewError":"Editorial review: [\"이미지 3: 보드 위 카드에 ‘SHARE; O-MAL’, ‘INVITATION’, ‘WEB PAGE’처럼 읽히는 가짜 글자가 있어 개념 이미지로 부적절합니다.\"]","reviewResponseId":"resp_0280e3194ef7fa65016ad332e8ef5087d2a2f0c44446bffcab","reviewRevision":1}];
const artifactSignature=s=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return s.length+':'+(h>>>0).toString(16)};
const recovery=visualRecoveryRegistry.map(a=>({audit:a,row:targets.find(r=>r.id===a.id&&r.article_id===a.articleId&&r.status==='needs_review'&&Number(r.revision)===a.revision&&r.error===a.expectedError&&Number(r.reserved_usd||0)===0&&artifactSignature(String(r.body_markdown||''))===a.bodySignature&&artifactSignature(String(r.images_json||'[]'))===a.imagesSignature&&mapOf(r).reviewIssues?.responseId===a.reviewResponseId&&!mapOf(r).imageMisrouteRecovery)})).find(x=>x.row);
if(recovery){const {row:r,audit:a}=recovery;return [{json:{...base,action:'repair',id:r.id,article_id:r.article_id,status:'needs_review',previous_status:'needs_review',reserved_usd:0,error:a.originalReviewError,topic_map_json:JSON.stringify({...mapOf(r),reviewIssues:{...mapOf(r).reviewIssues,revision:Number(r.revision)},imageMisrouteRecovery:{executionId:a.executionId,originalReviewRevision:a.reviewRevision,carriedToRevision:Number(r.revision),bodySignature:a.bodySignature,imagesSignature:a.imagesSignature,unchangedTextAndImages:true}})}}];}
// One-time recovery of the inspected HTTP 403 decline; the user confirmed funding.
const funded=targets.find(r=>r.article_id==='chrome-guide-95472-20261016'&&r.status==='image_uncertain'&&Number(r.revision)===2&&imagesOf(r).length===1&&!r.fal_request_id&&!mapOf(r).providerRecovery);
if(funded)return [{json:{...base,action:'repair',id:funded.id,article_id:funded.article_id,status:'text_ready',previous_status:'image_uncertain',error:'',reserved_usd:Number(funded.reserved_usd||0),topic_map_json:JSON.stringify({...mapOf(funded),providerRecovery:{receiptExecutionId:'4340',httpStatus:403,reason:'Exhausted balance',requestAccepted:false,userFundingConfirmedAt:'2026-10-17'}})}}];
const blocked=targets.find(r=>['image_uncertain','provider_blocked'].includes(r.status));
if(blocked)return [{json:{...base,action:'finished',reason:blocked.status==='provider_blocked'?'Image provider unavailable; payment or account action required':'Image request requires reconciliation; no further paid stages will run',used,pending:[{id:blocked.article_id,status:blocked.status,error:blocked.error}]}}];
const image=targets.find(r=>r.status==='image_pending');
if(image)return [{json:{...base,...image,action:'images',workflowId:'FeZGGPZKq5IFwDJ9'}}];
if(targets.some(r=>['generation_started','image_submitting','review_started','stock_selecting'].includes(r.status)))return [{json:{...base,action:'wait'}}];
const review=targets.find(r=>r.status==='needs_review'&&!r.error&&Number(r.character_count)>=3500&&imagesOf(r).length>=3&&imagesOf(r).length<=targetOf(r));
if(review&&used+.03>7)return [{json:{...base,action:'finished',reason:'Monthly budget reached before review',used}}];
if(review)return [{json:{...base,...review,action:'review',workflowId:'FQg1yF0O4shWkDbQ',approved_by:'Automated evidence and image review; user-authorized publication'}}];
if(targets.some(r=>mapOf(r).providerUnavailable))return [{json:{...base,action:'finished',reason:'Image API declined despite funded dashboard; reconcile account before new paid generation',used}}];
if(used+.12>7)return [{json:{...base,action:'finished',reason:'Monthly budget reached',used}}];
const resumeImages=targets.find(r=>r.status==='text_ready'&&!r.error&&Number(r.character_count)>=3500&&imagesOf(r).length<targetOf(r));
if(resumeImages)return [{json:{...base,...resumeImages,action:'resume_images',workflowId:'HUqCE3BE3JSNPhI3'}}];
if(rows.filter(r=>r.generation_day===today).length>=40)return [{json:{...base,action:'finished',reason:'Daily generation limit reached; no automatic next-day restart',used}}];
const factRepair=targets.find(r=>r.status==='needs_review'&&r.openai_response_id&&String(r.error||'').startsWith('Editorial review: ')&&Number(r.character_count)>=3500&&Number(r.reserved_usd||0)===0&&Number(mapOf(r).factCorrectionAttempts||0)<2&&!imageOnly(r));
if(factRepair)return [{json:{...base,...factRepair,action:'generate',workflowId:'HUqCE3BE3JSNPhI3'}}];
const linkRepair=targets.find(r=>r.status==='needs_review'&&['Sources missing or unexpected links','Expected specific factual corrections'].includes(r.error)&&new Set([...String(r.body_markdown||'').matchAll(/\]\((https?:\/\/[^\s)]+)\)/g)].map(m=>m[1])).size<2&&r.openai_response_id&&Number(r.character_count)>=3500&&Number(r.reserved_usd||0)===0&&Number(mapOf(r).factCorrectionAttempts||0)<2);
if(linkRepair)return [{json:{...base,...linkRepair,action:'generate',workflowId:'HUqCE3BE3JSNPhI3'}}];
const imageRepair=targets.find(r=>r.status==='needs_review'&&String(r.error||'').startsWith('Editorial review: ')&&Number(r.character_count)>=3500&&Number(r.reserved_usd||0)===0&&Number(mapOf(r).imageRepairAttempts||0)<2&&imageOnly(r));
if(imageRepair)return [{json:{...base,...imageRepair,action:'repair_images',workflowId:'HUqCE3BE3JSNPhI3'}}];
const completion=targets.find(r=>r.status==='needs_review'&&r.error&&r.openai_response_id&&Number(r.reserved_usd||0)===0&&String(r.body_markdown||'').length>=2000&&Number(r.character_count)<3500&&Number(mapOf(r).completionAttempts||0)<2);
if(completion)return [{json:{...base,...completion,action:'generate',workflowId:'HUqCE3BE3JSNPhI3'}}];
const ready=targets.find(r=>r.status==='ready'&&Number(mapOf(r).automaticWritingAttempts||0)<2);
if(ready)return [{json:{...base,...ready,action:'generate',workflowId:'HUqCE3BE3JSNPhI3'}}];
const repair=targets.find(r=>r.status==='needs_review'&&r.error&&r.openai_response_id&&Number(r.reserved_usd||0)===0&&String(r.body_markdown||'').length<2000&&Number(mapOf(r).automaticWritingAttempts||0)<2);
if(repair)return [{json:{...base,...repair,action:'repair',status:'ready',error:'',topic_map_json:JSON.stringify({...mapOf(repair),repairFeedback:repair.error})}}];
const staged=targets.filter(r=>r.status==='approved').length;
return [{json:{...base,staged,complete:completed===targetCount,action:'finished',reason:completed===targetCount?'All requested articles published':stageOnly&&completed+staged===targetCount?'All requested snapshots approved; awaiting batch publication':'No safely executable rows; inspect failed article checks',pending:targets.filter(r=>r.status!=='published').map(r=>({id:r.article_id,status:r.status,error:r.error}))}}];

};
// Only the selected identifiers cross the sub-workflow boundary.
const keep=['batch','completed','target','requestedTotal','action','workflowId','article_id','revision','approved_by','scheduled_at','complete','staged','reason','used','pending'];
return chooseNextAction().map(({json})=>({json:Object.fromEntries([...keep,...(json.action==='repair'?['id','status','previous_status','error','topic_map_json','reserved_usd']:[])].filter(key=>json[key]!==undefined).map(key=>[key,json[key]]))}));

