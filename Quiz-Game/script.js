/**
 * ════════════════════════════════════════════════
 *  TECH DNA QUIZ — script.js
 *  Author:  Quiz Engine v2
 *  Purpose: Quiz logic, scoring, personality map,
 *           screen transitions, sound FX, sharing
 * ════════════════════════════════════════════════
 */

"use strict";

/* ──────────────────────────────────────────────────
   1. QUIZ DATA
   Each answer maps to one or more personality codes.
   Codes: FE | BE | FS | UX | CY | DA | AI | MB
   ────────────────────────────────────────────────── */
const QUESTIONS = [
  {
    id: 1,
    category: "Mindset",
    text: "A wild bug appears at 2 AM. What is your first instinct?",
    options: [
      { label: "Inspect Element and poke the CSS.", codes: ["FE", "UX"] },
      {
        label: "grep logs until the stack trace surrenders.",
        codes: ["BE", "CY"],
      },
      { label: "Write a reproducible test case first.", codes: ["FS", "DA"] },
      {
        label: "Ask an AI for the root cause, then verify.",
        codes: ["AI", "MB"],
      },
    ],
  },
  {
    id: 2,
    category: "Aesthetic",
    text: "Which dashboard makes you want to frame it on a wall?",
    options: [
      {
        label: "Glassmorphism cards with micro-animations.",
        codes: ["FE", "UX"],
      },
      { label: "Grafana metrics in 12 glowing panels.", codes: ["BE", "DA"] },
      {
        label: "A single terminal with live data streaming.",
        codes: ["CY", "AI"],
      },
      { label: "Clean mobile UI with haptic feedback.", codes: ["MB", "FS"] },
    ],
  },
  {
    id: 3,
    category: "Side Project",
    text: "Saturday free time. What do you actually build?",
    options: [
      {
        label: "A portfolio with silky scroll animations.",
        codes: ["FE", "UX"],
      },
      { label: "A REST API with zero-latency caching.", codes: ["BE", "FS"] },
      { label: "A CTF challenge solver / pentest toolkit.", codes: ["CY"] },
      {
        label: "A neural net that predicts my coffee intake.",
        codes: ["AI", "DA"],
      },
    ],
  },
  {
    id: 4,
    category: "Superpower",
    text: "What secret superpower do you secretly flex?",
    options: [
      { label: "Pixel-perfect layouts without a ruler.", codes: ["FE", "UX"] },
      { label: "Optimising a query from 8 s to 12 ms.", codes: ["BE", "DA"] },
      {
        label: "Shipping iOS + Android from a single codebase.",
        codes: ["MB", "FS"],
      },
      { label: "Sniffing network traffic for anomalies.", codes: ["CY", "AI"] },
    ],
  },
  {
    id: 5,
    category: "Tool Belt",
    text: "Which tool lives permanently in your terminal?",
    options: [
      {
        label: "Figma / Storybook — components are life.",
        codes: ["FE", "UX"],
      },
      {
        label: "Docker + k8s — containers all the way down.",
        codes: ["BE", "FS"],
      },
      { label: "Wireshark / Burp Suite — trust but verify.", codes: ["CY"] },
      { label: "Jupyter Notebooks — data never lies.", codes: ["DA", "AI"] },
    ],
  },
  {
    id: 6,
    category: "Teamwork",
    text: "Scrum planning. Where do you shine?",
    options: [
      { label: "Defining the user flow and wireframes.", codes: ["UX", "FE"] },
      { label: "Breaking down backend epics into tasks.", codes: ["BE", "FS"] },
      { label: "Owning the threat-model session.", codes: ["CY"] },
      {
        label: "Presenting dataset insights to stakeholders.",
        codes: ["DA", "AI"],
      },
    ],
  },
  {
    id: 7,
    category: "Learning",
    text: "New tech drops. How do you learn it?",
    options: [
      { label: "Clone the repo and dissect the styles.", codes: ["FE", "UX"] },
      { label: "Spin up a local instance and bench it.", codes: ["BE", "FS"] },
      { label: "Read the CVE list for known flaws first.", codes: ["CY"] },
      {
        label: "Find the research paper and the benchmark.",
        codes: ["AI", "DA"],
      },
    ],
  },
  {
    id: 8,
    category: "Philosophy",
    text: "Your core engineering philosophy is…",
    options: [
      { label: '"If it looks bad, it is bad."', codes: ["FE", "UX"] },
      { label: '"Scale before you need to."', codes: ["BE", "FS"] },
      {
        label: '"Security is not a feature — it\'s the foundation."',
        codes: ["CY"],
      },
      { label: '"Data beats opinion every time."', codes: ["DA", "AI"] },
    ],
  },
  {
    id: 9,
    category: "Achievement",
    text: "Which win would give you the biggest dopamine hit?",
    options: [
      { label: "Lighthouse score: 100 / 100 / 100 / 100.", codes: ["FE"] },
      { label: "API handles 1 M req/s without a sweat.", codes: ["BE"] },
      { label: "Zero vulnerabilities in the pentest report.", codes: ["CY"] },
      { label: "Model accuracy jumps 15% overnight.", codes: ["AI", "DA"] },
    ],
  },
  {
    id: 10,
    category: "Dream Stack",
    text: "Your dream stack for a greenfield app is…",
    options: [
      { label: "React + Tailwind + Framer Motion.", codes: ["FE", "UX"] },
      { label: "Go + PostgreSQL + Redis + gRPC.", codes: ["BE", "FS"] },
      { label: "Rust + zero-trust network + HSMs.", codes: ["CY"] },
      { label: "Python + PyTorch + Airflow + Snowflake.", codes: ["AI", "DA"] },
    ],
  },
];

