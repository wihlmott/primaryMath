import { motion } from "framer-motion";

export default function GameOverModal({ points, level, onPlayAgain, onExit }) {
    return (
        <motion.div
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="modal"
                initial={{ scale: 0.85 }}
                animate={{ scale: 1 }}
            >
                <h2>Game Over</h2>

                <p>
                    <strong>Points:</strong> {points}
                </p>
                <p>
                    <strong>Level reached:</strong> {level}
                </p>

                <div className="modal-actions">
                    <button onClick={onPlayAgain}>Play Again</button>
                    <button onClick={onExit}>Back to Menu</button>
                </div>
            </motion.div>
        </motion.div>
    );
}
