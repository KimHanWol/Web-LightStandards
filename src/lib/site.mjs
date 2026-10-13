export const site = {
  name: '소소한 기준', englishName: 'LightStandards', tagline: '정보 블로그',
  description: '궁금한 내용을 검색하고 주제별 글을 찾아볼 수 있는 정보 블로그, 소소한 기준.',
  url: import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321',
  ready: import.meta.env.PUBLIC_SITE_READY === 'true',
  email: import.meta.env.PUBLIC_CONTACT_EMAIL || 'linkingmain@gmail.com'
};
