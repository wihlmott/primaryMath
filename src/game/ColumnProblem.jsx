import { useEffect, useState } from "react";
import { getCarryColumns } from "../utils/mathEngine";
import CarryBorrowHint from "./CarryBorrowHint";
import NumberPad from "./NumberPad";

const DIGITS = 3;
const LAST = DIGITS - 1; // rightmost (ones) column

/**
 * Right-align a number into digit columns
 */
function toDigits(num) {
    return String(num).padStart(DIGITS, " ").split("");
}

export default function ColumnProblem({ problem, onSubmit, showCarryBorrow }) {
    const [answer, setAnswer] = useState([]);
    // Start at the ones column, like real column math
    const [active, setActive] = useState(LAST);

    const top = toDigits(problem.a);
    const bottom = toDigits(problem.b);
    const result = toDigits(problem.answer);

    // Carry logic (multi-column, correct)
    const carryColumns =
        showCarryBorrow && problem.operation === "+"
            ? getCarryColumns(problem.a, problem.b)
            : [];

    /**
     * Convert carry index (1 = ones→tens, 2 = tens→hundreds)
     * into a column offset from the left of digit area
     */
    function carryToLeftOffset(carryIndex) {
        const digitIndexFromLeft = DIGITS - carryIndex;
        return digitIndexFromLeft;
    }

    /* ---------- Input handlers (number pad + physical keyboard) ---------- */

    function pressDigit(d) {
        setAnswer((prev) => {
            const next = [...prev];
            next[active] = d;
            return next;
        });
        // Move left to the next column (tens, then hundreds)
        setActive((a) => Math.max(0, a - 1));
    }

    function pressBackspace() {
        if (answer[active]) {
            // Current cell has a digit: clear it
            setAnswer((prev) => {
                const next = [...prev];
                next[active] = "";
                return next;
            });
        } else if (active < LAST) {
            // Current cell empty: step back right and clear that one
            const target = active + 1;
            setAnswer((prev) => {
                const next = [...prev];
                next[target] = "";
                return next;
            });
            setActive(target);
        }
    }

    function submit() {
        const joined = answer.join("");
        if (joined === "") return; // nothing entered yet
        onSubmit(Number(joined));
        setAnswer([]);
        setActive(LAST);
    }

    // Physical keyboard support on desktop
    useEffect(() => {
        function onKey(e) {
            if (/^\d$/.test(e.key)) {
                pressDigit(e.key);
            } else if (e.key === "Backspace") {
                pressBackspace();
            } else if (e.key === "Enter") {
                e.preventDefault(); // avoid double-firing a focused button
                submit();
            }
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    });

    return (
        <div className="column-math">
            <div className="math-grid">
                {/* Carry overlay layer */}
                {showCarryBorrow && (
                    <div className="carry-overlay">
                        {carryColumns.map((idx) => (
                            <CarryBorrowHint
                                key={`carry-${idx}`}
                                leftIndex={carryToLeftOffset(idx)}
                            />
                        ))}
                    </div>
                )}

                {/* Top number */}
                <div className="cell operator"></div>
                {top.map((d, i) => (
                    <div key={`top-${i}`} className="cell digit">
                        {d}
                    </div>
                ))}

                {/* Bottom number */}
                <div className="cell operator">{problem.operation}</div>
                {bottom.map((d, i) => (
                    <div key={`bottom-${i}`} className="cell digit">
                        {d}
                    </div>
                ))}

                {/* Divider */}
                <div className="divider" />

                {/* Answer row: read-only, driven by the number pad.
                    Tap a cell to select it. */}
                <div className="cell operator"></div>
                {result.map((_, i) => (
                    <input
                        key={`ans-${i}`}
                        className={`cell input${i === active ? " active" : ""}`}
                        value={answer[i] || ""}
                        readOnly
                        inputMode="none"
                        onClick={() => setActive(i)}
                    />
                ))}
            </div>

            <NumberPad
                onDigit={pressDigit}
                onBackspace={pressBackspace}
                onSubmit={submit}
            />
        </div>
    );
}
