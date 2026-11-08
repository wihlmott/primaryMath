/* Saved progress (browser localStorage; nothing leaves the device).
   Falls back to in-memory storage if localStorage is unavailable. */

import { MODES, STICKERS, STICKER_BY_ID, normalizeAvatar } from "./adventure";

const KEY = "mathAdventure.v1";
let memoryStore = null; // used when localStorage can't be read or written

function emptyStore() {
    return { version: 1, lastSettings: null, learners: {} };
}

function readStore() {
    try {
        const raw = window.localStorage.getItem(KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === "object" && parsed.learners) {
                return parsed;
            }
        }
    } catch {
        /* unavailable or corrupt: fall through */
    }
    return memoryStore ?? emptyStore();
}

function writeStore(store) {
    memoryStore = store;
    try {
        window.localStorage.setItem(KEY, JSON.stringify(store));
    } catch {
        /* ignore: memoryStore still holds it for this session */
    }
}

const keyFor = (name) => name.trim().toLowerCase();

const NOTHING_WORN = { head: null, face: null, neck: null };

/** Only keep worn items that exist, fit their slot and are actually owned. */
function cleanEquipped(equipped, owned) {
    const out = { ...NOTHING_WORN };
    for (const slot of Object.keys(out)) {
        const sticker = STICKER_BY_ID[equipped?.[slot]];
        if (sticker && sticker.slot === slot && owned[sticker.id]) {
            out[slot] = sticker.id;
        }
    }
    return out;
}

export function blankLearner(name, avatar) {
    return {
        name,
        avatar: normalizeAvatar(avatar),
        lastPlayed: 0,
        totalSolved: 0,
        roundsPlayed: 0,
        totalStars: 0,
        perfectRounds: 0,
        retriesFixed: 0,
        bestCleanStreak: 0,
        bestRun: 0,
        bestLevel: Object.fromEntries(MODES.map((m) => [m.id, 1])),
        solvedByOp: {},
        stickers: {},
        equipped: { ...NOTHING_WORN },
    };
}

/** A saved learner, or null. */
export function getLearner(name) {
    if (!name || !name.trim()) return null;
    const saved = readStore().learners[keyFor(name)];
    if (!saved) return null;
    const blank = blankLearner(saved.name, saved.avatar);
    const stickers = { ...saved.stickers };
    return {
        ...blank,
        ...saved,
        avatar: blank.avatar, // migrates old emoji avatars
        bestLevel: { ...blank.bestLevel, ...saved.bestLevel },
        solvedByOp: { ...saved.solvedByOp },
        stickers,
        equipped: cleanEquipped(saved.equipped, stickers),
    };
}

/** The saved learner (with the chosen avatar), or a fresh one. */
export function loadLearner(name, avatar) {
    const saved = getLearner(name);
    return saved
        ? { ...saved, name: name.trim(), avatar: normalizeAvatar(avatar) }
        : blankLearner(name.trim(), avatar);
}

export function saveLearner(learner) {
    const store = readStore();
    store.learners[keyFor(learner.name)] = learner;
    writeStore(store);
}

/** Create or refresh a learner when a game starts. */
export function upsertLearner(name, avatar) {
    const learner = loadLearner(name, avatar);
    saveLearner({ ...learner, lastPlayed: Date.now() });
}

/** All saved learners, most recently played first. */
export function listLearners() {
    return Object.values(readStore().learners)
        .map((l) => getLearner(l.name))
        .filter(Boolean)
        .sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0));
}

export function loadSettings() {
    return readStore().lastSettings ?? null;
}

export function saveSettings(settings) {
    const store = readStore();
    store.lastSettings = settings;
    writeStore(store);
}

/* ---------- Stickers ---------- */

/**
 * Award any stickers whose condition is now met. A new sticker is put on
 * straight away if its slot is empty, so the reward shows up immediately.
 */
export function awardStickers(learner) {
    const earned = STICKERS.filter(
        (s) => !learner.stickers[s.id] && s.test(learner),
    );
    if (earned.length === 0) return { learner, earned: [] };

    const now = Date.now();
    const stickers = { ...learner.stickers };
    const equipped = { ...NOTHING_WORN, ...learner.equipped };
    earned.forEach((s) => {
        stickers[s.id] = now;
        if (!equipped[s.slot]) equipped[s.slot] = s.id;
    });
    return { learner: { ...learner, stickers, equipped }, earned };
}

/** Put an owned sticker on (or take it off). Returns the same learner if not owned. */
export function toggleEquipped(learner, sticker) {
    if (!learner.stickers[sticker.id]) return learner;
    const wearing = learner.equipped[sticker.slot] === sticker.id;
    return {
        ...learner,
        equipped: { ...learner.equipped, [sticker.slot]: wearing ? null : sticker.id },
    };
}

/* ---------- Reset controls ---------- */

/** Clear one player's stats, stars and stickers (name and explorer stay). */
export function resetLearner(name) {
    const learner = getLearner(name);
    if (!learner) return;
    saveLearner({
        ...blankLearner(learner.name, learner.avatar),
        lastPlayed: learner.lastPlayed,
    });
}

/** Remove one player completely. */
export function deleteLearner(name) {
    const store = readStore();
    delete store.learners[keyFor(name)];
    if (store.lastSettings?.learnerName && keyFor(store.lastSettings.learnerName) === keyFor(name)) {
        store.lastSettings = { ...store.lastSettings, learnerName: "" };
    }
    writeStore(store);
}

/** Remove everything this app has saved on the device. */
export function eraseAll() {
    memoryStore = null;
    try {
        window.localStorage.removeItem(KEY);
    } catch {
        /* ignore */
    }
}
