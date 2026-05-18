# Provider Setup Guide

makanApe supports three restaurant data providers: **Overpass (default)**, **Geoapify**, and **TomTom**. Both Geoapify and TomTom offer free tiers with no credit card required.

---

## Quick Start

By default, the app uses **Overpass API** with automatic fallback to Geoapify and TomTom if Overpass is slow (>20s timeout). To unlock all three providers, follow the steps below.

---

## Setup Geoapify

### 1. Get a Free API Key
- Go to [geoapify.com](https://www.geoapify.com/)
- Sign up (no credit card needed)
- Navigate to **API Keys** in your dashboard
- Copy your default API key (looks like `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

### 2. Add to Environment

Create or edit `.env.local` in the project root:

```bash
NEXT_PUBLIC_GEOAPIFY_KEY=your_api_key_here
```

### 3. Restart Dev Server

```bash
npm run dev
```

Done! Geoapify is now available as a fallback provider.

---

## Setup TomTom

### 1. Get a Free API Key
- Go to [developer.tomtom.com](https://developer.tomtom.com/)
- Sign up (no credit card needed)
- Go to **My Account** → **API Keys**
- Create a new API key (free tier: 2,500 requests/day)
- Copy the key

### 2. Add to Environment

Edit `.env.local` and add:

```bash
NEXT_PUBLIC_TOMTOM_KEY=your_api_key_here
```

Your `.env.local` should now look like:

```bash
NEXT_PUBLIC_GEOAPIFY_KEY=your_geoapify_key_here
NEXT_PUBLIC_TOMTOM_KEY=your_tomtom_key_here
```

### 3. Restart Dev Server

```bash
npm run dev
```

Done! All three providers are now active.

---

## How It Works

### Default Behavior (Auto-Fallback)
When you open the app and select a location, the system tries providers in this order:
1. **Overpass** (20-second timeout)
2. **Geoapify** (if Overpass is slow/fails)
3. **TomTom** (if Geoapify fails)

A `(fallback)` indicator appears in the header if a secondary provider was used.

### Manual Provider Selection
On the home screen header and location screen, you'll see three buttons: **OSM / Geoapify / TomTom**

- Click any button to manually select that provider
- The app will fetch fresh data from your chosen provider
- **No automatic fallback** — if your chosen provider fails, you'll see an error so you know what happened

### Provider-Specific Features
- **OSM (Overpass)** — Supports keyword-based special filters (e.g., "Ayam Gepok", "Matcha") and community contribution links
- **Geoapify** — OSM-backed data, fastest for most queries
- **TomTom** — Includes Foursquare POI data for better restaurant coverage in some areas

---

## Troubleshooting

### "Data filter shows only OSM"
If you don't see Geoapify/TomTom in the provider switcher, check:
1. API keys are set in `.env.local`
2. Dev server was restarted after adding keys (`npm run dev`)
3. Keys are valid (test them at geoapify.com / developer.tomtom.com)

### "Provider switcher is missing"
- Refresh the page (Ctrl+Shift+R for hard refresh)
- Clear browser cache
- Restart dev server

### "Special filters are grayed out"
Special keyword filters (Ayam Gepok, Matcha) only work with Overpass. Switch back to **OSM** provider to use them.

### "Edit on OpenStreetMap link missing"
This link only appears for restaurants from Overpass. Use the **OSM** provider to see it.

---

## Costs

| Provider | Free Tier | Limit | CC Required? |
|---|---|---|---|
| Overpass | Unlimited* | Varies | No |
| Geoapify | 3,000 credits/day | ~3,000 locations | No |
| TomTom | 2,500 requests/day | ~2,500 results | No |

*Overpass is community-run and occasionally slow/overloaded.

---

## Testing

To verify setup:
1. Open the app
2. On the location screen, you should see **OSM / Geoapify / TomTom** buttons above the city grid
3. Click "Geoapify" → select a city → wheel should populate
4. Click "TomTom" → select a city → wheel should populate
5. Click "OSM" → select a city → special filters row should reappear

All three should work. If any fails, check `.env.local` and restart the dev server.
