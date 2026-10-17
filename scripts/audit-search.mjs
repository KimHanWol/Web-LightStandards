import {writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';

// Read-only checks of actual public responses; this does not request indexing.
const base=new URL(process.argv[2]||'https://lightstandards.linkingmain.workers.dev/');
const textOf=s=>s.replace(/<[^>]+>/g,'').replaceAll('&amp;','&').trim();
async function read(url,attempt=0){
 const start=Date.now();
 try{const r=await fetch(url,{signal:AbortSignal.timeout(20000)});return {url,status:r.status,finalUrl:r.url,mime:r.headers.get('content-type'),robotsHeader:r.headers.get('x-robots-tag'),ms:Date.now()-start,body:await r.text()};}
 catch(error){if(attempt===0)return read(url,1);return {url,status:0,error:error.message};}
}
const index=await read(new URL('sitemap-index.xml',base).href);
const xmlUrls=s=>[...String(s||'').matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1].replaceAll('&amp;','&'));
const children=await Promise.all(xmlUrls(index.body).map(read));
const urls=[...new Set(children.flatMap(r=>xmlUrls(r.body)))];
const pages=[];let next=0;
await Promise.all(Array.from({length:4},async()=>{while(next<urls.length){const r=await read(urls[next++]);const html=r.body||'';const tag=name=>html.match(new RegExp('<'+name+'[^>]*>([\\s\\S]*?)<\\/'+name+'>','i'))?.[1];
 const attr=(name,key)=>[...html.matchAll(/<(?:meta|link)\b[^>]*>/gi)].find(m=>new RegExp('(?:name|rel)=["\\\']'+name+'["\\\']','i').test(m[0]))?.[0].match(new RegExp(key+'=["\\\']([^"\\\']*)','i'))?.[1];
 const title=textOf(tag('title')||''),h1=[...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map(m=>textOf(m[1]));
 const issues=[];if(r.status!==200)issues.push('HTTP '+r.status);if(!/text\/html/i.test(r.mime||''))issues.push('Not HTML');if(!title)issues.push('Missing title');if(h1.length!==1)issues.push('H1 count '+h1.length);if(attr('canonical','href')!==r.url)issues.push('Canonical mismatch');if(/noindex/i.test([attr('robots','content'),r.robotsHeader].join(' ')))issues.push('Noindex');if(!attr('description','content'))issues.push('Missing description');
 delete r.body;pages.push({...r,title,h1,issues});
}}));
const titles=new Map();for(const p of pages){const list=titles.get(p.title)||[];list.push(p.url);titles.set(p.title,list);}
const duplicateTitles=[...titles].filter(([title,list])=>title&&list.length>1);
const robots=await read(new URL('robots.txt',base).href);
const bot=await fetch(new URL('sitemap-index.xml',base),{headers:{'user-agent':'Googlebot'},signal:AbortSignal.timeout(20000)});
const report={checkedAt:new Date().toISOString(),base:base.href,sitemap:{indexStatus:index.status,mime:index.mime,children:children.map(({body,...r})=>({...r,urlCount:xmlUrls(body).length})),pageCount:urls.length,googlebotUserAgentStatus:bot.status},robots:{status:robots.status,body:robots.body},duplicateTitles,pages:pages.sort((a,b)=>a.url.localeCompare(b.url))};
await mkdir(resolve('.local'),{recursive:true});await writeFile(resolve('.local/search-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({sitemap:report.sitemap,checkedPages:pages.length,issues:pages.filter(p=>p.issues.length),duplicateTitles,robots:report.robots},null,2));
if(index.status!==200||children.some(r=>r.status!==200)||!urls.length||pages.some(p=>p.issues.length)||duplicateTitles.length)process.exitCode=1;
