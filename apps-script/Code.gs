/**
 * LOCAL PLAY RECORD Google Sheet 운영 API
 *
 * 역할
 * - GET: Settings, Musicians, Archive 탭을 읽어 홈페이지 설정으로 반환합니다.
 * - POST: 신청곡은 Requests 탭에, 응원은 Supports 탭에 누적 저장합니다.
 *
 * 배포 방법
 * 1) Google Sheet에서 확장 프로그램 > Apps Script를 엽니다.
 * 2) 이 파일 전체를 붙여넣고 저장합니다.
 * 3) Deploy > New deployment > Web app으로 배포합니다.
 * 4) Execute as: Me / Who has access: Anyone으로 설정합니다.
 * 5) Web App URL을 config.js의 sheetEndpoint에 입력합니다.
 */

const SPREADSHEET_ID = '1On8Nv8jNJpan2siqLuZMGGKSGcGGHxG7p_oiIsEJjYI';
const CONFIG_CACHE_KEY = 'lpr-site-config-v1';
const CONFIG_CACHE_SECONDS = 2;

const SHEETS = {
  settings: {
    name: 'Settings',
    headers: ['key', 'value', 'description']
  },
  musicians: {
    name: 'Musicians',
    headers: ['active', 'id', 'name', 'genre', 'bio', 'time', 'instagramUrl', 'youtubeUrl', 'colorLabel', 'sortOrder']
  },
  requests: {
    name: 'Requests',
    headers: ['createdAt', 'eventId', 'eventTitle', 'nickname', 'songTitle', 'artistName', 'mood', 'reason', 'isPublic', 'status', 'source', 'userAgent']
  },
  supports: {
    name: 'Supports',
    headers: ['createdAt', 'eventId', 'eventTitle', 'nickname', 'musicianId', 'emoji', 'message', 'snsId', 'isPublic', 'source', 'userAgent']
  },
  archive: {
    name: 'Archive',
    headers: ['active', 'date', 'title', 'description', 'sortOrder']
  }
};

function doGet(e) {
  try {
    const action = String((e && e.parameter && e.parameter.action) || 'config').trim();

    if (action === 'health') {
      return respond_({ ok: true, message: 'LOCAL PLAY RECORD endpoint is running.' }, e);
    }

    if (action === 'setup') {
      ensureWorkbook_();
      return respond_({ ok: true, message: 'Sheets are ready.' }, e);
    }

    return respond_(getCachedSiteConfig_(), e);
  } catch (error) {
    console.error(error);
    return respond_({ ok: false, error: String(error.message || error) }, e);
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const type = String(e.parameter.type || '').trim();
    const payload = JSON.parse(e.parameter.payload || '{}');

    if (payload.website) {
      return respond_({ ok: true, ignored: true }, e);
    }

    if (!SHEETS[type] || (type !== 'requests' && type !== 'supports')) {
      throw new Error('Unknown submission type: ' + type);
    }

    if (type === 'requests') {
      validateRequired_(payload, ['createdAt', 'eventId', 'nickname', 'songTitle', 'artistName']);
      appendRow_('requests', [
        clean_(payload.createdAt, 80),
        clean_(payload.eventId, 80),
        clean_(payload.eventTitle, 160),
        clean_(payload.nickname, 40),
        clean_(payload.songTitle, 120),
        clean_(payload.artistName, 120),
        clean_(payload.mood, 80),
        clean_(payload.reason, 500),
        bool_(payload.isPublic, false),
        '접수',
        clean_(payload.source, 60),
        clean_(payload.userAgent, 300)
      ]);
    }

    if (type === 'supports') {
      validateRequired_(payload, ['createdAt', 'eventId', 'nickname', 'musicianId', 'message']);
      appendRow_('supports', [
        clean_(payload.createdAt, 80),
        clean_(payload.eventId, 80),
        clean_(payload.eventTitle, 160),
        clean_(payload.nickname, 40),
        clean_(payload.musicianId, 80),
        clean_(payload.emoji, 20),
        clean_(payload.message, 500),
        clean_(payload.snsId, 100),
        bool_(payload.isPublic, false),
        clean_(payload.source, 60),
        clean_(payload.userAgent, 300)
      ]);
    }

    return respond_({ ok: true }, e);
  } catch (error) {
    console.error(error);
    return respond_({ ok: false, error: String(error.message || error) }, e);
  } finally {
    lock.releaseLock();
  }
}

