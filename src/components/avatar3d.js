/* 3D models for the explorers and their stickers (three.js, all built from
   simple shapes, so there are no model files to load).

   Every explorer shares one layout, so any sticker fits any explorer:
     head   a sphere of radius 1 centred on the origin
     face   looks along +z; eyes at x = +/-0.36, y = 0.08
     neck   below the head; shoulders (torso) start near y = -1.1
   Stickers are built in that same space: hats around y 0.5 - 1.9, face
   items at eye height, neck items around y -1.0 to -2.1. */

import {
    BackSide,
    BoxGeometry,
    CapsuleGeometry,
    CircleGeometry,
    ConeGeometry,
    CylinderGeometry,
    DoubleSide,
    ExtrudeGeometry,
    Group,
    Mesh,
    MeshBasicMaterial,
    MeshStandardMaterial,
    Shape,
    SphereGeometry,
    TorusGeometry,
    Vector3,
} from "three";

const OUTLINE = "#2a1d17";

/* ---------- small helpers ---------- */

const std = (color, extra) =>
    new MeshStandardMaterial({ color, roughness: 0.62, metalness: 0, ...extra });
const flat = (color, extra) => new MeshBasicMaterial({ color, ...extra });

/**
 * A mesh with optional position / rotation / scale, and an optional cartoon
 * outline (a slightly larger copy drawn inside-out behind it).
 */
function part(geometry, material, o = {}) {
    const m = new Mesh(geometry, material);
    if (o.pos) m.position.set(...o.pos);
    if (o.rot) m.rotation.set(...o.rot);
    if (o.scale) m.scale.set(...o.scale);
    if (o.outline) {
        const edge = new Mesh(geometry, new MeshBasicMaterial({ color: OUTLINE, side: BackSide }));
        edge.scale.setScalar(1 + o.outline);
        m.add(edge);
    }
    return m;
}

const ball = (r, color, o) => part(new SphereGeometry(r, 36, 24), std(color, o?.mat), o);

/**
 * Put an object on the surface of the head at (x, y), turned to face outward.
 * `lift` pushes it off the surface (as a fraction of the head radius).
 * Call this BEFORE adding the object to a parent.
 */
function place(obj, x, y, lift = 0) {
    const z = Math.sqrt(Math.max(0, 1 - x * x - y * y));
    const p = new Vector3(x, y, z);
    obj.position.copy(p.clone().multiplyScalar(1 + lift));
    obj.lookAt(p.clone().multiplyScalar(3));
    return obj;
}

/** Same pseudo-random number every time, so models never change between renders. */
const rand = (i) => {
    const s = Math.sin(i * 12.9898) * 43758.5453;
    return s - Math.floor(s);
};

function starShape(outer, inner, points = 5) {
    const s = new Shape();
    for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outer : inner;
        const a = Math.PI / 2 + (i * Math.PI) / points;
        if (i === 0) s.moveTo(r * Math.cos(a), r * Math.sin(a));
        else s.lineTo(r * Math.cos(a), r * Math.sin(a));
    }
    s.closePath();
    return s;
}

function roundedRect(w, h, r) {
    const s = new Shape();
    const x = -w / 2;
    const y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    return s;
}

/** A flat shape with a little bevel, centred on z. */
function slab(shape, depth, bevel = 0.02) {
    const g = new ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: true,
        bevelThickness: bevel,
        bevelSize: bevel,
        bevelSegments: 2,
        curveSegments: 14,
    });
    g.translate(0, 0, -depth / 2);
    return g;
}

/* =========================================================
   Shared body parts
   ========================================================= */

/** Neck and shoulders, cut off by the picture frame. */
function body({ neck, shirt, collar }) {
    const g = new Group();
    g.add(part(new CylinderGeometry(0.3, 0.34, 0.8, 24), std(neck), { pos: [0, -1.15, 0] }));
    g.add(
        part(new SphereGeometry(1, 44, 30), std(shirt), {
            pos: [0, -2.3, 0],
            scale: [1.55, 1.2, 0.95],
            outline: 0.022,
        }),
    );
    g.add(part(new TorusGeometry(0.4, 0.09, 12, 36), std(collar), { pos: [0, -1.17, 0], rot: [Math.PI / 2, 0, 0] }));
    return g;
}

