# 말방구

카카오톡 기능을 참고한 오리지널 채팅 서비스. 이름/디자인은 카카오톡과 무관한 자체 브랜딩으로 진행.

## 현재 상태 (Phase 1~4 완료)

`backend/` — FastAPI + SQLite 기반:
- `app/models.py` — User(+hashed_password/nickname/balance/security_question/security_answer_hash), ChatRoom(+name), RoomMember(+last_read_message_id), Message(+message_type/file_url/file_name/sticker_id/amount/recipient_id), Sticker 테이블 (친구/Friendship 테이블은 제거됨)
- `app/security.py` — pbkdf2 비밀번호 해싱, JWT 발급/검증(`get_current_user` 의존성)
- `app/websocket_manager.py` — 방별 커넥션 관리 + 전역 온라인 카운터(`online_counts`)로 presence 추적
- `app/main.py`:
  - `/auth/signup`, `/auth/login` — JWT 발급 (가입 시 잔액 100,000 지급). 가입 시 `security_question`/`security_answer` 필수
  - `/auth/check-username` (GET, `?username=`) — 아이디 중복 확인, `{available: bool}` 반환
  - `/auth/security-question` (GET, `?username=`) — 비밀번호 찾기 1단계, 해당 유저의 질문을 반환 (없는 유저면 404)
  - `/auth/reset-password` (POST) — 비밀번호 찾기 2단계, `username`+`security_answer`+`new_password`로 비밀번호 재설정. 답변은 대소문자/양끝 공백 무시하고 비교
  - `/users/me` (GET/PATCH) — GET은 인증 필요. PATCH는 `{nickname}` 바디로 닉네임 변경 (1자 이상 20자 이하, 공백만 있으면 400)
  - `/users` — 인증 필요. 나를 제외한 전체 가입자 목록을 `is_online` 포함해서 반환 (채팅방 초대 대상 검색용. 친구 개념 없이 전체 유저 중에서 바로 검색해서 초대하는 방식)
  - `/users/me` PATCH의 `profile_image_url`은 **두 가지 출처가 섞여 있는 필드**: (1) 커스텀 사진 업로드 시 `/upload`가 반환한 `/uploads/...` 경로(백엔드 서빙, `API_BASE` 접두사 필요) 또는 (2) 아바타 템플릿 선택 시 `/avatars/avatar_male.svg`/`avatar_female.svg`(프론트 `public/avatars/`에서 프론트 origin으로 직접 서빙, `Sticker.image_url`과 동일한 패턴 — `API_BASE`를 붙이면 dev 모드에서 깨짐). `SettingsSheet.jsx`에서 렌더링할 때 `/avatars/`로 시작하는지 여부로 분기해서 처리함
  - `/rooms` (POST/GET, `unread_count` 포함) — 방 생성/내 방 목록. `RoomOut`에 `last_message`(마지막 메시지 미리보기 텍스트)/`last_message_at`도 포함됨 — `_room_to_out()`이 매번 해당 방의 최신 메시지 1건을 조회(`ORDER BY id DESC LIMIT 1`)해서 채움. 미리보기 텍스트는 `_message_preview_text()`가 `message_type`별로 다르게 생성(`text`는 content 그대로, `image`/`file`/`sticker`는 "OO을 보냈습니다" 고정 문구, `money`는 "N원을 보냈습니다", `system`은 content 그대로). 메시지가 하나도 없는 방은 둘 다 `null`
  - **타임존 버그(수정됨)**: SQLite + `func.now()`로 저장되는 `DateTime(timezone=True)` 컬럼은 실제로는 UTC 값이 tzinfo 없이(naive) 저장/조회됨 — Pydantic이 이를 그대로 직렬화하면 `"2026-07-04T16:47:21"`처럼 UTC 오프셋 표시가 빠진 문자열이 나가고, 브라우저 JS의 `new Date(...)`는 오프셋 없는 ISO 문자열을 **로컬 타임존으로 해석**해버림. 그 결과 한국(UTC+9) 사용자가 방금 보낸 메시지의 시각이 실제보다 9시간 이전으로 계산되고, 자정 근처(00~09시 KST)에 보낸 메시지는 날짜 경계를 넘어가서 "오늘"인데 "어제"로 표시되는 버그가 있었음(방 목록에 `last_message_at`을 노출하면서 처음 드러남). `_room_to_out()`에서 `last_message_at.tzinfo is None`이면 `.replace(tzinfo=timezone.utc)`로 명시적으로 UTC를 태그해서 고침 — **앞으로 새로 노출하는 datetime 필드에도 이 패턴을 반드시 적용할 것** (현재 `MessageOut.created_at`/`read_at`은 프론트에서 날짜 비교 없이 truthy 체크만 하고 있어서 아직 버그가 안 드러났을 뿐, 근본적으로 같은 문제를 안고 있음)
  - `/rooms/{room_id}/members` (POST), `/rooms/{room_id}/members/me` (DELETE) — 멤버 추가/나가기. 나가기는 방장 개념 없이 누구나 동등하게 가능. 나간 사람 화면에서만 방이 사라지고 남은 멤버에게는 `message_type: "system"` 메시지("OOO님이 나갔습니다")가 브로드캐스트됨. 마지막 멤버까지 나가면 방과 메시지가 전부 자동 삭제됨
  - `/rooms/{room_id}/messages` — 방 멤버만 조회 가능
  - `/rooms/{room_id}/read` (POST) — 방을 읽음 처리 (RoomMember.last_read_message_id 갱신 → unread_count 리셋)
  - `/stickers` (GET) — 스티커 카탈로그 (서버 시작 시 캐릭터 이미지 36종 시드, 예전 이모지 8종은 자동 제거됨). `Sticker.image_url`은 프론트엔드 `public/stickers/`를 가리키는 경로(`/stickers/sticker_NN.png`)라 백엔드가 서빙하는 게 아니라 프론트 origin에서 바로 서빙됨 — `API_BASE`를 붙이면 안 됨(업로드 파일 `file_url`과는 다른 규칙이므로 헷갈리지 말 것)
  - `/wallet/me` (GET) — 내 잔액 조회
  - `/upload` — 파일 업로드(확장자 화이트리스트 + 10MB 제한, UUID 파일명, `backend/uploads/`에 로컬 저장 후 정적 서빙)
  - `/ws/{room_id}?token=...` — 채팅 WebSocket. `message_type`: text/image/file/sticker/money 지원
  - `/ws/presence?token=...` — 별도의 presence 전용 WebSocket (연결되어 있는 동안 `is_online=true`)
