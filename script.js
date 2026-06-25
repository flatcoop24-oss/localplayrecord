const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const siteMenu = document.querySelector("#site-menu");
const receipt = document.querySelector("#receipt");
const receiptDate = document.querySelector("[data-receipt-date]");
const ambientCanvas = document.querySelector(".ambient-canvas");
const css3dWorld = document.querySelector(".css-3d-world");
const airPage = document.querySelector(".air-page");
const drawer = document.querySelector("[data-contact-drawer]");
const drawerHome = document.querySelector("[data-drawer-home]");
const wizard = document.querySelector("[data-contact-wizard]");
const summaryBox = document.querySelector("[data-summary-box]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const choices = {
  type: "",
  space: "",
  schedule: "",
};

let currentStep = 1;
let countStarted = false;
let scrollFrame = 0;

if (receiptDate) {
  receiptDate.textContent = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());
}

function startAmbientCanvas() {
  if (!ambientCanvas || reduceMotion) return;

  const context = ambientCanvas.getContext("2d");
  const fragments = Array.from({ length: 36 }, (_, index) => ({
    x: Math.random(),
    y: Math.random(),
    speed: 0.0009 + Math.random() * 0.0018,
    length: 34 + Math.random() * 140,
    width: index % 5 === 0 ? 2 : 1,
    alpha: 0.1 + Math.random() * 0.22,
    phase: Math.random() * Math.PI * 2,
  }));

  function resize() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    ambientCanvas.width = Math.floor(window.innerWidth * pixelRatio);
    ambientCanvas.height = Math.floor(window.innerHeight * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function render(now) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#050505";
    context.fillRect(0, 0, width, height);

    fragments.forEach((fragment, index) => {
      const drift = now * fragment.speed + fragment.phase;
      const x = ((fragment.x * width + Math.sin(drift) * 80 + now * fragment.speed * 48) % (width + 180)) - 90;
      const y = ((fragment.y * height + Math.cos(drift * 0.7) * 60) % (height + 120)) - 60;
      context.save();
      context.translate(x, y);
      context.rotate(Math.sin(drift) * 0.45);
      context.strokeStyle = `rgba(255, 250, 240, ${fragment.alpha})`;
      context.lineWidth = fragment.width;
      context.beginPath();
      context.moveTo(-fragment.length / 2, 0);
      context.lineTo(fragment.length / 2, 0);
      context.stroke();
      if (index % 6 === 0) {
        context.fillStyle = `rgba(188, 180, 162, ${fragment.alpha * 0.7})`;
        context.fillRect(-6, -6, 12, 12);
      }
      context.restore();
    });

    requestAnimationFrame(render);
  }

  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(render);
}

