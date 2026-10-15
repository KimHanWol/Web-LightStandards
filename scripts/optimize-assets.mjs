import {readdir,readFile,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {assetBudgets,optimizeImage} from '../src/lib/image-optimization.mjs';

export async function optimizeAssets(root=process.cwd()) {
  const captures=new Set();
  for(const f of await readdir(resolve(root,'content/articles'))) {
    if(!f.endsWith('.json'))continue;
    const a=JSON.parse(await readFile(resolve(root,'content/articles',f),'utf8'));
    for(const image of a.images||[])if(!image.generated&&!image.stock&&image.localPath)captures.add(image.localPath);
  }
  let count=0,savedBytes=0;
  async function visit(dir) {
    for(const entry of await readdir(dir,{withFileTypes:true})) {
      const path=join(dir,entry.name);
      if(entry.isDirectory()){await visit(path);continue;}
      if(!/\.webp$/i.test(entry.name))continue;
      const bytes=await readFile(path);
      if(bytes.length<=assetBudgets.image.maxBytes)continue;
      const localPath='/'+path.slice(resolve(root,'public').length+1).replaceAll('\\','/');
      if(captures.has(localPath))throw new Error('Optimize captured image before approval: '+localPath);
      const result=await optimizeImage(bytes);
      await writeFile(path,result.data);
      count++;savedBytes+=bytes.length-result.data.length;
    }
  }
  await visit(resolve(root,'public'));
  console.log(`Optimized ${count} oversized WebP images; saved ${savedBytes} bytes.`);
  return {count,savedBytes};
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await optimizeAssets();