- `test_client.html` — 순수 HTML/JS로 만든 백엔드 단독 테스트용 페이지 (프론트엔드 대체 아님, API 스모크 테스트 용도로 유지)

`frontend/` — Vite + React (react-router-dom):
- **`ios-ipados-26-design-system/`** — iOS/iPadOS 26 디자인 시스템 (Figma에서 추출한 토큰 + 컴포넌트 레퍼런스). **디자인/UI 관련 작업은 항상 이 폴더를 먼저 참고할 것.** `styles.css`가 진입점이고 `tokens/`에 색상(`fig-tokens.css`, light/dark는 `:root[data-theme="dark"]` 선택자 기준)/타이포(`typography.css`)/spacing·radius·shadow(`spacing.css`)/블러·글래스(`materials.css`)가 있음. `_ds_bundle.js`에는 Button/NavigationBar/List/ListRow/TextField/Alert/Sheet/Badge/Icon 등 28개 컴포넌트의 원본 JSX 소스가 문자열로 들어있어(전역 스크립트 번들이라 Vite ESM에 직접 import 불가), 필요할 때 `node -e`로 특정 컴포넌트를 추출해서 스펙을 확인하고 우리 코드에 맞게 이식하는 방식으로 사용함
- `src/index.css` — `@import "../ios-ipados-26-design-system/styles.css"`로 토큰을 불러오고, 그 위에 앱 전용 클래스(nav-bar, grouped-card/list-row, message-bubble, alert/sheet 등)를 iOS 컴포넌트 스펙 그대로 재현. 자체 브랜드 컬러(민트/틸)는 폐기하고 DS의 시맨틱 토큰(`--tint`=accents-blue, `--surface-grouped`, `--text-primary` 등)을 그대로 사용
- `src/main.jsx` — DS 다크모드가 미디어 쿼리가 아니라 `data-theme` 속성 기준이라, `prefers-color-scheme`을 감지해서 `<html>`에 `data-theme` 속성을 동기화하는 코드 있음
- `src/components/Icon.jsx` — DS의 Icon.jsx를 ESM으로 이식한 SVG 글리프 세트 (SF Symbols 자체가 아니라 근사 재현). `chevron.left`, `magnifyingglass`, `checkmark.circle.fill` 등 이름으로 사용
- `src/components/Button.jsx` — DS의 Button.jsx를 이식한 캡슐형 버튼 (`variant`: filled/tinted/gray/bordered/plain, `size`: mini/small/medium/large, `destructive`, `block`)
- `src/api.js` — REST 클라이언트(fetch 래퍼, JWT 헤더 자동 첨부) + `wsUrl()` 헬퍼
- `src/context/AuthContext.jsx` — 토큰/유저를 localStorage에 영속화, signup/login/logout 제공
- `src/context/PresenceContext.jsx` — 로그인 상태인 동안 `/ws/presence` 커넥션을 앱 전역에서 하나 유지
- `src/pages/LoginPage.jsx` — 로그인/회원가입/비밀번호 찾기 3-모드 폼 (iOS 필드/캡슐 버튼 스타일). 회원가입 시 "중복확인" 버튼(아이디 중복 체크) + 비밀번호 찾기용 질문/답변 입력. 비밀번호 찾기는 아이디 입력 → 질문 표시 → 답변+새 비밀번호 입력의 2단계 플로우
- `src/pages/HomePage.jsx` — 상단 내비게이션 바 배경이 `public/말방구_타이틀배너.png`(브랜드 배너 이미지, 워드마크+태그라인 포함)로 채워짐 — `.home-nav-bar` 클래스가 배경을 담당하고, 중복되는 텍스트 "말방구" `h1`은 `.sr-only`로 시각적으로만 숨김(접근성용으로 DOM에는 유지). 배너가 컬러풀해서 계정정보 텍스트는 흰색+그림자로 강제 오버라이드함. 로그아웃 버튼은 `public/logout.png`(`.logout-icon`)를 DS의 SVG `Icon` 대신 직접 사용(원본의 밝은 회색 캔버스 배경은 투명 처리). 설정 버튼(`public/setting.png`)은 `.settings-circle-button`으로 배너 안에 그려진 흰색 원 장식 위에 정확히 겹치도록 절대 위치(`left/top/width/height`를 전부 %로) 배치됨 — 그 좌표는 PIL로 원본 이미지(2000×561)에서 원의 픽셀 범위(x 1725–1835, y 415–525)를 직접 측정해서 나온 값. grouped list 스타일 방 목록(방 개설자 프로필사진 원형 아바타, 방 제목+시간 한 줄/마지막 대화 미리보기+안읽음 배지 한 줄의 2줄 레이아웃, 그룹 표시, chevron, 5초 폴링). 시간 표시는 `formatLastMessageTime()`이 오늘이면 "오전/오후 HH:MM", 어제면 "어제", 그 이전이면 "M월 D일"로 포맷(모두 클라이언트 로컬 타임존 기준, `Date.toDateString()` 비교). 그룹방(`is_group`)은 제목 바로 뒤에 공백 없이 "(N명)" 인원수가 붙음(`.list-row-title` 안에 중첩된 `.list-row-member-count` 스팬 — 별도 flex 아이템으로 분리하면 title과의 flex gap 때문에 공백이 생겨서 요청받은 표기와 달라짐, 반드시 title 텍스트 안에 중첩시켜야 함). "+" 아이콘 버튼으로 `NewRoomDialog` 오픈. 친구 목록/추가 UI는 없음
- `src/pages/ChatRoomPage.jsx` — iOS Messages 앱과 동일한 톤의 반투명 내비게이션 바(뒤로가기 chevron+텍스트, 빨간 "방 나가기") + 파란/회색 말풍선(mine=`--tint` 채움, theirs=`--fill-tertiary`) + 반투명 블러 컴포저 툴바. 메시지 히스토리 로드 + WS 연결 + 텍스트/파일(📎)/스티커(😀 피커에서 캐릭터 이미지 36종 선택)/송금(💸) 전송, 입장 시 자동 읽음 처리. 텍스트 메시지 안의 `http(s)://` URL은 `linkify()`로 감지해 새 탭에서 열리는 클릭 가능한 링크로 렌더링(`rel="noopener noreferrer"`). 이미지 메시지는 `.message-bubble-image` 클래스로 말풍선 자체 패딩을 0으로 없애고 `overflow:hidden`으로 말풍선 모서리에 맞춰 이미지를 꽉 채움. 스티커 메시지는 `.message-bubble-sticker`로 말풍선 배경 자체를 투명하게 만들어 캐릭터 이미지만 떠 보이게 함(텍스트/파일/송금 메시지는 기존 색이 있는 말풍선 유지)
  - **카카오톡 스타일 메시지 그룹핑(완료)**: 메시지 목록을 평평하게 렌더링하지 않고 `groupMessages(messages, myUserId)`가 날짜 구분선(`date-divider`, 다른 날짜로 넘어갈 때마다 "YYYY년 M월 D일 요일" pill)/시스템 메시지/발신자 그룹(`message-group`)으로 분류함. 같은 발신자가 5분(`GROUP_GAP_MS`) 이내에 연속으로 보낸 메시지는 한 그룹으로 묶여서 아바타+이름을 한 번만 표시하고(`MessageGroup`), 시간(`formatBubbleTime()`, "오전/오후 H:MM" 포맷, 시간은 패딩 없음 — 방 목록의 `formatLastMessageTime()`과 다른 포맷이니 헷갈리지 말 것)과 읽음 표시는 그룹의 **마지막 메시지에만** 표시됨(`bubble-meta`가 mine이면 말풍선 왼쪽, theirs면 오른쪽에 위치). 그룹 내 각 말풍선은 `MessageBubble`(순수 말풍선 콘텐츠만 렌더링, 발신자/시간 표시 없음)로 렌더링
  - **타임존 버그(수정됨)**: 이 그룹핑 기능을 붙이면서 `MessageOut.created_at`/`read_at`과 WS `_message_broadcast_payload()`의 `created_at`도 위 `RoomOut.last_message_at`과 똑같은 naive-UTC-datetime 버그를 갖고 있다는 게 드러남(SQLite가 tzinfo 없이 반환 → JS가 로컬시간으로 오인). `schemas.py`의 `MessageOut`에 `field_validator`를 추가해서 naive datetime이면 UTC로 태깅하도록 고쳤고, `main.py`에 공용 헬퍼 `_iso_utc()`를 만들어 `_message_broadcast_payload()`에서도 재사용함 — 앞으로 새 datetime 필드를 프론트에 노출할 때 이 패턴을 빠뜨리면 자정 근처(00~09시 KST) 메시지가 날짜 경계를 잘못 넘어 표시되는 동일한 버그가 재발함
