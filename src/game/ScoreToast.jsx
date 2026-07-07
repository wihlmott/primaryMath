import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

function Toast({ message, type }) {
    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    className={`score-flash ${type}`}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                >
                    {message}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default function ScoreToast({ message, type }) {
    return createPortal(<Toast message={message} type={type} />, document.body);
}
