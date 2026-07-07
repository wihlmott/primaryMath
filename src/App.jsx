import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import Game from "./game/Game";

export default function App() {
    const [config, setConfig] = useState(null);

    return config ? (
        <Game {...config} onExitGame={() => setConfig(null)} />
    ) : (
        <LandingPage onStart={setConfig} />
    );
}
