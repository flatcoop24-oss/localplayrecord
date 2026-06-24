/*
  LOCAL PLAY RECORD 사이트 설정 파일
  - Google Apps Script Web App URL을 sheetEndpoint에 넣으면 Google Sheet 운영 시트가 사이트의 원본 데이터가 됩니다.
  - 오늘의 라이브는 Settings 탭, 오늘의 뮤지션/게스트 뮤지션은 Musicians 탭에서 수정합니다.
  - 신청곡은 Requests 탭에, 응원 메시지는 Supports 탭에 누적 저장됩니다.
  - sheetEndpoint가 비어 있으면 아래 config.js 기본값과 브라우저 로컬 저장소로만 작동합니다.
  - 운영 시트: https://docs.google.com/spreadsheets/d/1On8Nv8jNJpan2siqLuZMGGKSGcGGHxG7p_oiIsEJjYI/edit
*/
window.LPR_CONFIG = {
  brandName: 'LOCAL PLAY RECORD',
  shortName: '로플레',
  venueName: '로컬플레이레코드',
  instagramUrl: 'https://www.instagram.com/',
  contactText: '공연/대관/협업 문의는 인스타그램 DM으로 연락해주세요.',

  // Google Apps Script Web App URL. 예: 'https://script.google.com/macros/s/AKfycb.../exec'
  sheetEndpoint: 'https://script.google.com/macros/s/AKfycbzRWQ8w_sarODa0AAIFuaJaBiBrKBva5q1AkiYLkVCvD1H2TK7CuM5rSQLzCTIsHpSX/exec',
  remoteConfigTimeoutMs: 6000,

  // 관리자 화면은 정적 페이지용 간이 기능입니다. 실제 운영 데이터 관리는 Google Sheet에서 하는 것을 권장합니다.
  adminPassword: 'lpr-admin',

  // sheetEndpoint 연결 전 fallback 값입니다. 연결 후에는 Settings 탭 값이 우선 적용됩니다.
  currentEvent: {
    id: 'lpr-live-2026-06',
    title: '오늘의 로플레 라이브',
    dateLabel: '오늘',
    startTime: '19:30',
    requestOpen: true,
    supportOpen: true,
    description: '오늘 이 공간에서 듣고 싶은 음악과 무대에 대한 응원을 남겨주세요.'
  },

  moods: [
    '잔잔하게',
    '신나게',
    '위로받고 싶어요',
    '같이 부르고 싶어요',
    '그냥 이 노래가 좋아요'
  ],

  emojis: ['👏', '🖤', '🔥', '🎧', '🌙', '✨'],

  // sheetEndpoint 연결 전 fallback 라인업입니다. 연결 후에는 Musicians 탭 값이 우선 적용됩니다.
  musicians: [
    {
      id: 'today-musician',
      name: '오늘의 뮤지션',
      genre: 'Live / Acoustic',
      bio: '로컬플레이레코드의 오늘 무대를 채우는 뮤지션입니다.',
      time: '19:30',
      instagramUrl: '',
      youtubeUrl: '',
      colorLabel: 'LIVE'
    },
    {
      id: 'guest-musician',
      name: '게스트 뮤지션',
      genre: 'Local Artist',
      bio: '지역의 감각을 음악으로 기록하는 게스트 뮤지션입니다.',
      time: '20:20',
      instagramUrl: '',
      youtubeUrl: '',
      colorLabel: 'GUEST'
    }
  ],

  archiveSamples: [
    {
      date: '2026.06',
      title: '로플레 라이브 기록',
      description: '신청곡과 응원 메시지가 쌓이면 이 영역에 지난 공연 기록을 보여줄 수 있습니다.'
    }
  ]
};

(function installLocalPlayRecordLogo() {
  var logoUrl = 'assets/logo.png';

  function install() {
    if (!document.getElementById('lpr-logo-style')) {
      var style = document.createElement('style');
      style.id = 'lpr-logo-style';
      style.textContent = [
        '.brand-mark { display: inline-grid !important; place-items: center; justify-content: center; width: 48px; height: 48px; padding: 2px; border-radius: 50% !important; background: #fff url("' + logoUrl + '") center / 44px 44px no-repeat !important; overflow: hidden; }',
        '.brand-mark span { display: none !important; }',
        '.brand-mark::before { content: ""; display: block; width: 44px; height: 44px; background: url("' + logoUrl + '") center / contain no-repeat; }',
        '.hero-copy::before { content: ""; display: block; width: clamp(128px, 16vw, 160px); aspect-ratio: 1; margin: 0 0 28px; background: url("' + logoUrl + '") center / contain no-repeat; filter: drop-shadow(0 24px 42px rgba(15, 23, 42, 0.18)); }',
        '.disc { border-radius: 50% !important; background: #fff url("' + logoUrl + '") center / contain no-repeat !important; box-shadow: 0 24px 50px rgba(0, 0, 0, 0.34); }',
        '.disc::after, .disc i { display: none !important; }',
        '@media (max-width: 420px) { .brand-mark { width: 38px; height: 38px; } }'
      ].join('\n');
      document.head.appendChild(style);
    }

    var adminCopy = document.querySelector('#admin .section-copy');
    if (adminCopy) {
      var paragraphs = adminCopy.querySelectorAll('p');
      if (paragraphs[1]) {
        paragraphs[1].innerHTML = '오늘의 라이브, 오늘의 뮤지션, 게스트 뮤지션은 <strong>Google Sheet 운영 시트</strong>의 Settings/Musicians 탭에서 수정합니다.';
      }
      if (paragraphs[2]) {
        paragraphs[2].textContent = '신청곡과 응원 메시지는 Web App 연결 후 Google Sheet의 Requests/Supports 탭에 누적됩니다. 이 화면은 현재 브라우저 로컬 데이터 확인용입니다.';
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }
})();
