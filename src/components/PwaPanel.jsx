import { applyUpdate, isIos, offlineIsOn, promptInstall, serviceWorkersSupported, usePwa } from "../pwa";

/** "A new version is ready" notice. Shown on the start screen only, never during a game. */
export function UpdateBanner() {
    const { updateReady } = usePwa();
    if (!updateReady) return null;

    return (
        <div className="pwa-banner" role="status">
            <span>A new version of Math Adventure is ready.</span>
            <button type="button" onClick={applyUpdate}>
                Update
            </button>
        </div>
    );
}

/** Install + offline status, for the grown-up settings. */
export default function PwaPanel() {
    const { offlineReady, canInstall, installed } = usePwa();
    const offlineOn = offlineReady || offlineIsOn();

    let offlineText;
    if (!serviceWorkersSupported()) offlineText = "Offline play isn't supported in this browser.";
    else if (offlineOn) offlineText = "✓ Ready to play without internet.";
    else if (import.meta.env.PROD) offlineText = "Getting ready for offline play. Stay online for a moment, then reopen the app.";
    else offlineText = "Offline play is switched off while developing.";

    let installNode;
    if (installed) installNode = <p className="setting-note">✓ Installed on this device.</p>;
    else if (canInstall)
        installNode = (
            <button type="button" className="outline-btn" onClick={promptInstall}>
                Install the app
            </button>
        );
    else if (isIos())
        installNode = <p className="setting-note">To install: tap the Share button, then “Add to Home Screen”.</p>;
    else installNode = <p className="setting-note">To install: use your browser's “Install app” or “Add to Home Screen” option.</p>;

    return (
        <fieldset className="group">
            <legend>Install &amp; offline</legend>
            <p className="setting-note" aria-live="polite">
                {offlineText}
            </p>
            {installNode}
        </fieldset>
    );
}
