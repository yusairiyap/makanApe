"use client";
import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/appStore";
import { useGeolocation } from "@/hooks/useGeolocation";
import { fetchNearbyRestaurants, fetchRestaurantsByKeyword } from "@/lib/overpass";
import { getTheme } from "@/lib/theme";
import LocationScreen from "@/components/LocationScreen";
import LoadingScreen from "@/components/LoadingScreen";
import FilterBar from "@/components/FilterBar";
import SpinWheel from "@/components/SpinWheel";
import ResultCard from "@/components/ResultCard";
import Confetti from "@/components/Confetti";
import RestaurantList from "@/components/RestaurantList";
import { saveRestaurantCache, getCachedRestaurants } from "@/lib/restaurantCache";
import type { Restaurant, UserLocation } from "@/types";

export default function HomePage() {
  const {
    screen, setScreen,
    userLocation, setLocation,
    allRestaurants, setRestaurants,
    specialRestaurants, setSpecialRestaurants,
    selectedCategories, specialFilters, excludedIds, radius,
    result, setResult, reset, clearExcludes,
    darkMode, toggleDarkMode,
  } = useAppStore();

  const t = getTheme(darkMode);

  const { location: gpsLocation, gpsBlocked, requestGPS } = useGeolocation();
  const [confetti, setConfetti] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [filterOpen, setFilterOpen] = useState(true);
  const [fetchError, setFetchError] = useState<"empty" | "error" | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isSpecialFetching, setIsSpecialFetching] = useState(false);
  const [cacheLabel, setCacheLabel] = useState<string | null>(null);
  const [usingCache, setUsingCache] = useState(false);
  const [cacheTimestamp, setCacheTimestamp] = useState<number | null>(null);
  const prevLocationKeyRef = useRef<string | null>(null);
  const bypassCacheRef = useRef(false);

  // Hydrate darkMode from localStorage on first mount
  useEffect(() => {
    const saved = localStorage.getItem("makanape-dark");
    if (saved === "1") useAppStore.setState({ darkMode: true });
  }, []);

  // Keep body background in sync with dark mode
  useEffect(() => {
    document.body.style.background = darkMode ? "#1a0d05" : "#FFF8F0";
  }, [darkMode]);

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

    const skipCache = bypassCacheRef.current;
    bypassCacheRef.current = false;

    setFetchError(null);

    const cached = skipCache ? null : getCachedRestaurants(userLocation.lat, userLocation.lng, radius);
    if (cached) {
      setCacheLabel(cached.label);
      if (isNewLocation) {
        setScreen("loading");
      } else {
        setIsFetching(true);
      }
      setTimeout(() => {
        setRestaurants(cached.restaurants);
        clearExcludes();
        setFetchError(cached.restaurants.length === 0 ? "empty" : null);
        setUsingCache(true);
        setCacheTimestamp(cached.timestamp);
        setCacheLabel(null);
        setIsFetching(false);
        setScreen("home");
      }, 700);
      return;
    }

    setCacheLabel(null);
    setUsingCache(false);
    setCacheTimestamp(null);
    if (isNewLocation) {
      setScreen("loading");
    } else {
      setIsFetching(true);
    }

    fetchNearbyRestaurants(userLocation.lat, userLocation.lng, radius)
      .then((restaurants) => {
        setRestaurants(restaurants);
        clearExcludes();
        setFetchError(restaurants.length === 0 ? "empty" : null);
        if (restaurants.length > 0) {
          saveRestaurantCache(userLocation.lat, userLocation.lng, radius, userLocation.label, restaurants);
        }
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

  useEffect(() => {
    if (!userLocation || specialFilters.size === 0) {
      setSpecialRestaurants([]);
      return;
    }
    setIsSpecialFetching(true);
    Promise.all(
      [...specialFilters].map(kw =>
        fetchRestaurantsByKeyword(userLocation.lat, userLocation.lng, radius, kw)
          .catch(() => [] as Restaurant[])
      )
    ).then(results => {
      const merged = new Map<number, Restaurant>();
      for (const list of results) {
        for (const r of list) merged.set(r.id, r);
      }
      setSpecialRestaurants([...merged.values()].sort((a, b) => a.distance - b.distance));
    }).finally(() => setIsSpecialFetching(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specialFilters, userLocation, radius]);

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
    setUsingCache(false);
    setCacheTimestamp(null);
    reset();
  }

  const filteredRestaurants = specialFilters.size > 0
    ? specialRestaurants.filter(r => r.distance <= radius)
    : allRestaurants.filter(r => {
        if (!selectedCategories.has(r.category)) return false;
        if (r.distance > radius) return false;
        return true;
      });

  const wheelRestaurants = filteredRestaurants.filter(r => !excludedIds.has(r.id));

  function handleGPS() {
    setScreen("loading");
    requestGPS();
  }

  const darkToggleBtn = (
    <button
      onClick={toggleDarkMode}
      title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 1000,
        width: 42,
        height: 42,
        borderRadius: "50%",
        background: darkMode ? "#f0dcc8" : "#2a1508",
        border: "none",
        cursor: "pointer",
        fontSize: 19,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 14px rgba(0,0,0,0.28)",
        transition: "background 0.25s, transform 0.15s",
      }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "scale(1.12)"}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "scale(1)"}
    >
      {darkMode ? "☀️" : "🌙"}
    </button>
  );

  if (!userLocation && screen === "home") {
    return (
      <>
        {darkToggleBtn}
        <LocationScreen onLocation={handleLocation} onGPS={handleGPS} />
      </>
    );
  }

  if (screen === "loading") {
    return (
      <>
        {darkToggleBtn}
        <LoadingScreen cacheLabel={cacheLabel} />
      </>
    );
  }

  if (screen === "result" && result) {
    return (
      <div
        className="animate-fade-in"
        style={{
          minHeight: "100vh",
          background: t.pageBg,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
        }}
      >
        {darkToggleBtn}
        <Confetti active={confetti} />
        <div style={{ width: "100%", maxWidth: 430 }}>
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

        <p style={{ marginTop: 20, fontSize: 11, color: t.textMuted }}>
          © OpenStreetMap contributors · developed by yusairi yap
        </p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: t.pageBg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "24px 16px 32px",
    }}>
      {darkToggleBtn}
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
              padding: "6px 14px", background: t.cardBg, borderRadius: 50,
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)", border: `1.5px solid ${t.cardBorder}`,
            }}>
              <span style={{ fontSize: 13 }}>📍</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: t.textSub }}>{userLocation?.label}</span>
              <span style={{ color: t.textMuted, fontSize: 12 }}>·</span>
              <span style={{ fontSize: 12, color: t.textMuted, fontWeight: 500 }}>{allRestaurants.length} kedai</span>
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center",
              background: t.cardBg, border: `1.5px solid ${t.cardBorder}`,
              borderRadius: 50, boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}>
              <button
                onClick={handleChangeLocation}
                style={{
                  padding: "6px 14px", background: "transparent", border: "none",
                  fontSize: 12, fontWeight: 700, color: t.textSub,
                  cursor: "pointer", transition: "color 0.18s",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#E63946"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = t.textSub}
              >
                ✏️ Tukar kawasan
              </button>
              {usingCache && (
                <>
                  <span style={{ width: 1, alignSelf: "stretch", background: t.cardBorder }} />
                  <button
                    onClick={() => {
                      setUsingCache(false);
                      bypassCacheRef.current = true;
                      setRetryCount(c => c + 1);
                    }}
                    title="Ambil data baru"
                    style={{
                      padding: "6px 10px", background: "transparent", border: "none",
                      fontSize: 14, color: t.textSub,
                      cursor: "pointer", transition: "color 0.18s",
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#c47a35"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = t.textSub}
                  >
                    🔄
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Spin wheel card */}
        <div
          className="animate-slide-up delay-100"
          style={{
            background: t.cardBg,
            borderRadius: 24,
            padding: "24px 16px",
            boxShadow: "0 8px 32px rgba(230,57,70,0.1), 0 2px 12px rgba(0,0,0,0.06)",
            border: `1px solid ${t.cardBorder}`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {fetchError ? (
            <div style={{ textAlign: "center", padding: "32px 16px" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>
                {fetchError === "empty" ? "🍽️" : "📡"}
              </div>
              <p style={{ fontWeight: 800, fontSize: 16, color: t.text, marginBottom: 6 }}>
                {fetchError === "empty" ? "Takde kedai dijumpai" : "Gagal sambung ke Overpass"}
              </p>
              <p style={{ fontSize: 13, color: t.textSub, marginBottom: 20 }}>
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
            <SpinWheel restaurants={wheelRestaurants} onResult={handleResult} cacheTimestamp={cacheTimestamp} />
          )}

          {/* Inline loading overlay */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: t.spinnerOverlay,
            backdropFilter: "blur(3px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            borderRadius: 24,
            opacity: isFetching || isSpecialFetching ? 1 : 0,
            pointerEvents: isFetching || isSpecialFetching ? "auto" : "none",
            transition: "opacity 0.3s ease",
          }}>
            <span className="animate-spin-slow" style={{ fontSize: 28, display: "inline-block" }}>🎡</span>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#9a6b4b", margin: 0 }}>Mencari kedai...</p>
          </div>
        </div>

        {/* Filter card */}
        <div
          className="animate-slide-up delay-200"
          style={{
            background: t.cardBg,
            borderRadius: 20,
            boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
            border: `1px solid ${t.cardBorder}`,
            overflow: "hidden",
          }}
        >
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

          <div style={{
            maxHeight: filterOpen ? "200px" : "0px",
            overflow: "hidden",
            transition: "max-height 0.3s ease",
          }}>
            <div style={{ padding: "0 16px 14px" }}>
              <FilterBar onRadiusChange={() => setFetchError(null)} isLoading={isFetching || isSpecialFetching} />
            </div>
          </div>
        </div>

        {/* Restaurant list card */}
        <div
          className="animate-slide-up delay-400"
          style={{
            background: t.cardBg,
            borderRadius: 20,
            padding: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
            border: `1px solid ${t.cardBorder}`,
          }}
        >
          <RestaurantList
            restaurants={filteredRestaurants}
            isLoading={isFetching || isSpecialFetching}
          />
        </div>

        {/* OSM contribution */}
        {userLocation && (
          <div style={{ textAlign: "center" }}>
            <a
              href={`https://www.openstreetmap.org/edit#map=19/${userLocation.lat}/${userLocation.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 12,
                color: t.textSub,
                textDecoration: "underline",
                textDecorationColor: t.textMuted,
              }}
            >
              + Missing a place? Add it to OpenStreetMap
            </a>
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: 11, color: t.textMuted }}>
          © OpenStreetMap contributors · developed by yusairi yap
        </p>
      </div>
    </div>
  );
}
