# Update: big explorer on the landing page, adventure page redesign, Bonds "pick the pair"

## Files (paths are inside `src/`)

New:
- `components/MapIcon.jsx`        treasure-map icon for the "My adventure" button
- `game/BondPickProblem.jsx`      the new Bonds screen: pick the two numbers that make the whole

Replace:
- `utils/mathEngine.js`           bonds now mix "type it" and "pick the pair" (about 40% pick)
- `game/Game.jsx`                 shows the new bonds screen
- `pages/LandingPage.jsx`         big explorer, sideways strip, map button near the top
- `pages/AdventureBook.jsx`       Dress up / Journey pages, stickers left, explorer right
- `components/AvatarViewer.jsx`   taller portrait view, zooms to a sticker when it changes
- `components/render3d.js`        a little more headroom for tall hats
- `styles/game.css`, `styles/landing.css`, `styles/book.css`

No new dependencies. Nothing to change in `package.json`, `vite.config.js` or `public/`.
If you installed the app as a PWA, the start screen shows "A new version is ready. Update" after you deploy.
