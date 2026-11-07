import { motion } from "framer-motion";

const TOTAL_STARS = 3;

export default function RoundResultModal({
    completed,
    stars,
    solved,
    total,
    points,
    level,
    onPlayAgain,
    onExit,
}) {
    const title = !completed ? "Good try!" : stars === 3 ? "Amazing!" : "Great job!";

    return (
        <motion.div
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="modal"
                role="dialog"
                aria-modal="true"
                aria-label={title}
                initial={{ scale: 0.85 }}
                animate={{ scale: 1 }}
            >
                <h2>{title}</h2>

                <div className="stars" role="img" aria-label={`${stars} out of ${TOTAL_STARS} stars`}>
                    {Array.from({ length: TOTAL_STARS }, (_, i) => (
                        <motion.span
                            key={i}
                            className={`star ${i < stars ? "earned" : "empty"}`}
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                                delay: 0.25 + i * 0.25,
                                type: "spring",
                                stiffness: 300,
                                damping: 14,
                            }}
                        >
                            {i < stars ? "⭐" : "☆"}
                        </motion.span>
                    ))}
                </div>

                <p>
                    {completed
                        ? `You solved all ${total} problems!`
                        : `You solved ${solved} of ${total}. Let's practice some more!`}
                </p>
                <p>
                    <strong>Points:</strong> {points}
                </p>
                <p>
                    <strong>Level reached:</strong> {level}
                </p>

                <div className="modal-actions">
                    <button className="primary" onClick={onPlayAgain}>
                        Play Again
                    </button>
                    <button onClick={onExit}>Back to Menu</button>
                </div>
            </motion.div>
        </motion.div>
    );
}
