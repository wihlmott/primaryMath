import { useEffect, useState } from "react";

/**
 * Typing one numeric answer (number pad or physical keyboard), with the
 * same retry feedback as the column problems.
 *
 * `onSubmit(value, attemptNo)` must return true when the answer was right.
 * The parent gives the problem component a new `key` for every problem, so
 * this state starts fresh each time.
 */
export default function useNumericAnswer({
    onSubmit,
    onIncomplete,
    disabled = false,
    maxLength = 4,
}) {
    const [typed, setTyped] = useState("");
    const [tries, setTries] = useState(0); // wrong tries so far
    const [wrong, setWrong] = useState(false); // last try was wrong (shake)

    function pressDigit(d) {
        if (disabled) return;
        setWrong(false);
        // no leading zeros: typing after a lone 0 replaces it
        setTyped((t) => (t.length >= maxLength ? t : t === "0" ? d : t + d));
    }

    function pressBackspace() {
        if (disabled) return;
        setWrong(false);
        setTyped((t) => t.slice(0, -1));
    }

    function submit() {
        if (disabled) return;
        if (typed === "") {
            onIncomplete?.();
            return;
        }
        const correct = onSubmit(Number(typed), tries + 1);
        if (correct) return; // a new problem (new key) replaces this one
        setTries((t) => t + 1);
        setTyped("");
        setWrong(true);
    }

    // Physical keyboard support on desktop (off while input is disabled)
    useEffect(() => {
        if (disabled) return;

        function onKey(e) {
            if (e.ctrlKey || e.metaKey || e.altKey) return;

            if (/^\d$/.test(e.key)) {
                if (e.repeat) return;
                pressDigit(e.key);
            } else if (e.key === "Backspace") {
                pressBackspace();
            } else if (e.key === "Enter") {
                // Don't hijack Enter on unrelated buttons (e.g. Back)
                const btn = e.target?.closest?.("button");
                if (btn && !btn.closest(".numpad")) return;

                e.preventDefault();
                if (e.repeat) return;
                submit();
            }
        }

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    });

    return {
        typed,
        tries,
        wrong,
        revealed: tries >= 2, // after the 2nd wrong try, show the answer as a hint
        pressDigit,
        pressBackspace,
        submit,
    };
}
