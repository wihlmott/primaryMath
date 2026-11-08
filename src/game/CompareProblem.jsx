import { useEffect, useState } from "react";
import HelperRow from "./HelperRow";

const CHOICES = [
    { sign: "<", label: "less" },
    { sign: "=", label: "equal" },
    { sign: ">", label: "greater" },
];

// keys that pick a sign on a physical keyboard (< and > share keys with , and .)
const KEY_TO_SIGN = { "<": "<", ",": "<", "=": "=", ">": ">", ".": ">" };

/**
 * "47 [ ? ] 52": pick <, = or >.
 * `onSubmit(sign, attemptNo)` must return true when the answer was right.
 * A wrong choice is greyed out, and after two wrong tries the right one glows.
 */
export default function CompareProblem({ problem, onSubmit, showHelp, disabled = false }) {
    const [wrongPicks, setWrongPicks] = useState([]);
    const [showHint, setShowHint] = useState(false);

    const revealed = wrongPicks.length >= 2;
    const lastWrong = wrongPicks[wrongPicks.length - 1];

    function choose(sign) {
        if (disabled || wrongPicks.includes(sign)) return;
        const correct = onSubmit(sign, wrongPicks.length + 1);
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
                    <span className={`compare-slot${lastWrong ? " wrong" : ""}`}>
                        {lastWrong ?? "?"}
                    </span>
                    <span className="compare-side">{problem.right.text}</span>
                </div>
            </div>

            <HelperRow
                speech={problem.speech}
                text={showHint ? problem.hint : problem.prompt}
                hintAvailable={Boolean(showHelp && problem.hint)}
                showHint={showHint}
                onToggleHint={() => setShowHint((h) => !h)}
            />

            <div className="compare-choices" role="group" aria-label="Choose a sign">
                {CHOICES.map(({ sign, label }) => {
                    const isWrong = wrongPicks.includes(sign);
                    const glow = revealed && sign === problem.answer;
                    return (
                        <button
                            key={sign}
                            type="button"
                            className={`${isWrong ? "wrong" : ""} ${glow ? "glow" : ""}`.trim()}
                            disabled={disabled || isWrong}
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
