/* ============================================================
   HANGMAN — Game Logic
   script.js
   ============================================================ */

// ──────────────────────────────────────────────
// 1. WORD BANK  (word → category)
// ──────────────────────────────────────────────
const WORD_BANK = [
  // Animals
  { word: "ELEPHANT", category: "Animals" },
  { word: "GIRAFFE", category: "Animals" },
  { word: "PENGUIN", category: "Animals" },
  { word: "CROCODILE", category: "Animals" },
  { word: "CHIMPANZEE", category: "Animals" },
  { word: "KANGAROO", category: "Animals" },
  { word: "PLATYPUS", category: "Animals" },
  // Countries
  { word: "BRAZIL", category: "Countries" },
  { word: "PORTUGAL", category: "Countries" },
  { word: "INDONESIA", category: "Countries" },
  { word: "SWITZERLAND", category: "Countries" },
  { word: "ARGENTINA", category: "Countries" },
  { word: "EGYPT", category: "Countries" },
  // Technology
  { word: "JAVASCRIPT", category: "Technology" },
  { word: "KEYBOARD", category: "Technology" },
  { word: "ALGORITHM", category: "Technology" },
  { word: "DATABASE", category: "Technology" },
  { word: "COMPILER", category: "Technology" },
  { word: "BLOCKCHAIN", category: "Technology" },
  // Movies
  { word: "INCEPTION", category: "Movies" },
  { word: "INTERSTELLAR", category: "Movies" },
  { word: "GLADIATOR", category: "Movies" },
  { word: "AVATAR", category: "Movies" },
  { word: "PARASITE", category: "Movies" },
  // Food
  { word: "AVOCADO", category: "Food" },
  { word: "SPAGHETTI", category: "Food" },
  { word: "CROISSANT", category: "Food" },
  { word: "BLUEBERRY", category: "Food" },
  { word: "PINEAPPLE", category: "Food" },
  // Sports
  { word: "BASKETBALL", category: "Sports" },
  { word: "VOLLEYBALL", category: "Sports" },
  { word: "BADMINTON", category: "Sports" },
  { word: "GYMNASTICS", category: "Sports" },
  { word: "WRESTLING", category: "Sports" },
];

// ──────────────────────────────────────────────
// 2. CONSTANTS
// ──────────────────────────────────────────────
const MAX_WRONG = 6; // number of wrong guesses allowed

// ──────────────────────────────────────────────
// 3. GAME STATE
// ──────────────────────────────────────────────
let secretWord = ""; // the word to guess
let category = ""; // word's category
let guessedLetters = new Set(); // all letters guessed so far
let wrongCount = 0; // number of wrong guesses

// ──────────────────────────────────────────────
// 4. DOM REFERENCES
// ──────────────────────────────────────────────
const canvas = document.getElementById("hangmanCanvas");
const ctx = canvas.getContext("2d");
const wordDisplay = document.getElementById("wordDisplay");
const wrongLettersEl = document.getElementById("wrongLetters");
const heartsContainer = document.getElementById("heartsContainer");
const keyboard = document.getElementById("keyboard");
const categoryBadge = document.getElementById("categoryBadge");
const overlay = document.getElementById("overlay");
const overlayIcon = document.getElementById("overlayIcon");
const overlayTitle = document.getElementById("overlayTitle");
const overlayMsg = document.getElementById("overlayMsg");
const revealWord = document.getElementById("revealWord");
const overlayBtn = document.getElementById("overlayBtn");
const restartBtn = document.getElementById("restartBtn");
const particlesEl = document.getElementById("particles");

// ──────────────────────────────────────────────
// 5. INITIALISE GAME
// ──────────────────────────────────────────────
function initGame() {
  // Pick a random word
  const entry = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
  secretWord = entry.word;
  category = entry.category;

  // Reset state
  guessedLetters = new Set();
  wrongCount = 0;

  // Update UI
  categoryBadge.textContent = `Category: ${category}`;
  overlay.classList.add("hidden");

  renderWordDisplay();
  renderHearts();
  renderKeyboard();
  drawGallows();
  updateWrongLetters();
}

