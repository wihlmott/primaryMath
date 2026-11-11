# Math Adventure: installable, works fully offline (PWA)

Tested in headless Chrome: installed once online, web server then shut down, app reopened in a fresh browser
session: it loads, the 3D explorers render, games play, progress saves. Also tested: Chrome's own
installability check (no errors), updating an already-installed copy, and hosting under a sub-path (GitHub Pages).

## 1. Where every file goes

Paths are relative to your project root (the folder with `package.json`).

| File | Goes in | Action |
|---|---|---|
| `index.html` | project root | replace |
| `vite.config.js` | project root | replace (or merge, see 2) |
| `public/pwa-192x192.png` | `public/` | new |
| `public/pwa-512x512.png` | `public/` | new |
| `public/maskable-icon-192x192.png` | `public/` | new |
| `public/maskable-icon-512x512.png` | `public/` | new |
| `public/apple-touch-icon.png` | `public/` | new |
| `public/favicon.svg` | `public/` | new |
| `public/favicon-32x32.png` | `public/` | new |
| `public/favicon.ico` | `public/` | new |
| `src/main.jsx` | `src/` | replace |
| `src/pwa.js` | `src/` | new |
| `src/components/PwaPanel.jsx` | `src/components/` | new |
| `src/pages/LandingPage.jsx` | `src/pages/` | replace |
| `src/styles/landing.css` | `src/styles/` | replace |

`public/` sits next to `src/`, NOT inside it. Vite copies it to the site root as-is.

Also in this update (drag the explorer to make it look around): `src/components/avatar3d.js`,
`src/components/AvatarViewer.jsx`, `src/pages/AdventureBook.jsx`, `src/styles/book.css`.

`math-adventure-full.zip` has the complete project files in the right folders (everything above plus all of src/).

## 2. Install the dependencies

    npm i -D vite-plugin-pwa
    npm i three            # only if you have not added it yet

Commit BOTH `package.json` and `package-lock.json`. (If you build with `npm ci`, a missing lockfile entry fails the build.)
Tested with vite-plugin-pwa 2.0.0, Vite 8.3, React 19. The plugin supports Vite 3 to 8.

If your own `vite.config.js` has extra settings or uses a different React plugin, keep those and add:
the `base` line, the `VitePWA({...})` block and its import from the new file.

## 3. Test it locally

The service worker only exists in a production build, so `npm run dev` does not use it:

    npm run build
    npm run preview          # open the address it prints

In Chrome DevTools, open Application:
- Service Workers: should say "activated and is running"
- Cache Storage: the precache is listed
- Manifest: shows the name, colours and icons, with no errors
- Tick "Offline" under Service Workers and reload: the game should still work

## 4. Deploy (HTTPS is required; localhost is exempt)

- Vercel, Netlify, Cloudflare Pages: nothing special. Build command `npm run build`, output folder `dist`.
- GitHub Pages (https://USER.github.io/REPO/): the site lives under /REPO/, so build with VITE_BASE.
  In a GitHub Actions workflow:

      - run: npm ci
      - run: npm run build
        env:
          VITE_BASE: /REPO/          # your repository name, with slashes
      # then upload ./dist as the Pages artifact

  Locally: `VITE_BASE=/REPO/ npm run build`. With a custom domain at the root, leave VITE_BASE unset.

## 5. Install it on a device

Open the site once with internet. Grown-up settings (landing page) shows "✓ Ready to play without internet"
when everything is saved (about 1.5 MB). Then:
- Android / Chrome: menu, "Install app" (or the "Install the app" button in Grown-up settings)
- iPhone / iPad: in Safari, tap Share, then "Add to Home Screen"
- Windows / Mac / Chromebook (Chrome or Edge): install icon in the address bar, or menu, "Install"

## 6. How offline and updates work

- First visit: every file the game needs (page, scripts including three.js, styles, icons) is saved on the device.
  After that the app opens from the device, so no internet is needed. Progress is saved in the browser's localStorage.
- To publish a new version just deploy. File names are hashed, there is no version number to bump.
  An already-installed copy notices (when it is opened online, and hourly while open), and the start screen
  shows "A new version is ready" with an Update button. It never reloads in the middle of a game.
  Saved players and progress are kept.

## 7. The icons

| File | Size | Used for |
|---|---|---|
| `pwa-192x192.png`, `pwa-512x512.png` | 192, 512 | "any" icons: rounded tile, transparent corners (desktop, Android) |
| `maskable-icon-192x192.png`, `maskable-icon-512x512.png` | 192, 512 | Android adaptive icons: full-bleed square, art kept inside the central 80% circle |
| `apple-touch-icon.png` | 180 | iPhone / iPad home screen |
| `favicon.svg`, `favicon-32x32.png`, `favicon.ico` | | browser tab |

To change the art later keep the file names and sizes. For maskable icons keep everything important inside
the central circle (80% of the width).

## 8. Troubleshooting

- No install option: the site must be https (or localhost) and built with `npm run build`. DevTools, Application, Manifest explains problems.
- Blank page on GitHub Pages: VITE_BASE does not match the repository name.
- Still on an old version: close every tab/window of the app and reopen it, or use the Update button. While testing: DevTools, Application, Service Workers, Unregister.
- iPhone / iPad: the Home Screen app keeps its own storage, separate from Safari tabs, so progress made in Safari will not appear in the installed app.
- Progress lives in this device's browser storage. Clearing site data erases it (there is no backup feature yet).
