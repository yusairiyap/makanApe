"use client";
import { useEffect, useState } from "react";
import MapPreview from "./MapPreview";
import { shareRestaurant } from "@/lib/shareUtils";
import { useAppStore } from "@/store/appStore";
import { getTheme } from "@/lib/theme";
import type { Restaurant } from "@/types";
import type { Review } from "@/app/api/reviews/route";

interface ResultCardProps {
  restaurant: Restaurant;
  onTryAgain: () => void;
}

export default function ResultCard({ restaurant, onTryAgain }: ResultCardProps) {
  const darkMode = useAppStore(s => s.darkMode);
  const t = getTheme(darkMode);

  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    setReviews(null);
    setReviewsLoading(true);
    fetch(
      `/api/reviews?name=${encodeURIComponent(restaurant.name)}&lat=${restaurant.lat}&lng=${restaurant.lng}`
    )
      .then((r) => r.json())
      .then((data) => setReviews(data.reviews ?? []))
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [restaurant.name, restaurant.lat, restaurant.lng]);

  const distLabel =
    restaurant.distance < 1000
      ? `${restaurant.distance}m away`
      : `${(restaurant.distance / 1000).toFixed(1)}km away`;

  return (
    <div className="animate-pop-in" style={{
      width: "100%",
      background: t.cardBg,
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
          { icon: "🏷️", text: restaurant.category, bg: darkMode ? "#3a1a08" : "#fff5e6", color: "#c05c00" },
          { icon: "⭐", text: `${restaurant.rating}`, bg: darkMode ? "#2a2000" : "#fffbe6", color: "#b07000" },
          { icon: "📍", text: distLabel, bg: darkMode ? "#0a1f2e" : "#f0f9ff", color: darkMode ? "#60b8e0" : "#0369a1" },
          { icon: "💰", text: restaurant.priceRange, bg: darkMode ? "#0a2e14" : "#f0fdf4", color: darkMode ? "#4ade80" : "#166534" },
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

      {/* Reviews */}
      <div style={{ padding: "16px 20px 0" }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: "#b8845a", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
          Google Reviews
        </p>
        {reviewsLoading && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "8px 0", color: t.textMuted, fontSize: 13 }}>
            <span className="animate-spin-slow" style={{ display: "inline-block" }}>⏳</span>
            Tengah cari reviews...
          </div>
        )}
        {!reviewsLoading && reviews?.length === 0 && (
          <p style={{ fontSize: 13, color: t.textMuted, padding: "4px 0" }}>
            No reviews found — either no Google Places API key is set, or this place isn&apos;t on Google Maps.
          </p>
        )}
        {!reviewsLoading && reviews && reviews.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {reviews.map((review, i) => (
              <div
                key={i}
                style={{
                  padding: "12px",
                  background: darkMode ? "#3a1a08" : "#FFF8F0",
                  borderRadius: 12,
                  border: `1px solid ${t.cardBorder}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  {review.photoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={review.photoUrl}
                      alt={review.author}
                      width={28}
                      height={28}
                      style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 12, color: t.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {review.author}
                    </p>
                    <p style={{ fontSize: 11, color: t.textMuted, margin: 0 }}>{review.time}</p>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#b07000", flexShrink: 0 }}>
                    {"⭐".repeat(review.rating)}
                  </span>
                </div>
                {review.text && (
                  <p style={{ fontSize: 12, color: t.textSub, margin: 0, lineHeight: 1.5 }}>
                    {review.text.length > 200 ? review.text.slice(0, 200) + "…" : review.text}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ padding: "16px 20px 12px", display: "flex", gap: 10 }}>
        <button
          onClick={onTryAgain}
          style={{
            flex: 1,
            padding: "13px 0",
            border: "2px solid #E63946",
            background: darkMode ? "#3a1a08" : "#fff",
            color: "#E63946",
            fontWeight: 800,
            fontSize: 14,
            borderRadius: 16,
            cursor: "pointer",
            transition: "all 0.18s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = darkMode ? "#4a2010" : "#fff5f5";
            (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = darkMode ? "#3a1a08" : "#fff";
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

      {/* OSM contribution — only for Overpass-sourced results */}
      {(restaurant.provider === undefined || restaurant.provider === "overpass") && (
        <div style={{ padding: "0 20px 20px" }}>
          <a
            href={`https://www.openstreetmap.org/edit?node=${restaurant.id}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              width: "100%",
              padding: "11px 0",
              textAlign: "center",
              border: "1.5px solid #F4A261",
              borderRadius: 16,
              color: "#c05c00",
              fontWeight: 700,
              fontSize: 13,
              textDecoration: "none",
              background: darkMode ? "#2e1508" : "#fff",
              transition: "all 0.18s",
              boxSizing: "border-box",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = darkMode ? "#3e1a08" : "#fff5e6";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = darkMode ? "#2e1508" : "#fff";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            ✏️ Improve this listing on OpenStreetMap
          </a>
        </div>
      )}
    </div>
  );
}
