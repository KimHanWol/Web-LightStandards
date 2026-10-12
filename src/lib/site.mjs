export const site = {
  name: '소소한 기준', englishName: 'LightStandards', tagline: '잘 고르고, 오래 쓰는 생활.',
  description: '제품의 조건과 차이를 살펴보고, 내 생활에 맞는 선택을 돕는 쓸모 있는 기록.',
  url: import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321',
  ready: import.meta.env.PUBLIC_SITE_READY === 'true',
  email: import.meta.env.PUBLIC_CONTACT_EMAIL || 'linkingmain@gmail.com'
};
