"use client";
import { useEffect, useState } from "react";

const PHASES: { after: number; msg: string }[] = [
  { after: 0,  msg: "Looking for restaurants nearby..." },
  { after: 3,  msg: "Reaching out to OpenStreetMap..." },
  { after: 8,  msg: "OSM is taking its time — still waiting..." },
  { after: 16, msg: "Nearly there, OSM can be slow sometimes 😅" },
];

export default function LoadingScreen() {
  const [phaseIdx, setPhaseIdx] = useState(0);

  useEffect(() => {
    const timers = PHASES.slice(1).map((p, i) =>
      setTimeout(() => setPhaseIdx(i + 1), p.after * 1000)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #FFF8F0 0%, #FDEBD0 60%, #ffe0c0 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{ textAlign: "center" }}>
        <div className="animate-spin-slow" style={{ fontSize: 72, display: "inline-block", marginBottom: 20 }}>
          🎡
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#E63946", marginBottom: 8, letterSpacing: "-0.5px" }}>
          Cari kedai makan...
        </h2>

        <p
          key={phaseIdx}
          className="animate-fade-in"
          style={{ color: "#9a6b4b", fontSize: 12, marginBottom: 24, transition: "opacity 0.3s" }}
        >
          {PHASES[phaseIdx].msg}
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
