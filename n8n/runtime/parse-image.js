const row=$('Select Image Request').first().json;const response=$input.first().json;
const images=response.images;
const existing=JSON.parse(row.images_json||'[]');
const target=Math.min(5,Math.max(3,JSON.parse(row.image_prompt||'[]').length));
if(!Array.isArray(existing)||existing.length>=target||!Array.isArray(images)||images.length!==1)throw new Error('Expected one remaining illustration; inspect fal result');
if(response.has_nsfw_concepts?.some(Boolean))throw new Error('Image safety review required');
for(const i of images){if(typeof i.url!=='string'||!/^https:\/\/(?:[a-z0-9-]+\.)*fal\.media\/[^\s\\]+$/i.test(i.url))throw new Error('Unexpected image host');}
if(existing.some(old=>old.url===images[0].url))throw new Error('Image receipt already recorded; do not double count');
const combined=[...existing,...images.map((i,n)=>({url:i.url,alt:row.title+' — AI 생성 설명 이미지 '+(existing.length+n+1),generated:true}))];
return [{json:{...row,status:combined.length>=target?'needs_review':'image_more_needed',images_json:JSON.stringify(combined),actual_usd:Number(row.actual_usd||0)+0.003,reserved_usd:Math.max(0,target-combined.length)*0.003,error:''}}];