function startReceiptTilt() {
  if (!receipt || reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;

  window.addEventListener(
    "pointermove",
    (event) => {
      const rect = receipt.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const rotateY = Math.max(-3, Math.min(3, ((event.clientX - centerX) / rect.width) * 5));
      const rotateX = Math.max(-2, Math.min(2, ((centerY - event.clientY) / rect.height) * 4));
      receipt.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    },
    { passive: true }
  );

  window.addEventListener("pointerleave", () => {
    receipt.style.transform = "";
  });
}

function startAirAxisTilt() {
  if (!css3dWorld || reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;

  window.addEventListener(
    "pointermove",
    (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      css3dWorld.style.setProperty("--mx-rotate", `${(x * 10).toFixed(2)}deg`);
      css3dWorld.style.setProperty("--my-rotate", `${(y * 8).toFixed(2)}deg`);
    },
    { passive: true }
  );
}

const spaceContent = {
  lpr: {
    visualIndex: "PYEONGTAEK STN.",
    visualTitle: "일상과 일상이 만나는 공간.",
    photo: "./assets/local-play-record-day-web.jpg",
    photoAlt: "LOCAL PLAY RECORD 낮 외관과 초록 네온 간판",
    logo: "./assets/local-play-record-logo.png",
    logoAlt: "LOCAL PLAY RECORD 로고",
    levels: ["2F PERFORMANCE", "1F LOCAL DRINKS"],
    kicker: "LOCAL PLAY RECORD",
    title: "일상과 일상이 만나는 공간.",
    body:
      "1F는 경기도 양조장과 함께 고르고 채우는 로컬 전통주 공간, 2F는 매주 진행되는 다양한 소셜링이 열리는 복합문화공간입니다.",
    points: ["매주 진행되는 다양한 소셜링", "지역 생산자와 연결되는 로컬 F&B", "공연, 대관, 팝업 협업 가능"],
  },
  archive: {
    visualIndex: "GODEOK ARCHIVE",
    visualTitle: "인쇄와 기록이 머무는 작업실.",
    photo: "./assets/flat-archive-room-web.jpg",
    photoAlt: "플랫 인쇄창작아카이브룸 내부 공간",
    logo: "",
    logoAlt: "",
    levels: ["LOCAL MAGAZINE", "PRINT / PUBLISH"],
    kicker: "FLAT 인쇄창작아카이브룸",
    title: "평택의 시간과 사람을 기록으로 연결합니다.",
    body:
      "고덕여염로20에 자리한 인쇄창작아카이브룸입니다. 로컬매거진 @SSAMPPONG, 마음의신호를 통해 지역의 장면을 콘텐츠로 남깁니다.",
    points: ["인쇄와 편집을 위한 작업 공간", "로컬매거진 @SSAMPPONG", "기록, 편집, 인쇄, 출판 기반"],
  },
};

function setHeaderState() {
  header.classList.toggle("is-scrolled", window.scrollY > 20);
}

function updateAirScrollField() {
  if (!airPage) return;

  const pageHeight = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const ratio = Math.min(Math.max(window.scrollY / pageHeight, 0), 1);
  const drift = Math.sin(ratio * Math.PI * 1.4) * 66;
  const sideDrift = drift * -0.45;
  const y = ratio * -184;
  const turn = ratio * 42;

  airPage.style.setProperty("--air-scroll-ratio", ratio.toFixed(4));
  airPage.style.setProperty("--air-scroll-y", `${y.toFixed(1)}px`);
  airPage.style.setProperty("--air-scroll-drift", `${drift.toFixed(1)}px`);
  airPage.style.setProperty("--air-scroll-drift-side", `${sideDrift.toFixed(1)}px`);
  airPage.style.setProperty("--air-scroll-turn", `${turn.toFixed(2)}deg`);
  airPage.style.setProperty("--air-scroll-turn-reverse", `${(-turn).toFixed(2)}deg`);
}

function handleScroll() {
  if (scrollFrame) return;

  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0;
    setHeaderState();
    updateAirScrollField();
  });
}

function openDrawer(startFlow = false, preset = "") {
  document.body.classList.add("drawer-open", "no-scroll");
  drawer.setAttribute("aria-hidden", "false");
  if (startFlow) {
    startWizard(preset);
  } else {
    showDrawerHome();
  }
}

function closeDrawer() {
  document.body.classList.remove("drawer-open", "no-scroll");
  drawer.setAttribute("aria-hidden", "true");
}

function showDrawerHome() {
  drawerHome.classList.remove("is-hidden");
  wizard.classList.add("is-hidden");
  currentStep = 1;
  showStep(currentStep);
}

function startWizard(preset = "") {
  drawerHome.classList.add("is-hidden");
  wizard.classList.remove("is-hidden");
  resetWizard();
  if (preset) {
    const presetButton = wizard.querySelector(`[data-choice-group="type"] [data-choice="${preset}"]`);
    if (presetButton) selectChoice(presetButton);
  }
  showStep(1);
}

function resetWizard() {
  currentStep = 1;
  choices.type = "";
  choices.space = "";
  choices.schedule = "";
  wizard.reset();
  wizard.querySelectorAll(".choice-grid button").forEach((button) => {
    button.classList.remove("is-selected");
  });
}

function showStep(step) {
  currentStep = step;
  wizard.querySelectorAll(".wizard-step").forEach((node) => {
    node.classList.toggle("is-active", Number(node.dataset.step) === step);
  });
}

function selectChoice(button) {
  const group = button.closest("[data-choice-group]");
  const groupName = group.dataset.choiceGroup;
  group.querySelectorAll("button").forEach((node) => node.classList.remove("is-selected"));
  button.classList.add("is-selected");
  choices[groupName] = button.dataset.choice;
}