/* ──────────────────────────────────────────────────
   2. PERSONALITY DEFINITIONS
   Keyed by code string. Includes traits + rarity.
   ────────────────────────────────────────────────── */
const PERSONALITIES = {
  FE: {
    emoji: "🎨",
    title: "Frontend Wizard",
    desc: "You make the web beautiful and butter-smooth. CSS animations, pixel-perfect layouts, and performant React components are your bread and butter. You believe great UX is invisible — until it's not.",
    traits: [
      "CSS Ninja",
      "Animation Lover",
      "Lighthouse Chaser",
      "React Devotee",
    ],
    rarity: "⚡ Fairly Common",
  },
  BE: {
    emoji: "⚙️",
    title: "Backend Brain",
    desc: "You live in the server room of the mind. Latency graphs, database indexes, and distributed systems keep you up at night — in a good way. You're the reason the app doesn't crash at scale.",
    traits: [
      "Scale Fanatic",
      "Query Optimizer",
      "API Architect",
      "Docker Evangelist",
    ],
    rarity: "🔥 Very Common",
  },
  FS: {
    emoji: "🚀",
    title: "Full Stack Beast",
    desc: "You blur the line between front and back like it's nothing. PR reviews covering React, Node, SQL, and DevOps? Easy. You ship features end-to-end and terrify specialists at their own game.",
    traits: [
      "T-Shaped Dev",
      "Context Switcher",
      "Ship it Captain",
      "Debugs Everything",
    ],
    rarity: "💎 Rare Type",
  },
  UX: {
    emoji: "✨",
    title: "UI/UX Creator",
    desc: "Empathy is your compiler. You design experiences that feel human — every hover state, micro-animation, and loading skeleton is deliberate. You're the voice of the user in every sprint.",
    traits: ["User Advocate", "Wireframe Wizard", "A/B Tester", "Figma Pro"],
    rarity: "🌟 Uncommon",
  },
  CY: {
    emoji: "🔐",
    title: "Cyber Guardian",
    desc: 'You think like an attacker to protect like a defender. Zero-trust, threat models, and red-teaming are your playground. You\'re the engineer who asks "but what if someone abuses this?" — and saves the day.',
    traits: [
      "Threat Modeler",
      "Zero Trust Believer",
      "CTF Competitor",
      "Patch Watcher",
    ],
    rarity: "🔐 Elite Type",
  },
  DA: {
    emoji: "📊",
    title: "Data Detective",
    desc: "Numbers whisper to you. You wrangle messy datasets, build pipelines that sing, and turn charts into decisions. You never ship a feature without first running the numbers on who actually wants it.",
    traits: [
      "SQL Wizard",
      "Pipeline Architect",
      "Insight Hunter",
      "Chart Whisperer",
    ],
    rarity: "📊 Uncommon",
  },
  AI: {
    emoji: "🤖",
    title: "AI Innovator",
    desc: "You're building the future, one model at a time. Fine-tuning transformers, engineering prompts, and deploying inference pipelines feel like second nature. You see LLMs where others see buzzwords.",
    traits: [
      "Prompt Engineer",
      "Model Tuner",
      "MLOps Fan",
      "Research Follower",
    ],
    rarity: "🚀 Legendary Type",
  },
  MB: {
    emoji: "📱",
    title: "Mobile Maker",
    desc: "You live and die by app store reviews. Native gestures, offline-first architectures, and sub-16ms frame rendering are your obsessions. The world lives on phones — and you make that experience magical.",
    traits: [
      "Swipe Craftsman",
      "Offline First",
      "Battery Respecter",
      "App Store Veteran",
    ],
    rarity: "📱 Uncommon",
  },
};

