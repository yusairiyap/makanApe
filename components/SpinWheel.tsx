"use client";
import { useRef, useEffect, useCallback, useState } from "react";

function relativeTime(ts: number): string {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  return hrs === 1 ? "1 hour ago" : `${hrs} hours ago`;
}
import type { Restaurant } from "@/types";

const SLICE_COLORS = [
  "#E63946", "#F4A261", "#2A9D8F", "#E9C46A",
  "#264653", "#e76f51", "#06D6A0", "#118AB2",
  "#FFB703", "#FB8500", "#8338EC", "#3A86FF",
];

interface SpinWheelProps {
  restaurants: Restaurant[];
  onResult: (r: Restaurant) => void;
  cacheTimestamp?: number | null;
}

export default function SpinWheel({ restaurants, onResult, cacheTimestamp }: SpinWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);
  const spinRef = useRef({ angle: 0, velocity: 0, spinning: false });
  const [isSpinning, setIsSpinning] = useState(false);
  const [relTime, setRelTime] = useState(() => cacheTimestamp ? relativeTime(cacheTimestamp) : "");

  useEffect(() => {
    if (!cacheTimestamp) { setRelTime(""); return; }
    setRelTime(relativeTime(cacheTimestamp));
    const id = setInterval(() => setRelTime(relativeTime(cacheTimestamp)), 30000);
    return () => clearInterval(id);
  }, [cacheTimestamp]);

  const draw = useCallback((angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas || restaurants.length === 0) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const size = 290;
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const r = cx - 6;
    const slice = (2 * Math.PI) / restaurants.length;

    ctx.clearRect(0, 0, size, size);

    // Drop shadow
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.18)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.restore();

    // Slices
    restaurants.forEach((rest, i) => {
      const start = angle + i * slice;
      const end = start + slice;
      const color = SLICE_COLORS[i % SLICE_COLORS.length];

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.fillStyle = color;
      ctx.fill();

      // Slice border
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + slice / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      const fs = restaurants.length > 20 ? 9 : restaurants.length > 12 ? 10 : 11;
      ctx.font = `700 ${fs}px -apple-system, sans-serif`;
      ctx.shadowColor = "rgba(0,0,0,0.3)";
      ctx.shadowBlur = 3;
      const label = rest.name.length > 14 ? rest.name.slice(0, 13) + "…" : rest.name;
      ctx.fillText(label, r - 10, 4);
      ctx.restore();
    });

    // Outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Center hub
    const hubGrad = ctx.createRadialGradient(cx - 3, cy - 3, 2, cx, cy, 22);
    hubGrad.addColorStop(0, "#fff");
    hubGrad.addColorStop(1, "#f0e8e0");
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fillStyle = hubGrad;
    ctx.shadowColor = "rgba(0,0,0,0.2)";
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.strokeStyle = "#E63946";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center emoji
    ctx.shadowBlur = 0;
    ctx.font = "16px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🎡", cx, cy);
    ctx.textBaseline = "alphabetic";

  }, [restaurants]);

  useEffect(() => {
    draw(spinRef.current.angle);
  }, [draw]);

  function spin() {
    if (spinRef.current.spinning || restaurants.length === 0) return;
    spinRef.current.spinning = true;
    setIsSpinning(true);
    spinRef.current.velocity = Math.random() * 0.28 + 0.22;

    function animate() {
      spinRef.current.angle += spinRef.current.velocity;
      const friction = spinRef.current.velocity > 0.05 ? 0.983 : 0.994;
      spinRef.current.velocity *= friction;
      draw(spinRef.current.angle);

      // Slow the arrow wiggle animation to match wheel deceleration
      if (arrowRef.current) {
        const dur = Math.min(1.4, 0.018 / spinRef.current.velocity);
        arrowRef.current.style.animationDuration = `${dur.toFixed(3)}s`;
      }

      if (spinRef.current.velocity > 0.002) {
        requestAnimationFrame(animate);
      } else {
        spinRef.current.spinning = false;
        setIsSpinning(false);
        if (arrowRef.current) arrowRef.current.style.animationDuration = "";
        const slice = (2 * Math.PI) / restaurants.length;
        const normalised =
          ((spinRef.current.angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const idx =
          Math.floor((2 * Math.PI - normalised) / slice) % restaurants.length;
        onResult(restaurants[(idx + restaurants.length) % restaurants.length]);
      }
    }
    requestAnimationFrame(animate);
  }

  if (restaurants.length === 0) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        padding: "40px 20px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 56 }}>😢</div>
        <p style={{ color: "#9a7a60", fontWeight: 600 }}>
          Takde kedai dengan filter ni
        </p>
        <p style={{ color: "#c4a882", fontSize: 13 }}>
          Cuba ubah kategori atau jarakkan radius
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      {/* Wheel container with glow */}
      <div
        onClick={spin}
        style={{
          position: "relative",
          cursor: isSpinning ? "wait" : "pointer",
          borderRadius: "50%",
          transition: "transform 0.15s",
        }}
        onMouseEnter={e => {
          if (!isSpinning) (e.currentTarget as HTMLElement).style.transform = "scale(1.02)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.transform = "scale(1)";
        }}
      >
        {/* Glow ring */}
        <div style={{
          position: "absolute",
          inset: -6,
          borderRadius: "50%",
          background: "conic-gradient(from 0deg, #E63946, #F4A261, #2A9D8F, #E9C46A, #E63946)",
          opacity: isSpinning ? 0.7 : 0.25,
          transition: "opacity 0.3s",
          filter: "blur(8px)",
        }} />
        <canvas
          ref={canvasRef}
          style={{ display: "block", position: "relative", borderRadius: "50%" }}
        />

        {/* Arrow pointer — outside canvas, animated */}
        <svg
          ref={arrowRef}
          className={isSpinning ? "animate-arrow-spin" : "animate-arrow-bounce"}
          style={{
            position: "absolute",
            right: -28,
            top: "50%",
            zIndex: 10,
            filter: "drop-shadow(-3px 0 8px rgba(230,57,70,0.7))",
            pointerEvents: "none",
            overflow: "visible",
          }}
          width="34"
          height="34"
          viewBox="0 0 34 34"
        >
          {/* White outline (slightly larger, behind) */}
          <polygon points="34,2 34,32 2,17" fill="white" />
          {/* Red arrow */}
          <polygon points="30,5 30,29 4,17" fill="#E63946" />
        </svg>
      </div>

      {/* PUTAR button */}
      <button
        onClick={spin}
        disabled={isSpinning}
        style={{
          padding: "15px 48px",
          background: isSpinning
            ? "linear-gradient(135deg, #ccc, #bbb)"
            : "linear-gradient(135deg, #E63946 0%, #c1121f 100%)",
          color: "#fff",
          fontWeight: 900,
          fontSize: 20,
          border: "none",
          borderRadius: 50,
          cursor: isSpinning ? "not-allowed" : "pointer",
          boxShadow: isSpinning
            ? "none"
            : "0 8px 28px rgba(230,57,70,0.45), 0 2px 8px rgba(0,0,0,0.1)",
          transition: "all 0.2s",
          letterSpacing: "1px",
          transform: isSpinning ? "scale(0.97)" : "scale(1)",
        }}
        onMouseEnter={e => {
          if (!isSpinning) {
            (e.currentTarget as HTMLElement).style.transform = "translateY(-3px) scale(1.04)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 14px 36px rgba(230,57,70,0.55)";
          }
        }}
        onMouseLeave={e => {
          if (!isSpinning) {
            (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(230,57,70,0.45)";
          }
        }}
      >
        {isSpinning ? "⏳ spinning..." : "🎡 lets gooooo!"}
      </button>

      <p style={{ color: "#c4a882", fontSize: 12, fontWeight: 500 }}>
        Tap wheel or the button to spin · {restaurants.length} kedai available
      </p>
      {relTime && (
        <p style={{ color: "#c4a882", fontSize: 11, marginTop: -12 }}>
          ⚡ Last updated {relTime}
        </p>
      )}
    </div>
  );
}
