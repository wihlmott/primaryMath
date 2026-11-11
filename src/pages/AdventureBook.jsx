import { useState } from "react";
import { LEVELS, MODES, SLOTS, STICKERS } from "../utils/adventure";
import { getLearner, loadSettings, saveLearner, toggleEquipped } from "../utils/progress";
import { describeLevel, ladderLength } from "../utils/mathEngine";
import Avatar from "../components/Avatar";
import AvatarViewer from "../components/AvatarViewer";
import ModeIcon from "../components/ModeIcon";
import StickerIcon from "../components/StickerIcon";
import "../styles/book.css";

export default function AdventureBook({ learnerName, onBack }) {
    const [learner, setLearner] = useState(() => getLearner(learnerName));
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

    // Tap an earned sticker to put it on (or take it off)
    function toggle(sticker) {
        const next = toggleEquipped(learner, sticker);
        if (next !== learner) {
            saveLearner(next);
            setLearner(next);
        }
    }

    return (
        <div className="book">
            <button className="book-back" onClick={onBack}>
                ← Back
            </button>

            <h1 className="book-title">My adventure</h1>

            <div className="dress-preview">
                <AvatarViewer id={learner.avatar} equipped={learner.equipped} size={190} />
                <div className="book-name">{learner.name}</div>
                <div className="book-hint">Drag to make your explorer look around</div>
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

            <h2 className="book-heading">
                Stickers{" "}
                <span className="book-count">
                    {earnedCount} of {STICKERS.length}
                </span>
            </h2>
            <p className="book-hint">Tap a sticker to put it on your explorer.</p>
            <ul className="sticker-grid">
                {STICKERS.map((s) => {
                    const got = Boolean(learner.stickers[s.id]);
                    const worn = learner.equipped[s.slot] === s.id;
                    const slotLabel = SLOTS.find((slot) => slot.id === s.slot)?.label;

                    const inner = (
                        <>
                            <StickerIcon id={s.id} size={76} locked={!got} />
                            <strong>{got ? s.name : "Mystery sticker"}</strong>
                            <span>{s.how}</span>
                            {got && (
                                <span className={worn ? "sticker-worn" : "sticker-slot"}>
                                    {worn ? "Wearing ✓" : slotLabel}
                                </span>
                            )}
                        </>
                    );

                    return (
                        <li key={s.id}>
                            {got ? (
                                <button
                                    type="button"
                                    className="sticker got"
                                    aria-pressed={worn}
                                    aria-label={`${s.name} (${slotLabel}). ${worn ? "Wearing. Tap to take off." : "Tap to wear."}`}
                                    onClick={() => toggle(s)}
                                >
                                    {inner}
                                </button>
                            ) : (
                                <div className="sticker">{inner}</div>
                            )}
                        </li>
                    );
                })}
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
                        <ModeIcon id={m.id} size={24} /> {m.label}
                    </button>
                ))}
            </div>

            {/* Level 1 is at the bottom: the path climbs upward */}
            <ol className="map">
                {LEVELS.slice(0, ladderLength(mode)).map((l) => {
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
                                <span className="stop-desc">{describeLevel(mode, l.level)}</span>
                                <span>
                                    {state === "done" && "Passed ✓"}
                                    {state === "here" && "You are here!"}
                                    {state === "locked" && "Keep solving to get here"}
                                </span>
                            </span>
                            {state === "here" && (
                                <span className="stop-you" aria-hidden="true">
                                    <Avatar id={learner.avatar} equipped={learner.equipped} size={38} />
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}
