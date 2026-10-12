const config = $('Configuration').first().json;
if (!config.paid_enabled) return [];
const rows = $input.all().map(i => i.json);
const today = $now.setZone('Asia/Seoul').toFormat('yyyy-MM-dd');
const month = today.slice(0,7);
const used = rows.filter(r=>r.budget_month===month).reduce((s,r)=>s+Number(r.actual_usd||0)+Number(r.reserved_usd||0),0);
if (used + config.reserve_usd > config.monthly_budget_usd) return [];
if (rows.filter(r=>r.generation_day===today).length >= config.daily_limit) return [];
if(rows.some(r=>['generation_started','image_submitting'].includes(r.status))) return [];
for (const row of rows.filter(r=>r.status==='ready').sort((a,b)=>a.id-b.id)) {
  try {
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.article_id)||row.article_id.length>90||!row.intent_key||!row.keyword||!row.category) continue;
    if(rows.some(r=>r.id!==row.id && (r.article_id===row.article_id || r.intent_key===row.intent_key) && r.status!=='candidate')) continue;
    const sources=JSON.parse(row.sources_json||'[]');
    if(sources.length<2||new Set(sources.map(s=>s.url)).size<2) continue;
    if(!sources.every(s=>s.title&&/^https:\/\//.test(s.url)&&s.reviewed===true&&s.checkedAt&&s.excerpt?.length>=300)) continue;
    const brief=JSON.stringify({keyword:row.keyword,category:row.category,sources,existingTitles:rows.filter(r=>r.title).map(r=>r.title).slice(-80)});
    if(brief.length>25000||sources.reduce((n,s)=>n+s.excerpt.length,0)<2000) continue;
    return [{json:{...row,brief,revision:Number(row.revision||0)+1,reserved_usd:config.reserve_usd,actual_usd:0,budget_month:month,generation_day:today,claim_id:String($execution.id)}}];
  } catch { continue; }
}
return [];
