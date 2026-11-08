/* Static data for the adventure: avatars, modes, level islands, stickers. */

import { ladderLength } from "./mathEngine";

/* ---------------------------------------------------------
   Avatars. `id` is what gets saved; `emoji` is only used to
   migrate progress saved by the older emoji-based version.
   --------------------------------------------------------- */
export const AVATARS = [
    { id: "fox", name: "Fox", emoji: "🦊" },
    { id: "panda", name: "Panda", emoji: "🐼" },
    { id: "frog", name: "Frog", emoji: "🐸" },
    { id: "lion", name: "Lion", emoji: "🦁" },
    { id: "octopus", name: "Octopus", emoji: "🐙" },
    { id: "unicorn", name: "Unicorn", emoji: "🦄" },
    { id: "dragon", name: "Dragon", emoji: "🐲" },
    { id: "penguin", name: "Penguin", emoji: "🐧" },
];

export const AVATAR_IDS = AVATARS.map((a) => a.id);

/** Accepts an avatar id or an old emoji; always returns a valid id. */
export function normalizeAvatar(value) {
    if (AVATAR_IDS.includes(value)) return value;
    const byEmoji = AVATARS.find((a) => a.emoji === value);
    return byEmoji ? byEmoji.id : AVATARS[0].id;
}

/* Where a sticker sits on the avatar */
export const SLOTS = [
    { id: "head", label: "Head" },
    { id: "face", label: "Face" },
    { id: "neck", label: "Neck" },
];

/* Every mode has its own ladder of levels (see mathEngine.js). */
export const MODES = [
    { id: "add", icon: "➕", label: "Add", group: "calc" },
    { id: "sub", icon: "➖", label: "Subtract", group: "calc" },
    { id: "mul", icon: "✖️", label: "Multiply", group: "calc" },
    { id: "mixed", icon: "🎲", label: "Mix", group: "calc" },
    { id: "missing", icon: "❓", label: "Missing number", group: "games" },
    { id: "bonds", icon: "🔗", label: "Number bonds", group: "games" },
    { id: "compare", icon: "⚖️", label: "Compare", group: "games" },
    { id: "skip", icon: "🦘", label: "Skip counting", group: "games" },
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
   - `box` is the crop used for its icon (art is in
     components/avatarArt.jsx, keyed by the same id).
   - `test(learner)` looks at the saved stats, so a sticker is
     awarded the moment its condition is reached.
   --------------------------------------------------------- */
export const STICKERS = [
    {
        id: "first-steps",
        name: "Sprout",
        slot: "head",
        box: "26 0 48 28",
        how: "Solve your first problem",
        test: (l) => l.totalSolved >= 1,
    },
    {
        id: "climber",
        name: "Climber's helmet",
        slot: "head",
        box: "18 2 64 32",
        how: "Reach level 3",
        test: (l) => highestLevel(l) >= 3,
    },
    {
        id: "summit",
        name: "Golden crown",
        slot: "head",
        box: "24 0 52 32",
        how: "Reach the top level of any ladder",
        test: (l) => reachedTop(l),
    },
    {
        id: "hundred",
        name: "Top hat",
        slot: "head",
        box: "20 0 60 32",
        how: "Solve 100 problems",
        test: (l) => l.totalSolved >= 100,
    },
    {
        id: "explorer",
        name: "Explorer goggles",
        slot: "face",
        box: "12 32 76 28",
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
        box: "14 32 72 28",
        how: "Get 10 right first time in a row",
        test: (l) => l.bestCleanStreak >= 10,
    },
    {
        id: "never-give-up",
        name: "Brave bandage",
        slot: "face",
        box: "50 42 36 32",
        how: "Fix a mistake and get it right",
        test: (l) => l.retriesFixed >= 1,
    },
    {
        id: "star-collector",
        name: "Star shades",
        slot: "face",
        box: "14 30 72 32",
        how: "Earn 10 stars",
        test: (l) => l.totalStars >= 10,
    },
    {
        id: "ten",
        name: "Blue bandana",
        slot: "neck",
        box: "22 72 56 30",
        how: "Solve 10 problems",
        test: (l) => l.totalSolved >= 10,
    },
    {
        id: "fifty",
        name: "Silver medal",
        slot: "neck",
        box: "28 72 44 30",
        how: "Solve 50 problems",
        test: (l) => l.totalSolved >= 50,
    },
    {
        id: "perfect",
        name: "Gold medal",
        slot: "neck",
        box: "28 72 44 30",
        how: "Finish a round with no mistakes",
        test: (l) => l.perfectRounds >= 1,
    },
    {
        id: "marathon",
        name: "Striped scarf",
        slot: "neck",
        box: "20 72 62 30",
        how: "Solve 25 in one no-limit run",
        test: (l) => l.bestRun >= 25,
    },
];

export const STICKER_BY_ID = Object.fromEntries(STICKERS.map((s) => [s.id, s]));
