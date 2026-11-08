import { useEffect } from "react";
import { canSpeak, speakText, stopSpeaking } from "../utils/speech";

// Mouse/touch presses shouldn't leave a button focused (a focused button
// would swallow the Enter key meant for "check").
const keepFocus = (e) => e.preventDefault();

/**
 * Prompt line with a read-aloud button (left) and a hint button (right).
 * The parent decides what `text` says (prompt, hint, feedback).
 */
export default function HelperRow({ speech, text, hintAvailable, showHint, onToggleHint }) {
    // Stop any read-aloud when the problem changes or the screen closes
    useEffect(() => () => stopSpeaking(), []);

    return (
        <div className="helper-row">
            {canSpeak && speech ? (
                <button
                    type="button"
                    className="helper-btn"
                    aria-label="Read the question aloud"
                    onMouseDown={keepFocus}
                    onClick={() => speakText(speech)}
                >
                    🔊
                </button>
            ) : (
                <span className="helper-spacer" />
            )}

            <div className="column-prompt" aria-live="polite">
                {text}
            </div>

            {hintAvailable ? (
                <button
                    type="button"
                    className="helper-btn"
                    aria-label={showHint ? "Hide hint" : "Show hint"}
                    aria-pressed={showHint}
                    onMouseDown={keepFocus}
                    onClick={onToggleHint}
                >
                    💡
                </button>
            ) : (
                <span className="helper-spacer" />
            )}
        </div>
    );
}
