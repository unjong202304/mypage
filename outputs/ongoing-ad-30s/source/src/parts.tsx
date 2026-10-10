import React from "react";
import {Img, interpolate, OffthreadVideo, useCurrentFrame} from "remotion";
import {A, C, FONT, prog} from "./theme";

const CL = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;

// Film perforation strip: the product's own UI uses this motif along the top/bottom edge.
const Perf: React.FC<{edge: "top" | "bottom"}> = ({edge}) => (
  <div style={{position: "absolute", left: 0, right: 0, [edge]: 18, height: 16, opacity: 0.35,
    backgroundImage: "repeating-linear-gradient(90deg, #faf9f6 0 22px, transparent 22px 46px)"}} />
);

export const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{position: "absolute", inset: 0, fontFamily: FONT, color: C.ivory, wordBreak: "keep-all", overflow: "hidden",
    background: `radial-gradient(1100px 900px at 50% 108%, rgba(189,30,81,0.22), transparent 62%), radial-gradient(900px 700px at 15% -5%, rgba(255,255,255,0.05), transparent 60%), linear-gradient(180deg, #202124, ${C.bg})`}}>
    <Perf edge="top" />
    <Perf edge="bottom" />
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

// Real brand logos from the pack. White version for dark backgrounds, black 3D version for light ones.
export const LogoWhite: React.FC<{w: number}> = ({w}) => <Img src={A("logo-white.png")} style={{width: w, height: (w * 314) / 830}} />;
export const Logo3D: React.FC<{w: number}> = ({w}) => <Img src={A("logo-3d.png")} style={{width: w, height: (w * 887) / 1774}} />;

// Phone whose screen has the real UI's 390x844 proportion; children fill the screen.
export const Phone: React.FC<{w: number; children: React.ReactNode}> = ({w, children}) => (
  <div style={{width: w, borderRadius: w * 0.11, padding: w * 0.022, background: "#0b0b0d", boxShadow: "0 70px 130px rgba(0,0,0,0.65), 0 0 0 2px #2b2b32"}}>
    <div style={{position: "relative", width: "100%", paddingTop: `${(844 / 390) * 100}%`, borderRadius: w * 0.09, overflow: "hidden", background: C.ivory}}>
      <div style={{position: "absolute", inset: 0}}>{children}</div>
    </div>
  </div>
);

const fill: React.CSSProperties = {width: "100%", height: "100%", objectFit: "cover", objectPosition: "top"};
export const ScreenImg: React.FC<{src: string; opacity?: number}> = ({src, opacity = 1}) => (
  <Img src={A(src)} style={{...fill, position: "absolute", inset: 0, opacity}} />
);
// `from` is the frame inside the recording where playback starts.
export const ScreenVid: React.FC<{src: string; from?: number}> = ({src, from = 0}) => (
  <OffthreadVideo src={A(src)} startFrom={from} muted style={fill} />
);

export const Check: React.FC<{p: number; size?: number}> = ({p, size = 40}) => (
  <div style={{width: size, height: size, borderRadius: size / 2, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.62, fontWeight: 900,
    background: p > 0.5 ? "#2f8f5b" : "rgba(255,255,255,0.1)", color: C.ivory, transform: `scale(${0.8 + 0.2 * p})`}}>{p > 0.5 ? "✓" : ""}</div>
);

export const ring = (p: number): React.CSSProperties => ({boxShadow: `0 0 0 ${2 * p}px rgba(189,30,81,${0.9 * p}), 0 0 ${44 * p}px rgba(189,30,81,0.32)`});
export const fade = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], CL);