function eyes({ color = "#1b1b22", x = 0.36, y = 0.08, size = 0.115 } = {}) {
    const g = new Group();
    for (const side of [-1, 1]) {
        const eye = new Group();
        eye.add(part(new SphereGeometry(size, 20, 16), flat(color), { scale: [1, 1.3, 0.5] }));
        eye.add(part(new SphereGeometry(size * 0.32, 12, 10), flat("#ffffff"), { pos: [size * 0.38, size * 0.62, size * 0.62] }));
        place(eye, side * x, y, 0.005);
        g.add(eye);
    }
    return g;
}

function smile({ y = -0.34, radius = 0.17, color = "#5a2a22" } = {}) {
    const geo = new TorusGeometry(radius, 0.03, 8, 24, Math.PI);
    geo.rotateZ(Math.PI); // arc opens upwards: a smile
    return place(part(geo, flat(color)), 0, y, 0.01);
}

function cheeks(color = "#ff8fa3", y = -0.16) {
    const g = new Group();
    for (const side of [-1, 1]) {
        g.add(place(part(new CircleGeometry(0.15, 20), flat(color, { transparent: true, opacity: 0.5 })), side * 0.62, y, 0.012));
    }
    return g;
}

function brows(color, y = 0.37) {
    const g = new Group();
    for (const side of [-1, 1]) {
        const b = place(part(new CapsuleGeometry(0.026, 0.2, 4, 8), flat(color)), side * 0.36, y, 0.004);
        b.rotateZ(Math.PI / 2 + side * 0.12);
        g.add(b);
    }
    return g;
}

function ears(skin) {
    const g = new Group();
    for (const side of [-1, 1]) {
        g.add(ball(1, skin, { pos: [side * 0.98, -0.02, 0], scale: [0.2, 0.33, 0.25], outline: 0.07 }));
    }
    return g;
}

/** A bowl of hair over the top and back of the head. */
function hairCap(color, { thetaLen = 1.55, tilt = -0.45, r = 1.06, outline = 0.025 } = {}) {
    const geo = new SphereGeometry(r, 44, 28, 0, Math.PI * 2, 0, thetaLen);
    const m = part(geo, std(color, { side: DoubleSide }), { rot: [tilt, 0, 0] });
    const edge = new Mesh(geo, new MeshBasicMaterial({ color: OUTLINE, side: BackSide }));
    edge.scale.setScalar(1 + outline);
    m.add(edge);
    return m;
}

/* =========================================================
   Explorers (shoulders up)
   ---------------------------------------------------------
   Each explorer is a `body` (neck and shoulders) plus a `head` that can
   turn on its own, pivoting at the neck. `headRig()` makes the pivot: parts
   are modelled in the normal avatar space and added to `holder`, which sits
   inside `head` at an equal and opposite offset, so nothing moves until the
   head is turned.
   ========================================================= */

const NECK_Y = -0.9;

function headRig() {
    const head = new Group();
    head.position.y = NECK_Y;
    const holder = new Group();
    holder.position.y = -NECK_Y;
    head.add(holder);
    return { head, holder };
}

function human({ skin, shirt, collar, hair }) {
    const g = new Group();
    const torso = body({ neck: skin, shirt, collar });
    const rig = headRig();
    g.add(torso);
    rig.holder.add(ball(1, skin, { outline: 0.03 }));
    rig.holder.add(ears(skin));
    rig.holder.add(cheeks());
    rig.holder.add(eyes());
    rig.holder.add(place(ball(0.075, skin, { mat: { color: "#e0a07a" } }), 0, -0.1, 0.03));
    rig.holder.add(smile());
    hair(rig.holder);
    g.add(rig.head);
    g.userData = { body: torso, head: rig.head, headHolder: rig.holder };
    return g;
}

const LEO = () =>
    human({
        skin: "#f2c9a1",
        shirt: "#3b82f6",
        collar: "#bfdbfe",
        hair: (g) => {
            g.add(brows("#4a2c14"));
            g.add(hairCap("#6b3f1d", { thetaLen: 1.4, tilt: -0.42, r: 1.03 }));
            // curls
            const curls = new Group();
            const n = 28;
            for (let i = 0; i < n; i++) {
                const t = (i + 0.5) / n;
                const theta = Math.acos(1 - t * (1 - Math.cos(1.22)));
                const phi = i * 2.399963;
                const r = 0.97;
                curls.add(
                    ball(0.25 + 0.06 * rand(i), "#6b3f1d", {
                        pos: [r * Math.sin(theta) * Math.cos(phi), r * Math.cos(theta), r * Math.sin(theta) * Math.sin(phi)],
                        outline: 0.07,
                    }),
                );
            }
            curls.rotation.x = -0.4;
            g.add(curls);
        },
    });

