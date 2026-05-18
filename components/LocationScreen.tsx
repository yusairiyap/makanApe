"use client";
import { useState } from "react";
import { geocodePlace } from "@/lib/photon";
import { useAppStore } from "@/store/appStore";
import { getTheme } from "@/lib/theme";
import type { UserLocation } from "@/types";

const CITIES = [
  { label: "KLCC", name: "KL City Centre", lat: 3.158, lng: 101.7123, emoji: "🏙️" },
  { label: "PJ", name: "Petaling Jaya", lat: 3.1073, lng: 101.6067, emoji: "🏘️" },
  { label: "Subang", name: "Subang Jaya", lat: 3.0456, lng: 101.5832, emoji: "🛍️" },
  { label: "Shah Alam", name: "Shah Alam", lat: 3.0733, lng: 101.5185, emoji: "🌿" },
  { label: "i-City", name: "i-City Shah Alam", lat: 3.0804, lng: 101.5328, emoji: "🎡" },
  { label: "Cheras", name: "Cheras", lat: 3.0882, lng: 101.7332, emoji: "🍜" },
  { label: "Ampang", name: "Ampang", lat: 3.1478, lng: 101.7625, emoji: "🌆" },
  { label: "Bangsar", name: "Bangsar", lat: 3.1285, lng: 101.6741, emoji: "🍷" },
  { label: "Mont Kiara", name: "Mont Kiara", lat: 3.1682, lng: 101.6478, emoji: "✨" },
  { label: "JB", name: "Johor Bahru", lat: 1.4927, lng: 103.7414, emoji: "🌉" },
  { label: "Penang", name: "Georgetown, Penang", lat: 5.4141, lng: 100.3288, emoji: "🍢" },
  { label: "Ipoh", name: "Ipoh", lat: 4.5975, lng: 101.0901, emoji: "🥣" },
  { label: "Melaka", name: "Melaka", lat: 2.1896, lng: 102.2501, emoji: "🏛️" },
  { label: "KK", name: "Kota Kinabalu", lat: 5.9804, lng: 116.0735, emoji: "🌊" },
  { label: "Kuching", name: "Kuching", lat: 1.5497, lng: 110.3626, emoji: "🐱" },
  { label: "Alor Setar", name: "Alor Setar", lat: 6.1248, lng: 100.3673, emoji: "🌾" },
  { label: "Seremban", name: "Seremban", lat: 2.7297, lng: 101.9381, emoji: "🍖" },
  { label: "Kuantan", name: "Kuantan", lat: 3.8077, lng: 103.326, emoji: "🏖️" },
];

interface LocationScreenProps {
  onLocation: (loc: UserLocation) => void;
  onGPS: () => void;
}

