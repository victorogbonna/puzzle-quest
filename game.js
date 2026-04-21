const readline = require("readline");

// ── ANSI colours ──────────────────────────────────────────────────────────────
const C = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgGreen: "\x1b[42m",
};

const col = (color, text) => `${C[color]}${C.bright}${text}${C.reset}`;

// ── Puzzle bank ───────────────────────────────────────────────────────────────
const PUZZLES = {
  wordScramble: [
    { scrambled: "ZZAIP", answer: "PIZZA", hint: "Yummy round food with toppings 🍕" },
    { scrambled: "TACER", answer: "CATER", hint: "To provide food for people 🍽️" },
    { scrambled: "NOECY", answer: "MONEY", hint: "Used to buy things 💰" },
    { scrambled: "REBAT", answer: "BATER", hint: "Try 'BEAR' + T… wait, it's BEAR + T rearranged!" },
    { scrambled: "LCEARI", answer: "CEREAL", hint: "Breakfast food you pour milk on 🥣" },
    { scrambled: "PSLAE", answer: "LEAPS", hint: "Jumps or spring forward 🐸" },
    { scrambled: "TAINC", answer: "ANTIC", hint: "A silly or funny trick 🤪" },
    { scrambled: "RCEAK", answer: "CREAK", hint: "Sound a spooky door makes 👻" },
    { scrambled: "HOSPY", answer: "HYPOS", hint: "Short forms of hypotheses 🔬" },
    { scrambled: "LGUNE", answer: "LUNGE", hint: "A sudden forward movement ⚔️" },
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
      question: "I have cities, but no houses live there. I have mountains, but no trees grow there. I have water, but no fish swim there. What am I?",
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
      hint: "3 + 5 = 8, then 8 - 4 = ?",
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
      question: "There are 5 rows of seats with 6 seats each. 12 people leave. How many seats are now empty?",
      answer: "12",
      hint: "Total seats = 5×6 = 30. 30 - 12 people sitting? Wait — 12 people LEAVE, so 12 seats freed! 🪑",
    },
    {
      question: "If a train travels 60 km every hour, how far does it travel in 3 and a half hours?",
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
      question: "What number is missing? 2, 4, 8, 16, ___",
      answer: "32",
      hint: "Each number is doubled 🔢",
    },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function clearScreen() {
  process.stdout.write("\x1Bc");
}

function printBanner() {
  console.log(col("cyan",  "╔═══════════════════════════════════════════╗"));
  console.log(col("cyan",  "║") + col("yellow", "       🧩  PUZZLE QUEST ADVENTURE  🧩      ") + col("cyan", "║"));
  console.log(col("cyan",  "╚═══════════════════════════════════════════╝"));
  console.log();
}

function printStatus(score, lives, round, total) {
  const hearts = "❤️ ".repeat(lives) + "🖤 ".repeat(3 - lives);
  console.log(
    col("green", ` Score: ${score}`) +
    "  " +
    `Lives: ${hearts}` +
    "  " +
    col("blue", `Round: ${round}/${total}`)
  );
  console.log(col("cyan", "─".repeat(46)));
}

// ── Game class ────────────────────────────────────────────────────────────────
class PuzzleGame {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    this.score = 0;
    this.lives = 3;
    this.round = 0;
  }

  ask(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }

  async pause(msg = "Press ENTER to continue...") {
    await this.ask(col("magenta", `\n  ${msg} `));
  }

  async showIntro() {
    clearScreen();
    printBanner();
    console.log(col("yellow", "  Welcome, brave puzzle solver! 🌟"));
    console.log();
    console.log("  You'll face 3 types of challenges:");
    console.log(col("green",   "   🔤  Word Scramble") + " — unscramble the jumbled word");
    console.log(col("blue",    "   🤔  Riddles")       + " — think hard and solve the riddle");
    console.log(col("magenta", "   🔢  Math Puzzles")  + " — crunch the numbers");
    console.log();
    console.log("  Rules:");
    console.log("   • You have " + col("red", "3 lives ❤️"));
    console.log("   • Type " + col("yellow", "HINT") + " if you're stuck (costs 1 point)");
    console.log("   • Type " + col("red",    "SKIP") + " to skip a question (loses 1 life)");
    console.log();
    const name = await this.ask(col("cyan", "  What is your name, adventurer? "));
    this.playerName = name.trim() || "Explorer";
    console.log();
    console.log(col("green", `  Great! Let's go, ${this.playerName}! 🚀`));
    await sleep(1500);
  }

  async buildRounds() {
    const scrambles = shuffleArray(PUZZLES.wordScramble).slice(0, 4).map((p) => ({
      type: "wordScramble",
      ...p,
    }));
    const riddles = shuffleArray(PUZZLES.riddles).slice(0, 3).map((p) => ({
      type: "riddle",
      ...p,
    }));
    const maths = shuffleArray(PUZZLES.math).slice(0, 3).map((p) => ({
      type: "math",
      ...p,
    }));
    return shuffleArray([...scrambles, ...riddles, ...maths]);
  }

  async playWordScramble(puzzle) {
    console.log(col("green", "  🔤  WORD SCRAMBLE"));
    console.log();
    console.log("  Unscramble this word:");
    console.log(col("yellow", `  ➤  ${puzzle.scrambled}`));
    console.log();
  }

  async playRiddle(puzzle) {
    console.log(col("blue", "  🤔  RIDDLE"));
    console.log();
    const words = puzzle.question.match(/.{1,50}(\s|$)/g) || [puzzle.question];
    words.forEach((line) => console.log("  " + line.trim()));
    console.log();
  }

  async playMath(puzzle) {
    console.log(col("magenta", "  🔢  MATH PUZZLE"));
    console.log();
    const words = puzzle.question.match(/.{1,55}(\s|$)/g) || [puzzle.question];
    words.forEach((line) => console.log("  " + line.trim()));
    console.log();
  }

  async playRound(puzzle, index, total) {
    clearScreen();
    printBanner();
    printStatus(this.score, this.lives, index + 1, total);
    console.log();

    if (puzzle.type === "wordScramble") await this.playWordScramble(puzzle);
    else if (puzzle.type === "riddle") await this.playRiddle(puzzle);
    else await this.playMath(puzzle);

    let hintUsed = false;
    let answered = false;

    while (!answered) {
      const raw = await this.ask(col("cyan", "  Your answer: "));
      const input = raw.trim().toUpperCase();

      if (input === "HINT") {
        if (!hintUsed) {
          hintUsed = true;
          console.log(col("yellow", `  💡 Hint: ${puzzle.hint}`));
        } else {
          console.log(col("yellow", "  You already used your hint!"));
        }
        continue;
      }

      if (input === "SKIP") {
        this.lives--;
        console.log(col("red", "  ⏭️  Skipped! The answer was: ") + col("white", puzzle.answer.toUpperCase()));
        await sleep(2000);
        answered = true;
        break;
      }

      const correct = puzzle.answer.toUpperCase();
      if (input === correct) {
        const points = hintUsed ? 5 : 10;
        this.score += points;
        const msgs = [
          "🎉 Amazing!",
          "🌟 Brilliant!",
          "🔥 You're on fire!",
          "💪 Superstar!",
          "🏆 Genius!",
        ];
        const msg = msgs[Math.floor(Math.random() * msgs.length)];
        console.log(col("green", `  ${msg} +${points} points!`));
        await sleep(1800);
        answered = true;
      } else {
        console.log(col("red", "  ❌ Not quite! Try again. (Type HINT for help or SKIP to skip)"));
      }
    }
  }

  async showResults(total) {
    clearScreen();
    printBanner();
    console.log();

    const percent = Math.round((this.score / (total * 10)) * 100);

    let emoji, msg;
    if (percent >= 90)      { emoji = "🏆"; msg = "LEGENDARY PUZZLE MASTER!"; }
    else if (percent >= 70) { emoji = "🌟"; msg = "AMAZING ADVENTURER!"; }
    else if (percent >= 50) { emoji = "👍"; msg = "GREAT JOB, KEEP GOING!"; }
    else                    { emoji = "💪"; msg = "GOOD TRY — PRACTICE MAKES PERFECT!"; }

    console.log(col("yellow", `  ${emoji}  ${this.playerName}, you scored:`));
    console.log();
    console.log(col("cyan",   `       ${this.score} points out of ${total * 10}`));
    console.log();
    console.log(col("green",  `       ${msg}`));
    console.log();

    if (this.lives > 0) {
      console.log(col("green", `  Lives remaining: ${"❤️ ".repeat(this.lives)}`));
    } else {
      console.log(col("red", "  You ran out of lives, but you still did great!"));
    }

    console.log();
    console.log(col("cyan", "─".repeat(46)));
  }

  async run() {
    await this.showIntro();

    const rounds = await this.buildRounds();

    for (let i = 0; i < rounds.length; i++) {
      if (this.lives <= 0) break;
      await this.playRound(rounds[i], i, rounds.length);
    }

    await this.showResults(rounds.length);

    const again = await this.ask(col("yellow", "  Play again? (yes / no): "));
    if (again.trim().toLowerCase().startsWith("y")) {
      this.score = 0;
      this.lives = 3;
      this.round = 0;
      await this.run();
    } else {
      console.log();
      console.log(col("cyan", "  Thanks for playing! See you next time! 👋"));
      console.log();
      this.rl.close();
    }
  }
}

// ── Entry point ───────────────────────────────────────────────────────────────
new PuzzleGame().run().catch((err) => {
  console.error("Oops! Something went wrong:", err.message);
  process.exit(1);
});
