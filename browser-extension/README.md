# AI ScamShield — Chrome Extension

## Load it (developer mode)
1. Start your backend: `cd backend && uvicorn app.main:app --reload`
2. Open Chrome → `chrome://extensions`
3. Turn on **Developer mode** (top-right toggle)
4. Click **Load unpacked** → select this `browser-extension` folder
5. Visit any website — the toolbar icon badge turns green/amber/red based on the risk score from `/api/v1/scan/url`

## Files
- `manifest.json` — Manifest V3 config
- `background.js` — calls the ScamShield API on every page load, sets the badge
- `content.js` — shows a red banner on pages scored "dangerous"
- `popup.html` / `popup.js` — click the icon to see the full verdict

## Notes
- Update `API_BASE` in `background.js` and `host_permissions` in `manifest.json` once you deploy the backend somewhere other than `localhost:8000`.
- Icons in `icons/` are placeholders — swap in your own branded PNGs (16/48/128 px).
