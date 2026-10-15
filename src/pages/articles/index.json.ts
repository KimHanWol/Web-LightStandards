import {getArticles} from '../../lib/articles.mjs';
import {libraryEntries} from '../../lib/article-library.mjs';
import topics from '../../../config/topic-map.json';
export function GET(){return new Response(JSON.stringify({entries:libraryEntries(getArticles(),topics.articles)}),{headers:{'Content-Type':'application/json; charset=utf-8'}});}
