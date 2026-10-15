const row=$('Select Draft').first().json;
const response=$input.first().json;
const result={...row,status:'needs_review',error:'',openai_response_id:response.id||''};
const input=Number(response.usage?.input_tokens),output=Number(response.usage?.output_tokens);
if(Number.isFinite(input)&&Number.isFinite(output)){
  const c=$('Configuration').first().json;
  const cached=Math.min(input,Math.max(0,Number(response.usage?.input_tokens_details?.cached_tokens||0)));
  const knownModel=String(response.model||'').startsWith('gpt-5.4-mini');
  if(!knownModel)throw new Error('Unexpected model pricing; preserve reservation and inspect usage');
  result.actual_usd=Number(row.actual_usd||0)+((input-cached)*c.input_usd_per_million+cached*c.cached_input_usd_per_million+output*c.output_usd_per_million)/1000000;
  result.reserved_usd=0;
}
try {
  if(response.error||response.status!=='completed') throw new Error('OpenAI result incomplete; inspect execution before retry');
  const chunks=response.output.flatMap(o=>o.content||[]).filter(c=>c.type==='output_text').map(c=>c.text);
  // n8n may parse JSON-format output_text into an object; the raw API uses strings.
  const draft=chunks.length===1&&chunks[0]!==null&&typeof chunks[0]==='object'&&!Array.isArray(chunks[0])
    ? chunks[0]
    : JSON.parse(chunks.map(text=>typeof text==='string'?text:JSON.stringify(text)).join('').replace(/^```(?:json)?\s*|\s*```$/g,''));
  if(draft.canWrite!==true) throw new Error(draft.holdReason||'Insufficient source evidence');
  result.title=String(draft.title||'');result.description=String(draft.description||'');result.body_markdown=String(draft.markdown||'');result.image_prompt=Array.isArray(draft.imagePrompts)?JSON.stringify(draft.imagePrompts):String(draft.imagePrompt||'');
  const md=result.body_markdown;
  result.character_count=[...md.replace(/!?\[([^\]]*)\]\([^)]*\)/g,'$1').replace(/https?:\/\/\S+/g,'').replace(/[#*`_|>~-]/g,'').replace(/\s+/g,' ').trim()].length;
  if(result.character_count<5000||md.length>60000) throw new Error('Body length check failed');
  if(result.title.length<8||result.title.length>120||result.description.length<20||result.description.length>300) throw new Error('Title or description length check failed');
  if(/<\/?[a-z!][^>]*>/i.test(md)||/!\[[^\]]*\]\(/.test(md)) throw new Error('Unreviewed HTML or images');
  if((md.match(/^## /gm)||[]).length<3) throw new Error('At least three useful sections required');
  const sourceUrls=new Set(JSON.parse(row.sources_json).map(s=>s.url));
  const links=[...md.matchAll(/\]\((https?:\/\/[^\s)]+)\)/g)].map(m=>m[1]);
  if(new Set(links).size<2||links.some(u=>!sourceUrls.has(u))) throw new Error('Sources missing or unexpected links');
  const paragraphs=md.split(/\n\s*\n/).map(p=>p.trim()).filter(p=>p.length>100);
  if(new Set(paragraphs).size!==paragraphs.length) throw new Error('Repeated paragraphs');
  const plans=JSON.parse(result.image_prompt);
  if(plans.length!==5||!plans.every(p=>typeof p==='string'&&p.length>=20&&p.length<=1500))throw new Error('Five distinct image briefs required');
  const topic=JSON.parse(row.topic_map_json||'{}');
  result.topic_map_json=JSON.stringify({...topic,coverage:[...md.matchAll(/^##\s+(.+)$/gm)].map(m=>m[1]),photoSearchQuery:String(draft.photoSearchQuery||row.article_id.replace(/-\d{8}$/,'').replace(/-/g,' ')).trim().slice(0,150)});
  result.images_json='[]';
  if(!Number.isFinite(input)||!Number.isFinite(output)) throw new Error('Usage could not be reconciled');
  result.status='text_ready';result.reserved_usd=0.015;
} catch(e) {result.error=String(e.message).slice(0,1000);}
return [{json:result}];

