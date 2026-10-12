for(const item of $input.all()){
  const r=item.json;if(r.status!=='image_pending'||!r.fal_request_id)continue;
  const base='https://queue.fal.run/fal-ai/flux/requests/'+r.fal_request_id;
  if(/^[a-zA-Z0-9-]+$/.test(r.fal_request_id)&&r.fal_status_url===base+'/status'&&r.fal_response_url===base)return [{json:r}];
}
return [];
