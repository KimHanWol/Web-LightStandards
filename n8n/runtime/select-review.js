const c=$('Configuration').first().json;
if(!c.article_id||!c.revision||!c.approved_by)return [];
const rows=$input.all().map(i=>i.json),row=rows.find(r=>r.article_id===c.article_id);
if(!row||row.article_id.startsWith('test-')||row.status!=='needs_review'||Number(row.revision)!==Number(c.revision)||row.error||Number(row.character_count)<3500)return [];
const images=JSON.parse(row.images_json||'[]'),sources=JSON.parse(row.sources_json||'[]');
if((images.length<3||images.length>Math.min(5,Math.max(3,JSON.parse(row.image_prompt||'[]').length)))||sources.length<2||!sources.every(s=>s.reviewed))return [];
const month=$now.setZone('Asia/Seoul').toFormat('yyyy-MM');
const used=rows.filter(r=>r.budget_month===month).reduce((s,r)=>s+Number(r.actual_usd||0)+Number(r.reserved_usd||0),0);
if(used+.03>7)return [];
const imageReviewSchema=JSON.stringify({"type":"object","additionalProperties":false,"required":["approved","issues","imageAlts","replacementPrompts","issueType"],"properties":{"approved":{"type":"boolean"},"issues":{"type":"array","maxItems":3,"items":{"type":"string","maxLength":180}},"imageAlts":{"type":"array","minItems":images.length,"maxItems":images.length,"items":{"type":"string","minLength":4,"maxLength":180}},"replacementPrompts":{"type":"array","maxItems":images.length,"items":{"type":"object","additionalProperties":false,"required":["index","prompt"],"properties":{"index":{"type":"integer","minimum":1,"maximum":images.length},"prompt":{"type":"string","minLength":50,"maxLength":700}}}},"issueType":{"type":"string","enum":["none","images","text","mixed"]}}});
const topics=rows.filter(r=>r.id!==row.id&&Number(r.character_count)>=3500&&r.title&&!r.article_id.startsWith('test-')).map(r=>{const m=JSON.parse(r.topic_map_json||'{}');return {articleId:r.article_id,title:r.title,coreQuestion:m.coreQuestion,scope:String(m.scope||'').slice(0,320),coverage:(m.coverage||[]).slice(0,6),aliases:(m.aliases||[]).slice(0,4)};});
return [{json:{...row,imageReviewSchema,reviewBrief:JSON.stringify({title:row.title,description:row.description,markdown:row.body_markdown,images:images.map((i,index)=>({index:index+1,kind:i.stock?'licensed_stock':i.generated?'illustration':'capture',caption:i.caption,sourceUrl:i.sourceUrl,stock:i.stock})),sources,topic:(()=>{const m=JSON.parse(row.topic_map_json||'{}');return {coreQuestion:m.coreQuestion,scope:m.scope,coverage:m.coverage,aliases:m.aliases};})(),existingTopics:topics}),reserved_usd:.03}}];


