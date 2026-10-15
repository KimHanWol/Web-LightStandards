---
title: "구글 스프레드시트 드롭다운 만드는 방법: 항목 목록과 범위 적용"
articleId: "sheets-dropdown-20261015"
revision: 7
---

구글 스프레드시트 드롭다운은 셀에 미리 정한 선택지만 넣게 해 입력 실수를 줄이는 기능입니다. PC의 Sheets에서 만들 수 있고, 항목을 직접 적는 방식과 다른 셀 범위를 가져오는 방식이 있습니다. 입력을 막을지 경고만 띄울지도 함께 정할 수 있습니다.

## 드롭다운은 어디서 만들까

드롭다운은 스프레드시트의 셀이나 셀 범위에 붙입니다. 새 시트에 처음 넣을 수도 있고, 이미 값이 들어 있는 셀에 적용할 수도 있습니다. 다만 현재 근거는 PC의 Google Sheets 기준이므로, 모바일에서 같은 동작이 모두 된다고 단정할 수는 없습니다. Google 지원 문서의 `in-cell dropdown` 안내와 데이터 검증 안내를 함께 보면, 셀 안 드롭다운은 **데이터 유효성 검사**와 연결해 만드는 방식임을 확인할 수 있습니다. [Google Sheets: in-cell dropdown](https://support.google.com/docs/answer/186103?hl=en&co=GENIE.Platform%3DDesktop), [Google Workspace: formatting and cleaning data](https://support.google.com/a/users/answer/9604139?hl=en&co=GENIE.Platform%3DDesktop)

여기서 데이터 유효성 검사는 셀에 들어갈 수 있는 값을 제한하는 규칙입니다. 즉, 드롭다운은 보기만 예쁘게 만드는 장식이 아니라, 어떤 값이 허용되는지 정하는 입력 규칙입니다. 이 차이를 알아두면 나중에 “목록은 보이는데 직접 입력이 막히는 이유”도 같이 이해할 수 있습니다.

드롭다운을 어디에 붙이느냐에 따라 나중에 관리 방식이 조금 달라집니다. 한 셀만 바꾸는 것보다 열 전체나 여러 셀 범위에 적용하는 편이 같은 규칙을 반복해서 쓰기 쉽습니다.

1. 드롭다운을 넣을 셀 또는 셀 범위를 먼저 선택합니다.
2. 상단 메뉴의 `Insert > Dropdown`, `Data > Data validation`, 또는 셀 우클릭 `Dropdown` 중 하나로 만들기 화면을 엽니다.
3. 오른쪽 패널에서 `Criteria`를 정하고 `Done`으로 저장합니다.

`Data validation`은 셀에 들어올 값을 제한하는 규칙을 뜻합니다. 그래서 드롭다운은 단순히 목록을 보여 주는 기능이 아니라, 어떤 값만 허용할지 미리 정하는 입력 기준이라고 이해하면 됩니다.

### 새 셀에 드롭다운 넣기

1. Google Sheets에서 스프레드시트를 엽니다.
2. 드롭다운을 넣을 셀이나 셀 범위를 선택합니다.
3. 다음 중 한 가지 방법으로 드롭다운 추가 화면을 엽니다.
   - `@`를 입력한 뒤 `Dropdowns`를 선택합니다.
   - 상단 메뉴에서 `Insert` > `Dropdown`을 선택합니다.
   - 상단 메뉴에서 `Data` > `Data validation` > `Add rule`을 선택합니다.
   - 셀을 마우스 오른쪽 버튼으로 클릭하고 `Dropdown`을 선택합니다.
4. 오른쪽의 **Data validation rules** 패널에서 `Criteria`를 고릅니다.
5. 필요에 따라 `Dropdown` 또는 `Dropdown from a range`를 선택합니다.
6. 설정을 마친 뒤 `Done`을 누릅니다.

이때 `Dropdown`은 항목을 직접 적는 방식이고, `Dropdown from a range`는 다른 셀에 있는 값을 가져오는 방식입니다. 처음 만들 때는 항목 수가 적으면 직접 입력이 편하고, 같은 목록을 여러 곳에서 써야 하면 범위 기반이 관리하기 쉽습니다.

### 항목을 직접 입력할 때

`Dropdown`을 고르면 각 선택지를 직접 적습니다. 항목이 하나씩 추가되므로, 상태값처럼 범위가 넓지 않은 목록에 맞습니다. 예를 들어 `Done`, `In Progress`, `Not Started`처럼 짧은 값이 몇 개뿐일 때 쓰기 좋습니다. Google Workspace 안내는 이런 방식으로 데이터 입력 오류를 줄인다고 설명합니다. [Google Workspace: formatting and cleaning data](https://support.google.com/a/users/answer/9604139?hl=en&co=GENIE.Platform%3DDesktop)

추가 항목이 필요하면 `Add another item`을 눌러 값을 더 넣습니다. 항목을 입력할 때는 앞뒤 공백이 섞이지 않게 확인하는 편이 좋습니다. 지원 문서는 앞뒤 공백이 있으면 여러 선택을 쓸 때 문제가 될 수 있다고 안내합니다.

### 범위에서 목록 가져오기

`Dropdown from a range`는 다른 셀 범위를 목록으로 씁니다. 이미 시트 어딘가에 선택지가 정리되어 있을 때 유용합니다. 목록 내용이 바뀌면 드롭다운에도 그 변경이 반영되므로, 같은 선택지를 여러 표에서 다시 쓸 때 편합니다. Google 지원 문서는 범위를 선택해 목록을 만들 수 있고, 선택한 범위 내용이 바뀌면 목록도 자동으로 바뀐다고 설명합니다. [Google Sheets: in-cell dropdown](https://support.google.com/docs/answer/186103?hl=en&co=GENIE.Platform%3DDesktop)

범위 기반은 관리가 쉽지만, 목록 셀을 잘못 지우면 드롭다운 규칙이 남아 보일 수 있습니다. 특히 색이 지정된 값을 원본 범위에서 삭제하면, 기준에는 남아 있으나 편집할 수 없는 상태로 보일 수 있다고 안내합니다. 따라서 원본 범위를 바꾸려면 드롭다운 규칙이 아니라 **원본 셀**을 먼저 점검해야 합니다.

## 입력 오류를 어떻게 처리할까

드롭다운을 만들었다고 해서 무조건 입력이 막히는 것은 아닙니다. 사용자가 목록에 없는 값을 넣었을 때 어떻게 반응할지 정할 수 있습니다. 이 선택이 실제 작업 방식에 큰 영향을 줍니다. 입력을 강하게 통제하고 싶다면 거부를 선택하고, 참고용 경고만 두고 싶다면 경고를 선택하면 됩니다. Google 문서는 `If the data is invalid` 항목에서 `Show a warning`을 고를 수 있다고 안내합니다. [Google Sheets: in-cell dropdown](https://support.google.com/docs/answer/186103?hl=en&co=GENIE.Platform%3DDesktop), [Google Workspace: formatting and cleaning data](https://support.google.com/a/users/answer/9604139?hl=en&co=GENIE.Platform%3DDesktop)

목록 밖 값을 허용할지 막을지는 시트의 쓰임새에 따라 달라집니다. 여러 사람이 함께 쓰는 문서라면 입력을 통일하기 위해 거부를 쓰는 경우가 많고, 개인 점검용 시트라면 경고로 두고 예외 값을 잠시 허용할 수도 있습니다.

1. `Show a warning`은 다른 값을 넣어도 저장은 되지만, 잘못된 입력이라는 표시를 남깁니다.
2. `Reject input`은 목록에 없는 값이 저장되지 않게 막습니다.
3. 팀 공용 문서처럼 값이 집계·필터에 바로 쓰이면 거부가 더 안전합니다.

두 설정의 차이는 보이는 알림 수준이 아니라 실제 저장 가능 여부입니다. 나중에 합계나 분류를 맞춰야 하는 시트일수록 이 차이가 중요해집니다.

### 경고와 거부의 차이

| 설정 | 동작 | 맞는 경우 |
|---|---|---|
| `Show a warning` | 목록 밖 값이 들어와도 경고를 띄움 | 나중에 사람이 확인할 수 있는 업무 |
| `Reject input` | 목록 밖 값 입력을 막음 | 형식을 꼭 맞춰야 하는 공유 시트 |

경고는 예외 입력을 완전히 막지 않습니다. 반면 거부는 목록에 없는 값을 저장하지 못하게 하므로, 표준화가 필요할 때 더 엄격합니다. 어떤 방식을 선택하든 목적은 같습니다. 나중에 필터, 집계, 정렬을 할 때 값이 뒤섞이지 않도록 하는 것입니다.

### 여러 선택지를 허용할 때

드롭다운에는 여러 항목 선택도 넣을 수 있습니다. 다만 지원 문서는 이 기능이 **chip format dropdown**에서만 켤 수 있다고 밝히고 있습니다. 그리고 모바일에서는 여러 선택이 켜져 있어도 현재는 여러 드롭다운 옵션을 고를 수 없다고 안내합니다. 즉, PC에서 만들 수 있어도 모바일 사용 환경까지 같은 결과가 보장되지는 않습니다. [Google Sheets: in-cell dropdown](https://support.google.com/docs/answer/186103?hl=en&co=GENIE.Platform%3DDesktop)

여기서 chip format은 항목이 작은 칩처럼 보이는 표시 형식입니다. 여러 선택이 필요한 경우에는 이 형식과 모바일 제한을 함께 봐야 합니다. PC에서 편집하는 사람과 모바일에서 보는 사람이 섞여 있다면, 한 셀에 여러 값을 넣는 구조가 정말 필요한지 먼저 판단하는 편이 안전합니다.

## 기존 데이터에 적용하고 고치기

이미 값이 들어 있는 셀에도 드롭다운을 만들 수 있습니다. 이 경우 먼저 셀이나 범위를 선택한 뒤 `Dropdown`을 적용하면 됩니다. 선택한 셀에 이미 드롭다운이 있으면, 다른 셀 값이 기존 규칙에 추가될 수 있습니다. Google 지원 문서는 기존 데이터가 있는 셀을 선택해도 드롭다운 규칙을 만들 수 있다고 설명합니다. [Google Sheets: in-cell dropdown](https://support.google.com/docs/answer/186103?hl=en&co=GENIE.Platform%3DDesktop)

이미 값이 들어 있는 셀에도 드롭다운 규칙은 추가할 수 있지만, 원본 목록과 규칙은 구분해서 봐야 합니다. 범위 기반 드롭다운이라면 목록 셀을 바꾸는 순간 드롭다운 선택지도 같이 바뀌므로, 먼저 원본 범위를 수정하는 편이 정확합니다.

1. 수정할 셀이나 범위를 선택합니다.
2. `Data > Data validation`으로 들어가 `Edit`를 엽니다.
3. 항목을 직접 적었다면 `Criteria`에서 값을 바꾸고, 범위 기반이면 원본 셀을 수정합니다.
4. 필요하면 `Display Style`을 `Chip`, `Arrow`, `Plain text` 중 하나로 바꿉니다.

표시 형식은 보이는 방식만 바꾸고, 허용 값 자체를 바꾸지는 않습니다. 따라서 드롭다운이 예상과 다르게 보일 때는 형식 문제인지 목록 문제인지부터 나눠서 확인해야 합니다.

### 기존 드롭다운 수정하기

1. 스프레드시트를 엽니다.
2. 바꾸려는 셀이나 셀 범위를 선택합니다.
3. `Data` > `Data validation`을 엽니다.
4. 드롭다운 옆의 `Edit` 버튼을 누릅니다.
5. `Criteria`에서 항목을 바꾸거나 추가합니다.
6. 필요하면 `Display Style`에서 `Chip`, `Arrow`, `Plain text` 중 하나를 선택합니다.
7. `Done`을 누릅니다.

표시 형식은 값의 내용이 아니라 화면에 보이는 방식입니다. `Chip`은 선택값을 눈에 띄게 보여 주고, `Arrow`는 일반 드롭다운 형태에 가깝습니다. `Plain text`는 단순 텍스트처럼 보입니다. 화면 표시가 달라도 허용되는 값 자체가 달라지는 것은 아니므로, 보기와 규칙을 분리해서 생각해야 합니다.

### 삭제할 때 확인할 점

드롭다운 목록을 없애려면 `Remove Rule`을 선택합니다. 빈 셀만 선택해 `Backspace`로 지우는 방법이나 `Edit Delete Values`를 쓰는 방법도 있습니다. 다만 범위에서 가져온 목록은 원본 범위를 바꾸는 편이 더 정확합니다. 규칙만 지우고 원본 범위를 그대로 두면, 다른 드롭다운이나 다른 시트에서 같은 목록이 남을 수 있습니다. [Google Sheets: in-cell dropdown](https://support.google.com/docs/answer/186103?hl=en&co=GENIE.Platform%3DDesktop)

### 시트에서 바로 확인하는 방법

드롭다운이 제대로 만들어졌는지 보려면, 해당 셀을 눌러 선택지가 나타나는지 확인합니다. 목록에 없는 값을 넣고 `Show a warning`이나 `Reject input`이 의도한 대로 작동하는지도 봅니다. 범위 기반이면 원본 셀 값을 하나 바꿔 보고 드롭다운 목록에 반영되는지 확인하면 됩니다. 이 확인을 해 두면, 규칙이 셀에 붙은 것인지 원본 목록이 바뀐 것인지 구분하기가 쉽습니다.

## 만들기 전 자주 헷갈리는 조건

드롭다운을 만들기 전에 가장 먼저 볼 것은 목록이 바뀔 가능성과 입력을 얼마나 엄격하게 막을지입니다. 목록이 자주 바뀌면 범위 기반이 관리하기 쉽고, 항목이 거의 고정이면 직접 입력이 더 단순합니다.

| 상황 | 더 맞는 방식 |
|---|---|
| 선택지가 적고 고정됨 | `Dropdown` |
| 같은 목록을 여러 셀에서 재사용 | `Dropdown from a range` |
| 목록 밖 입력을 완전히 막아야 함 | `Reject input` |
| 예외 입력을 남겨 두고 싶음 | `Show a warning` |

여러 선택을 쓰는 경우에는 PC에서 chip format인지, 모바일에서 같은 편집이 가능한지까지 함께 봐야 합니다. 이렇게 조건을 먼저 나누면 드롭다운이 보이기만 하는지, 실제 입력 규칙으로도 쓰이는지 혼동하지 않게 됩니다.

### 직접 입력과 범위 기반을 언제 고를까

- 목록이 작고 거의 바뀌지 않으면 `Dropdown`이 단순합니다.
- 여러 시트에서 같은 목록을 쓰면 `Dropdown from a range`가 관리하기 쉽습니다.
- 사용자가 목록 밖 입력을 해도 되는지 정해야 `Show a warning`과 `Reject input`을 고를 수 있습니다.
- 여러 항목 선택이 필요하면 chip format과 PC 환경을 먼저 확인해야 합니다.

이 선택은 기능의 우열이 아니라 작업 방식의 차이입니다. 같은 드롭다운이라도 입력 규칙, 화면 표시, 모바일 제한이 각각 다르기 때문에, 먼저 어디까지 표준화할지 정한 다음 설정을 고르는 편이 시행착오가 적습니다.

### 어디서 다시 확인하면 좋을까

드롭다운 추가와 수정은 Google 지원 문서의 `in-cell dropdown` 안내가 기준이 됩니다. 데이터 입력을 제한하는 전체 개념은 Google Workspace의 데이터 정리 문서에서 함께 확인할 수 있습니다. 두 문서를 함께 보면, 셀 안 목록을 만드는 방법과 입력 오류를 다루는 방법을 나눠서 이해할 수 있습니다. [Google Sheets: in-cell dropdown](https://support.google.com/docs/answer/186103?hl=en&co=GENIE.Platform%3DDesktop), [Google Workspace: formatting and cleaning data](https://support.google.com/a/users/answer/9604139?hl=en&co=GENIE.Platform%3DDesktop)

