/* Read-aloud helper (browser speech synthesis; no network or API key). */

const WORDS = { "+": "plus", "-": "minus", "×": "times" };

export const canSpeak =
    typeof window !== "undefined" && "speechSynthesis" in window;

export function speakProblem({ a, b, operation }) {
    if (!canSpeak) return;

    // Stop anything still being read so taps don't queue up
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(
        `${a} ${WORDS[operation] ?? ""} ${b}`,
    );
    utterance.rate = 0.85; // a little slower than normal
    window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
    if (canSpeak) window.speechSynthesis.cancel();
}
