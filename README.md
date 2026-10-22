# Trip Planner

An offline-first PWA for travel itineraries. Install it from the browser on Android (Chrome) and iPhone (Safari). Data is stored **only on the phone** (IndexedDB).

**Live app:** https://rmorera84-svg.github.io/trip-planner/

## What's new in v0.2
- **New design:** "Now / Next" home screen, day chips, visual timeline, accent color that changes with each country, dark mode, glass tab bar
- **Live weather** on every event (Open-Meteo). More than 16 days ahead it shows the *typical* weather (same day last year)
- **London Tube fares** (TfL) with peak/off-peak and the £8.90 daily cap (zones 1–2)
- **Fuel prices** near driving events (Austria live via E-Control; links for Germany and Czechia)
- **Day map** with numbered stops, route, tonight's hotel and "my location" (Leaflet + OpenStreetMap). Viewed maps are cached for offline use
- **Add / edit / delete events** (bottom sheet). Deleted events can be restored in Ajustes
- Live data is cached, so the last values show without signal

## Run it on your PC
```bash
npm install
npm run dev
```

## Publish
Push to `main` (or upload the changed files on GitHub). The *Deploy to GitHub Pages* action rebuilds automatically.

## Privacy
This repo is public. **Never commit a real itinerary.** `.gitignore` blocks `eurotrip_*.json`, `*.private.json` and `trips/`.

## Data sources (free)
- Weather: [Open-Meteo](https://open-meteo.com) (non-commercial)
- London fares: [TfL Unified API](https://api.tfl.gov.uk)
- Fuel (Austria): [E-Control Spritpreisrechner](https://www.spritpreisrechner.at)
- Maps: © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors

## Roadmap
- **Week 3:** reminder notifications, sync between phones (Supabase), flight status (AeroDataBox), expenses, document wallet

## License
MIT
