import { readFile } from 'node:fs/promises';
const url=process.env.PUBLIC_SITE_URL||'';
if(!/^https:\/\//.test(url)||new URL(url).hostname==='localhost')throw new Error('Set PUBLIC_SITE_URL to your actual HTTPS domain or workers.dev address');
if(process.env.PUBLIC_SITE_READY!=='true')throw new Error('Set PUBLIC_SITE_READY=true after reviewing site settings and policies');
if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.PUBLIC_CONTACT_EMAIL||''))throw new Error('Set PUBLIC_CONTACT_EMAIL before publication');
const consent=JSON.parse(await readFile(new URL('../config/publication.json',import.meta.url),'utf8'));
if(consent.reviewed!==true)throw new Error('Review the brand, privacy policy, contact address, domain and deployment; set config/publication.json reviewed=true');
console.log('Publication configuration passed.');
