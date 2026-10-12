const row=$('Select Image Request').first().json;const response=$input.first().json;
const images=response.images;
if(!Array.isArray(images)||images.length!==2)throw new Error('Expected two illustrations; inspect fal result');
for(const i of images){if(typeof i.url!=='string'||!/^https:\/\/(?:[a-z0-9-]+\.)*fal\.media\/[^\s\\]+$/i.test(i.url))throw new Error('Unexpected image host');}
return [{json:{...row,status:'needs_review',images_json:JSON.stringify(images.map((i,n)=>({url:i.url,alt:row.title+' — 설명용 생성 일러스트 '+(n+1),generated:true}))),actual_usd:Number(row.actual_usd||0)+0.006,reserved_usd:0,error:''}}];