const MIA = () =>
    human({
        skin: "#f9dcc4",
        shirt: "#8b5cf6",
        collar: "#ddd6fe",
        hair: (g) => {
            const hair = "#7a3b24";
            g.add(brows("#5a2a18", 0.4));
            g.add(hairCap(hair, { thetaLen: 1.7, tilt: -0.55, r: 1.07 }));
            // fuller hair behind and beside the head
            g.add(ball(1, hair, { pos: [0, -0.2, -0.3], scale: [1.1, 1.12, 0.85], outline: 0.025 }));
            // side-swept fringe
            g.add(ball(1, hair, { pos: [-0.16, 0.7, 0.7], scale: [0.62, 0.17, 0.3], rot: [-0.55, 0, 0.28], outline: 0.07 }));
            g.add(ball(1, hair, { pos: [0.34, 0.68, 0.72], scale: [0.4, 0.15, 0.26], rot: [-0.55, 0, -0.2], outline: 0.07 }));
            // two braids over the shoulders, tied with pink bows
            for (const side of [-1, 1]) {
                const radii = [0.27, 0.25, 0.23, 0.2, 0.17];
                radii.forEach((r, i) => {
                    g.add(ball(r, hair, { pos: [side * (0.9 + i * 0.03), -0.4 - i * 0.36, 0.28 + i * 0.12], outline: 0.07 }));
                });
                g.add(ball(0.13, "#ec4899", { pos: [side * 0.99, -2.12, 0.78], outline: 0.1 }));
            }
        },
    });

const MAX = () =>
    human({
        skin: "#8d5a37",
        shirt: "#f97316",
        collar: "#fed7aa",
        hair: (g) => {
            const hair = "#15141a";
            g.add(brows("#15141a"));
            g.add(hairCap(hair, { thetaLen: 1.42, tilt: -0.5, r: 1.04 }));
            // quiff
            g.add(ball(1, hair, { pos: [0.1, 0.98, 0.35], scale: [0.62, 0.3, 0.5], rot: [-0.5, 0, -0.2], outline: 0.05 }));
        },
    });

const ZOE = () =>
    human({
        skin: "#b9794b",
        shirt: "#facc15",
        collar: "#fef08a",
        hair: (g) => {
            const hair = "#1a1215";
            g.add(brows("#1a1215", 0.38));
            g.add(hairCap(hair, { thetaLen: 1.5, tilt: -0.5, r: 1.05 }));
            // two puffs
            for (const side of [-1, 1]) {
                g.add(ball(0.52, hair, { pos: [side * 0.8, 0.86, -0.02], outline: 0.06 }));
                g.add(part(new TorusGeometry(0.32, 0.08, 10, 24), std("#ec4899"), { pos: [side * 0.64, 0.58, 0], rot: [0.2, side * 0.6, side * 0.9] }));
            }
        },
    });

function animal({ fur, shirt, collar, build }) {
    const g = new Group();
    const torso = body({ neck: fur, shirt, collar });
    const rig = headRig();
    g.add(torso);
    rig.holder.add(ball(1, fur, { outline: 0.03 }));
    build(rig.holder);
    g.add(rig.head);
    g.userData = { body: torso, head: rig.head, headHolder: rig.holder };
    return g;
}

const FOX = () =>
    animal({
        fur: "#f2872a",
        shirt: "#3b82f6",
        collar: "#e0f2fe",
        build: (g) => {
            for (const side of [-1, 1]) {
                // ears
                const ear = part(new ConeGeometry(0.42, 0.95, 24), std("#f2872a"), { pos: [side * 0.62, 0.9, 0.04], rot: [0, 0, -side * 0.36], outline: 0.05 });
                ear.add(part(new ConeGeometry(0.28, 0.7, 20), std("#5a2a12"), { pos: [0, -0.06, 0.1] }));
                g.add(ear);
                // cheek fur
                g.add(part(new ConeGeometry(0.2, 0.46, 20), std("#fff7ed"), { pos: [side * 0.78, -0.42, 0.42], rot: [0.2, 0, -side * 2.5], outline: 0.06 }));
            }
            g.add(ball(1, "#fff7ed", { pos: [0, -0.3, 0.74], scale: [0.5, 0.36, 0.52], outline: 0.05 }));
            g.add(eyes({ y: 0.12, x: 0.38 }));
            g.add(ball(0.1, "#1b1b22", { pos: [0, -0.12, 1.24], scale: [1.2, 0.9, 1] }));
            const m = part(new TorusGeometry(0.1, 0.025, 8, 16, Math.PI), flat("#5a2a22"), { pos: [0, -0.4, 1.17] });
            m.geometry.rotateZ(Math.PI);
            g.add(m);
        },
    });

