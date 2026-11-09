/* Icons for the game modes: chunky "game button" tiles with a glossy highlight,
   a darker lower edge and a soft shadow, each with a white glyph.
   Drawn on a 64 x 64 grid. No gradients or ids, so any number can share a page. */

const FONT = "system-ui, -apple-system, 'Segoe UI', sans-serif";

/** The tile every icon sits on. */
function Tile({ color, dark, children }) {
    return (
        <g>
            <rect x="3" y="8" width="58" height="53" rx="16" fill={dark} />
            <rect x="3" y="3" width="58" height="53" rx="16" fill={color} />
            {/* gloss */}
            <path d="M9 21 C9 10.5 17 6 32 6 C47 6 55 10.5 55 21 C46 16.5 18 16.5 9 21 Z" fill="#fff" opacity="0.22" />
            {children}
        </g>
    );
}

/** Draws a glyph twice: a soft darker copy underneath, then the white one on top. */
function Glyph({ dark, draw }) {
    return (
        <>
            <g transform="translate(0 2.4)" opacity="0.55">
                {draw(dark)}
            </g>
            {draw("#fff")}
        </>
    );
}

/** A small die. `pips` are [x, y] positions inside the die's own box. */
function Die({ x, y, size, rotate, pips, pipColor }) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    return (
        <g transform={`rotate(${rotate} ${cx} ${cy})`}>
            <rect x={x} y={y + 2.2} width={size} height={size} rx={size * 0.28} fill="#CBD5E1" />
            <rect x={x} y={y} width={size} height={size} rx={size * 0.28} fill="#fff" />
            {pips.map(([px, py], i) => (
                <circle key={i} cx={x + px * size} cy={y + py * size} r={size * 0.1} fill={pipColor} />
            ))}
        </g>
    );
}

const P = {
    add: { color: "#22C55E", dark: "#15803D" },
    sub: { color: "#F97316", dark: "#C2410C" },
    mul: { color: "#8B5CF6", dark: "#6D28D9" },
    mixed: { color: "#3B82F6", dark: "#1D4ED8" },
    missing: { color: "#EC4899", dark: "#BE185D" },
    bonds: { color: "#14B8A6", dark: "#0F766E" },
    compare: { color: "#F59E0B", dark: "#B45309" },
    skip: { color: "#0EA5E9", dark: "#0369A1" },
};

const bar = (f, extra = {}) => <rect x="14" y="25" width="36" height="9" rx="4.5" fill={f} {...extra} />;

