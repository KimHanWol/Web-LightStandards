const c=$('Configuration').first().json;
if(!c.article_id||!c.revision||!c.approved_by)return [];
const rows=$input.all().map(i=>i.json),row=rows.find(r=>r.article_id===c.article_id);
if(!row||row.article_id.startsWith('test-')||row.status!=='needs_review'||Number(row.revision)!==Number(c.revision)||row.error||Number(row.character_count)<3500)return [];
const images=JSON.parse(row.images_json||'[]'),sources=JSON.parse(row.sources_json||'[]');
if(images.length!==5||sources.length<2||!sources.every(s=>s.reviewed))return [];
const month=$now.setZone('Asia/Seoul').toFormat('yyyy-MM');
const used=rows.filter(r=>r.budget_month===month).reduce((s,r)=>s+Number(r.actual_usd||0)+Number(r.reserved_usd||0),0);
if(used+.03>7)return [];
const topics=rows.filter(r=>r.id!==row.id&&Number(r.character_count)>=3500&&r.title&&!r.article_id.startsWith('test-')).map(r=>({articleId:r.article_id,title:r.title,...JSON.parse(r.topic_map_json||'{}')}));
return [{json:{...row,reviewBrief:JSON.stringify({title:row.title,description:row.description,markdown:row.body_markdown,images:images.map((i,index)=>({index:index+1,kind:i.stock?'licensed_stock':i.generated?'illustration':'capture',caption:i.caption,sourceUrl:i.sourceUrl,stock:i.stock})),sources,topic:JSON.parse(row.topic_map_json||'{}'),existingTopics:topics}),reserved_usd:.03}}];

