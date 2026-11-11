import { useEffect, useRef, useState } from "react";
import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { AVATARS, normalizeAvatar } from "../utils/adventure";
import { LOOK_LIMITS, buildAvatar, disposeModel, setLook } from "./avatar3d";
import { AVATAR_FRAME, addLights, frameCamera } from "./render3d";
import Avatar, { shadowFor } from "./Avatar";

const BASE_TURN = 0.3; // the body sits at a slight angle, which shows off the 3D
const clamp = (v, limit) => Math.max(-limit, Math.min(limit, v));

/**
 * A live 3D explorer that looks where you drag.
 *  - drag left / right / up / down: the head turns to look that way (the
 *    shoulders follow a little) and STAYS looking there
 *  - double-tap, or press Home: look straight at you again
 *  - arrow keys work too, when it is focused
 * Uses its own WebGL context, so use it for one big preview, not in lists.
 * Falls back to the still picture when WebGL isn't available.
 */
export default function AvatarViewer({ id, equipped, size = 180 }) {
    const canvasRef = useRef(null);
    const stage = useRef(null); // { scene, model }
    const gaze = useRef({ yaw: 0, pitch: 0, targetYaw: 0, targetPitch: 0 });
    const [failed, setFailed] = useState(false);

    const avatarId = normalizeAvatar(id);
    const name = AVATARS.find((a) => a.id === avatarId).name;

    /* the renderer, the animation loop and the pointer handling live as long as the component */
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
        let raf = 0;

        function frame(now) {
            const g = gaze.current;
            // ease towards where the learner pointed, so turns feel smooth
            g.yaw += (g.targetYaw - g.yaw) * 0.2;
            g.pitch += (g.targetPitch - g.pitch) * 0.2;
            // a tiny idle sway so it feels alive (the gaze itself never drifts)
            const sway = reduceMotion ? 0 : Math.sin((now - start) / 1500) * 0.05;
            const { model } = stage.current;
            if (model) setLook(model, g.yaw + sway, g.pitch, BASE_TURN);
            renderer.render(scene, camera);
            raf = requestAnimationFrame(frame);
        }
        raf = requestAnimationFrame(frame);

        /* dragging */
        let dragging = false;
        let lastX = 0;
        let lastY = 0;
        let moved = 0;
        let lastTap = 0;

        const lookAtMe = () => {
            gaze.current.targetYaw = 0;
            gaze.current.targetPitch = 0;
        };
        const down = (e) => {
            dragging = true;
            moved = 0;
            lastX = e.clientX;
            lastY = e.clientY;
            canvas.setPointerCapture?.(e.pointerId);
        };
        const move = (e) => {
            if (!dragging) return;
            const dx = e.clientX - lastX;
            const dy = e.clientY - lastY;
            lastX = e.clientX;
            lastY = e.clientY;
            moved += Math.abs(dx) + Math.abs(dy);
            const g = gaze.current;
            g.targetYaw = clamp(g.targetYaw + dx * 0.014, LOOK_LIMITS.yaw);
            g.targetPitch = clamp(g.targetPitch + dy * 0.012, LOOK_LIMITS.pitch);
        };
        const up = () => {
            if (dragging && moved < 8) {
                // a tap: two quick taps make it look straight at you again
                const now = performance.now();
                if (now - lastTap < 400) lookAtMe();
                lastTap = now;
            }
            dragging = false;
        };
        const key = (e) => {
            const g = gaze.current;
            if (e.key === "ArrowLeft") g.targetYaw = clamp(g.targetYaw - 0.25, LOOK_LIMITS.yaw);
            else if (e.key === "ArrowRight") g.targetYaw = clamp(g.targetYaw + 0.25, LOOK_LIMITS.yaw);
            else if (e.key === "ArrowUp") g.targetPitch = clamp(g.targetPitch - 0.15, LOOK_LIMITS.pitch);
            else if (e.key === "ArrowDown") g.targetPitch = clamp(g.targetPitch + 0.15, LOOK_LIMITS.pitch);
            else if (e.key === "Home") lookAtMe();
            else return;
            e.preventDefault();
        };
        canvas.addEventListener("pointerdown", down);
        canvas.addEventListener("pointermove", move);
        canvas.addEventListener("pointerup", up);
        canvas.addEventListener("pointercancel", up);
        canvas.addEventListener("dblclick", lookAtMe);
        canvas.addEventListener("keydown", key);

        return () => {
            cancelAnimationFrame(raf);
            canvas.removeEventListener("pointerdown", down);
            canvas.removeEventListener("pointermove", move);
            canvas.removeEventListener("pointerup", up);
            canvas.removeEventListener("pointercancel", up);
            canvas.removeEventListener("dblclick", lookAtMe);
            canvas.removeEventListener("keydown", key);
            if (stage.current?.model) disposeModel(stage.current.model);
            stage.current = null;
            renderer.dispose();
            renderer.forceContextLoss();
        };
    }, [size]);

    /* the model is swapped whenever the explorer or what they wear changes; where it looks is kept */
    useEffect(() => {
        const s = stage.current;
        if (!s) return;
        if (s.model) {
            s.scene.remove(s.model);
            disposeModel(s.model);
        }
        s.model = buildAvatar(avatarId, equipped);
        s.model.rotation.y = BASE_TURN;
        s.scene.add(s.model);
    }, [avatarId, equipped?.head, equipped?.face, equipped?.neck, size, failed]); // eslint-disable-line react-hooks/exhaustive-deps

    if (failed) return <Avatar id={avatarId} equipped={equipped} size={size} />;

    return (
        <canvas
            ref={canvasRef}
            className="avatar-viewer"
            tabIndex={0}
            role="img"
            aria-label={`${name}. Drag, or use the arrow keys, to make them look around. Home looks at you.`}
            style={{ width: size, height: size, filter: shadowFor(size) }}
        />
    );
}
