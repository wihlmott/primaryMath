import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";

import GameHeader from "./GameHeader";
import ColumnProblem from "./ColumnProblem";
import RoundResultModal from "./RoundResultModal";
import ConfirmLeaveModal from "./ConfirmLeaveModal";
import LevelUpBanner from "./LevelUpBanner";
import ScoreToast from "./ScoreToast";

import { generateProblem } from "../utils/mathEngine";
import "../styles/game.css";

/* ---------- Tuning knobs ---------- */
const PROBLEMS_PER_ROUND = 10;
const MAX_HEARTS = 3;
const MAX_LEVEL = 5; // the engine has no harder problems beyond this
const POINTS_FIRST_TRY = 10;
const POINTS_AFTER_RETRY = 5;

const PRAISE = ["Great job!", "Awesome!", "You got it!", "Super!", "Nice one!"];

function makeProblem(level, operationMode, previous) {
    // Avoid showing the exact same problem twice in a row
    let next;
    let guard = 0;
    do {
        next = generateProblem(level, operationMode);
        guard += 1;
    } while (
        previous &&
        guard < 20 &&
        next.a === previous.a &&
        next.b === previous.b &&
        next.operation === previous.operation
    );

    return {
        ...next,
        // New id = new <ColumnProblem key=...>, which resets its typed digits
        id: Math.random().toString(36).slice(2),
    };
}

/**
 * 3 stars: finished with at most 1 mistake
 * 2 stars: finished with at most 3 mistakes
 * 1 star:  finished with more, or ran out of hearts (everyone gets one)
 */
function starsFor(completed, mistakes) {
    if (!completed) return 1;
    if (mistakes <= 1) return 3;
    if (mistakes <= 3) return 2;
    return 1;
}

export default function Game({
    learnerName,
    startingLevel,
    correctsPerLevel,
    operationMode,
    showHelp,
    onExitGame,
}) {
    // An emptied number field gives 0 (or NaN), which would break `%` and
    // stop level-ups. Always use a whole number >= 1.
    const perLevel = Math.max(1, Math.floor(Number(correctsPerLevel)) || 1);

    const [level, setLevel] = useState(startingLevel);
    const [points, setPoints] = useState(0);
    const [hearts, setHearts] = useState(MAX_HEARTS);
    const [solved, setSolved] = useState(0); // correct answers this round
    const [mistakes, setMistakes] = useState(0); // wrong tries this round
    const [problem, setProblem] = useState(() =>
        makeProblem(startingLevel, operationMode),
    );
    const [result, setResult] = useState(null); // null | { completed: boolean }
    const [confirmLeave, setConfirmLeave] = useState(false);

    const [toast, setToast] = useState(null);
    const [levelUp, setLevelUp] = useState(null); // { id, level }
    const toastTimer = useRef(null);
    const toastId = useRef(0);
    const levelUpTimer = useRef(null);

    // Don't leave pending timers behind when the game unmounts
    useEffect(
        () => () => {
            clearTimeout(toastTimer.current);
            clearTimeout(levelUpTimer.current);
        },
        [],
    );

    function flash(message, type) {
        // Cancel the previous timer so it can't dismiss this newer toast early
        clearTimeout(toastTimer.current);
        toastId.current += 1;
        setToast({ id: toastId.current, message, type });
        toastTimer.current = setTimeout(() => setToast(null), 900);
    }

    function celebrate(newLevel) {
        clearTimeout(levelUpTimer.current);
        setLevelUp({ id: Math.random(), level: newLevel });
        levelUpTimer.current = setTimeout(() => setLevelUp(null), 1800);
    }

    // Returns true if the answer was right. All state updates are computed
    // here, outside updater functions, so they stay pure under StrictMode.
    function submitAnswer(value, attemptNo) {
        if (result || confirmLeave) return false;

        if (value === problem.answer) {
            const gained = attemptNo === 1 ? POINTS_FIRST_TRY : POINTS_AFTER_RETRY;
            const nextSolved = solved + 1;
            const roundDone = nextSolved >= PROBLEMS_PER_ROUND;
            const levelsUp = level < MAX_LEVEL && nextSolved % perLevel === 0;
            const nextLevel = levelsUp ? level + 1 : level;

            setPoints((p) => p + gained);
            setSolved(nextSolved);

            if (levelsUp) {
                setLevel(nextLevel);
                // Level-up refills one heart
                setHearts((h) => Math.min(MAX_HEARTS, h + 1));
                if (!roundDone) celebrate(nextLevel);
            }

            if (roundDone) {
                setResult({ completed: true });
            } else {
                setProblem(makeProblem(nextLevel, operationMode, problem));
            }

            const praise = PRAISE[Math.floor(Math.random() * PRAISE.length)];
            flash(
                attemptNo === 1
                    ? `${praise} +${gained}`
                    : `Nice fixing! +${gained}`,
                "success",
            );
            return true;
        }

        const nextHearts = hearts - 1;
        setHearts(nextHearts);
        setMistakes((m) => m + 1);

        if (nextHearts <= 0) {
            setResult({ completed: false });
        } else {
            flash(
                attemptNo === 1
                    ? "🤔 Not quite. Try again!"
                    : "💡 Look for the orange hints!",
                "oops",
            );
        }
        return false;
    }

    function restart() {
        clearTimeout(levelUpTimer.current);
        setLevel(startingLevel);
        setPoints(0);
        setHearts(MAX_HEARTS);
        setSolved(0);
        setMistakes(0);
        setResult(null);
        setLevelUp(null);
        setProblem(makeProblem(startingLevel, operationMode, problem));
    }

    return (
        <div className="game">
            <GameHeader
                name={learnerName}
                level={level}
                points={points}
                hearts={hearts}
                maxHearts={MAX_HEARTS}
                solved={solved}
                total={PROBLEMS_PER_ROUND}
                perLevel={perLevel}
                atMaxLevel={level >= MAX_LEVEL}
                onBack={() => setConfirmLeave(true)}
            />

            <ColumnProblem
                key={problem.id}
                problem={problem}
                onSubmit={submitAnswer}
                onIncomplete={() => flash("Fill in every digit", "info")}
                showHelp={showHelp}
                disabled={Boolean(result) || confirmLeave}
            />

            <ScoreToast
                id={toast?.id}
                message={toast?.message}
                type={toast?.type}
            />

            <AnimatePresence>
                {levelUp && (
                    <LevelUpBanner key={levelUp.id} level={levelUp.level} />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {confirmLeave && (
                    <ConfirmLeaveModal
                        key="leave"
                        onStay={() => setConfirmLeave(false)}
                        onLeave={onExitGame}
                    />
                )}
                {result && (
                    <RoundResultModal
                        key="result"
                        completed={result.completed}
                        stars={starsFor(result.completed, mistakes)}
                        solved={solved}
                        total={PROBLEMS_PER_ROUND}
                        points={points}
                        level={level}
                        onPlayAgain={restart}
                        onExit={onExitGame}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
