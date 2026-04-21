// ── Puzzle bank ───────────────────────────────────────────────────────────────
const PUZZLES = {
  wordScramble: [
    { scrambled: "ZZAIP",  answer: "PIZZA",    hint: "Yummy round food with toppings 🍕" },
    { scrambled: "LCEARI", answer: "CEREAL",   hint: "Breakfast food you pour milk on 🥣" },
    { scrambled: "NOECY",  answer: "MONEY",    hint: "Used to buy things 💰" },
    { scrambled: "RCEAK",  answer: "CREAK",    hint: "Sound a spooky door makes 👻" },
    { scrambled: "PSLAE",  answer: "LEAPS",    hint: "Jumps or springs forward 🐸" },
    { scrambled: "LGUNE",  answer: "LUNGE",    hint: "A sudden forward movement ⚔️" },
    { scrambled: "TOBOR",  answer: "ROBOT",    hint: "A machine that can do tasks 🤖" },
    { scrambled: "CALME",  answer: "CAMEL",    hint: "A desert animal with humps 🐪" },
    { scrambled: "TRIGS",  answer: "GRITS",    hint: "A type of ground corn food 🌽" },
    { scrambled: "PELPA",  answer: "APPLE",    hint: "A crunchy red or green fruit 🍎" },
  ],
  riddles: [
    {
      question: "I have hands but cannot clap. What am I?",
      answer: "clock",
      hint: "You look at me to know the time ⏰",
    },
    {
      question: "I'm light as a feather, but even the strongest person can't hold me for more than 5 minutes. What am I?",
      answer: "breath",
      hint: "You do it to stay alive 💨",
    },
    {
      question: "What has keys but no locks, space but no room, and you can enter but can't go inside?",
      answer: "keyboard",
      hint: "You're probably near one right now ⌨️",
    },
    {
      question: "I speak without a mouth and hear without ears. I have no body, but I come alive with the wind. What am I?",
      answer: "echo",
      hint: "Shout in a cave and I come back to you 🏔️",
    },
    {
      question: "The more you take, the more you leave behind. What am I?",
      answer: "footsteps",
      hint: "Think about walking on a beach 🏖️",
    },
    {
      question: "I have cities, but no houses. Mountains, but no trees. Water, but no fish. What am I?",
      answer: "map",
      hint: "You use me to find your way 🗺️",
    },
    {
      question: "What can travel around the world while staying in one corner?",
      answer: "stamp",
      hint: "You put me on an envelope ✉️",
    },
    {
      question: "I go up but never come down. What am I?",
      answer: "age",
      hint: "Every birthday this increases 🎂",
    },
  ],
  math: [
    {
      question: "If you have 3 apples and get 5 more, then give 4 away — how many do you have?",
      answer: "4",
      hint: "3 + 5 = 8, then 8 − 4 = ?",
    },
    {
      question: "A spider has 8 legs. How many legs do 7 spiders have?",
      answer: "56",
      hint: "Multiply 8 × 7 🕷️",
    },
    {
      question: "What is half of 64, plus 10?",
      answer: "42",
      hint: "Half of 64 is 32, then add 10",
    },
    {
      question: "If a train travels 60 km every hour, how far in 3 and a half hours?",
      answer: "210",
      hint: "60 × 3 = 180, plus 60 × 0.5 = 30 🚂",
    },
    {
      question: "What is 9 × 9 minus 9?",
      answer: "72",
      hint: "9 × 9 = 81, then minus 9",
    },
    {
      question: "You save R5 every day. After 3 weeks, how much have you saved?",
      answer: "105",
      hint: "3 weeks = 21 days. 21 × 5 = ? 💰",
    },
    {
      question: "What number comes next? 2, 4, 8, 16, ___",
      answer: "32",
      hint: "Each number is doubled 🔢",
    },
    {
      question: "There are 6 boxes with 9 crayons each. How many crayons in total?",
      answer: "54",
      hint: "Multiply 6 × 9 🖍️",
    },
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

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── DOM helpers ───────────────────────────────────────────────────────────────
const output      = document.getElementById("output");
const answerInput = document.getElementById("answer-input");
const submitBtn   = document.getElementById("submit-btn");
const statusBar   = document.createElement("div");

function print(text = "", color = "white", extra = "") {
  const el = document.createElement("div");
  el.className = `line ${color} ${extra}`.trim();
  el.textContent = text;
  output.appendChild(el);
  output.scrollTop = output.scrollHeight;
  return el;
}

function spacer() {
  const el = document.createElement("div");
  el.className = "spacer";
  output.appendChild(el);
}

function clearOutput() {
  output.innerHTML = "";
}

function updateStatusBar(score, lives, round, total) {
  const bar = document.getElementById("status-bar");
  if (!bar) return;
  bar.querySelector("#status-score").textContent = `⭐ Score: ${score}`;
  bar.querySelector("#status-lives").textContent = "❤️".repeat(lives) + "🖤".repeat(3 - lives);
  bar.querySelector("#status-round").textContent = `Round ${round} / ${total}`;
}

// ── Input promise ─────────────────────────────────────────────────────────────
function waitForInput() {
  return new Promise((resolve) => {
    answerInput.disabled = false;
    answerInput.focus();

    function onSubmit() {
      const val = answerInput.value.trim();
      answerInput.value = "";
      answerInput.disabled = true;
      submitBtn.removeEventListener("click", onSubmit);
      answerInput.removeEventListener("keydown", onKey);
      resolve(val);
    }

    function onKey(e) {
      if (e.key === "Enter") onSubmit();
    }

    submitBtn.addEventListener("click", onSubmit);
    answerInput.addEventListener("keydown", onKey);
  });
}

// ── Quick-action chips ────────────────────────────────────────────────────────
function addQuickActions() {
  const existing = document.getElementById("quick-actions");
  if (existing) return;
  const div = document.createElement("div");
  div.id = "quick-actions";
  div.innerHTML = `
    <button class="chip hint-chip" onclick="injectInput('HINT')">💡 Hint (-1 pt)</button>
    <button class="chip skip-chip" onclick="injectInput('SKIP')">⏭️ Skip (-1 life)</button>
  `;
  document.getElementById("app").insertBefore(div, document.getElementById("input-row"));
}

function removeQuickActions() {
  const el = document.getElementById("quick-actions");
  if (el) el.remove();
}

function injectInput(val) {
  answerInput.value = val;
  submitBtn.click();
}

// ── Status bar ────────────────────────────────────────────────────────────────
function addStatusBar() {
  if (document.getElementById("status-bar")) return;
  const bar = document.createElement("div");
  bar.id = "status-bar";
  bar.innerHTML = `
    <span id="status-score">⭐ Score: 0</span>
    <span id="status-lives">❤️❤️❤️</span>
    <span id="status-round">Round 0 / 0</span>
  `;
  const app = document.getElementById("app");
  app.insertBefore(bar, document.getElementById("output"));
}

// ── Game ──────────────────────────────────────────────────────────────────────
class PuzzleGame {
  constructor() {
    this.score      = 0;
    this.lives      = 3;
    this.playerName = "";
    this.rounds     = [];
  }

  buildRounds() {
    const scrambles = shuffle(PUZZLES.wordScramble).slice(0, 4).map((p) => ({ type: "wordScramble", ...p }));
    const riddles   = shuffle(PUZZLES.riddles).slice(0, 3).map((p) => ({ type: "riddle", ...p }));
    const maths     = shuffle(PUZZLES.math).slice(0, 3).map((p) => ({ type: "math", ...p }));
    return shuffle([...scrambles, ...riddles, ...maths]);
  }

  async intro() {
    clearOutput();
    spacer();
    print("╔══════════════════════════════════════════╗", "banner");
    print("║    🧩  PUZZLE QUEST ADVENTURE  🧩        ║", "banner");
    print("╚══════════════════════════════════════════╝", "banner");
    spacer();
    print("Welcome, brave puzzle solver! 🌟", "yellow bold");
    spacer();
    print("You will face 3 types of challenges:", "white");
    print("  🔤  Word Scramble  — unscramble the jumbled word", "green");
    print("  🤔  Riddles        — think hard and solve it", "blue");
    print("  🔢  Math Puzzles   — crunch the numbers", "magenta");
    spacer();
    print("Rules:", "cyan bold");
    print("  • You have 3 lives ❤️", "white");
    print("  • Type HINT for a clue (costs 1 point)", "yellow");
    print("  • Type SKIP to skip (costs 1 life)", "red");
    spacer();
    print("What is your name, adventurer?", "cyan");

    const name = await waitForInput();
    this.playerName = name || "Explorer";

    clearOutput();
    spacer();
    print(`  Get ready, ${this.playerName}! 🚀`, "green bold");
    print("  Your quest begins in 3 seconds...", "gray");
    await sleep(3000);
  }

  async playRound(puzzle, index, total) {
    clearOutput();
    updateStatusBar(this.score, this.lives, index + 1, total);
    spacer();

    if (puzzle.type === "wordScramble") {
      print("🔤  WORD SCRAMBLE", "green bold");
      spacer();
      print("Unscramble this word:", "white");
      print(`  ➤  ${puzzle.scrambled}`, "yellow bold");
    } else if (puzzle.type === "riddle") {
      print("🤔  RIDDLE", "blue bold");
      spacer();
      print(puzzle.question, "white");
    } else {
      print("🔢  MATH PUZZLE", "magenta bold");
      spacer();
      print(puzzle.question, "white");
    }

    spacer();
    print("Type your answer below (or use the buttons):", "gray");
    addQuickActions();

    let hintUsed = false;

    while (true) {
      const raw   = await waitForInput();
      const input = raw.toUpperCase().trim();

      if (!input) continue;

      // Echo input
      print(`  ➤  ${raw}`, "gray");

      if (input === "HINT") {
        if (!hintUsed) {
          hintUsed = true;
          this.score = Math.max(0, this.score - 1);
          spacer();
          print(`💡  Hint: ${puzzle.hint}`, "yellow");
          updateStatusBar(this.score, this.lives, index + 1, total);
        } else {
          print("You already used your hint!", "yellow");
        }
        continue;
      }

      if (input === "SKIP") {
        this.lives--;
        spacer();
        print(`⏭️  Skipped! The answer was: ${puzzle.answer.toUpperCase()}`, "red");
        updateStatusBar(this.score, this.lives, index + 1, total);
        removeQuickActions();
        await sleep(2200);
        return;
      }

      if (input === puzzle.answer.toUpperCase()) {
        const points = hintUsed ? 5 : 10;
        this.score += points;
        const msgs = ["🎉 Amazing!", "🌟 Brilliant!", "🔥 You're on fire!", "💪 Superstar!", "🏆 Genius!"];
        const msg  = msgs[Math.floor(Math.random() * msgs.length)];
        spacer();
        print(`${msg}  +${points} points!`, "green bold");
        updateStatusBar(this.score, this.lives, index + 1, total);
        removeQuickActions();
        await sleep(1800);
        return;
      }

      spacer();
      print("❌  Not quite! Try again.", "red");
      print("   (Use 💡 Hint if you're stuck, or ⏭️ Skip to move on)", "gray");
    }
  }

  async showResults(total) {
    removeQuickActions();
    clearOutput();
    spacer();

    const maxScore = total * 10;
    const pct      = Math.round((this.score / maxScore) * 100);

    let emoji, msg, color;
    if (pct >= 90)      { emoji = "🏆"; msg = "LEGENDARY PUZZLE MASTER!";    color = "yellow"; }
    else if (pct >= 70) { emoji = "🌟"; msg = "AMAZING ADVENTURER!";          color = "cyan";   }
    else if (pct >= 50) { emoji = "👍"; msg = "GREAT JOB, KEEP GOING!";       color = "green";  }
    else                { emoji = "💪"; msg = "GOOD TRY — PRACTICE MAKES PERFECT!"; color = "magenta"; }

    print(`${emoji}  ${this.playerName}, here's how you did:`, color + " bold");
    spacer();
    print(`   Score:  ${this.score} / ${maxScore}  (${pct}%)`, "white bold");
    spacer();
    print(`   ${msg}`, color);
    spacer();

    if (this.lives > 0) {
      print(`   Lives remaining: ${"❤️".repeat(this.lives)}`, "green");
    } else {
      print("   You ran out of lives — but you still did great!", "red");
    }

    spacer();
    print("─".repeat(44), "divider");
    spacer();
    print("Play again? Type YES or NO", "cyan");
  }

  async run() {
    addStatusBar();
    await this.intro();

    this.rounds = this.buildRounds();
    updateStatusBar(this.score, this.lives, 0, this.rounds.length);

    for (let i = 0; i < this.rounds.length; i++) {
      if (this.lives <= 0) break;
      await this.playRound(this.rounds[i], i, this.rounds.length);
    }

    await this.showResults(this.rounds.length);

    while (true) {
      const ans = await waitForInput();
      if (ans.toUpperCase().startsWith("Y")) {
        this.score = 0;
        this.lives = 3;
        await this.run();
        return;
      } else if (ans.toUpperCase().startsWith("N")) {
        clearOutput();
        spacer();
        print("Thanks for playing! See you next time! 👋", "cyan bold");
        print(`Keep being awesome, ${this.playerName}! 🌟`, "yellow");
        answerInput.disabled = true;
        submitBtn.disabled   = true;
        removeQuickActions();
        return;
      }
      print('Type YES to play again or NO to quit.', 'gray');
    }
  }
}

// ── Start ─────────────────────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  new PuzzleGame().run();
});
