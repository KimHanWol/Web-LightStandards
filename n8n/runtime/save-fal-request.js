const row=$('Find Free Photos').first().json;
const response=$input.first().json;
const detail=String(response.details?.body?.detail||response.details?.description||response.error?.message||'');
const forbidden=Number(response.details?.httpCode||response.error?.status)===403;
const unavailable=forbidden&&/exhausted balance/i.test(detail)&&!response.request_id;
if(unavailable)return [{json:{...row,status:'provider_blocked',reserved_usd:0,fal_request_id:'',fal_status_url:'',fal_response_url:'',error:'fal.ai rejected this image request: exhausted account balance. No request was accepted; user funding required.'}}];
const base='https://queue.fal.run/fal-ai/flux/requests/'+response.request_id;
const ok=typeof response.request_id==='string'&&/^[a-zA-Z0-9-]+$/.test(response.request_id)&&response.status_url===base+'/status'&&response.response_url===base;
return [{json:{...row,status:ok?'image_pending':'image_uncertain',fal_request_id:ok?response.request_id:'',fal_status_url:ok?response.status_url:'',fal_response_url:ok?response.response_url:'',error:ok?'':'fal request outcome uncertain; inspect execution, do not resubmit automatically'}}];
