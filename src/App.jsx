import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import AdventureBook from "./pages/AdventureBook";
import Game from "./game/Game";

export default function App() {
    // { name: "landing" } | { name: "game", config } | { name: "book", learnerName }
    const [screen, setScreen] = useState({ name: "landing" });
    const goHome = () => setScreen({ name: "landing" });

    if (screen.name === "game") {
        return <Game {...screen.config} onExitGame={goHome} />;
    }

    if (screen.name === "book") {
        return <AdventureBook learnerName={screen.learnerName} onBack={goHome} />;
    }

    return (
        <LandingPage
            onStart={(config) => setScreen({ name: "game", config })}
            onOpenBook={(learnerName) => setScreen({ name: "book", learnerName })}
        />
    );
}
