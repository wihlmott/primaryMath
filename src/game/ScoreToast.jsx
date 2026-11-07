import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

// `id` changes for every toast, so back-to-back toasts with the same
// message still animate in again instead of silently reusing the old one.
//
// Centering is done with x/y = -50% here, NOT with a CSS transform:
// framer-motion writes its own inline `transform`, which would override
// a `translate(-50%, -50%)` in the stylesheet.
function Toast({ id, message, type }) {
    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    key={id}
                    className={`score-flash ${type}`}
                    initial={{ opacity: 0, scale: 0.8, x: "-50%", y: "-30%" }}
                    animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                    exit={{ opacity: 0, scale: 0.8, x: "-50%", y: "-70%" }}
                >
                    {message}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default function ScoreToast({ id, message, type }) {
    return createPortal(
        <Toast id={id} message={message} type={type} />,
        document.body,
    );
}
