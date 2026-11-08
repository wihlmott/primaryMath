/* Read-aloud helper (browser speech synthesis; no network or API key). */

const WORDS = { "+": "plus", "-": "minus", "×": "times" };

export const canSpeak =
    typeof window !== "undefined" && "speechSynthesis" in window;

/** Read any text aloud. */
export function speakText(text) {
    if (!canSpeak || !text) return;

    // Stop anything still being read so taps don't queue up
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85; // a little slower than normal
    window.speechSynthesis.speak(utterance);
}

/** Read a column problem ("7 plus 5"). Other kinds carry their own `speech`. */
export function speakProblem(problem) {
    const { a, b, operation } = problem;
    speakText(problem.speech ?? `${a} ${WORDS[operation] ?? ""} ${b}`);
}

export function stopSpeaking() {
    if (canSpeak) window.speechSynthesis.cancel();
}
