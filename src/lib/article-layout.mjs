import { renderMarkdown } from './content.mjs';
export function formatPublishedDate(value) {
  return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value));
}
export function prepareArticle(markdown, images) {
  const headings=[];
  const html=renderMarkdown(markdown).replace(/<table>([\s\S]*?)<\/table>/g,(_,contents)=>{
    const labels=[...(contents.match(/<thead>[\s\S]*?<\/thead>/)?.[0]||'').matchAll(/<th(?:\s[^>]*)?>([\s\S]*?)<\/th>/g)].map(m=>m[1].replace(/<[^>]+>/g,'').replace(/"/g,'&quot;'));
    const labelled=contents.replace(/<tr>/g,'<tr role="row">').replace(/<th(\s[^>]*)?>/g,'<th$1 scope="col" role="columnheader">').replace(/<tbody>([\s\S]*?)<\/tbody>/g,(_,body)=>'<tbody>'+body.replace(/<tr role="row">([\s\S]*?)<\/tr>/g,(_,row)=>{
      let cell=0;
      return '<tr role="row">'+row.replace(/<td(\s[^>]*)?>/g,(_,attrs='')=>'<td'+attrs+' role="cell" data-label="'+(labels[cell++]||'')+'">')+'</tr>';
    })+'</tbody>');
    return '<div class="article-table-wrap" role="region" aria-label="비교표" tabindex="0"><table role="table" class="'+(labels.length>0&&labels.length<=3?'stackable-table':'wide-table')+'">'+labelled+'</table></div>';
  }).replace(/<h2>(.*?)<\/h2>/g,(_,title)=>{
    const id='section-'+(headings.length+1);
    headings.push({id,title:title.replace(/<[^>]+>/g,'')});
    return '<h2 id="'+id+'" data-section-number="'+String(headings.length).padStart(2,'0')+'">'+title+'</h2>';
  });
  const sections=html.split(/(?=<h2\b)/);
  const placement=new Map();
  images.forEach((image,index)=>{
    const first=sections[0].includes('<h2')?0:Math.min(1,sections.length-1);
    const specific=image.sectionHeading?sections.findIndex(html=>html.includes('>'+image.sectionHeading+'</h2>')):-1;
    const slot=specific>=0?specific:first+Math.floor(index*(sections.length-first)/images.length);
    placement.set(slot,[...(placement.get(slot)||[]),{...image,lead:index===0}]);
  });
  return {headings,sections:sections.map((html,index)=>({html,images:placement.get(index)||[]}))};
}

export function articleAdPlacements(sections) {
  const lengths=sections.map(s=>s.html.replace(/<[^>]*>/g,'').trim().length);
  const total=lengths.reduce((a,b)=>a+b,0);
  const placements=new Map();
  let cumulative=0,lastAt=0,lastIndex=-1;
  sections.forEach((section,index)=>{
    cumulative+=lengths[index];
    if(index<1||index>=sections.length-1||section.images.length||total-cumulative<800)return;
    if(!placements.size&&cumulative>=1000){placements.set(index,'article-top');lastAt=cumulative;lastIndex=index;}
    else if(placements.size===1&&index-lastIndex>=2&&cumulative-lastAt>=1800&&cumulative>=total*.55)placements.set(index,'article-middle');
  });
  return placements;
}
