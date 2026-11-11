import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Where the site is served from.
//   "/"            a normal host: Vercel, Netlify, Cloudflare Pages, your own domain
//   "/<repo-name>/" GitHub Pages project sites (https://<user>.github.io/<repo-name>/)
// For GitHub Pages, build with the environment variable VITE_BASE=/<repo-name>/
const base = process.env.VITE_BASE || "/";

export default defineConfig({
    base,
    plugins: [
        react(),
        VitePWA({
            // New versions wait until the learner chooses to update (see src/pwa.js),
            // so a game is never reloaded in the middle of a round.
            registerType: "prompt",
            injectRegister: false, // src/pwa.js registers the service worker itself

            includeAssets: ["favicon.svg", "favicon.ico", "favicon-32x32.png", "apple-touch-icon.png"],

            manifest: {
                name: "Math Adventure",
                short_name: "Math Adventure",
                description:
                    "A maths game for kids: add, subtract, multiply, number bonds, missing numbers, comparing and skip counting. Works offline.",
                lang: "en",
                theme_color: "#2563eb",
                background_color: "#dff3ff",
                display: "standalone",
                categories: ["education", "games", "kids"],
                icons: [
                    { src: "pwa-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
                    { src: "pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
                    { src: "maskable-icon-192x192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
                    { src: "maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
                ],
            },

            workbox: {
                // Everything the game needs is downloaded once, when the app is first opened,
                // and kept: the page, all scripts (including three.js), styles and icons.
                globPatterns: ["**/*.{js,css,html,svg,png,ico,webmanifest}"],
                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // the 3D code is the largest file
                navigateFallback: "index.html",
                cleanupOutdatedCaches: true,
            },
        }),
    ],
});
