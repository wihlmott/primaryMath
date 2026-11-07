import { useEffect, useState } from "react";
import { getHints } from "../utils/mathEngine";
import { canSpeak, speakProblem, stopSpeaking } from "../utils/speech";
import CarryBorrowHint from "./CarryBorrowHint";
import NumberPad from "./NumberPad";
import ProblemPicture from "./ProblemPicture";

const MIN_DIGITS = 3;

// Indexed from the right: 0 = ones, 1 = tens, ...
const PLACE_LABELS = ["O", "T", "H", "Th"];
const PLACE_NAMES = ["ones", "tens", "hundreds", "thousands"];

/**
 * Right-align a number into `digits` columns
 */
function toDigits(num, digits) {
    return String(num).padStart(digits, " ").split("");
}

/**
 * One column-math problem.
 *
 * `onSubmit(value, attemptNo)` must return true when the answer was right.
 * `showHelp` turns on the hint button and the pictures for small problems.
 * Game gives this component a new `key` for every problem, so all state here
 * (typed digits, wrong-try feedback, hint) starts fresh for each one.
 */
export default function ColumnProblem({
    problem,
    onSubmit,
    showHelp,
    onIncomplete,
    disabled = false,
}) {
    const [answer, setAnswer] = useState([]);
    // Position counted from the ones column (0 = ones, 1 = tens, ...)
    const [pos, setPos] = useState(0);
    const [showHint, setShowHint] = useState(false);

    // Feedback after a wrong try (cell indices, counted from the left)
    const [locked, setLocked] = useState([]); // digits that were right: kept, not editable
    const [flagged, setFlagged] = useState([]); // digits that were wrong: cleared + shaken
    const [tries, setTries] = useState(0); // wrong tries so far on this problem

    // Column count follows the problem, so 4-digit sums (e.g. 999 + 999) fit
    const digits = Math.max(
        MIN_DIGITS,
        String(problem.a).length,
        String(problem.b).length,
        String(problem.answer).length,
    );
    const active = digits - 1 - pos; // index from the left

    const answerStr = String(problem.answer);
    const expected = answerStr.padStart(digits, "0");
    const padCount = digits - answerStr.length; // leading cells the answer doesn't use
    const revealed = tries >= 2; // after the 2nd wrong try, show the right digits

    const top = toDigits(problem.a, digits);
    const bottom = toDigits(problem.b, digits);
    const operator = problem.operation === "-" ? "−" : problem.operation;

    /* ---------- Hints ---------- */

    const hints = getHints(problem);
    const verb = problem.operation === "-" ? "borrow" : "carry";
    const hintText =
        hints.length === 0
            ? `Nothing to ${verb} here. Just go column by column!`
            : problem.operation === "-"
              ? "Borrowing! The purple numbers are the new top digits."
              : "The blue circles show what to carry to the next column.";

    /* ---------- Prompt line (which column to type next) ---------- */

    const placeName = PLACE_NAMES[pos];
    let promptText;
    if (flagged.includes(active)) {
        promptText = `Try the ${placeName} again`;
    } else if (pos === 0 && tries === 0 && !answer.some(Boolean)) {
        promptText = "Start with the ones!";
    } else {
        promptText = `Now the ${placeName}`;
    }

    // Stop any read-aloud when the problem changes or the screen closes
    useEffect(() => () => stopSpeaking(), []);

    /* ---------- Cursor movement (skips locked cells) ---------- */

    function nextPosLeft(from) {
        for (let p = from + 1; p < digits; p++) {
            if (!locked.includes(digits - 1 - p)) return p;
        }
        return from;
    }

    function prevPosRight(from) {
        for (let p = from - 1; p >= 0; p--) {
            if (!locked.includes(digits - 1 - p)) return p;
        }
        return from;
    }

    /* ---------- Input handlers (number pad + physical keyboard) ---------- */

    function setCell(index, value) {
        setAnswer((prev) => {
            const next = [...prev];
            next[index] = value;
            return next;
        });
        setFlagged((f) => f.filter((i) => i !== index));
    }

    function pressDigit(d) {
        if (disabled || locked.includes(active)) return;
        setCell(active, d);
        setPos((p) => nextPosLeft(p));
    }

    function pressBackspace() {
        if (disabled) return;
        if (answer[active]) {
            // Current cell has a digit: clear it
            setCell(active, "");
        } else {
            // Current cell empty: step back right and clear that one
            const target = prevPosRight(pos);
            if (target !== pos) {
                setCell(digits - 1 - target, "");
                setPos(target);
            }
        }
    }

    function submit() {
        if (disabled) return;

        // Leftmost digit the learner typed
        const first = answer.findIndex((c) => c);

        // Every cell from that digit through the ones column must be filled.
        // Otherwise "5 _" would silently be submitted as 5 instead of 50.
        let complete = first !== -1;
        for (let i = first; complete && i < digits; i++) {
            if (!answer[i]) complete = false;
        }
        if (!complete) {
            onIncomplete?.();
            return;
        }

        const value = Number(answer.slice(first).join(""));
        const correct = onSubmit(value, tries + 1);
        if (correct) return; // Game swaps in a new problem (new key)

        // Wrong: keep the right digits, clear + flag the wrong ones
        const wrong = [];
        const right = [];
        for (let i = 0; i < digits; i++) {
            const typed = answer[i] || "";
            if (i < padCount) {
                // Unused leading cell: blank or 0 is fine, anything else is wrong
                if (typed !== "" && typed !== "0") wrong.push(i);
            } else if (typed === expected[i]) {
                right.push(i);
            } else {
                wrong.push(i);
            }
        }
        if (wrong.length === 0) return;

        const next = [...answer];
        wrong.forEach((i) => {
            next[i] = "";
        });
        setAnswer(next);
        setLocked(right);
        setFlagged(wrong);
        setTries((t) => t + 1);
        // Jump to the rightmost cell that needs fixing
        setPos(digits - 1 - Math.max(...wrong));
    }

    // Physical keyboard support on desktop (off while input is disabled)
    useEffect(() => {
        if (disabled) return;

        function onKey(e) {
            // Leave browser/OS shortcuts alone (Ctrl+1, Cmd+R, ...)
            if (e.ctrlKey || e.metaKey || e.altKey) return;

            if (/^\d$/.test(e.key)) {
                if (e.repeat) return; // holding a key shouldn't fill cells
                pressDigit(e.key);
            } else if (e.key === "Backspace") {
                pressBackspace();
            } else if (e.key === "Enter") {
                // Don't hijack Enter on unrelated buttons (e.g. Back)
                const btn = e.target?.closest?.("button");
                if (btn && !btn.closest(".numpad")) return;

                e.preventDefault(); // stops a focused button firing its own click
                if (e.repeat) return; // holding Enter must not spam submits
                submit();
            }
        }

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    });

    // Mouse/touch presses on the helper buttons shouldn't leave them focused
    // (a focused button would swallow the Enter key meant for "check").
    const keepFocus = (e) => e.preventDefault();

    return (
        <div className="column-math">
            {showHelp && <ProblemPicture problem={problem} />}

            <div className="math-grid" style={{ "--digits": digits }}>
                {/* Place-value labels (O = ones, T = tens, H = hundreds) */}
                <div className="cell place" />
                {Array.from({ length: digits }, (_, i) => {
                    const place = digits - 1 - i;
                    return (
                        <div
                            key={`place-${i}`}
                            className={`cell place${i === active ? " active" : ""}`}
                            title={PLACE_NAMES[place]}
                            aria-hidden="true"
                        >
                            {PLACE_LABELS[place]}
                        </div>
                    );
                })}

                {/* Reserved row the hint bubbles float into */}
                <div className="hint-spacer" />

                {showHint && (
                    <div className="carry-overlay">
                        {hints.map((h) => (
                            <CarryBorrowHint
                                key={`${h.kind}-${h.col}`}
                                leftIndex={digits - 1 - h.col}
                                value={h.value}
                                kind={h.kind}
                            />
                        ))}
                    </div>
                )}

                {/* Top number */}
                <div className="cell operator"></div>
                {top.map((d, i) => (
                    <div
                        key={`top-${i}`}
                        className={`cell digit${i === active ? " col-active" : ""}`}
                    >
                        {d}
                    </div>
                ))}

                {/* Bottom number */}
                <div className="cell operator">{operator}</div>
                {bottom.map((d, i) => (
                    <div
                        key={`bottom-${i}`}
                        className={`cell digit${i === active ? " col-active" : ""}`}
                    >
                        {d}
                    </div>
                ))}

                {/* Divider */}
                <div className="divider" />

                {/* Answer row: read-only, driven by the number pad.
                    Tap a cell to select it. */}
                <div className="cell operator"></div>
                {Array.from({ length: digits }, (_, i) => {
                    const isLocked = locked.includes(i);
                    const isFlagged = flagged.includes(i);
                    const className = [
                        "cell",
                        "input",
                        i === active && "active",
                        isLocked && "locked",
                        isFlagged && "wrong",
                        revealed && "revealed",
                    ]
                        .filter(Boolean)
                        .join(" ");

                    return (
                        <input
                            key={`ans-${i}`}
                            className={className}
                            value={answer[i] || ""}
                            placeholder={
                                revealed && !isLocked && i >= padCount
                                    ? expected[i]
                                    : ""
                            }
                            aria-label={`Answer, ${PLACE_NAMES[digits - 1 - i]} digit`}
                            readOnly
                            inputMode="none"
                            onClick={() =>
                                !disabled &&
                                !isLocked &&
                                setPos(digits - 1 - i)
                            }
                        />
                    );
                })}
            </div>

            {/* Prompt line with read-aloud (left) and hint (right) buttons.
                While the hint is on, the line explains it instead. */}
            <div className="helper-row">
                {canSpeak ? (
                    <button
                        type="button"
                        className="helper-btn"
                        aria-label="Read the problem aloud"
                        onMouseDown={keepFocus}
                        onClick={() => speakProblem(problem)}
                    >
                        🔊
                    </button>
                ) : (
                    <span className="helper-spacer" />
                )}

                <div className="column-prompt" aria-live="polite">
                    {showHint ? hintText : promptText}
                </div>

                {showHelp ? (
                    <button
                        type="button"
                        className="helper-btn"
                        aria-label={showHint ? "Hide hint" : "Show hint"}
                        aria-pressed={showHint}
                        onMouseDown={keepFocus}
                        onClick={() => setShowHint((h) => !h)}
                    >
                        💡
                    </button>
                ) : (
                    <span className="helper-spacer" />
                )}
            </div>

            <NumberPad
                disabled={disabled}
                onDigit={pressDigit}
                onBackspace={pressBackspace}
                onSubmit={submit}
            />
        </div>
    );
}
