/* =========================================================
   Math Engine
   ---------------------------------------------------------
   Every game mode has its own LADDER: an ordered list of
   levels. Each level has a short `desc` (shown to grown-ups
   and on the adventure map) and a `make()` that builds one
   problem.

   Problem shapes (all have `kind`, `answer`, `key`):
     column    { a, b, operation: "+" | "-" | "×" }   answer: number
     equation  { tokens: [x, op, y, "=", z] }          answer: number
               (one token is null: the box to fill in)
     bond      { whole, parts: [p, q], missing }       answer: number
               (missing is 0, 1 or "whole")
     compare   { left, right: { text, value } }        answer: "<" | "=" | ">"
     skip      { values: [..] }                        answer: number
               (one value is null: the gap to fill in)
   Non-column problems also carry `prompt`, `speech` and `hint`.
   ========================================================= */

/* ---------------------------------------------------------
   Small helpers
   --------------------------------------------------------- */

const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const digitsOf = (n) => String(n).split("").map(Number);

/** Keep generating until `ok(value)` is true (bounded, so it can never hang). */
function retry(gen, ok, tries = 2000) {
  let value = gen();
  for (let i = 0; i < tries && !ok(value); i++) value = gen();
  return value;
}

/* =========================================================
   Column maths: carry / borrow logic
   ========================================================= */

/** Columns that receive a carry when adding (1 = ones->tens, 2 = tens->hundreds ...) */
export function getCarryColumns(a, b) {
  const aDigits = digitsOf(a);
  const bDigits = digitsOf(b);

  const carries = [];
  let carry = 0;
  const maxLen = Math.max(aDigits.length, bDigits.length);

  for (let i = 0; i < maxLen; i++) {
    const da = aDigits[aDigits.length - 1 - i] || 0;
    const db = bDigits[bDigits.length - 1 - i] || 0;
    const sum = da + db + carry;

    if (sum >= 10) {
      carries.push(i + 1);
      carry = 1;
    } else {
      carry = 0;
    }
  }

  return carries;
}

const carryCount = (a, b) => getCarryColumns(a, b).length;

export function needsCarry(a, b, op) {
  return op === "+" && carryCount(a, b) > 0;
}

/** How many columns have to borrow when computing a - b (a > b). */
export function borrowCount(a, b) {
  const top = digitsOf(a).reverse(); // ones first
  const bottom = digitsOf(b).reverse();
  let count = 0;
  let lent = 0; // 1 if the column to my right borrowed from me

  for (let i = 0; i < top.length; i++) {
    const needs = top[i] - lent < (bottom[i] || 0);
    if (needs) count += 1;
    lent = needs ? 1 : 0;
  }

  return count;
}

export function needsBorrow(a, b, op) {
  return op === "-" && borrowCount(a, b) > 0;
}

/** True if any digit x multiplier needs a carry (b is a single digit). */
export function hasMultiplicationCarry(a, b) {
  return digitsOf(a).some((digit) => digit * b >= 10);
}

/* =========================================================
   Hints for column problems
   ---------------------------------------------------------
   What a learner would write above the columns.
   `col` counts from the right: 0 = ones, 1 = tens, 2 = hundreds...
   kind "carry":  a number carried INTO column `col`
   kind "borrow": the new top digit to use in column `col`
                  after borrowing (e.g. 52 - 38: ones 2 -> 12, tens 5 -> 4)
   ========================================================= */

export function getHints(problem) {
  if (problem.kind && problem.kind !== "column") return [];
  const { a, b, operation } = problem;

  if (operation === "+") {
    return getCarryColumns(a, b).map((col) => ({ col, value: 1, kind: "carry" }));
  }
  if (operation === "×") return getMultiplicationCarries(a, b);
  if (operation === "-") return getBorrowHints(a, b);
  return [];
}

function getMultiplicationCarries(a, b) {
  const digits = digitsOf(a).reverse(); // ones first
  const hints = [];
  let carry = 0;

  digits.forEach((d, i) => {
    const product = d * b + carry;
    carry = Math.floor(product / 10);
    if (carry > 0) hints.push({ col: i + 1, value: carry, kind: "carry" });
  });

  return hints;
}

