import { z } from 'zod';
import configuration from '../../config/affiliate-banners.json' with {type:'json'};

export const bannerSlots = ['home-top','home-middle','home-bottom','home-sidebar','article-top','article-middle','article-bottom','article-sidebar-top','article-sidebar-bottom'];
export const affiliateDisclosure='이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.';
export const bannerDisclosure='이 배너는 쿠팡 파트너스 활동의 일환으로, 이를 통한 구매 시 일정액의 수수료를 제공받습니다.';
const httpsUrl=z.string().url().refine(value=>{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password&&!url.port;},'A public HTTPS URL is required');
const common={
  id:z.string().regex(/^[a-z0-9-]+$/),
  slot:z.enum(bannerSlots),
  categories:z.array(z.string()).default([]),
};
const imageBannerSchema=z.object({
  ...common,
  href:httpsUrl.refine(value=>['link.coupang.com','www.coupang.com'].includes(new URL(value).hostname),'Use a reviewed Coupang link'),
  alt:z.string().min(3).max(200),
  desktop:z.object({src:httpsUrl,width:z.number().int().min(120).max(1600),height:z.number().int().min(50).max(600)}),
  mobile:z.object({src:httpsUrl,width:z.number().int().min(120).max(750),height:z.number().int().min(50).max(400)}).optional()
}).strict();
const dimensions=z.object({width:z.number().int().min(120).max(1600),height:z.number().int().min(50).max(600)}).strict();
const widget=z.object({id:z.number().int().positive(),template:z.literal('carousel'),trackingCode:z.string().regex(/^AF\d+$/),tsource:z.string().max(100).regex(/^[a-zA-Z0-9_-]*$/)}).strict();
const dynamicBannerSchema=z.object({
  ...common,
  type:z.literal('dynamic'),
  widget,
  mobileWidget:widget.optional(),
  desktop:dimensions,
  mobile:dimensions.optional()
}).strict();
const bannerSchema=z.union([imageBannerSchema,dynamicBannerSchema]);
export function validateBanners(value){
  const parsed=z.object({enabled:z.boolean(),banners:z.array(bannerSchema)}).strict().parse(value);
  if(new Set(parsed.banners.map(b=>b.id)).size!==parsed.banners.length)throw new Error('Banner IDs must be unique');
  for(const slot of bannerSlots){
    const placements=parsed.banners.filter(b=>b.slot===slot);
    if(placements.filter(b=>!b.categories.length).length>1)throw new Error('Choose one banner per placement for the default audience');
    const categories=new Set();
    for(const banner of placements)for(const category of banner.categories){
      if(categories.has(category))throw new Error('Choose one banner per placement for each category');
      categories.add(category);
    }
  }
  return parsed;
}
const settings=validateBanners(configuration);
export const bannersEnabled=settings.enabled&&settings.banners.length>0;
export function selectBanners(configuration,slot,category){
  if(!configuration.enabled)return [];
  const placements=configuration.banners.filter(b=>b.slot===slot);
  const contextual=category?placements.filter(b=>b.categories.includes(category)):[];
  return contextual.length?contextual:placements.filter(b=>!b.categories.length);
}
export function getBanners(slot,category){return selectBanners(settings,slot,category);}
export function hasBanners(slots,category){return slots.some(slot=>getBanners(slot,category).length>0);}
