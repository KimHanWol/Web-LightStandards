import {readdir,readFile,stat} from 'node:fs/promises';
import {resolve,join,relative,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {assetBudgets} from '../src/lib/image-optimization.mjs';

export function fileBudget(path) {
  const ext=extname(path).toLowerCase(),limits=assetBudgets.files;
  if(['.webp','.avif','.png','.jpg','.jpeg','.gif','.ico'].includes(ext))return limits.image;
  if(ext==='.svg')return limits.svg;
  if(['.woff2','.woff','.ttf','.otf'].includes(ext))return limits.font;
  if(ext==='.css')return limits.css;
  if(['.js','.mjs','.cjs'].includes(ext))return limits.javascript;
  if(ext==='.html')return limits.html;
  if(['.json','.xml'].includes(ext))return limits.data;
  return limits.other;
}

export async function checkAssets(folder) {
  const root=resolve(folder),files=new Map(),errors=[];
  async function visit(dir) {
    for(const e of await readdir(dir,{withFileTypes:true})) {
      const path=join(dir,e.name);
      if(e.isDirectory())await visit(path);
      else files.set(relative(root,path).replaceAll('\\','/'),{path,bytes:(await stat(path)).size});
    }
  }
  await visit(root);
  for(const [name,file] of files)if(file.bytes>fileBudget(name))errors.push(`${name}: ${file.bytes} bytes > ${fileBudget(name)} byte limit`);
  for(const [name,file] of files) {
    if(!name.endsWith('.html'))continue;
    const html=await readFile(file.path,'utf8'),eager=new Set();
    for(const match of html.matchAll(/<img\b[^>]*>/gi)) {
      if(/\bloading\s*=\s*["']lazy["']/i.test(match[0]))continue;
      const src=match[0].match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1];
      if(src?.startsWith('/')&&!src.startsWith('//'))eager.add(src.split(/[?#]/)[0].slice(1));
    }
    const missing=[...eager].filter(p=>!files.has(p));
    if(missing.length)errors.push(`${name}: missing initial images ${missing.join(', ')}`);
    const total=[...eager].reduce((sum,p)=>sum+(files.get(p)?.bytes||0),0);
    if(total>assetBudgets.page.eagerImageBytes)errors.push(`${name}: initial images ${total} bytes > ${assetBudgets.page.eagerImageBytes} byte limit`);
  }
  if(errors.length)throw new Error('Asset budget exceeded:\n'+errors.join('\n'));
  console.log(`Asset budgets passed for ${files.size} files in ${root}.`);
  return {files:files.size};
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await checkAssets(process.argv[2]||'public');
