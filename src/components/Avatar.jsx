import { useMemo } from "react";
import { AVATARS, normalizeAvatar } from "../utils/adventure";
import { avatarImage } from "./render3d";

/** Soft shadow that scales with the picture size. */
export function shadowFor(size) {
    return `drop-shadow(0 ${(size * 0.035).toFixed(1)}px ${(size * 0.045).toFixed(1)}px rgba(0, 0, 0, 0.3))`;
}

/** Shown only if the browser can't do WebGL: a plain head-and-shoulders. */
function Fallback({ id, size, name }) {
    const hue = (AVATARS.findIndex((a) => a.id === id) * 47) % 360;
    return (
        <svg
            className="avatar-img"
            viewBox="0 0 100 100"
            width={size}
            height={size}
            role="img"
            aria-label={name}
            style={{ filter: shadowFor(size) }}
        >
            <path d="M14 100 C14 80 30 74 50 74 C70 74 86 80 86 100 Z" fill={`hsl(${hue} 65% 55%)`} />
            <circle cx="50" cy="46" r="27" fill="#f1c9a1" />
            <circle cx="41" cy="45" r="3.4" fill="#1f2937" />
            <circle cx="59" cy="45" r="3.4" fill="#1f2937" />
            <path d="M42 57 Q50 64 58 57" fill="none" stroke="#5a2a22" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
    );
}

/**
 * An explorer (a 3D character, shoulders up), optionally wearing stickers.
 *   id       explorer id (an old emoji or id also works)
 *   equipped { head, face, neck } sticker ids (or null)
 */
export default function Avatar({ id, equipped, size = 48, className = "" }) {
    const avatarId = normalizeAvatar(id);
    const name = AVATARS.find((a) => a.id === avatarId).name;

    // The picture comes from a cache, so this is only slow the first time
    const src = useMemo(
        () => avatarImage(avatarId, equipped),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [avatarId, equipped?.head, equipped?.face, equipped?.neck],
    );

    if (!src) return <Fallback id={avatarId} size={size} name={name} />;

    return (
        <img
            className={`avatar-img ${className}`.trim()}
            src={src}
            width={size}
            height={size}
            alt={name}
            draggable={false}
            style={{ filter: shadowFor(size) }}
        />
    );
}
