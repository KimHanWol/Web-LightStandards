// Keep partner code in the shared template, outside generated article Markdown.
export const coupangScriptUrl='https://ads-partners.coupang.com/g.js';

export function chooseBannerSize(configuration,availableWidth){
  return configuration.mobile&&availableWidth+1<configuration.desktop.width?configuration.mobile:configuration.desktop;
}

export function createCoupangLoader(doc,win){
  let pending;
  return function load(){
    if(win.PartnersCoupang?.G)return Promise.resolve(win.PartnersCoupang);
    if(pending)return pending;
    pending=new Promise((resolve,reject)=>{
      const script=doc.createElement('script');
      const timeout=win.setTimeout(()=>reject(new Error('Partner script timed out')),12000);
      script.src=coupangScriptUrl;
      script.async=true;
      script.onload=()=>{
        win.clearTimeout(timeout);
        if(win.PartnersCoupang?.G)resolve(win.PartnersCoupang);
        else reject(new Error('Partner script unavailable'));
      };
      script.onerror=()=>{win.clearTimeout(timeout);reject(new Error('Partner script failed'));};
      doc.head.append(script);
    });
    return pending;
  };
}

export function initialiseCoupangBanners(doc=document,win=window){
  const hosts=[...doc.querySelectorAll('[data-coupang-widget]')];
  if(!hosts.length)return;
  const load=createCoupangLoader(doc,win);
  const mount=async host=>{
    const frame=host.parentElement;
    if(host.dataset.state||frame.getBoundingClientRect().width===0)return;
    host.dataset.state='loading';
    try{
      const partner=await load();
      if(!host.isConnected)return;
      const configuration=JSON.parse(host.dataset.coupangWidget);
      const size=chooseBannerSize(configuration,frame.getBoundingClientRect().width);
      const widget=size===configuration.mobile?configuration.mobileWidget||configuration.widget:configuration.widget;
      frame.style.width=`min(${size.width}px, 100%)`;
      frame.style.aspectRatio=`${size.width}/${size.height}`;
      host.style.width=`${size.width}px`;
      host.style.height=`${size.height}px`;
      const scale=()=>host.style.setProperty('--widget-scale',String(Math.min(1,frame.getBoundingClientRect().width/size.width)));
      scale();
      // The official g.js supports a container, so widgets never depend on script order.
      new partner.G({...widget,width:String(size.width),height:String(size.height),container:host});
      host.dataset.state='loaded';
      if(win.ResizeObserver){const resize=new win.ResizeObserver(scale);resize.observe(frame);}
      else win.addEventListener('resize',scale);
    }catch{
      host.dataset.state='unavailable';
      host.closest('.affiliate-banner').hidden=true;
    }
  };
  if(win.IntersectionObserver){
    const observer=new win.IntersectionObserver(entries=>{
      for(const entry of entries)if(entry.isIntersecting&&entry.target.getBoundingClientRect().width>0){
        observer.unobserve(entry.target);
        void mount(entry.target.querySelector('[data-coupang-widget]'));
      }
    },{rootMargin:'160px 0px'});
    hosts.forEach(host=>observer.observe(host.parentElement));
  }else hosts.forEach(host=>{void mount(host);});
}
