# 수익형 AI 블로그: 검색·광고·제휴 정책 근거

조사 기준: 2026-10-12 Asia/Seoul. 공식 문서 우선. 확인된 사실과 설계 권고를 구분한다. Google Search 노출, AdSense 승인, 쿠팡 최종승인은 서로 별도 심사다.

## 1. SEO·GEO와 매시간 5,000자 AI 글의 관계는?

### Takeaway
AI 사용이나 시간당 발행 자체가 일괄 금지된 것은 아니다. 하지만 검색 순위 조작을 주목적으로 가치 없는 글을 대량 생성하면 scaled content abuse이며, 5,000자와 생성 이미지는 독창적 가치를 대신하지 않는다. Google AI 검색 노출에는 별도의 GEO 파일·전용 스키마가 필요하지 않다.

### Cited Findings
- Google은 사용자에게 도움을 주기보다 검색 순위를 조작하려는 목적으로 가치 낮은 비독창적 페이지를 대량 생성하는 것을 scaled content abuse로 정의한다. 생성형 AI, 스크래핑, 여러 페이지를 짜깁기하는 방식 모두 해당할 수 있다. 제재는 순위 하락 또는 검색 제외일 수 있다. AI가 아닌 사람이 작성해도 적용될 수 있는 목적·가치 기준이다. — [Google Search spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
- 유료·제휴 링크는 `rel="sponsored"` 또는 `nofollow`로 관계를 표시할 수 있다. 무허가 자동 검색 쿼리·순위 확인 스크래핑도 별도로 정책에 언급되어 있다. — [Google Search spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
- Google은 선호하는 글자·단어 수가 없다고 명시하며, 실제 전문성 없이 트래픽 때문에 주제에 진입하거나 많은 주제에 자동화로 콘텐츠를 생산하는지 스스로 점검하도록 권한다. — [Helpful people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- 생성 AI 가이드는 조사와 원문 구조화 등에 생성 AI가 유용할 수 있다고 하면서 정확성·품질·관련성을 강조한다. 게시 전 AI 생성물 수동 팩트체크와 검토를 중요하게 권고한다. 이것을 모든 AI 사용에 대한 법적 금지나 AdSense 개별승인 요건으로 확대 해석하면 안 된다. — [Generative AI content guidance](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content)
- Google AI Overviews/AI Mode는 기존 SEO 기본 원칙을 적용한다. `llms.txt`·특수 schema.org 표시는 필요하지 않다. 크롤 허용, 내부 링크, 텍스트 본문, 좋은 페이지 경험, 보이는 내용과 일치하는 구조화 데이터가 핵심이다. 노출은 보장되지 않는다. 구문서(2025-12-10)는 AI 트래픽을 Web 성과에 포함한다고 하지만 **최신 문서는 아래 Generative AI performance report 사용을 안내하므로 '별도 측정 불가'라고 쓰면 안 된다.** — [기존 AI features 문서](https://developers.google.com/search/docs/appearance/ai-features)
- **최신 공식 문서 독립 확인(2026-07-10 업데이트)**: Google은 llms.txt를 검색에 사용하지 않아 순위에 도움도 해도 없고 Markdown·잘게 쪼개기·전용 구조화 데이터가 필요 없다고 명시한다. 사용자에게 고유한 경험·정보를 제공해야 하며 fan-out 변형마다 페이지를 양산하는 것이 순위 조작 목적이면 스팸 정책 대상이다. Search 색인·스니펫 자격 외에 Search Console에서 Search generative AI features에 포함된 상태가 필요하다고 설명한다. Generative AI performance report로 AI 검색 성과를 확인하도록 안내한다. — [최신 Google AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [2026-06 성과 보고서 발표](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports)
- 리뷰 권고는 실제 경험을 뒷받침하는 이미지·오디오·링크, 정량 측정, 경쟁 제품 차이, 장단점, 선택 기준, 독자 조사에 기반한 근거를 중시한다. 단순히 제조사 설명을 늘리는 것으로는 이 권고를 충족하지 못한다. — [Write high quality reviews](https://developers.google.com/search/docs/specialty/ecommerce/write-high-quality-reviews)

### Inferences
- 권고: 매시간은 `스케줄러가 작업 여부 판단하는 주기`로 두고, 발행 수는 독창적 자료·검토 가능량·기존 성과에 맞춰 조절한다. n8n이 24번 실행한다고 매일 24개를 반드시 공개할 필요는 없다.
- 권고: 사용자 요구인 5,000자 이상은 편집 규격으로 보존하되 SEO 보너스로 설명하지 않는다. 충분히 깊은 질문만 장문으로 선택하고, 같은 말 반복으로 분량을 채우면 출고 보류한다.
- 권고: 광범위한 잡학 양산보다 한 구매 상황 또는 문제 해결 분야의 클러스터를 운영한다. 실제 측정치·계산기·비교표·호환표·사진·업데이트 이력이 경쟁 콘텐츠 대비 차별점이어야 한다.
- 권고: GEO는 AI 언급량 자체보다 해당 노출에서 발생한 실제 방문·수익까지 측정한다. 명확한 질문/답변, 출처, 날짜, 비교 근거는 독자·검색 해석에 유용하지만 인용을 보장하지 않는다.

### Gaps
- 특정 주제의 월 검색량, 경쟁도, AdSense RPM, 구매전환율은 이번 정책 조사로 확인되지 않았다. 실계정 데이터/실험이 필요하다.
- SEO/GEO로 트래픽 또는 수익이 보장된다는 공식 근거는 없다. Google AI 문서의 기술 요건을 ChatGPT·다른 엔진 전체에 일괄 적용할 수 없다.

## 2. 요즘 AI 블로그는 AdSense 승인이 안 된다는 말이 사실인가?

### Takeaway
공식 근거로 확인되는 것은 저가치·복제 콘텐츠의 제한이며 AI라는 이유만으로 모든 사이트를 일괄 불승인한다는 규칙은 확인되지 않았다. 자동화하더라도 실제 편집·선별·검토 체계를 갖추는 것이 합리적이다.

### Cited Findings
- AdSense 자격 도움말은 고품질·독창적·독자가 관심을 가질 콘텐츠와 사이트 HTML 소스 접근 권한을 요구한다. 이 문서에서 일률적인 최소 글 수·글당 글자 수·최소 PV 규칙은 제시하지 않는다. — [AdSense eligibility](https://support.google.com/adsense/answer/9724)
- 준비 가이드는 독창적이고 관련성 있는 콘텐츠, 방문자가 찾기 쉬운 내비게이션, 좋은 사용자 경험을 강조한다. — [Make sure pages are ready](https://support.google.com/adsense/answer/7299563)
- 정책 본문은 퍼블리셔 콘텐츠가 없거나 저가치인 화면, 공사 중 화면 등에 Google 광고를 허용하지 않는다. 같은 정책 페이지의 **Tips for understanding this policy** 부분은 정확히 다음과 같이 조언한다: “Don’t place ads on automatically generated content without manual review or curation.” 이 문장은 **정책 설명 팁**에 있고 `review OR curation`이며, 모든 AI 문장에 개별 인간 승인 버튼이 반드시 필요하다고 쓰인 것은 아니다. — [Google-served ads on screens without publisher-content](https://support.google.com/publisherpolicies/answer/11112688)
- 타인 콘텐츠를 임베드·복사하고 별도 해설·큐레이션 등 가치를 추가하지 않은 화면에는 Google 광고가 허용되지 않는다. — [Google Publisher Policies](https://support.google.com/adsense/answer/10502938)

### Inferences
- 권고: 조사 자료·근거 링크·초안·주장 목록을 한 화면에 모아 하루 1~2번 배치 편집하고, 검토된 재고를 예약 발행한다. 반복적 데이터 업데이트는 검증된 규칙과 예외 경보로 관리한다. 운영자 승인 없이 모든 결과물을 자동 공개하는 기본값보다 관리 가능성이 높다.
- 권고: 검사 항목은 숫자 출처, 허위 경험 표현, 중복 내용, 제목-본문 일치, 광고 공개, 링크, 깨진 이미지, 출처 없는 상품 우월성 주장 등 구체적으로 만든다. 다른 LLM의 점수만으로 검증 완료라고 간주하지 않는다.
- 권고: 소개/운영자/문의/개인정보/편집 원칙·제휴 공개를 갖추고, 비어 있는 태그·검색 결과·초안 페이지에 광고를 넣지 않는다. 이 페이지들의 개수나 특정 승인용 글 수를 '승인 공식'으로 팔지 않는다.

### Gaps
- 최근 AdSense 전체/한국/AI 블로그 승인률 및 과거 대비 하락 폭에 대한 신뢰할 공식 통계를 찾지 못했다. '요즘 95% 거절' 같은 커뮤니티 주장을 사실로 쓰지 않는다.
- 특정 사이트가 승인되는지, 어느 정도 편집이면 충분한지 사전 보장은 불가능하다. Search 정책 준수와 광고 심사 통과를 동일시하지 않는다.

## 3. 쿠팡 수익화·생성 이미지·네이버 대비 독립 사이트에서 무엇을 설계해야 하나?

### Takeaway
쿠팡은 일반 요율만으로 수익을 계산하면 안 되며 승인·상품 예외·환불·귀속·광고 표시를 함께 고려해야 한다. 네이버의 자체 광고·편집 정책과 비교하면 독립 사이트가 자동화와 광고 배치 통제에 적합하다는 설계 판단이 가능하지만 수익 우위는 실험으로 확인해야 한다.

### Cited Findings
- 공식 CDN 가이드(표지 2024.12, 파일 URL 20260611, 확인일 2026-10-12): 기본 3%이나 별도 요율 적용 가능, 삼성·애플 스마트폰 1%, 기프트카드·유료보증 제외. 24시간 내 구매, 마지막 유입 링크 기준, 자가구매 제외, 취소·반품 차감. p.41–44. — [쿠팡 공식 이용가이드](https://partners.coupangcdn.com/partners-guide/partners-guide-20260611145240.pdf)
- 누적 판매금액 15만원부터 최종승인 검토; 정산·API는 최종승인 이후. 무료 API는 상품·딥링크·리포트 기능. 초기에는 수동 생성 링크도 사용 가능. p.16·19. — [쿠팡 공식 이용가이드](https://partners.coupangcdn.com/partners-guide/partners-guide-20260611145240.pdf)
- 모든 제휴 게시물 제목/첫 부분에 경제적 관계 표시. 권장 문구: “이 게시물은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.” p.62. — [쿠팡 공식 이용가이드](https://partners.coupangcdn.com/partners-guide/partners-guide-20260611145240.pdf)
- 가이드상 쿠팡 로고 무단 편집·사칭, 타인 저작물 무단 사용, 허위과장 표시, 의도하지 않은 자동 광고 클릭을 금지한다. AI 가상인물 추천에는 가상인물 표시가 필요하며 가짜 경험을 사실처럼 표현하면 문제될 수 있다. p.63·66–71. — [쿠팡 공식 이용가이드](https://partners.coupangcdn.com/partners-guide/partners-guide-20260611145240.pdf)
- 공정위 2024-11-15 보도자료는 2024-12-01 시행 개정에서 문자 매체의 광고 표시는 제목/첫 부분으로, 미래·조건부 수수료도 공개 대상으로 설명한다. '수수료를 지급받을 수 있음'과 같은 불확정 표현을 명확하지 않은 예시로 추가했다. — [공정위 보도자료, 네이버 공지 첨부본](https://notice.naver.com/api/v1/file/download/328)
- 네이버 애드포스트는 광고 매칭 및 수익 공유 서비스이고 블로그 내 본문/하단 광고 설정을 제공한다. — [네이버 애드포스트 설정](https://help.naver.com/service/5593/contents/15308?lang=ko&osType=PC)
- 네이버 블로그 공개 운영정책 문서는 사전 허락 없는 자동화 수단으로 기계적 패턴글을 반복 게시하는 행위와 경제적 관계 미표시 등 검색·품질에 부정적 행위에 제한 조치를 설명한다. 모든 자동화가 곧바로 금지라는 의미로 과장하지 말고 문구대로 적용한다. — [네이버 블로그 운영정책](https://notice.naver.com/api/v1/file/download/122)

### Inferences
- 권고: 독립 도메인을 본진으로 두면 콘텐츠 저장·HTML/광고·상품카드·검수·측정 연결을 통제하기 쉽다. 네이버는 선택적 별도 편집 채널로 판단하며 무단 브라우저 자동발행을 핵심 인프라로 삼지 않는다.
- 권고: fal 이미지는 본문 설명 그림, 공간 예시, 콘셉트 일러스트 용도에 우선 사용. 제품 외형/기능/실사용 성과를 생성해 실물 리뷰 증거로 쓰지 않는다. 실제 제품 표시는 허용된 공식 소재 또는 직접 촬영 이미지를 사용하고, 소재 권한·출처·생성 여부를 데이터에 저장한다. 이는 Google 리뷰 근거 권고와 쿠팡 허위·과장 방지 취지에 따른 편집 기준이지 fal 전체를 금지하는 공식 규칙이 아니다.
- 권고: 글 상단 공개 문구·제휴 링크 속성·상품 정보 확인일을 템플릿이 강제한다. 가격/최저가/재고를 LLM이 추측하지 못하도록 구조화된 검증 데이터에서만 출력한다.
- 권고: 수익 계산에서는 요율, 예외 상품, 취소율을 변수로 두고 광고 수익과 제휴 순확정 수익을 따로 집계한다. 클릭 추적 자체가 구매전환 또는 실수익을 의미하지 않는다.

### Gaps
- 쿠팡 SPA FAQ/API 상세 약관은 웹 텍스트 도구에서 비어 있었다. CDN 가이드로 기본 조건은 확인했으나 API 엔드포인트별 허용량·캐싱/이미지 재호스팅·데이터 보관기간·정확한 현재 상품별 요율은 실제 계정 가이드로 구현 전 확인해야 한다.
- 네이버에 AdSense 코드 삽입이 불가능하다는 직접 공식 문구는 확보하지 못했다. 확보한 사실은 네이버 공식 수익화 도구가 애드포스트이고 AdSense는 HTML 소스 접근이 필요하다는 점이다. 따라서 최종 설명에서는 '네이버는 애드포스트 중심, 독립 사이트는 광고 코드·배치 직접 통제' 정도로 쓰는 것이 정확하다.
- 최신 공정위 전체 심사지침 원문을 직접 열지는 못했으므로 일반 법률 해설을 확장하지 않는다. 쿠팡 최신 계정 약관 우선 확인 권고.
