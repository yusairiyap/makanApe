import { haversineDistance } from "./haversine";
import { mapOSMTagsToCategory, getCategoryEmoji } from "./osmCategory";
import { pseudoRating, pseudoPrice } from "./pseudoFields";
import type { Restaurant } from "@/types";

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

export async function fetchRestaurantsByKeyword(
  lat: number,
  lng: number,
  radiusM: number,
  keyword: string
): Promise<Restaurant[]> {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"~"restaurant|fast_food|cafe"]["name"~"${escaped}",i](around:${radiusM},${lat},${lng});
    );
    out body;
  `;

  let data: any = null;
  for (const endpoint of ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(25000),
      });
      if (res.ok) {
        data = await res.json();
        break;
      }
    } catch {
      continue;
    }
  }

  if (!data?.elements?.length) return [];

  return data.elements
    .filter((el: any) => el.tags?.name)
    .map((el: any): Restaurant => {
      const tags = el.tags;
      const category = mapOSMTagsToCategory(tags.name ?? "", tags.cuisine, tags.amenity);
      const distance = haversineDistance(lat, lng, el.lat, el.lon);
      const parts = [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"]]
        .filter(Boolean)
        .join(", ");
      return {
        id: el.id,
        name: tags.name,
        category,
        distance: Math.round(distance),
        rating: pseudoRating(el.id),
        address: parts || "Kuala Lumpur",
        lat: el.lat,
        lng: el.lon,
        emoji: getCategoryEmoji(category),
        priceRange: pseudoPrice(el.id),
        openNow: null,
        provider: "overpass" as const,
      };
    })
    .sort((a: Restaurant, b: Restaurant) => a.distance - b.distance);
}

export async function fetchNearbyRestaurants(
  lat: number,
  lng: number,
  radiusM: number
): Promise<Restaurant[]> {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="restaurant"](around:${radiusM},${lat},${lng});
      node["amenity"="fast_food"](around:${radiusM},${lat},${lng});
      node["amenity"="cafe"](around:${radiusM},${lat},${lng});
    );
    out body;
  `;

  let data: any = null;
  for (const endpoint of ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(25000),
      });
      if (res.ok) {
        data = await res.json();
        break;
      }
    } catch {
      continue;
    }
  }

  if (!data?.elements?.length) return [];

  return data.elements
    .filter((el: any) => el.tags?.name)
    .map((el: any): Restaurant => {
      const tags = el.tags;
      const category = mapOSMTagsToCategory(
        tags.name ?? "",
        tags.cuisine,
        tags.amenity
      );
      const distance = haversineDistance(lat, lng, el.lat, el.lon);
      const parts = [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"]]
        .filter(Boolean)
        .join(", ");
      return {
        id: el.id,
        name: tags.name,
        category,
        distance: Math.round(distance),
        rating: pseudoRating(el.id),
        address: parts || "Kuala Lumpur",
        lat: el.lat,
        lng: el.lon,
        emoji: getCategoryEmoji(category),
        priceRange: pseudoPrice(el.id),
        openNow: null,
        provider: "overpass" as const,
      };
    })
    .sort((a: Restaurant, b: Restaurant) => a.distance - b.distance)
    .slice(0, 25);
}
