/* SVG art for the explorers and their wearable stickers.

   Every explorer shares one layout (viewBox 0 0 100 100) so any sticker fits
   any explorer:
     head  circle centred (50, 48), radius ~30  (top of head is y ~ 18)
     eyes  (39, 46) and (61, 46)
     neck / shoulders start at y ~ 77
   Stickers are drawn in that same space: head items sit around y 2-30, face
   items around y 40-55, neck items around y 77-100.
   Colours are flat with a few soft highlights; shadows are added by the
   components (CSS drop-shadow), so no gradients or ids are needed here. */

const INK = "#1F2937";
const rad = (deg) => (deg * Math.PI) / 180;

function starPoints(cx, cy, outer, inner, points = 5) {
    const pts = [];
    for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outer : inner;
        const a = rad(-90 + (i * 180) / points);
        pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
    }
    return pts.join(" ");
}

/* ---------- shared pieces ---------- */

function Eyes({ dx = 11, y = 46, r = 4.2 }) {
    return (
        <g>
            <circle cx={50 - dx} cy={y} r={r} fill={INK} />
            <circle cx={50 + dx} cy={y} r={r} fill={INK} />
            <circle cx={50 - dx - 1.4} cy={y - 1.5} r="1.4" fill="#fff" />
            <circle cx={50 + dx - 1.4} cy={y - 1.5} r="1.4" fill="#fff" />
        </g>
    );
}

function Smile({ y = 61, w = 6 }) {
    return (
        <path
            d={`M${50 - w} ${y} Q50 ${y + 6} ${50 + w} ${y}`}
            fill="none"
            stroke={INK}
            strokeWidth="2.4"
            strokeLinecap="round"
        />
    );
}

function Blush({ color = "#F472B6", y = 57, opacity = 0.4 }) {
    return (
        <g fill={color} opacity={opacity}>
            <circle cx="29" cy={y} r="4.6" />
            <circle cx="71" cy={y} r="4.6" />
        </g>
    );
}

function Shoulders({ color, stroke = "rgba(0,0,0,0.18)" }) {
    return (
        <path
            d="M14 100 C14 82 29 76 50 76 C71 76 86 82 86 100 Z"
            fill={color}
            stroke={stroke}
            strokeWidth="1.4"
        />
    );
}

function Head({ color, stroke, r = 30, cy = 48 }) {
    return (
        <g>
            <circle cx="50" cy={cy} r={r} fill={color} stroke={stroke} strokeWidth="1.6" />
            <ellipse
                cx="38"
                cy={cy - r * 0.58}
                rx="9"
                ry="4.5"
                fill="#fff"
                opacity="0.28"
                transform={`rotate(-28 38 ${cy - r * 0.58})`}
            />
        </g>
    );
}

/* ---------- explorers ---------- */