function getBorrowHints(a, b) {
  const top = digitsOf(a).reverse();
  const bottom = digitsOf(b).reverse();
  const hints = [];
  let borrowedFromMe = 0;

  for (let i = 0; i < top.length; i++) {
    const current = top[i] - borrowedFromMe;
    const needsBorrowHere = current < (bottom[i] || 0);
    const newTop = current + (needsBorrowHere ? 10 : 0);

    if (borrowedFromMe || needsBorrowHere) {
      hints.push({ col: i, value: newTop, kind: "borrow" });
    }
    borrowedFromMe = needsBorrowHere ? 1 : 0;
  }

  return hints;
}

/* =========================================================
   Problem builders
   ========================================================= */

const WORDS = { "+": "plus", "-": "minus", "−": "minus", "×": "times", "=": "equals" };
const say = (text) => String(text).replace(/[+−×=-]/g, (c) => ` ${WORDS[c]} `).replace(/\s+/g, " ").trim();

function column(a, b, operation) {
  const answer = operation === "+" ? a + b : operation === "-" ? a - b : a * b;
  return { kind: "column", a, b, operation, answer, key: `c:${a}${operation}${b}` };
}

/** A fact x op y = z with one of x / y hidden (blankAt 0 or 2). */
function equation(op, x, y, z, blankAt) {
  const tokens = [x, op, y, "=", z];
  const answer = tokens[blankAt];
  tokens[blankAt] = null;

  const known = blankAt === 0 ? y : x;
  let hint;
  if (op === "+") hint = `Think: ${z} − ${known} = ?`;
  else if (op === "-") hint = blankAt === 0 ? `Think: ${z} + ${y} = ?` : `Think: ${x} − ${z} = ?`;
  else hint = `How many ${known}s make ${z}? Try counting up in ${known}s.`;

  const spoken = tokens.map((t) => (t === null ? "what" : typeof t === "number" ? t : WORDS[t])).join(" ");

  return {
    kind: "equation",
    tokens,
    answer,
    key: `m:${x}${op}${y}=${z}@${blankAt}`,
    prompt: "Which number goes in the box?",
    speech: spoken,
    hint,
  };
}

/** A number bond: whole on top, two parts below. */
function bond(whole, p1, missing) {
  const p2 = whole - p1;
  const parts = [p1, p2];
  const answer = missing === "whole" ? whole : parts[missing];
  const known = missing === 0 ? p2 : p1;

  return {
    kind: "bond",
    whole,
    parts,
    missing,
    answer,
    key: `b:${whole}:${p1}:${missing}`,
    prompt: missing === "whole" ? "What do the two parts make?" : "Which part is missing?",
    speech:
      missing === "whole"
        ? `${p1} and ${p2} make what?`
        : `What goes with ${known} to make ${whole}?`,
    hint: missing === "whole" ? `Think: ${p1} + ${p2} = ?` : `Think: ${whole} − ${known} = ?`,
  };
}

const compareSign = (l, r) => (l < r ? "<" : l > r ? ">" : "=");

function compareProblem(left, right, hint) {
  return {
    kind: "compare",
    left,
    right,
    answer: compareSign(left.value, right.value),
    key: `k:${left.text}?${right.text}`,
    prompt: "Which sign goes in the middle?",
    speech: `Is ${say(left.text)} less than, greater than, or equal to ${say(right.text)}?`,
    hint,
  };
}

const num = (n) => ({ text: String(n), value: n });

/** A random small sum or difference with value between 1 and `max`. */
function expression(max) {
  if (Math.random() < 0.5 && max >= 3) {
    const x = rnd(1, max - 1);
    const y = rnd(1, max - x);
    return { text: `${x} + ${y}`, value: x + y };
  }
  const x = rnd(3, max + 4);
  const y = rnd(1, x - 1);
  return { text: `${x} − ${y}`, value: x - y };
}

