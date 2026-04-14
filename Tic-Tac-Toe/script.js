/* ============================================================
   SCRIPT.JS — Tic Tac Toe | Game Logic
   Features: 2-player, vs CPU (minimax), win detection,
             scoreboard, sound effects (Web Audio API), animations
   ============================================================ */

// ─── State ───────────────────────────────────────────────────
let board = Array(9).fill(null); // null | 'X' | 'O'
let currentPlayer = "X";
let gameOver = false;
let gameMode = "two"; // 'two' | 'cpu'
let soundOn = true;

const scores = { X: 0, O: 0, Draw: 0 };

// All 8 winning combinations (indices in board[])
const WIN_COMBOS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // columns
  [0, 4, 8],
  [2, 4, 6], // diagonals
];

// ─── DOM References ───────────────────────────────────────────
const boardEl = document.getElementById("board");
const turnBanner = document.getElementById("turn-banner");
const turnIcon = document.getElementById("turn-icon");
const turnText = document.getElementById("turn-text");
const statusMsg = document.getElementById("status-message");
const statusText = document.getElementById("status-text");
const scoreX = document.getElementById("score-x");
const scoreO = document.getElementById("score-o");
const scoreDraw = document.getElementById("score-draw");
const soundToggle = document.getElementById("sound-toggle");

// ─── Audio (Web Audio API — no files needed) ──────────────────
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

/** Lazily create AudioContext on first user gesture */
function getAudioCtx() {
  if (!audioCtx) audioCtx = new AudioCtx();
  return audioCtx;
}

/**
 * Play a simple beep/tone programmatically.
 * @param {number} freq  - frequency in Hz
 * @param {number} dur   - duration in seconds
 * @param {string} type  - oscillator type: 'sine'|'square'|'sawtooth'|'triangle'
 * @param {number} vol   - volume 0–1
 */
function playTone(freq, dur, type = "sine", vol = 0.18) {
  if (!soundOn) return;
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur);
  } catch (e) {
    /* AudioContext blocked before user gesture — silent fail */
  }
}

/** Sound: cell marked */
function soundMark(player) {
  if (player === "X") playTone(520, 0.12, "triangle", 0.15);
  else playTone(330, 0.12, "triangle", 0.15);
}

/** Sound: win fanfare */
function soundWin() {
  [440, 554, 660, 880].forEach((f, i) => {
    setTimeout(() => playTone(f, 0.18, "sine", 0.2), i * 90);
  });
}

/** Sound: draw */
function soundDraw() {
  [300, 280, 260].forEach((f, i) => {
    setTimeout(() => playTone(f, 0.15, "sawtooth", 0.1), i * 80);
  });
}

// ─── Board Rendering ──────────────────────────────────────────
/** Build the 9 cell elements and attach click listeners */
function renderBoard() {
  boardEl.innerHTML = "";
  board.forEach((val, idx) => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.setAttribute("role", "gridcell");
    cell.setAttribute("aria-label", `Cell ${idx + 1}${val ? ", " + val : ""}`);
    cell.dataset.index = idx;

    if (val) {
      cell.classList.add(val.toLowerCase(), "taken");
      cell.textContent = val === "X" ? "✕" : "◯";
    }

    if (gameOver || val) cell.classList.add("disabled");

    cell.addEventListener("click", handleCellClick);
    boardEl.appendChild(cell);
  });
}

// ─── Turn UI ──────────────────────────────────────────────────
function updateTurnUI() {
  const isX = currentPlayer === "X";
  turnIcon.textContent = isX ? "✕" : "◯";
  turnBanner.className = "turn-banner " + (isX ? "x-turn" : "o-turn");

  if (gameMode === "cpu" && !isX && !gameOver) {
    turnText.textContent = "CPU is thinking…";
  } else {
    const label =
      gameMode === "cpu" && isX ? "Your" : `Player ${currentPlayer}'s`;
    turnText.textContent = `${label} Turn`;
  }
}

// ─── Cell Click Handler ───────────────────────────────────────
function handleCellClick(e) {
  const idx = parseInt(e.currentTarget.dataset.index);
  if (gameOver || board[idx]) return;

  makeMove(idx, currentPlayer);
}

/** Place a mark, check result, hand off to CPU if needed */
function makeMove(idx, player) {
  board[idx] = player;
  renderBoard();
  soundMark(player);

  const result = checkResult();

  if (result) {
    handleGameEnd(result);
    return;
  }

  // Switch player
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateTurnUI();

  // CPU move
  if (gameMode === "cpu" && currentPlayer === "O" && !gameOver) {
    boardEl.classList.add("disabled");
    setTimeout(cpuMove, 550); // small delay for "thinking" feel
  }
}