const PANDA = () =>
    animal({
        fur: "#f6f6f6",
        shirt: "#22c55e",
        collar: "#dcfce7",
        build: (g) => {
            for (const side of [-1, 1]) {
                g.add(ball(0.34, "#1f1f26", { pos: [side * 0.78, 0.78, -0.05], outline: 0.06 }));
                // eye patch with a white eye on it
                const patch = place(part(new SphereGeometry(1, 24, 18), std("#1f1f26"), { scale: [0.17, 0.25, 0.08] }), side * 0.36, 0.06, 0.005);
                patch.rotateZ(side * 0.45);
                g.add(patch);
                const eye = new Group();
                eye.add(ball(0.085, "#ffffff", { scale: [1, 1.15, 0.5] }));
                eye.add(part(new SphereGeometry(0.05, 12, 10), flat("#1b1b22"), { pos: [0, 0, 0.03] }));
                place(eye, side * 0.37, 0.07, 0.04);
                g.add(eye);
            }
            g.add(place(ball(1, "#1f1f26", { scale: [0.14, 0.095, 0.08] }), 0, -0.14, 0.03));
            g.add(smile({ y: -0.36, radius: 0.15, color: "#1f1f26" }));
            g.add(cheeks("#ff9aa8", -0.2));
        },
    });

const CAT = () =>
    animal({
        fur: "#a3a9b5",
        shirt: "#a855f7",
        collar: "#f3e8ff",
        build: (g) => {
            for (const side of [-1, 1]) {
                const ear = part(new ConeGeometry(0.4, 0.8, 4), std("#a3a9b5"), { pos: [side * 0.62, 0.86, 0.02], rot: [0, Math.PI / 4, -side * 0.32], outline: 0.05 });
                ear.add(part(new ConeGeometry(0.25, 0.55, 4), std("#ffb3c1"), { pos: [0, -0.07, 0.1] }));
                g.add(ear);
                // whiskers
                for (let i = 0; i < 3; i++) {
                    const w = part(new CylinderGeometry(0.008, 0.008, 0.62, 6), std("#f5f5f5"), {
                        pos: [side * 0.82, -0.2 - i * 0.07, 0.62],
                        rot: [0, 0, Math.PI / 2 + side * (i - 1) * -0.18],
                    });
                    g.add(w);
                }
            }
            // forehead stripes
            [[0, 0.8, 0.58, 0], [-0.2, 0.76, 0.6, 0.3], [0.2, 0.76, 0.6, -0.3]].forEach(([x, y, z, rz]) => {
                g.add(part(new SphereGeometry(1, 12, 10), std("#6b7280"), { pos: [x, y, z], scale: [0.05, 0.18, 0.04], rot: [-0.7, 0, rz] }));
            });
            g.add(ball(1, "#eef0f4", { pos: [0, -0.3, 0.72], scale: [0.42, 0.3, 0.42], outline: 0.05 }));
            g.add(eyes({ y: 0.1, x: 0.38, color: "#1b1b22" }));
            g.add(ball(0.075, "#ff8fa3", { pos: [0, -0.16, 1.1], scale: [1.2, 0.9, 0.9] }));
            const m = part(new TorusGeometry(0.1, 0.025, 8, 16, Math.PI), flat("#5a2a22"), { pos: [0, -0.4, 1.06] });
            m.geometry.rotateZ(Math.PI);
            g.add(m);
        },
    });

