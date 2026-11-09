/* Static data for the adventure: avatars, modes, level islands, stickers. */

import { ladderLength } from "./mathEngine";

/* ---------------------------------------------------------
   Explorers: 3D characters, shoulders up (see components/avatar3d.js).
   Two boys, two girls and four animals. `id` is what gets saved.
   --------------------------------------------------------- */
export const AVATARS = [
    { id: "leo", name: "Leo", kind: "boy" },
    { id: "mia", name: "Mia", kind: "girl" },
    { id: "max", name: "Max", kind: "boy" },
    { id: "zoe", name: "Zoe", kind: "girl" },
    { id: "fox", name: "Fox", kind: "animal" },
    { id: "panda", name: "Panda", kind: "animal" },
    { id: "cat", name: "Cat", kind: "animal" },
    { id: "bunny", name: "Bunny", kind: "animal" },
];

export const AVATAR_IDS = AVATARS.map((a) => a.id);

/* Saves from older versions used emoji or the old animal ids. */
const LEGACY_AVATARS = {
    "🦊": "fox", "🐼": "panda", "🐸": "bunny", "🦁": "cat", "🐙": "zoe", "🦄": "mia", "🐲": "max", "🐧": "leo",
    frog: "bunny", lion: "cat", octopus: "zoe", unicorn: "mia", dragon: "max", penguin: "leo",
};

/** Accepts an avatar id (or an old emoji / id); always returns a valid id. */
export function normalizeAvatar(value) {
    if (AVATAR_IDS.includes(value)) return value;
    return LEGACY_AVATARS[value] ?? AVATARS[0].id;
}

/* Where a sticker sits on the avatar */
export const SLOTS = [
    { id: "head", label: "Head" },
    { id: "face", label: "Face" },
    { id: "neck", label: "Neck" },
];

/* Every mode has its own ladder of levels (see mathEngine.js). */
export const MODES = [
    { id: "add", label: "Add", group: "calc" },
    { id: "sub", label: "Subtract", group: "calc" },
    { id: "mul", label: "Multiply", group: "calc" },
    { id: "mixed", label: "Mix", group: "calc" },
    { id: "missing", label: "Missing number", group: "games" },
    { id: "bonds", label: "Number bonds", group: "games" },
    { id: "compare", label: "Compare", group: "games" },
    { id: "skip", label: "Skip counting", group: "games" },
];

export const MODE_GROUPS = [
    { id: "calc", label: "Calculate" },
    { id: "games", label: "Number games" },
];

/* Each ladder uses as many islands as it has levels (the longest has 10). */

export const LEVELS = [
    { level: 1, emoji: "🏖️", name: "Sunny Beach" },
    { level: 2, emoji: "🌴", name: "Jungle Trail" },
    { level: 3, emoji: "💎", name: "Crystal Cave" },
    { level: 4, emoji: "🌋", name: "Fire Mountain" },
    { level: 5, emoji: "🏰", name: "Cloud Castle" },
    { level: 6, emoji: "🐠", name: "Coral Reef" },
    { level: 7, emoji: "🏴‍☠️", name: "Pirate Cove" },
    { level: 8, emoji: "🏔️", name: "Snowy Peak" },
    { level: 9, emoji: "🌙", name: "Moon Base" },
    { level: 10, emoji: "⭐", name: "Star Palace" },
];

/* ---------------------------------------------------------
   Pacing: how many right answers clear a level.
   Level 1 needs `base`; every two levels after that needs one
   more, so harder levels take a little longer. For example
   with base 5: levels 1-2 need 5, 3-4 need 6, ... 9-10 need 9.
   --------------------------------------------------------- */
export const PACES = [
    { id: "quick", label: "Quick", base: 3 },
    { id: "steady", label: "Steady", base: 5 },
    { id: "careful", label: "Careful", base: 8 },
];

export function levelNeed(base, level) {
    return base + Math.floor((level - 1) / 2);
}

/** The pace whose base is closest to a saved value (older saves allowed 1-20). */
export function nearestPace(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return PACES[1];
    return PACES.reduce((best, p) => (Math.abs(p.base - n) < Math.abs(best.base - n) ? p : best));
}

/** Game length choices. null = no limit (play until the hearts run out). */
export const QUESTION_CHOICES = [5, 10, 20, 30, null];

/* ---------- Hearts ---------- */
export const MAX_HEARTS = 3; // start (and cap) in rounds with a question limit
export const BONUS_MAX_HEARTS = 5; // cap in no-limit games
export const HEART_EVERY = 10; // no-limit games: +1 heart every N right answers

export function highestLevel(learner) {
    return Math.max(1, ...Object.values(learner.bestLevel ?? {}));
}

/** True if the learner has reached the last level of any ladder. */
export function reachedTop(learner) {
    return Object.entries(learner.bestLevel ?? {}).some(
        ([mode, level]) => level >= ladderLength(mode),
    );
}

/* ---------------------------------------------------------
   Stickers: collectable items an explorer can wear.
   - `slot` is where it goes (head / face / neck).
   - its 3D model is in components/avatar3d.js, keyed by the same id.
   - `test(learner)` looks at the saved stats, so a sticker is
     awarded the moment its condition is reached.
   --------------------------------------------------------- */
export const STICKERS = [
    {
        id: "first-steps",
        name: "Sprout",
        slot: "head",
        how: "Solve your first problem",
        test: (l) => l.totalSolved >= 1,
    },
    {
        id: "climber",
        name: "Climber's helmet",
        slot: "head",
        how: "Reach level 3",
        test: (l) => highestLevel(l) >= 3,
    },
    {
        id: "summit",
        name: "Golden crown",
        slot: "head",
        how: "Reach the top level of any ladder",
        test: (l) => reachedTop(l),
    },
    {
        id: "hundred",
        name: "Top hat",
        slot: "head",
        how: "Solve 100 problems",
        test: (l) => l.totalSolved >= 100,
    },
    {
        id: "explorer",
        name: "Explorer goggles",
        slot: "face",
        how: "Solve an add, a subtract and a multiply problem",
        test: (l) =>
            (l.solvedByOp["+"] || 0) > 0 &&
            (l.solvedByOp["-"] || 0) > 0 &&
            (l.solvedByOp["×"] || 0) > 0,
    },
    {
        id: "on-fire",
        name: "Cool shades",
        slot: "face",
        how: "Get 10 right first time in a row",
        test: (l) => l.bestCleanStreak >= 10,
    },
    {
        id: "never-give-up",
        name: "Brave bandage",
        slot: "face",
        how: "Fix a mistake and get it right",
        test: (l) => l.retriesFixed >= 1,
    },
    {
        id: "star-collector",
        name: "Star shades",
        slot: "face",
        how: "Earn 10 stars",
        test: (l) => l.totalStars >= 10,
    },
    {
        id: "ten",
        name: "Blue bandana",
        slot: "neck",
        how: "Solve 10 problems",
        test: (l) => l.totalSolved >= 10,
    },
    {
        id: "fifty",
        name: "Silver medal",
        slot: "neck",
        how: "Solve 50 problems",
        test: (l) => l.totalSolved >= 50,
    },
    {
        id: "perfect",
        name: "Gold medal",
        slot: "neck",
        how: "Finish a round with no mistakes",
        test: (l) => l.perfectRounds >= 1,
    },
    {
        id: "marathon",
        name: "Striped scarf",
        slot: "neck",
        how: "Solve 25 in one no-limit run",
        test: (l) => l.bestRun >= 25,
    },
];

export const STICKER_BY_ID = Object.fromEntries(STICKERS.map((s) => [s.id, s]));
