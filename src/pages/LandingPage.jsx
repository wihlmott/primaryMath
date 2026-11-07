import { useState } from "react";
import {
    AVATARS,
    LEVELS,
    MODES,
    QUESTION_CHOICES,
} from "../utils/adventure";
import {
    getLearner,
    listLearners,
    loadSettings,
    saveSettings,
    upsertLearner,
} from "../utils/progress";
import "../styles/landing.css";

const DEFAULTS = {
    learnerName: "",
    avatar: AVATARS[0],
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
        avatar: AVATARS.includes(saved.avatar) ? saved.avatar : DEFAULTS.avatar,
        startingLevel: LEVELS.some((l) => l.level === saved.startingLevel) ? saved.startingLevel : DEFAULTS.startingLevel,
        correctsPerLevel: Number.isInteger(saved.correctsPerLevel) && saved.correctsPerLevel >= 1 ? Math.min(saved.correctsPerLevel, 20) : DEFAULTS.correctsPerLevel,
        operationMode: MODES.some((m) => m.id === saved.operationMode) ? saved.operationMode : DEFAULTS.operationMode,
        showHelp: typeof saved.showHelp === "boolean" ? saved.showHelp : DEFAULTS.showHelp,
        maxQuestions: QUESTION_CHOICES.includes(saved.maxQuestions) ? saved.maxQuestions : DEFAULTS.maxQuestions,
    };
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

/** − value + control (no typing, so it can never be empty or invalid). */
function Stepper({ value, min, max, onChange, label }) {
    return (
        <div className="stepper" role="group" aria-label={label}>
            <button
                type="button"
                aria-label={`Fewer: ${label}`}
                disabled={value <= min}
                onClick={() => onChange(value - 1)}
            >
                −
            </button>
            <output aria-live="polite">{value}</output>
            <button
                type="button"
                aria-label={`More: ${label}`}
                disabled={value >= max}
                onClick={() => onChange(value + 1)}
            >
                +
            </button>
        </div>
    );
}

export default function LandingPage({ onStart, onOpenBook }) {
    const [initial] = useState(initialSettings);
    const [profiles] = useState(listLearners);

    const [name, setName] = useState(initial.learnerName);
    const [avatar, setAvatar] = useState(initial.avatar);
    const [startingLevel, setStartingLevel] = useState(initial.startingLevel);
    const [correctsPerLevel, setCorrectsPerLevel] = useState(initial.correctsPerLevel);
    const [operationMode, setOperationMode] = useState(initial.operationMode);
    const [showHelp, setShowHelp] = useState(initial.showHelp);
    const [maxQuestions, setMaxQuestions] = useState(initial.maxQuestions);

    const trimmed = name.trim();
    const hasAdventure = Boolean(getLearner(trimmed));

    function pickProfile(profile) {
        setName(profile.name);
        setAvatar(profile.avatar);
    }

    function start(e) {
        e.preventDefault(); // so Enter in the name field starts the game too
        if (!trimmed) return;

        const config = {
            learnerName: trimmed,
            avatar,
            startingLevel,
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
                                    <span aria-hidden="true">{p.avatar}</span> {p.name}
                                </button>
                            ))}
                        </div>
                    </fieldset>
                )}

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

                <fieldset className="group">
                    <legend>Pick your explorer</legend>
                    <div className="avatar-grid">
                        {AVATARS.map((a) => (
                            <RadioChoice
                                key={a}
                                name="avatar"
                                label={`Explorer ${a}`}
                                checked={avatar === a}
                                onChange={() => setAvatar(a)}
                                className="avatar-body"
                            >
                                {a}
                            </RadioChoice>
                        ))}
                    </div>
                </fieldset>

                <fieldset className="group">
                    <legend>What do you want to practise?</legend>
                    <div className="op-grid">
                        {MODES.map((m) => (
                            <RadioChoice
                                key={m.id}
                                name="operation"
                                label={m.label}
                                checked={operationMode === m.id}
                                onChange={() => setOperationMode(m.id)}
                                className="op-body"
                            >
                                <span className="op-icon" aria-hidden="true">
                                    {m.icon}
                                </span>
                                <span>{m.label}</span>
                            </RadioChoice>
                        ))}
                    </div>
                </fieldset>

                <button type="submit" className="start-btn" disabled={!trimmed}>
                    Let's go! 🚀
                </button>
                {!trimmed && <p className="start-hint">Type your name to start</p>}

                {hasAdventure && (
                    <button
                        type="button"
                        className="link-btn"
                        onClick={() => onOpenBook(trimmed)}
                    >
                        🗺️ My adventure
                    </button>
                )}

                <details className="grownups">
                    <summary>
                        Grown-up settings
                        <span className="summary-hint">
                            {lengthSummary} · starts at Level {startingLevel}
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
                                ? "Keeps going until the hearts run out. The player can stop any time from the Back button."
                                : "The round ends after this many right answers, with a star score."}
                        </p>
                    </fieldset>

                    <div className="group">
                        <label className="group-label" htmlFor="start-level">
                            Starting level
                        </label>
                        <select
                            id="start-level"
                            value={startingLevel}
                            onChange={(e) => setStartingLevel(Number(e.target.value))}
                        >
                            {LEVELS.map((l) => (
                                <option key={l.level} value={l.level}>
                                    Level {l.level}: {l.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="group">
                        <span className="group-label" id="per-level-label">
                            Right answers to level up
                        </span>
                        <Stepper
                            label="right answers to level up"
                            value={correctsPerLevel}
                            min={1}
                            max={20}
                            onChange={setCorrectsPerLevel}
                        />
                    </div>

                    <div className="checkbox-row">
                        <input
                            type="checkbox"
                            id="showHelp"
                            checked={showHelp}
                            onChange={(e) => setShowHelp(e.target.checked)}
                        />
                        <label htmlFor="showHelp">Show hints &amp; pictures</label>
                    </div>

                    <p className="setting-note">
                        Progress and stickers are saved on this device only.
                    </p>
                </details>
            </form>
        </div>
    );
}
