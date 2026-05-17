"use client";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/appStore";
import { useGeolocation } from "@/hooks/useGeolocation";
import { fetchNearbyRestaurants } from "@/lib/overpass";
import LocationScreen from "@/components/LocationScreen";
import LoadingScreen from "@/components/LoadingScreen";
import FilterBar from "@/components/FilterBar";
import SpinWheel from "@/components/SpinWheel";
import ResultCard from "@/components/ResultCard";
import Confetti from "@/components/Confetti";
import type { Restaurant, UserLocation } from "@/types";

export default function HomePage() {
  const {
    screen, setScreen,
    userLocation, setLocation,
    allRestaurants, setRestaurants,
    selectedCategories, walkableOnly, radius,
    result, setResult, reset,
  } = useAppStore();

  const { location: gpsLocation, requestGPS } = useGeolocation();
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    if (gpsLocation) handleLocation(gpsLocation);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gpsLocation]);

  async function handleLocation(loc: UserLocation) {
    setLocation(loc);
    setScreen("loading");
    const restaurants = await fetchNearbyRestaurants(loc.lat, loc.lng, radius);
    setRestaurants(restaurants);
    setScreen("home");
  }

  function handleResult(r: Restaurant) {
    setResult(r);
    setConfetti(true);
    setScreen("result");
    setTimeout(() => setConfetti(false), 3500);
  }

  function handleTryAgain() {
    setResult(null);
    setScreen("home");
  }

  function handleChangeLocation() {
    reset();
  }

  const filteredRestaurants = allRestaurants.filter(r => {
    if (!selectedCategories.has(r.category)) return false;
    if (walkableOnly && r.distance > 800) return false;
    return true;
  });

  if (!userLocation && screen === "home") {
    return <LocationScreen onLocation={handleLocation} onGPS={requestGPS} />;
  }

  if (screen === "loading") {
    return <LoadingScreen />;
  }

  if (screen === "result" && result) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #FFF8F0 0%, #FDEBD0 60%, #ffe0c0 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}>
        <Confetti active={confetti} />
        <div style={{ width: "100%", maxWidth: 430 }}>
          {/* Result header */}
          <div className="animate-slide-up" style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 4 }}>🎉</div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: "#E63946", letterSpacing: "-1px", marginBottom: 12 }}>
              Jom makan!
            </h1>
          </div>

          <ResultCard restaurant={result} onTryAgain={handleTryAgain} />
        </div>

        <p style={{ marginTop: 20, fontSize: 11, color: "#c9a882" }}>
          © OpenStreetMap contributors · developed by yusairi yap
        </p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #FFF8F0 0%, #FDEBD0 60%, #ffe0c0 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "24px 16px 32px",
    }}>
      <div style={{ width: "100%", maxWidth: 430, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* App header */}
        <div className="animate-slide-up" style={{ textAlign: "center" }}>
          <h1 style={{
            fontSize: 32, fontWeight: 900, color: "#E63946",
            letterSpacing: "-1px", marginBottom: 4,
          }}>
            makan ape? 🍽️
          </h1>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "6px 14px", background: "#fff", borderRadius: 50,
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)", border: "1.5px solid #f0d5b5",
            }}>
              <span style={{ fontSize: 13 }}>📍</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#7a5a40" }}>{userLocation?.label}</span>
              <span style={{ color: "#c4a882", fontSize: 12 }}>·</span>
              <span style={{ fontSize: 12, color: "#9a7a60", fontWeight: 500 }}>{allRestaurants.length} kedai</span>
            </div>
            <button
              onClick={handleChangeLocation}
              style={{
                padding: "6px 14px", background: "#fff", border: "1.5px solid #f0d5b5",
                borderRadius: 50, fontSize: 12, fontWeight: 700, color: "#9a6b4b",
                cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                transition: "all 0.18s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "#E63946";
                (e.currentTarget as HTMLElement).style.color = "#E63946";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "#f0d5b5";
                (e.currentTarget as HTMLElement).style.color = "#9a6b4b";
              }}
            >
              ✏️ Tukar kawasan
            </button>
          </div>
        </div>

        {/* Filter card */}
        <div
          className="animate-slide-up delay-100"
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
            border: "1px solid #f0e0cc",
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 800, color: "#b8845a", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
            Filter kedai 🔧
          </p>
          <FilterBar />
        </div>

        {/* Spin wheel card */}
        <div
          className="animate-slide-up delay-200"
          style={{
            background: "#fff",
            borderRadius: 24,
            padding: "24px 16px",
            boxShadow: "0 8px 32px rgba(230,57,70,0.1), 0 2px 12px rgba(0,0,0,0.06)",
            border: "1px solid #f0e0cc",
          }}
        >
          <SpinWheel restaurants={filteredRestaurants} onResult={handleResult} />
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: "#c9a882" }}>
          © OpenStreetMap contributors · developed by yusairi yap
        </p>
      </div>
    </div>
  );
}
