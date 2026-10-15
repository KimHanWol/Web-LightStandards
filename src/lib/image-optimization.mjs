import sharp from 'sharp';
import {readFileSync} from 'node:fs';

export const assetBudgets=JSON.parse(readFileSync(new URL('../../config/asset-budgets.json',import.meta.url),'utf8'));

export async function optimizeImage(bytes,{budget=assetBudgets.image}={}) {
  if(bytes.length>budget.sourceMaxBytes)throw new Error('Source image exceeds '+budget.sourceMaxBytes+' bytes');
  const metadata=await sharp(bytes,{limitInputPixels:budget.sourceMaxPixels}).metadata();
  if(!['webp','png','jpeg'].includes(metadata.format))throw new Error('Unsupported source image');
  if((metadata.pages||1)>1)throw new Error('Animated images require a separate delivery budget');
  let fitting;
  for(const scale of [1,.8,.625,.5]) {
    for(const quality of [80,72,64,56]) {
      const result=await sharp(bytes,{limitInputPixels:budget.sourceMaxPixels}).rotate()
        .resize({width:Math.round(budget.maxWidth*scale),height:Math.round(budget.maxHeight*scale),fit:'inside',withoutEnlargement:true})
        .webp({quality,effort:4}).toBuffer({resolveWithObject:true});
      if(result.data.length<=budget.maxBytes&&!fitting)fitting=result;
      if(result.data.length<=budget.targetBytes)return result;
    }
    if(fitting)return fitting;
  }
  throw new Error('Optimized image still exceeds '+budget.maxBytes+' bytes');
}
