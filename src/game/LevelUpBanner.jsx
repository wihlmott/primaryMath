import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const EMOJI = ["⭐", "🎉", "✨", "🌟", "🎈"];
const PIECES = 14;

/**
 * Short, non-blocking celebration. Sits above the game but below the modals,
 * and ignores pointer events so the learner can keep playing.
 */
export default function LevelUpBanner({ level }) {
    const reduceMotion = useReducedMotion();

    // Random burst directions, chosen once per banner
    const [pieces] = useState(() =>
        Array.from({ length: PIECES }, (_, i) => {
            const angle = (i / PIECES) * Math.PI * 2 + Math.random() * 0.4;
            const distance = 110 + Math.random() * 90;
            return {
                emoji: EMOJI[i % EMOJI.length],
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                rotate: Math.random() * 360 - 180,
            };
        }),
    );

    return (
        <motion.div
            className="celebrate"
            role="status"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="celebrate-inner">
                {!reduceMotion &&
                    pieces.map((p, i) => (
                        <motion.span
                            key={i}
                            className="confetti"
                            aria-hidden="true"
                            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                            animate={{
                                x: p.x,
                                y: p.y,
                                scale: 1,
                                opacity: 0,
                                rotate: p.rotate,
                            }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                        >
                            {p.emoji}
                        </motion.span>
                    ))}

                <motion.div
                    className="level-banner"
                    initial={{ scale: reduceMotion ? 1 : 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 14 }}
                >
                    🎉 Level {level}! 🎉
                </motion.div>
            </div>
        </motion.div>
    );
}
