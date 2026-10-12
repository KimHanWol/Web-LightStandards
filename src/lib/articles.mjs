import { validateArticle, plainText } from './content.mjs';
const entries = import.meta.glob('../../content/articles/*.json', { eager: true, import: 'default' });
export function getArticles() {
  return Object.values(entries).map(v => validateArticle(v)).filter(a => new Date(a.publishedAt) <= new Date()).sort((a,b) => b.publishedAt.localeCompare(a.publishedAt));
}
export function readingTime(article) { return Math.max(1, Math.ceil([...plainText(article.markdown)].length / 700)); }
export const categories = ['전체', '생활 도구', '디지털 생활', '공간과 수납', '선택 가이드'];
