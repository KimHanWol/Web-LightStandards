export function buildTopicMap(articles, previous, sections) {
  const old=new Map((previous.articles||[]).map(topic=>[topic.articleId,topic]));
  const mapped=articles.filter(a=>!a.demo&&!a.articleId.startsWith('test-')&&Date.parse(a.publishedAt)<=Date.now()).map(a=>{
    const before=old.get(a.articleId)||{};
    const section=sections.find(s=>s.articleCategories.includes(a.category));
    return {...before,articleId:a.articleId,category:a.category,categoryId:section?.id||'other',categoryLabel:section?.label||a.category,intentKey:a.intentKey,status:'published',title:a.title,coreQuestion:before.coreQuestion||a.title,scope:before.scope||a.description,coverage:[...a.markdown.matchAll(/^##\s+(.+)$/gm)].map(m=>m[1]),outOfScope:before.outOfScope||[],aliases:[...new Set([...(before.aliases||[]),a.title])]};
  }).sort((a,b)=>a.articleId.localeCompare(b.articleId));
  const groups=[...sections.map(s=>({id:s.id,label:s.label})),...(!sections.some(s=>s.id==='other')?[{id:'other',label:'기타 정보'}]:[])];
  return {updatedAt:new Date().toISOString().slice(0,10),policy:previous.policy,articles:mapped,categories:groups.map(g=>({...g,articles:mapped.filter(a=>a.categoryId===g.id).map(a=>({articleId:a.articleId,intentKey:a.intentKey,coreQuestion:a.coreQuestion,scope:a.scope,coverage:a.coverage,outOfScope:a.outOfScope,aliases:a.aliases}))}))};
}
