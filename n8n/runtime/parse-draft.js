const row=$('Select Draft').first().json;
const response=$input.first().json;
const result={...row,status:'needs_review',error:'',openai_response_id:response.id||''};
const input=Number(response.usage?.input_tokens),output=Number(response.usage?.output_tokens);
if(Number.isFinite(input)&&Number.isFinite(output)){
  const c=$('Configuration').first().json;
  const cached=Math.min(input,Math.max(0,Number(response.usage?.input_tokens_details?.cached_tokens||0)));
  const expectedModel=row.billing_model||c.text_model||'gpt-5.4-mini';
  const knownModel=String(response.model||'')===expectedModel||String(response.model||'').startsWith(expectedModel+'-');
  if(!knownModel)throw new Error('Unexpected model pricing; preserve reservation and inspect usage');
  const rates={input:row.billing_rates?.input??c.input_usd_per_million,cached:row.billing_rates?.cached??c.cached_input_usd_per_million,output:row.billing_rates?.output??c.output_usd_per_million,cacheWriteMultiplier:row.billing_rates?.cacheWriteMultiplier??1};
  const cacheWrites=Math.min(input-cached,Math.max(0,Number(response.usage?.input_tokens_details?.cache_write_tokens||0)));
  const costUsd=((input-cached-cacheWrites)*rates.input+cacheWrites*rates.input*(rates.cacheWriteMultiplier||1)+cached*rates.cached+output*rates.output)/1000000;
  result.actual_usd=Number(row.actual_usd||0)+costUsd;
  result.reserved_usd=0;
  const ledger=JSON.parse(row.topic_map_json||'{}');result.topic_map_json=JSON.stringify({...ledger,writingReceipts:[...(ledger.writingReceipts||[]),{revision:Number(row.revision),model:response.model,responseId:response.id,inputTokens:input,cachedTokens:cached,cacheWriteTokens:cacheWrites,outputTokens:output,costUsd}]});
}
try {
  if(response.error||response.status!=='completed') throw new Error('OpenAI result incomplete; inspect execution before retry');
  const chunks=response.output.flatMap(o=>o.content||[]).filter(c=>c.type==='output_text').map(c=>c.text);
  // n8n may parse JSON-format output_text into an object; the raw API uses strings.
  const draft=chunks.length===1&&chunks[0]!==null&&typeof chunks[0]==='object'&&!Array.isArray(chunks[0])
    ? chunks[0]
    : JSON.parse(chunks.map(text=>typeof text==='string'?text:JSON.stringify(text)).join('').replace(/^```(?:json)?\s*|\s*```$/g,''));
  if(draft.canWrite!==true) throw new Error(draft.holdReason||'Insufficient source evidence');
  if(row.factCorrectionMode){
    if(!Array.isArray(draft.replacements)||draft.replacements.length<1||draft.replacements.length>5)throw new Error('Expected specific factual corrections');
    const paragraphs=row.body_markdown.split(/\n\s*\n/),changed=new Set();
    for(const patch of draft.replacements){
      if(!Number.isInteger(patch.paragraphIndex)||patch.paragraphIndex<0||patch.paragraphIndex>=paragraphs.length||changed.has(patch.paragraphIndex)||typeof patch.replacementMarkdown!=='string'||patch.replacementMarkdown.length>4000)throw new Error('Invalid factual correction position');
      changed.add(patch.paragraphIndex);paragraphs[patch.paragraphIndex]=patch.replacementMarkdown;
    }
    result.body_markdown=paragraphs.filter(p=>p.trim()).join('\n\n');
  }else if(row.completionMode){
    if(!Array.isArray(draft.additions)||draft.additions.length<1||draft.additions.length>8)throw new Error('Expected bounded article additions');
    let markdown=row.body_markdown,applied=0;
    for(const addition of draft.additions){
      if(typeof addition.afterHeading!=='string'||typeof addition.markdown!=='string'||addition.markdown.length<100||addition.markdown.length>12000)throw new Error('Invalid article addition');
      const headings=[...markdown.matchAll(/^#{2,3}\s+(.+)$/gm)];
      const heading=addition.afterHeading.replace(/^#{1,6}\s+/,'').trim();
      const at=headings.findIndex(h=>h[1]===heading);
      if(at<0)continue;
      const end=headings[at+1]?.index??markdown.length;
      markdown=markdown.slice(0,end).trimEnd()+'\n\n'+addition.markdown.trim()+'\n\n'+markdown.slice(end).trimStart();
      applied++;
    }
    if(!applied)throw new Error('No additions matched the original headings');
    const seen=new Set();
    result.body_markdown=markdown.split(/\n\s*\n/).filter(p=>{const key=p.trim();if(key.length<=100)return true;if(seen.has(key))return false;seen.add(key);return true;}).join('\n\n');
  }else{
    result.title=String(draft.title||'');result.description=String(draft.description||'');result.body_markdown=String(draft.markdown||'');result.image_prompt=Array.isArray(draft.imagePrompts)?JSON.stringify(draft.imagePrompts):String(draft.imagePrompt||'');
  }
  const md=result.body_markdown;
  result.character_count=[...md.replace(/!?\[([^\]]*)\]\([^)]*\)/g,'$1').replace(/https?:\/\/\S+/g,'').replace(/[#*`_|>~-]/g,'').replace(/\s+/g,' ').trim()].length;
  if(result.character_count<3500||md.length>60000) throw new Error('Body length check failed');
  if(result.title.length<8||result.title.length>120||result.description.length<20||result.description.length>300) throw new Error('Title or description length check failed');
  if(/<\/?[a-z!][^>]*>/i.test(md)||/!\[[^\]]*\]\(/.test(md)) throw new Error('Unreviewed HTML or images');
  if((md.match(/^## /gm)||[]).length<3) throw new Error('At least three useful sections required');
  const sourceUrls=new Set(JSON.parse(row.sources_json).map(s=>s.url));
  const links=[...md.matchAll(/\]\((https?:\/\/[^\s)]+)\)/g)].map(m=>m[1]);
  if(new Set(links).size<2||links.some(u=>!sourceUrls.has(u))) throw new Error('Sources missing or unexpected links');
  const paragraphs=md.split(/\n\s*\n/).map(p=>p.trim()).filter(p=>p.length>100);
  if(new Set(paragraphs).size!==paragraphs.length) throw new Error('Repeated paragraphs');
  const plans=JSON.parse(result.image_prompt);
  if((![3,4].includes(plans.length)&&!((row.completionMode||row.factCorrectionMode)&&plans.length===5))||!plans.every(p=>typeof p==='string'&&p.length>=20&&p.length<=1500))throw new Error('Three image briefs required; a fourth needs a distinct explanatory purpose');
  const topic=JSON.parse(result.topic_map_json||row.topic_map_json||'{}');
  result.topic_map_json=JSON.stringify({...topic,coverage:[...md.matchAll(/^##\s+(.+)$/gm)].map(m=>m[1]),photoSearchQuery:String(draft.photoSearchQuery||row.article_id.replace(/-\d{8}$/,'').replace(/-/g,' ')).trim().slice(0,150)});
  result.images_json=row.completionMode||row.factCorrectionMode?(row.images_json||'[]'):'[]';
  if(!Number.isFinite(input)||!Number.isFinite(output)) throw new Error('Usage could not be reconciled');
  const remaining=Math.max(0,plans.length-JSON.parse(result.images_json).length);
  result.status=remaining===0?'needs_review':'text_ready';result.reserved_usd=remaining*.003;
} catch(e) {result.error=String(e.message).slice(0,1000);}
return [{json:result}];

