import { useState } from "react";
import { LEVELS, MODES, STICKERS } from "../utils/adventure";
import { getLearner, loadSettings } from "../utils/progress";
import "../styles/book.css";

export default function AdventureBook({ learnerName, onBack }) {
    const [learner] = useState(() => getLearner(learnerName));
    const [mode, setMode] = useState(() => {
        const saved = loadSettings()?.operationMode;
        return MODES.some((m) => m.id === saved) ? saved : "add";
    });

    if (!learner) {
        return (
            <div className="book">
                <button className="book-back" onClick={onBack}>
                    ← Back
                </button>
                <h1 className="book-title">My adventure</h1>
                <p className="book-empty">
                    No adventure yet. Play a round and come back!
                </p>
            </div>
        );
    }

    const reached = learner.bestLevel[mode] ?? 1;
    const earnedCount = STICKERS.filter((s) => learner.stickers[s.id]).length;

    return (
        <div className="book">
            <button className="book-back" onClick={onBack}>
                ← Back
            </button>

            <h1 className="book-title">My adventure</h1>

            <div className="book-player">
                <span className="book-avatar" aria-hidden="true">
                    {learner.avatar}
                </span>
                <span className="book-name">{learner.name}</span>
            </div>

            <ul className="book-stats">
                <li>
                    <strong>{learner.totalSolved}</strong>
                    <span>solved</span>
                </li>
                <li>
                    <strong>{learner.roundsPlayed}</strong>
                    <span>rounds</span>
                </li>
                <li>
                    <strong>{learner.totalStars}</strong>
                    <span>stars ⭐</span>
                </li>
                {learner.bestRun > 0 && (
                    <li>
                        <strong>{learner.bestRun}</strong>
                        <span>best run</span>
                    </li>
                )}
            </ul>

            <h2 className="book-heading">The journey</h2>
            <div className="book-tabs" role="group" aria-label="Choose a journey">
                {MODES.map((m) => (
                    <button
                        key={m.id}
                        type="button"
                        aria-pressed={mode === m.id}
                        onClick={() => setMode(m.id)}
                    >
                        <span aria-hidden="true">{m.icon}</span> {m.label}
                    </button>
                ))}
            </div>

            {/* Level 1 is at the bottom: the path climbs upward */}
            <ol className="map">
                {LEVELS.map((l) => {
                    const state =
                        l.level < reached ? "done" : l.level === reached ? "here" : "locked";
                    return (
                        <li key={l.level} className={`stop ${state}`}>
                            <span className="stop-node" aria-hidden="true">
                                {state === "locked" ? "🔒" : l.emoji}
                            </span>
                            <span className="stop-text">
                                <strong>
                                    Level {l.level}: {l.name}
                                </strong>
                                <span>
                                    {state === "done" && "Passed ✓"}
                                    {state === "here" && "You are here!"}
                                    {state === "locked" && "Keep solving to get here"}
                                </span>
                            </span>
                            {state === "here" && (
                                <span className="stop-you" aria-hidden="true">
                                    {learner.avatar}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>

            <h2 className="book-heading">
                Stickers{" "}
                <span className="book-count">
                    {earnedCount} of {STICKERS.length}
                </span>
            </h2>
            <ul className="sticker-grid">
                {STICKERS.map((s) => {
                    const got = Boolean(learner.stickers[s.id]);
                    return (
                        <li key={s.id} className={got ? "sticker got" : "sticker"}>
                            <span className="sticker-big" aria-hidden="true">
                                {got ? s.emoji : "❔"}
                            </span>
                            <strong>{got ? s.name : "Mystery sticker"}</strong>
                            <span>{s.how}</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
