/**
 * LOCAL PLAY RECORD 신청곡/응원 저장용 Google Apps Script
 *
 * 사용 방식
 * 1) Google Sheet를 새로 만듭니다.
 * 2) 확장 프로그램 > Apps Script를 열고 이 파일 전체를 붙여넣습니다.
 * 3) Deploy > New deployment > Web app으로 배포합니다.
 * 4) Web app URL을 사이트의 config.js > sheetEndpoint에 넣습니다.
 *
 * 권장 배포 설정
 * - Execute as: Me
 * - Who has access: Anyone
 */

const SPREADSHEET_ID = ''; // 스크립트를 Google Sheet에 연결해서 쓰면 비워두세요.

const SHEETS = {
  requests: {
    name: 'Requests',
    headers: [
      'createdAt',
      'eventId',
      'eventTitle',
      'nickname',
      'songTitle',
      'artistName',
      'mood',
      'reason',
      'isPublic',
      'status',
      'source',
      'userAgent'
    ]
  },
  supports: {
    name: 'Supports',
    headers: [
      'createdAt',
      'eventId',
      'eventTitle',
      'nickname',
      'musicianId',
      'emoji',
      'message',
      'snsId',
      'isPublic',
      'source',
      'userAgent'
    ]
  }
};

function doGet() {
  return json_({ ok: true, message: 'LOCAL PLAY RECORD endpoint is running.' });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const type = String(e.parameter.type || '').trim();
    const payload = JSON.parse(e.parameter.payload || '{}');

    if (!SHEETS[type]) {
      throw new Error('Unknown submission type: ' + type);
    }

    if (type === 'requests') {
      validateRequired_(payload, ['createdAt', 'eventId', 'nickname', 'songTitle', 'artistName']);
      appendRow_('requests', [
        payload.createdAt,
        payload.eventId,
        payload.eventTitle || '',
        clean_(payload.nickname, 40),
        clean_(payload.songTitle, 120),
        clean_(payload.artistName, 120),
        clean_(payload.mood, 80),
        clean_(payload.reason, 500),
        Boolean(payload.isPublic),
        '접수',
        clean_(payload.source, 60),
        clean_(payload.userAgent, 300)
      ]);
    }

    if (type === 'supports') {
      validateRequired_(payload, ['createdAt', 'eventId', 'nickname', 'musicianId', 'message']);
      appendRow_('supports', [
        payload.createdAt,
        payload.eventId,
        payload.eventTitle || '',
        clean_(payload.nickname, 40),
        clean_(payload.musicianId, 80),
        clean_(payload.emoji, 20),
        clean_(payload.message, 500),
        clean_(payload.snsId, 100),
        Boolean(payload.isPublic),
        clean_(payload.source, 60),
        clean_(payload.userAgent, 300)
      ]);
    }

    return json_({ ok: true });
  } catch (error) {
    console.error(error);
    return json_({ ok: false, error: String(error.message || error) });
  } finally {
    lock.releaseLock();
  }
}

function appendRow_(type, values) {
  const ss = getSpreadsheet_();
  const sheetInfo = SHEETS[type];
  const sheet = ss.getSheetByName(sheetInfo.name) || ss.insertSheet(sheetInfo.name);
  ensureHeaders_(sheet, sheetInfo.headers);
  sheet.appendRow(values);
}

function ensureHeaders_(sheet, headers) {
  const range = sheet.getRange(1, 1, 1, headers.length);
  const current = range.getValues()[0];
  const hasHeaders = current.some(function(value) { return value !== ''; });

  if (!hasHeaders) {
    range.setValues([headers]);
    range.setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);
  }
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

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
