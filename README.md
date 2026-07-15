# soop-chat-collector

SOOP 채팅 수집기입니다.

SOOP 라이브 방송 채팅과 별풍선을 수집해 통계 내는 Electron 데스크톱 앱입니다.

OBS, 프릭샷 등의 브라우저 소스 기능으로 오버레이를 띄울 수도 있습니다.

## 주요 기능

- SOOP 방송 채팅방 연결
- 채팅 메시지 및 별풍선, 영상풍선, 애드벌룬 데이터 수집
- 수집한 데이터 CSV로 내보내기
- 채팅 순위 표시 및 화면 커스텀 가능
- 별풍선 순위 표시 및 화면 커스텀 가능
- 각 순위 화면을 브라우저 소스용 오버레이 URL로 복사

## 시작하기

### 의존성 설치

```bash
pnpm install
```

### 개발 실행

```bash
pnpm run dev
```

### 프로덕션 빌드

```bash
pnpm run build
```

빌드 결과물은 `release` 디렉터리에 생성됩니다.

### 코드 정리 및 검사

```bash
pnpm run format
pnpm run lint
pnpm run check
pnpm run reporter
```

### 환경 변수

개발 모드에서는 Vite 개발 서버가 Electron 내부 API 서버로 `/api` 요청을 프록시합니다. `.env`에 API 서버 포트를 지정합니다.

```env
VITE_API_PORT=3000
```

## 사용 방법

1. `수집` 탭을 엽니다.
2. `SOOP ID`에 채팅을 읽을 스트리머의 SOOP ID를 입력합니다.
3. `수집 시작` 버튼을 눌러 채팅 수집을 시작합니다.
   - 버튼을 누른 순간부터 수집이 시작되니 정확한 순위를 위해서는 방송 시작하자마자 수집을 시작해야 합니다.
4. `채팅 순위` 탭에서 오버레이 URL을 복사해 OBS 또는 프릭샷의 브라우저 소스에 추가합니다.
5. `별풍선 순위` 탭에서 오버레이 URL을 복사해 OBS 또는 프릭샷의 브라우저 소스에 추가합니다.
6. 순위 화면을 보여주기 전 `수집 중지` 버튼을 눌러서 중지 후에 보여주기를 권장합니다. (순위가 나오는 도중에 데이터가 바뀌면 화면이 꼬일 가능성이 있습니다.)
7. 수집된 데이터는 앱 재실행 후에도 남아 있으니 새로 시작하고 싶다면 `수집` 탭에서 `수집 데이터 초기화` 버튼을 눌러야 합니다.

### 채팅 순위

```html
<div class="root">
  <div class="item">
    <div class="image"></div>
    <div class="text">
      <span class="rank">1</span>
      <span class="username">닉네임</span>
      <span class="chat-count">채팅수</span>
    </div>
  </div>
  ...
</div>
```
- 채팅 순위의 DOM 구조는 위와 같은 형태입니다.
- `커스텀 CSS`로 자유롭게 스타일 지정이 가능합니다.
- `채팅 개수 보이기`가 off 상태면 div.chat-count가 렌더링 되지 않습니다.
- 만약 `커스텀 CSS`에서 애니메이션을 설정했다면 `재생/정지`에서 `재생` 버튼을 눌러야 CSS 애니메이션이 재생됩니다.

### 별풍선 순위

```html
<div class="root">
  <div class="item">
    <div class="image"></div>
    <div class="text">
      <span class="rank">1</span>
      <span class="username">닉네임</span>
      <span class="total-donation">별풍선수</span>
    </div>
  </div>
  ...
</div>
```
- 별풍선 순위의 DOM 구조는 위와 같은 형태입니다.
- `커스텀 CSS`로 자유롭게 스타일 지정이 가능합니다.
- `별풍선 개수 보이기`가 off 상태면 div.total-donation이 렌더링 되지 않습니다.
- 만약 `커스텀 CSS`에서 애니메이션을 설정했다면 `재생/정지`에서 `재생` 버튼을 눌러야 CSS 애니메이션이 재생됩니다.

## 프로젝트 구조

```text
.
├─ electron/            # Electron 메인 프로세스와 Fastify API
├─ public/              # 아이콘 등 정적 자산
├─ src/                 # 화면 UI
│  ├─ components/       # UI 컴포넌트
│  ├─ hooks/            # renderer 훅
│  └─ utils/            # 범용 유틸리티
├─ dist/                # 렌더러 빌드 결과물
├─ dist-electron/       # Electron 빌드 결과물
└─ release/             # 배포 산출물
```
