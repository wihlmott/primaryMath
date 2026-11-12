import { useEffect, useRef, useState } from "react";
import {
    AVATARS,
    BONUS_MAX_HEARTS,
    HEART_EVERY,
    LEVELS,
    MODES,
    MODE_GROUPS,
    PACES,
    QUESTION_CHOICES,
    levelNeed,
    nearestPace,
    normalizeAvatar,
} from "../utils/adventure";
import {
    deleteLearner,
    eraseAll,
    getLearner,
    listLearners,
    loadSettings,
    resetLearner,
    saveSettings,
    upsertLearner,
} from "../utils/progress";
import { describeLevel, ladderLength } from "../utils/mathEngine";
import Avatar from "../components/Avatar";
import AvatarViewer from "../components/AvatarViewer";
import MapIcon from "../components/MapIcon";
import ModeIcon from "../components/ModeIcon";
import PwaPanel, { UpdateBanner } from "../components/PwaPanel";
import "../styles/landing.css";

const DEFAULTS = {
    learnerName: "",
    avatar: AVATARS[0].id,
    startingLevel: 1,
    correctsPerLevel: 5,
    operationMode: "add",
    showHelp: true,
    maxQuestions: 10, // null = no limit
};

/** Last-used settings, with anything missing or invalid replaced by defaults. */
function initialSettings() {
    const saved = loadSettings() ?? {};
    return {
        learnerName: typeof saved.learnerName === "string" ? saved.learnerName : DEFAULTS.learnerName,
        avatar: normalizeAvatar(saved.avatar), // also migrates old emoji avatars
        startingLevel: LEVELS.some((l) => l.level === saved.startingLevel) ? saved.startingLevel : DEFAULTS.startingLevel,
        correctsPerLevel: nearestPace(saved.correctsPerLevel ?? DEFAULTS.correctsPerLevel).base, // older saves allowed 1-20
        operationMode: MODES.some((m) => m.id === saved.operationMode) ? saved.operationMode : DEFAULTS.operationMode,
        showHelp: typeof saved.showHelp === "boolean" ? saved.showHelp : DEFAULTS.showHelp,
        maxQuestions: QUESTION_CHOICES.includes(saved.maxQuestions) ? saved.maxQuestions : DEFAULTS.maxQuestions,
    };
}

/**
 * The big explorer fills about half the screen's height. It is as wide as the card
 * (so on a phone it is a tall portrait).
 */
function computeHeroSize() {
    return {
        w: Math.max(220, Math.min(window.innerWidth - 56, 380)),
        h: Math.max(240, Math.round((window.innerHeight * 0.5) / 10) * 10),
    };
}

function useHeroSize() {
    const [size, setSize] = useState(computeHeroSize);
    useEffect(() => {
        let timer;
        const onResize = () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                const next = computeHeroSize();
                setSize((prev) => (prev.w === next.w && prev.h === next.h ? prev : next));
            }, 200);
        };
        window.addEventListener("resize", onResize);
        return () => {
            clearTimeout(timer);
            window.removeEventListener("resize", onResize);
        };
    }, []);
    return size;
}

/** A radio input that looks like a button. The input stays keyboard-focusable. */
function RadioChoice({ name, checked, onChange, label, className = "", children }) {
    return (
        <label className="choice">
            <input
                type="radio"
                name={name}
                checked={checked}
                onChange={onChange}
                aria-label={label}
            />
            <span className={`choice-body ${className}`}>{children}</span>
        </label>
    );
}