const BUNNY = () =>
    animal({
        fur: "#e2c3a0",
        shirt: "#ef4444",
        collar: "#fee2e2",
        build: (g) => {
            for (const side of [-1, 1]) {
                // floppy ears hanging beside the face
                const ear = part(new CapsuleGeometry(0.23, 0.85, 8, 18), std("#e2c3a0"), { pos: [side * 1.0, 0.28, -0.04], rot: [0, 0, side * 0.36], outline: 0.05 });
                ear.add(part(new CapsuleGeometry(0.13, 0.62, 6, 14), std("#ffc2cf"), { pos: [0, 0, 0.1] }));
                g.add(ear);
            }
            g.add(ball(1, "#fff4e8", { pos: [0, -0.3, 0.7], scale: [0.46, 0.34, 0.46], outline: 0.05 }));
            g.add(eyes({ y: 0.1, x: 0.37 }));
            g.add(cheeks("#ff9aa8", -0.18));
            g.add(ball(0.08, "#ff8fa3", { pos: [0, -0.14, 1.12], scale: [1.2, 0.9, 0.9] }));
            g.add(part(new BoxGeometry(0.11, 0.13, 0.03), std("#ffffff"), { pos: [0, -0.5, 1.07], outline: 0.08 }));
            const m = part(new TorusGeometry(0.1, 0.025, 8, 16, Math.PI), flat("#5a2a22"), { pos: [0, -0.4, 1.1] });
            m.geometry.rotateZ(Math.PI);
            g.add(m);
        },
    });

const EXPLORERS = { leo: LEO, mia: MIA, max: MAX, zoe: ZOE, fox: FOX, panda: PANDA, cat: CAT, bunny: BUNNY };

/* =========================================================
   Stickers (wearable)
   ========================================================= */

const GOLD = "#f5c518";

function ribbonBetween(a, b, color, width = 0.17) {
  const from = new Vector3(...a);
  const to = new Vector3(...b);
  const len = from.distanceTo(to);
  const m = part(new BoxGeometry(width, 0.035, len), std(color));
  m.position.copy(from.clone().add(to).multiplyScalar(0.5));
  m.lookAt(to);
  return m;
}

/** shades / star shades: two lenses, a bridge and two short arms */
function eyewear({ lens, bridge = "#111827", arms = "#111827" }) {
    const g = new Group();
    for (const side of [-1, 1]) {
        const l = place(lens(), side * 0.37, 0.08, 0.075);
        g.add(l);
        g.add(part(new BoxGeometry(0.5, 0.05, 0.05), std(arms), { pos: [side * 0.82, 0.14, 0.58], rot: [0, side * 1.0, 0] }));
    }
    g.add(part(new BoxGeometry(0.2, 0.06, 0.06), std(bridge), { pos: [0, 0.12, 1.0] }));
    return g;
}

