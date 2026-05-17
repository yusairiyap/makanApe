"use client";
import { useState, useCallback } from "react";
import { fetchNearbyRestaurants } from "@/lib/overpass";
import type { Restaurant, UserLocation } from "@/types";

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (location: UserLocation, radius: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await fetchNearbyRestaurants(location.lat, location.lng, radius);
      setRestaurants(results);
    } catch {
      setError("Failed to fetch restaurants. Check your connection.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { restaurants, isLoading, error, fetch };
}
