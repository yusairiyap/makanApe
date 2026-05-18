import { haversineDistance } from "@/lib/haversine";
import { mapOSMTagsToCategory, getCategoryEmoji } from "@/lib/osmCategory";
import { pseudoRating, pseudoPrice, nameHash } from "@/lib/pseudoFields";
import type { Restaurant } from "@/types";

export async function fetchGeoapify(
  lat: number,
  lng: number,
  radiusM: number
): Promise<Restaurant[]> {
  const key = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;
  if (!key) throw new Error("NEXT_PUBLIC_GEOAPIFY_KEY not set");

  const url =
    `https://api.geoapify.com/v2/places` +
    `?categories=catering.restaurant,catering.fast_food,catering.cafe` +
    `&filter=circle:${lng},${lat},${radiusM}` +
    `&limit=40` +
    `&apiKey=${key}`;

  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`Geoapify ${res.status}`);

  const data = await res.json();
  if (!Array.isArray(data.features)) return [];

  return data.features
    .filter((f: any) => f.properties?.name)
    .map((f: any): Restaurant => {
      const p = f.properties;
      const raw = p.datasource?.raw ?? {};
      const featLat: number = f.geometry.coordinates[1];
      const featLng: number = f.geometry.coordinates[0];

      const osmId = raw.osm_id ? Number(raw.osm_id) : 0;
      const id = osmId > 0 ? osmId : nameHash(p.name + featLat + featLng);

      const category = mapOSMTagsToCategory(
        p.name,
        raw.cuisine,
        raw.amenity ?? "restaurant"
      );

      return {
        id,
        name: p.name,
        category,
        distance: Math.round(haversineDistance(lat, lng, featLat, featLng)),
        rating: pseudoRating(id),
        address: p.formatted ?? "Malaysia",
        lat: featLat,
        lng: featLng,
        emoji: getCategoryEmoji(category),
        priceRange: pseudoPrice(id),
        openNow: null,
        provider: "geoapify",
      };
    })
    .sort((a: Restaurant, b: Restaurant) => a.distance - b.distance)
    .slice(0, 25);
}
