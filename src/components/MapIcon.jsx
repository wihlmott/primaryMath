/** A little treasure map (folded paper, a dotted trail and an X), for the "My adventure" button. */
export default function MapIcon({ size = 32 }) {
    return (
        <svg
            viewBox="0 0 64 64"
            width={size}
            height={size}
            aria-hidden="true"
            style={{
                overflow: "visible",
                filter: `drop-shadow(0 ${(size * 0.05).toFixed(1)}px ${(size * 0.06).toFixed(1)}px rgba(0, 0, 0, 0.3))`,
            }}
        >
            {/* thickness */}
            <path d="M5 19 L22 13 L42 19 L59 13 L59 55 L42 61 L22 55 L5 61 Z" fill="#B45309" />
            {/* three folded panels */}
            <path d="M5 16 L22 10 L22 52 L5 58 Z" fill="#FDE68A" />
            <path d="M22 10 L42 16 L42 58 L22 52 Z" fill="#FEF3C7" />
            <path d="M42 16 L59 10 L59 52 L42 58 Z" fill="#FDE68A" />
            {/* a bit of sea */}
            <path d="M5 44 Q13 40 22 46 L22 52 L5 58 Z" fill="#7DD3FC" />
            {/* the trail, ending at the X */}
            <path d="M13 46 C20 30 29 46 36 35 S45 28 48 25" fill="none" stroke="#DC2626" strokeWidth="2.6" strokeDasharray="0.1 5.2" strokeLinecap="round" />
            <path d="M45 21 L53 29 M53 21 L45 29" stroke="#DC2626" strokeWidth="3.6" strokeLinecap="round" />
        </svg>
    );
}
