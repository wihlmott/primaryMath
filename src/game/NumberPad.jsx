import "../styles/numpad.css";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

export default function NumberPad({ onDigit, onBackspace, onSubmit }) {
    return (
        <div className="numpad">
            {KEYS.map((k) => (
                <button key={k} type="button" onClick={() => onDigit(k)}>
                    {k}
                </button>
            ))}

            <button
                type="button"
                className="numpad-back"
                onClick={onBackspace}
                aria-label="Backspace"
            >
                ⌫
            </button>
            <button type="button" onClick={() => onDigit("0")}>
                0
            </button>
            <button
                type="button"
                className="numpad-check"
                onClick={onSubmit}
                aria-label="Check answer"
            >
                ✓
            </button>
        </div>
    );
}
