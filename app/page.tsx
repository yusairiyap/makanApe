"use client";
import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/appStore";
import { useGeolocation } from "@/hooks/useGeolocation";
import { fetchNearbyRestaurants } from "@/lib/overpass";
import LocationScreen from "@/components/LocationScreen";
import LoadingScreen from "@/components/LoadingScreen";
import FilterBar from "@/components/FilterBar";
import SpinWheel from "@/components/SpinWheel";
import ResultCard from "@/components/ResultCard";
import Confetti from "@/components/Confetti";
import RestaurantList from "@/components/RestaurantList";
import type { Restaurant, UserLocation } from "@/types";

export default function HomePage() {
  const {
    screen, setScreen,
    userLocation, setLocation,
    allRestaurants, setRestaurants,
    selectedCategories, excludedIds, radius,
    result, setResult, reset, clearExcludes,
  } = useAppStore();

  const { location: gpsLocation, gpsBlocked, requestGPS } = useGeolocation();
  const [confetti, setConfetti] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [filterOpen, setFilterOpen] = useState(true);
  const [fetchError, setFetchError] = useState<"empty" | "error" | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const prevLocationKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (gpsLocation) handleLocation(gpsLocation);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gpsLocation]);

  useEffect(() => {
    if (gpsBlocked && !userLocation) setScreen("home");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gpsBlocked]);

  useEffect(() => {
    if (!userLocation) return;

    const locationKey = `${userLocation.lat},${userLocation.lng}`;
    const isNewLocation = prevLocationKeyRef.current !== locationKey;
    prevLocationKeyRef.current = locationKey;

    if (isNewLocation) {
      setScreen("loading");
    } else {
      setIsFetching(true);
    }

    setFetchError(null);
    fetchNearbyRestaurants(userLocation.lat, userLocation.lng, radius)
      .then((restaurants) => {
        setRestaurants(restaurants);
        clearExcludes();
        setFetchError(restaurants.length === 0 ? "empty" : null);
      })
      .catch(() => {
        setRestaurants([]);
        setFetchError("error");
      })
      .finally(() => {
        setIsFetching(false);
        setScreen("home");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation, radius, retryCount]);

  function handleLocation(loc: UserLocation) {
    setLocation(loc);
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
    setFetchError(null);
    reset();
  }

  const filteredRestaurants = allRestaurants.filter(r => {
    if (!selectedCategories.has(r.category)) return false;
    if (r.distance > radius) return false;
    return true;
  });

  const wheelRestaurants = filteredRestaurants.filter(r => !excludedIds.has(r.id));

  function handleGPS() {
    setScreen("loading");
    requestGPS();
  }

  if (!userLocation && screen === "home") {
    return <LocationScreen onLocation={handleLocation} onGPS={handleGPS} />;
  }

  if (screen === "loading") {
    return <LoadingScreen />;
  }

  if (screen === "result" && result) {
    return (
      <div
        className="animate-fade-in"
        style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #FFF8F0 0%, #FDEBD0 60%, #ffe0c0 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
        }}
      >
        <Confetti active={confetti} />
        <div style={{ width: "100%", maxWidth: 430 }}>
          {/* Result header */}
          <div className="animate-fall-down" style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 4 }}>🎉</div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: "#E63946", letterSpacing: "-1px", marginBottom: 12 }}>
              Jom makan!
            </h1>
          </div>

          <div className="animate-fall-down delay-100">
            <ResultCard restaurant={result} onTryAgain={handleTryAgain} />
          </div>
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
            boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
            border: "1px solid #f0e0cc",
            overflow: "hidden",
          }}
        >
          {/* Collapsible header */}
          <div
            onClick={() => setFilterOpen(o => !o)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 800, color: "#b8845a", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Filter kedai 🔧
            </span>
            <span style={{
              fontSize: 12,
              color: "#b8845a",
              display: "inline-block",
              transform: filterOpen ? "rotate(0deg)" : "rotate(-90deg)",
              transition: "transform 0.25s ease",
            }}>▼</span>
          </div>

          {/* Collapsible body */}
          <div style={{
            maxHeight: filterOpen ? "200px" : "0px",
            overflow: "hidden",
            transition: "max-height 0.3s ease",
          }}>
            <div style={{ padding: "0 16px 14px" }}>
              <FilterBar onRadiusChange={() => setFetchError(null)} />
            </div>
          </div>
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
            position: "relative",
            overflow: "hidden",
          }}
        >
          {fetchError ? (
            <div style={{ textAlign: "center", padding: "32px 16px" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>
                {fetchError === "empty" ? "🍽️" : "📡"}
              </div>
              <p style={{ fontWeight: 800, fontSize: 16, color: "#3d2b1a", marginBottom: 6 }}>
                {fetchError === "empty" ? "Takde kedai dijumpai" : "Gagal sambung ke Overpass"}
              </p>
              <p style={{ fontSize: 13, color: "#9a7a60", marginBottom: 20 }}>
                {fetchError === "empty"
                  ? "Cuba besarkan radius atau tukar kategori."
                  : "Overpass API tak boleh dihubungi. Cuba lagi sekejap."}
              </p>
              <button
                onClick={() => setRetryCount(c => c + 1)}
                style={{
                  padding: "12px 28px",
                  background: "linear-gradient(135deg, #E63946, #c1121f)",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 14,
                  border: "none",
                  borderRadius: 50,
                  cursor: "pointer",
                  boxShadow: "0 6px 18px rgba(230,57,70,0.35)",
                }}
              >
                🔄 Cuba lagi
              </button>
            </div>
          ) : (
            <SpinWheel restaurants={wheelRestaurants} onResult={handleResult} />
          )}

          {/* Inline loading overlay — only for radius/retry changes, not initial location load */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: "rgba(255, 248, 240, 0.82)",
            backdropFilter: "blur(3px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            borderRadius: 24,
            opacity: isFetching ? 1 : 0,
            pointerEvents: isFetching ? "auto" : "none",
            transition: "opacity 0.3s ease",
          }}>
            <span className="animate-spin-slow" style={{ fontSize: 28, display: "inline-block" }}>🎡</span>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#9a6b4b", margin: 0 }}>Mencari kedai...</p>
          </div>
        </div>

        {/* Restaurant list card */}
        {filteredRestaurants.length > 0 && (
          <div
            className="animate-slide-up delay-300"
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
              border: "1px solid #f0e0cc",
            }}
          >
            <RestaurantList restaurants={filteredRestaurants} />
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: 11, color: "#c9a882" }}>
          © OpenStreetMap contributors · developed by yusairi yap
        </p>
      </div>
    </div>
  );
}
