import { validateArticle } from './content.mjs';
import titleEdits from '../../config/article-titles.json';
import {articleWithTitle} from './article-titles.mjs';
export { formatPublishedDate } from './article-layout.mjs';
const entries = import.meta.glob('../../content/articles/*.json', { eager: true, import: 'default' });
export function getArticles() {
  return Object.values(entries).map(v => articleWithTitle(validateArticle(v),titleEdits.articles)).filter(a => new Date(a.publishedAt) <= new Date()).sort((a,b) => b.publishedAt.localeCompare(a.publishedAt));
}
export function articleCategories(articles){return ['전체',...new Set(articles.map(article=>article.category))];}
export const categories=articleCategories(getArticles());
