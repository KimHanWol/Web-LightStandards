# 쿠팡 배너 규격

실제 쿠팡 파트너스 배너를 등록할 수 있도록 `config/affiliate-banners.json`에 위치별 설정을 두었습니다. `enabled=false`, 빈 배열이 기본값이며 비활성 배너는 빈 공간도 만들지 않습니다. 수익 코드와 링크가 준비되기 전에는 광고가 노출되지 않습니다.

| 위치 | 권장 PC 크기 | 권장 모바일 크기 |
| --- | --- | --- |
| home-top / home-middle / home-bottom | 728×90 또는 970×90 | 320×100 또는 300×250 |
| article-top / article-middle / article-bottom | 728×90 | 320×100 또는 300×250 |
| article-sidebar-top / article-sidebar-bottom | 300×250 | 1050px 이하 화면에서 숨김 |

이 수치는 레이아웃용 권장값입니다. 쿠팡이 실제로 제공하는 배너의 가용 규격을 보장하지 않습니다. 제공받은 원본 크기를 입력하면 화면 너비에 맞게 축소하고 종횡비를 유지합니다. 모바일용 이미지가 없으면 PC 이미지가 축소됩니다. 긴 가로 배너는 모바일에서 작아지므로 별도 모바일 이미지를 권장합니다.

아래는 형식을 설명하는 예시이며 실제 링크가 아닙니다.

```json
{
  "enabled": true,
  "banners": [{
    "id": "digital-middle",
    "slot": "article-middle",
    "categories": ["디지털 생활"],
    "href": "https://link.coupang.com/a/REPLACE_WITH_REAL_LINK",
    "alt": "쿠팡에서 디지털 생활용품 살펴보기",
    "desktop": {"src": "https://example.com/replace-desktop-banner.webp", "width": 728, "height": 90},
    "mobile": {"src": "https://example.com/replace-mobile-banner.webp", "width": 300, "height": 250}
  }]
}
```

`categories`를 비우면 전체 카테고리에 표시합니다. 홈 배너에는 빈 배열을 사용합니다. 각 위치에는 배너 1개씩 등록하며 글의 주제에 맞는 링크와 이미지를 검토해 입력합니다. 이미지의 원본 크기와 화면 영역을 예약하고 lazy loading을 사용합니다. 공식 iframe·동적 배너 스크립트는 현재 삽입하지 않았으며, 해당 코드가 제공되면 전용 컴포넌트에서 크기와 로딩 동작을 맞춰야 합니다.

글 첫 부분과 각 배너에 경제적 관계를 표시하고 링크에는 `rel="sponsored"`를 적용합니다. 배너 위치 8개를 준비했다는 뜻이지 모든 페이지에 모두 채워야 한다는 뜻은 아닙니다. 읽을 내용과 질문 해결에 필요한 상품의 관련성을 우선해 배치합니다. 팝업·전면 광고·본문을 가리는 고정 배너는 사용하지 않습니다.