const ITEMS = {
    /* ----- head ----- */
    "first-steps": () => {
        const g = new Group();
        g.add(part(new CylinderGeometry(0.045, 0.06, 0.55, 12), std("#3f8f3a"), { pos: [0, 1.28, 0] }));
        g.add(part(new SphereGeometry(1, 20, 14), std("#4ade80"), { pos: [-0.27, 1.58, 0], scale: [0.34, 0.075, 0.18], rot: [0, 0, 0.5], outline: 0.08 }));
        g.add(part(new SphereGeometry(1, 20, 14), std("#22c55e"), { pos: [0.27, 1.58, 0], scale: [0.34, 0.075, 0.18], rot: [0, 0, -0.5], outline: 0.08 }));
        return g;
    },

    climber: () => {
        const g = new Group();
        g.add(part(new SphereGeometry(1.17, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), std("#fb923c"), { pos: [0, 0.5, 0], scale: [1, 0.96, 1.04], rot: [-0.12, 0, 0], outline: 0.025 }));
        g.add(part(new CylinderGeometry(1.27, 1.27, 0.12, 40), std("#ea580c"), { pos: [0, 0.5, 0.02], rot: [-0.12, 0, 0], outline: 0.03 }));
        g.add(part(new TorusGeometry(1.19, 0.055, 8, 48, Math.PI), std("#ea580c"), { pos: [0, 0.5, 0], rot: [-0.12, Math.PI / 2, 0], scale: [1.04, 0.96, 1] }));
        const lamp = part(new CylinderGeometry(0.21, 0.24, 0.2, 24), std("#fef08a", { emissive: "#fde047", emissiveIntensity: 0.45 }), { pos: [0, 0.9, 1.1], rot: [Math.PI / 2 - 0.2, 0, 0], outline: 0.08 });
        g.add(lamp);
        return g;
    },

    summit: () => {
        const g = new Group();
        const gold = std(GOLD, { metalness: 0.25, roughness: 0.35 });
        g.add(part(new CylinderGeometry(0.74, 0.8, 0.34, 40, 1, true), (() => { const m = gold.clone(); m.side = DoubleSide; return m; })(), { pos: [0, 1.0, 0.02], rot: [-0.14, 0, 0], outline: 0.03 }));
        g.add(part(new TorusGeometry(0.77, 0.045, 10, 40), gold, { pos: [0, 0.84, 0.02], rot: [Math.PI / 2 - 0.14, 0, 0] }));
        const gems = ["#ef4444", "#3b82f6", "#22c55e", "#3b82f6", "#ef4444"];
        for (let i = 0; i < 5; i++) {
            const x = 0.76 * Math.sin((i - 2) * 0.6);
            const z = 0.76 * Math.cos((i - 2) * 0.6);
            const tip = part(new ConeGeometry(0.17, 0.5, 4), gold, { pos: [x, 1.4, z * 0.95], outline: 0.06 });
            g.add(tip);
            g.add(ball(0.065, gems[i], { pos: [x, 1.68, z * 0.95] }));
        }
        return g;
    },

    hundred: () => {
        const g = new Group();
        g.add(part(new CylinderGeometry(0.64, 0.66, 0.9, 36), std("#1f2937"), { pos: [0, 1.3, -0.02], rot: [-0.1, 0, 0], outline: 0.03 }));
        g.add(part(new CylinderGeometry(0.69, 0.69, 0.2, 36), std(GOLD, { metalness: 0.2, roughness: 0.4 }), { pos: [0, 0.97, -0.01], rot: [-0.1, 0, 0] }));
        g.add(part(new CylinderGeometry(1.1, 1.1, 0.09, 40), std("#111827"), { pos: [0, 0.82, 0.02], rot: [-0.1, 0, 0], outline: 0.03 }));
        return g;
    },

    /* ----- face ----- */
    explorer: () => {
        const g = new Group();
        const strap = part(new TorusGeometry(1.03, 0.07, 10, 56), std("#92400e"), { pos: [0, 0.08, 0], rot: [Math.PI / 2, 0, 0] });
        g.add(strap);
        for (const side of [-1, 1]) {
            const rim = place(part(new TorusGeometry(0.27, 0.065, 12, 30), std("#b45309", { metalness: 0.2 }), { outline: 0.1 }), side * 0.37, 0.08, 0.07);
            const lens = place(part(new CircleGeometry(0.26, 28), std("#bae6fd", { transparent: true, opacity: 0.45 })), side * 0.37, 0.08, 0.066);
            g.add(rim);
            g.add(lens);
        }
        g.add(part(new BoxGeometry(0.16, 0.07, 0.07), std("#b45309"), { pos: [0, 0.1, 1.0] }));
        return g;
    },

    "on-fire": () =>
        eyewear({
            lens: () => {
                const lens = part(slab(roundedRect(0.62, 0.42, 0.14), 0.08), std("#111827", { roughness: 0.25 }), { outline: 0.04 });
                lens.add(part(new BoxGeometry(0.4, 0.045, 0.02), flat("#f97316"), { pos: [0, -0.12, 0.06] }));
                lens.add(part(new BoxGeometry(0.07, 0.3, 0.02), flat("#ffffff", { transparent: true, opacity: 0.3 }), { pos: [-0.16, 0.02, 0.062], rot: [0, 0, 0.5] }));
                return lens;
            },
        }),

    "never-give-up": () => {
        const g = new Group();
        const strip = place(part(new BoxGeometry(0.66, 0.24, 0.045), std("#f6d2a8"), { outline: 0.07 }), 0.6, -0.2, 0.02);
        strip.rotateZ(-0.5);
        strip.add(part(new BoxGeometry(0.24, 0.24, 0.055), std("#e8b27f"), { pos: [0, 0, 0.012] }));
        [-0.27, 0.27].forEach((x) => [-0.05, 0.05].forEach((y) => strip.add(part(new SphereGeometry(0.018, 8, 6), flat("#d49a68"), { pos: [x, y, 0.03] }))));
        g.add(strip);
        return g;
    },

    "star-collector": () =>
        eyewear({
            bridge: "#be185d",
            arms: "#be185d",
            lens: () => part(slab(starShape(0.4, 0.18), 0.07), std("#f472b6", { roughness: 0.35, transparent: true, opacity: 0.93 }), { outline: 0.04 }),
        }),

    /* ----- neck ----- */
    ten: () => {
        const g = new Group();
        g.add(part(new TorusGeometry(0.47, 0.1, 12, 36), std("#3b82f6"), { pos: [0, -1.2, 0], rot: [Math.PI / 2, 0, 0], outline: 0.06 }));
        const tri = new Shape();
        tri.moveTo(-0.66, 0);
        tri.lineTo(0.66, 0);
        tri.lineTo(0, -0.95);
        tri.closePath();
        const cloth = part(slab(tri, 0.06, 0.03), std("#3b82f6"), { pos: [0, -1.2, 0.45], rot: [-0.62, 0, 0], outline: 0.04 });
        [[-0.3, -0.2], [0.3, -0.2], [0, -0.46], [-0.12, -0.7], [0.12, -0.7]].forEach(([x, y]) => {
            cloth.add(part(new SphereGeometry(0.055, 10, 8), flat("#ffffff"), { pos: [x, y, 0.06] }));
        });
        g.add(cloth);
        return g;
    },

    fifty: () => medal("#2563eb", "#d4d4d8"),
    perfect: () => medal("#dc2626", GOLD),

    marathon: () => {
        const g = new Group();
        for (let i = 0; i < 5; i++) {
            g.add(part(new CylinderGeometry(0.78, 0.8, 0.105, 36), std(i % 2 ? "#fff5f5" : "#ef4444"), { pos: [0, -1.04 - i * 0.1, 0], scale: [1, 1, 0.66] }));
        }
        const tail = part(new BoxGeometry(0.3, 0.85, 0.1), std("#ef4444"), { pos: [0.5, -1.95, 0.52], rot: [-0.18, 0, -0.08], outline: 0.04 });
        [-0.18, 0.05, 0.28].forEach((y) => tail.add(part(new BoxGeometry(0.31, 0.07, 0.105), std("#fff5f5"), { pos: [0, y, 0] })));
        g.add(tail);
        return g;
    },
};

