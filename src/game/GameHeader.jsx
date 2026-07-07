import "../styles/layout.css";

export default function GameHeader({ name, level, points, errors, onBack }) {
    return (
        <header className="game-header">
            <button className="back-btn" onClick={onBack}>
                ← Back
            </button>

            <div className="title">Math Adventure</div>

            <div className="status">
                <span>{name}</span>
                <span>Level {level}</span>
                <span>{points} pts</span>
                <span className="errors">Errors: {errors}/3</span>
            </div>
        </header>
    );
}
