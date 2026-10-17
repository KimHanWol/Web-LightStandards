import test from 'node:test';
import assert from 'node:assert/strict';
import {articleWithTitle} from '../src/lib/article-titles.mjs';

test('reviewed titles preserve approved content and expire when its source changes',()=>{
 const article={articleId:'test-article',title:'기존 원고의 승인 제목',revision:2,approvedRevision:2,markdown:'보존할 승인 본문'};
 const edits={'test-article':{revision:2,sourceTitle:article.title,title:'대상과 행동이 드러나는 제목'}};
 const result=articleWithTitle(article,edits);
 assert.equal(result.title,edits['test-article'].title);
 assert.equal(article.title,'기존 원고의 승인 제목');
 assert.equal(result.markdown,article.markdown);assert.equal(result.approvedRevision,2);
 assert.equal(articleWithTitle({...article,revision:3},edits).title,article.title);
 assert.equal(articleWithTitle({...article,title:'새로 승인한 다른 제목'},edits).title,'새로 승인한 다른 제목');
 assert.equal(articleWithTitle(article,{}),article);
 assert.throws(()=>articleWithTitle(article,{'test-article':{...edits['test-article'],title:'잘못된 <b> 제목'}}),/Invalid reviewed title/);
});
