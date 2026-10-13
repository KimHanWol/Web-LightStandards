# LightStandards 브랜드 자산

2026-10-14 수정: 사용자가 고정 생활 주제와 잡지형 브랜드 소개 구성을 거부했습니다. 아래 생성 사진과 기존 편집 구성은 제작 이력으로만 보관하며 현재 홈페이지에서는 사용하지 않습니다. 로고만 유지합니다. 현행 홈페이지는 [Lifewire](https://www.lifewire.com/)의 실제 화면에서 확인한 검색·기사 목록·광고 배치를 참고하며, 해당 매체의 기술 주제를 우리 주제로 가져오지 않습니다. 고정 카테고리, 브랜드 철학 소개, 편집 원칙 페이지와 메뉴는 제거했습니다.

2026-10-13 제작. 기본 제공 `image_gen` 도구를 사용했으며 기존 n8n OpenAI/fal credential 또는 유료 워크플로를 실행하지 않았습니다. 원본은 생성 이미지 보관 폴더에 유지하고, 사이트에 쓰는 최종 자산은 `public/brand/`에 저장했습니다. 사진은 생성된 브랜드 연출 이미지이며 실제 제품 테스트나 사용 경험의 증거가 아닙니다.

| 자산 | 파일 | 용도 |
| --- | --- | --- |
| LS 종이·빛 심볼 | `public/brand/lightstandards-mark.png` | 헤더, 푸터, 편집 원칙 영역 |
| 아이콘 | `public/brand/favicon.png`, `public/brand/apple-touch-icon.png` | 탭·홈 화면 아이콘 |
| 생활 도구 | `public/brand/everyday-hero.webp`, `public/brand/everyday-hero-small.webp` | 첫 화면·생활 도구 주제 |
| 디지털 생활 | `public/brand/digital-tools.webp` | 주제 이미지 |
| 공간과 수납 | `public/brand/quiet-storage.webp` | 주제 이미지 |

사진은 원본 1536×1024을 WebP로 압축했습니다. 대표 이미지의 768×512 버전은 반응형 `srcset`에 연결했습니다. 로고는 투명 PNG이며 한국어 이름은 HTML 텍스트로 표시합니다. 모든 사진의 크기를 예약하고 첫 대표 사진만 우선 로딩합니다. 나머지는 lazy loading을 사용합니다.

참고한 편집 구조: [ROOMIE](https://www.roomie.jp/)의 생활·상품 주제 구분과 [Kinfolk](https://www.kinfolk.com/)의 잡지형 콘텐츠 구성. 방문자 수를 검증하거나 수치로 비교하지 않았습니다. 외부 사진·로고를 복제하지 않았습니다. 인터랙션은 사용자가 제공한 [Emil Kowalski 디자인 스킬](https://github.com/emilkowalski/skills)의 눌림 반응, 짧은 전환, 키보드 초점, 터치 hover 분리, reduced-motion 원칙을 적용합니다.

## 생성 프롬프트

### logo

```text
Use case: logo-brand. Create one original brand symbol for a Korean editorial lifestyle publication called LightStandards / 소소한 기준. Asset: isolated square icon, genuine transparent background, no typography. A refined compact geometric folded paper / open notebook symbol, two interlocking angular shapes suggesting the letters L and S, a small separate warm ochre circle as a point of light near the upper right. Deep forest green #254f42 with a subtle warm ochre #b58349 accent only. Flat solid ink, precise edges, balanced negative space, recognizable at 32px, thoughtful independent magazine identity. One single symbol centered, filling about 80 percent of a square canvas. No logo sheet, no mockup, no text, no watermark, no gradients, no shadows, no 3D, no generic leaf or checkmark.
```

### hero

```text
Use case: photorealistic-natural. Asset: landscape editorial photograph for LightStandards, a Korean journal about considered everyday purchases. An intimate real still life on a warm pale oak table beside a sunlit window: an open unruled notebook with completely blank creamy pages, a dark olive green clothbound book, a small ivory handmade ceramic cup, an unbranded simple brass measuring tool and a natural linen cloth. Objects sit naturally, with a slightly imperfect human arrangement. Soft late morning daylight from the left, long restrained shadows, warm off-white wall. Camera at 40-degree angle from above, carefully composed landscape 3:2, objects occupy the lower center and right with breathing room above. Contemporary independent print magazine photography, subtle real grain, tactile paper and wood, muted olive / oatmeal / honey palette, realistic photograph not render. No words, no logos, no fake handwriting, no humans, no lush decorative plant, no overwhelming props, no CGI aesthetic.
```

### digital

```text
Use case: photorealistic-natural. Asset: 3:2 landscape editorial category photograph for a Korean everyday technology magazine. Close still life of unbranded over-ear headphones in dark olive gray, a plain aluminum portable keyboard and one neatly looped ivory USB cable on a warm gray work table. Small natural imperfections, understated objects, no screens or lit displays, tactile real materials. Soft window daylight and calm asymmetric composition, shallow yet useful depth of field, contemporary printed lifestyle magazine, muted forest green and warm neutral palette. Natural photograph, no words, no brands, no people, no dramatic gradient, no CGI, no glossy luxury advertisement.
```

### storage

```text
Use case: photorealistic-natural. Asset: 3:2 landscape editorial category photograph for a Korean journal about thoughtful small-space living. A quiet close-up of a real warm oak open shelf: one ivory fabric storage basket, two neatly folded natural linen towels, one small matte ceramic vase without flowers, a narrow stack of plain cream notebooks. The objects occupy different levels of a practical compact shelf. Side daylight, warm shadows, tactile wood grain, gentle asymmetry and lived-in realism. Muted sand / oatmeal / olive palette, tasteful independent print magazine photograph. No text, no people, no visible brands, no artificial 3D or hyper-perfect AI render, no unnecessary decoration.
```

