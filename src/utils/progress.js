/* Saved progress (browser localStorage; nothing leaves the device).
   Falls back to in-memory storage if localStorage is unavailable. */

import { STICKERS } from "./adventure";

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

export function blankLearner(name, avatar) {
    return {
        name,
        avatar,
        lastPlayed: 0,
        totalSolved: 0,
        roundsPlayed: 0,
        totalStars: 0,
        perfectRounds: 0,
        retriesFixed: 0,
        bestCleanStreak: 0,
        bestRun: 0,
        bestLevel: { add: 1, sub: 1, mul: 1, mixed: 1 },
        solvedByOp: {},
        stickers: {},
    };
}

/** A saved learner, or null. */
export function getLearner(name) {
    if (!name || !name.trim()) return null;
    const saved = readStore().learners[keyFor(name)];
    if (!saved) return null;
    const blank = blankLearner(saved.name, saved.avatar);
    return {
        ...blank,
        ...saved,
        bestLevel: { ...blank.bestLevel, ...saved.bestLevel },
        solvedByOp: { ...saved.solvedByOp },
        stickers: { ...saved.stickers },
    };
}

/** The saved learner (with the chosen avatar), or a fresh one. */
export function loadLearner(name, avatar) {
    const saved = getLearner(name);
    return saved
        ? { ...saved, name: name.trim(), avatar }
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
    return Object.values(readStore().learners).sort(
        (a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0),
    );
}

export function loadSettings() {
    return readStore().lastSettings ?? null;
}

export function saveSettings(settings) {
    const store = readStore();
    store.lastSettings = settings;
    writeStore(store);
}

/** Award any stickers whose condition is now met. */
export function awardStickers(learner) {
    const earned = STICKERS.filter(
        (s) => !learner.stickers[s.id] && s.test(learner),
    );
    if (earned.length === 0) return { learner, earned: [] };

    const now = Date.now();
    const stickers = { ...learner.stickers };
    earned.forEach((s) => {
        stickers[s.id] = now;
    });
    return { learner: { ...learner, stickers }, earned };
}
