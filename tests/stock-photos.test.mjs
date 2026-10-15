import test from 'node:test';
import assert from 'node:assert/strict';
import {validStockPhoto,stockDownloadUrl} from '../src/lib/stock-photos.mjs';
import {buildTopicMap} from '../src/lib/topic-map.mjs';
const photo={url:'https://live.staticflickr.com/1234/test_b.jpg',generated:false,sourceUrl:'https://www.flickr.com/photos/test/1234',stock:{provider:'flickr',assetId:'test-id',title:'Dishwasher',creator:'Test creator',pageUrl:'https://www.flickr.com/photos/test/1234',license:'by',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',checkedAt:'2026-10-15T00:00:00.000Z',query:'dishwasher'}};
test('stock media requires a licensed original source and rejects disguised hosts or noncommercial licenses',()=>{
 assert.equal(validStockPhoto(photo),true);
 for(const bad of [{...photo,url:'https://live.staticflickr.com.evil.example/a.jpg'},{...photo,url:'https://user@live.staticflickr.com/a.jpg'},{...photo,stock:{...photo.stock,license:'by-nc',licenseUrl:'https://creativecommons.org/licenses/by-nc/4.0/'}},{...photo,stock:{...photo.stock,creator:''}},{...photo,generated:true}])assert.equal(validStockPhoto(bad),false);
});

test('Commons downloads use a provider rendition of the same licensed original',async()=>{
 const image={...photo,url:'https://upload.wikimedia.org/wikipedia/commons/a/ab/Album.jpg',sourceUrl:'https://commons.wikimedia.org/wiki/File:Album.jpg',stock:{...photo.stock,provider:'wikimedia',pageUrl:'https://commons.wikimedia.org/wiki/File:Album.jpg'}};
 const thumbnail='https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/Album.jpg/1280px-Album.jpg';
 const request=async url=>{assert.equal(url.hostname,'commons.wikimedia.org');assert.equal(url.searchParams.get('iiurlwidth'),'1280');return {ok:true,json:async()=>({query:{pages:{1:{imageinfo:[{url:image.url+'?utm_source=commons',thumburl:thumbnail}]}}}})}};
 assert.equal(await stockDownloadUrl(image,request),thumbnail);
 await assert.rejects(stockDownloadUrl(image,async()=>({ok:true,json:async()=>({query:{pages:{1:{imageinfo:[{url:image.url.replace('Album','Other'),thumburl:thumbnail}]}}}})})),/does not match/);
});
test('category topic maps contain only real published content and retain reviewed intent boundaries',()=>{
 const sections=[{id:'digital',label:'IT·디지털',articleCategories:['문서 작업','브라우저 문제 해결']}];
 const article={articleId:'existing',intentKey:'compress-pdf',category:'문서 작업',title:'PDF 용량 줄이는 방법',description:'PDF 압축 방법을 설명합니다.',markdown:'## 압축하기\n\n본문\n\n## 결과 확인\n\n본문',publishedAt:'2026-10-14T00:00:00.000Z',demo:false};
 const map=buildTopicMap([article,{...article,articleId:'future',publishedAt:'2099-01-01T00:00:00.000Z'},{...article,articleId:'test-only'}],{policy:'Actual scopes only',articles:[{articleId:'existing',scope:'PC PDF',outOfScope:['PDF 병합'],aliases:['PDF 압축']}]},sections);
 assert.equal(map.articles.length,1);assert.equal(map.categories[0].articles[0].scope,'PC PDF');assert.deepEqual(map.categories[0].articles[0].coverage,['압축하기','결과 확인']);assert.deepEqual(map.categories[0].articles[0].outOfScope,['PDF 병합']);
});
