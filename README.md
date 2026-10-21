# Trip Planner

An offline-first PWA for travel itineraries. Install it from the browser on Android (Chrome) and iPhone (Safari). Data is stored **only on the phone** (IndexedDB).

**Live app:** https://rmorera84-svg.github.io/trip-planner/

## 1. Run it on your PC
```bash
npm install
npm run dev
```
Open the `Local` URL and click **"Ver viaje de ejemplo"**, or import your real JSON.

## 2. Push to GitHub
Create the repo `trip-planner` **empty** (no README, .gitignore or license). Then:
```bash
git config --global user.name "Roberto Morera"      # only if not set yet
git config --global user.email "you@example.com"    # personal email
git init
git add .
git commit -m "Week 1 starter"
git branch -M main
git remote add origin https://github.com/rmorera84-svg/trip-planner.git
git push -u origin main
```

## 3. Enable GitHub Pages
1. Repo → **Settings → Pages → Source: GitHub Actions**
2. Repo → **Actions** → wait for *Deploy to GitHub Pages* to turn green (re-run it if it ran before step 1)
3. Open https://rmorera84-svg.github.io/trip-planner/

Every `git push` to `main` redeploys automatically.

## 4. Install on the phones
| Phone | Steps |
|---|---|
| Android (Chrome) | Open the URL → menu ⋮ → **Install app** |
| iPhone (Safari only) | Open the URL → **Share** → **Add to Home Screen** → open from the icon |

Then **Importar itinerario** → pick the JSON (send it to yourself by WhatsApp/Drive/iCloud and save it to Files first).

## Privacy
This repo is public. **Never commit a real itinerary.** `.gitignore` blocks `eurotrip_*.json`, `*.private.json` and `trips/`. Only `public/sample-trip.json` (fake data) belongs here.

## Troubleshooting
- **Old version showing:** close the app completely and reopen.
- **npm peer-dependency error:** delete `node_modules` and `package-lock.json`, run `npm install` again.
- **Different repo name:** update `BASE` in `vite.config.js`.

## Roadmap
- **Week 2:** add/edit/delete events, reminder notifications, live weather (Open-Meteo), flight status (AeroDataBox)
- **Week 3:** login and sync (Supabase), TfL / iRail / Transitous transit data

## License
MIT. Transitous data requires attribution: https://transitous.org/sources/
