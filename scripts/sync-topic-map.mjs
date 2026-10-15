import {readFile,writeFile,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {buildTopicMap} from '../src/lib/topic-map.mjs';
export async function syncTopicMap(root=process.cwd()) {
  const folder=resolve(root,'content/articles');
  const articles=await Promise.all((await readdir(folder)).filter(f=>f.endsWith('.json')).map(f=>readFile(resolve(folder,f),'utf8').then(JSON.parse)));
  const previous=JSON.parse(await readFile(resolve(root,'config/topic-map.json'),'utf8'));
  const navigation=JSON.parse(await readFile(resolve(root,'config/navigation.json'),'utf8'));
  await writeFile(resolve(root,'config/topic-map.json'),JSON.stringify(buildTopicMap(articles,previous,navigation.sections),null,2)+'\n');
}
