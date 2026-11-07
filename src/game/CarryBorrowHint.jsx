import { motion } from "framer-motion";

/**
 * A hint bubble above one digit column.
 *
 * leftIndex = digit column index from the left (0-based).
 * value     = number shown (carry amount, or new top digit when borrowing).
 * kind      = "carry" (blue) or "borrow" (purple).
 *
 * Each column is one digit-width plus one column-gap wide; the bubble is
 * centred over its column.
 */
export default function CarryBorrowHint({ leftIndex, value = 1, kind = "carry" }) {
    const wide = String(value).length > 1;

    return (
        <motion.div
            className={`carry-bubble ${kind}${wide ? " wide" : ""}`}
            style={{
                left: `calc(${leftIndex} * (var(--digit-width) + var(--col-gap)) + (var(--digit-width) - 1.6rem) / 2)`,
            }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {value}
        </motion.div>
    );
}
