import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";

import GameHeader from "./GameHeader";
import ColumnProblem from "./ColumnProblem";
import GameOverModal from "./GameOverModal";
import ScoreToast from "./ScoreToast";

import { generateProblem } from "../utils/mathEngine";
import "../styles/game.css";

export default function Game({
    learnerName,
    startingLevel,
    correctsPerLevel,
    operationMode,
    showCarryBorrow,
    onExitGame,
}) {
    const [level, setLevel] = useState(startingLevel);
    const [points, setPoints] = useState(0);
    const [errors, setErrors] = useState(0);
    const [streak, setStreak] = useState(0);
    const [problem, setProblem] = useState(null);
    const [gameOver, setGameOver] = useState(false);

    const [toast, setToast] = useState(null);

    useEffect(() => {
        setProblem(generateProblem(level, operationMode));
    }, [level, operationMode]);

    function submitAnswer(answer) {
        if (answer === problem.answer) {
            setPoints((p) => p + 10);
            setToast({ message: "+10 Points!", type: "success" });

            setTimeout(() => setToast(null), 800);

            setStreak((s) => {
                const next = s + 1;
                if (next % correctsPerLevel === 0) {
                    setLevel((l) => l + 1);
                } else {
                    setProblem(generateProblem(level, operationMode));
                }
                return next;
            });
        } else {
            setToast({ message: "❌ Wrong!", type: "error" });
            setTimeout(() => setToast(null), 800);

            setErrors((e) => {
                if (e + 1 >= 3) setGameOver(true);
                return e + 1;
            });
        }
    }

    function restart() {
        setLevel(startingLevel);
        setPoints(0);
        setErrors(0);
        setStreak(0);
        setGameOver(false);
        setProblem(generateProblem(startingLevel, operationMode));
    }

    if (!problem) return null;

    return (
        <div className="game">
            <GameHeader
                name={learnerName}
                level={level}
                points={points}
                errors={errors}
                onBack={onExitGame}
            />

            <ColumnProblem
                problem={problem}
                onSubmit={submitAnswer}
                showCarryBorrow={showCarryBorrow}
            />

            <ScoreToast message={toast?.message} type={toast?.type} />

            <AnimatePresence>
                {gameOver && (
                    <GameOverModal
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
