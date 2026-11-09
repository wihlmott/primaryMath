import { useMemo } from "react";
import { STICKER_BY_ID } from "../utils/adventure";
import { stickerImage } from "./render3d";
import { shadowFor } from "./Avatar";

/**
 * A sticker on its own (a 3D picture of the item).
 * `locked` shows a dark silhouette, so children can guess what it is.
 */
export default function StickerIcon({ id, size = 48, locked = false }) {
    const sticker = STICKER_BY_ID[id];
    const src = useMemo(() => stickerImage(id), [id]);
    if (!sticker) return null;

    if (!src) {
        // no WebGL: a plain badge
        return (
            <span
                className={`sticker-icon sticker-fallback${locked ? " locked" : ""}`}
                style={{ width: size, height: size, fontSize: size * 0.5 }}
                aria-hidden="true"
            >
                ★
            </span>
        );
    }

    return (
        <img
            className={`sticker-icon${locked ? " locked" : ""}`}
            src={src}
            width={size}
            height={size}
            alt=""
            aria-hidden="true"
            draggable={false}
            style={locked ? undefined : { filter: shadowFor(size) }}
        />
    );
}
