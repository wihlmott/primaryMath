import { motion } from "framer-motion";
import Avatar from "../components/Avatar";
import StickerIcon from "../components/StickerIcon";

const TOTAL_STARS = 3;

export default function RoundResultModal({
    avatar,
    equipped,
    infinite,
    completed,
    stars,
    solved,
    total,
    points,
    level,
    bestRun,
    isNewBest,
    newStickers,
    onPlayAgain,
    onExit,
}) {
    let title;
    if (infinite) title = solved === 0 ? "Good try!" : "Great run!";
    else if (!completed) title = "Good try!";
    else title = stars === 3 ? "Amazing!" : "Great job!";

    let summary;
    if (infinite) {
        summary = `You solved ${solved} ${solved === 1 ? "problem" : "problems"}!`;
    } else if (completed) {
        summary = `You solved all ${total} problems!`;
    } else {
        summary = `You solved ${solved} of ${total}. Let's practice some more!`;
    }

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
                <div className="result-avatar">
                    <Avatar id={avatar} equipped={equipped} size={96} />
                </div>
                <h2>{title}</h2>

                {!infinite && (
                    <div
                        className="stars"
                        role="img"
                        aria-label={`${stars} out of ${TOTAL_STARS} stars`}
                    >
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
                )}

                <p>{summary}</p>
                {infinite && solved > 0 && (
                    <p>
                        {isNewBest
                            ? "🎉 New best run!"
                            : `Your best run: ${bestRun}`}
                    </p>
                )}
                <p>
                    <strong>Points:</strong> {points}
                </p>
                <p>
                    <strong>Level reached:</strong> {level}
                </p>

                {newStickers.length > 0 && (
                    <div className="new-stickers">
                        <div className="new-stickers-title">
                            New {newStickers.length === 1 ? "sticker" : "stickers"}!
                        </div>
                        <ul>
                            {newStickers.map((s) => (
                                <li key={s.id}>
                                    <StickerIcon id={s.id} size={40} />
                                    {s.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

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
