# LightStandards 도메인과 호스팅

2026-10-13 확인. 한국어 브랜드는 소소한 기준, 영어 브랜드는 LightStandards입니다.

중고미 저장소의 README에는 junggomi.com을 Cloudflare Registrar에서 구매하고 웹을 Vercel에 배포했다고 기록되어 있습니다. 공개 .com 레지스트리 RDAP에서도 등록 대행자는 Cloudflare, Inc.이며 네임서버는 Cloudflare로 확인됐습니다. 이 확인으로 현재 웹 호스팅의 운영 이전 여부까지 단정하지는 않습니다.

| 역할 | 중고미의 문서상 구성 | LightStandards 준비 구성 |
| --- | --- | --- |
| 도메인 등록·갱신 | Cloudflare Registrar | 같은 계정·업체에서 새 도메인 등록 가능 |
| DNS 관리 | Cloudflare | Cloudflare |
| 웹사이트 제작 | Next.js | Astro 정적 빌드 |
| 웹사이트 호스팅 | Vercel | Cloudflare Workers Static Assets |

Cloudflare에서 새 도메인을 구매해 기존 계정에서 관리하는 구성이 관리 측면에서 간단합니다. 도메인 등록과 갱신 요금은 홈페이지 호스팅과 별개입니다. 실제 후보 도메인의 등록 가능 여부와 구매 가격은 아직 확인하지 않았으며 구매도 실행하지 않았습니다.

현재 사이트는 서버 측 처리 없이 정적 파일로 동작합니다. Cloudflare 공식 문서는 정적 자산 요청은 무료·무제한이라고 안내합니다. Worker 코드를 추가해 실행하는 요청은 별도 사용량 규칙을 따르며, 파일 수·파일 크기·배포 한도도 있습니다. 이미지 생성비와 GitHub Actions 빌드 시간은 이 무료 정적 호스팅에 포함되지 않습니다.

Workers의 커스텀 도메인은 해당 도메인이 Cloudflare에서 활성 zone이어야 합니다. 다른 업체에서 구매한 도메인도 Cloudflare DNS에 연결해 사용할 수 있습니다. Cloudflare Registrar에서 구매하면 도메인 관리와 DNS 설정을 같은 서비스에서 할 수 있습니다.

먼저 기본 workers.dev 주소로 실제 배포를 검증하고, 도메인이 정해지면 최종 주소와 canonical·사이트맵·n8n 발행 확인 주소를 함께 맞춥니다. 새 사이트 도메인을 연결하는 작업은 중고미 도메인의 DNS 레코드를 변경하지 않습니다.

출처:

- [중고미 README](../../Web/Junggomi/README.md): 로컬 저장소 구성 확인. 이 상대 링크는 다른 컴퓨터에서는 열리지 않을 수 있습니다.
- [junggomi.com 공개 등록 정보](https://rdap.verisign.com/com/v1/domain/junggomi.com)
- [Cloudflare Registrar](https://www.cloudflare.com/domains/)
- [Workers Static Assets 과금·한도](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- [Workers Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