function getSiteConfig_() {
  ensureWorkbook_();

  const settings = getSettings_();
  const eventId = stringSetting_(settings, 'eventId', 'lpr-live');
  const eventTitle = stringSetting_(settings, 'eventTitle', '오늘의 로플레 라이브');

  return {
    brandName: stringSetting_(settings, 'brandName', 'LOCAL PLAY RECORD'),
    shortName: stringSetting_(settings, 'shortName', '로플레'),
    venueName: stringSetting_(settings, 'venueName', '로컬플레이레코드'),
    instagramUrl: stringSetting_(settings, 'instagramUrl', 'https://www.instagram.com/'),
    contactText: stringSetting_(settings, 'contactText', '공연/대관/협업 문의는 인스타그램 DM으로 연락해주세요.'),
    adminPassword: stringSetting_(settings, 'adminPassword', 'lpr-admin'),
    submitCooldownMs: numberSetting_(settings, 'submitCooldownMs', 3000),
    remoteConfigTimeoutMs: numberSetting_(settings, 'remoteConfigTimeoutMs', 2500),
    realtimeRefreshMs: numberSetting_(settings, 'realtimeRefreshMs', 2000),
    currentEvent: {
      id: eventId,
      title: eventTitle,
      dateLabel: stringSetting_(settings, 'dateLabel', '오늘'),
      startTime: stringSetting_(settings, 'startTime', '19:30'),
      requestOpen: boolSetting_(settings, 'requestOpen', true),
      supportOpen: boolSetting_(settings, 'supportOpen', true),
      description: stringSetting_(settings, 'description', '오늘 이 공간에서 듣고 싶은 음악과 무대에 대한 응원을 남겨주세요.')
    },
    moods: listSetting_(settings, 'moods', ['잔잔하게', '신나게', '위로받고 싶어요', '같이 부르고 싶어요', '그냥 이 노래가 좋아요']),
    emojis: listSetting_(settings, 'emojis', ['👏', '🖤', '🔥', '🎧', '🌙', '✨']),
    musicians: getMusicians_(),
    archiveSamples: getArchiveSamples_()
  };
}

function getCachedSiteConfig_() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(CONFIG_CACHE_KEY);

  if (cached) {
    return JSON.parse(cached);
  }

  const response = {
    ok: true,
    config: getSiteConfig_(),
    refreshedAt: new Date().toISOString()
  };

  cache.put(CONFIG_CACHE_KEY, JSON.stringify(response), CONFIG_CACHE_SECONDS);
  return response;
}

function getSettings_() {
  const sheet = getSheet_('settings');
  const rows = sheet.getDataRange().getValues();
  const map = {};

  rows.slice(1).forEach(function(row) {
    const key = String(row[0] || '').trim();
    if (key) map[key] = row[1];
  });

  return map;
}

function getMusicians_() {
  return readObjects_('musicians')
    .filter(function(item) { return bool_(item.active, false) && item.id && item.name; })
    .sort(sortByOrder_)
    .map(function(item) {
      return {
        id: clean_(item.id, 80),
        name: clean_(item.name, 120),
        genre: clean_(item.genre, 120),
        bio: clean_(item.bio, 500),
        time: clean_(item.time, 40),
        instagramUrl: clean_(item.instagramUrl, 240),
        youtubeUrl: clean_(item.youtubeUrl, 240),
        colorLabel: clean_(item.colorLabel, 40) || 'ARTIST'
      };
    });
}

