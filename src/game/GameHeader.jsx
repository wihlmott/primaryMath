import { motion } from "framer-motion";
import "../styles/layout.css";

export default function GameHeader({
    name,
    level,
    points,
    hearts,
    maxHearts,
    solved,
    total,
    perLevel,
    atMaxLevel,
    onBack,
}) {
    const intoLevel = solved % perLevel;
    const pct = atMaxLevel ? 100 : (intoLevel / perLevel) * 100;

    return (
        <header className="game-header">
            <button className="back-btn" onClick={onBack}>
                ← Back
            </button>

            <div className="title">Math Adventure</div>

            <div className="status">
                <span className="name">{name}</span>
                <span>Level {level}</span>
                <span>{points} pts</span>
            </div>

            <div className="hearts-row">
                <div
                    className="hearts"
                    role="img"
                    aria-label={`${hearts} of ${maxHearts} hearts left`}
                >
                    {Array.from({ length: maxHearts }, (_, i) => {
                        const full = i < hearts;
                        return (
                            <motion.span
                                key={i}
                                // an emptied heart gives a small pop
                                animate={{ scale: full ? 1 : [1.5, 1] }}
                            >
                                {full ? "❤️" : "🤍"}
                            </motion.span>
                        );
                    })}
                </div>

                <span>
                    Problem {Math.min(solved + 1, total)} of {total}
                </span>
            </div>

            <div
                className="level-progress"
                role="progressbar"
                aria-label="Progress to next level"
                aria-valuemin={0}
                aria-valuemax={perLevel}
                aria-valuenow={atMaxLevel ? perLevel : intoLevel}
            >
                <motion.div
                    className="level-progress-fill"
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.4 }}
                />
            </div>
            <div className="level-progress-label">
                {atMaxLevel
                    ? "Top level! 🏆"
                    : `${intoLevel} of ${perLevel} to Level ${level + 1}`}
            </div>
        </header>
    );
}
