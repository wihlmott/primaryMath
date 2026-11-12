import { useEffect, useRef, useState } from "react";
import HelperRow from "./HelperRow";

// How long the finished bond stays on screen before the next question
const CONFIRM_MS = 900;

/**
 * Number bond, "pick the pair" style: the whole is on top and the learner taps
 * two number tiles that add up to it. Tapping a filled circle puts its tile back.
 * Any two tiles that make the whole are accepted.
 *
 * `onSubmit(answer, attemptNo)` must return true when the answer was right.
 * We send the problem's own `answer` when the pair is right and "wrong" otherwise.
 * After two wrong tries the right tiles glow.
 */
export default function BondPickProblem({ problem, onSubmit, onIncomplete, showHelp, disabled = false }) {
    const { whole, tiles, parts } = problem;
    const [slots, setSlots] = useState([null, null]); // tile indexes in the two circles
    const [wrongTries, setWrongTries] = useState(0);
    const [shake, setShake] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const timer = useRef(null);

    useEffect(() => () => clearTimeout(timer.current), []);

    const locked = disabled || confirmed;
    const revealed = wrongTries >= 2;

    function pick(index) {
        if (locked || slots.includes(index)) return;
        const free = slots.indexOf(null);
        if (free === -1) return;
        setShake(false);
        setSlots((s) => s.map((v, k) => (k === free ? index : v)));
    }

    function putBack(slot) {
        if (locked) return;
        setShake(false);
        setSlots((s) => s.map((v, k) => (k === slot ? null : v)));
    }

    function check() {
        if (locked) return;
        const [a, b] = slots;
        if (a === null || b === null) {
            onIncomplete?.();
            return;
        }
        const attempt = wrongTries + 1;

        if (tiles[a] + tiles[b] === whole) {
            // Right: let the finished bond show for a moment, then move on
            setConfirmed(true);
            timer.current = setTimeout(() => {
                const accepted = onSubmit(problem.answer, attempt);
                if (!accepted) setConfirmed(false);
            }, CONFIRM_MS);
            return;
        }

        onSubmit("wrong", attempt); // costs a heart
        setWrongTries((t) => t + 1);
        setShake(true);
        setSlots([null, null]);
    }

    // Enter checks, like the number pad's tick (but not when it is pressed on another button)
    useEffect(() => {
        if (locked) return undefined;
        function onKey(e) {
            if (e.key !== "Enter" || e.repeat) return;
            if (e.target?.closest?.("button")) return;
            e.preventDefault();
            check();
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    });

    const slotValue = (k) => (slots[k] === null ? null : tiles[slots[k]]);
    // after two wrong tries, glow one tile of each intended part
    const glowIndexes = new Set();
    if (revealed) {
        parts.forEach((value) => {
            const i = tiles.findIndex((t, idx) => t === value && !glowIndexes.has(idx));
            if (i !== -1) glowIndexes.add(i);
        });
    }

    return (
        <div className="bond-pick">
            <div className="stage">
                <div className="bond">
                    <svg className="bond-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                        <line x1="50" y1="22" x2="25" y2="78" vectorEffect="non-scaling-stroke" />
                        <line x1="50" y1="22" x2="75" y2="78" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <div className="bond-whole">
                        <div className="bond-circle">{whole}</div>
                    </div>
                    <div className="bond-parts">
                        {[0, 1].map((k) => {
                            const v = slotValue(k);
                            return (
                                <button
                                    key={k}
                                    type="button"
                                    className={`bond-circle slot${v === null ? " blank" : ""}${shake ? " wrong" : ""}${confirmed ? " correct" : ""}`}
                                    aria-label={v === null ? `Empty circle ${k + 1}` : `${v}. Tap to put it back`}
                                    disabled={locked || v === null}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => putBack(k)}
                                >
                                    {v ?? ""}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div
                className="pick-tiles"
                role="group"
                aria-label="Numbers to pick from"
                style={{ gridTemplateColumns: `repeat(${tiles.length === 4 ? 4 : 3}, auto)` }}
            >
                {tiles.map((value, i) => (
                    <button
                        key={i}
                        type="button"
                        className={`pick-tile${slots.includes(i) ? " used" : ""}${glowIndexes.has(i) ? " glow" : ""}`}
                        disabled={locked || slots.includes(i)}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => pick(i)}
                    >
                        {value}
                    </button>
                ))}
            </div>

            <HelperRow
                speech={problem.speech}
                text={
                    confirmed
                        ? `Yes! ${tiles[slots[0]]} + ${tiles[slots[1]]} = ${whole}`
                        : showHint
                          ? problem.hint
                          : shake
                            ? "Not quite. Try again!"
                            : problem.prompt
                }
                hintAvailable={Boolean(showHelp && problem.hint)}
                showHint={showHint}
                onToggleHint={() => setShowHint((h) => !h)}
            />

            <button
                type="button"
                className="check-big"
                disabled={locked}
                onMouseDown={(e) => e.preventDefault()}
                onClick={check}
            >
                Check ✓
            </button>
        </div>
    );
}
