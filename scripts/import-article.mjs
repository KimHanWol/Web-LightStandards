import { readFile, writeFile, mkdir, readdir, access } from 'node:fs/promises';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { validateArticle } from '../src/lib/content.mjs';
import { validStockPhoto, stockDownloadUrl } from '../src/lib/stock-photos.mjs';
import { syncTopicMap } from './sync-topic-map.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export function allowedMedia(url){const u=new URL(url);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&(u.hostname==='fal.media'||u.hostname.endsWith('.fal.media'));}
async function downloadImage(image,articleId){
  if(!image.generated&&!image.stock){
    const path=resolve(root,'public'+image.localPath);
    const bytes=await readFile(path);
    if(bytes.length>8000000||createHash('sha256').update(bytes).digest('hex')!==image.localPath.split('/').pop().split('.')[0])throw new Error('Captured media file hash mismatch');
    const metadata=await sharp(bytes,{limitInputPixels:20000000}).metadata();
    if(!['webp','png','jpeg'].includes(metadata.format))throw new Error('Unsupported captured media');
    if(image.width!==metadata.width||image.height!==metadata.height)throw new Error('Captured media dimensions mismatch');
    return image;
  }
  if(image.stock?!validStockPhoto(image):!allowedMedia(image.url))throw new Error('Unapproved image provider or license');
  const hash=createHash('sha256').update(image.url).digest('hex');
  const folder=resolve(root,'public/media',articleId);await mkdir(folder,{recursive:true});
  for(const ext of ['webp','png','jpg']){const path=resolve(folder,hash+'.'+ext);try{await access(path);return {...image,localPath:`/media/${articleId}/${hash}.${ext}`};}catch{}}
  const downloadUrl=image.stock?await stockDownloadUrl(image):image.url;
  const response=await fetch(downloadUrl,{redirect:'error',signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw new Error('Image download failed '+response.status);
  const mime=(response.headers.get('content-type')||'').split(';')[0];const ext={'image/webp':'webp','image/png':'png','image/jpeg':'jpg'}[mime];
  if(!ext)throw new Error('Unsupported image content type');
  if(Number(response.headers.get('content-length')||0)>8000000)throw new Error('Image exceeds 8MB');
  const chunks=[];let length=0;for await(const chunk of response.body){length+=chunk.length;if(length>8000000){await response.body.cancel().catch(()=>{});throw new Error('Image exceeds 8MB');}chunks.push(chunk);}
  const bytes=Buffer.concat(chunks);if((ext==='png'&&bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')||(ext==='jpg'&&bytes.subarray(0,3).toString('hex')!=='ffd8ff')||(ext==='webp'&&(bytes.subarray(0,4).toString()!=='RIFF'||bytes.subarray(8,12).toString()!=='WEBP')))throw new Error('Image signature mismatch');
  const {data:optimized,info}=await sharp(bytes,{limitInputPixels:20000000}).rotate().resize({width:1280,withoutEnlargement:true}).webp({quality:82}).toBuffer({resolveWithObject:true});
  await writeFile(resolve(folder,hash+'.webp'),optimized);return {...image,localPath:`/media/${articleId}/${hash}.webp`,...(image.stock?{width:info.width,height:info.height}:{})};
}
export async function importArticle(file){
  const article=validateArticle(JSON.parse(await readFile(file,'utf8')));
  const dir=resolve(root,'content/articles');await mkdir(dir,{recursive:true});
  const target=resolve(dir,article.articleId+'.json');
  try{const old=JSON.parse(await readFile(target,'utf8'));if(old.revision>article.revision)throw new Error('Cannot overwrite newer revision');if(old.revision===article.revision){const normalize=a=>JSON.stringify({...a,images:a.images.map(({localPath,...i})=>i.stock?{...i,width:undefined,height:undefined}:i)});if(normalize(old)!==normalize(article))throw new Error('Same revision has different content');console.log('Already imported '+article.articleId);return;}}catch(error){if(error.code!=='ENOENT')throw error;}
  for(const filename of (await readdir(dir)).filter(f=>f.endsWith('.json'))){const old=JSON.parse(await readFile(resolve(dir,filename),'utf8'));if(old.intentKey===article.intentKey&&old.articleId!==article.articleId)throw new Error('Duplicate search intent');}
  article.images=await Promise.all(article.images.map(i=>downloadImage(i,article.articleId)));
  await writeFile(target,JSON.stringify(article,null,2)+'\n');
  const mdDir=resolve(root,'content/markdown');await mkdir(mdDir,{recursive:true});
  await writeFile(resolve(mdDir,article.articleId+'.md'),`---\ntitle: ${JSON.stringify(article.title)}\narticleId: ${JSON.stringify(article.articleId)}\nrevision: ${article.revision}\n---\n\n${article.markdown}\n`);
  console.log('Imported '+relative(root,target));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const input=process.argv[2];
  if(input==='--inbox'){
    const dir=resolve(root,'content/inbox');const latest=new Map();
    for(const f of (await readdir(dir)).filter(f=>f.endsWith('.json')).sort()){
      const file=resolve(dir,f);const a=validateArticle(JSON.parse(await readFile(file,'utf8')));
      const old=latest.get(a.articleId);
      if(old?.revision===a.revision)throw new Error('Duplicate inbox article revision');
      if(!old||a.revision>old.revision)latest.set(a.articleId,{revision:a.revision,file});
    }
    for(const a of latest.values())await importArticle(a.file);
  }
  else if(input)await importArticle(resolve(input));else throw new Error('Usage: npm run import:article -- <approved.json> or --inbox');
  await syncTopicMap(root);
}
