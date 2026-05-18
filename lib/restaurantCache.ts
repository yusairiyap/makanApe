import { haversineDistance } from "@/lib/haversine";
import type { Restaurant } from "@/types";

interface CacheEntry {
  lat: number;
  lng: number;
  radius: number;
  label: string;
  restaurants: Restaurant[];
  timestamp: number;
}

const CACHE_KEY = "makanape_restaurants";
const CACHE_TTL = 30 * 60 * 1000;

export function saveRestaurantCache(
  lat: number,
  lng: number,
  radius: number,
  label: string,
  restaurants: Restaurant[]
): void {
  try {
    const entry: CacheEntry = { lat, lng, radius, label, restaurants, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {}
}

export function getCachedRestaurants(
  lat: number,
  lng: number,
  radius: number
): { restaurants: Restaurant[]; label: string } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) return null;
    if (entry.radius !== radius) return null;
    const dist = haversineDistance(lat, lng, entry.lat, entry.lng);
    if (dist > entry.radius) return null;
    const restaurants = entry.restaurants
      .map(r => ({ ...r, distance: haversineDistance(lat, lng, r.lat, r.lng) }))
      .sort((a, b) => a.distance - b.distance);
    return { restaurants, label: entry.label };
  } catch {
    return null;
  }
}
