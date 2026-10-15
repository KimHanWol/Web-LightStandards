export const LIBRARY_PAGE_SIZE=12;

export function libraryEntries(articles,topics=[]){
  const aliases=new Map(topics.map(topic=>[topic.articleId,topic.aliases||[]]));
  return articles.map(article=>({
    articleId:article.articleId,title:article.title,description:article.description,
    category:article.category,publishedAt:article.publishedAt,
    image:{src:article.images[0]?.localPath||'/brand/lightstandards-mark-v2.png',alt:article.images[0]?.alt||''},
    search:[article.title,article.description,article.category,...(aliases.get(article.articleId)||[])].join(' ').toLocaleLowerCase('ko')
  }));
}

export function filterLibrary(entries,query='',requestedCategory=''){
  const category=entries.some(entry=>entry.category===requestedCategory)?requestedCategory:'';
  const term=query.trim().toLocaleLowerCase('ko');
  return {category,entries:entries.filter(entry=>(!category||entry.category===category)&&entry.search.includes(term))};
}

// One request at a time. Failed requests retain the same URL for manual retry.
export function createLibraryLoader({nextUrl,fetchPage,append,onState=()=>{}}){
  let next=nextUrl,loading=false;
  const seen=new Set();
  return {
    get hasMore(){return Boolean(next);},
    async load(){
      if(loading||!next)return false;
      loading=true;onState({loading:true,nextUrl:next});
      try{
        const current=next;
        const page=await fetchPage(current);
        if(!page.items.length||page.nextUrl&&(page.nextUrl===current||seen.has(page.nextUrl)))throw new Error('Invalid library page');
        append(page.items);seen.add(current);next=page.nextUrl||null;
        onState({loading:false,nextUrl:next});return true;
      }catch(error){onState({loading:false,nextUrl:next,error});return false;}
      finally{loading=false;}
    }
  };
}