- `src/components/ConfirmDialog.jsx` — DS의 Alert.jsx 스펙대로 재구현 (270px 프로스티드 글래스 카드, hairline으로 구분된 버튼들, destructive는 빨간 텍스트). 브라우저 기본 `window.confirm()` 대체용, 파괴적이거나 되돌리기 힘든 액션(나가기 등) 확인에 재사용
- `src/components/NewRoomDialog.jsx` — DS의 Sheet.jsx 스펙대로 재구현 (하단에서 올라오는 grabber 핸들 바텀시트). 방 이름(선택) + 아이디 검색창 + 초대할 사람 체크리스트(list-row + 체크마크 아이콘). 열릴 때마다 `GET /users`로 전체 가입자 목록을 불러오고, 검색어로 클라이언트 사이드 필터링만 함(서버에 검색 파라미터 없음). "채팅방을 먼저 만들겠다고 누른 뒤 초대할 사람을 고르는" 순서로 설계됨. 한 명도 선택하지 않으면 확인 버튼이 비활성화됨
- `src/components/SettingsSheet.jsx` — 홈 화면 배너 우측 하단 원 위 톱니바퀴 아이콘으로 여는 바텀시트. 프로필 사진(원형 미리보기 + 사진 선택/업로드 + 남녀 아바타 템플릿 2종), 테마(자동/화이트/다크), 닉네임 변경, 채팅방 배경(프리셋 색상 6종 + 이미지 업로드 — 업로드 버튼 아이콘은 `public/photo.png`, 배경 투명 처리됨), 말풍선(글자 크기/글자색/내 말풍선 배경색/모양: 각진·둥근·알약형)을 한 곳에서 설정
- `src/components/ImageCropDialog.jsx` — 프로필 사진 업로드 시 뜨는 크롭 모달(외부 라이브러리 없이 순수 canvas로 구현). 260px 정사각 뷰포트에 이미지를 `object-fit:cover`처럼 초기 배치(짧은 변 기준 스케일)한 뒤, 포인터 드래그로 팬/슬라이더로 줌 가능. 원형 가이드는 `box-shadow: 0 0 0 9999px rgba(0,0,0,.45)`로 바깥을 어둡게 채우는 트릭. 확인 시 뷰포트에 보이는 영역만 400×400 캔버스에 `drawImage`로 그려 PNG Blob 추출 → `File`로 감싸서 기존 `/upload` 재사용. `SettingsSheet`가 파일 선택 즉시 업로드하지 않고 `URL.createObjectURL`로 미리보기 URL만 만들어 이 다이얼로그를 여는 구조(취소/언마운트 시 `URL.revokeObjectURL` 필수 — 안 하면 메모리 누수)
- `src/theme.js` — 테마 모드(`auto`/`light`/`dark`)를 `localStorage`(`malbanggu_theme_mode`)에 저장하고 `<html data-theme>`에 반영. `auto`일 때만 OS `prefers-color-scheme` 변경을 따라감
- `src/context/AppearanceContext.jsx` — 채팅방 배경(`chatBackground`: color/image)과 말풍선 스타일(`bubble`: fontSize/textColor/myBubbleColor/shape)을 `localStorage`(`malbanggu_appearance`)에 영속화하는 컨텍스트. `ChatRoomPage`가 이 값을 읽어 `.message-log` 배경과 말풍선 인라인 스타일에 직접 반영. 서버에 저장하지 않는 로컬(기기별) 설정임 — 카카오톡의 "채팅방 배경"처럼 다른 사람에게는 안 보이고 나한테만 적용됨
- `src/displayName.js` — `user.nickname || user.username`. 방 이름, 메시지 발신자 라벨, 초대 목록 등 사람 이름을 보여주는 모든 곳에서 이 헬퍼를 통해 닉네임 우선 표시

