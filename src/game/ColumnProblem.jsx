import { useState } from "react";
import { getCarryColumns } from "../utils/mathEngine";
import CarryBorrowHint from "./CarryBorrowHint";

const DIGITS = 3;

/**
 * Right-align a number into digit columns
 */
function toDigits(num) {
    return String(num).padStart(DIGITS, " ").split("");
}

export default function ColumnProblem({ problem, onSubmit, showCarryBorrow }) {
    const [answer, setAnswer] = useState([]);

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
        // DIGITS columns, right-aligned
        const digitIndexFromLeft = DIGITS - carryIndex;
        return digitIndexFromLeft;
    }

    function submit() {
        onSubmit(Number(answer.join("")));
        setAnswer([]);
    }

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

                {/* Answer row */}
                <div className="cell operator"></div>
                {result.map((_, i) => (
                    <input
                        key={`ans-${i}`}
                        className="cell input"
                        maxLength={1}
                        value={answer[i] || ""}
                        onChange={(e) => {
                            const next = [...answer];
                            next[i] = e.target.value.replace(/\D/, "");
                            setAnswer(next);
                        }}
                    />
                ))}
            </div>

            <button className="check-btn" onClick={submit}>
                Check
            </button>
        </div>
    );
}
