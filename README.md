# makanApe

> **"makan ape?"** — pasar Malay for *"what should we eat?"*

A mobile-first food randomiser that finds real nearby restaurants and spins a wheel to decide for you.

## What it does

1. Detects your location via GPS (or pick from 18 Malaysian cities)
2. Fetches real restaurants nearby using OpenStreetMap data
3. Filter by food category, walkable distance, or radius
4. Tap **PUTAR** — the wheel spins and picks for you
5. Get a map, Waze/Google Maps link, and share the result

## Running locally

```bash
npm install
npm run dev     # starts dev server + auto-opens browser
```

## Tech

- **Next.js 16** (App Router) + **TypeScript**
- **Zustand** for state
- **Leaflet + OpenStreetMap** for maps
- **Overpass API** for restaurant data (no API key needed)
- **Photon by Komoot** for geocoding (no API key needed)

---

*No accounts. No API keys. No ads. Just spin and eat.*
