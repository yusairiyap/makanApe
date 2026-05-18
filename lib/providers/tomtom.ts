import { mapOSMTagsToCategory, getCategoryEmoji } from "@/lib/osmCategory";
import { pseudoRating, pseudoPrice, nameHash } from "@/lib/pseudoFields";
import type { Restaurant } from "@/types";

export async function fetchTomTom(
  lat: number,
  lng: number,
  radiusM: number
): Promise<Restaurant[]> {
  const key = process.env.NEXT_PUBLIC_TOMTOM_KEY;
  if (!key) throw new Error("NEXT_PUBLIC_TOMTOM_KEY not set");

  const url =
    `https://api.tomtom.com/search/2/nearbySearch/.json` +
    `?lat=${lat}&lon=${lng}` +
    `&radius=${radiusM}` +
    `&categorySet=7315,7311` +
    `&limit=40` +
    `&key=${key}`;

  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`TomTom ${res.status}`);

  const data = await res.json();
  if (!Array.isArray(data.results)) return [];

  return data.results
    .filter((r: any) => r.poi?.name)
    .map((r: any): Restaurant => {
      const id = nameHash(r.id + r.poi.name);

      const cats: string[] = (r.poi.categories ?? []).map((c: string) =>
        c.toLowerCase()
      );
      const derivedAmenity = cats.some((c) => c.includes("fast food"))
        ? "fast_food"
        : cats.some((c) => c.includes("cafe") || c.includes("coffee"))
        ? "cafe"
        : "restaurant";

      const category = mapOSMTagsToCategory(r.poi.name, undefined, derivedAmenity);

      return {
        id,
        name: r.poi.name,
        category,
        distance: Math.round(r.dist ?? 0),
        rating: pseudoRating(id),
        address: r.address?.freeformAddress ?? "Malaysia",
        lat: r.position.lat,
        lng: r.position.lon,
        emoji: getCategoryEmoji(category),
        priceRange: pseudoPrice(id),
        openNow: null,
        provider: "tomtom",
      };
    })
    .sort((a: Restaurant, b: Restaurant) => a.distance - b.distance)
    .slice(0, 25);
}
