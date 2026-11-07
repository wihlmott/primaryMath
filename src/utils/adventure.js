/* Static data for the adventure: avatars, modes, level islands, stickers. */

export const AVATARS = ["🦊", "🐼", "🐸", "🦁", "🐙", "🦄", "🐲", "🐧"];

export const MODES = [
    { id: "add", icon: "➕", label: "Add" },
    { id: "sub", icon: "➖", label: "Subtract" },
    { id: "mul", icon: "✖️", label: "Multiply" },
    { id: "mixed", icon: "🎲", label: "Mix" },
];

export const LEVELS = [
    { level: 1, emoji: "🏖️", name: "Sunny Beach" },
    { level: 2, emoji: "🌴", name: "Jungle Trail" },
    { level: 3, emoji: "💎", name: "Crystal Cave" },
    { level: 4, emoji: "🌋", name: "Fire Mountain" },
    { level: 5, emoji: "🏰", name: "Cloud Castle" },
];

export const MAX_LEVEL = LEVELS.length;

/** Game length choices. null = no limit (play until the hearts run out). */
export const QUESTION_CHOICES = [5, 10, 20, 30, null];

export function highestLevel(learner) {
    return Math.max(1, ...Object.values(learner.bestLevel ?? {}));
}

/* ---------------------------------------------------------
   Stickers. `test(learner)` looks at the saved stats, so a
   sticker is awarded the moment its stat is reached.
   --------------------------------------------------------- */
export const STICKERS = [
    {
        id: "first-steps",
        emoji: "👣",
        name: "First Steps",
        how: "Solve your first problem",
        test: (l) => l.totalSolved >= 1,
    },
    {
        id: "ten",
        emoji: "🔟",
        name: "Ten Solved",
        how: "Solve 10 problems",
        test: (l) => l.totalSolved >= 10,
    },
    {
        id: "fifty",
        emoji: "⭐",
        name: "Fifty Club",
        how: "Solve 50 problems",
        test: (l) => l.totalSolved >= 50,
    },
    {
        id: "hundred",
        emoji: "💯",
        name: "Century",
        how: "Solve 100 problems",
        test: (l) => l.totalSolved >= 100,
    },
    {
        id: "explorer",
        emoji: "🧭",
        name: "Explorer",
        how: "Solve an add, a subtract and a multiply problem",
        test: (l) =>
            (l.solvedByOp["+"] || 0) > 0 &&
            (l.solvedByOp["-"] || 0) > 0 &&
            (l.solvedByOp["×"] || 0) > 0,
    },
    {
        id: "never-give-up",
        emoji: "💪",
        name: "Never Give Up",
        how: "Fix a mistake and get it right",
        test: (l) => l.retriesFixed >= 1,
    },
    {
        id: "on-fire",
        emoji: "🔥",
        name: "On Fire",
        how: "Get 10 right first time in a row",
        test: (l) => l.bestCleanStreak >= 10,
    },
    {
        id: "perfect",
        emoji: "🏆",
        name: "Perfect Round",
        how: "Finish a round with no mistakes",
        test: (l) => l.perfectRounds >= 1,
    },
    {
        id: "climber",
        emoji: "⛰️",
        name: "Mountain Climber",
        how: "Reach level 3",
        test: (l) => highestLevel(l) >= 3,
    },
    {
        id: "summit",
        emoji: "🚩",
        name: "Summit",
        how: "Reach the top level",
        test: (l) => highestLevel(l) >= MAX_LEVEL,
    },
    {
        id: "marathon",
        emoji: "🏃",
        name: "Marathon",
        how: "Solve 25 in one no-limit run",
        test: (l) => l.bestRun >= 25,
    },
    {
        id: "star-collector",
        emoji: "🌠",
        name: "Star Collector",
        how: "Earn 10 stars",
        test: (l) => l.totalStars >= 10,
    },
];
