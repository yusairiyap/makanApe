"use client";
import MapPreview from "./MapPreview";
import { shareRestaurant } from "@/lib/shareUtils";
import type { Restaurant } from "@/types";

interface ResultCardProps {
  restaurant: Restaurant;
  onTryAgain: () => void;
}

export default function ResultCard({ restaurant, onTryAgain }: ResultCardProps) {
  const distLabel =
    restaurant.distance < 1000
      ? `${restaurant.distance}m away`
      : `${(restaurant.distance / 1000).toFixed(1)}km away`;

  return (
    <div className="animate-pop-in" style={{
      width: "100%",
      background: "#fff",
      borderRadius: 28,
      overflow: "hidden",
      boxShadow: "0 20px 60px rgba(230,57,70,0.15), 0 4px 16px rgba(0,0,0,0.08)",
    }}>
      {/* Gradient header */}
      <div style={{
        background: "linear-gradient(135deg, #E63946 0%, #c1121f 50%, #9d0208 100%)",
        padding: "28px 24px 24px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{
          position: "absolute", top: -20, right: -20,
          width: 100, height: 100, borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
        }} />
        <div style={{
          position: "absolute", bottom: -30, left: -10,
          width: 80, height: 80, borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
        }} />

        <div style={{ fontSize: 56, marginBottom: 8, position: "relative" }}>
          {restaurant.emoji}
        </div>
        <h2 style={{
          fontSize: 22, fontWeight: 900, color: "#fff",
          lineHeight: 1.2, marginBottom: 6, letterSpacing: "-0.5px",
          position: "relative",
        }}>
          {restaurant.name}
        </h2>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, position: "relative" }}>
          {restaurant.address}
        </p>
      </div>

      {/* Badges */}
      <div style={{ padding: "16px 20px 0", display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
        {[
          { icon: "🏷️", text: restaurant.category, bg: "#fff5e6", color: "#c05c00" },
          { icon: "⭐", text: `${restaurant.rating}`, bg: "#fffbe6", color: "#b07000" },
          { icon: "📍", text: distLabel, bg: "#f0f9ff", color: "#0369a1" },
          { icon: "💰", text: restaurant.priceRange, bg: "#f0fdf4", color: "#166534" },
        ].map(badge => (
          <span key={badge.text} style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "6px 12px",
            background: badge.bg,
            color: badge.color,
            borderRadius: 50,
            fontSize: 12,
            fontWeight: 700,
            border: `1px solid ${badge.bg}`,
          }}>
            {badge.icon} {badge.text}
          </span>
        ))}
      </div>

      {/* Map */}
      <div style={{ padding: "16px 20px 0" }}>
        <MapPreview lat={restaurant.lat} lng={restaurant.lng} name={restaurant.name} />
      </div>

      {/* Actions */}
      <div style={{ padding: "16px 20px 20px", display: "flex", gap: 10 }}>
        <button
          onClick={onTryAgain}
          style={{
            flex: 1,
            padding: "13px 0",
            border: "2px solid #E63946",
            background: "#fff",
            color: "#E63946",
            fontWeight: 800,
            fontSize: 14,
            borderRadius: 16,
            cursor: "pointer",
            transition: "all 0.18s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "#fff5f5";
            (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "#fff";
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          }}
        >
          🔄 Cuba lagi
        </button>
        <button
          onClick={() => shareRestaurant(restaurant)}
          style={{
            flex: 1,
            padding: "13px 0",
            background: "linear-gradient(135deg, #E63946, #c1121f)",
            color: "#fff",
            fontWeight: 800,
            fontSize: 14,
            border: "none",
            borderRadius: 16,
            cursor: "pointer",
            boxShadow: "0 6px 18px rgba(230,57,70,0.35)",
            transition: "all 0.18s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 24px rgba(230,57,70,0.45)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 18px rgba(230,57,70,0.35)";
          }}
        >
          📤 Share
        </button>
      </div>
    </div>
  );
}