/* ──────────────────────────────────────────────────
   3. STATE
   ────────────────────────────────────────────────── */
let state = {
  currentQ: 0, // current question index
  scores: {}, // { code: count }
  selectedIdx: null, // selected option index for current Q
  answers: [], // array of chosen option objects
};

/* ──────────────────────────────────────────────────
   4. DOM REFERENCES
   ────────────────────────────────────────────────── */
const screens = {
  welcome: document.getElementById("screen-welcome"),
  quiz: document.getElementById("screen-quiz"),
  result: document.getElementById("screen-result"),
};

const els = {
  btnStart: document.getElementById("btn-start"),
  btnNext: document.getElementById("btn-next"),
  btnRestart: document.getElementById("btn-restart"),
  btnShare: document.getElementById("btn-share"),
  qCounter: document.getElementById("q-counter"),
  qCategory: document.getElementById("q-category"),
  progressFill: document.getElementById("progress-fill"),
  questionText: document.getElementById("question-text"),
  optionsGrid: document.getElementById("options-grid"),
  resultEmoji: document.getElementById("result-emoji"),
  resultTitle: document.getElementById("result-title"),
  resultDesc: document.getElementById("result-desc"),
  resultTraits: document.getElementById("result-traits"),
  resultRarity: document.getElementById("result-rarity"),
  toast: document.getElementById("toast"),
};

/* ──────────────────────────────────────────────────
   5. AUDIO (Web Audio API — tiny beeps, no files)
   ────────────────────────────────────────────────── */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new AudioCtx();
  return audioCtx;
}

/**
 * Play a short synth tone.
 * @param {number} freq  - Hz
 * @param {number} dur   - seconds
 * @param {'sine'|'square'|'triangle'} type
 * @param {number} gain
 */
function playTone(freq, dur, type = "sine", gain = 0.08) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();

    osc.connect(amp);
    amp.connect(ctx.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    amp.gain.setValueAtTime(gain, ctx.currentTime);
    amp.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

    osc.start();
    osc.stop(ctx.currentTime + dur);
  } catch (_) {
    // Audio not supported — fail silently
  }
}

/* Convenience sound FX */
const sfx = {
  select: () => playTone(880, 0.08, "sine", 0.07),
  next: () => playTone(660, 0.12, "triangle", 0.06),
  start: () => {
    playTone(440, 0.08);
    setTimeout(() => playTone(554, 0.1), 80);
  },
  complete: () => {
    [523, 659, 784, 1047].forEach((f, i) =>
      setTimeout(() => playTone(f, 0.2, "sine", 0.07), i * 100),
    );
  },
};

/* ──────────────────────────────────────────────────
   6. SCREEN MANAGER
   ────────────────────────────────────────────────── */
function showScreen(name) {
  Object.values(screens).forEach((s) => s.classList.remove("active"));
  screens[name].classList.add("active");
}

/* ──────────────────────────────────────────────────
   7. QUIZ ENGINE
   ────────────────────────────────────────────────── */

/** Reset all state and restart. */
function initQuiz() {
  state.currentQ = 0;
  state.scores = {};
  state.selectedIdx = null;
  state.answers = [];

  // Initialise scores to 0 for all codes
  Object.keys(PERSONALITIES).forEach((k) => {
    state.scores[k] = 0;
  });
}

/** Render the current question into the quiz card. */
function renderQuestion(animate = false) {
  const q = QUESTIONS[state.currentQ];
  const idx = state.currentQ;

  const card = document.querySelector(".quiz-card");

  function _paint() {
    // Counter + category
    els.qCounter.textContent = `Q ${idx + 1} / ${QUESTIONS.length}`;
    els.qCategory.textContent = q.category;

    // Progress bar
    const pct = (idx / QUESTIONS.length) * 100;
    els.progressFill.style.width = `${pct}%`;

    // Question text
    els.questionText.textContent = q.text;

    // Options
    els.optionsGrid.innerHTML = "";
    const letters = ["A", "B", "C", "D"];
    q.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.innerHTML = `<span class="opt-letter">${letters[i]}</span>${opt.label}`;
      btn.addEventListener("click", () => selectOption(i, btn));
      els.optionsGrid.appendChild(btn);
    });

    // Hide Next
    state.selectedIdx = null;
    els.btnNext.classList.add("hidden");

    if (animate) {
      card.classList.remove("slide-out");
      card.classList.add("slide-in");
      setTimeout(() => card.classList.remove("slide-in"), 350);
    }
  }

  if (animate) {
    card.classList.add("slide-out");
    setTimeout(_paint, 260);
  } else {
    _paint();
  }
}

