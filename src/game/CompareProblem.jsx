import { useEffect, useRef, useState } from "react";
import HelperRow from "./HelperRow";

const CHOICES = [
    { sign: "<", label: "less" },
    { sign: "=", label: "equal" },
    { sign: ">", label: "greater" },
];

// keys that pick a sign on a physical keyboard (< and > share keys with , and .)
const KEY_TO_SIGN = { "<": "<", ",": "<", "=": "=", ">": ">", ".": ">" };

const SIGN_WORDS = { "<": "less than", "=": "equal to", ">": "greater than" };

// How long the right sign stays in the middle before the next question
const CONFIRM_MS = 1000;

/**
 * "47 [ ? ] 52": pick <, = or >.
 * `onSubmit(sign, attemptNo)` must return true when the answer was right.
 * A wrong choice is greyed out, and after two wrong tries the right one glows.
 */
export default function CompareProblem({ problem, onSubmit, showHelp, disabled = false }) {
    const [wrongPicks, setWrongPicks] = useState([]);
    const [showHint, setShowHint] = useState(false);
    const [confirmed, setConfirmed] = useState(null); // the right sign, shown before moving on
    const timer = useRef(null);

    useEffect(() => () => clearTimeout(timer.current), []);

    const revealed = wrongPicks.length >= 2;
    const lastWrong = wrongPicks[wrongPicks.length - 1];

    function choose(sign) {
        if (disabled || confirmed || wrongPicks.includes(sign)) return;
        const attempt = wrongPicks.length + 1;

        if (sign === problem.answer) {
            // Right: show the sign in the middle for a moment, then move on
            setConfirmed(sign);
            timer.current = setTimeout(() => {
                const accepted = onSubmit(sign, attempt);
                // blocked (e.g. the game was paused meanwhile): let them choose again
                if (!accepted) setConfirmed(null);
            }, CONFIRM_MS);
            return;
        }

        // Wrong: goes straight to the game (it costs a heart)
        const correct = onSubmit(sign, attempt);
        if (!correct) setWrongPicks((picks) => [...picks, sign]);
    }

    useEffect(() => {
        if (disabled) return;

        function onKey(e) {
            if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
            const sign = KEY_TO_SIGN[e.key];
            if (sign) choose(sign);
        }

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    });

    return (
        <div className="compare-problem">
            <div className="stage">
                <div className="compare-row">
                    <span className="compare-side">{problem.left.text}</span>
                    <span
                        className={`compare-slot${confirmed ? " correct" : lastWrong ? " wrong" : ""}`}
                    >
                        {confirmed ?? lastWrong ?? "?"}
                    </span>
                    <span className="compare-side">{problem.right.text}</span>
                </div>
            </div>

            <HelperRow
                speech={problem.speech}
                text={
                    confirmed
                        ? `Yes! ${problem.left.text} is ${SIGN_WORDS[confirmed]} ${problem.right.text}`
                        : showHint
                          ? problem.hint
                          : problem.prompt
                }
                hintAvailable={Boolean(showHelp && problem.hint)}
                showHint={showHint}
                onToggleHint={() => setShowHint((h) => !h)}
            />

            <div className="compare-choices" role="group" aria-label="Choose a sign">
                {CHOICES.map(({ sign, label }) => {
                    const isWrong = wrongPicks.includes(sign);
                    const glow = revealed && !confirmed && sign === problem.answer;
                    const right = confirmed === sign;
                    return (
                        <button
                            key={sign}
                            type="button"
                            className={`${isWrong ? "wrong" : ""} ${glow ? "glow" : ""} ${right ? "right" : ""}`.trim()}
                            disabled={disabled || isWrong || Boolean(confirmed)}
                            aria-label={`${label} than`.replace("equal than", "equal to")}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => choose(sign)}
                        >
                            {sign}
                            <small>{label}</small>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
