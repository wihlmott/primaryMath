import { useState } from "react";
import { LEVELS, MODES, SLOTS, STICKERS } from "../utils/adventure";
import { describeLevel, ladderLength } from "../utils/mathEngine";
import { getLearner, loadSettings, saveLearner, toggleEquipped } from "../utils/progress";
import Avatar from "../components/Avatar";
import AvatarViewer from "../components/AvatarViewer";
import ModeIcon from "../components/ModeIcon";
import StickerIcon from "../components/StickerIcon";
import "../styles/book.css";

const TABS = [
    { id: "dress", label: "Dress up" },
    { id: "journey", label: "Journey" },
];

export default function AdventureBook({ learnerName, onBack }) {
    const [learner, setLearner] = useState(() => getLearner(learnerName));
    const [tab, setTab] = useState("dress");
    const [mode, setMode] = useState(() => {
        const saved = loadSettings()?.operationMode;
        return MODES.some((m) => m.id === saved) ? saved : "add";
    });
    // each change zooms the explorer in on that part, and gives it a little bounce
    const [focus, setFocus] = useState(null); // { slot, n }
    const [bounce, setBounce] = useState(0);

    if (!learner) {
        return (
            <div className="book">
                <button className="book-back" onClick={onBack}>
                    ← Back
                </button>
                <h1 className="book-title">My adventure</h1>
                <p className="book-empty">No adventure yet. Play a round and come back!</p>
            </div>
        );
    }

    const earnedCount = STICKERS.filter((s) => learner.stickers[s.id]).length;

    // Tap an earned sticker to put it on (or take it off)
    function toggle(sticker) {
        const next = toggleEquipped(learner, sticker);
        if (next === learner) return;
        saveLearner(next);
        setLearner(next);
        setFocus({ slot: sticker.slot, n: Date.now() });
        setBounce((b) => b + 1);
    }

    const wornName = (slot) => {
        const id = learner.equipped[slot];
        return STICKERS.find((s) => s.id === id)?.name;
    };

    return (
        <div className="book">
            <button className="book-back" onClick={onBack}>
                ← Back
            </button>

            <h1 className="book-title">My adventure</h1>

            <div className="book-tabs-main" role="group" aria-label="Choose a page">
                {TABS.map((t) => (
                    <button key={t.id} type="button" aria-pressed={tab === t.id} onClick={() => setTab(t.id)}>
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === "dress" && (
                <div className="dress">
                    {/* the stickers: scroll up and down */}
                    <div className="dress-list" role="region" aria-label="Stickers" tabIndex={0}>
                        <p className="dress-count">
                            {earnedCount} of {STICKERS.length} stickers. Tap one to wear it.
                        </p>
                        {SLOTS.map((slot) => (
                            <section key={slot.id} className="slot-group">
                                <h2 className="slot-title">{slot.label}</h2>
                                <ul className="slot-items">
                                    {STICKERS.filter((s) => s.slot === slot.id).map((s) => {
                                        const got = Boolean(learner.stickers[s.id]);
                                        const worn = learner.equipped[s.slot] === s.id;

                                        const inner = (
                                            <>
                                                <StickerIcon id={s.id} size={54} locked={!got} />
                                                <span className="item-text">
                                                    <strong>{got ? s.name : "Mystery sticker"}</strong>
                                                    <span>{got ? (worn ? "Wearing ✓ tap to take off" : "Tap to wear") : s.how}</span>
                                                </span>
                                            </>
                                        );

                                        return (
                                            <li key={s.id}>
                                                {got ? (
                                                    <button
                                                        type="button"
                                                        className={`dress-item got${worn ? " worn" : ""}`}
                                                        aria-pressed={worn}
                                                        aria-label={`${s.name}. ${worn ? "Wearing. Tap to take off." : "Tap to wear."}`}
                                                        onClick={() => toggle(s)}
                                                    >
                                                        {inner}
                                                    </button>
                                                ) : (
                                                    <div className="dress-item">{inner}</div>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </section>
                        ))}
                    </div>

                    {/* the explorer: stays on the right, so every change can be seen */}
                    <aside className="dress-avatar" aria-label={`${learner.name} wearing stickers`}>
                        <div key={bounce} className="dress-avatar-bounce">
                            <AvatarViewer id={learner.avatar} equipped={learner.equipped} size={172} height={236} focus={focus} />
                        </div>
                        <div className="book-name">{learner.name}</div>
                        <ul className="wearing" aria-label="Wearing">
                            {SLOTS.map((slot) => (
                                <li key={slot.id}>
                                    <span>{slot.label}</span>
                                    <strong>{wornName(slot.id) ?? "none"}</strong>
                                </li>
                            ))}
                        </ul>
                        <div className="book-hint">Drag to look around</div>
                    </aside>
                </div>
            )}

            {tab === "journey" && (
                <>
                    <div className="journey-player">
                        <Avatar id={learner.avatar} equipped={learner.equipped} size={72} />
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
                            <button key={m.id} type="button" aria-pressed={mode === m.id} onClick={() => setMode(m.id)}>
                                <ModeIcon id={m.id} size={24} /> {m.label}
                            </button>
                        ))}
                    </div>

                    {/* Level 1 is at the bottom: the path climbs upward */}
                    <ol className="map">
                        {LEVELS.slice(0, ladderLength(mode)).map((l) => {
                            const reached = learner.bestLevel[mode] ?? 1;
                            const state = l.level < reached ? "done" : l.level === reached ? "here" : "locked";
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
                </>
            )}
        </div>
    );
}
