# 한국어 수익형 블로그의 키워드·트래픽·수익 전략

## 1. 어떤 키워드 데이터를 확보할 수 있으며 현재 접근 범위는 어디까지인가?

### Takeaway
2026-10-12 공개 공식 문서 확인 기준. 사용자 표현의 ‘구글 키워드 파트너’는 Google Ads의 Keyword Planner(키워드 플래너)로 보는 것이 합리적이다. 초기에는 플래너 CSV와 네이버 키워드 도구 내보내기를 입력으로 쓰고, 성과가 확인된 뒤 API를 붙이는 구성이 저비용이다. 이번 조사에서 사용자의 광고 계정·인증 정보에 접속하거나 실제 키워드 검색량을 조회하지 않았다.

### Cited Findings
- Keyword Planner는 월 검색량 추정치와 키워드 제안을 제공한다. 현재 공식 도움말은 계정 설정 완료 및 결제 정보 입력이 접근 조건이라고 명시한다. 이는 조사자가 광고를 집행해도 된다는 뜻이 아니다. 짧은 본문 인용: “You must complete your account setup by entering your billing information.” (2026-10-12 본문 확인) — [Google 도움말](https://support.google.com/google-ads/answer/7337243?hl=en)
- 월간 검색량은 설정한 지역·검색 네트워크·기간에서 해당 검색어와 유사 변형을 묶은 평균이며 반올림된다. Competition은 광고주 경쟁도이고 유기 검색 순위 난이도가 아니다. 상단 입찰가도 광고주의 검색광고 지불액 지표다. 이를 블로그의 실제 방문수나 AdSense 수익으로 읽으면 안 된다. — [측정항목 정의](https://support.google.com/google-ads/answer/3022575?hl=en)
- 중요 최신 변경: 기존 developer token은 2026-09-09 종료되었고 API 접근 수준은 OAuth 자격 증명이 속한 Google Cloud 프로젝트 기준으로 이전되었다. 토큰 헤더는 현재 선택사항이고 서버가 무시한다. 관리자 계정은 여러 계정 연결·관리에 필요할 수 있으나 API 이용 자체의 필수조건은 아니다. 본문 인용: “Developer tokens were sunset on September 9, 2026.” (2026-10-12 직접 open/find 확인) — [마이그레이션 FAQ](https://developers.google.com/google-ads/api/docs/api-policy/developer-token)
- 위 변경은 별도 공식 변경 이력의 효력일 2026-09-09와 교차 확인했다. 해당 표 인용: “Developer tokens are deprecated and have been sunset.” 페이지 최종수정 2026-09-30. — [공식 변경 이력](https://developers.google.com/google-ads/api/docs/deprecations)
- 현재 접근 수준은 Test, Explorer, Basic, Standard이다. Explorer의 제한 서비스 목록에 KeywordPlanIdeaService 및 KeywordPlanService 등 Planning이 포함되어 있으므로 키워드 API에는 Basic 이상이 필요하다. Basic 신청에는 Cloud 프로젝트 브랜드 검증 선행이 안내되어 있다. Standard의 ‘Researching keywords and recommendations’ 허용 용도 설명은 Google Ads 캠페인 생성·관리 지원 도구로 한정되어 있어 순수 SEO 자동화 용도가 무조건 승인된다고 약속하면 안 된다. — [접근 수준·허용 용도, 2026-10-12 본문 확인](https://developers.google.com/google-ads/api/docs/api-policy/access-levels)
- 네이버 검색광고 공식 API 안내는 광고주센터 가입 → 관리 화면 Tools > API Manager → API license 생성 경로를 안내한다. API 호스트는 api.searchad.naver.com이며 키워드 도구 문서 경로가 있다. 동적 엔드포인트 문서는 이 조사 도구에서 본문이 비어 필드별 세부 명세를 확정하지 않았다. — [공식 API 안내](https://naver.github.io/searchad-apidoc/), [키워드 도구 문서](https://naver.github.io/searchad-apidoc/#/operations/GET/~2Fkeywordstool)
- 네이버 데이터랩 검색어 트렌드 API는 개발자센터 앱 등록 후 client ID·secret을 사용한다. 문서상 하루 1,000회이며 최대 5개 키워드 그룹, 그룹당 최대 20개 검색어를 받는다. 반환 ratio는 결과의 최대값을 100으로 놓은 상대값이며 절대 검색수가 아니다. — [공식 DataLab API](https://developers.naver.com/docs/serviceapi/datalab/search/search.md)
- Google Trends 역시 검색 표본을 지역·기간에 맞춰 정규화한 0~100 관심도이며 절대 검색량이 아니다. 같은 100이라도 서로 다른 지역의 총 검색수는 다를 수 있다. — [Google Trends 데이터 FAQ](https://support.google.com/trends/answer/4365533?hl=en)

### Inferences
- 최소 입력 스키마 제안: keyword, normalized_keyword, intent_cluster_id, country, search_engine, device, source, source_date, period, volume_or_range, trend, advertiser_competition, bid_low/high, SERP_checked_at, organic_opportunity, click_potential, affiliate_fit, evidence_available, production_cost_estimate, update_cost_estimate. 볼륨 범위는 범위로 보존하고 100~1,000을 550으로 바꿔 확정치처럼 취급하지 않는다.
- Google과 네이버 검색량은 별도 열로 보관한다. 검색엔진·기간·정의가 달라 단순 합산 후 ‘유일 방문자’라고 표시할 수 없다. 가까운 키워드 변형들의 검색량도 중복 가능성이 있어 페이지별 합산을 보수적으로 한다.
- 시작 시 후보 200~500개를 CSV로 확보하고 주 1회 갱신하면 충분하다. 매시간 같은 검색량 API를 다시 호출할 이유가 없다. 비용을 아끼려면 수집과 글 생성 주기를 분리한다.
- 순수 SEO 용도에서 Google Ads API 허용 범위/승인이 불확실하면 정당한 UI export 및 명시적으로 허용된 데이터 공급자를 유지한다. API 신청에 광고 운영을 하는 척 허위 목적을 쓰지 않는다.

### Gaps
- 로그인된 계정 접근 여부, 결제 설정 상태, 현재 제공되는 검색량 정밀도와 범위, API 승인 상태는 확인하지 않았다. 광고비를 얼마 쓰면 정확한 수치가 나온다는 공인 임계치를 확인하지 못했다. 실제 수요·CPC·RPM·전환율 숫자와 ‘최고의 키워드’는 현재 확정할 수 없다.
- 오래된 공식 Starter Checklist와 검색결과 요약에는 developer token+관리자 계정 필수 설명이 남아 있었다. 최신 본문·변경 이력을 우선했다. n8n Google Ads 노드의 최신 인증 대응 여부는 별도 구현 검증 대상이다.
- 네이버 키워드 도구 API의 광고 클릭 지표를 유기 클릭률로 대체해서는 안 된다. 이번 조사에서 공식 동적 명세가 렌더링되지 않았으므로 특정 필드 이름/허용 호출량은 실제 연동 단계에서 재확인해야 한다.

## 2. 어떤 주제와 키워드를 선택해야 트래픽과 수익을 함께 높일 수 있는가?

### Takeaway
‘검색량 높음 + 광고 경쟁 낮음’으로 자동 선정하면 목표를 놓친다. 확보 가능한 유기 클릭 수와 구매 연결성, 기존 결과를 넘어서는 자료를 만들 수 있는지, 제작·갱신 비용을 함께 평가해야 한다. 추천 출발점은 한 분야의 문제 해결·선택·호환성 정보를 연결하는 전문 사이트이며 아래 후보는 검증 전 가설이다.

### Cited Findings
- AdSense Page RPM은 추정 수익을 페이지뷰로 나누고 1,000을 곱한 값이다. 따라서 Keyword Planner 검색광고 CPC나 상단 입찰가를 Page RPM으로 대입할 근거가 없다. — [AdSense Page RPM](https://support.google.com/adsense/answer/112030?hl=en-GB)
- Google은 사이트의 명확한 초점, 직접 경험과 전문성, 독창적인 정보·분석, 방문자의 문제 해결을 강조한다. 선호 글자 수는 없으며 다양한 주제에 대한 대량 자동 생성·단순 재요약·유행 추종을 경고 신호로 제시한다. 건강·재정·안전에 중대한 영향을 주는 YMYL 주제에는 신뢰 관련 기준이 더욱 중요하다. — [사람 중심 콘텐츠 가이드](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- Google의 2026 GEO 가이드는 기존 SEO 기반 위에 고유한 경험·전문적 관점이 있는 콘텐츠를 강조한다. 검색 표현 변형/fan-out마다 얇은 페이지를 만드는 행위는 유효한 전략이 아니며 순위 조작 목적의 규모 확대는 스팸 정책과 충돌할 수 있다. — [생성형 AI 검색 최적화 가이드](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

### Inferences
아래는 시장 수요가 확인된 추천 순위가 아니라, 수익 구조와 자료 확보 가능성을 시험할 후보이다.

| 후보군 | 가설적 콘텐츠 예 | 수익 연결 및 차별화 재료 | 운영 위험 |
|---|---|---|---|
| 생활가전 소모품·호환성·유지관리 | 특정 모델 필터 선택, 청소 가능한 부품, 정품/호환 선택 체크리스트 | 소모품·관리용품 구매, 제조사 문서 기반 호환표, 직접 측정·사진 | 모델명 오류·구형 정보, 안전 관련 수리는 전문가 검토 필요 |
| PC 주변기기·작업 환경 | 노트북과 모니터 연결 조건, 도킹스테이션 조합, 책상 실측 배치 | 케이블·허브·거치대 구매, 실제 호환 결과표·계산 도구 | 스펙/포트 기능을 생성형 모델이 혼동하기 쉬움 |
| 소형 주거 수납·정리 | 치수별 수납 가능성, 문 열림 공간 계산, 방 구조별 배치 | 수납·정리 제품, 실측 도면·공간 계산기 | 보편적인 ‘추천 10선’은 차별화 약함 |
| 특정 취미의 입문 장비·관리 | 단계별 도구 선택, 소모품 비교, 유지관리 | 도구·소모품 구매, 직접 만든 체크리스트·시험 결과 | 사용자 경험 없는 가짜 사용기 금지, 취미별 수요 검증 필요 |

- 위 중 사용자가 실제 장비·자료·경험을 확보할 수 있는 1개를 먼저 택한다. 금융·의료·법률·투자, 실시간 지원금/세금처럼 검수와 갱신 비용이 높은 분야는 고단가처럼 보인다는 이유만으로 초기 저비용 자동화 대상으로 삼지 않는다. 생활가전도 전기·화재 위험 작업은 일반 유지관리와 분리한다.
- 키워드를 ‘주제 + 사람의 조건 + 해야 할 결정’으로 만든다. 예: ‘모니터 추천’ 대신 ‘특정 노트북의 외부 화면 2대 연결에 필요한 포트 조건’. 모델별로 동일 문장을 복제하지 않고 실제 조건이 다를 때만 독립 페이지를 만든다.
- 1차 후보 점수(내부 우선순위 휴리스틱, 수익 예측 모델 아님): 수요 25 + 유기 결과의 빈틈 25 + 실제 클릭 필요성 15 + 구매 연결성 20 + 직접 증거 생산 가능성 15 = 100점. 유지보수·제작 비용과 오류 위험은 별도 감점. 정확한 가중치는 운영 성과로 조정한다.
- organic opportunity는 검색 결과 개수나 블로그 수가 아니라 상위 10개 결과를 표본 조사한다: 독립 사이트 진입 여부, 공식 사이트/쇼핑/영상/커뮤니티 점유, 검색 의도 일치, 최신성, 실제 체험·표·도구 수준, 우리가 보탤 수 있는 구체적인 누락 정보. 강한 결과가 이미 충분한 키워드는 검색량이 커도 후순위로 둔다.
- click potential은 AI 요약·즉답·쇼핑 결과가 질문을 끝내는지 검토한다. 한 줄 정의보다 모델 호환표 조회, 계산 결과, 상세 사진, 조건별 비교처럼 방문해서 확인할 이유가 있는 내용을 우선한다. 이는 검증할 가설이며 AI 결과가 존재한다는 이유만으로 모든 키워드를 제외하지 않는다.
- 검증 후 경제식: 기대 페이지뷰 = 엔진별 수요 × 도달 가능한 유기 클릭률 × 방문당 페이지수. 광고 수익 = 페이지뷰/1,000 × 관측 Page RPM. 제휴 수익 = 제휴 클릭수 × 유효 구매 전환율 × 평균 승인 수수료. 순기여 = 광고+승인 제휴수익 − 글/이미지/조회/검수/갱신 비용. 순위 획득 확률과 성숙 기간이 미지수라 초기에는 보수·기준·상향 시나리오로만 제시한다.
- 생산량을 KPI로 두지 않는다. 글 단위보다 intent_cluster 단위로 방문수·승인 수익·비용을 합산해서 유사 글끼리 성과를 빼앗는 문제를 발견한다. 트래픽 최우선이라도 전환 없는 PV를 비싸게 사들이는 주제는 유지할 이유가 없다.
- 5,000자 이상 요구는 편집 기준으로 구현할 수 있으나 SEO 기준으로 설명하면 안 된다. 한 글에서 충분한 깊이를 만들 수 있는 주제만 기획하고 설명·표·근거·예외·판단 기준으로 채운다. 단순 질문을 5,000자로 부풀려야 한다면 글을 보류하거나 큰 안내서의 절로 합친다. 실제 사용하지 않은 제품을 사용한 것처럼 쓰지 않는다.

### Gaps
- 어떤 후보가 한국에서 검색량이 가장 높거나 경쟁이 낮은지는 계정 데이터·SERP 조사 전에는 알 수 없다. 표의 예시가 현재 저경쟁 키워드라는 의미는 아니다.
- 사용자 보유 전문성·제품·촬영 가능 시간, 쿠팡 세부 승인 수수료 및 취소/반품 반영, 실제 AdSense 승인과 Page RPM이 미확인이다. 이 입력 없이 월 수익 보장은 불가능하다.

## 3. SEO·GEO 성과를 어떻게 측정하고 저비용 자동화에 되먹임할 것인가?

### Takeaway
매시간 돌릴 것은 발행을 강제하는 생성기가 아니라 검증된 작업 큐다. 주간 키워드 갱신→중복 의도 통합→근거 수집→초안→품질 통과→발행→성과 분석을 연결하고, 전환이나 클릭이 확인되는 군집에만 생산량을 늘린다. GEO 노출수와 실제 방문·수익은 서로 다른 목표로 분리한다.

### Cited Findings
- Google은 2026-06-03 Search Console의 Search/Discover용 Generative AI performance 보고서 출시를 발표했고, 같은 공식 글에 2026-08-31 모든 사이트 대상 rollout 완료 주석이 있다. 보고 지표는 노출수, 페이지, 국가, 기기(검색), 날짜이며 전체 보고서에도 합산된다. 본문 짧은 인용: “As of August 31, 2026, we've rolled out these insights to all websites worldwide.” (2026-10-12 직접 open/find로 확인) — [공식 발표](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports)
- 현재 Search Console의 Settings > Search generative AI 제어는 해당 AI 기능에 사이트 링크와 콘텐츠를 포함/제외하는 선택을 제공한다. 기본값은 포함(하위 속성은 상속 가능)이며 별도 신규 등록을 의무화한다는 의미가 아니다. 제어 역시 2026-08-31 세계 rollout 완료로 명시되어 있다. — [공식 제어 도움말](https://support.google.com/webmasters/answer/16908024)
- 신규 Google GEO 가이드는 기존 기술 SEO와 고유 콘텐츠를 우선하고, 별도 llms.txt·불필요한 chunking 등 ‘GEO hack’을 필수조건으로 보지 않는다. Search Console 전용 AI 보고서도 안내한다. — [공식 가이드](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

### Inferences
- 초기 6~8주 실험안(검색 성과 보장 기한 아님): 좁은 분야 1개, 3~5개 의도 군집에 실질적으로 다른 20~40개 자료를 단계적으로 발행한다. 주 1회 데이터 확인, 28일 단위 비교를 기본으로 두되 신생 사이트의 색인/순위 형성은 더 오래 걸릴 수 있다. 초기 무클릭만으로 바로 삭제하지 않는다.
- 매시간 스케줄에서 대기열과 일일/월간 예산, 동일 의도 기발행 여부, 근거 유효성, 발행 상한을 먼저 확인한다. 적격 작업이 없으면 종료한다. 24개/일을 기본 성공 조건으로 두지 않는다.
- 최소 분석 차원: published_at, content_version, intent_cluster, article_type, source_cost, text_cost, image_cost, human_minutes, indexing_status, GSC_impressions/clicks, GA_landing_sessions, affiliate_outbound_clicks, approved_commission, page_RPM. 데이터 제공 범위가 다르면 페이지/군집 단위 매칭 한계를 표시한다.
- 주간 의사결정 예: 노출↑·클릭↓는 검색 의도/제목·SERP 형식 점검, 클릭↑·제휴 클릭↓는 구매 의도 불일치·비교자료 위치 점검, 제휴 클릭↑·승인 수익↓는 제품·가격·판매자·전환 지연 점검, 특정 모델 유입↑는 해당 모델의 실제 자료를 확장한다. 색인 문제는 콘텐츠 생성 증가로 해결하려 하지 않는다.
- GEO 보고서 노출수를 유입으로 치환하지 않는다. Google AI 보고서 + 전체 검색 클릭 + 사이트 분석 전환 + AI 서비스 referral을 각자 보관한다. 모든 AI 방문은 referrer가 남는다고 가정하지 않으며 ChatGPT·Perplexity 노출을 Google 보고서가 대표하지 않는다.
- 비용 절감: 키워드·근거 수집을 군집 단위 캐시, 저가 모델로 분류/중복 검사, 충분한 근거가 확보된 초안에만 생성 비용 지출, 가치가 낮은 장식 이미지는 생략/공용 자산 활용, 구매 결정에 필요한 실제 제품 사진·표는 출처/권리를 확인한다. fal 생성 사진은 실제 테스트 증거를 대체하지 않는다.
- 처음 연결할 데이터 흐름은 ‘CSV → DB → 키워드 점수·의도 클러스터 → 편집 큐’면 충분하다. 무리한 API 승인·검색량 실시간화보다 품질과 측정 가능한 수익 가설을 먼저 검증한다.

### Gaps
- 새 Generative AI 보고서의 공개 API 지원/완전한 클릭 분리 가능 여부까지 조사하지 않았다. 초기 구현은 UI 확인/수동 내보내기를 전제로 하며, API 필드가 있다고 가정하지 않는다.
- 과거 ai-features 문서에는 Web 성과 합산만 설명된 부분이 검색됐다. 2026 전용 보고서·제어 공식 문서가 더 최신이므로 합산만 가능하다고 단정하지 않는다.
- 한국 사용자의 키워드별 AI 결과 노출률·zero-click율·실제 클릭 감소율을 검증하지 않았고 임의 숫자를 제시하지 않는다.
