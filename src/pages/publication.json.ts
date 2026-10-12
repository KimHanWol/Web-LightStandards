import { getArticles } from '../lib/articles.mjs';
export function GET(){
  return new Response(JSON.stringify({articles:getArticles().map(a=>({articleId:a.articleId,revision:a.revision}))}),{headers:{'Content-Type':'application/json','Cache-Control':'no-cache'}});
}