/** A sum or difference whose value is exactly `v` (v >= 2). */
function expressionWith(v) {
  if (Math.random() < 0.5) {
    const x = rnd(1, v - 1);
    return { text: `${x} + ${v - x}`, value: v };
  }
  const y = rnd(1, 12);
  return { text: `${v + y} − ${y}`, value: v };
}

/** A counting sequence of 5 with one gap. */
function skip(start, step, dir, blankIdx) {
  const full = Array.from({ length: 5 }, (_, i) => start + dir * step * i);
  const values = full.map((v, i) => (i === blankIdx ? null : v));

  return {
    kind: "skip",
    values,
    step,
    dir,
    answer: full[blankIdx],
    key: `s:${start}:${step}:${dir}:${blankIdx}`,
    prompt: "Find the missing number",
    speech: `Count by ${step}s: ${values.map((v) => (v === null ? "what" : v)).join(", ")}`,
    hint: `Count ${dir > 0 ? "up" : "down"} by ${step}s. Each number is ${step} ${dir > 0 ? "more" : "less"} than the one before it.`,
  };
}

/* =========================================================
   Ladders
   ========================================================= */

/* ---------- Add ---------- */
const ADD = [
  { desc: "Add small numbers (answer up to 9)", make: () => { const a = rnd(1, 8); return column(a, rnd(1, 9 - a), "+"); } },
  { desc: "Add two single digits to make 10 or more", make: () => { const [a, b] = retry(() => [rnd(2, 9), rnd(2, 9)], ([a, b]) => a + b >= 10); return column(a, b, "+"); } },
  { desc: "2-digit + 1-digit, no carrying", make: () => { const [a, b] = retry(() => [rnd(10, 89), rnd(1, 9)], ([a, b]) => carryCount(a, b) === 0); return column(a, b, "+"); } },
  { desc: "2-digit + 2-digit, no carrying", make: () => { const [a, b] = retry(() => [rnd(10, 99), rnd(10, 99)], ([a, b]) => carryCount(a, b) === 0); return column(a, b, "+"); } },
  { desc: "2-digit + 1-digit, with carrying", make: () => { const [a, b] = retry(() => [rnd(10, 89), rnd(2, 9)], ([a, b]) => carryCount(a, b) >= 1); return column(a, b, "+"); } },
  { desc: "2-digit + 2-digit, with carrying", make: () => { const [a, b] = retry(() => [rnd(10, 99), rnd(10, 99)], ([a, b]) => carryCount(a, b) >= 1); return column(a, b, "+"); } },
  { desc: "3-digit + 2-digit", make: () => column(rnd(100, 899), rnd(10, 99), "+") },
  { desc: "3-digit + 3-digit, one carry", make: () => { const [a, b] = retry(() => [rnd(100, 899), rnd(100, 899)], ([a, b]) => carryCount(a, b) === 1 && a + b < 1000); return column(a, b, "+"); } },
  { desc: "3-digit + 3-digit, carrying twice", make: () => { const [a, b] = retry(() => [rnd(100, 899), rnd(100, 899)], ([a, b]) => carryCount(a, b) >= 2 && a + b < 1000); return column(a, b, "+"); } },
  { desc: "3-digit + 3-digit, answers can pass 1000", make: () => { const [a, b] = retry(() => [rnd(100, 999), rnd(100, 999)], ([a, b]) => carryCount(a, b) >= 2); return column(a, b, "+"); } },
];