// ─── Result Checking ─────────────────────────────────────────
/**
 * Returns { winner: 'X'|'O', combo: [...] } | 'draw' | null
 */
function checkResult() {
  for (const combo of WIN_COMBOS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], combo };
    }
  }
  if (board.every(Boolean)) return "draw";
  return null;
}

/** Highlight winning cells */
function highlightWinners(combo, player) {
  combo.forEach((idx) => {
    const cell = boardEl.children[idx];
    cell.classList.add("winner", player.toLowerCase());
  });
}

// ─── Game End ─────────────────────────────────────────────────
function handleGameEnd(result) {
  gameOver = true;

  // Disable board hover
  document
    .querySelectorAll(".cell")
    .forEach((c) => c.classList.add("disabled"));

  if (result === "draw") {
    // Draw
    scores.Draw++;
    animateScore(scoreDraw, scores.Draw);
    showStatus("draw", "🤝 It's a Draw!");
    soundDraw();
    turnText.textContent = "It's a Draw!";
  } else {
    // Win
    const { winner, combo } = result;
    scores[winner]++;
    highlightWinners(combo, winner);
    soundWin();

    if (winner === "X") {
      animateScore(scoreX, scores.X);
      const label = gameMode === "cpu" ? "🎉 You Win!" : "🎉 Player X Wins!";
      showStatus("win-x", label);
      turnText.textContent = gameMode === "cpu" ? "You Win! 🎉" : "X Wins! 🎉";
    } else {
      animateScore(scoreO, scores.O);
      const label = gameMode === "cpu" ? "🤖 CPU Wins!" : "🎉 Player O Wins!";
      showStatus("win-o", label);
      turnText.textContent = gameMode === "cpu" ? "CPU Wins! 🤖" : "O Wins! 🎉";
    }
  }
}

/** Show the status banner */
function showStatus(cls, text) {
  statusMsg.className = "status-message " + cls;
  statusText.textContent = text;
}

/** Animate score counter bump */
function animateScore(el, newVal) {
  el.textContent = newVal;
  el.classList.remove("score-bump");
  // Force reflow to restart animation
  void el.offsetWidth;
  el.classList.add("score-bump");
}

// ─── CPU (Minimax AI) ─────────────────────────────────────────
function cpuMove() {
  boardEl.classList.remove("disabled");
  const best = getBestMove();
  makeMove(best, "O");
}

/** Find best move index using Minimax algorithm */
function getBestMove() {
  let bestScore = -Infinity;
  let bestIdx = -1;

  board.forEach((val, idx) => {
    if (!val) {
      board[idx] = "O";
      const score = minimax(board, 0, false);
      board[idx] = null;
      if (score > bestScore) {
        bestScore = score;
        bestIdx = idx;
      }
    }
  });
  return bestIdx;
}

/**
 * Minimax: returns score from CPU ('O') perspective
 * O is maximizer, X is minimizer
 */
function minimax(b, depth, isMaximizing) {
  const result = checkResult();
  if (result === "draw") return 0;
  if (result?.winner === "O") return 10 - depth;
  if (result?.winner === "X") return depth - 10;

  if (isMaximizing) {
    let best = -Infinity;
    b.forEach((val, i) => {
      if (!val) {
        b[i] = "O";
        best = Math.max(best, minimax(b, depth + 1, false));
        b[i] = null;
      }
    });
    return best;
  } else {
    let best = Infinity;
    b.forEach((val, i) => {
      if (!val) {
        b[i] = "X";
        best = Math.min(best, minimax(b, depth + 1, true));
        b[i] = null;
      }
    });
    return best;
  }
}

// ─── Controls ─────────────────────────────────────────────────
/** Start / restart a game (keep scores) */
function restartGame() {
  board = Array(9).fill(null);
  currentPlayer = "X";
  gameOver = false;
  statusMsg.className = "status-message hidden";
  statusText.textContent = "";
  boardEl.classList.remove("disabled");
  renderBoard();
  updateTurnUI();
}

/** Reset everything including scores */
function resetScores() {
  scores.X = scores.O = scores.Draw = 0;
  scoreX.textContent = 0;
  scoreO.textContent = 0;
  scoreDraw.textContent = 0;
  restartGame();
}

/** Switch game mode */
function setMode(mode) {
  gameMode = mode;
  document
    .getElementById("btn-two-player")
    .classList.toggle("active", mode === "two");
  document
    .getElementById("btn-vs-cpu")
    .classList.toggle("active", mode === "cpu");
  restartGame();
}

/** Toggle sound on/off */
function toggleSound() {
  soundOn = !soundOn;
  soundToggle.textContent = soundOn ? "🔊" : "🔇";
  soundToggle.classList.toggle("muted", !soundOn);
}

// ─── Init ─────────────────────────────────────────────────────
renderBoard();
updateTurnUI();
