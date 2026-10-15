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