// ──────────────────────────────────────────────
// 6. RENDER WORD DISPLAY (blanks / revealed)
// ──────────────────────────────────────────────
function renderWordDisplay() {
  wordDisplay.innerHTML = "";

  // Support multi-word phrases (spaces)
  const words = secretWord.split(" ");

  words.forEach((word, wi) => {
    // Each letter
    word.split("").forEach((letter) => {
      const box = document.createElement("div");
      box.classList.add("letter-box");

      const charEl = document.createElement("div");
      charEl.classList.add("letter-char");
      charEl.dataset.letter = letter;

      if (guessedLetters.has(letter)) {
        charEl.textContent = letter;
        charEl.classList.add("revealed");
      } else {
        charEl.textContent = "";
        charEl.classList.add("hidden-char");
      }

      const lineEl = document.createElement("div");
      lineEl.classList.add("letter-line");

      box.appendChild(charEl);
      box.appendChild(lineEl);
      wordDisplay.appendChild(box);
    });

    // Add space between words (except last)
    if (wi < words.length - 1) {
      const sp = document.createElement("div");
      sp.classList.add("word-space");
      wordDisplay.appendChild(sp);
    }
  });
}

// ──────────────────────────────────────────────
// 7. RENDER HEARTS (life indicator)
// ──────────────────────────────────────────────
function renderHearts() {
  heartsContainer.innerHTML = "";
  for (let i = 0; i < MAX_WRONG; i++) {
    const h = document.createElement("span");
    h.classList.add("heart");
    h.textContent = "🕯";
    if (i < wrongCount) h.classList.add("lost");
    heartsContainer.appendChild(h);
  }
}

// ──────────────────────────────────────────────
// 8. RENDER ON-SCREEN KEYBOARD
// ──────────────────────────────────────────────
function renderKeyboard() {
  keyboard.innerHTML = "";
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach((letter) => {
    const btn = document.createElement("button");
    btn.classList.add("key-btn");
    btn.textContent = letter;
    btn.dataset.letter = letter;
    btn.setAttribute("aria-label", `Guess letter ${letter}`);

    if (guessedLetters.has(letter)) {
      btn.disabled = true;
      btn.classList.add(secretWord.includes(letter) ? "correct" : "wrong");
    }

    btn.addEventListener("click", () => handleGuess(letter));
    keyboard.appendChild(btn);
  });
}

// ──────────────────────────────────────────────
// 9. HANDLE A GUESS
// ──────────────────────────────────────────────
function handleGuess(letter) {
  if (guessedLetters.has(letter)) return; // already guessed

  guessedLetters.add(letter);

  if (secretWord.includes(letter)) {
    // ✅ Correct guess — reveal letters
    renderWordDisplay();
    markKeyButton(letter, "correct");

    if (checkWin()) {
      setTimeout(() => showOverlay(true), 500);
    }
  } else {
    // ❌ Wrong guess
    wrongCount++;
    renderHearts();
    drawHangmanPart(wrongCount);
    updateWrongLetters();
    markKeyButton(letter, "wrong");

    if (wrongCount >= MAX_WRONG) {
      setTimeout(() => showOverlay(false), 500);
    }
  }
}

// ──────────────────────────────────────────────
// 10. CHECK WIN CONDITION
// ──────────────────────────────────────────────
function checkWin() {
  // Win when every non-space letter has been guessed
  return secretWord
    .split("")
    .every((ch) => ch === " " || guessedLetters.has(ch));
}

// ──────────────────────────────────────────────
// 11. UPDATE WRONG LETTERS DISPLAY
// ──────────────────────────────────────────────
function updateWrongLetters() {
  const wrongs = [...guessedLetters].filter((l) => !secretWord.includes(l));
  wrongLettersEl.textContent = wrongs.length ? wrongs.join("  ") : "—";
}

// ──────────────────────────────────────────────
// 12. MARK KEY BUTTON AFTER GUESS
// ──────────────────────────────────────────────
function markKeyButton(letter, cls) {
  const btn = keyboard.querySelector(`[data-letter="${letter}"]`);
  if (btn) {
    btn.disabled = true;
    btn.classList.add(cls);
  }
}

// ──────────────────────────────────────────────
// 13. SHOW WIN / LOSE OVERLAY
// ──────────────────────────────────────────────
function showOverlay(won) {
  revealWord.textContent = secretWord;
  if (won) {
    overlayIcon.textContent = "🏆";
    overlayTitle.textContent = "Victory!";
    overlayMsg.innerHTML = `You saved the prisoner! The word was <strong id="revealWord">${secretWord}</strong>`;
  } else {
    overlayIcon.textContent = "💀";
    overlayTitle.textContent = "Defeated!";
    overlayMsg.innerHTML = `The prisoner is gone… The word was <strong id="revealWord">${secretWord}</strong>`;
  }
  overlay.classList.remove("hidden");
}

// ──────────────────────────────────────────────
// 14. DRAW HANGMAN ON CANVAS
// ──────────────────────────────────────────────

/* Style helpers */
function setStyle(color = "#c9972b", width = 2.5) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
}