export const AVATAR_ART = {
    fox: (
        <g>
            <Shoulders color="#3B82F6" />
            <path d="M21 38 L23 7 L45 25 Z" fill="#F59E3B" stroke="#C2410C" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M79 38 L77 7 L55 25 Z" fill="#F59E3B" stroke="#C2410C" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M27 31 L28 15 L39 25 Z" fill="#7C2D12" />
            <path d="M73 31 L72 15 L61 25 Z" fill="#7C2D12" />
            <Head color="#F59E3B" stroke="#C2410C" />
            <path
                d="M20 55 Q36 52 50 67 Q64 52 80 55 Q76 77 50 78 Q24 77 20 55 Z"
                fill="#FFF7ED"
            />
            <Eyes />
            <ellipse cx="50" cy="59" rx="4.2" ry="3.1" fill={INK} />
            <path d="M46 64 Q50 68 54 64" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
        </g>
    ),

    panda: (
        <g>
            <Shoulders color="#22C55E" />
            <circle cx="26" cy="24" r="10" fill={INK} />
            <circle cx="74" cy="24" r="10" fill={INK} />
            <Head color="#F8FAFC" stroke="#CBD5E1" />
            <ellipse cx="37.5" cy="47" rx="7.6" ry="9.4" fill={INK} transform="rotate(20 37.5 47)" />
            <ellipse cx="62.5" cy="47" rx="7.6" ry="9.4" fill={INK} transform="rotate(-20 62.5 47)" />
            <circle cx="39" cy="46" r="3.4" fill="#fff" />
            <circle cx="61" cy="46" r="3.4" fill="#fff" />
            <circle cx="39.6" cy="46.4" r="1.9" fill={INK} />
            <circle cx="60.4" cy="46.4" r="1.9" fill={INK} />
            <ellipse cx="50" cy="58" rx="4.6" ry="3.2" fill={INK} />
            <Smile y={63} w={5} />
            <Blush y={60} />
        </g>
    ),

    frog: (
        <g>
            <Shoulders color="#F59E0B" />
            <circle cx="33" cy="25" r="11" fill="#4ADE80" stroke="#15803D" strokeWidth="1.6" />
            <circle cx="67" cy="25" r="11" fill="#4ADE80" stroke="#15803D" strokeWidth="1.6" />
            <circle cx="33" cy="25" r="5.2" fill="#BBF7D0" />
            <circle cx="67" cy="25" r="5.2" fill="#BBF7D0" />
            <Head color="#4ADE80" stroke="#15803D" />
            <Eyes />
            <circle cx="46.5" cy="54" r="1.2" fill={INK} />
            <circle cx="53.5" cy="54" r="1.2" fill={INK} />
            <path d="M31 59 Q50 73 69 59" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
            <Blush y={58} color="#FB7185" />
        </g>
    ),

    lion: (
        <g>
            <Shoulders color="#EF4444" />
            {Array.from({ length: 12 }, (_, i) => {
                const a = rad(i * 30);
                return (
                    <circle
                        key={i}
                        cx={50 + 33 * Math.cos(a)}
                        cy={48 + 33 * Math.sin(a)}
                        r="9"
                        fill="#D97706"
                        stroke="#92400E"
                        strokeWidth="1.2"
                    />
                );
            })}
            <circle cx="50" cy="48" r="34" fill="#D97706" />
            <circle cx="32" cy="21" r="6.5" fill="#FBBF24" stroke="#B45309" strokeWidth="1.2" />
            <circle cx="68" cy="21" r="6.5" fill="#FBBF24" stroke="#B45309" strokeWidth="1.2" />
            <circle cx="32" cy="21" r="3" fill="#FCA5A5" />
            <circle cx="68" cy="21" r="3" fill="#FCA5A5" />
            <Head color="#FBBF24" stroke="#B45309" r={27} />
            <ellipse cx="50" cy="61" rx="12.5" ry="9" fill="#FEF3C7" />
            <Eyes />
            <path d="M45 56 H55 L50 62 Z" fill="#7C2D12" strokeLinejoin="round" stroke="#7C2D12" strokeWidth="1.6" />
            <path d="M50 62 V65 M50 65 Q45.5 69 42 65 M50 65 Q54.5 69 58 65" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
        </g>
    ),

    octopus: (
        <g>
            <path
                d="M14 100 C14 84 26 76 50 76 C74 76 86 84 86 100 Q78 94 70 100 Q62 94 54 100 Q46 94 38 100 Q30 94 22 100 Q18 98 14 100 Z"
                fill="#A78BFA"
                stroke="#6D28D9"
                strokeWidth="1.4"
            />
            <ellipse cx="50" cy="46" rx="33" ry="31" fill="#A78BFA" stroke="#6D28D9" strokeWidth="1.6" />
            <ellipse cx="38" cy="26" rx="10" ry="4.8" fill="#fff" opacity="0.28" transform="rotate(-28 38 26)" />
            <g fill="#8B5CF6" opacity="0.7">
                <circle cx="66" cy="28" r="3.6" />
                <circle cx="76" cy="40" r="2.6" />
                <circle cx="50" cy="22" r="2.4" />
            </g>
            <Eyes y={47} />
            <Smile y={61} w={6.5} />
            <Blush y={58} />
        </g>
    ),

    unicorn: (
        <g>
            <Shoulders color="#14B8A6" />
            <g stroke="#DB2777" strokeWidth="1.2">
                <circle cx="20" cy="40" r="9" fill="#F9A8D4" />
                <circle cx="17" cy="55" r="8.5" fill="#C4B5FD" stroke="#7C3AED" />
                <circle cx="22" cy="68" r="7.5" fill="#F9A8D4" />
                <circle cx="80" cy="40" r="9" fill="#F9A8D4" />
                <circle cx="83" cy="55" r="8.5" fill="#C4B5FD" stroke="#7C3AED" />
                <circle cx="78" cy="68" r="7.5" fill="#F9A8D4" />
            </g>
            <path d="M33 25 L29 6 L46 19 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M67 25 L71 6 L54 19 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M34 20 L32 11 L40 17 Z" fill="#F9A8D4" />
            <path d="M66 20 L68 11 L60 17 Z" fill="#F9A8D4" />
            <Head color="#F8FAFC" stroke="#CBD5E1" />
            <path d="M50 1 L43.5 23 L56.5 23 Z" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M47.2 12 L52.8 10.5 M45.6 17.5 L54.4 15.5" stroke="#CA8A04" strokeWidth="1.3" strokeLinecap="round" />
            <ellipse cx="50" cy="62" rx="11" ry="8" fill="#FCE7F3" />
            <Eyes />
            <circle cx="46.5" cy="60" r="1.1" fill="#DB2777" />
            <circle cx="53.5" cy="60" r="1.1" fill="#DB2777" />
            <path d="M46 65 Q50 68.5 54 65" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
            <Blush y={56} />
        </g>
    ),

    dragon: (
        <g>
            <Shoulders color="#6366F1" />
            <path d="M31 22 L26 3 L44 17 Z" fill="#FEF3C7" stroke="#D6B27E" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M69 22 L74 3 L56 17 Z" fill="#FEF3C7" stroke="#D6B27E" strokeWidth="1.5" strokeLinejoin="round" />
            <Head color="#EF4444" stroke="#B91C1C" />
            <ellipse cx="50" cy="61" rx="16" ry="11.5" fill="#FCA5A5" />
            <Eyes />
            <circle cx="44.5" cy="58" r="1.7" fill="#7F1D1D" />
            <circle cx="55.5" cy="58" r="1.7" fill="#7F1D1D" />
            <path d="M43 65 Q50 70 57 65" fill="none" stroke="#7F1D1D" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M34 30 L38 23 L42 29 M58 29 L62 23 L66 30" fill="none" stroke="#FDE047" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
    ),

    penguin: (
        <g>
            <path
                d="M14 100 C14 82 29 76 50 76 C71 76 86 82 86 100 Z"
                fill="#1F2937"
                stroke="#111827"
                strokeWidth="1.4"
            />
            <ellipse cx="50" cy="97" rx="17" ry="20" fill="#F8FAFC" />
            <Head color="#1F2937" stroke="#111827" />
            <g fill="#F8FAFC">
                <circle cx="40" cy="51" r="14" />
                <circle cx="60" cy="51" r="14" />
                <ellipse cx="50" cy="62" rx="19" ry="12" />
            </g>
            <Eyes />
            <path d="M43 56 Q50 52.5 57 56 Q50 67 43 56 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="1.2" strokeLinejoin="round" />
            <Blush y={58} opacity={0.45} />
        </g>
    ),
};

