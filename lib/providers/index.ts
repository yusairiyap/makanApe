import { fetchNearbyRestaurants } from "@/lib/overpass";
import { fetchGeoapify } from "./geoapify";
import { fetchTomTom } from "./tomtom";
import type { DataProvider, ProviderResult } from "@/types";

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    ),
  ]);
}

export async function fetchRestaurantsWithFallback(
  lat: number,
  lng: number,
  radiusM: number,
  preferredProvider: DataProvider
): Promise<ProviderResult> {
  if (preferredProvider === "overpass") {
    try {
      const restaurants = await withTimeout(
        fetchNearbyRestaurants(lat, lng, radiusM),
        20000
      );
      if (restaurants.length > 0) return { restaurants, provider: "overpass" };
    } catch {}

    if (process.env.NEXT_PUBLIC_GEOAPIFY_KEY) {
      try {
        const restaurants = await fetchGeoapify(lat, lng, radiusM);
        if (restaurants.length > 0) return { restaurants, provider: "geoapify" };
      } catch {}
    }

    if (process.env.NEXT_PUBLIC_TOMTOM_KEY) {
      try {
        const restaurants = await fetchTomTom(lat, lng, radiusM);
        if (restaurants.length > 0) return { restaurants, provider: "tomtom" };
      } catch {}
    }

    return { restaurants: [], provider: "overpass" };
  }

  if (preferredProvider === "geoapify") {
    try {
      const restaurants = await fetchGeoapify(lat, lng, radiusM);
      return { restaurants, provider: "geoapify" };
    } catch {
      return { restaurants: [], provider: "geoapify" };
    }
  }

  try {
    const restaurants = await fetchTomTom(lat, lng, radiusM);
    return { restaurants, provider: "tomtom" };
  } catch {
    return { restaurants: [], provider: "tomtom" };
  }
}
