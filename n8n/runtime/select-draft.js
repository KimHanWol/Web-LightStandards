const config = $('Configuration').first().json;
if (!config.paid_enabled) return [];
const rows = $input.all().map(i => i.json);
const today = $now.setZone('Asia/Seoul').toFormat('yyyy-MM-dd');
const month = today.slice(0,7);
const used = rows.filter(r=>r.budget_month===month).reduce((s,r)=>s+Number(r.actual_usd||0)+Number(r.reserved_usd||0),0);
if (used + config.reserve_usd > config.monthly_budget_usd) return [];
if (rows.filter(r=>r.generation_day===today).length >= config.daily_limit) return [];
if(rows.some(r=>['generation_started','image_submitting'].includes(r.status))) return [];
const canCorrect=r=>config.batch_mode&&Number(r.id)>=4&&Number(r.id)<=33&&r.status==='needs_review'&&r.error&&r.openai_response_id&&Number(r.reserved_usd||0)===0&&Number(JSON.parse(r.topic_map_json||'{}').automaticWritingAttempts||0)<2;
for (const row of rows.filter(r=>canCorrect(r)||(r.status==='ready'&&(!config.target_article_id||r.article_id===config.target_article_id))).sort((a,b)=>(canCorrect(a)?0:1)-(canCorrect(b)?0:1)||a.id-b.id)) {
  try {
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.article_id)||row.article_id.length>90||!row.intent_key||!row.keyword||!row.category) continue;
    if(rows.some(r=>r.id!==row.id&&(r.article_id===row.article_id||r.intent_key===row.intent_key)&&r.status!=='candidate'))continue;
    const normalize=v=>String(v||'').toLowerCase().replace(/[^a-z0-9가-힣]/g,'');
    const mapOf=r=>r.topic_map_json?JSON.parse(r.topic_map_json):{};
    const candidateMap=mapOf(row);
    if(Number(candidateMap.automaticWritingAttempts||0)>=2)continue;
    const activeRows=rows.filter(r=>r.id!==row.id&&!r.article_id?.startsWith('test-')&&r.status!=='candidate');
    const aliases=r=>[r.keyword,...(mapOf(r).aliases||[]),mapOf(r).coreQuestion].filter(Boolean).map(normalize);
    if(activeRows.some(r=>r.article_id===row.article_id||r.intent_key===row.intent_key||aliases(r).some(alias=>aliases(row).includes(alias))))continue;
    const sources=JSON.parse(row.sources_json||'[]');
    if(sources.length<2||new Set(sources.map(s=>s.url)).size<2) continue;
    if(!sources.every(s=>s.title&&/^https:\/\//.test(s.url)&&s.reviewed===true&&s.checkedAt&&s.excerpt?.length>=300)) continue;
    // A queued topic is not an existing article. Keep queue collision checks above,
    // but give the writer only completed article scopes for semantic comparison.
    const existingTopics=activeRows.filter(r=>!['ready','candidate','generation_started'].includes(r.status)&&String(r.title||'').trim()&&Number(r.character_count)>=5000).slice(-80).map(r=>({...mapOf(r),articleId:r.article_id,category:r.category,intentKey:r.intent_key,title:r.title,keyword:r.keyword,status:r.status}));
    const correction=row.body_markdown?{previousMarkdown:String(row.body_markdown).slice(0,20000),visibleCharacters:Number(row.character_count||0),requiredAdditionalCharacters:Math.max(1800,6800-Number(row.character_count||0)),feedback:candidateMap.repairFeedback||row.error||'Complete and check the full article'}:candidateMap.repairFeedback;
    const brief=JSON.stringify({keyword:row.keyword,category:row.category,sources,candidateTopic:candidateMap,existingTopics,existingTitles:existingTopics.map(r=>r.title).filter(Boolean),correction});
    if(brief.length>50000||sources.reduce((n,s)=>n+s.excerpt.length,0)<2000) continue;
    const topic_map_json=JSON.stringify({...candidateMap,automaticWritingAttempts:Number(candidateMap.automaticWritingAttempts||0)+1});
    return [{json:{...row,previous_status:row.status,topic_map_json,brief,revision:Number(row.revision||0)+1,reserved_usd:config.reserve_usd,actual_usd:Number(row.actual_usd||0),budget_month:month,generation_day:today,claim_id:String($execution.id)}}];
  } catch { continue; }
}
return [];
