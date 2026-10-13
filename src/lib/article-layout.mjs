import { renderMarkdown } from './content.mjs';
export function prepareArticle(markdown, images) {
  const headings=[];
  const html=renderMarkdown(markdown).replace(/<h2>(.*?)<\/h2>/g,(_,title)=>{
    const id='section-'+(headings.length+1);
    headings.push({id,title:title.replace(/<[^>]+>/g,'')});
    return '<h2 id="'+id+'">'+title+'</h2>';
  });
  const sections=html.split(/(?=<h2\b)/);
  const placement=new Map();
  images.forEach((image,index)=>{
    const slot=Math.floor(index*(sections.length-1)/images.length);
    placement.set(slot,[...(placement.get(slot)||[]),{...image,lead:index===0}]);
  });
  return {headings,sections:sections.map((html,index)=>({html,images:placement.get(index)||[]}))};
}