const MODE_ART = {
    add: (
        <Tile {...P.add}>
            <Glyph
                dark={P.add.dark}
                draw={(f) => (
                    <>
                        {bar(f)}
                        <rect x="27.5" y="11.5" width="9" height="36" rx="4.5" fill={f} />
                    </>
                )}
            />
        </Tile>
    ),

    sub: (
        <Tile {...P.sub}>
            <Glyph dark={P.sub.dark} draw={(f) => bar(f)} />
        </Tile>
    ),

    mul: (
        <Tile {...P.mul}>
            <Glyph
                dark={P.mul.dark}
                draw={(f) => (
                    <>
                        <g transform="rotate(45 32 29.5)">{bar(f)}</g>
                        <g transform="rotate(-45 32 29.5)">{bar(f)}</g>
                    </>
                )}
            />
        </Tile>
    ),

    mixed: (
        <Tile {...P.mixed}>
            <Die x={30} y={11} size={21} rotate={14} pipColor={P.mixed.color}
                 pips={[[0.28, 0.28], [0.5, 0.5], [0.72, 0.72]]} />
            <Die x={11} y={24} size={27} rotate={-10} pipColor={P.mixed.color}
                 pips={[[0.27, 0.27], [0.73, 0.27], [0.5, 0.5], [0.27, 0.73], [0.73, 0.73]]} />
        </Tile>
    ),

    missing: (
        <Tile {...P.missing}>
            <rect x="12" y="12" width="40" height="35" rx="10" fill="#fff" fillOpacity="0.18"
                  stroke="#fff" strokeWidth="3.4" strokeDasharray="6 4.5" strokeLinecap="round" />
            <Glyph
                dark={P.missing.dark}
                draw={(f) => (
                    <>
                        <path d="M25.5 26 C25.5 20.8 29 19 32.5 19 C36.5 19 39.5 21.6 39.5 25.2 C39.5 28.6 36.2 30 34 32 C32.8 33.1 32.5 34.2 32.5 36.2"
                              fill="none" stroke={f} strokeWidth="4.6" strokeLinecap="round" />
                        <circle cx="32.5" cy="42" r="2.9" fill={f} />
                    </>
                )}
            />
        </Tile>
    ),

    bonds: (
        <Tile {...P.bonds}>
            <g transform="translate(0 2.4)" opacity="0.55" fill={P.bonds.dark} stroke={P.bonds.dark}>
                <path d="M32 24 L19.5 36 M32 24 L44.5 36" strokeWidth="3.6" strokeLinecap="round" />
                <circle cx="32" cy="17" r="8.5" />
                <circle cx="17" cy="43" r="8.5" />
                <circle cx="47" cy="43" r="8.5" />
            </g>
            <path d="M32 24 L19.5 36 M32 24 L44.5 36" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" />
            {[[32, 17], [17, 43], [47, 43]].map(([cx, cy], i) => (
                <g key={i}>
                    <circle cx={cx} cy={cy} r="8.5" fill="#fff" />
                    <circle cx={cx} cy={cy} r="3.4" fill={P.bonds.color} />
                </g>
            ))}
        </Tile>
    ),

    compare: (
        <Tile {...P.compare}>
            <Glyph
                dark={P.compare.dark}
                draw={(f) => (
                    <>
                        {/* stand */}
                        <rect x="29.5" y="19" width="5" height="29" rx="2.5" fill={f} />
                        <rect x="19" y="45.5" width="26" height="6.5" rx="3.25" fill={f} />
                        {/* tilted beam, with its knob */}
                        <line x1="14.3" y1="23.6" x2="49.7" y2="17.4" stroke={f} strokeWidth="5" strokeLinecap="round" />
                        <circle cx="32" cy="20.5" r="4" fill={f} />
                        {/* strings and pans */}
                        <path d="M14.3 23.6 L8 36 M14.3 23.6 L20.6 36 M49.7 17.4 L43.4 29.8 M49.7 17.4 L56 29.8"
                              stroke={f} strokeWidth="2" strokeLinecap="round" fill="none" />
                        <path d="M6.8 36 H21.8 Q21 43 14.3 43 Q7.6 43 6.8 36 Z" fill={f} />
                        <path d="M42.2 29.8 H57.2 Q56.4 36.8 49.7 36.8 Q43 36.8 42.2 29.8 Z" fill={f} />
                    </>
                )}
            />
        </Tile>
    ),

    skip: (
        <Tile {...P.skip}>
            <Glyph
                dark={P.skip.dark}
                draw={(f) => (
                    <>
                        {/* two hops */}
                        <path d="M16 38 Q22.5 14 29.3 31.5 M34 38 Q40.5 14 47.3 31.5"
                              fill="none" stroke={f} strokeWidth="3.2" strokeLinecap="round" />
                        <polygon points="31.5,37.5 32.8,30.4 26,33.1" fill={f} stroke={f} strokeWidth="1.2" strokeLinejoin="round" />
                        <polygon points="49.5,37.5 50.8,30.4 44,33.1" fill={f} stroke={f} strokeWidth="1.2" strokeLinejoin="round" />
                        {/* stepping stones */}
                        {[14, 32, 50].map((cx) => (
                            <ellipse key={cx} cx={cx} cy="46.5" rx="9.5" ry="6.3" fill={f} />
                        ))}
                    </>
                )}
            />
            {[["2", 14], ["4", 32], ["6", 50]].map(([n, cx]) => (
                <text key={n} x={cx} y="49.8" textAnchor="middle" fontSize="9.5" fontWeight="800"
                      fill={P.skip.color} fontFamily={FONT}>
                    {n}
                </text>
            ))}
        </Tile>
    ),
};

export default function ModeIcon({ id, size = 48, className = "" }) {
    const art = MODE_ART[id];
    if (!art) return null;

    return (
        <svg
            className={`mode-icon ${className}`.trim()}
            viewBox="0 0 64 64"
            width={size}
            height={size}
            aria-hidden="true"
            style={{
                overflow: "visible",
                filter: `drop-shadow(0 ${(size * 0.04).toFixed(1)}px ${(size * 0.05).toFixed(1)}px rgba(0, 0, 0, 0.28))`,
            }}
        >
            {art}
        </svg>
    );
}
