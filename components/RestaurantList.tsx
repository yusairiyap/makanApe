"use client";
import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import type { Restaurant } from "@/types";

interface RestaurantListProps {
  restaurants: Restaurant[];
}

export default function RestaurantList({ restaurants }: RestaurantListProps) {
  const { excludedIds, toggleExclude } = useAppStore();
  const [search, setSearch] = useState("");

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

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: "#b8845a", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
          Dalam wheel ni 🍽️
        </p>
        <p style={{ fontSize: 11, color: "#9a7a60", margin: 0, fontWeight: 600 }}>
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
          fontSize: 14, color: "#c4a882", pointerEvents: "none",
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
            border: "1.5px solid #f0e0cc",
            background: "#FFF8F0",
            fontSize: 13,
            color: "#3d2b1a",
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
              fontSize: 14, color: "#c4a882", padding: 2, lineHeight: 1,
            }}
          >
            ✕
          </button>
        )}
      </div>

      {visible.length === 0 && (
        <p style={{ textAlign: "center", color: "#c4a882", fontSize: 13, padding: "12px 0" }}>
          Takde kedai yang sepadan 🤷
        </p>
      )}

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
                background: excluded ? "#f8f4f0" : "#FFF8F0",
                border: `1px solid ${excluded ? "#e8ddd4" : "#f5e8d8"}`,
                opacity: excluded ? 0.6 : 1,
                transition: "all 0.18s",
              }}
            >
              <span style={{ fontSize: 20, flexShrink: 0 }}>{r.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontWeight: 700, fontSize: 13, color: "#3d2b1a", margin: 0,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  textDecoration: excluded ? "line-through" : "none",
                }}>
                  {r.name}
                </p>
                <p style={{ fontSize: 11, color: "#9a7a60", margin: 0 }}>
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
                  background: excluded ? "#e8ddd4" : "#fde0e0",
                  color: excluded ? "#7a6a60" : "#E63946",
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
