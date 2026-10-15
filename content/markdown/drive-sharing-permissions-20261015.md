---
title: "구글 드라이브 공유 권한: 링크 범위와 Viewer·Commenter·Editor 차이"
articleId: "drive-sharing-permissions-20261015"
revision: 8
---

구글 드라이브 공유 권한은 **누가 파일을 볼 수 있는지**와 **들어온 사람이 어디까지 할 수 있는지**를 따로 나눠서 봐야 합니다. 링크를 열어도 수정이 안 되는 경우가 있고, 사람별로 초대해도 권한에 따라 댓글만 남길 수 있습니다. 파일과 폴더는 적용 방식이 다르므로, 먼저 공유 범위와 권한을 구분해 두면 헷갈림이 줄어듭니다. [공유 기본](https://support.google.com/drive/answer/2494822?hl=en&co=GENIE.Platform%3DDesktop), [파일과 폴더 접근](https://support.google.com/drive/answer/7166529?hl=en&co=GENIE.Platform%3DDesktop)

업무용이나 학교용 계정은 외부 공유가 제한될 수 있습니다. 그래서 같은 메뉴를 눌러도 개인 계정과 결과가 달라질 수 있습니다. 아래에서는 파일 기준의 권한, 링크 공유, 폴더 상속, 공유가 안 될 때 확인할 순서까지 차례로 정리합니다.

## 권한은 무엇이 다를까
구글 드라이브의 기본 권한은 `Viewer`, `Commenter`, `Editor`입니다. `Viewer`는 열람만 가능하고, `Commenter`는 댓글이나 제안까지 가능하며, `Editor`는 내용을 수정할 수 있습니다. 이 차이를 먼저 알아야 링크가 열려 있는데도 편집이 안 되는 이유를 설명할 수 있습니다. [공유 기본](https://support.google.com/drive/answer/2494822?hl=en&co=GENIE.Platform%3DDesktop)

권한 이름이 비슷해 보여도 실제 의미는 다릅니다. `Viewer`는 열람만, `Commenter`는 댓글과 제안까지, `Editor`는 수정까지 가능하므로 먼저 파일을 “읽기만 할지”, “의견만 받을지”, “같이 고칠지”부터 정해야 합니다.

1. 링크를 열기만 하면 되는 자료라면 `Viewer`로 둡니다.
2. 검토 의견을 받고 싶다면 `Commenter`가 맞습니다.
3. 본문 수정이나 공동 작업이 필요하면 `Editor`가 필요합니다.

여기서 헷갈리기 쉬운 점은 권한과 별도로 소유자가 추가 제한을 둘 수 있다는 점입니다. 즉 `Editor`라고 해도 소유자가 막아 두면 공유 변경이나 다운로드, 인쇄, 복사가 제한될 수 있어 권한 이름만 보고 모든 동작이 된다고 생각하면 안 됩니다. [공유 기본](https://support.google.com/drive/answer/2494822?hl=en&co=GENIE.Platform%3DDesktop)

### Viewer, Commenter, Editor 차이
`Viewer`는 파일을 열어 읽을 수 있지만 댓글, 수정, 공유 변경은 할 수 없습니다. `Commenter`는 열람과 댓글, 제안을 할 수 있지만 본문 편집은 할 수 없습니다. `Editor`는 파일을 수정할 수 있고, 보통 다른 사람과의 공유도 조정할 수 있습니다. 다만 소유자가 별도 제한을 걸 수 있어, 권한 이름만 보고 모든 행동이 가능하다고 보면 안 됩니다. [공유 기본](https://support.google.com/drive/answer/2494822?hl=en&co=GENIE.Platform%3DDesktop), [파일과 폴더 접근](https://support.google.com/drive/answer/7166529?hl=en&co=GENIE.Platform%3DDesktop)

| 권한 | 가능한 일 | 제한되는 일 |
|---|---|---|
| Viewer | 열람 | 댓글, 편집, 공유 변경 |
| Commenter | 열람, 댓글 | 본문 편집, 공유 변경 |
| Editor | 열람, 댓글, 편집 | 소유자 변경 |

표에서 보이는 차이는 실제 작업 판단에 바로 연결됩니다. 상대가 파일을 열기만 해야 한다면 `Viewer`, 검토 의견만 받으려면 `Commenter`, 내용을 함께 고쳐야 한다면 `Editor`가 필요합니다. 권한을 낮게 주면 나중에 다시 열어야 하므로, 처음 공유할 때 목적에 맞춰 고르는 편이 좋습니다. [공유 기본](https://support.google.com/drive/answer/2494822?hl=en&co=GENIE.Platform%3DDesktop)

### 다운로드와 복사 제한도 따로 본다
자료에는 소유자가 `Share Settings`에서 다운로드, 인쇄, 복사를 제한할 수 있다고 나옵니다. 즉 권한이 `Viewer`나 `Commenter`라고 해서 항상 파일을 내려받을 수 있는 것은 아닙니다. 작업 결과를 외부로 퍼뜨리고 싶지 않다면, 이 추가 제한도 함께 확인해야 합니다. [공유 기본](https://support.google.com/drive/answer/2494822?hl=en&co=GENIE.Platform%3DDesktop)

## 사람별 공유는 어떻게 하나
특정 사람에게만 열어주려면 이메일 주소를 넣고 권한을 선택합니다. 이 방식은 링크를 가진 사람 전체가 들어오는 방식보다 범위가 좁아서, 누가 접근하는지 관리하기 쉽습니다. 초대는 이메일로 전달되므로, 받는 사람이 어떤 계정으로 열어야 하는지도 함께 생각해야 합니다. [공유 기본](https://support.google.com/drive/answer/2494822?hl=en&co=GENIE.Platform%3DDesktop)

### 공유 절차 순서
1. Google Drive에서 공유할 파일을 선택하고 `Share`를 엽니다.
2. 공유할 사람의 이메일 주소를 입력합니다.
3. `Viewer`, `Commenter`, `Editor` 중 필요한 권한을 고릅니다.
4. 필요하면 메시지를 덧붙이고 `Send` 또는 `Share`를 누릅니다.

이 절차는 단순하지만, 중간에 권한을 잘못 고르면 결과가 달라집니다. 예를 들어 검토용 파일에 `Editor`를 주면 원치 않는 수정을 허용할 수 있습니다. 반대로 협업 문서에 `Viewer`만 주면 상대는 내용을 볼 수만 있고 작업을 이어 갈 수 없습니다. [공유 기본](https://support.google.com/drive/answer/2494822?hl=en&co=GENIE.Platform%3DDesktop)

### 업무용 계정에서 주의할 점
회사나 학교 계정은 조직 정책이 우선합니다. 자료에는 외부 공유가 제한될 수 있다고 되어 있으므로, 개인 계정에서 되던 공유가 그대로 되지 않을 수 있습니다. 같은 메뉴를 눌러도 조직 정책 때문에 상대가 목록에 안 보이거나, 초대가 막힐 수 있습니다. [파일과 폴더 접근](https://support.google.com/drive/answer/7166529?hl=en&co=GENIE.Platform%3DDesktop)

### 만료일과 추천 대상자
일부 업무용 또는 학교용 계정은 만료일을 추가할 수 있습니다. 임시 검토용 파일이라면 기간이 지나면 권한이 끝나도록 설정하는 방식이 유용합니다. 다만 이 기능은 eligible한 계정에서만 보이므로, 모든 계정에 같은 메뉴가 있다고 보면 안 됩니다. 자료에는 추천 수신자 제안을 끄는 설정도 안내되어 있습니다. [공유 기본](https://support.google.com/drive/answer/2494822?hl=en&co=GENIE.Platform%3DDesktop)

## 링크 공유는 범위를 어떻게 정하나
링크 공유는 “링크를 가진 사람이 들어올 수 있는가”를 정하는 방식입니다. 사람을 일일이 입력하지 않아도 되지만, 범위를 넓히는 만큼 의도하지 않은 전달 가능성도 커집니다. 그래서 파일 성격에 따라 사람별 공유와 링크 공유를 나눠 생각해야 합니다. [파일과 폴더 접근](https://support.google.com/drive/answer/7166529?hl=en&co=GENIE.Platform%3DDesktop)

링크 공유를 쓸 때는 범위와 권한을 따로 봐야 합니다. `Anyone with the link`는 링크를 가진 사람이 들어올 수 있다는 뜻이고, 실제로 무엇을 할 수 있는지는 `Viewer`·`Commenter`·`Editor` 설정이 결정합니다.

1. 비공개 검토본처럼 접근 대상을 통제해야 하면 `Restricted`를 선택합니다.
2. 공지용 자료처럼 링크 전달만으로 열리게 하려면 `Anyone with the link`를 씁니다.
3. 조직 내부만 열어야 하면 `Your Organization` 범위를 확인합니다.

개인 계정에서는 단순해 보여도, 업무용이나 학교용 계정은 관리자가 외부 링크 공유를 막아 둘 수 있습니다. 그래서 같은 링크 설정을 골라도 사람마다 결과가 다를 수 있고, 로그인하지 않은 사용자는 익명으로 표시될 수 있습니다. [파일과 폴더 접근](https://support.google.com/drive/answer/7166529?hl=en&co=GENIE.Platform%3DDesktop)

### Restricted와 Anyone with the link
`Restricted`는 접근 권한이 있는 사람만 열 수 있다는 뜻입니다. 반대로 `Anyone with the link`는 링크만 있으면 누구나 열 수 있습니다. 자료에는 이 경우 로그인하지 않은 사람도 접근할 수 있다고 설명되어 있습니다. 따라서 링크만 전달해도 되는 문서인지 먼저 판단해야 합니다. [파일과 폴더 접근](https://support.google.com/drive/answer/7166529?hl=en&co=GENIE.Platform%3DDesktop)

| 링크 범위 | 열 수 있는 사람 | 주의할 점 |
|---|---|---|
| Restricted | 초대받은 사람 | 범위는 좁지만 관리가 필요함 |
| Anyone with the link | 링크를 가진 사람 | 전달 범위가 넓어질 수 있음 |

링크 범위와 권한은 같은 뜻이 아닙니다. 링크가 열려 있어도 권한이 `Viewer`면 수정은 안 됩니다. 반대로 사람별로만 초대했더라도 `Editor`면 편집이 가능합니다. 그래서 공유 설정을 볼 때는 범위와 권한을 같이 확인해야 합니다. [공유 기본](https://support.google.com/drive/answer/2494822?hl=en&co=GENIE.Platform%3DDesktop), [파일과 폴더 접근](https://support.google.com/drive/answer/7166529?hl=en&co=GENIE.Platform%3DDesktop)

### 조직 계정은 링크 공유가 막힐 수 있다
업무용이나 학교용 계정은 관리자가 외부 링크 공유를 제한할 수 있습니다. 이 경우 `Anyone with the link`가 보이더라도 실제로는 사용할 수 없을 수 있습니다. 공유가 예상대로 되지 않으면, 파일 문제가 아니라 계정 정책 때문인지 먼저 확인해야 합니다. [파일과 폴더 접근](https://support.google.com/drive/answer/7166529?hl=en&co=GENIE.Platform%3DDesktop)

## 폴더를 공유하면 무엇이 따라가나
폴더를 공유하면 폴더 안의 파일과 하위 폴더가 같은 권한을 물려받습니다. 이 동작을 `상속`이라고 부릅니다. 쉽게 말해, 부모 폴더의 설정이 안쪽 항목으로 내려가는 구조입니다. [공유 기본](https://support.google.com/drive/answer/2494822?hl=en&co=GENIE.Platform%3DDesktop), [파일과 폴더 접근](https://support.google.com/drive/answer/7166529?hl=en&co=GENIE.Platform%3DDesktop)

폴더를 공유할 때 중요한 건 “파일마다 따로 정하는 것”이 아니라 “부모 폴더의 규칙이 먼저 적용된다”는 점입니다. 그래서 폴더 안에 있는 파일은 기본적으로 같은 접근 수준을 따라가고, 개별 파일만 더 낮은 권한으로 바꾸려 해도 Drive가 부모 폴더를 수정하라고 안내할 수 있습니다.

1. 여러 파일에 같은 권한이 필요하면 폴더 기준으로 정리합니다.
2. 특정 파일만 더 엄격하게 관리해야 하면 별도 제한 폴더로 옮깁니다.
3. 원래 위치를 유지해야 하면 바로가기를 두어 찾기 쉽게 합니다.

이 구조를 먼저 이해하면, 왜 파일 하나만 예외 처리하려다가 막히는지 설명이 됩니다. 개별 파일만 다르게 열어야 하는 상황이 반복된다면, 파일을 따로 빼는 쪽이 나중에 권한을 다시 손볼 일이 적습니다. [파일과 폴더 접근](https://support.google.com/drive/answer/7166529?hl=en&co=GENIE.Platform%3DDesktop)

### 개별 파일만 더 좁게 막을 수 있나
자료에 따르면 상위 폴더보다 낮은 권한을 개별 파일에 줄 수 없습니다. 예를 들어 어떤 사람이 폴더에서는 `Editor`라면, 그 안의 한 파일만 `Viewer`로 낮추는 방식은 허용되지 않습니다. Drive가 그 상황을 감지하면 부모 폴더 권한을 조정하라고 안내합니다. [공유 기본](https://support.google.com/drive/answer/2494822?hl=en&co=GENIE.Platform%3DDesktop)

이 규칙 때문에 파일 하나만 예외로 다르게 관리하려고 하면 막힐 수 있습니다. 그런 경우에는 파일을 별도 폴더로 옮기거나, 제한된 접근 전용 하위 폴더를 새로 만들어 그 안에서 공유하는 편이 낫습니다. 자료에는 원래 위치에서 찾기 쉽도록 바로가기(shortcut)를 둘 수 있다고도 안내합니다. [파일과 폴더 접근](https://support.google.com/drive/answer/7166529?hl=en&co=GENIE.Platform%3DDesktop)

### 폴더 기준으로 정리해야 편한 이유
여러 파일을 같은 사람에게 비슷한 권한으로 열어야 할 때는, 파일마다 따로 조정하는 것보다 부모 폴더를 기준으로 맞추는 편이 관리가 쉽습니다. 권한이 많아질수록 실수도 늘어나므로, 구조를 먼저 정리하면 되돌릴 일이 줄어듭니다. 개별 파일만 예외 처리해야 할 때만 별도 폴더를 쓰는 것이 맞습니다. [공유 기본](https://support.google.com/drive/answer/2494822?hl=en&co=GENIE.Platform%3DDesktop)

## 공유가 안 될 때 무엇부터 보나
공유가 안 되는 이유는 권한 선택 오류만이 아닙니다. 파일 종류, 폴더 상속, 조직 정책, 개수 제한이 함께 얽힐 수 있습니다. 그래서 문제가 생기면 “무엇이 막혔는지”를 먼저 나눠 보는 것이 빠릅니다. [공유 기본](https://support.google.com/drive/answer/2494822?hl=en&co=GENIE.Platform%3DDesktop), [파일과 폴더 접근](https://support.google.com/drive/answer/7166529?hl=en&co=GENIE.Platform%3DDesktop)

공유가 실패하면 가장 먼저 “설정이 틀렸는지”와 “계정이 막고 있는지”를 나눠서 봐야 합니다. 같은 메뉴가 보이더라도 업무용·학교용 계정에서는 외부 공유, 링크 공유, 편집 권한이 조직 정책 때문에 제한될 수 있기 때문입니다.

1. 상대가 열기만 해야 하는데 편집을 기대한 것은 아닌지 확인합니다.
2. 폴더 상속 때문에 개별 파일만 다르게 바꾸려 한 것은 아닌지 봅니다.
3. 파일이 너무 많은 사람과 공유된 상태라면 개별 이메일 수 제한이나 동시 편집 제한에 걸리지 않았는지 살핍니다.

자료 기준으로는 한 파일을 최대 600개의 개별 이메일 주소와 공유할 수 있고, 문서형 파일은 동시에 100개가 넘는 탭이나 기기에서 열리면 일부 사용자만 편집할 수 있습니다. 그래서 “공유가 안 된다”는 말이 항상 같은 원인이 아니라, 권한 문제인지 인원·동시 접속 문제인지 먼저 구분해야 합니다. [공유 기본](https://support.google.com/drive/answer/2494822?hl=en&co=GENIE.Platform%3DDesktop), [파일과 폴더 접근](https://support.google.com/drive/answer/7166529?hl=en&co=GENIE.Platform%3DDesktop)

### 숫자 제한도 있다
자료에는 한 파일을 최대 600개의 개별 이메일 주소와 공유할 수 있다고 나옵니다. 또 Google Docs, Sheets, Slides, Vids 파일은 동시에 100개가 넘는 탭이나 기기에서 열려 있으면 일부 사용자만 수정할 수 있습니다. 즉 공유가 됐더라도 인원이 많거나 동시 편집이 과하면 모두가 같은 방식으로 작업하지 못할 수 있습니다. [공유 기본](https://support.google.com/drive/answer/2494822?hl=en&co=GENIE.Platform%3DDesktop)

### 상대가 열 수 있는데 편집이 안 될 때
상대가 파일을 볼 수는 있지만 편집이 안 된다면, 먼저 권한이 `Viewer` 또는 `Commenter`로 되어 있는지 확인합니다. 그다음에는 폴더 상속 때문에 개별 파일만 다르게 바꾸려 한 것은 아닌지 봅니다. 마지막으로 업무용 계정이라 외부 편집이 막힌 것은 아닌지 확인하면 원인을 좁힐 수 있습니다. [공유 기본](https://support.google.com/drive/answer/2494822?hl=en&co=GENIE.Platform%3DDesktop), [파일과 폴더 접근](https://support.google.com/drive/answer/7166529?hl=en&co=GENIE.Platform%3DDesktop)

### 공유 방식 선택 순서
1. 먼저 사람별 공유가 필요한지, 링크 공유가 필요한지 정합니다.
2. 다음으로 `Viewer`, `Commenter`, `Editor` 중 필요한 권한을 고릅니다.
3. 폴더 안 파일까지 같은 범위가 되어도 되는지 확인합니다.
4. 업무용 또는 학교용 계정이면 외부 공유 제한이 있는지 점검합니다.
5. 마지막으로 만료일이나 알림 여부를 필요에 따라 조정합니다.

이 순서로 보면 “열람 가능”과 “수정 가능”을 섞지 않게 됩니다. 범위를 먼저 정하고 권한을 맞추면, 공유 뒤에 다시 되돌리는 일이 줄어듭니다. [공유 기본](https://support.google.com/drive/answer/2494822?hl=en&co=GENIE.Platform%3DDesktop), [파일과 폴더 접근](https://support.google.com/drive/answer/7166529?hl=en&co=GENIE.Platform%3DDesktop)

## 권한을 정할 때 기억할 기준
구글 드라이브 공유 권한은 결국 두 질문으로 정리됩니다. **누가 들어올 수 있나**, 그리고 **들어온 사람이 무엇을 할 수 있나**입니다. 링크가 열려 있어도 권한이 낮으면 편집은 안 되고, 사람별로만 초대했더라도 `Editor`면 수정이 가능합니다. [공유 기본](https://support.google.com/drive/answer/2494822?hl=en&co=GENIE.Platform%3DDesktop), [파일과 폴더 접근](https://support.google.com/drive/answer/7166529?hl=en&co=GENIE.Platform%3DDesktop)

폴더를 공유하면 안쪽 항목도 함께 따라가므로, 파일 하나만 따로 막고 싶을 때는 폴더 구조부터 바꿔야 할 수 있습니다. 또 회사나 학교 계정은 개인 계정과 다르게 움직일 수 있으므로, 공유가 예상과 다르면 계정 정책부터 확인하는 편이 빠릅니다. [파일과 폴더 접근](https://support.google.com/drive/answer/7166529?hl=en&co=GENIE.Platform%3DDesktop)

## 마무리 전에 확인할 점
공유 전에 볼 항목은 많지 않습니다. 범위는 `Restricted`인지 `Anyone with the link`인지, 권한은 `Viewer`·`Commenter`·`Editor` 중 무엇인지, 그리고 폴더 상속 때문에 같은 권한이 안쪽 파일에 내려가는지 확인하면 됩니다. 이 세 가지를 맞추면 대부분의 공유 혼선을 줄일 수 있습니다. [공유 기본](https://support.google.com/drive/answer/2494822?hl=en&co=GENIE.Platform%3DDesktop), [파일과 폴더 접근](https://support.google.com/drive/answer/7166529?hl=en&co=GENIE.Platform%3DDesktop)
