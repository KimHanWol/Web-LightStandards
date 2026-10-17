const row=$('Batch Input').first().json;
if(!row.id||row.status!=='text_ready')return [];
const map=JSON.parse(row.topic_map_json||'{}');
const fallbackQueries={'dryer-efficient-use-20261015':'clothes dryer laundry','dehumidifier-use-20261015':'home dehumidifier'};
const query=String(fallbackQueries[row.article_id]||map.photoSearchQuery||row.article_id.replace(/-\d{8}$/,'').replace(/-/g,' ')).trim().slice(0,150);
const previous=map.stockSearch;
const priorAge=Date.now()-Date.parse(previous?.checkedAt||'');
const reusePhotoDecision=Number(map.imageRepairAttempts||0)>0&&previous?.query===query&&Number.isFinite(priorAge)&&priorAge>=0&&priorAge<7*86400000&&(previous.outcome==='no_eligible_photos'||previous.outcome==='selected'&&previous.selected===0);
const month=$now.setZone('Asia/Seoul').toFormat('yyyy-MM');
const ledger=$input.all().map(i=>i.json),used=ledger.filter(r=>r.budget_month===month).reduce((s,r)=>s+Number(r.actual_usd||0)+Number(r.reserved_usd||0),0);
const usedUrls=ledger.filter(r=>r.id!==row.id).flatMap(r=>JSON.parse(r.images_json||'[]').map(i=>i.url));
const searchUrl='https://api.openverse.org/v1/images/?q='+encodeURIComponent(query)+'&license=cc0,by&source=flickr,wikimedia&extension=jpg,jpeg,png&size=large&mature=false&filter_dead=true&page_size=20';
return [{json:{...row,photoQuery:query,searchUrl,reusePhotoDecision,photoSelectionAllowed:used+.03<=7&&!reusePhotoDecision,usedPhotoUrls:usedUrls}}];

