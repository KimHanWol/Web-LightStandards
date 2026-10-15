import {LIBRARY_PAGE_SIZE,filterLibrary,createLibraryLoader} from './article-library.mjs';

function createCard(entry,doc){
  const element=(tag,className,text)=>{const node=doc.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;};
  const card=element('a','guide-card');card.href=`/notes/${entry.articleId}/`;card.dataset.article='';
  const visual=element('div','guide-card-image'),image=element('img');
  image.src=entry.image.src;image.alt=entry.image.alt;image.width=1024;image.height=768;image.loading='lazy';image.decoding='async';visual.append(image);
  const copy=element('div','guide-card-copy');copy.append(element('p','guide-card-topic',entry.category),element('h3','',entry.title),element('p','guide-card-description',entry.description));
  const date=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(entry.publishedAt));
  const meta=element('div','guide-card-meta'),time=element('time','',date);time.dateTime=entry.publishedAt;meta.append(time);copy.append(meta);card.append(visual,copy);return card;
}

export async function initialiseArticleLibrary(root,win=window){
  const doc=root.ownerDocument,grid=root.querySelector('[data-library-grid]'),status=root.querySelector('[data-library-status]');
  let next=root.querySelector('[data-library-next]');
  const sentinel=root.querySelector('[data-library-sentinel]');
  const params=new URLSearchParams(win.location.search),query=(params.get('q')||'').trim(),requestedCategory=params.get('category')||'';
  const input=doc.querySelector('.site-search input');if(input)input.value=query;
  let start=Number(root.dataset.start),total=Number(root.dataset.total),count=grid.children.length,observer;
  let firstAdded=null;
  const known=new Set([...grid.querySelectorAll('[data-article]')].map(card=>card.getAttribute('href')));
  const append=items=>{const fragment=doc.createDocumentFragment();firstAdded=null;for(const item of items){const href=item.getAttribute('href');if(known.has(href))continue;known.add(href);fragment.append(item);firstAdded||=item;count++;}grid.append(fragment);};
  const progress=()=>{status.textContent=total?`${start+1}–${start+count} / ${total}개 글${start+count>=total?' · 마지막 글입니다.':''}`:'검색 결과가 없습니다.';};
  const setState=state=>{
    grid.setAttribute('aria-busy',String(state.loading));
    if(next){next.setAttribute('aria-disabled',String(state.loading));next.hidden=!state.nextUrl;if(state.nextUrl)next.href=state.nextUrl;next.innerHTML=state.loading?'불러오는 중…':'글 더 보기 <span aria-hidden="true">↓</span>';}
    if(state.error){status.textContent='목록을 불러오지 못했습니다. 글 더 보기를 눌러 다시 시도해 주세요.';observer?.disconnect();}
    else if(state.loading)status.textContent='다음 글을 불러오고 있습니다.';
    else{progress();if(!state.nextUrl)observer?.disconnect();else observer?.observe(sentinel);}
  };
  let fetchPage;
  let initialNext=next?.getAttribute('href')||null;
  if(query||requestedCategory){
    grid.hidden=true;root.querySelector('.library-pagination').hidden=true;status.textContent='검색 결과를 불러오고 있습니다.';
    try{
      const response=await win.fetch('/articles/index.json');if(!response.ok)throw new Error('Search unavailable');
      const {entries}=await response.json();
      const filtered=filterLibrary(entries,query,requestedCategory);total=filtered.entries.length;start=0;count=0;known.clear();grid.replaceChildren();
      doc.querySelector('#library-title').textContent=query?'검색 결과':filtered.category||'전체 글';
      doc.querySelector('#library-count').textContent=`${total}개의 글`;
      const prev=root.querySelector('[data-library-prev]');if(prev)prev.hidden=true;
      if(!next){next=doc.createElement('a');next.dataset.libraryNext='';root.querySelector('.library-pagination').append(next);}
      const slice=offset=>filtered.entries.slice(offset,offset+LIBRARY_PAGE_SIZE).map(entry=>createCard(entry,doc));
      append(slice(0));initialNext=count<total?`#library-${count}`:null;
      fetchPage=async()=>{const items=slice(count);return {items,nextUrl:count+items.length<total?`#library-${count+items.length}`:null};};
      root.querySelector('#library-empty').hidden=total>0;
    }catch{
      grid.hidden=false;status.textContent='검색 결과를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
      const retry=doc.createElement('a');retry.href=win.location.href;retry.textContent='검색 다시 시도';root.querySelector('.library-pagination').replaceChildren(retry);root.querySelector('.library-pagination').hidden=false;return;
    }finally{grid.hidden=false;root.querySelector('.library-pagination').hidden=false;}
  }else{
    fetchPage=async url=>{
      const target=new URL(url,win.location.origin);if(target.origin!==win.location.origin||!/^\/articles\/(?:\d+\/)?$/.test(target.pathname))throw new Error('Invalid next page');
      const response=await win.fetch(target.href);if(!response.ok)throw new Error('Page unavailable');
      const page=new win.DOMParser().parseFromString(await response.text(),'text/html');
      const nextPage=page.querySelector('[data-library-next]')?.getAttribute('href')||null;
      return {items:[...page.querySelectorAll('[data-library-grid] > [data-article]')],nextUrl:nextPage};
    };
  }
  const loader=createLibraryLoader({nextUrl:initialNext,fetchPage,append,onState:setState});
  setState({loading:false,nextUrl:initialNext});
  next?.addEventListener('click',async event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();const loaded=await loader.load();if(loaded&&event.detail===0&&firstAdded)firstAdded.focus({preventScroll:true});});
  if(loader.hasMore&&'IntersectionObserver'in win){observer=new win.IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting))void loader.load();},{rootMargin:'0px 0px 400px 0px'});observer.observe(sentinel);}
  win.addEventListener('pagehide',()=>observer?.disconnect(),{once:true});
}