/* ---------- Subtract ---------- */
const SUB = [
  { desc: "Take away within 9", make: () => { const a = rnd(2, 9); return column(a, rnd(1, a - 1), "-"); } },
  { desc: "2-digit − 1-digit, no borrowing", make: () => { const [a, b] = retry(() => [rnd(11, 99), rnd(1, 9)], ([a, b]) => a % 10 >= b); return column(a, b, "-"); } },
  { desc: "2-digit − 2-digit, no borrowing", make: () => { const [a, b] = retry(() => { const x = rnd(10, 99); const y = rnd(10, 99); return x > y ? [x, y] : [y, x]; }, ([a, b]) => a > b && borrowCount(a, b) === 0); return column(a, b, "-"); } },
  { desc: "Teen numbers − 1-digit, crossing ten (14 − 6)", make: () => { const [a, b] = retry(() => [rnd(11, 18), rnd(2, 9)], ([a, b]) => a % 10 < b); return column(a, b, "-"); } },
  { desc: "2-digit − 1-digit, with borrowing", make: () => { const [a, b] = retry(() => [rnd(20, 99), rnd(2, 9)], ([a, b]) => a % 10 < b); return column(a, b, "-"); } },
  { desc: "2-digit − 2-digit, with borrowing", make: () => { const [a, b] = retry(() => { const x = rnd(10, 99); const y = rnd(10, 99); return x > y ? [x, y] : [y, x]; }, ([a, b]) => a > b && borrowCount(a, b) >= 1); return column(a, b, "-"); } },
  { desc: "3-digit − 2-digit", make: () => column(rnd(100, 999), rnd(10, 99), "-") },
  { desc: "3-digit − 3-digit, one borrow", make: () => { const [a, b] = retry(() => { const x = rnd(100, 999); const y = rnd(100, 999); return x > y ? [x, y] : [y, x]; }, ([a, b]) => a > b && borrowCount(a, b) === 1); return column(a, b, "-"); } },
  { desc: "3-digit − 3-digit, borrowing twice", make: () => { const [a, b] = retry(() => { const x = rnd(100, 999); const y = rnd(100, 999); return x > y ? [x, y] : [y, x]; }, ([a, b]) => a > b && borrowCount(a, b) === 2); return column(a, b, "-"); } },
  { desc: "Borrowing across a zero (502 − 138)", make: () => { const [a, b] = retry(() => [rnd(1, 9) * 100 + rnd(0, 9), rnd(11, 999)], ([a, b]) => b < a && b % 10 > a % 10); return column(a, b, "-"); } },
];

/* ---------- Multiply: times tables first, then bigger numbers ---------- */

/** A table fact. The bottom number is always a single digit, so 10 goes on top. */
function tableProblem(tables) {
  const t = pick(tables);
  const f = rnd(2, 9);
  if (t === 10) return column(10, f, "×");
  return Math.random() < 0.5 ? column(t, f, "×") : column(f, t, "×");
}

const MUL = [
  { desc: "The 2 times table", make: () => tableProblem([2]) },
  { desc: "The 5 and 10 times tables", make: () => tableProblem([5, 10]) },
  { desc: "The 3 and 4 times tables", make: () => tableProblem([3, 4]) },
  { desc: "The 6 and 7 times tables", make: () => tableProblem([6, 7]) },
  { desc: "The 8 and 9 times tables", make: () => tableProblem([8, 9]) },
  { desc: "All the times tables mixed", make: () => column(rnd(2, 10), rnd(2, 9), "×") },
  { desc: "2-digit × 1-digit, no carrying", make: () => { const [a, b] = retry(() => [rnd(11, 49), rnd(2, 9)], ([a, b]) => !hasMultiplicationCarry(a, b)); return column(a, b, "×"); } },
  { desc: "2-digit × 1-digit, with carrying", make: () => { const [a, b] = retry(() => [rnd(12, 99), rnd(2, 9)], ([a, b]) => hasMultiplicationCarry(a, b)); return column(a, b, "×"); } },
];

/* ---------- Missing number ---------- */

const blank = () => pick([0, 2]); // hide the first or second number

function missingAdd(maxSum, minX = 1) {
  const x = rnd(minX, maxSum - 1);
  const y = rnd(1, maxSum - x);
  return equation("+", x, y, x + y, blank());
}

function missingSub(maxX) {
  const x = rnd(2, maxX);
  const y = rnd(1, x - 1);
  return equation("-", x, y, x - y, blank());
}

