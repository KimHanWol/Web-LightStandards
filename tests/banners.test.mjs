import test from 'node:test';
import assert from 'node:assert/strict';
import { validateBanners } from '../src/lib/banners.mjs';
const banner={id:'test-banner',slot:'article-middle',href:'https://link.coupang.com/a/test',alt:'테스트용 상품 안내',desktop:{src:'https://example.com/banner.webp',width:728,height:90},mobile:{src:'https://example.com/mobile.webp',width:300,height:250}};
test('banner configuration rejects scripts, deceptive links and duplicate placements',()=>{
  assert.equal(validateBanners({enabled:false,banners:[banner]}).banners[0].mobile.width,300);
  assert.throws(()=>validateBanners({enabled:true,banners:[{...banner,href:'javascript:alert(1)'}]}));
  assert.throws(()=>validateBanners({enabled:true,banners:[{...banner,href:'https://link.coupang.com@evil.example/banner'}]}));
  assert.throws(()=>validateBanners({enabled:true,banners:[banner,{...banner,id:'second-banner'}]}),/one banner per placement/);
});
