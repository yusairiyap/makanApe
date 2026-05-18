import { haversineDistance } from "@/lib/haversine";
import type { Restaurant, DataProvider } from "@/types";

interface CacheEntry {
  lat: number;
  lng: number;
  radius: number;
  label: string;
  restaurants: Restaurant[];
  timestamp: number;
  provider: DataProvider;
}

const CACHE_KEY = "makanape_restaurants";
const CACHE_TTL = 6 * 60 * 60 * 1000;

export function saveRestaurantCache(
  lat: number,
  lng: number,
  radius: number,
  label: string,
  restaurants: Restaurant[],
  provider: DataProvider
): void {
  try {
    const entry: CacheEntry = { lat, lng, radius, label, restaurants, timestamp: Date.now(), provider };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {}
}

export function getCachedRestaurants(
  lat: number,
  lng: number,
  radius: number,
  provider: DataProvider
): { restaurants: Restaurant[]; label: string; timestamp: number } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) return null;
    if (entry.radius !== radius) return null;
    if (entry.provider !== provider) return null;
    const dist = haversineDistance(lat, lng, entry.lat, entry.lng);
    if (dist > entry.radius) return null;
    const restaurants = entry.restaurants
      .map(r => ({ ...r, distance: Math.round(haversineDistance(lat, lng, r.lat, r.lng)) }))
      .sort((a, b) => a.distance - b.distance);
    return { restaurants, label: entry.label, timestamp: entry.timestamp };
  } catch {
    return null;
  }
}
