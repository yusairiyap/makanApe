"use client";
import { useAppStore, ALL_CATEGORIES } from "@/store/appStore";

const RADIUS_OPTIONS = [500, 1000, 2000, 5000];

const CATEGORY_EMOJI: Record<string, string> = {
  "Local / Malay": "🍛",
  "Chinese": "🥢",
  "Indian": "🫓",
  "Western": "🍔",
  "Japanese / Korean": "🍱",
  "Fast Food": "🍟",
  "Cafe / Drinks": "☕",
};

export default function FilterBar() {
  const { selectedCategories, toggleCategory, walkableOnly, setWalkableOnly, radius, setRadius } = useAppStore();

  return (
    <div style={{ width: "100%" }}>
      {/* Category chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
        {ALL_CATEGORIES.map(cat => {
          const active = selectedCategories.has(cat);
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              style={{
                padding: "7px 14px",
                borderRadius: 50,
                border: active ? "2px solid #E63946" : "2px solid #e8d5c0",
                background: active ? "linear-gradient(135deg, #E63946, #c1121f)" : "#fff",
                color: active ? "#fff" : "#7a5a40",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                transition: "all 0.18s",
                boxShadow: active ? "0 4px 12px rgba(230,57,70,0.3)" : "0 2px 6px rgba(0,0,0,0.06)",
                transform: active ? "scale(1.04)" : "scale(1)",
              }}
            >
              <span>{CATEGORY_EMOJI[cat]}</span>
              {cat}
            </button>
          );
        })}
      </div>

      {/* Walkable + Radius */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <button
          onClick={() => setWalkableOnly(!walkableOnly)}
          style={{
            padding: "7px 14px",
            borderRadius: 50,
            border: walkableOnly ? "2px solid #F4A261" : "2px solid #e8d5c0",
            background: walkableOnly ? "linear-gradient(135deg, #F4A261, #e07b39)" : "#fff",
            color: walkableOnly ? "#fff" : "#7a5a40",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
            transition: "all 0.18s",
            boxShadow: walkableOnly ? "0 4px 12px rgba(244,162,97,0.4)" : "0 2px 6px rgba(0,0,0,0.06)",
          }}
        >
          🚶 Jalan kaki je
        </button>

        <div style={{ display: "flex", gap: 6 }}>
          {RADIUS_OPTIONS.map(r => {
            const active = radius === r;
            return (
              <button
                key={r}
                onClick={() => setRadius(r)}
                style={{
                  padding: "7px 12px",
                  borderRadius: 50,
                  border: active ? "2px solid #E63946" : "2px solid #e8d5c0",
                  background: active ? "#fff5f5" : "#fff",
                  color: active ? "#E63946" : "#9a7a60",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.18s",
                  boxShadow: active ? "0 2px 8px rgba(230,57,70,0.2)" : "none",
                }}
              >
                {r < 1000 ? `${r}m` : `${r / 1000}km`}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
