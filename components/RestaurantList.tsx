"use client";
import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { getTheme } from "@/lib/theme";
import type { Restaurant } from "@/types";

interface RestaurantListProps {
  restaurants: Restaurant[];
  isLoading?: boolean;
}

export default function RestaurantList({ restaurants, isLoading }: RestaurantListProps) {
  const { excludedIds, toggleExclude, darkMode } = useAppStore();
  const t = getTheme(darkMode);
  const [search, setSearch] = useState("");

  const shimmerStyle = {
    background: `linear-gradient(90deg, ${t.shimmerFrom} 25%, ${t.shimmerMid} 50%, ${t.shimmerFrom} 75%)`,
    backgroundSize: "200% auto",
  };

  const query = search.toLowerCase().trim();
  const visible = query
    ? restaurants.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.category.toLowerCase().includes(query)
      )
    : restaurants;

  const activeCount = restaurants.filter((r) => !excludedIds.has(r.id)).length;
  const excludedCount = excludedIds.size;

  if (isLoading) {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: "#b8845a", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
            Dalam wheel ni 🍽️
          </p>
          <div className="animate-shimmer" style={{ width: 52, height: 13, borderRadius: 6, ...shimmerStyle }} />
        </div>
        <div className="animate-shimmer" style={{ height: 36, borderRadius: 12, marginBottom: 10, ...shimmerStyle }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, background: darkMode ? "#200900" : "#FFF8F0", border: `1px solid ${t.cardBorder}` }}>
              <div className="animate-shimmer" style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, ...shimmerStyle }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                <div className="animate-shimmer" style={{ height: 12, borderRadius: 6, width: `${60 + (i % 3) * 15}%`, ...shimmerStyle }} />
                <div className="animate-shimmer" style={{ height: 10, borderRadius: 6, width: "45%", ...shimmerStyle }} />
              </div>
              <div className="animate-shimmer" style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, ...shimmerStyle }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: "#b8845a", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
          Dalam wheel ni 🍽️
        </p>
        <p style={{ fontSize: 11, color: t.textSub, margin: 0, fontWeight: 600 }}>
          {activeCount} aktif
          {excludedCount > 0 && (
            <span style={{ color: "#E63946" }}> · {excludedCount} excluded</span>
          )}
        </p>
      </div>

      {/* Search input */}
      <div style={{ position: "relative", marginBottom: 10 }}>
        <span style={{
          position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
          fontSize: 14, color: t.textMuted, pointerEvents: "none",
        }}>🔍</span>
        <input
          type="text"
          placeholder="Cari kedai..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "9px 12px 9px 32px",
            borderRadius: 12,
            border: `1.5px solid ${t.cardBorder}`,
            background: darkMode ? "#200900" : "#FFF8F0",
            fontSize: 13,
            color: t.text,
            outline: "none",
            fontFamily: "inherit",
            boxSizing: "border-box",
          }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            style={{
              position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer",
              fontSize: 14, color: t.textMuted, padding: 2, lineHeight: 1,
            }}
          >
            ✕
          </button>
        )}
      </div>

      {restaurants.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 16px" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🫙</div>
          <p style={{ fontWeight: 700, fontSize: 13, color: t.textSub, margin: 0 }}>Takde kedai dalam wheel</p>
          <p style={{ fontSize: 12, color: t.textMuted, margin: "4px 0 0" }}>Cuba tukar filter atau besarkan radius.</p>
        </div>
      ) : visible.length === 0 ? (
        <p style={{ textAlign: "center", color: t.textMuted, fontSize: 13, padding: "12px 0" }}>
          Takde kedai yang sepadan 🤷
        </p>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {visible.map((r) => {
          const excluded = excludedIds.has(r.id);
          return (
            <div
              key={r.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 12,
                background: excluded
                  ? (darkMode ? "#160700" : "#f8f4f0")
                  : (darkMode ? "#200900" : "#FFF8F0"),
                border: `1px solid ${excluded ? t.cardBorder : (darkMode ? "#4a2e18" : "#f5e8d8")}`,
                opacity: excluded ? 0.6 : 1,
                transition: "all 0.18s",
              }}
            >
              <span style={{ fontSize: 20, flexShrink: 0 }}>{r.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontWeight: 700, fontSize: 13, color: t.text, margin: 0,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  textDecoration: excluded ? "line-through" : "none",
                }}>
                  {r.name}
                </p>
                <p style={{ fontSize: 11, color: t.textSub, margin: 0 }}>
                  {r.category} · {r.distance < 1000 ? `${r.distance}m` : `${(r.distance / 1000).toFixed(1)}km`}
                </p>
              </div>
              <button
                onClick={() => toggleExclude(r.id)}
                title={excluded ? "Restore to wheel" : "Exclude from wheel"}
                style={{
                  flexShrink: 0,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "none",
                  background: excluded
                    ? (darkMode ? "#2e1400" : "#e8ddd4")
                    : (darkMode ? "#2a0800" : "#fde0e0"),
                  color: excluded ? t.textMuted : "#E63946",
                  fontSize: 13,
                  fontWeight: 900,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.18s",
                  lineHeight: 1,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "scale(1.15)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                }}
              >
                {excluded ? "↩" : "✕"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
