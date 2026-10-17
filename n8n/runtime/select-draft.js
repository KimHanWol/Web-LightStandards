const config = $('Configuration').first().json;
if (!config.paid_enabled) return [];
const rows = $input.all().map(i => i.json);
const today = $now.setZone('Asia/Seoul').toFormat('yyyy-MM-dd');
const month = today.slice(0,7);
const used = rows.filter(r=>r.budget_month===month).reduce((s,r)=>s+Number(r.actual_usd||0)+Number(r.reserved_usd||0),0);
if (used + config.reserve_usd > config.monthly_budget_usd) return [];
if (rows.filter(r=>r.generation_day===today).length >= config.daily_limit) return [];
if(rows.some(r=>['generation_started','image_submitting'].includes(r.status))) return [];
const canComplete=r=>String(r.body_markdown||'').length>=2000&&Number(r.character_count)<3500;
const citationIssues=r=>{const allowed=JSON.parse(r.sources_json||'[]').map(s=>s.url),cited=[...String(r.body_markdown||'').matchAll(/\]\((https?:\/\/[^\s)]+)\)/g)].map(m=>m[1]);return {citedSourceUrls:[...new Set(cited)],missingSourceUrls:allowed.filter(u=>!cited.includes(u)),unexpectedSourceUrls:cited.filter(u=>!allowed.includes(u)),hasError:new Set(cited).size<2||cited.some(u=>!allowed.includes(u))};};
const canFixFacts=r=>String(r.body_markdown||'').length>=2000&&Number(r.character_count)>=3500&&(String(r.error||'').startsWith('Editorial review: ')||['Sources missing or unexpected links','Expected specific factual corrections'].includes(r.error)&&citationIssues(r).hasError);
const canCorrect=r=>config.batch_mode&&((Number(r.id)>=4&&Number(r.id)<=33)||(!!config.target_article_id&&r.article_id===config.target_article_id))&&r.status==='needs_review'&&r.error&&r.openai_response_id&&Number(r.reserved_usd||0)===0&&(canComplete(r)||canFixFacts(r)||String(r.body_markdown||'').length<2000)&&(canComplete(r)?Number(JSON.parse(r.topic_map_json||'{}').completionAttempts||0)<2:canFixFacts(r)?Number(JSON.parse(r.topic_map_json||'{}').factCorrectionAttempts||0)<2:Number(JSON.parse(r.topic_map_json||'{}').automaticWritingAttempts||0)<2);
for (const row of rows.filter(r=>(!config.target_article_id||r.article_id===config.target_article_id)&&(canCorrect(r)||r.status==='ready')).sort((a,b)=>(canCorrect(a)?0:1)-(canCorrect(b)?0:1)||a.id-b.id)) {
  try {
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.article_id)||row.article_id.length>90||!row.intent_key||!row.keyword||!row.category) continue;
    if(rows.some(r=>r.id!==row.id&&(r.article_id===row.article_id||r.intent_key===row.intent_key)&&r.status!=='candidate'))continue;
    const normalize=v=>String(v||'').toLowerCase().replace(/[^a-z0-9가-힣]/g,'');
    const mapOf=r=>r.topic_map_json?JSON.parse(r.topic_map_json):{};
    const candidateMap=mapOf(row);
    const topicSummary=r=>{const m=mapOf(r);return {articleId:r.article_id,category:r.category,intentKey:r.intent_key,title:r.title,keyword:r.keyword,coreQuestion:String(m.coreQuestion||'').slice(0,180),scope:String(m.scope||'').slice(0,320),coverage:(m.coverage||[]).slice(0,6).map(v=>String(v).slice(0,70)),aliases:(m.aliases||[]).slice(0,4),status:r.status};};
    const completionMode=canComplete(row);
    const factCorrectionMode=canFixFacts(row);
    if(completionMode?Number(candidateMap.completionAttempts||0)>=2:factCorrectionMode?Number(candidateMap.factCorrectionAttempts||0)>=2:Number(candidateMap.automaticWritingAttempts||0)>=2)continue;
    const activeRows=rows.filter(r=>r.id!==row.id&&!r.article_id?.startsWith('test-')&&r.status!=='candidate');
    const aliases=r=>[r.keyword,...(mapOf(r).aliases||[]),mapOf(r).coreQuestion].filter(Boolean).map(normalize);
    if(activeRows.some(r=>r.article_id===row.article_id||r.intent_key===row.intent_key||aliases(r).some(alias=>aliases(row).includes(alias))))continue;
    const sources=JSON.parse(row.sources_json||'[]');
    if(sources.length<2||new Set(sources.map(s=>s.url)).size<2) continue;
    if(!sources.every(s=>s.title&&/^https:\/\//.test(s.url)&&s.reviewed===true&&s.checkedAt&&s.excerpt?.length>=300)) continue;
    // A queued topic is not an existing article. Keep queue collision checks above,
    // but give the writer only completed article scopes for semantic comparison.
    const existingTopics=activeRows.filter(r=>!['ready','candidate','generation_started'].includes(r.status)&&String(r.title||'').trim()&&Number(r.character_count)>=3500).map(topicSummary);
    const correction=row.body_markdown?{previousMarkdown:factCorrectionMode?undefined:String(row.body_markdown).slice(0,25000),visibleCharacters:Number(row.character_count||0),requiredAdditionalCharacters:Math.max(300,4000-Number(row.character_count||0)),citationCheck:factCorrectionMode&&citationIssues(row).hasError?citationIssues(row):undefined,feedback:completionMode?'actualHeadings 중 보완할 소제목을 선택해 아직 부족한 설명만 추가합니다. 기존 원고는 그대로 보존합니다.':factCorrectionMode?row.error:candidateMap.repairFeedback||row.error||'Complete and check the full article'}:candidateMap.repairFeedback;
    const sections=JSON.parse(config.navigation_sections_json||'[]');
    const categoryOf=r=>sections.find(s=>s.articleCategories.includes(r.category))?.label||r.category;
    const categoryLabel=categoryOf(row);
    const categoryTopicMap={category:categoryLabel,existingTopicIds:existingTopics.filter(r=>categoryOf(r)===categoryLabel).map(r=>r.articleId),plannedTopics:activeRows.filter(r=>r.status==='ready'&&categoryOf(r)===categoryLabel).map(r=>({...topicSummary(r),status:'planned'}))};
    const actualParagraphs=factCorrectionMode?String(row.body_markdown).split(/\n\s*\n/).map((text,index)=>({index,text})):undefined;
    const brief=JSON.stringify({keyword:row.keyword,category:row.category,sources,candidateTopic:{articleId:row.article_id,intentKey:row.intent_key,coreQuestion:candidateMap.coreQuestion,scope:candidateMap.scope,aliases:candidateMap.aliases,coverage:candidateMap.coverage,selectionBasis:candidateMap.selectionBasis,sourceReview:candidateMap.sourceReview},actualHeadings:[...String(row.body_markdown||'').matchAll(/^#{2,3}\s+(.+)$/gm)].map(m=>m[1]),actualParagraphs,categoryTopicMap:factCorrectionMode?undefined:categoryTopicMap,crossCategoryTopicIds:factCorrectionMode?undefined:existingTopics.filter(r=>categoryOf(r)!==categoryLabel).map(r=>r.articleId),existingTopics:factCorrectionMode?undefined:existingTopics,correction});
    if(brief.length>80000||sources.reduce((n,s)=>n+s.excerpt.length,0)<2000) continue;
    const topic_map_json=JSON.stringify({...candidateMap,...(completionMode?{completionAttempts:Number(candidateMap.completionAttempts||0)+1}:factCorrectionMode?{factCorrectionAttempts:Number(candidateMap.factCorrectionAttempts||0)+1}:{automaticWritingAttempts:Number(candidateMap.automaticWritingAttempts||0)+1})});
    const headings=[...String(row.body_markdown||'').matchAll(/^#{2,3}\s+(.+)$/gm)].map(m=>m[1]);
    const common={canWrite:{type:'boolean'},holdReason:{type:'string'},photoSearchQuery:{type:'string'}};
    const properties=factCorrectionMode?{...common,replacements:{type:'array',maxItems:5,items:{type:'object',additionalProperties:false,required:['paragraphIndex','replacementMarkdown'],properties:{paragraphIndex:{type:'integer',enum:actualParagraphs.map(p=>p.index)},replacementMarkdown:{type:'string',maxLength:4000}}}}}:completionMode?{...common,additions:{type:'array',maxItems:8,items:{type:'object',additionalProperties:false,required:['afterHeading','markdown'],properties:{afterHeading:{type:'string',enum:[...new Set(headings)]},markdown:{type:'string',minLength:100,maxLength:12000}}}}}:{...common,title:{type:'string'},description:{type:'string'},markdown:{type:'string'},imagePrompts:{type:'array',minItems:3,maxItems:4,items:{type:'string'}},editorialChecks:{type:'array',items:{type:'string'}}};
    const responseSchema=JSON.stringify({type:'object',additionalProperties:false,required:Object.keys(properties),properties});
    const economy=config.economy_enabled===true||config.economy_pilot_article_id===row.article_id;
    const billing_model=economy?'gpt-5.6-luna':(config.text_model||'gpt-5.4-mini');
    const billing_rates=economy?{input:.2,cached:.02,output:1.2,cacheWriteMultiplier:1.25}:{input:config.input_usd_per_million,cached:config.cached_input_usd_per_million,output:config.output_usd_per_million,cacheWriteMultiplier:1};
    return [{json:{...row,previous_status:row.status,completionMode,factCorrectionMode,responseSchema,topic_map_json,brief,billing_model,billing_rates,revision:Number(row.revision||0)+1,reserved_usd:config.reserve_usd,actual_usd:Number(row.actual_usd||0),budget_month:month,generation_day:today,claim_id:String($execution.id)}}];
  } catch { continue; }
}
return [];
