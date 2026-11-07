import { motion } from "framer-motion";

export default function ConfirmLeaveModal({ onStay, onLeave }) {
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
                aria-label="Leave the game?"
                initial={{ scale: 0.85 }}
                animate={{ scale: 1 }}
            >
                <h2>Leave the game?</h2>
                <p>You will lose your progress in this round.</p>

                <div className="modal-actions">
                    <button className="primary" onClick={onStay}>
                        Keep playing
                    </button>
                    <button onClick={onLeave}>Leave</button>
                </div>
            </motion.div>
        </motion.div>
    );
}