function getArchiveSamples_() {
  return readObjects_('archive')
    .filter(function(item) { return bool_(item.active, false) && item.title; })
    .sort(sortByOrder_)
    .slice(0, 6)
    .map(function(item) {
      return {
        date: clean_(item.date, 80),
        title: clean_(item.title, 160),
        description: clean_(item.description, 500)
      };
    });
}

function readObjects_(type) {
  const sheet = getSheet_(type);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(function(header) { return String(header || '').trim(); });
  return values.slice(1).map(function(row) {
    const object = {};
    headers.forEach(function(header, index) {
      if (header) object[header] = row[index];
    });
    return object;
  }).filter(function(object) {
    return Object.keys(object).some(function(key) { return object[key] !== '' && object[key] !== null; });
  });
}

function appendRow_(type, values) {
  const sheet = getSheet_(type);
  ensureHeaders_(sheet, SHEETS[type].headers);
  sheet.appendRow(values);
}

function ensureWorkbook_() {
  Object.keys(SHEETS).forEach(function(type) {
    const sheet = getSheet_(type);
    ensureHeaders_(sheet, SHEETS[type].headers);
  });
}

function getSheet_(type) {
  const spreadsheet = getSpreadsheet_();
  const info = SHEETS[type];
  return spreadsheet.getSheetByName(info.name) || spreadsheet.insertSheet(info.name);
}

function ensureHeaders_(sheet, headers) {
  const range = sheet.getRange(1, 1, 1, headers.length);
  const current = range.getValues()[0].map(function(value) { return String(value || '').trim(); });
  const matches = headers.every(function(header, index) { return current[index] === header; });

  if (!matches) {
    range.setValues([headers]);
  }

  range.setFontWeight('bold');
  sheet.setFrozenRows(1);
}

function getSpreadsheet_() {
  if (SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error('No active spreadsheet. Use a bound script or set SPREADSHEET_ID.');
  }
  return spreadsheet;
}

function stringSetting_(settings, key, fallback) {
  const value = settings[key];
  if (value === null || value === undefined || value === '') return fallback;
  return String(value).trim();
}

function numberSetting_(settings, key, fallback) {
  const value = Number(settings[key]);
  return Number.isFinite(value) ? value : fallback;
}

function boolSetting_(settings, key, fallback) {
  if (!(key in settings)) return fallback;
  return bool_(settings[key], fallback);
}

function listSetting_(settings, key, fallback) {
  const value = stringSetting_(settings, key, '');
  if (!value) return fallback;
  return value.split('|').map(function(item) { return item.trim(); }).filter(Boolean);
}

function bool_(value, fallback) {
  if (typeof value === 'boolean') return value;
  const normalized = String(value || '').trim().toLowerCase();
  if (['true', 'yes', 'y', '1', 'on', 'open', '접수', '열림'].indexOf(normalized) >= 0) return true;
  if (['false', 'no', 'n', '0', 'off', 'closed', '마감', '닫힘'].indexOf(normalized) >= 0) return false;
  return fallback;
}

function sortByOrder_(a, b) {
  return Number(a.sortOrder || 999) - Number(b.sortOrder || 999);
}

function validateRequired_(payload, fields) {
  fields.forEach(function(field) {
    if (!payload[field]) {
      throw new Error('Missing required field: ' + field);
    }
  });
}

function clean_(value, maxLength) {
  return String(value || '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function respond_(data, e) {
  const callback = e && e.parameter && e.parameter.callback ? String(e.parameter.callback).trim() : '';
  if (callback) {
    if (!/^[A-Za-z_$][0-9A-Za-z_$]*(\.[A-Za-z_$][0-9A-Za-z_$]*)*$/.test(callback)) {
      throw new Error('Invalid JSONP callback.');
    }

    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(data) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
