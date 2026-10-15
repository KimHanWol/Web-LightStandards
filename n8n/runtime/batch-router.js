const rows=$input.all().map(i=>i.json);
const targets=rows.filter(r=>Number(r.id)>=4&&Number(r.id)<=33&&!r.article_id?.startsWith('test-'));
const completed=targets.filter(r=>r.status==='published').length;
const base={batch:'additional-30-20261015',completed,target:30};
if($runIndex>2400)throw new Error('Batch polling limit reached; inspect state before continuing');
const publishing=targets.find(r=>['approved','publishing'].includes(r.status));
if(publishing)return [{json:{...base,...publishing,action:'publish',workflowId:'yihoqk3fpBOC8P04'}}];
const image=targets.find(r=>r.status==='image_pending');
if(image)return [{json:{...base,...image,action:'images',workflowId:'FeZGGPZKq5IFwDJ9'}}];
if(targets.some(r=>['generation_started','image_submitting','review_started'].includes(r.status)))return [{json:{...base,action:'wait'}}];
const review=targets.find(r=>r.status==='needs_review'&&!r.error&&Number(r.character_count)>=5000&&JSON.parse(r.images_json||'[]').length>=5);
if(review)return [{json:{...base,...review,action:'review',workflowId:'FQg1yF0O4shWkDbQ',approved_by:'Automated evidence and image review; user-authorized publication'}}];
const month=$now.setZone('Asia/Seoul').toFormat('yyyy-MM');
const used=rows.filter(r=>r.budget_month===month).reduce((s,r)=>s+Number(r.actual_usd||0)+Number(r.reserved_usd||0),0);
if(used+.12>7)return [{json:{...base,action:'finished',reason:'Monthly budget reached',used}}];
const unsentProofs=[{"id":13,"articleId":"dehumidifier-use-20261015","executionId":"2696","reserved":0.033},{"id":11,"articleId":"dryer-efficient-use-20261015","executionId":"2694","reserved":0.033}];
const unsent=targets.find(r=>unsentProofs.some(p=>p.id===r.id)&&r.status==='stock_uncertain'&&r.error==='Photo selection outcome uncertain; do not resubmit'&&Number(r.revision)===3);
if(unsent){const map=JSON.parse(unsent.topic_map_json||'{}'),proof=unsentProofs.find(p=>p.id===unsent.id);return [{json:{...base,...unsent,action:'repair',status:'text_ready',reserved_usd:Math.max(0,Number(unsent.reserved_usd)-.03),error:'',topic_map_json:JSON.stringify({...map,stockSetupRecovery:{executionId:proof.executionId,reason:'Expression syntax rejected locally before HTTP; no external request'}})}}];}
const resumeImages=targets.find(r=>r.status==='text_ready'&&!r.error&&Number(r.character_count)>=5000&&JSON.parse(r.images_json||'[]').length<5);
if(resumeImages)return [{json:{...base,...resumeImages,action:'resume_images',workflowId:'HUqCE3BE3JSNPhI3'}}];
const imageRepair=targets.find(r=>r.status==='needs_review'&&String(r.error||'').startsWith('Editorial review: ')&&Number(r.character_count)>=5000&&Number(r.reserved_usd||0)===0&&Number(JSON.parse(r.topic_map_json||'{}').imageRepairAttempts||0)<1);
if(imageRepair)return [{json:{...base,...imageRepair,action:'repair_images',workflowId:'HUqCE3BE3JSNPhI3'}}];
const ready=targets.find(r=>r.status==='ready'&&Number(JSON.parse(r.topic_map_json||'{}').automaticWritingAttempts||0)<2);
if(ready)return [{json:{...base,...ready,action:'generate',workflowId:'HUqCE3BE3JSNPhI3'}}];
const repair=targets.find(r=>r.status==='needs_review'&&r.error&&r.openai_response_id&&Number(r.reserved_usd||0)===0&&Number(JSON.parse(r.topic_map_json||'{}').automaticWritingAttempts||0)<2);
if(repair){const map=JSON.parse(repair.topic_map_json||'{}');return [{json:{...base,...repair,action:'repair',status:'ready',error:'',topic_map_json:JSON.stringify({...map,repairFeedback:repair.error})}}];}
return [{json:{...base,action:'finished',reason:completed===30?'All requested articles published':'No safely executable rows; inspect failed article checks',pending:targets.filter(r=>r.status!=='published').map(r=>({id:r.article_id,status:r.status,error:r.error}))}}];

