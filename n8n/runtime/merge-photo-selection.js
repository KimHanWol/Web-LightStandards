const row=$('Filter Photo Candidates').first().json,response=$input.first().json;
const result={...row,reserved_usd:Number(row.reserved_usd||0)+.03,status:'stock_uncertain',error:''};
const input=Number(response.usage?.input_tokens),output=Number(response.usage?.output_tokens);
if(Number.isFinite(input)&&Number.isFinite(output)&&String(response.model||'').startsWith('gpt-5.4-mini')){
 const cached=Math.min(input,Number(response.usage?.input_tokens_details?.cached_tokens||0));
 result.actual_usd=Number(row.actual_usd||0)+((input-cached)*.75+cached*.075+output*4.5)/1e6;result.reserved_usd=Number(row.reserved_usd||0);
}
try{
 if(response.error||response.status!=='completed'||!Number.isFinite(input)||!Number.isFinite(output)||!String(response.model||'').startsWith('gpt-5.4-mini'))throw new Error('Photo selection outcome uncertain; do not resubmit');
 const chunks=response.output.flatMap(o=>o.content||[]).filter(c=>c.type==='output_text').map(c=>c.text);
 const data=chunks.length===1&&typeof chunks[0]==='object'?chunks[0]:JSON.parse(chunks.join(''));
 if(!Array.isArray(data.selected)||data.selected.length>5)throw new Error('Invalid photo selection');
 const existing=JSON.parse(row.images_json||'[]'),remaining=5-existing.length;
 const selected=[],seen=new Set(),headings=[...row.body_markdown.matchAll(/^##\s+(.+)$/gm)].map(m=>m[1]);
 const map=JSON.parse(row.topic_map_json||'{}');
 for(const pick of data.selected.slice(0,remaining)){
  if(!Number.isInteger(pick.index)||pick.index<0||pick.index>=row.candidates.length||seen.has(pick.index)||typeof pick.alt!=='string'||pick.alt.length<4||pick.alt.length>250||typeof pick.caption!=='string'||pick.caption.length<3||pick.caption.length>250)throw new Error('Photo selection must use actual candidate metadata');
  seen.add(pick.index);const c=row.candidates[pick.index];
  selected.push({url:c.url,alt:pick.alt,generated:false,sourceUrl:c.pageUrl,caption:pick.caption,...(headings.includes(pick.sectionHeading)?{sectionHeading:pick.sectionHeading}:{}),stock:{provider:c.provider,assetId:c.id,title:c.title,creator:c.creator,pageUrl:c.pageUrl,license:c.license,licenseUrl:c.licenseUrl,checkedAt:map.stockSearch.checkedAt,query:row.photoQuery}});
 }
 const combined=[...existing,...selected];
 result.images_json=JSON.stringify(combined);result.status=combined.length===5?'needs_review':'text_ready';result.reserved_usd=(5-combined.length)*.003;
 result.topic_map_json=JSON.stringify({...map,stockSearch:{...map.stockSearch,selected:selected.length,responseId:response.id,outcome:'selected'}});
}catch(e){result.error=String(e.message).slice(0,1000);}
return [{json:result}];

