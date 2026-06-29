(() => {
  'use strict';

  const config = window.LPR_CONFIG || {};
  const state = {
    loading: false,
    signature: '',
    records: {
      requests: [],
      supports: []
    }
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  document.addEventListener('DOMContentLoaded', () => {
    bindAdminControls();
    refreshRecords();
    window.setInterval(() => {
      if (document.visibilityState === 'hidden') return;
      refreshRecords();
    }, Number(config.realtimeRefreshMs || 2000));

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') refreshRecords();
    });
  });

  function bindAdminControls() {
    $$('[data-admin-tab]').forEach((button) => {
      button.addEventListener('click', () => {
        window.setTimeout(renderAdminTable, 0);
      });
    });

    $$('[data-export]').forEach((button) => {
      button.addEventListener('click', (event) => {
        const type = button.dataset.export;
        if (!state.records[type] || !state.records[type].length) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        exportCsv(type);
      }, true);
    });
  }

  async function refreshRecords() {
    if (!config.sheetEndpoint || state.loading) return;
    state.loading = true;

    try {
      const response = await loadJsonp(config.sheetEndpoint, {
        action: 'records',
        type: 'all',
        limit: String(config.remoteRecordsLimit || 200),
        cache: String(Date.now())
      });

      if (!response || !response.ok || !response.records) return;

      const records = {
        requests: Array.isArray(response.records.requests) ? response.records.requests : [],
        supports: Array.isArray(response.records.supports) ? response.records.supports : []
      };
      const signature = JSON.stringify(records);
      if (signature === state.signature) return;

      state.records = records;
      state.signature = signature;
      renderRecords();
    } catch (error) {
      console.warn('Google Sheet 접수 데이터를 불러오지 못했습니다.', error);
    } finally {
      state.loading = false;
    }
  }

  function renderRecords() {
    setText('[data-request-count]', String(state.records.requests.length));
    setText('[data-support-count]', String(state.records.supports.length));
    renderArchive();
    renderAdminTable();
  }

  function renderArchive() {
    const grid = $('[data-archive-grid]');
    if (!grid) return;

    const requests = state.records.requests
      .filter((item) => item.isPublic)
      .slice(0, 2)
      .map((item) => ({
        date: formatShortDate(item.createdAt),
        title: `${item.songTitle} · ${item.artistName}`,
        description: item.reason || `${item.nickname}님의 신청곡`
      }));

    const supports = state.records.supports
      .filter((item) => item.isPublic)
      .slice(0, 2)
      .map((item) => ({
        date: formatShortDate(item.createdAt),
        title: `${item.emoji || '👏'} ${getMusicianName(item.musicianId)} 응원`,
        description: item.message
      }));

    const items = [...requests, ...supports].slice(0, 6);
    if (!items.length) return;

    grid.innerHTML = items.map((item) => `
      <article>
        <span class="card-label">${escapeHtml(item.date || 'ARCHIVE')}</span>
        <h3>${escapeHtml(item.title || '로플레 기록')}</h3>
        <p>${escapeHtml(item.description || '')}</p>
      </article>
    `).join('');
  }

  function renderAdminTable() {
    const table = $('[data-admin-table]');
    if (!table) return;

    const activeTab = $('[data-admin-tab].active');
    const type = activeTab && activeTab.dataset.adminTab === 'supports' ? 'supports' : 'requests';
    const records = state.records[type] || [];
    const thead = $('thead', table);
    const tbody = $('tbody', table);
    const columns = type === 'requests'
      ? [
        ['createdAt', '접수시간'],
        ['nickname', '닉네임'],
        ['songTitle', '신청곡'],
        ['artistName', '아티스트'],
        ['mood', '분위기'],
        ['reason', '사연'],
        ['isPublic', '공개']
      ]
      : [
        ['createdAt', '접수시간'],
        ['nickname', '닉네임'],
        ['musicianId', '뮤지션'],
        ['emoji', '이모지'],
        ['message', '메시지'],
        ['snsId', 'SNS'],
        ['isPublic', '공개']
      ];

    thead.innerHTML = `<tr>${columns.map(([, label]) => `<th>${escapeHtml(label)}</th>`).join('')}</tr>`;
    if (!records.length) {
      tbody.innerHTML = `<tr><td colspan="${columns.length}">아직 저장된 데이터가 없습니다.</td></tr>`;
      return;
    }

    tbody.innerHTML = records.map((record) => {
      const cells = columns.map(([key]) => {
        let value = record[key];
        if (key === 'createdAt') value = formatDateTime(value);
        if (key === 'musicianId') value = getMusicianName(value);
        if (key === 'isPublic') value = value ? '동의' : '비공개';
        return `<td>${escapeHtml(String(value || ''))}</td>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
  }

  function exportCsv(type) {
    const records = state.records[type] || [];
    const columns = type === 'requests'
      ? ['createdAt', 'eventId', 'nickname', 'songTitle', 'artistName', 'mood', 'reason', 'isPublic']
      : ['createdAt', 'eventId', 'nickname', 'musicianId', 'emoji', 'message', 'snsId', 'isPublic'];

    const rows = [columns, ...records.map((record) => columns.map((column) => record[column] || ''))];
    const csv = rows.map((row) => row.map(csvCell).join(',')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `local-play-record-${type}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function loadJsonp(endpoint, params = {}) {
    return new Promise((resolve, reject) => {
      const callbackName = `lprRecords_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const url = new URL(endpoint);
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
      url.searchParams.set('callback', callbackName);

      const script = document.createElement('script');
      const timer = window.setTimeout(() => {
        cleanup();
        reject(new Error('Google Sheet 접수 데이터 응답 시간이 초과되었습니다.'));
      }, Number(config.remoteConfigTimeoutMs || 2500));

      function cleanup() {
        window.clearTimeout(timer);
        delete window[callbackName];
        script.remove();
      }

      window[callbackName] = (data) => {
        cleanup();
        resolve(data);
      };

      script.onerror = () => {
        cleanup();
        reject(new Error('Google Sheet 접수 데이터 스크립트를 불러오지 못했습니다.'));
      };

      script.src = url.toString();
      document.head.appendChild(script);
    });
  }

  function getMusicianName(id) {
    const option = $(`#musicianId option[value="${cssEscape(id)}"]`);
    return option ? option.textContent : id;
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') {
      return window.CSS.escape(String(value || ''));
    }
    return String(value || '').replace(/"/g, '\\"');
  }

  function setText(selector, value) {
    $$(selector).forEach((element) => {
      element.textContent = value;
    });
  }

  function formatDateTime(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  function formatShortDate(value) {
    if (!value) return 'ARCHIVE';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'ARCHIVE';
    return new Intl.DateTimeFormat('ko-KR', {
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  }

  function csvCell(value) {
    const stringValue = String(value ?? '');
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