### 실행 방법
```
# 터미널 1
cd backend
./venv/Scripts/python -m uvicorn app.main:app --reload --port 8000

# 터미널 2
cd frontend
npm run dev
```
`http://localhost:5173`에서 회원가입 → "+ 채팅방 만들기"에서 초대할 사람 검색·선택 → 채팅.

## 로드맵

1. **핵심 뼈대 (완료)** — WebSocket 실시간 통신, 유저/방/메시지 3테이블, 읽음(1) 표시
2. **인증/유저 관리 (완료)** — 회원가입/로그인(JWT), 친구 추가/삭제(다대다 관계 테이블)
3. **그룹 채팅 + 미디어 (완료)** — 그룹방(이름/멤버 추가·나가기), 이미지/파일 전송(로컬 스토리지 + DB에는 경로만 저장)
4. **부가 기능 (완료)** — 이모티콘/스티커, 안읽은 메시지 카운트, 온라인/오프라인 상태(Presence), 톡 내 간단 송금(결제 시뮬레이터 대신 자체 wallet 기능으로 구현)
5. **React 프론트엔드 (완료)** — 로그인/홈/채팅방 3개 화면으로 백엔드 전 기능(인증, 그룹방, 미디어, 스티커, 송금, 안읽음, presence) 연결
6. **계정 관리 보강 (완료)** — 회원가입 아이디 중복확인, 보안 질문 기반 비밀번호 찾기
7. **친구 기능 제거 + 초대 방식 변경 (완료)** — 친구 추가/목록(Friendship) 기능을 백엔드·프론트 모두에서 완전히 삭제. 채팅방 생성 시 "미리 친구를 추가해야 하는" 흐름 대신, 방 만들기 모달 안에서 전체 가입자를 검색해 바로 다중 선택·초대하는 방식으로 변경
8. **iOS/iPadOS 26 디자인 시스템 전면 적용 (완료)** — 자체 민트/틸 브랜딩을 폐기하고 `ios-ipados-26-design-system/` 토큰·컴포넌트 스펙으로 전 화면 재설계 (나브바, grouped list, 캡슐 버튼, iOS Messages풍 말풍선, Alert/Sheet 모달)
9. **설정 화면 (완료)** — 홈 화면에 톱니바퀴 설정 버튼 추가. 테마(화이트/다크/자동), 닉네임, 채팅방 배경(색상/이미지), 말풍선(글자 크기·색상·배경색·모양) 커스터마이징

