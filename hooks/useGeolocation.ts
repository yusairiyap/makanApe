"use client";
import { useEffect, useState } from "react";
import type { UserLocation } from "@/types";

export function useGeolocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [gpsBlocked, setGpsBlocked] = useState(false);

  function requestGPS() {
    if (!navigator.geolocation) {
      setGpsBlocked(true);
      return;
    }
    const timeout = setTimeout(() => setGpsBlocked(true), 6000);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timeout);
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: "Your location",
        });
      },
      () => {
        clearTimeout(timeout);
        setGpsBlocked(true);
      },
      { timeout: 6000, enableHighAccuracy: false }
    );
  }

  return { location, gpsBlocked, requestGPS };
}