function medal(ribbon, metal) {
    const g = new Group();
    g.add(ribbonBetween([-0.42, -1.18, 0.34], [0, -1.98, 0.9], ribbon));
    g.add(ribbonBetween([0.42, -1.18, 0.34], [0, -1.98, 0.9], ribbon));
    const disc = part(new CylinderGeometry(0.31, 0.31, 0.07, 36), std(metal, { metalness: 0.25, roughness: 0.32 }), { pos: [0, -2.05, 0.95], rot: [Math.PI / 2 + 0.38, 0, 0], outline: 0.07 });
    disc.add(part(slab(starShape(0.19, 0.085), 0.03, 0.01), std(metal === GOLD ? "#b8860b" : "#94a3b8", { metalness: 0.2 }), { pos: [0, 0.045, 0], rot: [-Math.PI / 2, 0, 0] }));
    g.add(disc);
    return g;
}

/* =========================================================
   Public API
   ========================================================= */

export const SLOT_ORDER = ["neck", "face", "head"]; // back to front

export function buildItem(id) {
    return ITEMS[id] ? ITEMS[id]() : new Group();
}

/**
 * An explorer, wearing the stickers in `equipped` ({ head, face, neck }).
 * Head and face stickers turn with the head; neck stickers stay on the shoulders.
 */
export function buildAvatar(id, equipped = {}) {
    const root = new Group();
    const explorer = (EXPLORERS[id] ?? EXPLORERS.fox)();
    root.add(explorer);

    const { body: torso, headHolder } = explorer.userData;
    for (const slot of SLOT_ORDER) {
        const stickerId = equipped?.[slot];
        if (stickerId) (slot === "neck" ? torso : headHolder).add(buildItem(stickerId));
    }

    root.userData = explorer.userData; // { body, head, headHolder }
    return root;
}

/** How far an explorer can look, in radians. */
export const LOOK_LIMITS = { yaw: 1.1, pitch: 0.45 };

/**
 * Make an explorer look somewhere.
 *   yaw    left / right (negative = viewer's left); 0 looks straight at the camera
 *   pitch  up / down    (negative = up)
 *   baseTurn  how far the whole model is already turned, so yaw stays relative to the camera
 * The shoulders follow a little, like a real turn.
 */
export function setLook(model, yaw, pitch, baseTurn = 0) {
    const { head, body: torso } = model.userData;
    if (!head) return;
    head.rotation.set(pitch, yaw - baseTurn, 0, "YXZ");
    torso.rotation.y = yaw * 0.22;
}

/** Free the GPU memory of a model that is no longer needed. */
export function disposeModel(root) {
    root.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
    });
}
