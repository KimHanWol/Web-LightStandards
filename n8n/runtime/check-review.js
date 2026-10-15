const row=$('Select Review').first().json,response=$input.first().json;
const result={...row,status:'needs_review',error:'',reserved_usd:.03};
const input=Number(response.usage?.input_tokens),output=Number(response.usage?.output_tokens);
if(Number.isFinite(input)&&Number.isFinite(output)&&String(response.model||'').startsWith('gpt-5.4-mini')){
 const cached=Math.min(input,Number(response.usage?.input_tokens_details?.cached_tokens||0));
 result.actual_usd=Number(row.actual_usd||0)+((input-cached)*.75+cached*.075+output*4.5)/1e6;result.reserved_usd=0;
}
try{
 if(response.error||response.status!=='completed'||result.reserved_usd)throw new Error('Review outcome uncertain; do not retry automatically');
 const chunks=response.output.flatMap(o=>o.content||[]).filter(c=>c.type==='output_text').map(c=>c.text);
 const review=chunks.length===1&&typeof chunks[0]==='object'?chunks[0]:JSON.parse(chunks.join(''));
 const reviewMap=JSON.parse(row.topic_map_json||'{}');
 const inferred=Array.isArray(review.issues)&&review.issues.every(s=>/^(?:이미지\s*\d+|\d+번\s*이미지|\d+장\s*중)/.test(s))?'images':'text';
 result.topic_map_json=JSON.stringify({...reviewMap,reviewIssues:{revision:Number(row.revision),responseId:response.id,type:review.issueType||(review.approved?'none':inferred)},imageReplacementPlan:{responseId:response.id,indexes:[]}});
 if(review.approved!==true&&Array.isArray(review.replacementPrompts)){
   const plans=JSON.parse(row.image_prompt||'[]'),replacements=review.replacementPrompts.filter(p=>Number.isInteger(p.index)&&p.index>=1&&p.index<=5&&typeof p.prompt==='string'&&p.prompt.length>=50&&p.prompt.length<=700);
   if(plans.length===5&&replacements.length){for(const p of replacements)plans[p.index-1]=p.prompt;result.image_prompt=JSON.stringify(plans);result.topic_map_json=JSON.stringify({...JSON.parse(result.topic_map_json||'{}'),imageReplacementPlan:{responseId:response.id,indexes:replacements.map(p=>p.index)}});}
 }
 if(review.approved!==true)throw new Error('Editorial review: '+JSON.stringify(review.issues||[]));
 if(!Array.isArray(review.imageAlts)||review.imageAlts.length!==5||review.imageAlts.some(a=>typeof a!=='string'||a.length<4||a.length>250))throw new Error('Review image descriptions missing');
 result.images_json=JSON.stringify(JSON.parse(row.images_json).map((image,index)=>({...image,alt:review.imageAlts[index],generated:image.generated!==false})));
 result.reviewPassed=true;
}catch(e){result.error=String(e.message).slice(0,1000);result.reviewPassed=false;}
return [{json:result}];
