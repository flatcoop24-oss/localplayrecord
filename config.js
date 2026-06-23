/*
  LOCAL PLAY RECORD 사이트 설정 파일
  - GitHub Pages에 올린 뒤에도 이 파일만 수정하면 행사명/뮤지션/저장 엔드포인트를 바꿀 수 있습니다.
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

  musicians: [
    {
      id: 'artist-01',
      name: '오늘의 뮤지션',
      genre: 'Live / Acoustic',
      bio: '로컬플레이레코드의 오늘 무대를 채우는 뮤지션입니다.',
      time: '19:30',
      instagramUrl: '',
      youtubeUrl: '',
      colorLabel: 'LIVE'
    },
    {
      id: 'artist-02',
      name: '로컬 게스트',
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
