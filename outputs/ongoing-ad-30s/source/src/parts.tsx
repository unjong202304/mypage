import React from "react";
import {interpolate, useCurrentFrame} from "remotion";
import {C, FONT, prog} from "./theme";

const CL = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;

export const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{position: "absolute", inset: 0, fontFamily: FONT, color: C.ivory, wordBreak: "keep-all",
    background: `radial-gradient(1100px 900px at 50% 108%, rgba(214,52,43,0.16), transparent 62%), radial-gradient(900px 700px at 15% -5%, rgba(255,255,255,0.05), transparent 60%), linear-gradient(180deg, #1b1b21, ${C.bg})`}}>
    {children}
  </div>
);

export const Headline: React.FC<{text: string; sub?: string; top?: number; at?: number; size?: number}> = ({text, sub, top = 190, at = 6, size = 78}) => {
  const p = prog(useCurrentFrame(), at, at + 16);
  return (
    <div style={{position: "absolute", left: 60, right: 60, top, textAlign: "center", opacity: p, transform: `translateY(${(1 - p) * 30}px)`}}>
      <div style={{fontSize: size, fontWeight: 900, lineHeight: 1.22, letterSpacing: "-0.02em"}}>{text}</div>
      {sub && <div style={{fontSize: 38, color: C.mute, marginTop: 18, fontWeight: 500}}>{sub}</div>}
    </div>
  );
};

// PLACEHOLDER mark: film frame + play button, drawn here because the real logo file was not available.
export const Mark: React.FC<{size: number}> = ({size}) => {
  const hole = (side: "left" | "right", i: number) => (
    <i key={side + i} style={{position: "absolute", [side]: size * 0.06, top: size * (0.13 + i * 0.22), width: size * 0.07, height: size * 0.11,
      borderRadius: size * 0.02, background: "rgba(243,238,228,0.75)"}} />
  );
  return (
    <div style={{position: "relative", width: size, height: size, borderRadius: size * 0.24, flex: "none", background: "linear-gradient(150deg,#34343c,#0e0e12)",
      boxShadow: `0 ${size * 0.12}px ${size * 0.24}px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.14)`}}>
      {[0, 1, 2, 3].flatMap((i) => [hole("left", i), hole("right", i)])}
      <svg width={size} height={size} viewBox="0 0 100 100" style={{position: "absolute", inset: 0, filter: "drop-shadow(0 4px 5px rgba(0,0,0,0.55))"}}>
        <defs><linearGradient id="pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ef5a4f" /><stop offset="1" stopColor={C.redDeep} /></linearGradient></defs>
        <polygon points="38,27 38,73 74,50" fill="url(#pg)" />
      </svg>
    </div>
  );
};

export const Logo: React.FC<{size: number; word?: boolean; dark?: boolean}> = ({size, word = true, dark = false}) => (
  <div style={{display: "flex", alignItems: "center", gap: size * 0.28}}>
    <Mark size={size} />
    {word && (
      <div style={{lineHeight: 1, color: dark ? C.ink : C.ivory}}>
        <div style={{fontSize: size * 0.52, fontWeight: 900, letterSpacing: "0.01em"}}>ONGOING</div>
        <div style={{fontSize: size * 0.26, fontWeight: 700, letterSpacing: "0.5em", color: C.red, marginTop: size * 0.12}}>STUDIO</div>
      </div>
    )}
  </div>
);

export const Phone: React.FC<{w: number; children: React.ReactNode}> = ({w, children}) => (
  <div style={{width: w, height: w * 2.05, borderRadius: w * 0.13, padding: w * 0.024, background: "#0b0b0d", boxShadow: "0 70px 130px rgba(0,0,0,0.65), 0 0 0 2px #2b2b32"}}>
    <div style={{position: "relative", width: "100%", height: "100%", borderRadius: w * 0.105, overflow: "hidden", background: C.ivory, color: C.ink}}>
      <i style={{position: "absolute", top: w * 0.03, left: "50%", marginLeft: -w * 0.1, width: w * 0.2, height: w * 0.05, borderRadius: w, background: "#0b0b0d"}} />
      {children}
    </div>
  </div>
);

// Button with a pressable depth: it sinks and its shadow shortens at frame `at`.
export const Btn: React.FC<{label: string; at?: number; red?: boolean; w: number; h: number; fs: number}> = ({label, at = -99, red = true, w, h, fs}) => {
  const d = interpolate(useCurrentFrame(), [at, at + 4, at + 12], [0, 1, 0], CL);
  return (
    <div style={{width: w, height: h, borderRadius: h * 0.34, color: C.ivory, fontSize: fs, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center",
      background: red ? `linear-gradient(180deg,#e8483d,${C.red})` : "linear-gradient(180deg,#3a3a43,#2b2b32)", transform: `translateY(${d * h * 0.09}px)`,
      boxShadow: `0 ${h * 0.1 * (1 - d)}px 0 ${red ? C.redDeep : "#0d0d10"}, 0 ${h * 0.22 * (1 - d * 0.6)}px ${h * 0.4}px rgba(0,0,0,0.38)`}}>{label}</div>
  );
};

export const ring = (p: number): React.CSSProperties => ({boxShadow: `0 0 0 ${2 * p}px rgba(214,52,43,${0.9 * p}), 0 0 ${44 * p}px rgba(214,52,43,${0.32 * p})`});
export const typed = (f: number, text: string, at: number, cps = 14) => text.slice(0, Math.max(0, Math.floor(((f - at) * cps) / 30)));

export const Panel: React.FC<{style?: React.CSSProperties; children?: React.ReactNode}> = ({style, children}) => (
  <div style={{background: "linear-gradient(180deg,#2a2a31,#202026)", border: `1px solid ${C.line}`, borderRadius: 28, boxShadow: "0 24px 60px rgba(0,0,0,0.4)", ...style}}>{children}</div>
);

export const Tap: React.FC<{x: number; y: number; at: number}> = ({x, y, at}) => {
  const p = interpolate(useCurrentFrame(), [at, at + 16], [0, 1], CL);
  return <div style={{position: "absolute", left: x - 50, top: y - 50, width: 100, height: 100, borderRadius: 50, border: `4px solid rgba(243,238,228,${0.7 * (1 - p)})`,
    transform: `scale(${0.4 + p})`, opacity: p > 0 && p < 1 ? 1 : 0}} />;
};

export const Check: React.FC<{p: number; size?: number}> = ({p, size = 40}) => (
  <div style={{width: size, height: size, borderRadius: size / 2, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.62, fontWeight: 900,
    background: p > 0.5 ? "#2f8f5b" : "rgba(255,255,255,0.1)", color: C.ivory, transform: `scale(${0.8 + 0.2 * p})`, transition: "none"}}>{p > 0.5 ? "✓" : ""}</div>
);
