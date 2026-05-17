# makanApe — CLAUDE.md

> **"makan ape?"** — pasar Malay for *"what should we eat?"*
> A fun, mobile-first food randomiser that finds nearby restaurants and spins a wheel to decide for you.

---

## Read This First (Claude Onboarding)

This is the **single source of truth** for this project. Read it fully before touching any file.

**Current status: Phase 3 complete and running.** The app is a working Next.js 16 project.
- Run `npm run dev` to start (auto-opens browser at http://localhost:3000)
- Run `npx tsc --noEmit` to check types before committing
- Run `npm run build` to verify production build

**Key constraints — never violate these:**
- No `<form>` tags anywhere — use `<div>` + `onClick`
- Leaflet **must** use `dynamic(() => import(...), { ssr: false })` — crashes otherwise
- No `User-Agent` header in any `fetch()` call — browser blocks it
- `toggleCategory` in the store enforces minimum 1 category — don't bypass this
- Styling uses **inline styles** (not Tailwind classes) for all visual design — Tailwind v4 is installed but only used for custom animation classes defined in `globals.css`

---

## App Concept

makanApe solves the universal "makan ape?" problem — nobody can decide where to eat.

**Core loop:**
1. User opens app → GPS auto-detected (6s timeout) or manual city/search pick
2. Overpass API fetches real OSM restaurants nearby
3. User filters by food category, walkable toggle, radius
4. Filtered restaurants populate a spin wheel
5. User taps **PUTAR** — wheel spins with easeOut physics
6. Winner shown with Leaflet map, Waze/Google Maps links, share button
7. User can retry or change location

**Design direction:**
- Mobile-first (max-width 430px)
- Warm foodie theme: red `#E63946`, amber `#F4A261`, cream `#FFF8F0`
- Warm gradient background: `linear-gradient(160deg, #FFF8F0 0%, #FDEBD0 60%, #ffe0c0 100%)`
- Font: Nunito (rounded, friendly — imported via `next/font/google`)
- Bilingual: English UI with Malay flavor text
- No ape/monkey visuals — name is pasar Malay, not literal

---

## Tech Stack

| Layer | Tool | Notes |
|---|---|---|
| Framework | Next.js 16.2.6 (App Router) | `app/` directory, no `src/` |
| Styling | Inline styles + Tailwind v4 (animations only) | See Tailwind note below |
| Animation | CSS keyframes in `globals.css` | `animate-slide-up`, `animate-float`, etc. |
| State | Zustand 5 | `store/appStore.ts` |
| Map | Leaflet + react-leaflet + OpenStreetMap tiles | SSR-disabled via dynamic import |
| Icons/Fonts | Lucide React + Google Fonts (Nunito) | |
| Restaurant data | Overpass API (OSM) | No API key needed |
| Geocoding | Photon by Komoot | No API key needed |
| Navigation | Waze URI + Google Maps URL | Always free |

### Tailwind v4 — important note

The project uses **Tailwind v4** (`tailwindcss@^4`, `@tailwindcss/postcss`).

- `globals.css` uses `@import "tailwindcss"` (NOT the v3 `@tailwind base/components/utilities` directives)
- Custom animation classes are defined in `globals.css` with `@keyframes` + class names
- **All component visual styling uses inline styles** — this is intentional and consistent
- Do not try to use Tailwind utility classes for colors/spacing in components

---

## Project Structure

```
makanApe/
├── app/
│   ├── layout.tsx          # Nunito font, metadata, viewport export
│   ├── page.tsx            # Main app shell — screen router, no business logic
│   └── globals.css         # @import "tailwindcss" + custom keyframe animations
│
├── components/
│   ├── SpinWheel.tsx       # Hi-DPI canvas wheel, 290×290, glow ring, PUTAR button
│   ├── Confetti.tsx        # Canvas confetti burst (active: boolean prop)
│   ├── MapPreview.tsx      # dynamic() wrapper → LeafletMapInner + Waze/GMaps links
│   ├── LeafletMapInner.tsx # Actual react-leaflet map (client-only, no SSR)
│   ├── ResultCard.tsx      # Post-spin result — gradient header, badges, map, actions
│   ├── FilterBar.tsx       # Category chips + walkable toggle + radius buttons
│   ├── LocationScreen.tsx  # GPS button + Photon search + 18 Malaysian city grid
│   └── LoadingScreen.tsx   # Spinning 🎡 + bouncing dots
│
├── hooks/
│   ├── useGeolocation.ts   # GPS hook — 6s timeout, returns { location, gpsBlocked, requestGPS }
│   └── useRestaurants.ts   # Fetch hook — wraps fetchNearbyRestaurants
│
├── lib/
│   ├── overpass.ts         # Overpass query (restaurant+fast_food+cafe), dual endpoint fallback
│   ├── photon.ts           # Photon geocoder — prefers countrycode=MY results
│   ├── haversine.ts        # Real distance calculation (meters)
│   ├── osmCategory.ts      # OSM tags → FoodCategory + emoji
│   └── shareUtils.ts       # navigator.share → clipboard fallback
│
├── store/
│   └── appStore.ts         # Zustand store (see State section below)
│
├── types/
│   └── index.ts            # Restaurant, UserLocation, FoodCategory, AppScreen
│
├── public/
│   └── leaflet/            # marker-icon.png, marker-icon-2x.png, marker-shadow.png
│       (copied from node_modules/leaflet/dist/images/ — required for Leaflet markers)
│
├── open-dev.mjs            # Node script: starts Next.js + opens browser after 3s
└── CLAUDE.md               # This file
```

---

## Types (`types/index.ts`)

```typescript
export type FoodCategory =
  | "Local / Malay" | "Chinese" | "Indian" | "Western"
  | "Japanese / Korean" | "Fast Food" | "Cafe / Drinks";

export interface Restaurant {
  id: number;          // OSM node ID
  name: string;
  category: FoodCategory;
  distance: number;    // meters, haversine
  rating: number;      // pseudo-random from OSM ID (3.0–5.9)
  address: string;     // from OSM addr:* tags, fallback "Kuala Lumpur"
  lat: number;
  lng: number;
  emoji: string;       // category emoji
  priceRange: "💰" | "💰💰" | "💰💰💰";  // pseudo-random from OSM ID
  openNow: boolean | null;  // always null (OSM doesn't reliably have hours)
}

export interface UserLocation {
  lat: number;
  lng: number;
  label: string;  // display name, e.g. "KL City Centre" or "Your location"
}

export type AppScreen = "locating" | "loading" | "home" | "result";
```

---

## State (`store/appStore.ts`)

Zustand store — import with `useAppStore()`.

| Field | Type | Default | Notes |
|---|---|---|---|
| `screen` | `AppScreen` | `"locating"` | Controls which screen renders |
| `userLocation` | `UserLocation \| null` | `null` | Set after GPS or manual pick |
| `allRestaurants` | `Restaurant[]` | `[]` | Raw unfiltered results from Overpass |
| `selectedCategories` | `Set<FoodCategory>` | all 7 | Filter — always has ≥1 item |
| `walkableOnly` | `boolean` | `false` | Filters to ≤800m |
| `radius` | `number` | `1000` | Meters passed to Overpass query |
| `result` | `Restaurant \| null` | `null` | The wheel's picked restaurant |

**Actions:** `setScreen`, `setLocation`, `setRestaurants`, `toggleCategory`, `setWalkableOnly`, `setRadius`, `setResult`, `reset`

`reset()` — resets ALL state to defaults. Used by "Tukar kawasan" button to go back to LocationScreen.

**Export:** `ALL_CATEGORIES` array is also exported from the store file.

---

## Screen Flow (`app/page.tsx`)

```
App mount
  │
  ├─ useGeolocation fires on mount (6s timeout)
  │
  ├─ GPS success → handleLocation(gpsLocation) → screen: loading → home
  │
  └─ GPS blocked/timeout → screen: "home" (with no userLocation set)
         │
         └─ Renders LocationScreen (condition: !userLocation && screen in ["locating","home"])
               │
               ├─ City grid click → handleLocation(preset coords)
               ├─ Search → geocodePlace(Photon) → handleLocation(result)
               └─ GPS button → requestGPS() (re-attempts)
                               │
                               ▼
                    screen: "loading" → fetchNearbyRestaurants → screen: "home"
                               │
                    SpinWheel spins → onResult(restaurant)
                               │
                    screen: "result" → ResultCard + Confetti
                               │
               ┌───────────────┴───────────────┐
           "Cuba lagi"                    "Tukar kawasan"
           handleTryAgain()               reset()
           screen: "home"                 back to LocationScreen
```

---

## Data Sources

### Overpass API (`lib/overpass.ts`)
- Queries `amenity=restaurant`, `amenity=fast_food`, `amenity=cafe`
- Two endpoint fallbacks: `overpass-api.de` → `overpass.kumi.systems`
- Timeout: 25s per endpoint
- Results: filtered to named nodes, sorted by distance, capped at 35
- No API key needed

### Photon Geocoder (`lib/photon.ts`)
- `https://photon.komoot.io/api/?q=...&limit=5&lang=en`
- Prefers `countrycode === "MY"` results, falls back to first result
- Returns `UserLocation | null`
- No API key needed

### Leaflet Map (`components/LeafletMapInner.tsx`)
- Tiles: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- Default icon fix applied (deletes `_getIconUrl`, merges from `public/leaflet/`)
- Zoom 16, scroll wheel disabled
- **Always imported via `dynamic(..., { ssr: false })` in `MapPreview.tsx`**

---

## OSM Category Mapping (`lib/osmCategory.ts`)

Keyword matching on `name + cuisine` fields:

| Category | Emoji | Keywords matched |
|---|---|---|
| Cafe / Drinks | ☕ | cafe, coffee, tea, bubble, boba, dessert, bakery, juice |
| Japanese / Korean | 🍱 | sushi, ramen, udon, korean, bbq, hotpot, bulgogi |
| Western | 🍔 | burger, pizza, pasta, steak, western, grill, bistro |
| Indian | 🫓 | briyani, biryani, banana leaf, chapati, thosai, curry |
| Chinese | 🥢 | dim sum, kopitiam, bak kut, char siu, claypot, porridge |
| Fast Food | 🍟 | `amenity=fast_food` tag |
| Local / Malay | 🍛 | nasi, mee, laksa, roti, mamak, warung, rendang (default) |

---

## Known Issues & Gotchas

| Issue | Status | Fix |
|---|---|---|
| Tailwind v4 requires `@import "tailwindcss"` not v3 directives | Fixed | `globals.css` uses correct v4 import |
| Leaflet SSR crash | Fixed | `MapPreview.tsx` uses `dynamic(..., { ssr: false })` |
| `react-leaflet` must be installed separately | Fixed | In `package.json` |
| Next.js 16 `viewport` must be a separate export | Fixed | `layout.tsx` exports `viewport` separately from `metadata` |
| `next dev --open` flag not supported in Next.js 16 | Fixed | `open-dev.mjs` script opens browser after 3s delay |
| Canvas wheel winner calculation | Working | Normalise angle, pointer at right (0°), slice index from angle |
| Overpass returns 0 results | Handled | Returns `[]`, SpinWheel shows empty state message |
| Photon returns non-MY results | Handled | Filter `countrycode === "MY"` first |
| Leaflet marker images missing | Fixed | Copied to `public/leaflet/` |

---

## Animation Classes (defined in `globals.css`)

| Class | Effect |
|---|---|
| `animate-slide-up` | Fade + slide up from 24px below |
| `animate-float` | Gentle 8px vertical float loop |
| `animate-pop-in` | Scale pop with bounce (0.7 → 1.08 → 1) |
| `animate-fade-in` | Simple opacity fade |
| `animate-spin-slow` | Continuous rotation (1.2s) |
| `animate-pulse-ring` | Expanding ring pulse |
| `delay-100` to `delay-500` | Animation delay helpers |

---

## Commands

```bash
npm run dev          # Start dev server + auto-open browser
npx tsc --noEmit     # TypeScript check (run before committing)
npm run build        # Production build check
vercel               # Deploy preview to Vercel
vercel --prod        # Deploy to production
```

---

## Phase Progress

- **Phase 1** ✅ — Single-file prototype, hardcoded restaurants, canvas wheel
- **Phase 2** ✅ — Real GPS, Overpass API, Photon geocoder
- **Phase 3** ✅ — Full Next.js project structure, all components, Leaflet map, deployed-ready

---

## Future Features (Phase 4+)

These need a database — out of scope until there are real users.

### Easy wins (no database needed)
- [ ] **"Not today" blacklist** — localStorage, exclude restaurant from current session
- [ ] **Spin history** — localStorage, last 5 results
- [ ] **PWA manifest** — add to home screen on mobile
- [ ] **Shareable result URL** — `app/result/[id]/page.tsx` (encode restaurant in URL params)
- [ ] **Re-fetch on radius change** — currently radius only applies to initial fetch, not filter
- [ ] **Restaurant count badge on wheel** — show "35 kedai" inside wheel before spin

### Needs backend
- [ ] **Group voting** — session code, weighted wheel slices, realtime (Pusher)
- [ ] **Push notifications** — "Your group is ready to spin!"
- [ ] **User accounts** — save favourites, blacklists across devices
- [ ] **Restaurant photos** — Mapillary (free OSM photos) or skip

### Suggested stack when ready
- DB: Neon (free-tier PostgreSQL)
- ORM: Prisma
- Auth: NextAuth.js with Google
- Realtime: Pusher Channels (free tier)

---

## OSM Attribution

Required by OpenStreetMap ODbL license. Already in footer of all screens:

```
© OpenStreetMap contributors
```

---

## Coding Conventions

- **camelCase** for all variables, functions, props (no Hungarian notation)
- **Inline styles** for all visual design — do not use Tailwind classes for colors/spacing
- **No comments** unless the WHY is non-obvious
- **No `<form>` tags** — use `<div>` + `onClick`
- **Verb-prefix functions**: `fetchNearbyRestaurants`, `geocodePlace`, `handleLocation`
- One component per file, filename = component name

---

*makanApe — makan ape? Let the wheel decide. 🎡*
*Last updated: Phase 3 complete. App is live and working.*