## 설계 메모
- `SECRET_KEY`는 `MALBANGGU_SECRET_KEY` 환경변수로 오버라이드 가능. 지금은 dev 기본값이므로 배포 전 반드시 설정 필요
- `Message.read_at`(1:1 "읽음 1" 표시)과 `RoomMember.last_read_message_id`(방 목록의 안읽은 개수 배지)는 서로 다른 목적의 별개 트래킹임 — 하나가 다른 하나를 대체하지 않음
- 업로드 파일은 로컬 디스크(`backend/uploads/`)에 저장 — 배포 시 S3 등으로 교체하려면 `main.py`의 `upload_file`/`UPLOAD_DIR`만 손보면 됨. 파일 삭제/정리 로직은 아직 없음
- 방 멤버가 아닌 사람이 그 방의 메시지를 못 읽도록 멤버십 체크를 추가함 (Phase 1~2 때는 인증만 있고 이 체크가 빠져 있었음)
- **송금(money) 기능은 데모용**: 실제 결제 게이트웨이 연동이 아니라 `User.balance`를 그대로 가감하는 인메모리 수준의 잔액 이동. 트랜잭션은 같은 DB 세션 커밋 안에서 원자적으로 처리되지만, 동시성(레이스 컨디션) 대비 락킹은 없음 — 실서비스 결제로 확장하려면 별도 설계 필요
- 송금은 반드시 같은 방의 멤버에게만 가능 (`recipient_id`가 room 멤버인지 확인). 그룹방에서는 특정 한 명을 지정해서 보내는 방식(정산/더치페이 기능은 없음)
- **송금 한도 초과 UX**: `ChatRoomPage`가 마운트 시 `GET /wallet/me`로 잔액을 가져와 송금 폼 아래 "보유 잔액" 힌트로 보여주고, 클라이언트에서 먼저 금액을 검사해서 초과 시 `ConfirmDialog`를 단일 버튼(정보성 알림) 모드로 띄움 — 서버가 WS로 `insufficient balance` 에러를 보내는 경우도 같은 팝업으로 처리(둘 다 안전망, 서버 쪽이 최종 검증). 금액 `<input>`에 `max` 속성을 걸어두면 브라우저 자체 검증 툴팁이 우리 팝업보다 먼저 폼 제출을 막아버려서 `<form noValidate>`를 반드시 같이 써야 함. `ConfirmDialog`는 `onCancel`이 없으면 자동으로 버튼 1개짜리 정보 알림으로 렌더링됨(취소 버튼 숨김, 오버레이 클릭도 확인과 동일 동작)
- **`ConfirmDialog`의 `message`에 `\n`으로 줄바꿈을 넣으려면 `.alert-message`에 `white-space: pre-line`이 있어야 함** — 기본값(`normal`)에서는 `\n`이 그냥 공백으로 합쳐져서 무시되고, 카드 너비(270px)에 맞춰 자연 줄바꿈만 일어나 의도한 위치와 다르게 잘림. `pre-line`을 넣은 뒤에는 `\n`이 실제 줄바꿈으로 렌더링됨
- **presence는 방 참여와 무관한 별도 WebSocket**(`/ws/presence`)으로 구현 — 특정 채팅방에 들어가 있지 않아도 앱을 켜놓으면 온라인으로 표시됨. 같은 유저가 여러 탭/창을 열 수 있으므로 온라인 카운트는 레퍼런스 카운팅(ref-count) 방식
- unread_count는 REST(`GET /rooms`) 폴링 기반 — 새 메시지가 와도 실시간 배지 갱신을 푸시하지는 않음 (방을 다시 열어야 최신화). 실시간 배지가 필요해지면 presence 채널을 통해 "새 메시지 알림"을 브로드캐스트하는 방식으로 확장 가능
- **프론트엔드는 홈 화면에서 5초 폴링**으로 방 목록/안읽음 배지를 갱신함 (실시간 푸시 아님, 위 unread_count 설계와 일관됨)
- **기존 방에 멤버 초대(완료)**: 대화방 헤더의 "초대" 텍스트 버튼(`.chat-header-actions`, 방 나가기 버튼 왼쪽 — 처음엔 "+" 아이콘이었다가 사용자 요청으로 텍스트 버튼으로 변경됨)으로 `InviteMemberDialog`(`NewRoomDialog`와 거의 동일한 검색+체크리스트 UI, 방 이름 입력만 없음)를 열어 `POST /rooms/{id}/members`(`api.addRoomMembers`) 호출. 이미 방에 있는 멤버는 후보 목록에서 자동 제외(`existingMemberIds`로 필터링). 초대 성공 시 나가기와 대칭되는 시스템 메시지("OOO님을 초대했습니다")가 WS로 브로드캐스트되고, 2명이던 방에 3번째 인원이 추가되면 백엔드가 `is_group`을 자동으로 `true`로 승격시킴
- 헤더에 "+" 버튼을 추가하면서 `.nav-bar-title`의 `max-width: 55%`가 그대로면 인원이 많아진 방 제목이 길어졌을 때 `.chat-header-actions`(아이콘+방 나가기)와 겹치는 버그가 있었음 — `.chat-header .nav-bar-title { max-width: 38%; }`로 채팅방 헤더에서만 더 좁게 오버라이드해서 고침. 헤더 오른쪽에 버튼을 더 추가하게 되면 이 값도 같이 재검토해야 함
- 예전 `friendships` 테이블이 이미 만들어진 DB 파일에는 그대로 남아있을 수 있음(마이그레이션 도구가 없어 `DROP TABLE`을 실행하지 않음) — 코드에서 더 이상 참조하지 않는 고아 테이블이라 무해하지만, 완전히 정리하려면 DB 파일을 새로 만들어야 함
- **API_BASE/wsUrl()은 `import.meta.env.DEV`로 분기됨** — 프로덕션 빌드에서는 빈 문자열(same-origin 상대경로)을 써서, 백엔드가 프론트 빌드 결과물을 같은 포트에서 서빙하는 단일 포트 배포 구조에서 브라우저가 어떤 도메인/IP로 접속하든 `fetch`/`wsUrl()`이 항상 현재 접속 origin을 그대로 사용함(`window.location.host` 기반). 반면 로컬 개발(`npm run dev`, 5173 포트)에서는 프론트와 백엔드가 서로 다른 origin(5173 vs 8000)이라 상대경로로는 백엔드에 닿을 수 없으므로, `API_BASE`를 `http://localhost:8000`으로 고정하는 분기가 반드시 필요함 — 한때 이 분기 없이 무조건 빈 문자열로 바꿨다가 dev 서버에서 모든 API 호출이 깨지는 회귀가 있었음(5173 자기 자신으로 요청이 가서 API가 아니라 SPA index.html이 응답하며 JSON 파싱 에러 발생)
- **프로덕션 배포는 단일 포트 구조**: `backend/app/main.py` 맨 아래에서 `frontend/dist`가 존재하면 `SPAStaticFiles`(커스텀 `StaticFiles` 서브클래스)를 `/`에 마운트해서 프론트 빌드 결과물을 백엔드와 같은 포트(예: 8000)로 서빙함. 이 마운트는 반드시 모든 API/WS 라우트 정의 **이후**에 위치해야 함(먼저 마운트되면 `/rooms` 같은 API 경로까지 정적 파일 마운트가 가로채 버림). `react-router-dom`의 `BrowserRouter`를 쓰기 때문에 `/rooms/5`처럼 실제 파일이 없는 클라이언트 라우트로 새로고침하면 일반 `StaticFiles`는 404를 내는데, `SPAStaticFiles`가 404를 잡아서 `index.html`로 폴백 응답하도록 오버라이드함(SPA 라우팅 필수 처리)
- 배포 시 프론트를 다시 빌드하려면 `frontend`에서 `npm run build`만 실행하면 됨(`dist/`가 갱신되고, 백엔드는 재시작 시 마운트를 다시 읽으므로 백엔드도 같이 재시작 필요). `dist/`는 `.gitignore`에 포함되어 있어 저장소에는 안 올라가고, 서버에서 직접 빌드해야 함
- 일반 단톡방처럼 방장/일반멤버 구분 없이 완전 수평적 구조 — "나가기"는 REST(`DELETE /rooms/{id}/members/me`)로 처리되고, 그 요청 핸들러 안에서 남은 멤버들에게 WS로 시스템 메시지를 직접 broadcast함 (WS 메시지를 보낸 게 아니라 REST 응답 처리 중에 서버가 직접 브로드캐스트하는 방식이라 `leave_room`이 `async def`로 되어 있음)
- CORS는 백엔드에서 `allow_origins=["*"]`로 열어둠 — 로컬 개발 전용 설정, 배포 전 프론트 도메인으로 좁혀야 함
- **비밀번호 찾기는 이메일/SMS 없이 보안 질문 방식으로 구현**. `GET /auth/security-question?username=`이 해당 유저 존재 여부와 질문 내용을 그대로 노출하므로(사용자 열거 공격에 취약), 프로덕션에서는 레이트리밋이나 캡차 같은 완화 조치가 필요함. 질문/답변은 회원가입 시 필수 입력이라 기존에 없던 계정에는 소급 적용 안 됨(스키마 변경으로 `users` 테이블에 컬럼 추가 — 마이그레이션 도구 없이 `create_all`만 쓰므로 기존 DB 파일이 있다면 삭제 후 새로 만들어야 함)
- 아이디 중복확인(`GET /auth/check-username`)은 회원가입 폼에서 버튼으로 명시적으로 트리거됨(자동 디바운스 체크 아님). 제출 시에도 서버가 한 번 더 검증하므로 버튼을 안 눌러도 중복 아이디로는 가입 불가
- **디자인 작업은 반드시 `frontend/ios-ipados-26-design-system/`을 먼저 확인**. `_ds_bundle.js`는 `window.<namespace>`에 컴포넌트를 등록하는 전역 스크립트 번들이라 우리 Vite ESM 앱에 그대로 import할 수 없음 — 필요한 컴포넌트가 있으면 번들에서 해당 섹션을 찾아 스펙(치수/색상/구조)만 확인하고 `src/components/`에 ESM으로 다시 작성하는 방식을 씀 (Icon, Button이 이렇게 이식된 예). 이 폴더 안에 똑같은 내용의 중복 하위 폴더(`ios-ipados-26-design-system-<uuid>/`)가 하나 더 있는데, 최상위 것만 참조하면 됨
- DS 다크모드는 `:root[data-theme="dark"]` 선택자 기준이라 `prefers-color-scheme` 미디어 쿼리만으로는 안 먹힘 — `main.jsx`의 테마 동기화 코드가 필수임. 이걸 지우면 다크모드가 깨짐
- **스키마 변경 시 기존 DB 파일을 지우지 말 것**: `main.py`에 `_migrate_add_missing_columns()` 함수를 만들어서, `create_all()`이 놓치는 "기존 테이블에 새 컬럼 추가"를 `ALTER TABLE ... ADD COLUMN`으로 직접 처리함(nickname 컬럼이 이렇게 추가됨). 앞으로 User/ChatRoom 등에 nullable 컬럼을 더 추가할 일이 있으면 이 함수에 체크를 추가하는 방식으로 확장 — DB 파일을 삭제하고 새로 만드는 건 최후의 수단(실제 계정 데이터가 있으므로 지양)
- 테마(`malbanggu_theme_mode`)와 채팅 외관(`malbanggu_appearance`)은 서버에 저장되지 않는 브라우저 로컬 설정 — 기기/브라우저를 바꾸면 초기화됨. 반면 닉네임은 계정 속성이라 백엔드 `User.nickname` 컬럼에 저장되고 모든 기기·다른 사용자 화면에 반영됨
- 말풍선 "글자색"은 기본이 `null`(테마별 기본 대비색 유지)인데, 설정 화면의 `<input type="color">`는 값이 비어있을 수 없어서 `#ffffff`를 fallback으로 보여줌 — 사용자가 실제로 흰색을 고른 게 아니라 아직 커스터마이징 안 한 상태와 구분이 안 되는 사소한 UX 트레이드오프임
- **CSS 명세도(specificity) 함정**: `:root[data-theme="dark"] .nav-bar`처럼 `:root`+속성선택자+클래스 조합은 클래스 2개(`.nav-bar.home-nav-bar`)보다 명세도가 높음(`:root`도 한 단위로 카운트됨). `.home-nav-bar` 배경 이미지가 다크모드에서 씹혔던 이유였음 — 다크모드를 오버라이드하는 새 규칙을 추가할 땐 `:root[data-theme="dark"] .선택자`까지 같이 명시해서 이겨야 함
- **배너 이미지는 `background-size: cover` + `aspect-ratio: 2000/561`(이미지 원본 실제 비율, PIL로 직접 확인한 값)를 반드시 같이 씀**. 처음엔 aspect-ratio 없이 내부 요소들의 고정 픽셀 높이(nav-bar-row 44px 등)로만 박스 높이가 정해져서 `cover`가 좌우를 크게 잘라냈고, 그다음엔 이미지 크기를 잘못 확인해서(Node.js로 PNG 헤더를 직접 파싱하다가 높이를 720으로 잘못 계산 — 실제는 561) `aspect-ratio: 2000/720`을 넣었는데도 비율이 안 맞아 계속 크롭됐음. **이미지 실제 픽셀 크기를 확인할 땐 `PIL(Pillow)`의 `Image.open(path).size`처럼 검증된 라이브러리를 쓸 것** — PNG 헤더를 직접 파싱하는 방식은 실수하기 쉬움. 이미지를 교체하게 되면 이 비율도 같이 갱신해야 함
- **`public/*.png` 아이콘의 배경 투명화는 이미지 구조에 따라 두 가지 방법을 씀**: (1) 아이콘이 단색 글리프(예: `setting.png`의 검정 톱니바퀴)면 픽셀 밝기를 그대로 알파값으로 바꾸는 방식(밝을수록 투명, 어두울수록 불투명)이 안티에일리어싱 경계까지 자연스럽게 처리됨. (2) 아이콘 내부에 배경과 비슷한 밝은 색(흰색 텍스트/아이콘 등)이 섞여 있으면(예: `logout.png`의 파란 버튼 안 흰색 전원 기호+텍스트) 밝기 기준 방식은 내부까지 투명하게 뚫어버리므로, 대신 캔버스 바깥쪽 배경과 연결된 픽셀만 골라내는 플러드필(flood fill, 네 모서리에서 BFS)로 처리해야 내부의 흰색 디테일이 보존됨
- **스티커 이미지(`public/stickers/sticker_NN.png`)는 `public/emoticon.png`(4열×9행 캐릭터 시트, 이모티콘 원본)를 PIL로 셀 단위 크롭 후 셀마다 개별적으로 플러드필 투명화해서 만듦**. 백엔드 `_seed_stickers()`가 서버 시작 시 옛날 이모지 8종(`smile`/`laugh`/...)을 이름으로 찾아 삭제하고, 새 캐릭터 36종을 이름 기준으로 없는 것만 추가함(멱등성 유지 — 재시작해도 같은 스티커가 같은 id를 유지해서 기존 메시지의 `sticker_id` 참조가 깨지지 않음). **WS 브로드캐스트용 `_message_broadcast_payload()`가 sticker 정보를 수동으로 dict로 만드는 부분에 `image_url`을 빠뜨렸던 버그가 있었음** — REST(`GET /rooms/{id}/messages`)는 Pydantic이 ORM 객체를 그대로 매핑해서 문제없었지만, WS로 실시간 전송되는 스티커 메시지만 이미지가 안 뜨는 버그로 나타났음. 새 필드를 메시지 페이로드에 추가할 때는 REST 스키마뿐 아니라 이 수동 dict 생성 함수도 같이 업데이트해야 함
- **배너 안 특정 그래픽 요소(원, 별 등) 위에 버튼을 정확히 겹치려면 `%` 단위 절대 위치를 씀**: `.home-nav-bar`는 `aspect-ratio`로 고정돼 있으므로, `left/top/width/height`를 전부 원본 이미지 픽셀 좌표 기준 `%`로 넣으면 뷰포트 폭이 달라져도 항상 같은 그래픽 요소 위에 정확히 겹쳐짐(px 고정값을 쓰면 반응형에서 어긋남). 배너 이미지를 교체하면 이 좌표들도 새 이미지에서 다시 측정해야 함
