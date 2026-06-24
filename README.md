# LOCAL PLAY RECORD 신청곡·뮤지션 응원하기 홈페이지

로컬플레이레코드 방문객이 QR코드로 접속해 신청곡을 남기고, 오늘의 뮤지션에게 응원 메시지를 보낼 수 있는 GitHub Pages용 정적 웹사이트입니다. 운영자는 Google Sheet에서 오늘의 라이브, 오늘의 뮤지션, 게스트 뮤지션을 수정하고, 신청곡/응원 데이터는 같은 시트에 계속 누적할 수 있습니다.

## 현재 구조

- 공개 사이트: `https://flatcoop24-oss.github.io/localplayrecord/`
- 운영 시트: `https://docs.google.com/spreadsheets/d/1On8Nv8jNJpan2siqLuZMGGKSGcGGHxG7p_oiIsEJjYI/edit`
- GitHub Pages 정적 사이트 + GitHub Actions 자동 배포
- Google Apps Script Web App이 Google Sheet를 읽기/쓰기 API처럼 사용
- `Settings`, `Musicians`, `Archive` 탭은 홈페이지 표시 설정
- `Requests`, `Supports` 탭은 신청곡/응원 메시지 DB

## 파일 구조

```text
localplayrecord/
├── index.html
├── config.js
├── assets/
│   ├── app.js
│   ├── styles.css
│   └── logo.png
├── apps-script/
│   └── Code.gs
└── .github/
    └── workflows/
        └── pages.yml
```

## Google Sheet 운영 방법

### Settings 탭

오늘의 라이브 기본 정보를 수정합니다.

- `eventId`: 공연별 고유 ID. 예: `lpr-live-2026-07-05`
- `eventTitle`: 오늘의 라이브 제목
- `dateLabel`: 화면에 보여줄 날짜 문구
- `startTime`: 시작 시간
- `requestOpen`: 신청곡 접수 여부. `TRUE/FALSE`, `접수/마감` 모두 가능
- `supportOpen`: 응원 메시지 접수 여부
- `description`: 라이브 소개 문구
- `moods`: 신청곡 분위기 옵션. `잔잔하게|신나게|위로받고 싶어요`처럼 `|`로 구분
- `emojis`: 응원 이모지 옵션. `👏|🖤|🔥`처럼 `|`로 구분

### Musicians 탭

오늘의 뮤지션과 게스트 뮤지션을 수정합니다.

- `active`: 홈페이지 노출 여부
- `id`: 영문/숫자/하이픈 조합 권장. 예: `today-musician`
- `name`: 뮤지션 이름
- `genre`: 장르 또는 소개 라벨
- `bio`: 짧은 소개
- `time`: 공연 시간
- `instagramUrl`, `youtubeUrl`: 선택 입력
- `colorLabel`: `LIVE`, `GUEST` 같은 카드 라벨
- `sortOrder`: 낮을수록 먼저 표시

### Requests / Supports 탭

방문객이 제출한 데이터가 자동으로 쌓입니다. 현장 운영 중에는 이 두 탭을 DB처럼 보고 필터링하면 됩니다.

- `Requests`: 신청곡, 아티스트명, 사연, 공개 동의 여부
- `Supports`: 뮤지션별 응원 메시지, 이모지, SNS ID, 공개 동의 여부

### Archive 탭

지난 공연 기록이나 공개하고 싶은 샘플 기록을 홈페이지 아카이브 영역에 보여줄 때 사용합니다.

## Apps Script Web App 연결

Google 계정 권한 승인이 필요해서 이 단계는 운영자 계정에서 한 번 직접 해야 합니다.

1. 운영 시트를 엽니다.
2. `확장 프로그램 > Apps Script`를 클릭합니다.
3. `apps-script/Code.gs` 내용을 전체 붙여넣고 저장합니다.
4. `Deploy > New deployment`를 클릭합니다.
5. 배포 유형을 `Web app`으로 선택합니다.
6. 권장 설정은 `Execute as: Me`, `Who has access: Anyone`입니다.
7. Deploy 후 생성되는 `/exec` Web App URL을 복사합니다.
8. GitHub의 `config.js`에서 `sheetEndpoint: ''`에 URL을 넣고 Commit changes를 누릅니다.
9. GitHub Actions가 자동 배포하면 사이트가 시트와 연결됩니다.

연결 후 사이트는 접속 시 `Settings`, `Musicians`, `Archive` 값을 먼저 읽어 화면을 구성하고, 신청곡/응원 제출은 `Requests`, `Supports`에 저장합니다.

## 자동 배포

`.github/workflows/pages.yml`이 포함되어 있어 `main` 브랜치에 커밋되면 GitHub Actions가 GitHub Pages로 자동 배포합니다.

배포 상태는 GitHub 저장소의 `Actions` 탭에서 확인할 수 있습니다.

## 관리자 화면

사이트의 관리자 영역은 같은 브라우저에 임시 저장된 로컬 데이터 확인용입니다. 실제 여러 방문객이 보낸 운영 데이터는 Google Sheet의 `Requests`, `Supports` 탭에서 보는 것을 권장합니다.

## QR코드 운영

1. 공개 사이트 주소를 QR코드로 만듭니다.
2. 포스터, 테이블 안내판, 인스타그램 스토리에 배치합니다.
3. 공연 당일에는 Google Sheet의 `Settings`, `Musicians` 탭만 수정합니다.
4. 신청곡/응원은 자동으로 시트에 쌓입니다.

## 주의 사항

- GitHub Pages에 올라가는 파일은 공개될 수 있으므로 비공개 API 키를 넣지 마세요.
- `adminPassword`는 정적 페이지에 포함되므로 강한 보안 기능이 아닙니다.
- Apps Script Web App URL은 공개 제출 엔드포인트입니다. 장난성 입력이 많아지면 Apps Script에 추가 검증을 넣어야 합니다.
- 신청곡을 “무조건 재생/연주”한다고 표현하지 말고, 현장 분위기에 따라 반영된다고 안내하는 것이 안전합니다.

## 다음 확장 아이디어

- 신청곡 승인/보류 상태 관리
- 뮤지션별 공개 응원 wall
- 공연별 아카이브 자동 생성
- 인스타그램 공유용 카드 자동 생성
- Supabase/Firebase 기반 실시간 관리자 대시보드
