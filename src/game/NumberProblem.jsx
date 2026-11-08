import { useState } from "react";
import AnswerBox from "./AnswerBox";
import HelperRow from "./HelperRow";
import NumberPad from "./NumberPad";
import useNumericAnswer from "./useNumericAnswer";

const show = (token) => (token === "-" ? "−" : token);

/* ---------- Missing number: 7 + [ ? ] = 15 ---------- */
function EquationStage({ tokens, box }) {
    return (
        <div className="equation">
            {tokens.map((t, i) =>
                t === null ? (
                    <span key={i}>{box}</span>
                ) : (
                    <span key={i} className={typeof t === "number" ? "eq-num" : "eq-op"}>
                        {show(t)}
                    </span>
                ),
            )}
        </div>
    );
}

/* ---------- Number bond: whole on top, two parts below ---------- */
function BondStage({ problem, box }) {
    const { whole, parts, missing } = problem;
    const circle = (value, isBlank) => (
        <div className={`bond-circle${isBlank ? " blank" : ""}`}>{isBlank ? box : value}</div>
    );

    return (
        <div className="bond">
            <svg className="bond-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <line x1="50" y1="22" x2="25" y2="78" vectorEffect="non-scaling-stroke" />
                <line x1="50" y1="22" x2="75" y2="78" vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="bond-whole">{circle(whole, missing === "whole")}</div>
            <div className="bond-parts">
                {circle(parts[0], missing === 0)}
                {circle(parts[1], missing === 1)}
            </div>
        </div>
    );
}

/** Hint picture for small bonds: dots for the parts. */
function BondDots({ problem }) {
    const { whole, parts, missing } = problem;
    if (whole > 20) return null;

    let dots;
    if (missing === "whole") {
        dots = [
            ...Array.from({ length: parts[0] }, () => "a"),
            ...Array.from({ length: parts[1] }, () => "b"),
        ];
    } else {
        const known = missing === 0 ? parts[1] : parts[0];
        dots = Array.from({ length: whole }, (_, i) => (i < known ? "a" : "empty"));
    }

    return (
        <div className="dots" aria-hidden="true">
            {dots.map((kind, i) => (
                <span key={i} className={`dot ${kind}`} />
            ))}
        </div>
    );
}

/* ---------- Skip counting: 5, 10, [ ? ], 20, 25 ---------- */
function SkipStage({ values, box }) {
    return (
        <div className="skip-row">
            {values.map((v, i) =>
                v === null ? (
                    <span key={i}>{box}</span>
                ) : (
                    <span key={i} className="skip-cell">
                        {v}
                    </span>
                ),
            )}
        </div>
    );
}

/**
 * Missing number, number bonds and skip counting all type one number into a
 * box, so they share this component (only the picture differs).
 * `onSubmit(value, attemptNo)` must return true when the answer was right.
 */
export default function NumberProblem({
    problem,
    onSubmit,
    onIncomplete,
    showHelp,
    disabled = false,
}) {
    const [showHint, setShowHint] = useState(false);
    const answer = useNumericAnswer({ onSubmit, onIncomplete, disabled });

    const box = (
        <AnswerBox
            typed={answer.typed}
            wrong={answer.wrong}
            revealed={answer.revealed}
            expected={problem.answer}
        />
    );

    let stage = null;
    if (problem.kind === "equation") stage = <EquationStage tokens={problem.tokens} box={box} />;
    if (problem.kind === "bond") stage = <BondStage problem={problem} box={box} />;
    if (problem.kind === "skip") stage = <SkipStage values={problem.values} box={box} />;

    const hasDots = problem.kind === "bond" && problem.whole <= 20;

    return (
        <div className="number-problem">
            <div className="stage">{stage}</div>

            {/* reserved space, so showing the dots never moves the number pad */}
            {hasDots && (
                <div className={`dots-slot${problem.whole > 10 ? " tall" : ""}`}>
                    {showHint && <BondDots problem={problem} />}
                </div>
            )}

            <HelperRow
                speech={problem.speech}
                text={
                    showHint
                        ? problem.hint
                        : answer.wrong
                          ? "Not quite. Try again!"
                          : problem.prompt
                }
                hintAvailable={Boolean(showHelp && problem.hint)}
                showHint={showHint}
                onToggleHint={() => setShowHint((h) => !h)}
            />

            <NumberPad
                disabled={disabled}
                onDigit={answer.pressDigit}
                onBackspace={answer.pressBackspace}
                onSubmit={answer.submit}
            />
        </div>
    );
}