export default function LandingPage({ onStart, onOpenBook }) {
    const [initial] = useState(initialSettings);
    const [profiles, setProfiles] = useState(listLearners);

    const [name, setName] = useState(initial.learnerName);
    const [avatar, setAvatar] = useState(initial.avatar);
    const [startingLevel, setStartingLevel] = useState(initial.startingLevel);
    const [correctsPerLevel, setCorrectsPerLevel] = useState(initial.correctsPerLevel);
    const [operationMode, setOperationMode] = useState(initial.operationMode);
    const [showHelp, setShowHelp] = useState(initial.showHelp);
    const [maxQuestions, setMaxQuestions] = useState(initial.maxQuestions);

    // Reset controls: which action is waiting for confirmation, and the result message
    const [pending, setPending] = useState(null); // null | "reset" | "delete" | "erase"
    const [notice, setNotice] = useState("");

    // Each mode has its own ladder, so its length limits the starting level
    const ladderMax = ladderLength(operationMode);
    const effectiveLevel = Math.min(startingLevel, ladderMax);

    const trimmed = name.trim();
    const savedLearner = getLearner(trimmed);
    const hasAdventure = Boolean(savedLearner);

    const heroSize = useHeroSize();
    const stripRef = useRef(null);

    // keep the chosen explorer centred in the scrolling strip (scrolls the strip only, never the page)
    useEffect(() => {
        const strip = stripRef.current;
        const chosen = strip?.querySelector("input:checked")?.closest("label");
        if (!strip || !chosen) return;
        const left = chosen.offsetLeft - (strip.clientWidth - chosen.clientWidth) / 2;
        strip.scrollTo({ left, behavior: "smooth" });
    }, [avatar]);

    function pickProfile(profile) {
        setName(profile.name);
        setAvatar(normalizeAvatar(profile.avatar));
    }

    const refreshProfiles = () => setProfiles(listLearners());

    function confirmPending() {
        if (pending === "reset") {
            resetLearner(trimmed);
            setNotice(`${trimmed}'s progress was reset.`);
        } else if (pending === "delete") {
            deleteLearner(trimmed);
            setNotice(`${trimmed} was deleted.`);
            setName("");
        } else if (pending === "erase") {
            eraseAll();
            setNotice("Everything saved on this device was erased.");
            setName(DEFAULTS.learnerName);
            setAvatar(DEFAULTS.avatar);
            setStartingLevel(DEFAULTS.startingLevel);
            setCorrectsPerLevel(DEFAULTS.correctsPerLevel);
            setOperationMode(DEFAULTS.operationMode);
            setShowHelp(DEFAULTS.showHelp);
            setMaxQuestions(DEFAULTS.maxQuestions);
        }
        setPending(null);
        refreshProfiles();
    }

    const pendingText = {
        reset: `Reset ${trimmed}'s progress? Their stats, stars and stickers will be cleared. Their name and explorer stay.`,
        delete: `Delete ${trimmed}? Their name, stats, stars and stickers will be removed from this device.`,
        erase: "Erase everything saved on this device? This removes all players, stickers and settings.",
    };
    const pendingVerb = { reset: "reset", delete: "delete", erase: "erase everything" };

    function start(e) {
        e.preventDefault(); // so Enter in the name field starts the game too
        if (!trimmed) return;

        const config = {
            learnerName: trimmed,
            avatar,
            startingLevel: effectiveLevel,
            correctsPerLevel,
            operationMode,
            showHelp,
            maxQuestions,
        };
        saveSettings(config);
        upsertLearner(trimmed, avatar);
        onStart(config);
    }

    const lengthSummary =
        maxQuestions === null ? "No question limit" : `${maxQuestions} questions`;

    return (
        <div className="landing">
            <form className="landing-card" onSubmit={start}>
                <UpdateBanner />
                {hasAdventure && (
                    <div className="landing-top">
                        <button type="button" className="map-btn" onClick={() => onOpenBook(trimmed)}>
                            <MapIcon size={30} />
                            <span>My adventure</span>
                        </button>
                    </div>
                )}
                <h1 className="landing-title">Math Adventure</h1>
                <p className="tagline">Pick your explorer and let's go!</p>

                {profiles.length > 0 && (
                    <fieldset className="group">
                        <legend>Who's playing?</legend>
                        <div className="profiles">
                            {profiles.slice(0, 6).map((p) => (
                                <button
                                    key={p.name}
                                    type="button"
                                    className="profile-chip"
                                    aria-pressed={p.name.toLowerCase() === trimmed.toLowerCase()}
                                    onClick={() => pickProfile(p)}
                                >
                                    <Avatar id={p.avatar} equipped={p.equipped} size={30} />
                                    {p.name}
                                </button>
                            ))}
                        </div>
                    </fieldset>
                )}

                {/* the chosen explorer, big: drag to make them look around */}
                <div className="hero">
                    <div className="hero-stage">
                        <AvatarViewer id={avatar} equipped={savedLearner?.equipped} size={heroSize.w} height={heroSize.h} />
                    </div>
                    <div className="hero-name">{AVATARS.find((a) => a.id === avatar)?.name}</div>
                    <p className="hero-hint">Drag to make them look around</p>
                </div>

                {/* everyone else, in a strip that scrolls sideways */}
                <fieldset className="group">
                    <legend>Pick your explorer</legend>
                    <div className="avatar-strip" ref={stripRef}>
                        {AVATARS.map((a) => (
                            <RadioChoice
                                key={a.id}
                                name="avatar"
                                label={`Explorer: ${a.name}`}
                                checked={avatar === a.id}
                                onChange={() => setAvatar(a.id)}
                                className="strip-body"
                            >
                                <Avatar id={a.id} size={60} />
                                <span className="strip-name">{a.name}</span>
                            </RadioChoice>
                        ))}
                    </div>
                </fieldset>

                <div className="group">
                    <label className="group-label" htmlFor="learner-name">
                        Your name
                    </label>
                    <input
                        id="learner-name"
                        className="name-input"
                        type="text"
                        placeholder="e.g. Sam"
                        maxLength={20}
                        autoComplete="off"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                {MODE_GROUPS.map((group) => (
                    <fieldset className="group" key={group.id}>
                        <legend>
                            {group.id === "calc"
                                ? "What do you want to practise?"
                                : "Or play a number game"}
                        </legend>
                        <div className="op-grid">
                            {MODES.filter((m) => m.group === group.id).map((m) => (
                                <RadioChoice
                                    key={m.id}
                                    name="operation"
                                    label={m.label}
                                    checked={operationMode === m.id}
                                    onChange={() => setOperationMode(m.id)}
                                    className="op-body"
                                >
                                    <ModeIcon id={m.id} size={52} />
                                    <span>{m.label}</span>
                                </RadioChoice>
                            ))}
                        </div>
                    </fieldset>
                ))}

                <button type="submit" className="start-btn" disabled={!trimmed}>
                    Let's go! 🚀
                </button>
                {!trimmed && <p className="start-hint">Type your name to start</p>}

                <details className="grownups">
                    <summary>
                        Grown-up settings
                        <span className="summary-hint">
                            {lengthSummary} · starts at Level {effectiveLevel}
                        </span>
                    </summary>

                    <fieldset className="group">
                        <legend>How many questions?</legend>
                        <div className="chip-row">
                            {QUESTION_CHOICES.map((q) => (
                                <RadioChoice
                                    key={String(q)}
                                    name="length"
                                    label={q === null ? "No limit" : `${q} questions`}
                                    checked={maxQuestions === q}
                                    onChange={() => setMaxQuestions(q)}
                                    className="chip-body"
                                >
                                    {q === null ? "∞ No limit" : q}
                                </RadioChoice>
                            ))}
                        </div>
                        <p className="setting-note">
                            {maxQuestions === null
                                ? `Keeps going until the hearts run out. Every ${HEART_EVERY} right answers earns a bonus heart (up to ${BONUS_MAX_HEARTS}). The player can stop any time from the Back button.`
                                : "The round ends after this many right answers, with a star score."}
                        </p>
                    </fieldset>

                    <div className="group">
                        <label className="group-label" htmlFor="start-level">
                            Starting level
                        </label>
                        <select
                            id="start-level"
                            value={effectiveLevel}
                            onChange={(e) => setStartingLevel(Number(e.target.value))}
                        >
                            {LEVELS.slice(0, ladderMax).map((l) => (
                                <option key={l.level} value={l.level}>
                                    Level {l.level}: {l.name}
                                </option>
                            ))}
                        </select>
                        <p className="setting-note">
                            {describeLevel(operationMode, effectiveLevel)}
                        </p>
                    </div>

                    <fieldset className="group">
                        <legend>How fast to level up?</legend>
                        <div className="chip-row">
                            {PACES.map((p) => (
                                <RadioChoice
                                    key={p.id}
                                    name="pace"
                                    label={`${p.label}: ${p.base} right answers at level 1`}
                                    checked={correctsPerLevel === p.base}
                                    onChange={() => setCorrectsPerLevel(p.base)}
                                    className="chip-body"
                                >
                                    {p.label}
                                </RadioChoice>
                            ))}
                        </div>
                        <p className="setting-note">
                            Level 1 needs {correctsPerLevel} right answers. Harder levels need a few
                            more, up to {levelNeed(correctsPerLevel, ladderMax)} at level {ladderMax}.
                        </p>
                    </fieldset>

                    <div className="checkbox-row">
                        <input
                            type="checkbox"
                            id="showHelp"
                            checked={showHelp}
                            onChange={(e) => setShowHelp(e.target.checked)}
                        />
                        <label htmlFor="showHelp">Show hints &amp; pictures</label>
                    </div>

                    <PwaPanel />

                    <fieldset className="group">
                        <legend>Saved progress</legend>

                        {pending ? (
                            <div className="confirm-box" role="alertdialog" aria-label="Confirm">
                                <p>{pendingText[pending]}</p>
                                <p className="confirm-warning">This can't be undone.</p>
                                <div className="confirm-actions">
                                    <button
                                        type="button"
                                        className="danger-btn"
                                        onClick={confirmPending}
                                    >
                                        Yes, {pendingVerb[pending]}
                                    </button>
                                    <button
                                        type="button"
                                        className="outline-btn"
                                        onClick={() => setPending(null)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="reset-list">
                                {hasAdventure && (
                                    <>
                                        <button
                                            type="button"
                                            className="outline-btn"
                                            onClick={() => {
                                                setNotice("");
                                                setPending("reset");
                                            }}
                                        >
                                            Reset {trimmed}'s progress
                                        </button>
                                        <button
                                            type="button"
                                            className="outline-btn"
                                            onClick={() => {
                                                setNotice("");
                                                setPending("delete");
                                            }}
                                        >
                                            Delete {trimmed}
                                        </button>
                                    </>
                                )}
                                <button
                                    type="button"
                                    className="outline-btn danger-text"
                                    disabled={profiles.length === 0}
                                    onClick={() => {
                                        setNotice("");
                                        setPending("erase");
                                    }}
                                >
                                    Erase all saved data
                                </button>
                            </div>
                        )}

                        <p className="setting-note" aria-live="polite">
                            {notice ||
                                "Progress and stickers are saved on this device only. Choose a saved player above to reset or delete just them."}
                        </p>
                    </fieldset>
                </details>
            </form>
        </div>
    );
}
