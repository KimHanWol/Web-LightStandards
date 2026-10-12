# 수익형 블로그의 저비용 n8n 운영 구조

조사 기준: 2026-10-12. 실제 워크플로 생성·명명·활성화, 사이트 개설, 유료 API 호출은 하지 않았다. 아래 설계와 예산은 제안이며 실행 결과나 수익 예측이 아니다.

## 어떤 게시 플랫폼과 저장 구조가 가장 간단한가?

### Takeaway
초기 기본안은 **자체 도메인 + 관리형 WordPress + 기존 n8n + n8n Data Tables**다. Markdown 원본은 보존하되 WordPress에 보낼 때 HTML로 변환한다. Astro는 개발자 유지보수가 편하고 파일 기반 배포를 특별히 원하는 경우의 대안이다.

### Cited Findings
- n8n WordPress 노드는 글 생성·조회·수정을 지원하고, 미지원 기능은 HTTP Request 노드로 서비스 API를 호출할 수 있다. — [n8n WordPress](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.wordpress/)
- n8n Markdown 노드는 Markdown→HTML 및 HTML→Markdown 변환을 지원한다. — [n8n Markdown](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.markdown/)
- WordPress REST API `POST /wp/v2/posts`는 `content`, `slug`, `featured_media`, `categories`, `tags`, `status`를 받고, 상태에는 draft, pending, future, publish가 있다. — [WordPress Posts](https://developer.wordpress.org/rest-api/reference/posts/)
- WordPress는 HTTPS에서 Application Password를 이용하는 REST 인증을 공식 지원한다. — [WordPress authentication](https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/)
- 이미지 업로드 endpoint `POST /wp/v2/media`와 이미지 대체 텍스트·캡션 필드가 제공된다. — [WordPress Media](https://developer.wordpress.org/rest-api/reference/media/)
- n8n Data Tables는 프로젝트 내 지속 저장, 중복 실행 방지 마커, AI 평가 데이터를 다룰 수 있다. 경량~중간 규모 저장용이며 현재 문서 기준 기본 총 한도는 200 MiB다. CSV 내보내기가 가능하고, 프로젝트 구성원이 기본적으로 테이블을 볼 수 있다. — [n8n Data Tables](https://docs.n8n.io/build/work-with-data/data-tables.md)
- Astro content collections는 Markdown 파일과 스키마를 지원한다. 빌드 시점 컬렉션과 실행 시점 live collections를 구분하며, 후자는 별도 loader/adapter와 캐시 고려가 필요하다. — [Astro content collections](https://docs.astro.build/en/guides/content-collections/)
- Ghost Admin API는 Lexical 문서 또는 `?source=html`로 게시물을 생성한다. HTML→Lexical 변환은 원본과 달라질 수 있다고 공식 문서가 설명한다. — [Ghost post creation](https://docs.ghost.org/admin-api/posts/creating-a-post)
- 네이버는 블로그 글쓰기 Open API를 2020-05-06 종료했다. 반복·기계적 유사 글 대량 발행 등의 정책 위반이 종료 배경으로 명시되어 있다. 현재 검색 API와 글쓰기 API를 혼동해서는 안 된다. — [네이버 종료 공지](https://developers.naver.com/notice/article/7527)
- 네이버 블로그의 창작자 광고 수익 분배는 애드포스트 등록과 노출 영역을 통해 설명된다. — [네이버 광고 노출 안내](https://help.naver.com/service/5593/contents/8392?lang=ko)

### Inferences
- 추천 이유는 수익 보장이 아니라 편집·검수·예약·수정의 운영 편의다. WordPress 관리자에서 사람이 실제 초안을 보고 수정하고 승인할 수 있어 별도 CMS나 승인 대시보드를 만들 필요가 적다. 경량 테마 하나, SEO 플러그인 하나 정도로 시작하고 호스팅에 백업/캐시 기능이 있으면 중복 플러그인을 추가하지 않는다. 광고 삽입 권한과 REST 접근을 허용하는 관리형 호스팅인지 계약 전에 확인한다.
- Astro + Markdown + Git + 정적 호스팅은 빠르고 파일 버전관리에 유리하다. 다만 비개발자 편집, 예약 발행, 빌드 실패 복구, 이미지 저장, 광고 배치, 배포 이벤트를 추가로 설계해야 한다. 이 사용자의 우선순위인 쉬운 세팅·유지보수에서는 2순위다. Git 기반 정적 배포도 가능하다는 설명과 실제 추천안을 구분한다.
- Ghost는 좋은 발행 CMS 후보이나, 현재 목표는 구독 뉴스레터보다 광고와 상품 제휴이며 WordPress 연동이 더 직접적이므로 3순위로 둔다. 특정 CMS가 SEO나 수익을 자동으로 높인다고 단정하지 않는다.
- 네이버는 필요하면 별도 편집한 요약/경험 글을 올리는 보조 채널로 쓸 수 있다. 자동 대량 게시의 본체는 자체 사이트에 둔다. 네이버 유입이 자체 사이트보다 적다거나 자체 사이트 수익이 무조건 더 크다는 증거는 없다.
- 첫 버전에 Postgres·Redis·벡터 DB·헤드리스 CMS·자체 검색 서비스를 모두 넣지 않는다. Data Tables에는 작업 상태, 키워드, 출처 요약, 콘텐츠 원본 참조, 게시 URL, 비용만 둔다. 이미지 binary나 전체 웹페이지 수집본은 넣지 않는다. Markdown 원본과 버전별 JSON을 비공개 저장소/백업에 보관한다. 기존 Git 또는 백업 저장소가 있으면 재사용한다.
- 본문 전체와 오래된 출처 원문을 계속 저장하거나 여러 작업자가 동시에 claim해야 하는 단계가 되면 Postgres로 이전한다. MVP Data Tables가 트랜잭션 lock을 보장한다고 가정하지 말고 게시 작업자를 하나만 운용한다.
- 원본 스키마 제안: `article_id`, `revision`, `intent_key`, `keyword_cluster`, `target_query`, `title`, `slug`, `markdown`, `sources[{url,title,checked_at,supported_claims}]`, `images[{prompt,model,request_id,license_checked_at,media_id,alt}]`, `disclosure`, `review_status`, `reviewer`, `reviewed_at`, `cms_post_id`, `published_url`, `token_usage`, `cost_usd`. 원본 revision은 덮어쓰지 않고 새 revision을 만든다. 공개 Markdown frontmatter에 API 키나 내부 검수 메모를 넣지 않는다.

### Gaps
- 사용자의 기존 n8n 배포 방식, 호스팅 보유 여부, 편집 담당자의 기술 선호는 아직 모른다. 따라서 관리형 WordPress는 추천 기본값이며 확정 구매 사양이 아니다.
- 광고 승인률, 특정 CMS별 RPM, 네이버 대비 동일 글의 실제 유입 차이를 뒷받침할 사용자 데이터가 없다.

## 매시간 자동화를 어떻게 검수와 연결하고 장애를 통제하는가?

### Takeaway
매시간 실행되는 것은 작업 큐 처리다. 승인된 원고가 있을 때만 한 편을 발행하고 없으면 건너뛴다. 키워드 발견, 저렴한 초안 작성, 사실 확인, 사람 검수, 예약 발행, 성과 기반 갱신을 분리한다.

### Cited Findings
- Google Publisher Policies는 게시자 콘텐츠가 없거나 저가치인 화면에서 Google 광고를 허용하지 않는다. 자동 생성 콘텐츠에 수동 검토나 큐레이션 없이 광고를 배치하지 말라는 구체적 팁을 제공한다. — [Google Publisher Policies](https://support.google.com/publisherpolicies/answer/11112688)
- fal은 비동기 queue 제출 후 status polling 또는 webhook으로 결과를 받는 방식을 권장한다. 응답에 `request_id`, status/result URL이 있고 request ID 보관을 권고한다. 결과 미디어 URL은 만료 설정의 영향을 받으므로 보존할 파일은 별도 저장해야 한다. — [fal asynchronous inference](https://fal.ai/docs/documentation/model-apis/inference/queue)
- fal `fal-ai/flux/schnell`의 공식 페이지에는 상업 이용 가능 표시와 $0.003/MP, 메가픽셀 올림 청구가 명시되어 있다. — [fal FLUX.1 schnell](https://fal.ai/models/fal-ai/flux/schnell)

### Inferences
- 아래는 논리 단계 이름이며 실제 n8n workflow 이름을 새로 만들거나 저장한 것이 아니다.
  1. **수집:** 매일/주간 키워드 배치를 가져와 기존 `intent_key`와 대조한다. 같은 질문이면 기존 글 업데이트 후보로 보내고 제목만 다른 새 글을 만들지 않는다.
  2. **선별:** 주제 적합성·예상 유입·실제 검색결과 경쟁·수익화 적합성·근거 확보 가능성으로 점수화한다. 검수 가능량과 예산을 넘으면 생성하지 않는다.
  3. **근거 수집:** 공식 자료를 우선 확보하고 URL, 확인 시각, 수치와 근거 연결을 저장한다. SERP는 일괄 조회·캐시하고 모든 글에 중복 호출하지 않는다. 경쟁 글의 문장을 재조합하는 방식은 배제한다.
  4. **구조/초안:** 값싼 모델로 소제목과 비교 기준을 먼저 만들고 근거가 충족되는 경우 본문을 생성한다. 비싼 모델은 모순 해결이나 난도가 높은 일부 원고에만 사용한다. 매 단계 무제한 agent loop는 두지 않는다.
  5. **자동 검사:** 출처 없는 수치·가짜 경험·브랜드/제품명 오류·비슷한 글·끊어진 링크·과도한 광고·마크다운 구조를 검사한다. 5,000자 요구는 토큰이 아니라 렌더링된 본문 텍스트의 Unicode 문자 수로 검사하고 공백 포함/제외를 별도 기록한다. HTML 태그, frontmatter, 이미지 URL, 반복 면책문구로 글자 수를 채우지 않는다. 5,000자 이상이 어려운 얇은 주제는 확장 가능한 큰 질문으로 묶거나 보류한다.
  6. **이미지:** 텍스트 검사 통과 후에만 fal로 1~2장을 생성한다. 설명용 일러스트에 사용하고 실물 사용 사진·실험 증거·제품 외형을 조작한 리뷰 자료로 사용하지 않는다. 실제 상품 이미지는 사용권이 확인된 제공 자료를 이용한다. 제품 수치·가격·표의 글자는 이미지 생성 모델에 맡기지 않고 HTML로 출력한다.
  7. **초안 등록:** fal 결과를 WordPress Media에 보관하고 WebP/크기/alt를 정리한다. Markdown→HTML 후 허용 태그/속성만 남기는 sanitization을 적용한다. 원고에 들어온 임의 script/iframe은 차단한다. 광고 코드는 관리자가 선택한 템플릿에서만 넣는다. WordPress에는 draft/pending으로 저장한다.
  8. **사람 검수:** 실제 미리보기에서 근거, 고유 가치, 글의 사실성, 광고 표기, 이미지, 모바일 가독성을 확인한다. 승인자/시각/원고 revision을 기록한다. 승인 후 내용이 바뀌면 다시 검수 대상으로 돌린다. 모델의 자기검증 통과를 사람 검수와 동일하게 취급하지 않는다.
  9. **매시간 발행:** Asia/Seoul 기준으로 approved 큐의 원고 한 편만 처리한다. 초기에 하루 1~3편 같은 낮은 상한을 두는 것은 운영 실험 제안이지 검색엔진 공식 안전 수치가 아니다. 큐가 비거나 상한에 도달하면 종료한다. WordPress future 예약을 쓰는 경우 호스팅의 실제 cron을 확인하고 발행 누락을 재조회한다.
  10. **확인/학습:** 게시 API 성공 후 실제 URL HTTP 200, 대표 이미지, 제목/본문, canonical, noindex 설정 등을 확인한다. 발행 성공은 검색 색인을 보장하지 않는다. Search Console·분석·제휴 실적을 URL과 주제군 단위로 연결해 기존 글을 개선한다. 원고별 순이익과 검수 시간도 측정한다.
- 보조 상태 머신: `candidate → researched → drafted → qa_passed → human_approved → scheduled → published`와 `needs_review/failed`. `intent_key + article_revision + action`으로 중복 방지 키를 만든다. 생성과 게시의 상태·ID를 저장하고 실패 시 실패 단계부터 이어간다.
- WordPress 게시 응답이 끊기면 재전송 전에 저장된 post ID 또는 결정적 slug로 조회한다. 이미 생성된 draft가 있으면 update한다. 매시간 동일 글이 복제되지 않게 하는 것이 핵심이다.
- fal timeout 후에는 저장된 request ID로 상태를 조회한다. 같은 prompt를 무조건 재제출하면 중복 이미지 비용이 난다. 요청 단계가 불확실하면 수동 확인 큐로 보낸다. 429/5xx에만 제한된 지수 backoff를 적용하고 4xx 원고/인증 오류는 멈춘다. 재시도 2회, 이미지 재생성 1회, 원고당 비용 상한, 하루/월 budget hard stop 같은 작은 제한부터 둔다.
- credential은 n8n credential store에 두고 원고/로그에 넣지 않는다. WordPress에는 필요한 게시 권한의 전용 계정과 Application Password를 쓰며 관리자 암호를 재사용하지 않는다. 원문과 생성 HTML은 외부 입력으로 취급한다. 백업에는 Markdown·상태 테이블·WordPress DB/미디어를 포함하고 복구를 확인한다.
- 검증된 동일 소재의 수정이 신규 글보다 비용 대비 나은지 비교한다. 관찰 데이터가 적은 시작 단계에서 자동 삭제나 대량 재작성은 하지 않는다. 상위 노출이 되었는데 CTR이 낮으면 제목/요약부터, 노출은 적지만 구매 전환이 좋으면 관련 질문 묶음부터 개선한다.

### Gaps
- 이미지 모델 품질은 주제별 샘플 검증 전이라 schnell을 모든 글에 적합하다고 단정할 수 없다. 상업 이용 표시가 타인의 상표·초상·저작권까지 자동 해결한다는 뜻도 아니다.
- 검수 처리량과 작업당 실제 토큰 수가 아직 없다. 24편/일은 기술적 처리량보다 편집 검수량이 먼저 제약할 가능성이 크다.

## 월 720편을 만들면 얼마가 들고 어느 지표로 증설하는가?

### Takeaway
이미지 비용만 보면 2장/글도 낮게 잡을 수 있지만, 키워드/SERP 데이터, 관리형 호스팅, 실패 재시도, 사람이 검수하는 시간이 총원가를 좌우한다. 비용과 손익분기 예시는 산식 이해용이며 실제 견적·트래픽·수익 전망이 아니다.

### Cited Findings
- fal schnell은 $0.003/MP이고 올림 청구다. 1024×768 한 장은 1 MP 미만이므로 1 MP 청구 전제에서 장당 $0.003으로 계산 가능하다. 실제 주문 설정과 청구 기록은 별도로 확인해야 한다. — [fal schnell pricing](https://fal.ai/models/fal-ai/flux/schnell)
- n8n Cloud Starter 공식 가격은 연간 결제 기준 €20/월, 2,500 workflow executions이며 step 수는 무제한이다. 실행 수를 세지 않고 '한 시간에 한 번이니 무조건 충분'이라고 할 수 없다. — [n8n pricing](https://n8n.io/pricing/)

### Inferences
- 30일×24시간 = 720편/월. 31일은 744편이다. 이 숫자는 최대 처리량 예시이며 권장 초기 발행량이 아니다.
- 이미지 예시: 720편×2장×$0.003 = **$4.32/월**, 재생성 10%면 $4.752. 1200×800도 1 MP 미만이다. 1024×1024는 정확히 1,000,000픽셀을 넘으므로 임의로 1 MP 청구라고 약속하지 않는다. 고해상도, 다른 모델, 재생성, 저장/전송료는 별도다.
- 글 생성 비용 산식: `월 글 수 × (글당 전체 입력 토큰×입력 $/100만 + 글당 전체 출력 토큰×출력 $/100만) / 1,000,000`. 초안뿐 아니라 계획·검증·재작성 전체 호출을 더한다. 5,000 한글 문자와 5,000 토큰은 같은 단위가 아니므로 10~20개 샘플의 실사용 토큰을 측정한다.
- 모델 비지정 산식 예시: 모든 단계 합산 입력 20,000·출력 10,000토큰/글, 가상의 단가 입력 $0.25/100만·출력 $1.50/100만이라면 $0.020/글, 720편에서 $14.40. 이 단가는 현재 특정 상품의 공시 가격이 아니고 계산 시나리오다. 추론 토큰·캐시·도구 과금 방식이 다른 모델이면 산식을 수정한다.
- 총비용 예산 시나리오(모두 USD, 실제 업체 견적 아님): 관리형 WP $15 + 도메인 월환산 $1.50 + 기존 n8n 인프라 배분 $10 + LLM 예산 $15 + 검색/SERP 예산 $20 + 이미지 $4.32 + 재시도/기타 예비비 $5 = **월 $70.82**. 저장이 호스팅에 포함된다고 가정했고 별도 object storage/트래픽/세금/환율·상용 플러그인/노동비는 제외했다. 기존 n8n 여유 자원이 있으면 현금 증가분은 더 작을 수 있지만 원가 배분 자체를 0이라고 취급하지 않는다. 새 Cloud 도입이면 $10 가정 대신 실제 €20 이상 계획을 환산해 넣는다.
- n8n 실행량 예시: 초안 720 + 이미지 완료 callback 720(두 이미지를 한 요청으로 묶은 경우) + 시간별 publisher 720 = 2,160회. 두 이미지를 따로 호출해 callback 두 번이면 2,880회로 Starter 2,500회를 넘는다. 일별 연구, 검수 event, retry, 상태 점검을 추가해야 한다. 최소 플랜 충분 여부는 실제 workflow execution 정의와 계측으로 결정한다. 단순 단계는 한 실행 안에 묶되 긴 대기는 비동기로 설계한다.
- 사람 검수 비용은 위 예산에 없다. 글당 5분만 가정해도 720편은 월 60시간, 10분이면 120시간이다. 이것은 적정 검수시간의 주장도 아니고 시간당 시급 가정도 아니다. 자동화가 편집시간을 0으로 만들지 않는다는 산술 예시다. 초기는 월 60편 정도로 품질·체류·색인·클릭·원가를 측정하고 큐와 예산을 늘리는 편이 관리 가능하다.
- 단순 손익분기: `필요 월 PV = 월 총원가 / (순 광고 RPM + 순 제휴수익/1000PV) ×1000`. 위 현금성 비용 $70.82를 광고만으로 충당한다고 할 때 가상의 page RPM $2/$5/$10 각각 35,410/14,164/7,082 PV가 필요하다. 이것은 실제 예상 RPM이 아니다. 페이지뷰·세션·검색 클릭을 섞지 않는다.
- 제휴 산식: `상품 글 PV × 외부링크 클릭률 × 구매 전환율 × 평균 인정 주문금액 × 적용 수수료율 × (1−취소/반품 비율)`. 모든 변수는 실제 정산 데이터로 바꾸고, 광고와 제휴가 함께 있는 페이지에서는 광고가 구매 클릭을 떨어뜨리는지도 비교한다. 높은 방문 수만으로 순이익이 높은 것은 아니므로 유입 규모를 1차 목표로 두되 페이지당 수익과 글당 원가를 함께 본다.
- 운영 증설 조건 제안: 발행 수가 아니라 검수 후 원고 비율, 사이트 색인/유입의 증가, 28일·90일 주제군 성과, 원고당 실제 총원가, 제휴 순정산, 검수 부담을 보고 확장한다. 초기 낮은 트래픽에서 수익성과 검색 순위를 확정적으로 평가할 수 없으므로 충분한 관찰기간과 표본이 필요하다.

### Gaps
- 실제 WordPress 업체·요금제, SERP 공급사, 선택 LLM, VAT/통화, 인건비가 미정이다. $70.82는 전체 항목을 빠뜨리지 않기 위한 제어 가능한 예산 사례이지 확정 월요금이 아니다.
- 게시 후 실제 트래픽과 수익 자료가 없으므로 손익분기 도달기간과 월 수익을 추정하지 않는다.