function missingWithin100(regroup) {
  if (Math.random() < 0.5) {
    const [x, y] = retry(() => [rnd(10, 89), rnd(10, 89)], ([x, y]) => x + y <= 99 && (regroup ? carryCount(x, y) >= 1 : carryCount(x, y) === 0));
    return equation("+", x, y, x + y, blank());
  }
  const [x, y] = retry(() => [rnd(20, 99), rnd(10, 98)], ([x, y]) => x > y && (regroup ? borrowCount(x, y) >= 1 : borrowCount(x, y) === 0));
  return equation("-", x, y, x - y, blank());
}

function missingTimes(tables, maxFactor = 9) {
  const t = pick(tables);
  const f = rnd(2, maxFactor);
  const [x, y] = Math.random() < 0.5 ? [t, f] : [f, t];
  return equation("×", x, y, x * y, blank());
}

const MISSING = [
  { desc: "Missing number in an addition, total up to 10", make: () => missingAdd(10) },
  { desc: "Missing number in a subtraction, up to 10", make: () => missingSub(10) },
  { desc: "Missing number in an addition, total up to 20", make: () => missingAdd(20) },
  { desc: "Missing number in a subtraction, up to 20", make: () => missingSub(20) },
  { desc: "Missing number within 100, no regrouping", make: () => missingWithin100(false) },
  { desc: "Missing number within 100, with regrouping", make: () => missingWithin100(true) },
  { desc: "Missing number in a times fact (2, 3, 4, 5, 10)", make: () => missingTimes([2, 3, 4, 5, 10]) },
  { desc: "Missing number: times tables and 2-digit sums", make: () => (Math.random() < 0.5 ? missingTimes([2, 3, 4, 5, 6, 7, 8, 9]) : missingWithin100(true)) },
];

/* ---------- Number bonds ---------- */

const partOrWhole = (wholeChance) => (Math.random() < wholeChance ? "whole" : pick([0, 1]));

const BONDS = [
  { desc: "Number bonds to 5", make: () => bond(5, rnd(1, 4), pick([0, 1])) },
  { desc: "Number bonds to 10", make: () => bond(10, rnd(1, 9), pick([0, 1])) },
  { desc: "Number bonds to 10, find a part or the whole", make: () => bond(10, rnd(1, 9), partOrWhole(0.3)) },
  { desc: "Number bonds to 20", make: () => bond(20, rnd(1, 19), pick([0, 1])) },
  { desc: "Number bonds to 10 and 20 mixed", make: () => { const w = pick([10, 20]); return bond(w, rnd(1, w - 1), partOrWhole(0.25)); } },
  { desc: "Number bonds to 100, in tens", make: () => bond(100, rnd(1, 9) * 10, partOrWhole(0.2)) },
  { desc: "Number bonds to 100, in fives", make: () => bond(100, rnd(1, 19) * 5, partOrWhole(0.2)) },
  { desc: "Number bonds to 100, any number", make: () => bond(100, rnd(1, 99), partOrWhole(0.2)) },
];

/* ---------- Compare ---------- */

const COMPARE = [
  {
    desc: "Compare single-digit numbers",
    make: () => { const [a, b] = retry(() => [rnd(1, 9), rnd(1, 9)], ([a, b]) => a !== b); return compareProblem(num(a), num(b), "Which number comes later when you count up?"); },
  },
  {
    desc: "Compare 2-digit numbers (different tens)",
    make: () => { const [a, b] = retry(() => [rnd(10, 99), rnd(10, 99)], ([a, b]) => Math.floor(a / 10) !== Math.floor(b / 10)); return compareProblem(num(a), num(b), "Look at the tens first. The bigger tens digit wins."); },
  },
  {
    desc: "Compare 2-digit numbers (same tens, or equal)",
    make: () => {
      const tens = rnd(1, 9) * 10;
      const a = tens + rnd(0, 9);
      const b = Math.random() < 0.2 ? a : retry(() => tens + rnd(0, 9), (v) => v !== a);
      return compareProblem(num(a), num(b), "The tens are the same, so look at the ones.");
    },
  },
  {
    desc: "Compare 3-digit numbers",
    make: () => {
      const a = rnd(100, 999);
      const r = Math.random();
      const b = r < 0.2 ? a : r < 0.5 ? Math.floor(a / 100) * 100 + rnd(0, 99) : rnd(100, 999);
      return compareProblem(num(a), num(b), "Start with the hundreds. If they match, check the tens.");
    },
  },
  {
    desc: "Compare a sum or difference with a number",
    make: () => {
      const e = expression(15);
      const n = Math.random() < 0.2 ? e.value : rnd(Math.max(1, e.value - 4), e.value + 4);
      const flip = Math.random() < 0.5;
      const left = flip ? num(n) : e;
      const right = flip ? e : num(n);
      return compareProblem(left, right, `Work out the sum first: ${e.text} = ${e.value}.`);
    },
  },
  {
    desc: "Compare two sums or differences",
    make: () => {
      const left = expression(20);
      const right = Math.random() < 0.25 && left.value >= 2
        ? retry(() => expressionWith(left.value), (e) => e.text !== left.text)
        : expression(20);
      return compareProblem(left, right, `Work out each side first: ${left.text} = ${left.value} and ${right.text} = ${right.value}.`);
    },
  },
];

