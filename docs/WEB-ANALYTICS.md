# 운영자 방문 통계

사이트: https://lightstandards.linkingmain.workers.dev/

운영자 대시보드(Cloudflare 로그인 필요): https://dash.cloudflare.com/40b12740d554a2a64712de5562d42fd9/web-analytics/overview/visits?siteTag~in=25fb1126b9104dd0bf9cc2c88daad963&excludeBots=Yes

기본 화면은 최근 24시간, GMT+9, 봇 제외 필터다. 날짜 선택에서 조회 기간을 변경할 수 있다. Visits와 Page views를 구분해 읽고, 글별 수치는 Page views에서 확인한다.

Cloudflare Web Analytics에 해당 hostname을 등록하고 실제 공개 beacon token으로 설정을 활성화했다. 배포용 API token이나 계정 비밀번호를 설정 파일에 넣지 않는다. 사이트 token은 브라우저 설치 코드에 공개되는 식별자다.

1. 기존 Cloudflare 계정에 로그인한다.
2. Analytics & Logs의 Web Analytics에서 기존 등록을 먼저 확인한다. 같은 hostname이 있으면 재사용한다.
3. 없으면 Add a site로 `lightstandards.linkingmain.workers.dev`를 등록한다.
4. Manage site에서 수동 설치 스니펫의 `data-cf-beacon` 안 `token` 값을 확인한다.
5. `config/web-analytics.json`에 이 공개 사이트 token을 넣고 enabled를 true로 변경한다.
6. 빌드·배포 후 공개 HTML에 스니펫이 한 번만 들어가는지, 브라우저에서 공식 수집 요청이 성공하는지 확인한다.
7. Web Analytics 대시보드에 실제 데이터가 들어오는지 확인하고 운영자가 열 링크를 안내한다.

공통 레이아웃에서 연결하므로 새 원고마다 분석 코드를 넣지 않는다. 개발 서버와 준비 전 사이트에는 삽입하지 않는다. 활성화하면 개인정보처리방침도 분석 제공자와 수집 항목 안내로 바뀐다.

Visits는 외부 사이트 또는 직접 유입에서 시작한 방문이고, 같은 방문 안에 여러 Page views가 있을 수 있다. 고유 방문자나 현재 동시 접속자 수로 표시하지 않는다. 실시간 활성 사용자 수가 필요하면 별도 도구와 지표를 검토한다. 연결 전에 발생한 방문은 이 도구로 소급 수집할 수 없다. 차단된 분석 스크립트나 전송 실패 때문에 집계가 누락될 수 있다. 수집 확인을 위해 실행한 운영자·개발자 방문도 통계에 포함될 수 있다.

참고:

- https://developers.cloudflare.com/web-analytics/about/
- https://developers.cloudflare.com/web-analytics/get-started/
- https://developers.cloudflare.com/web-analytics/data-metrics/high-level-metrics/
- https://developers.cloudflare.com/web-analytics/faq/

2026-10-16 사용자 재로그인 후 블로그 hostname을 등록하고 수동 설치용 token을 연결했다. 이 날짜 이전 방문 기록을 새 통계로 복원한 것으로 해석하지 않는다.

검증: 배포 커밋 ee7bc7efff70bca49f1d712051095f1c892ca470, GitHub Actions 38758476043 성공. 44개 HTML에 스니펫이 한 번씩 들어감을 확인했다. 공개 홈·글·개인정보처리방침이 HTTP 200이고 분석 안내도 반영됐다. 실제 브라우저 방문 후 Visits·Page views·페이지 성능 데이터가 운영자 대시보드에 수신됨을 확인했다. 초기 집계에는 연결 확인을 위한 테스트 방문이 포함된다.
