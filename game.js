// ── Puzzle bank ───────────────────────────────────────────────────────────────
const PUZZLES = {
  wordScramble: [
    { scrambled: "ZZAIP",  answer: "PIZZA",   hint: "Yummy round food with toppings 🍕" },
    { scrambled: "LCEARI", answer: "CEREAL",  hint: "Breakfast food you pour milk on 🥣" },
    { scrambled: "NOECY",  answer: "MONEY",   hint: "Used to buy things 💰" },
    { scrambled: "RCEAK",  answer: "CREAK",   hint: "Sound a spooky door makes 👻" },
    { scrambled: "PSLAE",  answer: "LEAPS",   hint: "Jumps or springs forward 🐸" },
    { scrambled: "TOBOR",  answer: "ROBOT",   hint: "A machine that can do tasks 🤖" },
    { scrambled: "CALME",  answer: "CAMEL",   hint: "A desert animal with humps 🐪" },
    { scrambled: "PELPA",  answer: "APPLE",   hint: "A crunchy red or green fruit 🍎" },
    { scrambled: "LGUNE",  answer: "LUNGE",   hint: "A sudden forward movement ⚔️" },
    { scrambled: "TRIGS",  answer: "GRITS",   hint: "A type of ground corn food 🌽" },
  ],
  riddles: [
    { question: "I have hands but cannot clap. What am I?",
      answer: "clock", hint: "You look at me to know the time ⏰" },
    { question: "I'm light as a feather, but even the strongest person can't hold me for more than 5 minutes. What am I?",
      answer: "breath", hint: "You do it to stay alive 💨" },
    { question: "What has keys but no locks, space but no room, and you can enter but can't go inside?",
      answer: "keyboard", hint: "You're probably near one right now ⌨️" },
    { question: "I speak without a mouth and hear without ears. I have no body, but I come alive with the wind. What am I?",
      answer: "echo", hint: "Shout in a cave and I come back to you 🏔️" },
    { question: "The more you take, the more you leave behind. What am I?",
      answer: "footsteps", hint: "Think about walking on a beach 🏖️" },
    { question: "I have cities, but no houses. Mountains, but no trees. Water, but no fish. What am I?",
      answer: "map", hint: "You use me to find your way 🗺️" },
    { question: "What can travel around the world while staying in one corner?",
      answer: "stamp", hint: "You put me on an envelope ✉️" },
    { question: "I go up but never come down. What am I?",
      answer: "age", hint: "Every birthday this increases 🎂" },
  ],
  math: [
    { question: "If you have 3 apples and get 5 more, then give 4 away — how many do you have?",
      answer: "4", hint: "3 + 5 = 8, then 8 − 4 = ?" },
    { question: "A spider has 8 legs. How many legs do 7 spiders have?",
      answer: "56", hint: "Multiply 8 × 7 🕷️" },
    { question: "What is half of 64, plus 10?",
      answer: "42", hint: "Half of 64 is 32, then add 10" },
    { question: "If a train travels 60 km every hour, how far does it go in 3 and a half hours?",
      answer: "210", hint: "60 × 3 = 180, plus 60 × 0.5 = 30 🚂" },
    { question: "What is 9 × 9 minus 9?",
      answer: "72", hint: "9 × 9 = 81, then minus 9" },
    { question: "You save R5 every day. After 3 weeks, how much have you saved?",
      answer: "105", hint: "3 weeks = 21 days. 21 × 5 = ? 💰" },
    { question: "What number comes next?   2 → 4 → 8 → 16 → ___",
      answer: "32", hint: "Each number is doubled 🔢" },
    { question: "There are 6 boxes with 9 crayons each. How many crayons in total?",
      answer: "54", hint: "Multiply 6 × 9 🖍️" },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── DOM refs ──────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

const screens      = { intro: $("screen-intro"), question: $("screen-question"), results: $("screen-results"), bye: $("screen-bye") };
const statsBar     = $("stats-bar");
const progressWrap = $("progress-wrap");
const progressBar  = $("progress-bar");
const footer       = $("footer");
const answerInput  = $("answer-input");
const submitBtn    = $("submit-btn");
const qBadge       = $("q-badge");
const qBody        = $("q-body");
const hintBox      = $("hint-box");
const hintText     = $("hint-text");
const feedbackArea = $("feedback-area");

// ── Screen switching ──────────────────────────────────────────────────────────
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[name].classList.add("active");
}

// ── Feedback messages ─────────────────────────────────────────────────────────
function clearFeedback() { feedbackArea.innerHTML = ""; }

function addFeedback(icon, text, type) {
  const el = document.createElement("div");
  el.className = `feedback-msg ${type}`;
  el.innerHTML = `<span>${icon}</span><span>${text}</span>`;
  feedbackArea.appendChild(el);
  feedbackArea.scrollTop = feedbackArea.scrollHeight;
}

// ── Stats helpers ─────────────────────────────────────────────────────────────
function updateStats(score, lives, round, total) {
  $("stat-score").textContent = score;
  $("stat-lives").textContent = "❤️".repeat(lives) + "🖤".repeat(3 - lives);
  $("stat-round").textContent = `${round} / ${total}`;
  progressBar.style.width = `${(round / total) * 100}%`;
}

// ── Input promise ─────────────────────────────────────────────────────────────
function waitForInput() {
  return new Promise(resolve => {
    answerInput.disabled = false;
    answerInput.value = "";
    answerInput.focus();

    function submit() {
      const val = answerInput.value.trim();
      if (!val) return;
      answerInput.value = "";
      answerInput.disabled = true;
      submitBtn.removeEventListener("click", submit);
      answerInput.removeEventListener("keydown", onKey);
      resolve(val);
    }

    function onKey(e) { if (e.key === "Enter") submit(); }

    submitBtn.addEventListener("click", submit);
    answerInput.addEventListener("keydown", onKey);
  });
}

// ── Game class ────────────────────────────────────────────────────────────────
class PuzzleGame {
  constructor() {
    this.score  = 0;
    this.lives  = 3;
    this.name   = "Explorer";
    this.rounds = [];
  }

  buildRounds() {
    const s = shuffle(PUZZLES.wordScramble).slice(0, 4).map(p => ({ type: "wordScramble", ...p }));
    const r = shuffle(PUZZLES.riddles).slice(0, 3).map(p => ({ type: "riddle", ...p }));
    const m = shuffle(PUZZLES.math).slice(0, 3).map(p => ({ type: "math", ...p }));
    return shuffle([...s, ...r, ...m]);
  }

  // ── Intro ──────────────────────────────────────────────────────────────────
  async intro() {
    showScreen("intro");

    await new Promise(resolve => {
      $("start-btn").onclick = () => {
        const val = $("name-input").value.trim();
        this.name = val || "Explorer";
        resolve();
      };
      $("name-input").addEventListener("keydown", e => { if (e.key === "Enter") $("start-btn").click(); });
    });
  }

  // ── Single round ───────────────────────────────────────────────────────────
  async playRound(puzzle, index, total) {
    // Set up question card
    clearFeedback();
    hintBox.classList.add("hidden");
    hintText.textContent = "";

    // Badge color + label
    const categoryMap = {
      wordScramble: { label: "🔤 Word Scramble", cls: "green" },
      riddle:       { label: "🤔 Riddle",        cls: "blue"  },
      math:         { label: "🔢 Maths Puzzle",  cls: "purple"},
    };
    const cat = categoryMap[puzzle.type];
    qBadge.textContent = cat.label;
    qBadge.className   = cat.cls;

    // Question body
    if (puzzle.type === "wordScramble") {
      qBody.innerHTML = `
        <p style="color:var(--text-muted);font-size:14px;margin-bottom:6px;">Unscramble the letters to find the hidden word:</p>
        <div class="scramble-display">${puzzle.scrambled}</div>
      `;
    } else {
      qBody.textContent = puzzle.question;
    }

    showScreen("question");
    footer.classList.remove("hidden");
    updateStats(this.score, this.lives, index + 1, total);

    // Wire up hint & skip buttons for this round
    let hintUsed = false;
    const hintBtn = $("hint-action-btn");
    const skipBtn = $("skip-action-btn");

    hintBtn.onclick = () => {
      if (hintUsed) { addFeedback("💡", "You already used your hint!", "info"); return; }
      hintUsed = true;
      this.score = Math.max(0, this.score - 1);
      hintText.textContent = puzzle.hint;
      hintBox.classList.remove("hidden");
      updateStats(this.score, this.lives, index + 1, total);
      answerInput.focus();
    };

    skipBtn.onclick = () => {
      answerInput.value = "__SKIP__";
      submitBtn.click();
    };

    // Answer loop
    while (true) {
      const raw   = await waitForInput();
      const input = raw.toUpperCase().trim();

      if (input === "__SKIP__") {
        this.lives--;
        addFeedback("⏭️", `Skipped! The answer was: ${puzzle.answer.toUpperCase()}`, "skip");
        updateStats(this.score, this.lives, index + 1, total);
        await sleep(1800);
        return;
      }

      if (input === puzzle.answer.toUpperCase()) {
        const pts  = hintUsed ? 5 : 10;
        this.score += pts;
        const praise = ["🎉 Amazing!", "🌟 Brilliant!", "🔥 You're on fire!", "💪 Superstar!", "🏆 Genius!"];
        const msg = praise[Math.floor(Math.random() * praise.length)];
        addFeedback("✅", `${msg}  +${pts} points!`, "correct");
        updateStats(this.score, this.lives, index + 1, total);
        await sleep(1600);
        return;
      }

      addFeedback("❌", "Not quite — try again!", "wrong");
      answerInput.focus();
    }
  }

  // ── Results ────────────────────────────────────────────────────────────────
  async showResults(total) {
    footer.classList.add("hidden");
    showScreen("results");

    const max = total * 10;
    const pct = Math.round((this.score / max) * 100);

    let emoji, title, msg;
    if      (pct >= 90) { emoji = "🏆"; title = "Legendary!";          msg = "You're a true Puzzle Master!"; }
    else if (pct >= 70) { emoji = "🌟"; title = "Amazing!";             msg = "What a brilliant adventurer!"; }
    else if (pct >= 50) { emoji = "👍"; title = "Great job!";           msg = "Keep practising — you're getting there!"; }
    else                { emoji = "💪"; title = "Good try!";            msg = "Practice makes perfect. Try again!"; }

    $("results-emoji").textContent   = emoji;
    $("results-title").textContent   = title;
    $("results-score").textContent   = this.score;
    $("results-max").textContent     = `/ ${max}`;
    $("results-msg").textContent     = msg;
    $("results-lives").textContent   = this.lives > 0 ? "❤️".repeat(this.lives) + " lives remaining" : "No lives left — still awesome!";

    // Animate bar after short delay
    setTimeout(() => { $("results-bar").style.width = `${pct}%`; }, 100);

    await new Promise(resolve => {
      $("play-again-btn").onclick = resolve;
      $("quit-btn").onclick = async () => {
        showScreen("bye");
        $("bye-msg").textContent = `Thanks for playing, ${this.name}! 👋`;
        $("bye-sub").textContent = `You scored ${this.score} out of ${max}. See you next time!`;
      };
    });

    // Reset and restart
    this.score = 0;
    this.lives = 3;
    await this.run();
  }

  // ── Main loop ──────────────────────────────────────────────────────────────
  async run() {
    await this.intro();

    statsBar.classList.remove("hidden");
    progressWrap.classList.remove("hidden");

    this.rounds = this.buildRounds();

    for (let i = 0; i < this.rounds.length; i++) {
      if (this.lives <= 0) break;
      await this.playRound(this.rounds[i], i, this.rounds.length);
    }

    await this.showResults(this.rounds.length);
  }
}

// ── How to Play modal ─────────────────────────────────────────────────────────
function toggleHelp() {
  const overlay = $("help-overlay");
  overlay.classList.toggle("open");
  if (overlay.classList.contains("open")) {
    $("help-close").focus();
    overlay.addEventListener("click", outsideClick);
  } else {
    overlay.removeEventListener("click", outsideClick);
  }
}

function outsideClick(e) {
  if (e.target === $("help-overlay")) toggleHelp();
}

document.addEventListener("keydown", e => {
  if (e.key === "Escape" && $("help-overlay").classList.contains("open")) toggleHelp();
});

// ── Boot ──────────────────────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => new PuzzleGame().run());
