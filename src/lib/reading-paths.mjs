import configuration from '../../config/reading-paths.json' with {type:'json'};
import topicMap from '../../config/topic-map.json' with {type:'json'};

const topics=new Map(topicMap.articles.map(topic=>[topic.articleId,topic]));
const belongs=(group,intent)=>group.intentKeys.includes(intent)||group.intentPrefixes.some(prefix=>intent.startsWith(prefix));
const stopWords=new Set(['구글','google','방법','설정','확인','정리','하기','하는','사용','경우','먼저','함께','차이','기준','기능','내용']);
function terms(article){
  const topic=topics.get(article.articleId);
  return new Set([article.title,topic?.coreQuestion,...(topic?.coverage||[])].filter(Boolean).join(' ').normalize('NFKC').toLowerCase().match(/[\p{L}\p{N}]{2,}/gu)?.filter(word=>!stopWords.has(word))||[]);
}
function published(article,now){
  return !article.demo&&!article.articleId.startsWith('test-')&&article.revision===article.approvedRevision&&Date.parse(article.publishedAt)<=now;
}

export function relatedArticles(article,articles,{limit=3,now=Date.now()}={}){
  const groups=configuration.groups.filter(group=>belongs(group,article.intentKey));
  const next=configuration.nextByIntent[article.intentKey]||[];
  const sourceTerms=terms(article);
  const seen=new Set([article.articleId]);
  return articles.filter(candidate=>{
    if(seen.has(candidate.articleId)||candidate.intentKey===article.intentKey||!published(candidate,now))return false;
    seen.add(candidate.articleId);
    return next.includes(candidate.intentKey)||groups.some(group=>belongs(group,candidate.intentKey));
  }).map(candidate=>{
    const explicit=next.indexOf(candidate.intentKey);
    const group=groups.find(group=>belongs(group,candidate.intentKey));
    const sourceIndex=group?.intentKeys.indexOf(article.intentKey)??-1;
    const candidateIndex=group?.intentKeys.indexOf(candidate.intentKey)??-1;
    const distance=sourceIndex>=0&&candidateIndex>=0?candidateIndex-sourceIndex:null;
    const sequence=distance===null?0:(distance>0?20:8)/(Math.abs(distance)+1);
    const overlap=[...terms(candidate)].filter(term=>sourceTerms.has(term)).length;
    return {article:candidate,score:explicit>=0?1000-explicit*100:100+sequence+Math.min(overlap,10)};
  }).sort((a,b)=>b.score-a.score||a.article.articleId.localeCompare(b.article.articleId)).slice(0,Math.max(0,limit)).map(result=>result.article);
}

export function relatedPlacement(sections,adPlacements=new Map()){
  const lengths=sections.map(section=>section.html.replace(/<[^>]*>/g,'').trim().length);
  const total=lengths.reduce((sum,length)=>sum+length,0);
  let cumulative=0;
  const candidates=[];
  sections.forEach((section,index)=>{
    cumulative+=lengths[index];
    if(index<1||index>=sections.length-1||cumulative<1000||total-cumulative<800||adPlacements.has(index))return;
    const mediaPenalty=section.images.length?0.1:0;
    const adPenalty=adPlacements.has(index-1)||adPlacements.has(index+1)?0.2:0;
    candidates.push({index,score:Math.abs(cumulative/total-.45)+mediaPenalty+adPenalty});
  });
  return candidates.sort((a,b)=>a.score-b.score||a.index-b.index)[0]?.index??null;
}
