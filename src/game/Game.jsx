import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";

import GameHeader from "./GameHeader";
import ColumnProblem from "./ColumnProblem";
import RoundResultModal from "./RoundResultModal";
import ConfirmLeaveModal from "./ConfirmLeaveModal";
import LevelUpBanner from "./LevelUpBanner";
import ScoreToast from "./ScoreToast";

import { generateProblem } from "../utils/mathEngine";
import { MAX_LEVEL } from "../utils/adventure";
import { awardStickers, loadLearner, saveLearner } from "../utils/progress";
import "../styles/game.css";

/* ---------- Tuning knobs ---------- */
const MAX_HEARTS = 3;
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
 * Stars for a round with a question limit. Thresholds scale with the length:
 * 3 stars: at most ~10% mistakes (min 1)
 * 2 stars: at most ~30% mistakes (min 3)
 * 1 star:  finished with more, or ran out of hearts (everyone gets one)
 */
function starsFor(completed, mistakes, total) {
    if (!completed) return 1;
    if (mistakes <= Math.max(1, Math.floor(total * 0.1))) return 3;
    if (mistakes <= Math.max(3, Math.floor(total * 0.3))) return 2;
    return 1;
}

export default function Game({
    learnerName,
    avatar,
    startingLevel,
    correctsPerLevel,
    operationMode,
    showHelp,
    maxQuestions = null, // number, or null for "no limit"
    onExitGame,
}) {
    const infinite = maxQuestions == null;

    // An emptied number field gives 0 (or NaN), which would break `%` and
    // stop level-ups. Always use a whole number >= 1.
    const perLevel = Math.max(1, Math.floor(Number(correctsPerLevel)) || 1);

    const [level, setLevel] = useState(startingLevel);
    const [points, setPoints] = useState(0);
    const [hearts, setHearts] = useState(MAX_HEARTS);
    const [solved, setSolved] = useState(0); // correct answers this round
    const [mistakes, setMistakes] = useState(0); // wrong tries this round
    const [cleanStreak, setCleanStreak] = useState(0); // right first time, in a row
    const [problem, setProblem] = useState(() =>
        makeProblem(startingLevel, operationMode),
    );
    const [result, setResult] = useState(null); // null | { completed, stars }
    const [confirmLeave, setConfirmLeave] = useState(false);
    const [earnedList, setEarnedList] = useState([]); // stickers won this round

    const [toast, setToast] = useState(null);
    const [banner, setBanner] = useState(null); // { id, text }

    const toastTimer = useRef(null);
    const toastId = useRef(0);
    const bannerTimer = useRef(null);
    const bannerQueue = useRef([]);
    const bannerActive = useRef(false);

    // Saved progress lives in a ref so several updates in one event stay in order
    const learnerRef = useRef(null);
    const bestRunBefore = useRef(null);
    if (learnerRef.current === null) {
        learnerRef.current = loadLearner(learnerName, avatar);
        bestRunBefore.current = learnerRef.current.bestRun;
    }

    // Don't leave pending timers behind when the game unmounts
    useEffect(
        () => () => {
            clearTimeout(toastTimer.current);
            clearTimeout(bannerTimer.current);
        },
        [],
    );

    /* ---------- Saved progress ---------- */

    // `update` returns the changed learner; stickers are awarded and saved.
    // Returns the stickers earned by this change.
    function track(update) {
        const { learner, earned } = awardStickers(update(learnerRef.current));
        learnerRef.current = learner;
        saveLearner(learner);
        return earned;
    }

    /* ---------- Toasts and banners ---------- */

    function flash(message, type) {
        // Cancel the previous timer so it can't dismiss this newer toast early
        clearTimeout(toastTimer.current);
        toastId.current += 1;
        setToast({ id: toastId.current, message, type });
        toastTimer.current = setTimeout(() => setToast(null), 900);
    }

    // Banners (level-up, new sticker) play one after another
    function nextBanner() {
        const next = bannerQueue.current.shift();
        if (!next) {
            bannerActive.current = false;
            setBanner(null);
            return;
        }
        bannerActive.current = true;
        setBanner(next);
        bannerTimer.current = setTimeout(nextBanner, 1800);
    }

    function showBanner(text) {
        bannerQueue.current.push({ id: Math.random(), text });
        if (!bannerActive.current) nextBanner();
    }

    function clearBanners() {
        clearTimeout(bannerTimer.current);
        bannerQueue.current = [];
        bannerActive.current = false;
        setBanner(null);
    }

    /* ---------- Round end ---------- */

    // Records the round and opens the result screen.
    // Returns stickers earned by finishing.
    function endRound(completed, mistakesNow) {
        const stars = infinite ? 0 : starsFor(completed, mistakesNow, maxQuestions);

        const earned = track((l) => ({
            ...l,
            roundsPlayed: l.roundsPlayed + 1,
            totalStars: l.totalStars + stars,
            perfectRounds:
                l.perfectRounds +
                (completed && !infinite && mistakesNow === 0 ? 1 : 0),
            lastPlayed: Date.now(),
        }));

        setResult({ completed, stars });
        return earned;
    }

    // "Finish and see my score" in a no-limit game
    function finishNow() {
        setConfirmLeave(false);
        const earned = endRound(false, mistakes);
        if (earned.length) setEarnedList((list) => [...list, ...earned]);
    }

    // Returns true if the answer was right. All state updates are computed
    // here, outside updater functions, so they stay pure under StrictMode.
    function submitAnswer(value, attemptNo) {
        if (result || confirmLeave) return false;

        if (value === problem.answer) {
            const gained = attemptNo === 1 ? POINTS_FIRST_TRY : POINTS_AFTER_RETRY;
            const nextSolved = solved + 1;
            const roundDone = !infinite && nextSolved >= maxQuestions;
            const milestone = nextSolved % perLevel === 0;
            const levelsUp = level < MAX_LEVEL && milestone;
            const bonusHeart = level >= MAX_LEVEL && milestone; // keeps long runs going
            const nextLevel = levelsUp ? level + 1 : level;
            const nextClean = attemptNo === 1 ? cleanStreak + 1 : 0;
            const refill = (levelsUp || bonusHeart) && hearts < MAX_HEARTS;
            const op = problem.operation;

            setPoints((p) => p + gained);
            setSolved(nextSolved);
            setCleanStreak(nextClean);
            if (levelsUp) setLevel(nextLevel);
            if (refill) setHearts((h) => Math.min(MAX_HEARTS, h + 1));

            let earned = track((l) => ({
                ...l,
                totalSolved: l.totalSolved + 1,
                solvedByOp: { ...l.solvedByOp, [op]: (l.solvedByOp[op] || 0) + 1 },
                retriesFixed: l.retriesFixed + (attemptNo > 1 ? 1 : 0),
                bestCleanStreak: Math.max(l.bestCleanStreak, nextClean),
                bestRun: infinite ? Math.max(l.bestRun, nextSolved) : l.bestRun,
                bestLevel: {
                    ...l.bestLevel,
                    [operationMode]: Math.max(l.bestLevel[operationMode] || 1, nextLevel),
                },
                lastPlayed: Date.now(),
            }));

            if (roundDone) {
                earned = [...earned, ...endRound(true, mistakes)];
            } else {
                setProblem(makeProblem(nextLevel, operationMode, problem));
                // the result screen lists stickers, so banners only mid-game
                if (levelsUp) showBanner(`🎉 Level ${nextLevel}! 🎉`);
                earned.forEach((s) => showBanner(`${s.emoji} New sticker: ${s.name}!`));
            }
            if (earned.length) setEarnedList((list) => [...list, ...earned]);

            const praise = PRAISE[Math.floor(Math.random() * PRAISE.length)];
            const heart = refill ? " ❤️+1" : "";
            flash(
                attemptNo === 1
                    ? `${praise} +${gained}${heart}`
                    : `Nice fixing! +${gained}${heart}`,
                "success",
            );
            return true;
        }

        const nextHearts = hearts - 1;
        const nextMistakes = mistakes + 1;
        setHearts(nextHearts);
        setMistakes(nextMistakes);
        setCleanStreak(0);

        if (nextHearts <= 0) {
            const earned = endRound(false, nextMistakes);
            if (earned.length) setEarnedList((list) => [...list, ...earned]);
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
        clearBanners();
        setLevel(startingLevel);
        setPoints(0);
        setHearts(MAX_HEARTS);
        setSolved(0);
        setMistakes(0);
        setCleanStreak(0);
        setResult(null);
        setEarnedList([]);
        bestRunBefore.current = learnerRef.current.bestRun;
        setProblem(makeProblem(startingLevel, operationMode, problem));
    }

    const isNewBest = infinite && solved > 0 && solved > bestRunBefore.current;

    return (
        <div className="game">
            <GameHeader
                name={learnerName}
                avatar={avatar}
                level={level}
                points={points}
                hearts={hearts}
                maxHearts={MAX_HEARTS}
                solved={solved}
                total={maxQuestions}
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
                {banner && <LevelUpBanner key={banner.id} text={banner.text} />}
            </AnimatePresence>

            <AnimatePresence>
                {confirmLeave && (
                    <ConfirmLeaveModal
                        key="leave"
                        onStay={() => setConfirmLeave(false)}
                        onLeave={onExitGame}
                        onFinish={infinite && solved > 0 ? finishNow : undefined}
                    />
                )}
                {result && (
                    <RoundResultModal
                        key="result"
                        avatar={avatar}
                        infinite={infinite}
                        completed={result.completed}
                        stars={result.stars}
                        solved={solved}
                        total={maxQuestions}
                        points={points}
                        level={level}
                        bestRun={Math.max(bestRunBefore.current, solved)}
                        isNewBest={isNewBest}
                        newStickers={earnedList}
                        onPlayAgain={restart}
                        onExit={onExitGame}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
