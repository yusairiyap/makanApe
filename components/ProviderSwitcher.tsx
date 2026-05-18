"use client";
import type { DataProvider } from "@/types";

interface ProviderSwitcherProps {
  preferred: DataProvider;
  onChange: (p: DataProvider) => void;
  darkMode: boolean;
}

const PROVIDERS: { key: DataProvider; label: string }[] = [
  { key: "overpass", label: "OSM" },
  { key: "geoapify", label: "Geoapify" },
  { key: "tomtom", label: "TomTom" },
];

export default function ProviderSwitcher({
  preferred,
  onChange,
  darkMode,
}: ProviderSwitcherProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        flexWrap: "wrap",
        marginTop: 6,
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: darkMode ? "#a07858" : "#b8845a",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        Data
      </span>
      {PROVIDERS.map(({ key, label }) => {
        const isSelected = key === preferred;
        return (
          <div
            key={key}
            onClick={() => onChange(key)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "4px 12px",
              borderRadius: 50,
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 700,
              transition: "all 0.18s",
              userSelect: "none",
              background: isSelected
                ? "linear-gradient(135deg, #E63946, #c1121f)"
                : darkMode
                ? "#2e1508"
                : "#f5ede4",
              color: isSelected ? "#fff" : darkMode ? "#c09070" : "#8a5c38",
              border: isSelected
                ? "1.5px solid transparent"
                : `1.5px solid ${darkMode ? "#4a2510" : "#e8d0b8"}`,
              boxShadow: isSelected
                ? "0 2px 8px rgba(230,57,70,0.28)"
                : "none",
            }}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
}
