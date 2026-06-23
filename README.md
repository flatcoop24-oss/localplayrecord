# LOCAL PLAY RECORD 신청곡·뮤지션 응원하기 홈페이지

로컬플레이레코드 현장 방문객이 QR코드로 접속해 신청곡을 남기고, 오늘의 뮤지션에게 응원 메시지를 보낼 수 있는 GitHub Pages용 정적 웹사이트입니다.

## 이번 디자인 개편 반영 사항

- `sellbuymusic.com/ko` 레퍼런스처럼 음악 플랫폼형 첫인상을 주는 히어로 화면으로 개편
- 흰 배경 + 블랙 인터페이스 + 민트 포인트 컬러의 프리미엄 음악 서비스 톤 적용
- 음악 차트/플레이어 느낌의 트랙 리스트, 웨이브폼, 랭킹 UI 추가
- `HOT REQUEST FLOW`, `BGM PLAYLIST MOOD`, `LINE-UP`, `ARCHIVE` 섹션 구성
- 모바일 QR 접속 환경을 고려한 반응형 레이아웃 유지
- 좌석/테이블 번호 입력 항목 없음
- 신청곡 접수 폼, 뮤지션 응원 메시지 폼, 간이 관리자, CSV 내보내기 유지
- Google Apps Script + Google Sheet 저장 연동 코드 포함
- GitHub Actions 기반 GitHub Pages 배포 워크플로 포함

## 파일 구조

```text
local-play-record-site/
├── index.html
├── config.js
├── 404.html
├── robots.txt
├── .nojekyll
├── assets/
│   ├── styles.css
│   └── app.js
├── apps-script/
│   └── Code.gs
└── .github/
    └── workflows/
        └── pages.yml
```

## 먼저 수정할 파일

대부분의 운영 정보는 `config.js`에서 수정합니다.

```js
window.LPR_CONFIG = {
  brandName: 'LOCAL PLAY RECORD',
  shortName: '로플레',
  venueName: '로컬플레이레코드',
  instagramUrl: 'https://www.instagram.com/',
  sheetEndpoint: '',
  adminPassword: 'lpr-admin',
  currentEvent: {
    id: 'lpr-live-2026-06',
    title: '오늘의 로플레 라이브',
    dateLabel: '오늘',
    startTime: '19:30',
    requestOpen: true,
    supportOpen: true
  },
  musicians: [ ... ]
};
```

### 운영 전 권장 수정

1. `instagramUrl`을 실제 로컬플레이레코드 인스타그램 주소로 변경
2. `currentEvent.id`를 공연별로 변경
   - 예: `lpr-live-2026-07-05`
   - 이 값이 바뀌면 브라우저 로컬 저장 데이터도 공연별로 분리됩니다.
3. `currentEvent.title`, `dateLabel`, `startTime` 수정
4. `musicians` 배열의 뮤지션명, 장르, 소개, 공연 시간 수정
5. `adminPassword` 변경
6. 실제 운영 저장을 위해 `sheetEndpoint` 연결

## GitHub Pages 배포 방법

### 방법 A: GitHub Actions로 배포

이 프로젝트에는 `.github/workflows/pages.yml` 파일이 포함되어 있습니다.

1. GitHub에서 새 저장소를 만듭니다.
2. 이 폴더 안의 모든 파일을 저장소 루트에 업로드합니다.
3. 저장소 `Settings > Pages`로 이동합니다.
4. `Build and deployment > Source`를 `GitHub Actions`로 선택합니다.
5. `main` 브랜치에 push하면 자동 배포됩니다.

배포 후 주소는 보통 아래 형식입니다.

```text
https://사용자명.github.io/저장소명/
```

### 방법 B: 브랜치 루트에서 바로 배포

빌드 과정이 없는 정적 사이트라서 브랜치 배포도 가능합니다.

