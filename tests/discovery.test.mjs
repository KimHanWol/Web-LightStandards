import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {relatedArticles,relatedPlacement} from '../src/lib/reading-paths.mjs';
import {prepareArticle,articleAdPlacements} from '../src/lib/article-layout.mjs';
import {featuredArticles,sectionHighlights,articleSection,isSectionFeatured,sections} from '../src/lib/navigation.mjs';

const folder=new URL('../content/articles/',import.meta.url);
const articles=readdirSync(folder).filter(name=>name.endsWith('.json')).map(name=>JSON.parse(readFileSync(new URL(name,folder),'utf8')));
const now=Date.parse('2026-10-17T00:00:00Z');
const byIntent=intent=>articles.find(article=>article.intentKey===intent);

test('reading paths connect complementary published topics across categories and skip unrelated recent articles',()=>{
  const drive=byIntent('drive-sharing-permissions');
  assert.equal(relatedArticles(drive,articles,{now})[0].intentKey,'sheets-protect-ranges');
  assert.notEqual(drive.category,byIntent('sheets-protect-ranges').category);
  assert.deepEqual(relatedArticles(byIntent('photos-backup'),articles,{now}).map(article=>article.intentKey),['photos-albums','photos-export','photos-sharing']);
  const unrelated={...drive,articleId:'unrelated-published-guide',intentKey:'unrelated-published-guide',title:'다른 업무에 관한 안내'};
  assert.deepEqual(relatedArticles(unrelated,[...articles,unrelated],{now}),[]);
});

test('reading paths never expose self, duplicate intent, test, unapproved or future articles',()=>{
  const source=byIntent('photos-backup');
  const candidate=byIntent('photos-albums');
  const unsafe=[
    {...candidate,articleId:'test-photos'},
    {...candidate,articleId:'future-photos',publishedAt:'2099-01-01T00:00:00Z'},
    {...candidate,articleId:'unapproved-photos',approvedRevision:0},
    {...candidate,articleId:'demo-photos',demo:true},
    {...source,articleId:'same-intent-copy'}
  ];
  const result=relatedArticles(source,[...unsafe,source,candidate,candidate],{now});
  assert.deepEqual(result.map(article=>article.articleId),[candidate.articleId]);
  assert.deepEqual(relatedArticles(source,articles,{now,limit:0}),[]);
});

test('all current articles have working reading paths placed at complete sections away from ads',()=>{
  const ids=new Set(articles.map(article=>article.articleId));
  for(const article of articles){
    const related=relatedArticles(article,articles,{now});
    assert.ok(related.length>0,article.articleId);
    assert.equal(new Set(related.map(next=>next.articleId)).size,related.length);
    for(const next of related){assert.ok(ids.has(next.articleId));assert.notEqual(next.articleId,article.articleId);}
    const {sections}=prepareArticle(article.markdown,article.images);
    const ads=articleAdPlacements(sections);
    const placement=relatedPlacement(sections,ads);
    assert.ok(placement>0&&placement<sections.length-1,article.articleId);
    assert.ok(!ads.has(placement));
  }
  assert.equal(relatedPlacement([{html:'짧은 글',images:[]}]),null);
});

test('featured articles represent actual sections and retain the remaining article order',()=>{
  const featured=featuredArticles(articles);
  assert.equal(featured.length,2);
  assert.equal(new Set(featured.map(article=>articleSection(article).id)).size,2);
  for(const section of sections){
    const highlights=sectionHighlights(articles,section.id);
    assert.ok(isSectionFeatured(highlights[0]),section.id);
    assert.equal(new Set(highlights.map(article=>article.articleId)).size,highlights.length);
    const rest=articles.filter(article=>articleSection(article).id===section.id&&article.articleId!==highlights[0].articleId);
    assert.deepEqual(highlights.slice(1),rest);
  }
  const remaining=articles.filter(article=>!isSectionFeatured(article));
  assert.doesNotThrow(()=>sectionHighlights(remaining,'digital'));
});
