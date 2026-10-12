import { site } from '../lib/site.mjs';
export function GET(){return new Response(site.ready?`User-agent: *\nAllow: /\nSitemap: ${new URL('/sitemap-index.xml',site.url).href}\n`:'User-agent: *\nDisallow: /\n',{headers:{'Content-Type':'text/plain; charset=utf-8'}});}
