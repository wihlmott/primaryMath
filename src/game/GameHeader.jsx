import { motion } from "framer-motion";
import { LEVELS } from "../utils/adventure";
import Avatar from "../components/Avatar";
import "../styles/layout.css";

export default function GameHeader({
    name,
    avatar,
    equipped,
    level,
    points,
    hearts,
    maxHearts,
    heartHint, // answers until the next bonus heart (no-limit games), else null
    solved,
    total, // number, or null when there is no question limit
    intoLevel, // right answers since this level began
    need, // right answers needed to clear it
    atMaxLevel,
    onBack,
}) {
    const pct = atMaxLevel ? 100 : Math.min(100, (intoLevel / need) * 100);
    const island = LEVELS[level - 1];

    return (
        <header className="game-header">
            <button className="back-btn" onClick={onBack}>
                ← Back
            </button>

            <div className="title">Math Adventure</div>

            <div className="status">
                <span className="name">
                    <Avatar id={avatar} equipped={equipped} size={34} />
                    {name}
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

                {heartHint != null && (
                    <span className="heart-hint">next ❤️ in {heartHint}</span>
                )}

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
                aria-valuemax={need}
                aria-valuenow={atMaxLevel ? need : intoLevel}
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
                    : `${intoLevel} of ${need} to Level ${level + 1}`}
            </div>
        </header>
    );
}
