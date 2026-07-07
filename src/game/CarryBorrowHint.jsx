import { motion } from "framer-motion";

export default function CarryBorrowHint({ leftIndex }) {
    return (
        <motion.div
            className="carry-bubble"
            style={{
                left: `calc(${leftIndex} * var(--digit-width))`,
            }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
        >
            1
        </motion.div>
    );
}