function getChoiceFallback(key) {
  const labels = {
    type: "미정",
    space: "미정",
    schedule: "미정",
  };
  return choices[key] || labels[key];
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildSummary() {
  const formData = new FormData(wizard);
  const scheduleNote = formData.get("scheduleNote") || "";
  const name = formData.get("name") || "";
  const contact = formData.get("contact") || "";
  const message = formData.get("message") || "";
  const schedule = scheduleNote ? `${getChoiceFallback("schedule")} / ${scheduleNote}` : getChoiceFallback("schedule");

  summaryBox.innerHTML = `
    <p><strong>문의 유형</strong> ${escapeHtml(getChoiceFallback("type"))}</p>
    <p><strong>관련 공간</strong> ${escapeHtml(getChoiceFallback("space"))}</p>
    <p><strong>희망 일정</strong> ${escapeHtml(schedule)}</p>
    <p><strong>이름</strong> ${escapeHtml(name || "미입력")}</p>
    <p><strong>연락처</strong> ${escapeHtml(contact || "미입력")}</p>
    <p><strong>내용</strong> ${escapeHtml(message || "미입력")}</p>
  `;
  showStep(5);
}

function updateSpace(spaceKey) {
  const content = spaceContent[spaceKey];
  const visual = document.querySelector("[data-space-visual]");
  const kicker = document.querySelector("[data-space-kicker]");
  const title = document.querySelector("[data-space-title]");
  const body = document.querySelector("[data-space-body]");
  const points = document.querySelector("[data-space-points]");

  document.querySelectorAll(".space-tab").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.space === spaceKey);
  });

  visual.dataset.spaceKind = spaceKey;
  visual.innerHTML = `
    ${
      content.photo
        ? `<img class="space-photo" src="${content.photo}" alt="${content.photoAlt}" />`
        : ""
    }
    <span class="visual-index">${content.visualIndex}</span>
    ${
      content.logo
        ? `<div class="space-logo-plate"><img src="${content.logo}" alt="${content.logoAlt}" /></div>`
        : ""
    }
    <strong>${content.visualTitle}</strong>
    <div class="level-stack" aria-hidden="true">
      ${content.levels.map((level) => `<span>${level}</span>`).join("")}
    </div>
  `;
  kicker.textContent = content.kicker;
  title.textContent = content.title;
  body.textContent = content.body;
  points.innerHTML = content.points.map((point) => `<li>${point}</li>`).join("");
}

function startCounters() {
  if (countStarted) return;
  countStarted = true;
  document.querySelectorAll("[data-count]").forEach((node) => {
    const target = Number(node.dataset.count);
    const duration = 950;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = String(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      if (entry.target.classList.contains("stat-row")) startCounters();
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((node) => revealObserver.observe(node));

window.addEventListener("scroll", handleScroll, { passive: true });
window.addEventListener("resize", updateAirScrollField);
setHeaderState();
updateAirScrollField();
startAmbientCanvas();
startReceiptTilt();
startAirAxisTilt();

menuToggle.addEventListener("click", () => {
  const isOpen = siteMenu.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

siteMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    siteMenu.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll("[data-open-contact]").forEach((button) => {
  button.addEventListener("click", () => {
    openDrawer(false);
  });
});

document.querySelectorAll("[data-close-contact]").forEach((node) => {
  node.addEventListener("click", closeDrawer);
});

document.querySelector("[data-start-wizard]").addEventListener("click", () => {
  startWizard();
});

document.querySelectorAll("[data-start-wizard][data-preset]").forEach((button) => {
  button.addEventListener("click", () => {
    startWizard(button.dataset.preset);
  });
});

document.querySelector("[data-drawer-back]").addEventListener("click", () => {
  if (!wizard.classList.contains("is-hidden") && currentStep > 1) {
    showStep(currentStep - 1);
    return;
  }
  showDrawerHome();
});

wizard.querySelectorAll(".choice-grid button").forEach((button) => {
  button.addEventListener("click", () => selectChoice(button));
});

wizard.querySelectorAll("[data-next-step]").forEach((button) => {
  button.addEventListener("click", () => showStep(Math.min(currentStep + 1, 4)));
});

document.querySelector("[data-build-summary]").addEventListener("click", buildSummary);

document.querySelectorAll(".space-tab").forEach((button) => {
  button.addEventListener("click", () => updateSpace(button.dataset.space));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeDrawer();
});
