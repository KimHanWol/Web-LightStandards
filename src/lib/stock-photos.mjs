export function validStockPhoto(image) {
  try {
    const s=image.stock;
    if(image.generated!==false||!s||!['flickr','wikimedia'].includes(s.provider)||!s.assetId||!s.title||!s.creator||!s.checkedAt||!s.query||image.sourceUrl!==s.pageUrl)return false;
    const asset=new URL(image.url),page=new URL(s.pageUrl),license=new URL(s.licenseUrl);
    if([asset,page,license].some(u=>u.protocol!=='https:'||u.username||u.password||u.port))return false;
    if(s.provider==='flickr'&&(asset.hostname!=='live.staticflickr.com'||!['www.flickr.com','flickr.com'].includes(page.hostname)))return false;
    if(s.provider==='wikimedia'&&(!['upload.wikimedia.org','thumb.wikimedia.org'].includes(asset.hostname)||page.hostname!=='commons.wikimedia.org'))return false;
    if(license.hostname!=='creativecommons.org')return false;
    return s.license==='cc0'?license.pathname==='/publicdomain/zero/1.0/':s.license==='by'&&/^\/licenses\/by\/(?:1\.0|2\.0|2\.5|3\.0|4\.0)\/$/.test(license.pathname);
  }catch{return false;}
}

export async function stockDownloadUrl(image, request=fetch) {
  if(!validStockPhoto(image))throw new Error('Invalid stock provenance');
  const original=new URL(image.url);
  if(image.stock.provider!=='wikimedia'||original.hostname!=='upload.wikimedia.org')return image.url;
  const api=new URL('https://commons.wikimedia.org/w/api.php');
  api.search=new URLSearchParams({action:'query',titles:'File:'+decodeURIComponent(original.pathname.split('/').pop()),prop:'imageinfo',iiprop:'url',iiurlwidth:'1280',format:'json'}).toString();
  const response=await request(api,{redirect:'error',signal:AbortSignal.timeout(15000),headers:{'User-Agent':'LightStandards/1.0 (https://lightstandards.linkingmain.workers.dev/; linkingmain@gmail.com)'}});
  if(!response.ok)throw new Error('Commons image metadata unavailable '+response.status);
  const data=await response.json();
  const info=Object.values(data.query?.pages||{}).flatMap(p=>p.imageinfo||[]).find(i=>{
    try{const u=new URL(i.url);return u.origin===original.origin&&decodeURIComponent(u.pathname)===decodeURIComponent(original.pathname);}catch{return false;}
  });
  if(!info?.thumburl||!validStockPhoto({...image,url:info.thumburl}))throw new Error('Commons rendition does not match the licensed original');
  return info.thumburl;
}
