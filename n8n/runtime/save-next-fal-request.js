const row=$('Validate Images').first().json;
const response=$input.first().json;
const base='https://queue.fal.run/fal-ai/flux/requests/'+response.request_id;
const ok=typeof response.request_id==='string'&&/^[a-zA-Z0-9-]+$/.test(response.request_id)&&response.status_url===base+'/status'&&response.response_url===base;
return [{json:{...row,status:ok?'image_pending':'image_uncertain',fal_request_id:ok?response.request_id:'',fal_status_url:ok?response.status_url:'',fal_response_url:ok?response.response_url:'',error:ok?'':'fal request outcome uncertain; inspect execution, do not resubmit automatically'}}];
