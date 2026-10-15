import configuration from '../../config/navigation.json' with { type: 'json' };
export const sections=configuration.sections;
export const designReferences=configuration.references;
export const otherSection={id:'other',label:'기타 정보',description:'다른 분야의 안내',topics:[],articleCategories:[]};
export function articleSection(article){
  return sections.find(section=>section.articleCategories.includes(article.category))||otherSection;
}
export function sectionArticles(articles,id){return articles.filter(article=>articleSection(article).id===id);}
export function sectionHighlights(articles,id){
  const candidates=sectionArticles(articles,id);
  const featured=candidates.find(article=>article.articleId===configuration.sectionFeaturedArticleIds?.[id]);
  return featured?[featured,...candidates.filter(article=>article.articleId!==featured.articleId)]:candidates;
}
export function isSectionFeatured(article){return configuration.sectionFeaturedArticleIds?.[articleSection(article).id]===article.articleId;}
export function featuredArticles(articles){
  const ordered=configuration.featuredArticleIds.map(id=>articles.find(article=>article.articleId===id)).filter(Boolean);
  return [...ordered,...articles.filter(article=>!ordered.some(feature=>feature.articleId===article.articleId))].slice(0,2);
}
