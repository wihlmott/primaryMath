/* =========================================================
   Math Engine
   ---------------------------------------------------------
   LEVEL PROGRESSION

   ADDITION
   L1: 1 digit + 1 digit = 1 digit answer
   L2: 1 digit + 1 digit = 2 digit answer
   L3: 2 digit + 2 digit, no carry
   L4: 2 digit + 2 digit, carry
   L5: 2/3 digit + 2/3 digit, carry optional

   SUBTRACTION
   L1: 1 digit - 1 digit, no borrow
   L2: 1 digit - 1 digit, no borrow
   L3: 2 digit - 2 digit, no borrow
   L4: 2 digit - 2 digit, borrow
   L5: 2/3 digit - 2/3 digit, borrow optional

   MULTIPLICATION
   L1: 1 digit × 1 digit = 1 digit answer
   L2: 1 digit × 1 digit = 2 digit answer
   L3: 2 digit × 1 digit = 2 digit answer, no carry
   L4: 2 digit × 1 digit = 2 digit answer, carry
   ========================================================= */

/* =========================================================
   Problem Generation
   ========================================================= */

export function generateProblem(level, operationMode) {
  const operation = chooseOperation(operationMode);

  let a;
  let b;

  /* ============================
       ADDITION
    ============================ */
  if (operation === "+") {
    switch (level) {
      case 1:
        do {
          a = randomBetween(1, 9);
          b = randomBetween(1, 9);
        } while (a + b > 9);
        break;

      case 2:
        do {
          a = randomBetween(1, 9);
          b = randomBetween(1, 9);
        } while (a + b < 10);
        break;

      case 3:
        do {
          a = randomBetween(10, 99);
          b = randomBetween(10, 99);
        } while (needsCarry(a, b, "+"));
        break;

      case 4:
        do {
          a = randomBetween(10, 99);
          b = randomBetween(10, 99);
        } while (!needsCarry(a, b, "+"));
        break;

      default:
        a = randomBetween(10, 999);
        b = randomBetween(10, 999);
    }
  } else if (operation === "-") {

  /* ============================
   SUBTRACTION
============================ */
    switch (level) {
      /* ----------------------
           Level 1
           1 digit - 1 digit
           No borrow
        ---------------------- */
      case 1:
        do {
          a = randomBetween(1, 9);
          b = randomBetween(1, 9);

          if (b > a) {
            [a, b] = [b, a];
          }
        } while (needsBorrow(a, b, "-"));
        break;

      /* ----------------------
           Level 2
           2 digit - 1 digit
           No borrow
        ---------------------- */
      case 2:
        do {
          a = randomBetween(10, 99);
          b = randomBetween(1, 9);
        } while (needsBorrow(a, b, "-"));
        break;

      /* ----------------------
           Level 3
           2 digit - 2 digit
           No borrow
        ---------------------- */
      case 3:
        do {
          a = randomBetween(10, 99);
          b = randomBetween(10, 99);

          if (b > a) {
            [a, b] = [b, a];
          }
        } while (needsBorrow(a, b, "-"));
        break;

      /* ----------------------
           Level 4
           2 digit - 2 digit
           Borrow required
        ---------------------- */
      case 4:
        do {
          a = randomBetween(10, 99);
          b = randomBetween(10, 99);

          if (b > a) {
            [a, b] = [b, a];
          }
        } while (!needsBorrow(a, b, "-"));
        break;

      /* ----------------------
           Level 5
           2/3 digit - 2/3 digit
           Borrow optional
        ---------------------- */
      default:
        a = randomBetween(10, 999);
        b = randomBetween(10, 999);

        if (b > a) {
          [a, b] = [b, a];
        }
    }
  } /* ============================
       MULTIPLICATION
    ============================ */ else if (operation === "×") {
    switch (level) {
      /* ----------------------
               Level 1
               1-digit answer
            ---------------------- */
      case 1:
        do {
          a = randomBetween(2, 9);
          b = randomBetween(2, 9);
        } while (a * b > 9);
        break;

      /* ----------------------
               Level 2
               2-digit answer
            ---------------------- */
      case 2:
        do {
          a = randomBetween(2, 9);
          b = randomBetween(2, 9);
        } while (a * b < 10 || a * b > 99);
        break;

      /* ----------------------
               Level 3
               No carry
               2-digit × 1-digit
               2-digit answer
            ---------------------- */
      case 3:
        do {
          a = randomBetween(10, 99);
          b = randomBetween(2, 9);
        } while (hasMultiplicationCarry(a, b) || !isTwoDigitAnswer(a, b));
        break;

      /* ----------------------
               Level 4
               Carry required
               2-digit × 1-digit
               2-digit answer
            ---------------------- */
      default:
        do {
          a = randomBetween(10, 99);
          b = randomBetween(2, 9);
        } while (!hasMultiplicationCarry(a, b) || !isTwoDigitAnswer(a, b));
    }
  }

  return {
    a,
    b,
    operation,
    answer: compute(a, b, operation),
  };
}

/* =========================================================
   Operation Selection
   ========================================================= */

function chooseOperation(mode) {
  switch (mode) {
    case "add":
      return "+";

    case "sub":
      return "-";

    case "mul":
      return "×";

    case "mixed":
      return randomFrom(["+", "-", "×"]);

    default:
      return "+";
  }
}

/* =========================================================
   Computation
   ========================================================= */

function compute(a, b, op) {
  switch (op) {
    case "+":
      return a + b;

    case "-":
      return a - b;

    case "×":
      return a * b;

    default:
      return 0;
  }
}

/* =========================================================
   Addition Carry Logic
   ========================================================= */

export function getCarryColumns(a, b) {
  const aDigits = String(a).split("").map(Number);
  const bDigits = String(b).split("").map(Number);

  let carries = [];
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

export function needsCarry(a, b, op) {
  if (op !== "+") return false;
  return getCarryColumns(a, b).length > 0;
}

/* =========================================================
   Subtraction Borrow Logic
   ========================================================= */

export function needsBorrow(a, b, op) {
  if (op !== "-") return false;

  const top = String(a)
    .padStart(Math.max(String(a).length, String(b).length), "0")
    .split("")
    .map(Number);

  const bottom = String(b)
    .padStart(Math.max(String(a).length, String(b).length), "0")
    .split("")
    .map(Number);

  let borrow = 0;

  for (let i = top.length - 1; i >= 0; i--) {
    const currentTop = top[i] - borrow;
    const currentBottom = bottom[i];

    if (currentTop < currentBottom) {
      return true;
    }

    borrow = 0;
  }

  return false;
}

/* =========================================================
   Multiplication Carry Logic
   ========================================================= */

export function hasMultiplicationCarry(a, b) {
  const multiplier = b;

  const digits = String(a).split("").map(Number);

  return digits.some((digit) => digit * multiplier >= 10);
}

function isTwoDigitAnswer(a, b) {
  const answer = a * b;
  return answer >= 10 && answer <= 99;
}

/* =========================================================
   Utilities
   ========================================================= */

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
