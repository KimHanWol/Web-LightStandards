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

