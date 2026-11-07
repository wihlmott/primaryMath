import { motion } from "framer-motion";

/**
 * `onFinish` is only passed in no-limit games, where a round has no natural
 * end: it lets the learner stop and see their score.
 */
export default function ConfirmLeaveModal({ onStay, onLeave, onFinish }) {
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
                aria-label={onFinish ? "Stop playing?" : "Leave the game?"}
                initial={{ scale: 0.85 }}
                animate={{ scale: 1 }}
            >
                <h2>{onFinish ? "Stop playing?" : "Leave the game?"}</h2>
                <p>
                    {onFinish
                        ? "Finish to see your score, or leave without it."
                        : "You will lose this round's stars."}
                </p>

                <div className="modal-actions">
                    <button className="primary" onClick={onStay}>
                        Keep playing
                    </button>
                    {onFinish && (
                        <button onClick={onFinish}>Finish &amp; see my score</button>
                    )}
                    <button onClick={onLeave}>Leave</button>
                </div>
            </motion.div>
        </motion.div>
    );
}
