import { useState } from "react";
import "../styles/landing.css";

export default function LandingPage({ onStart }) {
    const [name, setName] = useState("");
    const [startingLevel, setStartingLevel] = useState(1);
    const [correctsPerLevel, setCorrectsPerLevel] = useState(5);
    const [operationMode, setOperationMode] = useState("add");
    const [showCarryBorrow, setShowCarryBorrow] = useState(true);

    return (
        <div className="landing">
            <div className="card">
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
                        onChange={(e) =>
                            setCorrectsPerLevel(Number(e.target.value))
                        }
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

                {/* Carry / borrow toggle */}
                <div className="checkbox-row">
                    <input
                        type="checkbox"
                        id="carryHelp"
                        checked={showCarryBorrow}
                        onChange={(e) => setShowCarryBorrow(e.target.checked)}
                    />
                    <label htmlFor="carryHelp">Show Carry / Borrow Help</label>
                </div>

                {/* Start button */}
                <button
                    disabled={!name.trim()}
                    onClick={() =>
                        onStart({
                            learnerName: name.trim(),
                            startingLevel,
                            correctsPerLevel,
                            operationMode,
                            showCarryBorrow,
                        })
                    }
                >
                    Start Game
                </button>
            </div>
        </div>
    );
}
