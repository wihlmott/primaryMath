import { STICKER_BY_ID } from "../utils/adventure";
import { ITEM_ART } from "./avatarArt";
import { shadowFor } from "./Avatar";

/**
 * A sticker on its own (cropped to the item).
 * `locked` shows a dark silhouette, so children can guess what it is.
 */
export default function StickerIcon({ id, size = 48, locked = false }) {
    const sticker = STICKER_BY_ID[id];
    if (!sticker) return null;

    return (
        <svg
            className={`sticker-icon${locked ? " locked" : ""}`}
            viewBox={sticker.box}
            width={size}
            height={size}
            aria-hidden="true"
            style={{ overflow: "visible", filter: locked ? undefined : shadowFor(size) }}
        >
            {ITEM_ART[id]}
        </svg>
    );
}
