# 소소한 기준 · LightStandards

검색 데이터를 바탕으로 검토한 키워드와 주제를 다루는 Astro 정적 정보 블로그입니다. 고정 분야는 정하지 않았으며 카테고리는 실제 발행 글에서 생성합니다. n8n이 원고·이미지를 준비하고, 검토한 revision을 GitHub에 저장하면 GitHub Actions가 빌드해서 Cloudflare Workers의 정적 자산으로 배포합니다.

## 현재 상태

- 글 목록·검색 중심의 반응형 홈페이지, 글 템플릿, 소개·문의·개인정보·광고 안내 페이지 구현.
- Markdown 본문, 출처, 생성 이미지, 제휴 링크를 분리한 원고 데이터 구조.
- n8n 워크플로 4개 저장. 기존 OpenAI account와 fal ai API credential 연결.
- 자동 생성과 발행은 초기 설정에서 비활성. 실제 원고·이미지를 생성하거나 공개 배포한 상태는 아닙니다.
- 검색량 데이터와 Google Ads Keyword Planner·Search Console 계정은 연결되어 있지 않습니다. 검증한 키워드·자료가 들어온 뒤 원고를 작성합니다.

## 로컬 실행

```powershell
npm ci
npm run dev
```

화면은 `http://127.0.0.1:4321/`에서 확인합니다. `npm test`로 콘텐츠·비용 제한 검사를, `npm run build`로 배포용 정적 파일 생성을 확인합니다.

## 운영 안내

[연결과 운영 설정](docs/SETUP.md), [실제 작성 프롬프트](n8n/prompts/article-system.txt)를 참고하세요. n8n의 현재 저장본을 수정한 경우 로컬 SDK 정의와도 변경 내용을 맞춰야 합니다. `node n8n/build-workflows.mjs`는 로컬 정의 파일만 재생성하며 원격 워크플로를 새로 만들지 않습니다.
