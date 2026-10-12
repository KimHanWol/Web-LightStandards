import { z } from 'zod';
import configuration from '../../config/affiliate-banners.json' with {type:'json'};

export const bannerSlots = ['home-top','home-middle','home-bottom','article-top','article-middle','article-bottom','article-sidebar-top','article-sidebar-bottom'];
const httpsUrl=z.string().url().refine(value=>{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password&&!url.port;},'A public HTTPS URL is required');
const bannerSchema=z.object({
  id:z.string().regex(/^[a-z0-9-]+$/),
  slot:z.enum(bannerSlots),
  categories:z.array(z.string()).default([]),
  href:httpsUrl.refine(value=>['link.coupang.com','www.coupang.com'].includes(new URL(value).hostname),'Use a reviewed Coupang link'),
  alt:z.string().min(3).max(200),
  desktop:z.object({src:httpsUrl,width:z.number().int().min(120).max(1600),height:z.number().int().min(50).max(600)}),
  mobile:z.object({src:httpsUrl,width:z.number().int().min(120).max(750),height:z.number().int().min(50).max(400)}).optional()
}).strict();
export function validateBanners(value){
  const parsed=z.object({enabled:z.boolean(),banners:z.array(bannerSchema)}).strict().parse(value);
  if(new Set(parsed.banners.map(b=>b.id)).size!==parsed.banners.length)throw new Error('Banner IDs must be unique');
  for(const slot of bannerSlots)if(parsed.banners.filter(b=>b.slot===slot).length>1)throw new Error('Choose one banner per placement');
  return parsed;
}
const settings=validateBanners(configuration);
export function getBanners(slot,category){return settings.enabled?settings.banners.filter(b=>b.slot===slot&&(!b.categories.length||category&&b.categories.includes(category))):[];}
export function hasBanners(slots,category){return slots.some(slot=>getBanners(slot,category).length>0);}
