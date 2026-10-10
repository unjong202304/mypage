import React from "react";
import {interpolate, useCurrentFrame, useVideoConfig} from "remotion";

export const MONO = '"Noto Sans Mono CJK KR", "DejaVu Sans Mono", monospace';
export const SANS = '"Noto Sans CJK KR", Pretendard, sans-serif';

// Gradient themes cycle per scene, like the reference's per-cut background change.
export const THEMES = [
  ["#06150f", "#123f2c"], // green
  ["#12082a", "#3d1f73"], // purple
  ["#041a22", "#0c4c5a"], // teal
  ["#1c0d08", "#5a2a14"], // ember
];

export const Backdrop: React.FC<{i: number; children: React.ReactNode}> = ({i, children}) => {
  const [a, b] = THEMES[i % THEMES.length];
  return (
    <div style={{position: "absolute", inset: 0, overflow: "hidden", fontFamily: SANS, color: "#fff",
      background: `radial-gradient(900px 500px at 80% 110%, ${b}, transparent 70%), linear-gradient(160deg, ${a}, ${b})`}}>
      {children}
    </div>
  );
};

// Slow push-in over the whole scene; scene frames, not video frames.
export const PushIn: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, dur], [1, 1.06], {extrapolateRight: "clamp"});
  return <div style={{position: "absolute", inset: 0, transform: `scale(${s})`}}>{children}</div>;
};

export const Glass: React.FC<{style?: React.CSSProperties; children: React.ReactNode}> = ({style, children}) => (
  <div style={{background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 24,
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)", ...style}}>{children}</div>
);

// Fade+rise entrance; `at` is the scene frame it starts on.
export const useIn = (at: number) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 10], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return {opacity: p, transform: `translateY(${(1 - p) * 24}px)`} as React.CSSProperties;
};

export const useTyped = (text: string, at: number, cps = 28) => {
  const f = useCurrentFrame();
  const fps = useVideoConfig().fps;
  const n = Math.max(0, Math.floor(((f - at) * cps) / fps));
  const cursor = Math.floor(f / (fps / 2)) % 2 === 0;
  return text.slice(0, n) + (n < text.length || cursor ? "▍" : "");
};

// Bottom progress chips: "Second | skills ✓ | playwright-mcp | ..."
export const Stepper: React.FC<{ordinal: string; labels: string[]; active: number}> = ({ordinal, labels, active}) => (
  <div style={{position: "absolute", left: 36, right: 36, bottom: 22, display: "flex", alignItems: "center", gap: 12,
    fontSize: 24, whiteSpace: "nowrap", overflow: "hidden"}}>
    <b style={{fontSize: 30, marginRight: 8}}>{ordinal}</b>
    {labels.map((l, i) => (
      <span key={i} style={{padding: "6px 16px", borderRadius: 999, fontFamily: MONO, fontSize: 21,
        background: i === active ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.07)",
        opacity: i > active ? 0.45 : 1}}>{i < active ? "✓ " : ""}{l.length > 12 ? l.slice(0, 11) + "…" : l}</span>
    ))}
  </div>
);
