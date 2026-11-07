import "../styles/numpad.css";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

export default function NumberPad({
    onDigit,
    onBackspace,
    onSubmit,
    disabled = false,
}) {
    return (
        // preventDefault on mousedown stops buttons keeping focus after a
        // click, so Space/Enter can't re-trigger the last pressed key.
        <div className="numpad" onMouseDown={(e) => e.preventDefault()}>
            {KEYS.map((k) => (
                <button
                    key={k}
                    type="button"
                    disabled={disabled}
                    onClick={() => onDigit(k)}
                >
                    {k}
                </button>
            ))}

            <button
                type="button"
                className="numpad-back"
                disabled={disabled}
                onClick={onBackspace}
                aria-label="Backspace"
            >
                ⌫
            </button>
            <button type="button" disabled={disabled} onClick={() => onDigit("0")}>
                0
            </button>
            <button
                type="button"
                className="numpad-check"
                disabled={disabled}
                onClick={onSubmit}
                aria-label="Check answer"
            >
                ✓
            </button>
        </div>
    );
}
