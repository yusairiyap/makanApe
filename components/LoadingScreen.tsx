"use client";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/appStore";
import { getTheme } from "@/lib/theme";
import type { DataProvider } from "@/types";

const PHASES: Record<DataProvider, { after: number; msg: string }[]> = {
  overpass: [
    { after: 0,  msg: "Tengah cari kedai makan berdekatan..." },
    { after: 3,  msg: "Tanya OpenStreetMap jap..." },
    { after: 8,  msg: "OSM tu slow sikit, sabar ye... ☕" },
    { after: 16, msg: "Alamak lama gila ni, almost done kot 😅" },
  ],
  geoapify: [
    { after: 0,  msg: "Tengah cari kedai makan berdekatan..." },
    { after: 3,  msg: "Tengah call Geoapify, jap ye..." },
    { after: 8,  msg: "Entah kenapa lambat sikit hari ni... 🤔" },
    { after: 16, msg: "Eh lagi jap ye, nak siap dah ni 😅" },
  ],
  tomtom: [
    { after: 0,  msg: "Tengah cari kedai makan berdekatan..." },
    { after: 3,  msg: "TomTom tengah kira route ke perut kita... 🗺️" },
    { after: 8,  msg: "TomTom tu recalculating la pulak..." },
    { after: 16, msg: "Lagi sikit je, jangan give up! 😅" },
  ],
};

export default function LoadingScreen({ cacheLabel }: { cacheLabel?: string | null }) {
  const darkMode = useAppStore(s => s.darkMode);
  const preferredProvider = useAppStore(s => s.preferredProvider);
  const t = getTheme(darkMode);
  const phases = PHASES[preferredProvider];

  const [phaseIdx, setPhaseIdx] = useState(0);

  useEffect(() => {
    if (cacheLabel) return;
    setPhaseIdx(0);
    const timers = phases.slice(1).map((p, i) =>
      setTimeout(() => setPhaseIdx(i + 1), p.after * 1000)
    );
    return () => timers.forEach(clearTimeout);
  }, [cacheLabel, phases]);

  return (
    <div style={{
      minHeight: "100vh",
      background: t.pageBg,
      transition: "background 0.35s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{ textAlign: "center" }}>
        <div className="animate-spin-slow" style={{ fontSize: 72, display: "inline-block", marginBottom: 20 }}>
          🎡
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#E63946", marginBottom: 8, letterSpacing: "-0.5px" }}>
          {cacheLabel ? "Guna data tersimpan..." : "Cari kedai makan..."}
        </h2>

        <p
          key={cacheLabel ?? phaseIdx}
          className="animate-fade-in"
          style={{ color: t.textSub, fontSize: 12, marginBottom: 24, transition: "opacity 0.3s" }}
        >
          {cacheLabel ? `⚡ Memuat dari ${cacheLabel}` : phases[phaseIdx].msg}
        </p>

        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              style={{
                width: 10, height: 10,
                borderRadius: "50%",
                background: i % 2 === 0 ? "#E63946" : "#F4A261",
                animation: `bounce-dot 1.2s ease-in-out ${i * 0.15}s infinite`,
              }}
            />
          ))}
        </div>

        <style>{`
          @keyframes bounce-dot {
            0%, 80%, 100% { transform: translateY(0); opacity: 0.6; }
            40% { transform: translateY(-14px); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}
