/* Progressive web app support.

   - registers the service worker, which keeps the whole game on the device
     so it works with no internet at all
   - tracks whether the app can be installed, is ready for offline play, or has
     a new version waiting, so the screens can show it

   The service worker itself is generated at build time by vite-plugin-pwa
   (see vite.config.js). It is not used while developing (`npm run dev`). */

import { useSyncExternalStore } from "react";
import { registerSW } from "virtual:pwa-register";

const isStandalone = () =>
    window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;

let state = {
    offlineReady: false, // everything has been saved on this device (this session)
    updateReady: false, // a new version is waiting to be applied
    canInstall: false, // the browser offers an install prompt
    installed: typeof window !== "undefined" && isStandalone(),
};

const listeners = new Set();
const subscribe = (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
};
const set = (patch) => {
    state = { ...state, ...patch };
    listeners.forEach((fn) => fn());
};

/** Re-renders the component whenever the install / offline / update state changes. */
export const usePwa = () => useSyncExternalStore(subscribe, () => state);

export const serviceWorkersSupported = () => typeof navigator !== "undefined" && "serviceWorker" in navigator;

/** True once a service worker is looking after this page, i.e. it will work offline. */
export const offlineIsOn = () => serviceWorkersSupported() && Boolean(navigator.serviceWorker.controller);

export const isIos = () =>
    typeof navigator !== "undefined" &&
    (/iphone|ipad|ipod/i.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

let updateSW = null;
let installEvent = null;

export function registerPwa() {
    // the browser fires this when the app could be installed; keep it for the Install button
    window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        installEvent = e;
        set({ canInstall: true });
    });
    window.addEventListener("appinstalled", () => {
        installEvent = null;
        set({ canInstall: false, installed: true });
    });

    if (!import.meta.env.PROD) return; // no service worker in development

    updateSW = registerSW({
        immediate: true,
        onOfflineReady: () => set({ offlineReady: true }),
        onNeedRefresh: () => set({ updateReady: true }),
        // while the app stays open, look for a new version every hour
        onRegisteredSW: (_url, registration) => {
            if (registration) setInterval(() => registration.update(), 60 * 60 * 1000);
        },
    });
}

/** Show the browser's install prompt. */
export async function promptInstall() {
    if (!installEvent) return;
    installEvent.prompt();
    await installEvent.userChoice;
    installEvent = null;
    set({ canInstall: false });
}

/** Switch to the waiting new version (reloads the page). */
export function applyUpdate() {
    updateSW?.(true);
}
