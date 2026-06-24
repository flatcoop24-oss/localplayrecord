/*
  LOCAL PLAY RECORD 사이트 설정 파일
  - 오늘의 라이브, 오늘의 뮤지션, 게스트 뮤지션은 이 파일만 수정하면 바뀝니다.
  - GitHub에서 이 파일을 수정하고 Commit changes를 누르면 GitHub Actions가 자동으로 배포합니다.
  - 자주 수정하는 곳은 currentEvent와 musicians입니다.
  - sheetEndpoint가 비어 있으면 브라우저 로컬 저장소에만 저장됩니다.
  - 실제 운영에서는 apps-script/Code.gs를 Google Apps Script에 배포한 뒤 Web App URL을 sheetEndpoint에 넣어주세요.
*/
window.LPR_CONFIG = {
  brandName: 'LOCAL PLAY RECORD',
  shortName: '로플레',
  venueName: '로컬플레이레코드',
  instagramUrl: 'https://www.instagram.com/',
  contactText: '공연/대관/협업 문의는 인스타그램 DM으로 연락해주세요.',

  // Google Apps Script Web App URL. 예: 'https://script.google.com/macros/s/AKfycb.../exec'
  sheetEndpoint: '',

  // 관리자 화면은 정적 페이지용 간이 기능입니다. 실제 운영 데이터 관리는 Google Sheet에서 하는 것을 권장합니다.
  adminPassword: 'lpr-admin',

  // 오늘의 라이브 정보: 행사명, 날짜, 시작 시간, 접수 상태를 여기서 바꿉니다.
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

  // 오늘의 뮤지션/게스트 뮤지션: name, genre, bio, time만 바꿔도 사이트에 반영됩니다.
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
        paragraphs[1].innerHTML = '오늘의 라이브, 오늘의 뮤지션, 게스트 뮤지션은 GitHub의 <strong>config.js</strong> 파일에서 수정하면 자동배포됩니다.';
      }
      if (paragraphs[2]) {
        paragraphs[2].textContent = '이 화면은 같은 브라우저에서 접수된 로컬 데이터 확인과 CSV 내보내기를 지원합니다. 실제 운영 데이터는 Google Sheet 연결을 권장합니다.';
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }
})();
