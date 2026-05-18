import { fetchNearbyRestaurants } from "@/lib/overpass";
import { fetchGeoapify } from "./geoapify";
import { fetchTomTom } from "./tomtom";
import type { DataProvider } from "@/types";
import type { Restaurant } from "@/types";

export class ProviderError extends Error {
  constructor(public code: "timeout" | "error", message: string) {
    super(message);
    this.name = "ProviderError";
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new ProviderError("timeout", "timeout")), ms)
    ),
  ]);
}

export async function fetchRestaurantsFromProvider(
  lat: number,
  lng: number,
  radiusM: number,
  provider: DataProvider
): Promise<Restaurant[]> {
  let fetchPromise: Promise<Restaurant[]>;

  if (provider === "overpass") {
    fetchPromise = fetchNearbyRestaurants(lat, lng, radiusM);
  } else if (provider === "geoapify") {
    fetchPromise = fetchGeoapify(lat, lng, radiusM);
  } else {
    fetchPromise = fetchTomTom(lat, lng, radiusM);
  }

  try {
    return await withTimeout(fetchPromise, 25000);
  } catch (e) {
    if (e instanceof ProviderError) throw e;
    const msg = String(e).toLowerCase();
    if (msg.includes("timeout") || msg.includes("abort")) {
      throw new ProviderError("timeout", String(e));
    }
    throw new ProviderError("error", String(e));
  }
}
