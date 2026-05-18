"use client";
import { useRef, useState } from "react";
import { useAppStore, ALL_CATEGORIES, SPECIAL_FILTERS } from "@/store/appStore";

const RADIUS_OPTIONS: { value: number; label: string }[] = [
  { value: 800, label: "🚶 Jalan kaki" },
  { value: 500, label: "500m" },
  { value: 1000, label: "1km" },
  { value: 2000, label: "2km" },
  { value: 5000, label: "5km" },
  { value: 10000, label: "10km" },
];

const CATEGORY_EMOJI: Record<string, string> = {
  "Local / Malay": "🍛",
  "Chinese": "🥢",
  "Indian": "🫓",
  "Western": "🍔",
  "Japanese / Korean": "🍱",
  "Fast Food": "🍟",
  "Cafe / Drinks": "☕",
};

function fadeOverlay(side: "left" | "right", visible: boolean) {
  return {
    position: "absolute" as const,
    [side]: 0,
    top: 0,
    bottom: 0,
    width: 40,
    background: side === "right"
      ? "linear-gradient(to right, transparent, #fff)"
      : "linear-gradient(to left, transparent, #fff)",
    pointerEvents: "none" as const,
    zIndex: 1,
    opacity: visible ? 1 : 0,
    transition: "opacity 0.2s ease",
  };
}

function useScrollRow() {
  const ref = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);

  function onScroll() {
    setAtStart((ref.current?.scrollLeft ?? 0) < 4);
  }

  function onWheel(e: React.WheelEvent) {
    if (!ref.current) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    e.preventDefault();
    ref.current.scrollLeft += e.deltaY;
  }

  return { ref, atStart, onScroll, onWheel };
}

interface FilterBarProps {
  onRadiusChange?: (r: number) => void;
  isLoading?: boolean;
}

export default function FilterBar({ onRadiusChange, isLoading }: FilterBarProps) {
  const { selectedCategories, toggleCategory, specialFilters, toggleSpecialFilter, radius, setRadius } = useAppStore();
  const cats = useScrollRow();
  const radii = useScrollRow();
  const specials = useScrollRow();

  function handleRadius(r: number) {
    setRadius(r);
    onRadiusChange?.(r);
  }

  return (
    <div style={{ width: "100%", pointerEvents: isLoading ? "none" : "auto", opacity: isLoading ? 0.45 : 1, transition: "opacity 0.25s ease" }}>
      {/* Category chips — horizontal scroll */}
      <div style={{ position: "relative", marginBottom: 2 }}>
        <div
          ref={cats.ref}
          onScroll={cats.onScroll}
          onWheel={cats.onWheel}
          className="hide-scrollbar"
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingTop: 8,
            paddingBottom: 8,
            paddingLeft: 6,
            paddingRight: 36,
          }}
        >
          {ALL_CATEGORIES.map(cat => {
            const active = selectedCategories.has(cat);
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                style={{
                  flexShrink: 0,
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
                  boxShadow: active ? "0 2px 8px rgba(230,57,70,0.25)" : "0 2px 6px rgba(0,0,0,0.06)",
                  whiteSpace: "nowrap",
                }}
              >
                <span>{CATEGORY_EMOJI[cat]}</span>
                {cat}
              </button>
            );
          })}
        </div>
        <div style={fadeOverlay("left", !cats.atStart)} />
        <div style={fadeOverlay("right", true)} />
      </div>

      {/* Radius options — horizontal scroll */}
      <div style={{ position: "relative" }}>
        <div
          ref={radii.ref}
          onScroll={radii.onScroll}
          onWheel={radii.onWheel}
          className="hide-scrollbar"
          style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            paddingTop: 8,
            paddingBottom: 8,
            paddingLeft: 6,
            paddingRight: 36,
          }}
        >
          {RADIUS_OPTIONS.map(opt => {
            const active = radius === opt.value;
            const isWalkable = opt.value === 800;
            return (
              <button
                key={opt.value}
                onClick={() => handleRadius(opt.value)}
                style={{
                  flexShrink: 0,
                  padding: "7px 12px",
                  borderRadius: 50,
                  border: active
                    ? `2px solid ${isWalkable ? "#F4A261" : "#E63946"}`
                    : "2px solid #e8d5c0",
                  background: active
                    ? isWalkable ? "linear-gradient(135deg, #F4A261, #e07b39)" : "#fff5f5"
                    : "#fff",
                  color: active
                    ? isWalkable ? "#fff" : "#E63946"
                    : "#9a7a60",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.18s",
                  whiteSpace: "nowrap",
                  boxShadow: active
                    ? isWalkable ? "0 4px 12px rgba(244,162,97,0.4)" : "0 2px 8px rgba(230,57,70,0.2)"
                    : "none",
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        <div style={fadeOverlay("left", !radii.atStart)} />
        <div style={fadeOverlay("right", true)} />
      </div>

      {/* Special keyword filters */}
      <div style={{ position: "relative" }}>
        <div
          ref={specials.ref}
          onScroll={specials.onScroll}
          onWheel={specials.onWheel}
          className="hide-scrollbar"
          style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            paddingTop: 6,
            paddingBottom: 8,
            paddingLeft: 6,
            paddingRight: 36,
            alignItems: "center",
          }}
        >
          <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 700, color: "#b08060", letterSpacing: 0.5, paddingRight: 2 }}>
            SPECIAL
          </span>
          {SPECIAL_FILTERS.map(sf => {
            const active = specialFilters.has(sf.key);
            return (
              <button
                key={sf.key}
                onClick={() => toggleSpecialFilter(sf.key)}
                style={{
                  flexShrink: 0,
                  padding: "6px 12px",
                  borderRadius: 50,
                  border: active ? "2px solid #F4A261" : "2px solid #e8d5c0",
                  background: active ? "linear-gradient(135deg, #F4A261, #e07b39)" : "#fff",
                  color: active ? "#fff" : "#9a7a60",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  transition: "all 0.18s",
                  whiteSpace: "nowrap",
                  boxShadow: active ? "0 4px 12px rgba(244,162,97,0.4)" : "0 2px 6px rgba(0,0,0,0.06)",
                }}
              >
                <span>{sf.emoji}</span>
                {sf.label}
              </button>
            );
          })}
        </div>
        <div style={fadeOverlay("left", !specials.atStart)} />
        <div style={fadeOverlay("right", true)} />
      </div>
    </div>
  );
}