1. 파일을 저장소 루트에 업로드합니다.
2. 저장소 `Settings > Pages`로 이동합니다.
3. Source를 `Deploy from a branch`로 선택합니다.
4. Branch는 `main`, folder는 `/root`를 선택합니다.
5. 저장합니다.

## 실제 신청곡/응원 데이터를 Google Sheet에 저장하기

GitHub Pages는 정적 사이트이므로 자체 데이터베이스가 없습니다. 실제 매장에서 여러 방문객의 신청곡을 모으려면 Google Apps Script Web App을 Google Sheet와 연결하는 방식이 가장 간단합니다.

### 1. Google Sheet 만들기

새 Google Sheet를 만들고 이름을 예를 들어 `LOCAL PLAY RECORD Submissions`로 지정합니다.

### 2. Apps Script 연결

1. Google Sheet에서 `확장 프로그램 > Apps Script`를 엽니다.
2. 기본 코드 내용을 지웁니다.
3. `apps-script/Code.gs` 파일 내용을 전체 복사해 붙여넣습니다.
4. 저장합니다.

### 3. Web App으로 배포

1. Apps Script 우측 상단 `Deploy > New deployment`를 클릭합니다.
2. 배포 유형에서 `Web app`을 선택합니다.
3. 권장 설정:
   - Execute as: `Me`
   - Who has access: `Anyone`
4. Deploy를 누릅니다.
5. 생성된 Web App URL을 복사합니다.

### 4. config.js에 엔드포인트 붙이기

```js
sheetEndpoint: '복사한_Web_App_URL'
```

이후 신청곡은 `Requests` 시트에, 응원 메시지는 `Supports` 시트에 자동 저장됩니다.

## 관리자 화면 안내

사이트 하단 또는 메뉴의 `관리자`로 이동하면 간이 관리자 화면이 있습니다.

- 비밀번호는 `config.js`의 `adminPassword` 값입니다.
- 이 화면은 같은 브라우저에 저장된 로컬 데이터 확인용입니다.
- 여러 방문객이 보낸 실제 운영 데이터는 Google Sheet에서 확인하는 것을 권장합니다.
- CSV 다운로드는 로컬 저장 데이터 기준입니다.

## QR코드 운영 방식

1. GitHub Pages 배포 주소를 복사합니다.
2. QR코드 생성 서비스에서 해당 URL로 QR코드를 만듭니다.
3. 매장 포스터, 안내판, 공연 안내 이미지, 인스타그램 스토리에 배치합니다.
4. 공연별로 `currentEvent.id`, 제목, 라인업만 수정해 재사용합니다.

## 권장 운영 문구

신청곡 안내:

> 공연과 공간 분위기에 따라 모든 신청곡이 반영되지는 않을 수 있어요. 그래도 남겨주신 신청곡은 로플레의 음악 기록으로 소중히 보관됩니다.

응원 안내:

> 응원이 전달됐어요. 당신의 한마디가 다음 무대를 만드는 힘이 됩니다.

## 주의 사항

- GitHub Pages에 올라가는 파일은 공개될 수 있으므로 민감한 정보나 비공개 API 키를 넣지 마세요.
- `adminPassword`는 정적 페이지에 포함되므로 강한 보안 기능이 아닙니다. 간이 확인용으로만 사용하세요.
- Apps Script Web App URL은 공개 제출 엔드포인트가 됩니다. 장난성 입력이 많아지면 Google Sheet에서 필터링하거나 Apps Script에 추가 검증을 넣어야 합니다.
- 신청곡을 “무조건 재생/연주”한다고 표현하지 말고, 현장 분위기에 따라 반영된다고 안내하는 것이 안전합니다.

## 다음 확장 아이디어

- 뮤지션별 프로필 상세 페이지
- 공연별 아카이브 페이지
- 인스타그램 공유용 카드 자동 생성
- Supabase/Firebase 기반 실시간 관리자 대시보드
- 후원 결제 기능
