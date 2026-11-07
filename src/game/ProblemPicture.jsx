/**
 * Pictures for small problems, so early learners can count objects instead of
 * only reading symbols:
 *   +  two groups side by side
 *   -  one group with the "taken away" items faded
 *   ×  `a` boxes with `b` items in each
 */

const OBJECTS = ["🍎", "🍪", "⭐", "🐟", "🚗", "🎈", "🐞"];
const MAX_MULTIPLY_PICTURE = 30; // bigger products would be too crowded

// Same problem -> same object (stable across re-renders)
function objectFor(id) {
    let hash = 0;
    for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
    return OBJECTS[hash % OBJECTS.length];
}

export function hasPicture({ a, b, operation }) {
    if (a > 9 || b > 9) return false;
    if (operation === "×") return a * b <= MAX_MULTIPLY_PICTURE;
    return true;
}

function Items({ count, emoji, goneFrom = Infinity }) {
    return Array.from({ length: count }, (_, i) => (
        <span key={i} className={i >= goneFrom ? "gone" : undefined}>
            {emoji}
        </span>
    ));
}

export default function ProblemPicture({ problem }) {
    if (!hasPicture(problem)) return null;

    const { a, b, operation, id } = problem;
    const emoji = objectFor(id);

    let content = null;

    if (operation === "+") {
        content = (
            <>
                <div className="picture-group">
                    <Items count={a} emoji={emoji} />
                </div>
                <span className="picture-op">+</span>
                <div className="picture-group">
                    <Items count={b} emoji={emoji} />
                </div>
            </>
        );
    } else if (operation === "-") {
        content = (
            <div className="picture-group">
                <Items count={a} emoji={emoji} goneFrom={a - b} />
            </div>
        );
    } else if (operation === "×") {
        content = Array.from({ length: a }, (_, i) => (
            <div key={i} className="picture-group boxed">
                <Items count={b} emoji={emoji} />
            </div>
        ));
    }

    return (
        <div className="picture" aria-hidden="true">
            {content}
        </div>
    );
}
