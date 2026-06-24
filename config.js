/*
  LOCAL PLAY RECORD \uc0ac\uc774\ud2b8 \uc124\uc815 \ud30c\uc77c
  - \uc624\ub298\uc758 \ub77c\uc774\ube0c, \uc624\ub298\uc758 \ubba4\uc9c0\uc158, \uac8c\uc2a4\ud2b8 \ubba4\uc9c0\uc158\uc740 \uc774 \ud30c\uc77c\ub9cc \uc218\uc815\ud558\uba74 \ubc14\ub01d\ub2c8\ub2e4.
  - GitHub\uc5d0\uc11c \uc774 \ud30c\uc77c\uc744 \uc218\uc815\ud558\uace0 Commit changes\ub97c \ub204\ub974\uba74 GitHub Actions\uac00 \uc790\ub3d9\uc73c\ub85c \ubc30\ud3ec\ud569\ub2c8\ub2e4.
  - \uc790\uc8fc \uc218\uc815\ud558\ub294 \uacf3\uc740 currentEvent\uc640 musicians\uc785\ub2c8\ub2e4.
  - sheetEndpoint\uac00 \ube44\uc5b4 \uc788\uc73c\uba74 \ube0c\ub77c\uc6b0\uc800 \ub85c\uceec \uc800\uc7a5\uc18c\uc5d0\ub9cc \uc800\uc7a5\ub429\ub2c8\ub2e4.
  - \uc2e4\uc81c \uc6b4\uc601\uc5d0\uc11c\ub294 apps-script/Code.gs\ub97c Google Apps Script\uc5d0 \ubc30\ud3ec\ud55c \ub4a4 Web App URL\uc744 sheetEndpoint\uc5d0 \ub123\uc5b4\uc8fc\uc138\uc694.
*/
window.LPR_CONFIG = {
  brandName: 'LOCAL PLAY RECORD',
  shortName: '\ub85c\ud50c\ub808',
  venueName: '\ub85c\uceec\ud50c\ub808\uc774\ub808\ucf54\ub4dc',
  instagramUrl: 'https://www.instagram.com/',
  contactText: '\uacf5\uc5f0/\ub300\uad00/\ud611\uc5c5 \ubb38\uc758\ub294 \uc778\uc2a4\ud0c0\uadf8\ub7a8 DM\uc73c\ub85c \uc5f0\ub77d\ud574\uc8fc\uc138\uc694.',

  // Google Apps Script Web App URL. \uc608: 'https://script.google.com/macros/s/AKfycb.../exec'
  sheetEndpoint: '',

  // \uad00\ub9ac\uc790 \ud654\uba74\uc740 \uc815\uc801 \ud398\uc774\uc9c0\uc6a9 \uac04\uc774 \uae30\ub2a5\uc785\ub2c8\ub2e4. \uc2e4\uc81c \uc6b4\uc601 \ub370\uc774\ud130 \uad00\ub9ac\ub294 Google Sheet\uc5d0\uc11c \ud558\ub294 \uac83\uc744 \uad8c\uc7a5\ud569\ub2c8\ub2e4.
  adminPassword: 'lpr-admin',

  // \uc624\ub298\uc758 \ub77c\uc774\ube0c \uc815\ubcf4: \ud589\uc0ac\uba85, \ub0a0\uc9dc, \uc2dc\uc791 \uc2dc\uac04, \uc811\uc218 \uc0c1\ud0dc\ub97c \uc5ec\uae30\uc11c \ubc14\uafc9\ub2c8\ub2e4.
  currentEvent: {
    id: 'lpr-live-2026-06',
    title: '\uc624\ub298\uc758 \ub85c\ud50c\ub808 \ub77c\uc774\ube0c',
    dateLabel: '\uc624\ub298',
    startTime: '19:30',
    requestOpen: true,
    supportOpen: true,
    description: '\uc624\ub298 \uc774 \uacf5\uac04\uc5d0\uc11c \ub4e3\uace0 \uc2f6\uc740 \uc74c\uc545\uacfc \ubb34\ub300\uc5d0 \ub300\ud55c \uc751\uc6d0\uc744 \ub0a8\uaca8\uc8fc\uc138\uc694.'
  },

  moods: [
    '\uc794\uc794\ud558\uac8c',
    '\uc2e0\ub098\uac8c',
    '\uc704\ub85c\ubc1b\uace0 \uc2f6\uc5b4\uc694',
    '\uac19\uc774 \ubd80\ub974\uace0 \uc2f6\uc5b4\uc694',
    '\uadf8\ub0e5 \uc774 \ub178\ub798\uac00 \uc88b\uc544\uc694'
  ],

  emojis: ['\ud83d\udc4f', '\ud83d\udda4', '\ud83d\udd25', '\ud83c\udfa7', '\ud83c\udf19', '\u2728'],

  // \uc624\ub298\uc758 \ubba4\uc9c0\uc158/\uac8c\uc2a4\ud2b8 \ubba4\uc9c0\uc158: name, genre, bio, time\ub9cc \ubc14\uafd4\ub3c4 \uc0ac\uc774\ud2b8\uc5d0 \ubc18\uc601\ub429\ub2c8\ub2e4.
  musicians: [
    {
      id: 'today-musician',
      name: '\uc624\ub298\uc758 \ubba4\uc9c0\uc158',
      genre: 'Live / Acoustic',
      bio: '\ub85c\uceec\ud50c\ub808\uc774\ub808\ucf54\ub4dc\uc758 \uc624\ub298 \ubb34\ub300\ub97c \ucc44\uc6b0\ub294 \ubba4\uc9c0\uc158\uc785\ub2c8\ub2e4.',
      time: '19:30',
      instagramUrl: '',
      youtubeUrl: '',
      colorLabel: 'LIVE'
    },
    {
      id: 'guest-musician',
      name: '\uac8c\uc2a4\ud2b8 \ubba4\uc9c0\uc158',
      genre: 'Local Artist',
      bio: '\uc9c0\uc5ed\uc758 \uac10\uac01\uc744 \uc74c\uc545\uc73c\ub85c \uae30\ub85d\ud558\ub294 \uac8c\uc2a4\ud2b8 \ubba4\uc9c0\uc158\uc785\ub2c8\ub2e4.',
      time: '20:20',
      instagramUrl: '',
      youtubeUrl: '',
      colorLabel: 'GUEST'
    }
  ],

  archiveSamples: [
    {
      date: '2026.06',
      title: '\ub85c\ud50c\ub808 \ub77c\uc774\ube0c \uae30\ub85d',
      description: '\uc2e0\uccad\uace1\uacfc \uc751\uc6d0 \uba54\uc2dc\uc9c0\uac00 \uc313\uc774\uba74 \uc774 \uc601\uc5ed\uc5d0 \uc9c0\ub09c \uacf5\uc5f0 \uae30\ub85d\uc744 \ubcf4\uc5ec\uc904 \uc218 \uc788\uc2b5\ub2c8\ub2e4.'
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
        '.brand-mark { display: inline-grid !important; place-items: center; justify-content: center; width: 48px; height: 48px; padding: 2px; border-radius: 50% !important; background: #fff !important; overflow: hidden; }',
        '.brand-mark span { display: none !important; }',
        '.brand-mark::before { content: ""; display: block; width: 100%; height: 100%; background: url("' + logoUrl + '") center / contain no-repeat; }',
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
        paragraphs[1].innerHTML = '\uc624\ub298\uc758 \ub77c\uc774\ube0c, \uc624\ub298\uc758 \ubba4\uc9c0\uc158, \uac8c\uc2a4\ud2b8 \ubba4\uc9c0\uc158\uc740 GitHub\uc758 <strong>config.js</strong> \ud30c\uc77c\uc5d0\uc11c \uc218\uc815\ud558\uba74 \uc790\ub3d9\ubc30\ud3ec\ub429\ub2c8\ub2e4.';
      }
      if (paragraphs[2]) {
        paragraphs[2].textContent = '\uc774 \ud654\uba74\uc740 \uac19\uc740 \ube0c\ub77c\uc6b0\uc800\uc5d0\uc11c \uc811\uc218\ub41c \ub85c\uceec \ub370\uc774\ud130 \ud655\uc778\uacfc CSV \ub0b4\ubcf4\ub0b4\uae30\ub97c \uc9c0\uc6d0\ud569\ub2c8\ub2e4. \uc2e4\uc81c \uc6b4\uc601 \ub370\uc774\ud130\ub294 Google Sheet \uc5f0\uacb0\uc744 \uad8c\uc7a5\ud569\ub2c8\ub2e4.';
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }
})();
