const input=$('Batch Input').first().json;
const row=$input.all().map(i=>i.json).find(r=>r.article_id===input.article_id);
const target=row?Math.min(5,Math.max(3,JSON.parse(row.image_prompt||'[]').length)):3;
// Execution 4449 explicitly rejected the fourth request. Preserve all three paid results.
if(row&&input.action==='apply_image_policy'&&row.id===73&&row.article_id==='chrome-guide-95472-20261016'&&row.status==='image_submitting'&&Number(row.revision)===2&&row.fal_request_id==='01a14884-1a28-75b1-b0f6-845fc34fc609'&&JSON.parse(row.images_json||'[]').length===3&&target===5&&Number(row.character_count)>=3500&&!row.error){
 const map=JSON.parse(row.topic_map_json||'{}');
 return [{json:{...row,status:'needs_review',revision:3,image_prompt:JSON.stringify(JSON.parse(row.image_prompt).slice(0,3)),reserved_usd:0,approved_revision:0,approved_by:'',approved_at:'',publish_payload:'',topic_map_json:JSON.stringify({...map,imagePolicy:'3-default-4-max',providerUnavailable:{receiptExecutionId:'4449',httpStatus:403,requestAccepted:false,reason:'Exhausted balance; dashboard balance requires account reconciliation'}})}}];
}
if(row&&input.action==='resume_images'&&row.status==='text_ready'&&Number(row.character_count)>=3500&&JSON.parse(row.images_json||'[]').length<target&&!row.error)return [{json:row}];
if(!row||row.status!=='needs_review'||Number(row.reserved_usd||0)!==0||Number(row.character_count)<3500||!row.body_markdown||!String(row.error||'').startsWith('Editorial review: '))return [];
const issues=JSON.parse(row.error.slice('Editorial review: '.length));
const reviewMap=JSON.parse(row.topic_map_json||'{}');
const typedVisual=Number(reviewMap.reviewIssues?.revision)===Number(row.revision)&&reviewMap.reviewIssues.type==='images';
if(!Array.isArray(issues)||!issues.length||!typedVisual&&issues.some(s=>!(/^(?:이미지\s*\d+|\d+번\s*이미지|\d+장\s*중)/.test(s))))return [];
const reviewedIndexes=Number(reviewMap.reviewIssues?.revision)===Number(row.revision)&&reviewMap.reviewIssues?.type==='images'&&reviewMap.imageReplacementPlan?.responseId===reviewMap.reviewIssues?.responseId?reviewMap.imageReplacementPlan.indexes:[];
const textIndexes=issues.flatMap(s=>{const match=s.match(/^(?:이미지\s*|\d+장\s*중\s*)([\d\s,·와및~–-]+)/);const prefix=match?match[1]:s.match(/\d+/)?.[0]||'';const values=[];for(const part of prefix.split(/[,·와및]+/)){const range=part.trim().match(/^(\d+)\s*[~–-]\s*(\d+)$/);if(range){for(let n=Number(range[1]);n<=Number(range[2])&&n<=target;n++)values.push(n);}else values.push(...(part.match(/\d+/g)||[]).map(Number));}return values;});
const indexes=[...new Set([...reviewedIndexes,...textIndexes])].map(n=>n-1);
const images=JSON.parse(row.images_json||'[]');
if((images.length<3||images.length>target)||indexes.some(n=>!Number.isInteger(n)||n<0||n>=images.length))return [];
const map=JSON.parse(row.topic_map_json||'{}');
if(Number(map.imageRepairAttempts||0)>=2)return [];
const selected=images.filter((_,index)=>!indexes.includes(index));
const plans=JSON.parse(row.image_prompt),kept=images.map((_,i)=>i).filter(i=>!indexes.includes(i));
const image_prompt=JSON.stringify([...kept.map(i=>plans[i]),...indexes.map(i=>plans[i])]);
return [{json:{...row,status:'text_ready',revision:Number(row.revision)+1,images_json:JSON.stringify(selected),image_prompt,reserved_usd:(target-selected.length)*.003,error:'',approved_revision:0,approved_by:'',approved_at:'',publish_payload:'',topic_map_json:JSON.stringify({...map,imageRepairAttempts:Number(map.imageRepairAttempts||0)+1,photoSearchQuery:map.photoSearchQuery||row.article_id.replace(/-\d{8}$/,'').replace(/-/g,' '),replacedImageIndexes:indexes})}}];
