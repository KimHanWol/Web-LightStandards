import test from 'node:test';
import assert from 'node:assert/strict';
import {LIBRARY_PAGE_SIZE,libraryEntries,filterLibrary,createLibraryLoader} from '../src/lib/article-library.mjs';

test('search includes aliases beyond the first page and never exposes full article bodies',()=>{
  const articles=Array.from({length:34},(_,i)=>({articleId:`guide-${i}`,title:`안내 ${i}`,description:'실제 글 설명',category:i%2?'IT·디지털':'경제·일',publishedAt:'2026-10-16T01:00:00Z',markdown:'비공개 원고 내부 데이터',images:[]}));
  const entries=libraryEntries(articles,[{articleId:'guide-30',aliases:['PDF 줄이기']}]);
  assert.equal(LIBRARY_PAGE_SIZE,12);assert.equal(entries.length,34);
  assert.equal(filterLibrary(entries,' PDF 줄이기 ').entries[0].articleId,'guide-30');
  assert.equal(filterLibrary(entries,'없는 검색어').entries.length,0);
  assert.equal(filterLibrary(entries,'','IT·디지털').entries.length,17);
  assert.equal(filterLibrary(entries,'','없는 분야').entries.length,34);
  assert.ok(entries.every(entry=>!('markdown'in entry)));
});

test('overlapping scroll and button requests append once and stop at the last page',async()=>{
  let resolve,calls=0;const appended=[];
  const loader=createLibraryLoader({nextUrl:'/articles/2/',fetchPage:()=>{calls++;return new Promise(done=>resolve=done);},append:items=>appended.push(...items)});
  const first=loader.load();assert.equal(await loader.load(),false);assert.equal(calls,1);
  resolve({items:['next article'],nextUrl:null});assert.equal(await first,true);
  assert.deepEqual(appended,['next article']);assert.equal(loader.hasMore,false);
  assert.equal(await loader.load(),false);assert.equal(calls,1);
});

test('network failures preserve the next URL and retry without a second append',async()=>{
  const urls=[],appended=[],states=[];
  const loader=createLibraryLoader({nextUrl:'/articles/2/',fetchPage:async url=>{urls.push(url);if(urls.length===1)throw Error('offline');return {items:['one'],nextUrl:null};},append:items=>appended.push(...items),onState:state=>states.push(state)});
  assert.equal(await loader.load(),false);assert.ok(states.at(-1).error);assert.equal(loader.hasMore,true);
  assert.equal(await loader.load(),true);assert.deepEqual(urls,['/articles/2/','/articles/2/']);assert.deepEqual(appended,['one']);
});

test('empty or cyclic page responses cannot create an endless auto-load loop',async()=>{
  let appended=0;
  for(const page of [{items:[],nextUrl:'/articles/3/'},{items:['one'],nextUrl:'/articles/2/'}]){
    const loader=createLibraryLoader({nextUrl:'/articles/2/',fetchPage:async()=>page,append:()=>appended++});
    assert.equal(await loader.load(),false);
  }
  assert.equal(appended,0);
});
