# 소소한 기준 연결과 운영

## 사용자가 제공하거나 연결할 항목

| 항목 | 용도 | 현재 상태 |
| --- | --- | --- |
| GitHub 저장소 주소 | 코드·승인 원고·Markdown·이미지 저장, 자동 빌드 | KimHanWol/Web-LightStandards 연결 |
| n8n GitHub credential | 승인 원고 JSON을 저장소 main 브랜치에 저장 | 미연결 |
| Cloudflare 계정·Account ID·API token | Workers 정적 자산 배포 | 미연결 |
| 도메인 | 최종 사이트 주소 | 미지정; 먼저 Workers 기본 주소로 검증 가능 |
| 공개 문의 이메일 | 문의·오류 제보 | 미지정 |
| Google Ads Keyword Planner 자료 | 월간 키워드 후보 분석 | 미연결 |
| Search Console | 색인·실제 검색어·검색 성과 확인 | 사이트 배포 후 연결 |
| 쿠팡 파트너스 계정·검토된 링크 | 제휴 수익 | 미연결 |
| AdSense 게시자 ID·광고 슬롯 | 승인 후 광고 표시 | 미등록 |

키·token·비밀번호를 채팅이나 Git에 저장하지 않습니다. n8n에는 credential로, Cloudflare 배포 키에는 GitHub Actions secret을 사용합니다. OpenAI·fal credential은 이미 재사용하고 있으며 새 계정을 만들 필요가 없습니다. 각 서비스의 실제 잔액·결제 상태는 별도로 확인해야 합니다.

## GitHub와 Cloudflare

