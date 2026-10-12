import rss from '@astrojs/rss';
import { getArticles } from '../lib/articles.mjs';
import { site } from '../lib/site.mjs';
export function GET(){return rss({title:site.name,description:site.description,site:site.url,items:getArticles().map(a=>({title:a.title,description:a.description,pubDate:new Date(a.publishedAt),link:`/notes/${a.articleId}/`}))});}
