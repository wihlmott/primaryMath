import { motion } from "framer-motion";
import { LEVELS } from "../utils/adventure";
import "../styles/layout.css";

export default function GameHeader({
    name,
    avatar,
    level,
    points,
    hearts,
    maxHearts,
    solved,
    total, // number, or null when there is no question limit
    perLevel,
    atMaxLevel,
    onBack,
}) {
    const intoLevel = solved % perLevel;
    const pct = atMaxLevel ? 100 : (intoLevel / perLevel) * 100;
    const island = LEVELS[level - 1];

    return (
        <header className="game-header">
            <button className="back-btn" onClick={onBack}>
                ← Back
            </button>

            <div className="title">Math Adventure</div>

            <div className="status">
                <span className="name">
                    {avatar} {name}
                </span>
                <span>
                    Level {level} {island?.emoji}
                </span>
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
                    {total == null
                        ? `Problem ${solved + 1} · ∞`
                        : `Problem ${Math.min(solved + 1, total)} of ${total}`}
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
                    ? `Top level! 🏆 Every ${perLevel} right earns a heart`
                    : `${intoLevel} of ${perLevel} to Level ${level + 1}`}
            </div>
        </header>
    );
}