1. 현재 폴더의 Git 원격 `origin`은 `https://github.com/KimHanWol/Web-LightStandards.git`입니다. 이 저장소의 `main`을 사용합니다.
2. n8n의 `Commit Approved Article` 노드에 GitHub credential을 연결합니다. Fine-grained token을 쓰면 해당 저장소의 Contents 읽기·쓰기로 범위를 제한합니다. 원고 JSON을 저장할 권한이며 계정 전체에 대한 권한은 필요하지 않습니다.
3. GitHub 저장소 Settings → Secrets and variables → Actions에서 secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`를 저장합니다. 배포 token은 대상 Cloudflare 계정의 Workers Scripts 편집 권한으로 시작합니다. 커스텀 도메인은 Cloudflare 대시보드에서 연결합니다.
4. Actions variables에 `PUBLIC_SITE_URL`(최종 HTTPS 주소), `PUBLIC_CONTACT_EMAIL`을 입력합니다. `SITE_PUBLISH_ENABLED`는 배포 설정이 준비된 뒤 `true`로 설정합니다.
5. 운영자·문의·개인정보 문구를 실제 운영 내용에 맞게 확인하고 `config/publication.json`의 `reviewed`를 `true`로 변경합니다. 현재 정책은 광고·분석 비활성을 설명합니다. 광고나 분석 서비스를 켜기 전에 해당 서비스 처리 내용을 업데이트해야 합니다.
6. GitHub Actions에서 `Publish LightStandards`을 수동 실행해 첫 배포를 확인합니다. Wrangler의 Worker 이름은 `lightstandards`입니다.
7. n8n 발행 보조의 `Configuration`에 `repo_owner`, `repo_name`, `site_url`을 입력하고 배포 연결 확인 후 `enabled=true`로 설정합니다.

`PUBLIC_SITE_READY=false` 상태에서는 robots와 meta robots가 색인을 막습니다. 배포 작업은 준비된 설정으로 `PUBLIC_SITE_READY=true`를 적용합니다. Astro 자체 구독료는 없지만 AI 사용료, 도메인, 기존 n8n 요금과 GitHub Actions·Cloudflare 사용량에 따른 비용은 별도입니다. 시간당 배포를 선택하면 GitHub Actions의 빌드 시간 한도도 확인하세요.

## 저장된 n8n 워크플로

| 워크플로 | 역할 | ID |
| --- | --- | --- |
| [Blog - 소소한 기준](https://qkqk9898.app.n8n.cloud/workflow/HUqCE3BE3JSNPhI3) | 매시 정각에 ready 원고 1개를 선택해 초안·이미지 요청 준비 | HUqCE3BE3JSNPhI3 |
| [Blog - 소소한 기준 [Util] - Image Results](https://qkqk9898.app.n8n.cloud/workflow/FeZGGPZKq5IFwDJ9) | 매시 10분에 기존 fal 결과 조회 | FeZGGPZKq5IFwDJ9 |
| [Blog - 소소한 기준 [Util] - Approve Article](https://qkqk9898.app.n8n.cloud/workflow/FQg1yF0O4shWkDbQ) | 검토한 현재 revision을 수동 승인 | FQg1yF0O4shWkDbQ |
| [Blog - 소소한 기준 [Util] - Publish Approved](https://qkqk9898.app.n8n.cloud/workflow/yihoqk3fpBOC8P04) | 매시 20분에 승인 원고 저장 또는 실제 배포 상태 확인 | yihoqk3fpBOC8P04 |

모두 현재 비활성입니다. 이름 변경으로 활성화·유료 실행·공개 게시를 수행하지 않았습니다. 일정은 Asia/Seoul 기준이며 각 실행 제한은 300초입니다. 자료 테이블 ID는 `d0S98phwvzjPal6X`, 이름은 `Blog - 소소한 기준 - Articles`입니다.

## 키워드와 근거 준비

월 1회 Keyword Planner에서 지역·언어·기간을 고정해 검색량과 광고 입찰 자료를 가져오고 후보를 저장합니다. 광고주 경쟁도는 검색 결과의 블로그 경쟁도를 뜻하지 않습니다. 블로그 경쟁은 실제 검색 결과에서 문서의 관련성·깊이·최신성을 따로 확인합니다. CPC·상단 입찰가는 제휴 수익이나 AdSense RPM을 보장하지 않습니다.

현재 워크플로는 자료 테이블에 준비된 주제와 출처를 읽습니다. 키워드 API 자동 수집과 월간 CSV 자동 수입은 아직 연결되지 않았습니다. 검색량을 추정해 빈칸을 채우지 않습니다. Search Console이 연결되면 주간 성과를 바탕으로 기존 글 보강과 다음 월의 주제 선정을 조정합니다.

원고 행에는 다음 항목을 먼저 입력합니다.

- `article_id`: 영문 소문자·숫자·하이픈으로 된 고유 ID. 최대 90자.
- `intent_key`: 중복 질문을 구분할 고유 검색 의도.
- `keyword`, `category`: 실제 분석한 주제와 홈페이지 카테고리.
- `sources_json`: 최소 서로 다른 2개 URL, 편집자가 작성한 근거 요약, 확인일, `reviewed=true`. 요약 합계 2,000자 이상, 각 300자 이상. 출처 원문 전체를 복사하지 않습니다.
- `affiliate_json`: 검토한 쿠팡 링크 배열. 없으면 `[]`.
- `status`: 충분한 근거를 확인하기 전에는 `candidate`, 준비 완료 시 `ready`.

출처 구조 예시는 아래와 같습니다. 예시 URL과 내용은 실제 근거로 사용하지 않습니다.

```json
[{"title":"자료 제목","url":"https://example.com/source","checkedAt":"2026-10-13","reviewed":true,"excerpt":"편집자가 확인한 사실과 적용 조건을 정리한 근거 요약"}]
```

## 생성·검토·발행

본체 Configuration의 기본값은 `paid_enabled=false`, 하루 최대 2건, 월 생성 예산 7 USD, 요청 전 예약 0.08 USD입니다. 매시간 작동하더라도 하루 한도에 도달하면 새 원고를 생성하지 않습니다. 시간당 1건 전체 생성으로 전환하려면 자료 공급·품질을 확인한 뒤 일일 한도와 월 예산을 함께 조정합니다. 이 예산은 해당 테이블에 기록된 이 파이프라인의 사용액만 계산하며 OpenAI·fal 계정 전체의 결제 한도를 제어하지 않습니다.

한 글은 GPT-4.1 mini의 JSON 초안과 fal Flux Schnell의 설명 이미지 2개(1024×768 WebP)로 구성합니다. 본문 5,000자, 출처 링크, 최소 3개 H2, 중복 문단·HTML 검사를 통과한 초안만 이미지 요청으로 진행합니다. 프롬프트는 자연스러운 한국어 문체와 자체 편집을 요구하지만 독창성·사실성·문체를 기계 검사만으로 보장하지는 않습니다.

`needs_review` 원고의 내용·출처·이미지·제휴 고지를 검토한 뒤 승인 보조 Configuration에 `article_id`, 현재 `revision`, `approved_by`, 선택적 `scheduled_at`을 입력하고 수동 실행합니다. 예약 시간에는 시간대를 포함한 ISO 형식을 씁니다. 승인 데이터는 내용을 고정한 `publish_payload`에 저장되며 승인 뒤 원고가 바뀌면 발행을 차단합니다.

발행 보조는 승인 파일을 `content/inbox/<article_id>-r<revision>.json`으로 GitHub에 저장합니다. Actions가 이를 검증하고 이미지를 프로젝트에 보존한 다음 Markdown과 HTML을 만듭니다. Git commit 뒤 상태는 `publishing`이며, 실제 사이트의 `/publication.json`에서 같은 revision을 확인해야 `published`가 됩니다. 빌드·이미지 다운로드 실패 시 공개 완료로 처리하지 않습니다.

## 오류 처리와 비용

- 유료 요청은 자동 재시도하지 않습니다. 통신 결과가 불확실하면 예약 예산과 실행 기록을 남깁니다.
- `generation_started`, `image_submitting`, `image_uncertain`이 오래 남으면 n8n 실행 기록과 서비스 요청 ID를 먼저 확인합니다. 확인 없이 `ready`로 되돌리면 재과금될 수 있습니다.
- `image_pending`은 저장된 fal 요청을 GET으로 조회합니다. 이미지 오류를 해결하려고 새 요청을 자동으로 만들지 않습니다.
- GitHub 저장이 불확실하면 해당 inbox 파일과 Actions를 확인합니다. 저장된 파일이 있으면 Actions 재실행으로 배포를 복구할 수 있습니다. 파일이 없다는 사실을 확인한 경우에만 원고 상태를 승인 상태로 되돌립니다.
- 생산 실행과 수동 실행을 동시에 시작하지 않습니다. 조건부 행 갱신은 같은 원고의 중복 실행을 줄이지만, 서로 다른 원고의 동시 예약까지 전역으로 잠그는 분산 잠금은 아닙니다.

## 검증 결과와 남은 확인

로컬 콘텐츠·비용 제한·주소 검사 테스트 7개와 Astro 빌드가 통과했습니다. n8n 모의 실행에서 초안 검사, fal 수신·결과 검사, revision 승인, 발행 준비·실제 배포 확인 경로를 검증했습니다. 테스트는 AI·HTTP·GitHub·테이블 쓰기를 가짜 결과로 대체했습니다. 실제 유료 생성, GitHub 저장, Cloudflare 배포와 공개 광고는 연결 정보가 준비된 뒤 별도로 검증해야 합니다.

첨부된 승인 사례의 독창적이고 실질적인 정보, 명확한 탐색, 정책 페이지, 모바일 가독성과 빠른 로딩을 반영했습니다. 글자 수와 특정 재신청 기간을 공식 AdSense 승인 조건으로 취급하지 않습니다. 실제 사이트 전체가 심사 대상입니다.
