/** The box a learner types into: shows "?", their digits, or (as a hint) the answer. */
export default function AnswerBox({ typed, wrong, revealed, expected }) {
    const empty = typed === "";
    const className = [
        "answer-box",
        empty && "empty",
        wrong && "wrong",
        revealed && empty && "revealed",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <span className={className}>
            {empty ? (revealed ? expected : "?") : typed}
        </span>
    );
}