/* ---------- Skip counting ---------- */

const gap = () => rnd(1, 3); // gap in the middle of the row

const SKIP = [
  { desc: "Count in 2s", make: () => skip(pick([0, 2, 4, 6, 8, 10]), 2, 1, gap()) },
  { desc: "Count in 10s", make: () => skip(rnd(0, 5) * 10, 10, 1, gap()) },
  { desc: "Count in 5s", make: () => skip(rnd(0, 6) * 5, 5, 1, gap()) },
  { desc: "Count in 2s, 5s and 10s from any start", make: () => { const s = pick([2, 5, 10]); return skip(s * rnd(0, 5), s, 1, gap()); } },
  { desc: "Count in 3s and 4s", make: () => { const s = pick([3, 4]); return skip(s * rnd(0, 4), s, 1, gap()); } },
  { desc: "Count backwards in 2s, 5s and 10s", make: () => { const s = pick([2, 5, 10]); return skip(s * rnd(5, 10), s, -1, gap()); } },
  { desc: "Count in 3s and 4s, forwards or backwards", make: () => { const s = pick([3, 4]); return Math.random() < 0.5 ? skip(rnd(1, 20), s, 1, rnd(0, 4)) : skip(rnd(20, 40), s, -1, rnd(0, 4)); } },
  { desc: "Count in 6s, 7s, 8s, 9s, 25s, 50s and 100s", make: () => { const s = pick([6, 7, 8, 9, 25, 50, 100]); return skip(s * rnd(0, 3), s, 1, rnd(0, 4)); } },
];

/* =========================================================
   Public API
   ========================================================= */

export const LADDERS = {
  add: ADD,
  sub: SUB,
  mul: MUL,
  missing: MISSING,
  bonds: BONDS,
  compare: COMPARE,
  skip: SKIP,
};

const MIXED_FROM = ["add", "sub", "mul"];

/** How many levels a mode has. "Mix" goes as far as its longest ladder. */
export function ladderLength(mode) {
  if (mode === "mixed") return Math.max(...MIXED_FROM.map((m) => LADDERS[m].length));
  return (LADDERS[mode] ?? LADDERS.add).length;
}

/** A short description of what a level practises. */
export function describeLevel(mode, level) {
  if (mode === "mixed") return "Add, subtract and multiply, each at this level";
  const ladder = LADDERS[mode] ?? LADDERS.add;
  return ladder[Math.min(Math.max(1, level), ladder.length) - 1].desc;
}

/**
 * One problem for `level` of `mode`. In "mixed" mode each question draws from
 * a random one of add / subtract / multiply, at that ladder's own `level`
 * (or its last level, if that ladder is shorter).
 */
export function generateProblem(level, mode) {
  const m = mode === "mixed" ? pick(MIXED_FROM) : mode;
  const ladder = LADDERS[m] ?? LADDERS.add;
  const index = Math.min(Math.max(1, level), ladder.length) - 1;
  return ladder[index].make();
}
