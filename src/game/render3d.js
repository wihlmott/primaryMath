/* Renders the 3D models to pictures.

   One shared WebGL renderer draws every explorer and sticker to an image,
   which is cached. The rest of the app just shows <img>s, so a page can hold
   dozens of explorers without running out of WebGL contexts.
   Everything returns null if WebGL isn't available (callers show a fallback). */

import {
    Box3,
    DirectionalLight,
    HemisphereLight,
    PerspectiveCamera,
    Scene,
    Vector3,
    WebGLRenderer,
} from "three";
import { buildAvatar, buildItem, disposeModel } from "./avatar3d";
import { STICKER_BY_ID } from "../utils/adventure";

const SIZE = 320; // pixels; plenty for the largest picture (about 160 px at 2x)
const DISTANCE = 14; // far away and zoomed in: close to a flat, orthographic look
const TURN = 0.34; // every picture is turned a little, so it reads as 3D

/** Soft front light, a cool rim light behind, and sky/ground fill. */
export function addLights(scene) {
    scene.add(new HemisphereLight("#ffffff", "#c9b8a8", 1.55));
    const key = new DirectionalLight("#ffffff", 1.75);
    key.position.set(-3, 5, 7);
    scene.add(key);
    const rim = new DirectionalLight("#b6d4ff", 0.7);
    rim.position.set(4, 2, -5);
    scene.add(rim);
}

/** Aim a camera at (cx, cy), so that `h` units of height fill the picture. */
export function frameCamera(camera, { cx = 0, cy, h }) {
    camera.fov = (2 * Math.atan(h / 2 / DISTANCE) * 180) / Math.PI;
    camera.position.set(cx, cy, DISTANCE);
    camera.lookAt(cx, cy, 0);
    camera.updateProjectionMatrix();
}

/** A frame that fits around whatever the model is (used for stickers). */
function fitFrame(model) {
    model.updateMatrixWorld(true);
    const box = new Box3().setFromObject(model);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    return { cx: center.x, cy: center.y, h: Math.max(size.x, size.y, 0.9) * 1.16 };
}

/** Where the camera looks for an explorer. */
export const AVATAR_FRAME = { cy: -0.22, h: 4.85 }; // a little headroom for tall hats

let stage = null;
let unavailable = false;

function getStage() {
    if (stage || unavailable) return stage;
    try {
        const canvas = document.createElement("canvas");
        const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
        renderer.setPixelRatio(1);
        renderer.setSize(SIZE, SIZE, false);
        renderer.setClearColor(0x000000, 0);
        const scene = new Scene();
        addLights(scene);
        stage = { renderer, scene, camera: new PerspectiveCamera(20, 1, 0.1, 100) };
    } catch {
        unavailable = true;
        stage = null;
    }
    return stage;
}

export function webglAvailable() {
    return Boolean(getStage());
}

function snapshot(model, frame) {
    const s = getStage();
    if (!s) return null;
    try {
        model.rotation.y = TURN;
        s.scene.add(model);
        frameCamera(s.camera, frame === "fit" ? fitFrame(model) : frame);
        s.renderer.render(s.scene, s.camera);
        return s.renderer.domElement.toDataURL("image/png");
    } catch {
        return null;
    } finally {
        s.scene.remove(model);
        disposeModel(model);
    }
}

/* ---------- cached pictures ---------- */

const cache = new Map();
const MAX_CACHED = 90;

function cached(key, make) {
    if (cache.has(key)) {
        const hit = cache.get(key);
        cache.delete(key); // refresh: most recently used goes last
        cache.set(key, hit);
        return hit;
    }
    const url = make();
    if (url) {
        cache.set(key, url);
        if (cache.size > MAX_CACHED) cache.delete(cache.keys().next().value);
    }
    return url;
}

/** A picture of an explorer wearing `equipped` ({ head, face, neck }). */
export function avatarImage(id, equipped = {}) {
    const key = `a:${id}:${equipped?.head ?? ""}:${equipped?.face ?? ""}:${equipped?.neck ?? ""}`;
    return cached(key, () => snapshot(buildAvatar(id, equipped), AVATAR_FRAME));
}

/** A picture of one sticker on its own. */
export function stickerImage(id) {
    const sticker = STICKER_BY_ID[id];
    if (!sticker) return null;
    return cached(`s:${id}`, () => snapshot(buildItem(id), "fit"));
}
