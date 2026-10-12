import { readdir, readFile } from 'node:fs/promises';
import { validateArticle } from '../src/lib/content.mjs';
const dir = new URL('../content/articles/', import.meta.url);
const files = (await readdir(dir)).filter(f=>f.endsWith('.json'));
const seen = new Set();
for(const file of files){const a=validateArticle(JSON.parse(await readFile(new URL(file,dir),'utf8')));if(file!==a.articleId+'.json')throw new Error('Filename must match articleId');if(seen.has(a.intentKey))throw new Error('Duplicate search intent: '+a.intentKey);seen.add(a.intentKey);if(a.images.some(i=>!i.localPath))throw new Error('Images must be imported locally before build');}
console.log(`Validated ${files.length} approved articles.`);
