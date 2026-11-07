import { useState } from "react";
import "../styles/landing.css";

export default function LandingPage({ onStart }) {
    const [name, setName] = useState("");
    const [startingLevel, setStartingLevel] = useState(1);
    const [correctsPerLevel, setCorrectsPerLevel] = useState("5");
    const [operationMode, setOperationMode] = useState("add");
    const [showHelp, setShowHelp] = useState(true);

    // The field can be empty while typing, but the game always gets a
    // whole number >= 1.
    const perLevel = Math.max(1, Math.floor(Number(correctsPerLevel)) || 1);

    function start(e) {
        e.preventDefault(); // so Enter in any field starts the game too
        if (!name.trim()) return;
        onStart({
            learnerName: name.trim(),
            startingLevel,
            correctsPerLevel: perLevel,
            operationMode,
            showHelp,
        });
    }

    return (
        <div className="landing">
            <form className="card" onSubmit={start}>
                <h1>Math Adventure</h1>

                {/* Learner name */}
                <label>
                    Learner Name
                    <input
                        type="text"
                        placeholder="e.g. Sam"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </label>

                {/* Starting level */}
                <label>
                    Starting Level
                    <select
                        value={startingLevel}
                        onChange={(e) =>
                            setStartingLevel(Number(e.target.value))
                        }
                    >
                        {[1, 2, 3, 4, 5].map((level) => (
                            <option key={level} value={level}>
                                Level {level}
                            </option>
                        ))}
                    </select>
                </label>

                {/* Corrects per level */}
                <label>
                    Correct Answers to Level Up
                    <input
                        type="number"
                        min={1}
                        value={correctsPerLevel}
                        onChange={(e) => setCorrectsPerLevel(e.target.value)}
                        onBlur={() => setCorrectsPerLevel(String(perLevel))}
                    />
                </label>

                {/* Operation mode */}
                <fieldset className="radio-group">
                    <legend>Operation Mode</legend>

                    <div className="radio-options">
                        <label>
                            <input
                                type="radio"
                                name="operation"
                                value="add"
                                checked={operationMode === "add"}
                                onChange={() => setOperationMode("add")}
                            />
                            Addition
                        </label>

                        <label>
                            <input
                                type="radio"
                                name="operation"
                                value="sub"
                                checked={operationMode === "sub"}
                                onChange={() => setOperationMode("sub")}
                            />
                            Subtraction
                        </label>

                        <label>
                            <input
                                type="radio"
                                name="operation"
                                value="mul"
                                checked={operationMode === "mul"}
                                onChange={() => setOperationMode("mul")}
                            />
                            Multiplication
                        </label>

                        <label>
                            <input
                                type="radio"
                                name="operation"
                                value="mixed"
                                checked={operationMode === "mixed"}
                                onChange={() => setOperationMode("mixed")}
                            />
                            Mixed
                        </label>
                    </div>
                </fieldset>

                {/* Hints + pictures toggle */}
                <div className="checkbox-row">
                    <input
                        type="checkbox"
                        id="showHelp"
                        checked={showHelp}
                        onChange={(e) => setShowHelp(e.target.checked)}
                    />
                    <label htmlFor="showHelp">Show hints &amp; pictures</label>
                </div>

                {/* Start button */}
                <button type="submit" disabled={!name.trim()}>
                    Start Game
                </button>
            </form>
        </div>
    );
}
