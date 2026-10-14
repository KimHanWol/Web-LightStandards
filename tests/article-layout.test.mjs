import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {prepareArticle,articleAdPlacements} from '../src/lib/article-layout.mjs';

test('published article retains all images and ads respect complete sections and reading intervals',()=>{
  const article=JSON.parse(readFileSync(new URL('../content/articles/pdf-compression-20261014.json',import.meta.url),'utf8'));
  const {sections}=prepareArticle(article.markdown,article.images);
  assert.equal(sections.flatMap(s=>s.images).length,5);
  assert.equal(sections[0].images.length,0);
  const placements=[...articleAdPlacements(sections)];
  assert.equal(placements.length,2);
  assert.ok(placements[1][0]-placements[0][0]>=2);
  assert.ok(sections.slice(placements[0][0]+1,placements[1][0]+1).reduce((n,s)=>n+s.html.replace(/<[^>]*>/g,'').length,0)>=1800);
  for(const [i]of placements){assert.equal(sections[i].images.length,0);assert.ok(i>0&&i<sections.length-1);}
  const short=prepareArticle('短い導入\n\n## 手順\n\n1. 一つの操作\n2. 次の操作',[]);
  assert.equal(articleAdPlacements(short.sections).size,0);
});

test('responsive table headers retain semantics without turning header text into injected markup',()=>{
  const {sections}=prepareArticle('| 名称 | " onmouseover="bad & 条件 |\n| --- | --- |\n| **道具** | 詳細 |',[]);
  const html=sections[0].html;
  assert.ok(html.includes('role="table"'));
  assert.ok(html.includes('scope="col"'));
  assert.ok(html.includes('data-label="&quot; onmouseover=&quot;bad &amp; 条件"'));
  assert.ok(!/<[a-z][^>]*\sonmouseover="bad/.test(html));
  assert.ok(html.includes('<strong>道具</strong>'));
});
