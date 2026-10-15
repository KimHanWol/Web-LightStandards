import { validateArticle } from './content.mjs';
export { formatPublishedDate } from './article-layout.mjs';
const entries = import.meta.glob('../../content/articles/*.json', { eager: true, import: 'default' });
export function getArticles() {
  return Object.values(entries).map(v => validateArticle(v)).filter(a => new Date(a.publishedAt) <= new Date()).sort((a,b) => b.publishedAt.localeCompare(a.publishedAt));
}
export function articleCategories(articles){return ['전체',...new Set(articles.map(article=>article.category))];}
export const categories=articleCategories(getArticles());
