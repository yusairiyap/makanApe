import type { UserLocation } from "@/types";

export async function geocodePlace(query: string): Promise<UserLocation | null> {
  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lang=en`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const features: any[] = data.features ?? [];
    const myResult = features.find(
      (f) => f.properties?.countrycode === "MY"
    ) ?? features[0];
    if (!myResult) return null;
    const [lng, lat] = myResult.geometry.coordinates;
    const props = myResult.properties;
    const label = [props.name, props.state, props.country]
      .filter(Boolean)
      .join(", ");
    return { lat, lng, label };
  } catch {
    return null;
  }
}
