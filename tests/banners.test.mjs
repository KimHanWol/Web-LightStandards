import test from 'node:test';
import assert from 'node:assert/strict';
import { validateBanners, getBanners, selectBanners, affiliateDisclosure } from '../src/lib/banners.mjs';
import { chooseBannerSize, createCoupangLoader, initialiseCoupangBanners, coupangScriptUrl } from '../src/lib/coupang-client.mjs';
const banner={id:'test-banner',slot:'article-middle',href:'https://link.coupang.com/a/test',alt:'테스트용 상품 안내',desktop:{src:'https://example.com/banner.webp',width:728,height:90},mobile:{src:'https://example.com/mobile.webp',width:300,height:250}};
test('banner configuration rejects scripts, deceptive links and duplicate placements',()=>{
  assert.equal(validateBanners({enabled:false,banners:[banner]}).banners[0].mobile.width,300);
  assert.throws(()=>validateBanners({enabled:true,banners:[{...banner,href:'javascript:alert(1)'}]}));
  assert.throws(()=>validateBanners({enabled:true,banners:[{...banner,href:'https://link.coupang.com@evil.example/banner'}]}));
  assert.throws(()=>validateBanners({enabled:true,banners:[banner,{...banner,id:'second-banner'}]}),/one banner per placement/);
});

test('contextual ads replace the default in one slot without stacking or leaking to unrelated topics',()=>{
  const technology={...banner,id:'technology',categories:['문서 작업','스프레드시트']};
  const home={...banner,id:'home',categories:['생활 가전']};
  const configuration=validateBanners({enabled:true,banners:[banner,technology,home]});
  assert.deepEqual(selectBanners(configuration,'article-middle','문서 작업').map(b=>b.id),['technology']);
  assert.deepEqual(selectBanners(configuration,'article-middle','생활 가전').map(b=>b.id),['home']);
  assert.deepEqual(selectBanners(configuration,'article-middle','여행 준비').map(b=>b.id),['test-banner']);
  assert.deepEqual(selectBanners(configuration,'article-middle').map(b=>b.id),['test-banner']);
  assert.deepEqual(selectBanners({...configuration,enabled:false},'article-middle','문서 작업'),[]);
  assert.deepEqual(selectBanners({...configuration,banners:[technology]},'article-middle','여행 준비'),[]);
  assert.throws(()=>validateBanners({enabled:true,banners:[technology,{...home,categories:['문서 작업']}]}),/one banner per placement/);
});

const dynamic={id:'recommendations',slot:'article-middle',categories:[],type:'dynamic',widget:{id:1038394,template:'carousel',trackingCode:'AF1976226',tsource:''},mobileWidget:{id:1038387,template:'carousel',trackingCode:'AF1976226',tsource:''},desktop:{width:728,height:90},mobile:{width:300,height:250}};
test('dynamic widgets preserve partner attribution and choose the fitting size',()=>{
  assert.equal(validateBanners({enabled:true,banners:[dynamic]}).banners[0].widget.trackingCode,'AF1976226');
  assert.deepEqual(chooseBannerSize(dynamic,728),{width:728,height:90});
  assert.deepEqual(chooseBannerSize(dynamic,600),{width:300,height:250});
  assert.deepEqual(chooseBannerSize(dynamic,260),{width:300,height:250});
  assert.throws(()=>validateBanners({enabled:true,banners:[{...dynamic,widget:{...dynamic.widget,container:'body'}}]}));
  assert.throws(()=>validateBanners({enabled:true,banners:[{...dynamic,widget:{...dynamic.widget,trackingCode:'<script>'}}]}));
});
test('partner script loads once for multiple placements and exposes failures',async()=>{
  const scripts=[];
  const win={setTimeout,clearTimeout};
  const doc={head:{append:script=>scripts.push(script)},createElement:()=>({})};
  const load=createCoupangLoader(doc,win);
  const first=load(),second=load();
  assert.equal(first,second);
  assert.equal(scripts.length,1);
  assert.equal(scripts[0].src,coupangScriptUrl);
  win.PartnersCoupang={G:class{}};
  scripts[0].onload();
  assert.equal(await first,win.PartnersCoupang);
  const failedScript=[];
  const failing=createCoupangLoader({head:{append:script=>failedScript.push(script)},createElement:()=>({})},{setTimeout,clearTimeout});
  const failure=failing();
  failedScript[0].onerror();
  await assert.rejects(failure,/failed/);
  assert.equal(failing(),failure);
});
test('hidden sidebars make no ad request and visible widgets keep their own container',async()=>{
  let width=0;
  const aside={hidden:false};
  const frame={style:{},getBoundingClientRect:()=>({width}),querySelector:()=>host};
  const host={parentElement:frame,dataset:{coupangWidget:JSON.stringify(dynamic)},isConnected:true,style:{setProperty:()=>{}},closest:()=>aside};
  const calls=[];
  const scripts=[];
  let visibilityCallback;
  const win={setTimeout,clearTimeout,IntersectionObserver:class{constructor(callback){visibilityCallback=callback;}observe(){}unobserve(){}},addEventListener(){}};
  const doc={querySelectorAll:()=>[host],createElement:()=>({}),head:{append:script=>scripts.push(script)}};
  initialiseCoupangBanners(doc,win);
  visibilityCallback([{isIntersecting:true,target:frame}]);
  assert.equal(scripts.length,0);
  width=300;
  visibilityCallback([{isIntersecting:true,target:frame}]);
  assert.equal(scripts.length,1);
  win.PartnersCoupang={G:class{constructor(options){calls.push(options);}}};
  scripts[0].onload();
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(calls.length,1);
  assert.equal(calls[0].container,host);
  assert.equal(calls[0].width,'300');
  assert.equal(calls[0].height,'250');
  assert.equal(calls[0].id,1038387);
  assert.equal(calls[0].trackingCode,'AF1976226');
  visibilityCallback([{isIntersecting:true,target:frame}]);
  assert.equal(calls.length,1);
  // Desktop uses the newly saved PC ID; the vertical placement uses its own ID.
  for(const [slot,availableWidth,expectedId,expectedHeight] of [['article-middle',728,1038394,'90'],['article-sidebar-top',160,1038395,'600']]){
    const saved=getBanners(slot,'디지털 생활')[0];
    host.dataset={coupangWidget:JSON.stringify(saved)};
    width=availableWidth;
    initialiseCoupangBanners(doc,win);
    visibilityCallback([{isIntersecting:true,target:frame}]);
    await new Promise(resolve=>setImmediate(resolve));
    assert.equal(calls.at(-1).id,expectedId);
    assert.equal(calls.at(-1).width,String(availableWidth));
    assert.equal(calls.at(-1).height,expectedHeight);
  }
  assert.equal(scripts.length,1);
  assert.equal(affiliateDisclosure,'이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.');
});