/** Handle option selection. */
function selectOption(optionIndex, btnEl) {
  if (state.selectedIdx !== null) return; // already chosen

  state.selectedIdx = optionIndex;
  sfx.select();

  // Visual: mark selected, disable others
  const btns = els.optionsGrid.querySelectorAll(".option-btn");
  btns.forEach((b, i) => {
    if (i === optionIndex) b.classList.add("selected");
    else b.classList.add("disabled");
  });

  // Reveal Next button
  els.btnNext.classList.remove("hidden");
  els.btnNext.style.opacity = "1";
  els.btnNext.style.transform = "translateY(0)";
}

/** Commit the current answer and move to next Q or results. */
function advance() {
  if (state.selectedIdx === null) return;

  sfx.next();

  // Tally scores
  const q = QUESTIONS[state.currentQ];
  const chosen = q.options[state.selectedIdx];
  state.answers.push(chosen);
  chosen.codes.forEach((code) => {
    state.scores[code] = (state.scores[code] || 0) + 1;
  });

  state.currentQ++;

  if (state.currentQ < QUESTIONS.length) {
    renderQuestion(true); // animate transition
  } else {
    // Quiz complete
    els.progressFill.style.width = "100%";
    setTimeout(showResult, 400);
  }
}

/* ──────────────────────────────────────────────────
   8. RESULT ENGINE
   ────────────────────────────────────────────────── */

/** Determine top personality code from scores. */
function getTopPersonality() {
  const sorted = Object.entries(state.scores).sort((a, b) => b[1] - a[1]);
  return sorted[0][0]; // highest score code
}

/** Render the result screen. */
function showResult() {
  sfx.complete();

  const code = getTopPersonality();
  const p = PERSONALITIES[code];

  // Populate
  els.resultEmoji.textContent = p.emoji;
  els.resultTitle.textContent = p.title;
  els.resultDesc.textContent = p.desc;
  els.resultRarity.textContent = p.rarity;

  // Trait chips
  els.resultTraits.innerHTML = "";
  p.traits.forEach((t) => {
    const chip = document.createElement("span");
    chip.className = "trait-chip";
    chip.textContent = t;
    els.resultTraits.appendChild(chip);
  });

  showScreen("result");
}

/* ──────────────────────────────────────────────────
   9. SHARE
   ────────────────────────────────────────────────── */
function shareResult() {
  const code = getTopPersonality();
  const p = PERSONALITIES[code];
  const text = `I just discovered my Tech Personality is ${p.emoji} ${p.title}!\n\nTake the Tech DNA Quiz and find yours! #TechDNA #DevLife`;

  if (navigator.share) {
    navigator.share({ title: "Tech DNA Quiz", text }).catch(() => {});
  } else {
    navigator.clipboard
      .writeText(text)
      .then(() => showToast())
      .catch(() => {});
  }
}

/** Show the copy-success toast. */
function showToast() {
  els.toast.classList.add("show");
  setTimeout(() => els.toast.classList.remove("show"), 2800);
}

/* ──────────────────────────────────────────────────
   10. EVENT LISTENERS
   ────────────────────────────────────────────────── */

// Start quiz
els.btnStart.addEventListener("click", () => {
  sfx.start();
  initQuiz();
  renderQuestion(false);
  showScreen("quiz");
});

// Next question
els.btnNext.addEventListener("click", advance);

// Allow keyboard navigation (Enter / Space)
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    if (!els.btnNext.classList.contains("hidden")) {
      e.preventDefault();
      advance();
    }
  }
});

// Restart
els.btnRestart.addEventListener("click", () => {
  initQuiz();
  renderQuestion(false);
  showScreen("quiz");
});

// Share
els.btnShare.addEventListener("click", shareResult);

/* ──────────────────────────────────────────────────
   11. INIT
   ────────────────────────────────────────────────── */
// Show welcome screen on load (already .active in HTML)
// Nothing extra needed — CSS handles the initial state.

console.log(
  "%c⚡ Tech DNA Quiz loaded.",
  "color:#3df0ff;font-weight:bold;font-size:14px;",
);
