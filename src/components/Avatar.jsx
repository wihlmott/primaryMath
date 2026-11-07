import { AVATARS, normalizeAvatar } from "../utils/adventure";
import { AVATAR_ART, ITEM_ART } from "./avatarArt";

// Back to front: neck items sit over the shoulders, hats go on last
const DRAW_ORDER = ["neck", "face", "head"];

/** Soft shadow that scales with the icon size. */
export function shadowFor(size) {
    return `drop-shadow(0 ${(size * 0.035).toFixed(1)}px ${(size * 0.045).toFixed(1)}px rgba(0, 0, 0, 0.3))`;
}

/**
 * An explorer, optionally wearing stickers.
 *   id       avatar id (an old emoji also works)
 *   equipped { head, face, neck } sticker ids (or null)
 */
export default function Avatar({ id, equipped, size = 48, className = "" }) {
    const avatarId = normalizeAvatar(id);
    const name = AVATARS.find((a) => a.id === avatarId).name;

    return (
        <svg
            className={`avatar-svg ${className}`.trim()}
            viewBox="0 0 100 100"
            width={size}
            height={size}
            role="img"
            aria-label={name}
            style={{ overflow: "visible", filter: shadowFor(size) }}
        >
            {AVATAR_ART[avatarId]}
            {DRAW_ORDER.map((slot) => {
                const stickerId = equipped?.[slot];
                return stickerId && ITEM_ART[stickerId] ? (
                    <g key={slot}>{ITEM_ART[stickerId]}</g>
                ) : null;
            })}
        </svg>
    );
}