/* ---------- wearable stickers (same coordinate space as the explorers) ---------- */

export const ITEM_ART = {
    /* ----- head ----- */
    "first-steps": (
        <g>
            <path d="M50 23 Q51 16 50 11" fill="none" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />
            <path d="M50 12 C40 3 31 8 33 15 C41 17 47 16 50 12 Z" fill="#4ADE80" stroke="#15803D" strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M50 12 C60 3 69 8 67 15 C59 17 53 16 50 12 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1.4" strokeLinejoin="round" />
        </g>
    ),

    climber: (
        <g>
            <path d="M26 27 C26 3 74 3 74 27 Z" fill="#FB923C" stroke="#C2410C" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M44 7 V25 M56 7 V25" fill="none" stroke="#EA580C" strokeWidth="2.2" />
            <rect x="21" y="24" width="58" height="6.5" rx="3.2" fill="#EA580C" stroke="#C2410C" strokeWidth="1.2" />
            <circle cx="50" cy="15" r="5.2" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.5" />
            <path d="M47.2 13 Q50 10.8 52.8 13" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />
        </g>
    ),

    summit: (
        <g>
            <path d="M29 28 L28 9 L40 18 L50 5 L60 18 L72 9 L71 28 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.8" strokeLinejoin="round" />
            <rect x="29" y="22.5" width="42" height="6" rx="1.5" fill="#F59E0B" stroke="#CA8A04" strokeWidth="1.4" />
            <circle cx="28" cy="9" r="2.7" fill="#EF4444" stroke="#B91C1C" strokeWidth="0.8" />
            <circle cx="50" cy="5" r="2.9" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="0.8" />
            <circle cx="72" cy="9" r="2.7" fill="#EF4444" stroke="#B91C1C" strokeWidth="0.8" />
            <path d="M34 20 L38 20.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
        </g>
    ),

    hundred: (
        <g>
            <rect x="34" y="2" width="32" height="23" rx="3" fill="#1F2937" stroke="#111827" strokeWidth="1.2" />
            <rect x="34" y="15.5" width="32" height="8" fill="#FACC15" />
            <text x="50" y="22" textAnchor="middle" fontSize="6.6" fontWeight="800" fill="#1F2937" fontFamily="system-ui, sans-serif">
                100
            </text>
            <ellipse cx="50" cy="25" rx="27" ry="5" fill="#111827" stroke="#000" strokeWidth="1" />
            <path d="M39 6 V12" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.25" />
        </g>
    ),

    /* ----- face ----- */
    explorer: (
        <g>
            <rect x="16" y="43" width="68" height="6" rx="3" fill="#92400E" />
            <circle cx="39" cy="46" r="10" fill="#BAE6FD" fillOpacity="0.55" stroke="#B45309" strokeWidth="3.4" />
            <circle cx="61" cy="46" r="10" fill="#BAE6FD" fillOpacity="0.55" stroke="#B45309" strokeWidth="3.4" />
            <path d="M49 46 H51" stroke="#B45309" strokeWidth="3" />
            <path d="M33 41.5 Q37 38.5 42 40.5" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" opacity="0.85" />
            <path d="M55 41.5 Q59 38.5 64 40.5" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" opacity="0.85" />
        </g>
    ),

    "on-fire": (
        <g>
            <path d="M27 43 L19 40.5 M73 43 L81 40.5" stroke="#111827" strokeWidth="2.6" strokeLinecap="round" />
            <rect x="27" y="39" width="22" height="14.5" rx="6.5" fill="#111827" />
            <rect x="51" y="39" width="22" height="14.5" rx="6.5" fill="#111827" />
            <path d="M48 43.5 H52" stroke="#111827" strokeWidth="3" />
            <path d="M31.5 41 L38.5 41 L33.5 49.5 L30 49.5 Z" fill="#fff" opacity="0.25" />
            <path d="M55.5 41 L62.5 41 L57.5 49.5 L54 49.5 Z" fill="#fff" opacity="0.25" />
            <path d="M30 51 H46 M54 51 H70" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" />
        </g>
    ),

    "never-give-up": (
        <g transform="rotate(-24 66 58)">
            <rect x="55" y="53.5" width="22" height="9" rx="4.5" fill="#FDE4C8" stroke="#D69E6B" strokeWidth="1.2" />
            <rect x="62" y="53.5" width="8" height="9" fill="#F5C9A0" stroke="#D69E6B" strokeWidth="1" />
            <g fill="#D69E6B">
                <circle cx="58.5" cy="56.6" r="0.8" />
                <circle cx="58.5" cy="59.8" r="0.8" />
                <circle cx="73.5" cy="56.6" r="0.8" />
                <circle cx="73.5" cy="59.8" r="0.8" />
                <circle cx="65" cy="56.4" r="0.7" />
                <circle cx="67.4" cy="59.6" r="0.7" />
            </g>
        </g>
    ),

    "star-collector": (
        <g>
            <path d="M26 44 L18 40.5 M74 44 L82 40.5" stroke="#BE185D" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M48 46 H52" stroke="#BE185D" strokeWidth="2.8" />
            <polygon points={starPoints(36, 47.5, 13.5, 6.2)} fill="#F472B6" fillOpacity="0.9" stroke="#BE185D" strokeWidth="2" strokeLinejoin="round" />
            <polygon points={starPoints(64, 47.5, 13.5, 6.2)} fill="#F472B6" fillOpacity="0.9" stroke="#BE185D" strokeWidth="2" strokeLinejoin="round" />
            <circle cx="32" cy="43" r="1.6" fill="#fff" opacity="0.8" />
            <circle cx="60" cy="43" r="1.6" fill="#fff" opacity="0.8" />
        </g>
    ),

    /* ----- neck ----- */
    ten: (
        <g>
            <path d="M27 77 Q50 86 73 77 L50 99 Z" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1.6" strokeLinejoin="round" />
            <g fill="#fff">
                <circle cx="41" cy="84" r="1.8" />
                <circle cx="59" cy="84" r="1.8" />
                <circle cx="50" cy="90.5" r="1.8" />
            </g>
        </g>
    ),

    fifty: (
        <g>
            <path d="M36 77 L50 90 M64 77 L50 90" fill="none" stroke="#2563EB" strokeWidth="6" />
            <circle cx="50" cy="92" r="7.4" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="1.6" />
            <polygon points={starPoints(50, 92, 4.4, 1.9)} fill="#6B7280" />
        </g>
    ),

    perfect: (
        <g>
            <path d="M36 77 L50 90 M64 77 L50 90" fill="none" stroke="#DC2626" strokeWidth="6" />
            <circle cx="50" cy="92" r="7.4" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.6" />
            <text x="50" y="95" textAnchor="middle" fontSize="8.4" fontWeight="800" fill="#92400E" fontFamily="system-ui, sans-serif">
                1
            </text>
        </g>
    ),

    marathon: (
        <g>
            <path d="M25 78 Q50 91 75 78 L74 87 Q50 100 26 87 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M26 82.5 Q50 95.5 74 82.5" fill="none" stroke="#FEE2E2" strokeWidth="2.4" />
            <path d="M60 92 L69 100 L61 100 L55 94 Z" fill="#DC2626" stroke="#B91C1C" strokeWidth="1.2" strokeLinejoin="round" />
        </g>
    ),
};
