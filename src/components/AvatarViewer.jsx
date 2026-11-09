import { useEffect, useRef, useState } from "react";
import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { AVATARS, normalizeAvatar } from "../utils/adventure";
import { buildAvatar, disposeModel } from "./avatar3d";
import { AVATAR_FRAME, addLights, frameCamera } from "./render3d";
import Avatar, { shadowFor } from "./Avatar";

const TURN = 0.34; // resting angle, like the still pictures

/**
 * A live 3D view of an explorer: it sways gently, and can be dragged to turn
 * (it springs back when let go). Uses its own WebGL context, so use it for one
 * big preview, not in lists. Falls back to the still picture without WebGL.
 */
export default function AvatarViewer({ id, equipped, size = 180 }) {
    const canvasRef = useRef(null);
    const stage = useRef(null); // { scene, model }
    const [failed, setFailed] = useState(false);

    const avatarId = normalizeAvatar(id);
    const name = AVATARS.find((a) => a.id === avatarId).name;

    /* the renderer, the animation loop and the dragging live as long as the component */
    useEffect(() => {
        const canvas = canvasRef.current;
        let renderer;
        try {
            renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
        } catch {
            setFailed(true);
            return undefined;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(size, size, false);
        renderer.setClearColor(0x000000, 0);

        const scene = new Scene();
        addLights(scene);
        const camera = new PerspectiveCamera(20, 1, 0.1, 100);
        frameCamera(camera, AVATAR_FRAME);
        stage.current = { scene, model: null };

        const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        const start = performance.now();
        let dragging = false;
        let lastX = 0;
        let offset = 0; // how far the learner has turned it
        let raf = 0;

        function frame(now) {
            if (!dragging) offset *= 0.93; // spring back
            const sway = reduceMotion || dragging ? 0 : Math.sin((now - start) / 1100) * 0.28;
            const { model } = stage.current;
            if (model) model.rotation.y = TURN + offset + sway;
            renderer.render(scene, camera);
            raf = requestAnimationFrame(frame);
        }
        raf = requestAnimationFrame(frame);

        const down = (e) => {
            dragging = true;
            lastX = e.clientX;
            canvas.setPointerCapture?.(e.pointerId);
        };
        const move = (e) => {
            if (!dragging) return;
            offset += (e.clientX - lastX) * 0.012;
            lastX = e.clientX;
        };
        const up = () => {
            dragging = false;
        };
        canvas.addEventListener("pointerdown", down);
        canvas.addEventListener("pointermove", move);
        canvas.addEventListener("pointerup", up);
        canvas.addEventListener("pointercancel", up);

        return () => {
            cancelAnimationFrame(raf);
            canvas.removeEventListener("pointerdown", down);
            canvas.removeEventListener("pointermove", move);
            canvas.removeEventListener("pointerup", up);
            canvas.removeEventListener("pointercancel", up);
            if (stage.current?.model) disposeModel(stage.current.model);
            stage.current = null;
            renderer.dispose();
            renderer.forceContextLoss();
        };
    }, [size]);

    /* the model is swapped whenever the explorer or what they wear changes */
    useEffect(() => {
        const s = stage.current;
        if (!s) return;
        if (s.model) {
            s.scene.remove(s.model);
            disposeModel(s.model);
        }
        s.model = buildAvatar(avatarId, equipped);
        s.scene.add(s.model);
    }, [avatarId, equipped?.head, equipped?.face, equipped?.neck, size, failed]); // eslint-disable-line react-hooks/exhaustive-deps

    if (failed) return <Avatar id={avatarId} equipped={equipped} size={size} />;

    return (
        <canvas
            ref={canvasRef}
            className="avatar-viewer"
            role="img"
            aria-label={`${name}. Drag to turn.`}
            style={{ width: size, height: size, filter: shadowFor(size) }}
        />
    );
}
