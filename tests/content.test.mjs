import test from 'node:test';
import assert from 'node:assert/strict';
import { validateArticle, renderMarkdown, plainText } from '../src/lib/content.mjs';
import { allowedMedia } from '../scripts/import-article.mjs';
function fixture(){return {articleId:'test-article',intentKey:'test intent',title:'테스트 문서 제목입니다',description:'실제 발행 대상이 아닌 자동 검증용 설명입니다.',category:'선택 가이드',markdown:'조건을 확인하고 출처를 검토합니다. '.repeat(400),revision:1,approvedRevision:1,approvedBy:'editor',approvedAt:'2026-10-12T00:00:00.000Z',publishedAt:'2026-10-12T00:00:00.000Z',sources:[{title:'근거 하나',url:'https://example.com/a',checkedAt:'2026-10-12'},{title:'근거 둘',url:'https://example.com/b',checkedAt:'2026-10-12'}],images:Array.from({length:5},(_,i)=>({url:'https://fal.media/test-'+i+'.png',alt:'설명용 생성 이미지 '+i,generated:true})),affiliates:[]};}
test('only reviewed long-form content passes publication validation',()=>{assert.equal(validateArticle(fixture()).articleId,'test-article');assert.throws(()=>validateArticle({...fixture(),approvedRevision:2}),/Approval/);assert.throws(()=>validateArticle({...fixture(),markdown:'짧은 글'}),/5000/);assert.throws(()=>validateArticle({...fixture(),demo:true}),/Demo/);});
test('untrusted markup and media cannot enter published content',()=>{assert.throws(()=>validateArticle({...fixture(),markdown:fixture().markdown+'<script>alert(1)</script>'}),/Raw HTML/);assert.throws(()=>validateArticle({...fixture(),articleId:'../escape'}));const html=renderMarkdown('[unsafe](javascript:alert(1)) <script>alert(1)</script>');assert.ok(!html.includes('javascript:'));assert.ok(!html.includes('<script'));assert.ok(!allowedMedia('https://fal.media.evil.example/a.png'));assert.ok(!allowedMedia('http://fal.media/a.png'));assert.ok(!allowedMedia('https://user@fal.media/a.png'));assert.ok(allowedMedia('https://v3.fal.media/files/a.png'));});
test('visible character count excludes Markdown URLs and formatting',()=>{assert.equal(plainText('## 제목\n\n[설명](https://example.com/very-long-link)'), '제목 설명');});
test('removing unwanted images requires an explicit reviewed exception',()=>{
  const article={...fixture(),images:fixture().images.slice(0,3)};
  assert.throws(()=>validateArticle(article),/editorial exception/);
  assert.equal(validateArticle({...article,imageCountException:'사용자가 불필요한 도움말 문장 캡처 제거를 요청하여 기존 설명 이미지 3장만 유지합니다.'}).images.length,3);
  assert.throws(()=>validateArticle({...article,images:article.images.slice(0,2),imageCountException:'검토한 이미지 편집 예외입니다.'}));
});
test('captured screenshots require provenance and a restricted local path',()=>{
  const original=fixture();const capture={url:'https://example.com/media/test-article/'+ 'a'.repeat(64)+'.webp',localPath:'/media/test-article/'+'a'.repeat(64)+'.webp',generated:false,alt:'검토한 공식 안내 캡처',caption:'공식 도움말의 짧은 안내 구간',sourceUrl:original.sources[0].url,width:600,height:60};
  const article={...original,images:[capture,...original.images.slice(1)]};
  assert.equal(validateArticle(article).images[0].generated,false);
  assert.throws(()=>validateArticle({...article,images:[{...capture,sourceUrl:'https://unknown.example/source'},...original.images.slice(1)]}),/matching source/);
  assert.throws(()=>validateArticle({...article,images:[{...capture,localPath:'/media/../private.png'},...original.images.slice(1)]}),/Invalid local/);
});
