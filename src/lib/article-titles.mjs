// User-authorized headline edits are presentation metadata. Keep the approved
// manuscript and n8n publication receipt immutable, and expire edits on revision.
export function articleWithTitle(article, edits) {
  const edit=edits[article.articleId];
  if(!edit||edit.revision!==article.revision||edit.sourceTitle!==article.title)return article;
  if(typeof edit.title!=='string'||edit.title.trim()!==edit.title||edit.title.length<8||edit.title.length>120||/[<>\r\n]/.test(edit.title))throw new Error('Invalid reviewed title: '+article.articleId);
  return {...article,title:edit.title};
}