/* Draw the gallows scaffold (always visible) */
function drawGallows() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.shadowColor = "rgba(201,151,43,0.25)";
  ctx.shadowBlur = 8;
  setStyle("rgba(201,151,43,0.45)", 3);

  ctx.beginPath();
  // Base
  ctx.moveTo(20, 248);
  ctx.lineTo(200, 248);
  // Pole
  ctx.moveTo(60, 248);
  ctx.lineTo(60, 20);
  // Top beam
  ctx.moveTo(60, 20);
  ctx.lineTo(150, 20);
  // Rope
  ctx.moveTo(150, 20);
  ctx.lineTo(150, 55);
  ctx.stroke();

  ctx.shadowBlur = 0;
}

/*
  Body parts drawn progressively:
  1 = head, 2 = body, 3 = left arm, 4 = right arm,
  5 = left leg, 6 = right leg
*/
function drawHangmanPart(part) {
  ctx.shadowColor = "rgba(224,92,42,0.35)";
  ctx.shadowBlur = 10;

  setStyle("#e05c2a", 2.8);

  switch (part) {
    case 1: // Head
      ctx.beginPath();
      ctx.arc(150, 75, 20, 0, Math.PI * 2);
      ctx.stroke();
      // Eyes (small dots)
      setStyle("#e05c2a", 3);
      ctx.beginPath();
      ctx.arc(143, 72, 2, 0, Math.PI * 2);
      ctx.arc(157, 72, 2, 0, Math.PI * 2);
      ctx.fill();
      // Sad mouth
      ctx.beginPath();
      ctx.arc(150, 80, 6, Math.PI * 0.1, Math.PI * 0.9);
      ctx.stroke();
      break;

    case 2: // Body (torso)
      ctx.beginPath();
      ctx.moveTo(150, 95);
      ctx.lineTo(150, 170);
      ctx.stroke();
      break;

    case 3: // Left arm
      ctx.beginPath();
      ctx.moveTo(150, 110);
      ctx.lineTo(115, 145);
      ctx.stroke();
      break;

    case 4: // Right arm
      ctx.beginPath();
      ctx.moveTo(150, 110);
      ctx.lineTo(185, 145);
      ctx.stroke();
      break;

    case 5: // Left leg
      ctx.beginPath();
      ctx.moveTo(150, 170);
      ctx.lineTo(115, 215);
      ctx.stroke();
      break;

    case 6: // Right leg (game over)
      ctx.beginPath();
      ctx.moveTo(150, 170);
      ctx.lineTo(185, 215);
      ctx.stroke();

      // Replace eyes with ✕ ✕ (dead)
      setStyle("#e05c2a", 2.5);
      // Left X
      ctx.beginPath();
      ctx.moveTo(139, 68);
      ctx.lineTo(145, 74);
      ctx.moveTo(145, 68);
      ctx.lineTo(139, 74);
      // Right X
      ctx.moveTo(153, 68);
      ctx.lineTo(159, 74);
      ctx.moveTo(159, 68);
      ctx.lineTo(153, 74);
      ctx.stroke();
      break;
  }

  ctx.shadowBlur = 0;
}

/* Redraw all parts up to current wrongCount (for restart consistency) */
function redrawAllParts() {
  drawGallows();
  for (let i = 1; i <= wrongCount; i++) {
    drawHangmanPart(i);
  }
}

// ──────────────────────────────────────────────
// 15. KEYBOARD INPUT (physical keyboard)
// ──────────────────────────────────────────────
document.addEventListener("keydown", (e) => {
  const letter = e.key.toUpperCase();
  if (
    /^[A-Z]$/.test(letter) &&
    !overlay.classList.contains("hidden") === false
  ) {
    handleGuess(letter);
  }
});

// ──────────────────────────────────────────────
// 16. BUTTON EVENTS
// ──────────────────────────────────────────────
restartBtn.addEventListener("click", initGame);
overlayBtn.addEventListener("click", initGame);

// ──────────────────────────────────────────────
// 17. AMBIENT PARTICLES SETUP
// ──────────────────────────────────────────────
function spawnParticles(count = 24) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.classList.add("particle");
    p.style.left = `${Math.random() * 100}%`;
    p.style.bottom = `-${Math.random() * 20}px`;
    p.style.setProperty("--dur", `${6 + Math.random() * 10}s`);
    p.style.setProperty("--delay", `${Math.random() * 10}s`);
    p.style.opacity = Math.random() * 0.5 + 0.1;
    // Vary size slightly
    const sz = 2 + Math.random() * 3;
    p.style.width = `${sz}px`;
    p.style.height = `${sz}px`;
    particlesEl.appendChild(p);
  }
}

// ──────────────────────────────────────────────
// 18. START!
// ──────────────────────────────────────────────
spawnParticles(30);
initGame();
