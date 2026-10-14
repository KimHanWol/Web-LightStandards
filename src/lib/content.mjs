import { z } from 'zod';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

export const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const safeUrl = z.string().url().refine(v => new URL(v).protocol === 'https:', 'HTTPS URL required');
export const articleSchema = z.object({
  articleId: z.string().regex(idPattern).max(90),
  intentKey: z.string().min(3), title: z.string().min(8).max(120),
  description: z.string().min(20).max(300), category: z.string().min(2).max(30),
  markdown: z.string().min(1).max(60000),
  revision: z.number().int().positive(), approvedRevision: z.number().int().positive(),
  approvedBy: z.string().min(1), approvedAt: z.string().datetime(), publishedAt: z.string().datetime(),
  sources: z.array(z.object({ title: z.string().min(2), url: safeUrl, checkedAt: z.string().min(10) })).min(2),
  images: z.array(z.object({ url: safeUrl, alt: z.string().min(3), generated: z.boolean(), localPath: z.string().optional(), sourceUrl: safeUrl.optional(), caption:z.string().min(3).max(250).optional(), sectionHeading:z.string().min(2).max(120).optional(), width:z.number().int().positive().max(5000).optional(), height:z.number().int().positive().max(5000).optional() })).min(5).max(8),
  affiliates: z.array(z.object({ label: z.string().min(2), url: safeUrl.refine(v => ['link.coupang.com','www.coupang.com'].includes(new URL(v).hostname)), note: z.string().max(200).optional() })).default([]),
  demo: z.boolean().default(false)
}).strict();

export function plainText(markdown) {
  return sanitizeHtml(marked.parse(markdown), { allowedTags: [], allowedAttributes: {} })
    .replace(/&(?:amp|lt|gt|quot|#39);/g, ' ').replace(/\s+/g, ' ').trim();
}
export function validateArticle(value, { allowDemo = false } = {}) {
  const article = articleSchema.parse(value);
  if (article.revision !== article.approvedRevision) throw new Error('Approval does not match current revision');
  if (article.demo && !allowDemo) throw new Error('Demo content cannot be published');
  if (!article.demo && [...plainText(article.markdown)].length < 5000) throw new Error('Article body must contain at least 5000 characters');
  if (/<\/?[a-z!][^>]*>/i.test(article.markdown)) throw new Error('Raw HTML is not allowed in article Markdown');
  if (/!\[[^\]]*\]\(/.test(article.markdown)) throw new Error('Article images must use the reviewed images field');
  for (const image of article.images) {
    if(!image.generated&&(!image.localPath||!image.sourceUrl||!image.caption||!article.sources.some(s=>s.url===image.sourceUrl)))throw new Error('Captured media requires a reviewed local file, caption and matching source');
    if (image.localPath && !new RegExp('^/media/' + article.articleId + '/[a-f0-9]{64}\\.(webp|png|jpg)$').test(image.localPath)) throw new Error('Invalid local media path');
  }
  return article;
}
export function renderMarkdown(markdown) {
  return sanitizeHtml(marked.parse(markdown), {
    allowedTags: ['p','h2','h3','h4','ul','ol','li','strong','em','blockquote','a','code','pre','table','thead','tbody','tr','th','td','hr','br'],
    allowedAttributes: { a: ['href','rel'], th: ['align'], td: ['align'] },
    allowedSchemes: ['https'], allowProtocolRelative: false,
    transformTags: { a: (name, attribs) => ({ tagName: name, attribs: { href: attribs.href || '', rel: 'noopener noreferrer' } }) }
  });
}
