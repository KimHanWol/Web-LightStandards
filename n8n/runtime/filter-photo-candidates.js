const row=$('Prepare Photo Search').first().json,response=$input.first().json;
const used=new Set(row.usedPhotoUrls||[]),seen=new Set();
const candidates=(Array.isArray(response.results)?response.results:[]).filter(i=>{
 if(!i.id||!i.title||!i.creator||!i.foreign_landing_url||!['cc0','by'].includes(i.license)||!['flickr','wikimedia'].includes(i.source)||i.mature||Number(i.width)<800||Number(i.height)<400||Number(i.width)*Number(i.height)>20000000||used.has(i.url)||seen.has(i.url))return false;
 const asset=String(i.url||''),page=String(i.foreign_landing_url||''),license=String(i.license_url||'');
 const allowed=i.source==='flickr'?/^https:\/\/live\.staticflickr\.com\/[^\s\\]+$/i.test(asset)&&/^https:\/\/(?:www\.)?flickr\.com\//i.test(page):/^https:\/\/(?:upload|thumb)\.wikimedia\.org\/[^\s\\]+$/i.test(asset)&&/^https:\/\/commons\.wikimedia\.org\//i.test(page);
 const licensed=i.license==='cc0'?license==='https://creativecommons.org/publicdomain/zero/1.0/':/^https:\/\/creativecommons\.org\/licenses\/by\/(?:1\.0|2\.0|2\.5|3\.0|4\.0)\/$/.test(license);
 if(!allowed||!licensed)return false;
 seen.add(i.url);return true;
}).slice(0,4).map(i=>({id:i.id,title:String(i.title).replace(/<[^>]+>/g,'').slice(0,500),creator:String(i.creator).replace(/<[^>]+>/g,'').slice(0,300),url:i.url,pageUrl:i.foreign_landing_url,license:i.license,licenseUrl:i.license_url,provider:i.source}));
const map=JSON.parse(row.topic_map_json||'{}');
const stockSearch={query:row.photoQuery,checkedAt:new Date().toISOString(),provider:'openverse',eligibleCandidates:candidates.length,outcome:response.error?'search_unavailable':candidates.length?'candidates':'no_eligible_photos'};
return [{json:{...row,candidates,hasPhotoCandidates:candidates.length>0&&row.photoSelectionAllowed,topic_map_json:JSON.stringify({...map,stockSearch})}}];

