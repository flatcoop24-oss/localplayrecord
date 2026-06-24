(() => {
  'use strict';

  const defaults = {
    brandName: 'LOCAL PLAY RECORD',
    shortName: '로플레',
    venueName: '로컬플레이레코드',
    instagramUrl: 'https://www.instagram.com/',
    contactText: '공연/대관/협업 문의는 인스타그램 DM으로 연락해주세요.',
    sheetEndpoint: '',
    adminPassword: 'lpr-admin',
    currentEvent: {
      id: 'lpr-live',
      title: '오늘의 로플레 라이브',
      dateLabel: '오늘',
      startTime: '19:30',
      requestOpen: true,
      supportOpen: true,
      description: '오늘 이 공간에서 듣고 싶은 음악과 무대에 대한 응원을 남겨주세요.'
    },
    moods: ['잔잔하게', '신나게', '위로받고 싶어요', '같이 부르고 싶어요', '그냥 이 노래가 좋아요'],
    emojis: ['👏', '🖤', '🔥', '🎧', '🌙', '✨'],
    musicians: [],
    archiveSamples: [],
    submitCooldownMs: 3000,
    remoteConfigTimeoutMs: 6000
  };

  let config = mergeDeep(defaults, window.LPR_CONFIG || {});
  const state = {
    activeAdminTab: 'requests'
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  document.addEventListener('DOMContentLoaded', async () => {
    await loadSheetConfig();
    hydrateConfigText();
    renderOptions();
    renderMusicians();
    renderArchive();
    renderStats();
    bindNavigation();
    bindCounters();
    bindForms();
    bindAdmin();
    bindPresetButtons();
  });

  function mergeDeep(target, source) {
    const output = { ...target };
    Object.keys(source).forEach((key) => {
      if (isPlainObject(source[key]) && isPlainObject(output[key])) {
        output[key] = mergeDeep(output[key], source[key]);
      } else {
        output[key] = source[key];
      }
    });
    return output;
  }

  function isPlainObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
  }

  async function loadSheetConfig() {
    if (!config.sheetEndpoint) return;

    try {
      const response = await loadJsonp(config.sheetEndpoint, {
        action: 'config',
        cache: String(Date.now())
      });

      if (response && response.ok && response.config) {
        config = mergeDeep(config, response.config);
      } else if (response && response.error) {
        console.warn('Google Sheet 설정을 불러오지 못했습니다:', response.error);
      }
    } catch (error) {
      console.warn('Google Sheet 설정을 불러오지 못했습니다. config.js 값을 사용합니다.', error);
    }
  }

  function loadJsonp(endpoint, params = {}) {
    return new Promise((resolve, reject) => {
      const callbackName = `lprSheetConfig_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const url = new URL(endpoint);
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
      url.searchParams.set('callback', callbackName);

      const script = document.createElement('script');
      const timer = window.setTimeout(() => {
        cleanup();
        reject(new Error('Google Sheet 설정 응답 시간이 초과되었습니다.'));
      }, config.remoteConfigTimeoutMs);

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
        reject(new Error('Google Sheet 설정 스크립트를 불러오지 못했습니다.'));
      };

      script.src = url.toString();
      document.head.appendChild(script);
    });
  }

  function hydrateConfigText() {
    document.title = `${config.brandName} | 신청곡과 뮤지션 응원하기`;
    setText('[data-brand-name]', config.brandName);
    setText('[data-footer-brand]', config.brandName);
    setText('[data-contact-text]', config.contactText);
    setText('[data-event-title]', config.currentEvent.title);
    setText('[data-live-title]', config.currentEvent.title);
    setText('[data-event-description]', config.currentEvent.description);
    setText('[data-live-description]', config.currentEvent.description);
    setText('[data-event-date]', config.currentEvent.dateLabel);
    setText('[data-event-time]', config.currentEvent.startTime);
    setText('[data-event-status]', config.currentEvent.requestOpen ? '신청곡 접수중' : '신청곡 마감');
    setText('[data-request-open]', config.currentEvent.requestOpen ? '접수중' : '마감');
    setText('[data-support-open]', config.currentEvent.supportOpen ? '접수중' : '마감');

    if (config.instagramUrl) {
      $$('[data-instagram-link]').forEach((instagramLink) => {
        instagramLink.href = config.instagramUrl;
      });
    }
  }

  function setText(selector, value) {
    $$(selector).forEach((element) => {
      element.textContent = value;
    });
  }

  function renderOptions() {
    const moodSelect = $('[data-mood-options]');
    if (moodSelect) {
      config.moods.forEach((mood) => {
        const option = document.createElement('option');
        option.value = mood;
        option.textContent = mood;
        moodSelect.appendChild(option);
      });
    }

    const musicianSelect = $('[data-musician-options]');
    if (musicianSelect) {
      config.musicians.forEach((musician) => {
        const option = document.createElement('option');
        option.value = musician.id;
        option.textContent = musician.name;
        musicianSelect.appendChild(option);
      });
    }

    const emojiRow = $('[data-emoji-options]');
    if (emojiRow) {
      config.emojis.forEach((emoji, index) => {
        const label = document.createElement('label');
        label.setAttribute('aria-label', `${emoji} 응원 이모지`);
        label.innerHTML = `<input type="radio" name="emoji" value="${escapeHtml(emoji)}" ${index === 0 ? 'checked' : ''} /> <span aria-hidden="true">${escapeHtml(emoji)}</span>`;
        emojiRow.appendChild(label);
      });
    }
  }

  function renderMusicians() {
    const cards = $('[data-musician-cards]');
    const lineup = $('[data-lineup]');
    if (!cards || !lineup) return;

    const musicians = config.musicians.length ? config.musicians : [{
      id: 'artist-01',
      name: '오늘의 뮤지션',
      genre: 'Live',
      bio: '오늘의 무대를 채우는 뮤지션입니다.',
      time: config.currentEvent.startTime,
      colorLabel: 'LIVE'
    }];

    cards.innerHTML = '';
    lineup.innerHTML = '';

    musicians.forEach((musician) => {
      const card = document.createElement('article');
      card.className = 'musician-card';
      card.innerHTML = `
        <span class="tag">${escapeHtml(musician.colorLabel || 'ARTIST')}</span>
        <h3>${escapeHtml(musician.name)}</h3>
        <p>${escapeHtml(musician.genre || '')}</p>
        <p>${escapeHtml(musician.bio || '')}</p>
        <div class="musician-links">
          <a href="#support" data-support-target="${escapeHtml(musician.id)}">응원하기</a>
          ${musician.instagramUrl ? `<a href="${escapeAttribute(musician.instagramUrl)}" target="_blank" rel="noreferrer">Instagram</a>` : ''}
          ${musician.youtubeUrl ? `<a href="${escapeAttribute(musician.youtubeUrl)}" target="_blank" rel="noreferrer">YouTube</a>` : ''}
        </div>
      `;
      cards.appendChild(card);

      const lineupCard = document.createElement('article');
      lineupCard.className = 'lineup-card';
      lineupCard.innerHTML = `
        <span class="tag">${escapeHtml(musician.time || config.currentEvent.startTime)}</span>
        <h3>${escapeHtml(musician.name)}</h3>
        <p>${escapeHtml(musician.genre || '')}</p>
        <p>${escapeHtml(musician.bio || '')}</p>
      `;
      lineup.appendChild(lineupCard);
    });

    $$('[data-support-target]').forEach((button) => {
      button.addEventListener('click', () => {
        const select = $('#musicianId');
        if (select) select.value = button.dataset.supportTarget;
      });
    });
  }

  function renderArchive() {
    const grid = $('[data-archive-grid]');
    if (!grid) return;

    const localRequests = loadRecords('requests')
      .filter((item) => item.isPublic)
      .slice(0, 2)
      .map((item) => ({
        date: formatShortDate(item.createdAt),
        title: `${item.songTitle} · ${item.artistName}`,
        description: item.reason || `${item.nickname}님의 신청곡`
      }));

    const localSupports = loadRecords('supports')
      .filter((item) => item.isPublic)
      .slice(0, 2)
      .map((item) => ({
        date: formatShortDate(item.createdAt),
        title: `${item.emoji || '👏'} ${getMusicianName(item.musicianId)} 응원`,
        description: item.message
      }));

    const items = [...localRequests, ...localSupports, ...config.archiveSamples].slice(0, 6);
    grid.innerHTML = '';

    if (!items.length) {
      grid.innerHTML = '<article><span class="card-label">READY</span><h3>기록 준비중</h3><p>신청곡과 응원이 쌓이면 이곳에 공개 기록이 표시됩니다.</p></article>';
      return;
    }

    items.forEach((item) => {
      const article = document.createElement('article');
      article.innerHTML = `
        <span class="card-label">${escapeHtml(item.date || 'ARCHIVE')}</span>
        <h3>${escapeHtml(item.title || '로플레 기록')}</h3>
        <p>${escapeHtml(item.description || '')}</p>
      `;
      grid.appendChild(article);
    });
  }

  function renderStats() {
    setText('[data-request-count]', String(loadRecords('requests').length));
    setText('[data-support-count]', String(loadRecords('supports').length));
  }

  function bindNavigation() {
    const toggle = $('[data-nav-toggle]');
    const nav = $('[data-primary-nav]');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      document.body.classList.toggle('nav-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    nav.addEventListener('click', (event) => {
      if (event.target.matches('a')) {
        nav.classList.remove('is-open');
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function bindCounters() {
    $$('textarea[maxlength]').forEach((textarea) => {
      const counter = $(`[data-counter-for="${textarea.id}"]`);
      const update = () => {
        if (counter) counter.textContent = String(textarea.value.length);
      };
      textarea.addEventListener('input', update);
      update();
    });
  }

  function bindPresetButtons() {
    $$('[data-preset]').forEach((button) => {
      button.addEventListener('click', () => {
        const target = $('#supportMessage');
        if (!target) return;
        target.value = button.dataset.preset || '';
        target.dispatchEvent(new Event('input', { bubbles: true }));
        target.focus();
      });
    });
  }

  function bindForms() {
    $$('[data-form]').forEach((form) => {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const type = form.dataset.form;
        const status = $('[data-status]', form);
        const submitButton = $('button[type="submit"]', form);
        clearErrors(form);

        const parsed = parseForm(type, form);
        if (!parsed.ok) {
          parsed.errors.forEach((error) => setFieldError(error.field, error.message));
          if (status) status.textContent = '필수 항목을 확인해주세요.';
          return;
        }

        if (parsed.payload.website) {
          form.reset();
          if (status) status.textContent = '접수되었습니다.';
          return;
        }

        if (type === 'request' && !config.currentEvent.requestOpen) {
          if (status) status.textContent = '지금은 신청곡 접수가 마감되었습니다.';
          return;
        }

        if (type === 'support' && !config.currentEvent.supportOpen) {
          if (status) status.textContent = '지금은 응원 메시지 접수가 마감되었습니다.';
          return;
        }

        const cooldownKey = `lpr:last-submit:${type}`;
        const lastSubmit = Number(localStorage.getItem(cooldownKey) || 0);
        if (Date.now() - lastSubmit < config.submitCooldownMs) {
          if (status) status.textContent = '잠시 후 다시 제출해주세요.';
          return;
        }

        submitButton.disabled = true;
        if (status) status.textContent = '접수 중입니다...';

        try {
          const payload = {
            ...parsed.payload,
            eventId: config.currentEvent.id,
            eventTitle: config.currentEvent.title,
            createdAt: new Date().toISOString(),
            source: 'github-pages',
            userAgent: navigator.userAgent
          };

          await submitRecord(type, payload);
          localStorage.setItem(cooldownKey, String(Date.now()));

          form.reset();
          resetFormDefaults(type);
          renderStats();
          renderArchive();
          if (state.activeAdminTab) renderAdminTable();

          const message = type === 'request'
            ? '신청곡이 접수됐어요. 오늘의 분위기에 맞춰 소중히 확인할게요.'
            : '응원이 전달됐어요. 당신의 한마디가 다음 무대를 만드는 힘이 됩니다.';
          if (status) status.textContent = message;
          showToast(message);
        } catch (error) {
          console.error(error);
          if (status) status.textContent = '접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
        } finally {
          submitButton.disabled = false;
        }
      });
    });
  }

  function parseForm(type, form) {
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());
    payload.isPublic = data.get('isPublic') === 'yes';
    payload.website = data.get('website') || '';

    Object.keys(payload).forEach((key) => {
      if (typeof payload[key] === 'string') payload[key] = sanitize(payload[key]);
    });

    const errors = [];

    if (type === 'request') {
      if (!payload.nickname) errors.push({ field: 'requestNickname', message: '닉네임을 입력해주세요.' });
      if (!payload.songTitle) errors.push({ field: 'songTitle', message: '신청곡 제목을 입력해주세요.' });
      if (!payload.artistName) errors.push({ field: 'artistName', message: '아티스트명을 입력해주세요.' });
    }

    if (type === 'support') {
      if (!payload.musicianId) errors.push({ field: 'musicianId', message: '응원할 뮤지션을 선택해주세요.' });
      if (!payload.nickname) errors.push({ field: 'supportNickname', message: '닉네임을 입력해주세요.' });
      if (!payload.message) errors.push({ field: 'supportMessage', message: '응원 메시지를 입력해주세요.' });
    }

    return { ok: errors.length === 0, errors, payload };
  }

  function sanitize(value) {
    return value.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
  }

  function clearErrors(form) {
    $$('.field-error', form).forEach((error) => {
      error.textContent = '';
    });
  }

  function setFieldError(fieldId, message) {
    const error = $(`[data-error-for="${fieldId}"]`);
    if (error) error.textContent = message;
  }

  function resetFormDefaults(type) {
    if (type === 'support') {
      const firstEmoji = $('[name="emoji"]');
      if (firstEmoji) firstEmoji.checked = true;
    }
    bindCounters();
  }

  async function submitRecord(type, payload) {
    const key = type === 'request' ? 'requests' : 'supports';
    saveLocalRecord(key, payload);

    if (!config.sheetEndpoint) return;

    const body = new URLSearchParams();
    body.set('type', key);
    body.set('payload', JSON.stringify(payload));

    await fetch(config.sheetEndpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: body.toString()
    });
  }

  function storageKey(type) {
    return `lpr:${config.currentEvent.id}:${type}`;
  }

  function loadRecords(type) {
    try {
      return JSON.parse(localStorage.getItem(storageKey(type)) || '[]');
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  function saveLocalRecord(type, payload) {
    const records = loadRecords(type);
    records.unshift(payload);
    localStorage.setItem(storageKey(type), JSON.stringify(records.slice(0, 500)));
  }

  function bindAdmin() {
    const loginForm = $('[data-admin-login]');
    const panel = $('[data-admin-panel]');
    const status = $('[data-admin-status]');
    if (!loginForm || !panel) return;

    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = $('#adminPassword');
      if (!input) return;

      if (input.value === config.adminPassword) {
        panel.hidden = false;
        loginForm.hidden = true;
        renderAdminTable();
      } else if (status) {
        status.textContent = '비밀번호가 맞지 않습니다.';
      }
    });

    $$('[data-admin-tab]').forEach((button) => {
      button.addEventListener('click', () => {
        state.activeAdminTab = button.dataset.adminTab;
        $$('[data-admin-tab]').forEach((item) => item.classList.toggle('active', item === button));
        renderAdminTable();
      });
    });

    $$('[data-export]').forEach((button) => {
      button.addEventListener('click', () => exportCsv(button.dataset.export));
    });

    const clearButton = $('[data-clear-local]');
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        const ok = window.confirm('이 브라우저에 저장된 신청곡/응원 데이터를 모두 삭제할까요? Google Sheet 데이터는 삭제되지 않습니다.');
        if (!ok) return;
        localStorage.removeItem(storageKey('requests'));
        localStorage.removeItem(storageKey('supports'));
        renderStats();
        renderArchive();
        renderAdminTable();
        showToast('로컬 데이터가 초기화되었습니다.');
      });
    }
  }

  function renderAdminTable() {
    const table = $('[data-admin-table]');
    if (!table) return;

    const type = state.activeAdminTab || 'requests';
    const records = loadRecords(type);
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
    const records = loadRecords(type);
    if (!records.length) {
      showToast('내보낼 데이터가 없습니다.');
      return;
    }

    const columns = type === 'requests'
      ? ['createdAt', 'eventId', 'nickname', 'songTitle', 'artistName', 'mood', 'reason', 'isPublic']
      : ['createdAt', 'eventId', 'nickname', 'musicianId', 'emoji', 'message', 'snsId', 'isPublic'];

    const rows = [columns, ...records.map((record) => columns.map((column) => record[column] || ''))];
    const csv = rows.map((row) => row.map(csvCell).join(',')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${config.currentEvent.id}-${type}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function csvCell(value) {
    const stringValue = String(value ?? '');
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  function getMusicianName(id) {
    const musician = config.musicians.find((item) => item.id === id);
    return musician ? musician.name : id;
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

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, '&#096;');
  }

  function showToast(message) {
    const toast = $('[data-toast]');
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toast.hidden = true;
    }, 3800);
  }
})();
