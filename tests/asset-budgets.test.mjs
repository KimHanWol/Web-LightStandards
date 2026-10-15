import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import sharp from 'sharp';
import {assetBudgets,optimizeImage} from '../src/lib/image-optimization.mjs';
import {checkAssets} from '../scripts/check-assets.mjs';

test('large photographic input is bounded in both delivered dimensions and encoded bytes',async()=>{
 const width=1600,height=1000,pixels=Buffer.alloc(width*height*3);
 let seed=7;
 for(let i=0;i<pixels.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;pixels[i]=seed>>>24;}
 const input=await sharp(pixels,{raw:{width,height,channels:3}}).png().toBuffer();
 assert.ok(input.length>assetBudgets.image.maxBytes);
 const out=await optimizeImage(input),metadata=await sharp(out.data).metadata();
 assert.equal(metadata.format,'webp');assert.ok(out.data.length<=assetBudgets.image.maxBytes);
 assert.ok(metadata.width<=assetBudgets.image.maxWidth&&metadata.height<=assetBudgets.image.maxHeight);
 await assert.rejects(optimizeImage(Buffer.alloc(assetBudgets.image.sourceMaxBytes+1)),/Source image exceeds/);
});

test('delivery checks reject heavy scripts and excessive eager images while allowing lazy images',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'lightstandards-budget-'));
 await mkdir(join(dir,'media'));
 for(let i=0;i<4;i++)await writeFile(join(dir,'media',i+'.webp'),Buffer.alloc(160000));
 const images=Array.from({length:4},(_,i)=>`<img src="/media/${i}.webp" loading="lazy">`).join('');
 await writeFile(join(dir,'index.html'),images);
 await checkAssets(dir);
 await writeFile(join(dir,'index.html'),images.replaceAll('loading="lazy"','loading="eager"'));
 await assert.rejects(checkAssets(dir),/initial images 640000 bytes/);
 await writeFile(join(dir,'index.html'),images);
 await writeFile(join(dir,'large.js'),Buffer.alloc(assetBudgets.files.javascript+1));
 await assert.rejects(checkAssets(dir),/large\.js: 150001 bytes/);
});