export default function LocationScreen({ onLocation, onGPS }: LocationScreenProps) {
  const darkMode = useAppStore(s => s.darkMode);
  const t = getTheme(darkMode);

  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  async function handleSearch() {
    if (!search.trim()) return;
    setSearching(true);
    setSearchError("");
    const result = await geocodePlace(search);
    setSearching(false);
    if (result) {
      onLocation(result);
    } else {
      setSearchError("Tak jumpa. Cuba nama lain? 🤔");
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: t.pageBg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Hero */}
        <div className="animate-slide-up" style={{ textAlign: "center", marginBottom: 28 }}>
          <div className="animate-float" style={{ fontSize: 72, display: "inline-block", marginBottom: 4 }}>
            🍽️
          </div>
          <h1 style={{
            fontSize: 44, fontWeight: 900, color: "#E63946",
            lineHeight: 1, marginBottom: 10, letterSpacing: "-2px",
          }}>
            makan ape?
          </h1>
          <p style={{ color: t.textSub, fontSize: 15, fontWeight: 500 }}>
            Tak tau nak makan apa? Let the wheel decide! 🎡
          </p>
        </div>

        {/* GPS Button */}
        <div className="animate-slide-up delay-100" style={{ marginBottom: 16 }}>
          <button
            onClick={onGPS}
            style={{
              width: "100%",
              padding: "16px 24px",
              background: "linear-gradient(135deg, #E63946 0%, #c1121f 100%)",
              color: "#fff",
              fontWeight: 800,
              fontSize: 17,
              border: "none",
              borderRadius: 18,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              boxShadow: "0 8px 28px rgba(230,57,70,0.40), 0 2px 8px rgba(230,57,70,0.2)",
              transition: "transform 0.15s, box-shadow 0.15s",
              letterSpacing: "-0.3px",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(230,57,70,0.5), 0 2px 8px rgba(230,57,70,0.2)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(230,57,70,0.40), 0 2px 8px rgba(230,57,70,0.2)";
            }}
            onMouseDown={e => (e.currentTarget as HTMLElement).style.transform = "scale(0.97)"}
            onMouseUp={e => (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"}
          >
            <span style={{ fontSize: 22 }}>📍</span>
            Guna GPS saya
          </button>
        </div>

        {/* Divider */}
        <div className="animate-slide-up delay-200" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: darkMode ? "linear-gradient(to right, transparent, #4a2e18)" : "linear-gradient(to right, transparent, #e8c9a8)" }} />
          <span style={{ color: "#b8845a", fontSize: 12, fontWeight: 700, letterSpacing: "0.05em" }}>ATAU PILIH KAWASAN</span>
          <div style={{ flex: 1, height: 1, background: darkMode ? "linear-gradient(to left, transparent, #4a2e18)" : "linear-gradient(to left, transparent, #e8c9a8)" }} />
        </div>

        {/* Search */}
        <div className="animate-slide-up delay-200" style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="🔍  Cari kawasan... (e.g. Damansara)"
            style={{
              flex: 1, padding: "12px 16px",
              border: `2px solid ${t.inputBorder}`, borderRadius: 14,
              fontSize: 14, outline: "none",
              background: t.inputBg, color: t.text,
              transition: "border-color 0.2s, box-shadow 0.2s",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = "#E63946";
              e.currentTarget.style.boxShadow = "0 2px 12px rgba(230,57,70,0.15)";
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = t.inputBorder;
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
            }}
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            style={{
              padding: "12px 18px",
              background: searching ? (darkMode ? "#4a2e18" : "#e0c9b0") : "linear-gradient(135deg, #F4A261, #e07b39)",
              color: "#fff",
              fontWeight: 800,
              fontSize: 14,
              border: "none",
              borderRadius: 14,
              cursor: searching ? "not-allowed" : "pointer",
              boxShadow: "0 4px 14px rgba(244,162,97,0.4)",
              whiteSpace: "nowrap",
              transition: "transform 0.15s",
            }}
          >
            {searching ? "⏳" : "Cari"}
          </button>
        </div>

        {searchError && (
          <div className="animate-pop-in" style={{
            color: "#E63946", fontSize: 13, textAlign: "center",
            background: darkMode ? "#3a1508" : "#fff0f0",
            padding: "10px 14px",
            borderRadius: 12, marginBottom: 12,
            border: "1px solid #ffc5c5",
          }}>
            {searchError}
          </div>
        )}

        {/* City Grid */}
        <div className="animate-slide-up delay-300">
          <p style={{
            fontSize: 11, fontWeight: 800, color: "#b8845a",
            letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10, marginTop: 8,
          }}>
            Kawasan Popular 🇲🇾
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {CITIES.map((city) => (
              <button
                key={city.name}
                onClick={() => onLocation({ lat: city.lat, lng: city.lng, label: city.name })}
                style={{
                  padding: "12px 6px",
                  background: t.cardBg,
                  border: `1.5px solid ${t.cardBorder}`,
                  borderRadius: 14,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 5,
                  transition: "all 0.18s",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "#E63946";
                  el.style.background = darkMode ? "#3a1508" : "#fff5f5";
                  el.style.transform = "translateY(-3px)";
                  el.style.boxShadow = "0 8px 20px rgba(230,57,70,0.18)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = t.cardBorder;
                  el.style.background = t.cardBg;
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
                }}
              >
                <span style={{ fontSize: 22 }}>{city.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: t.textSub }}>{city.label}</span>
              </button>
            ))}
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: t.textMuted, marginTop: 20 }}>
          © OpenStreetMap contributors · developed by yusairi yap
        </p>
      </div>
    </div>
  );
}
