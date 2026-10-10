import React from "react";
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig} from "remotion";

type Cap = {s: number; e: number; text: string; hl: number[]};
type Scene = {s: number; e: number; title: string; sub?: string; badge?: string};
export type Props = {video: string; duration: number; captions: Cap[]; scenes: Scene[]};

const FONT = '"Noto Sans CJK KR", Pretendard, sans-serif';
const BG = ["#1b1033", "#0e2236", "#0f2a1f", "#2a1212"];
const HL = "#ff6a2b";
const TOP = 560; // split layout: scene panel height, face below

const at = <T extends {s: number; e: number}>(xs: T[], t: number) => xs.findIndex((x) => t >= x.s && t < x.e);

export const Reel: React.FC<Props> = ({video, captions, scenes}) => {
  const t = useCurrentFrame() / useVideoConfig().fps;
  const ci = at(captions, t);
  const si = at(scenes, t);
  const split = si >= 0;
  const zoom = 1 + 0.12 * (Math.max(ci, 0) % 2); // punch-in on every other caption

  return (
    <AbsoluteFill style={{background: "#000"}}>
      <div style={{position: "absolute", left: 0, right: 0, bottom: 0, top: split ? TOP : 0, overflow: "hidden"}}>
        <OffthreadVideo
          src={staticFile(video)}
          style={{width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})`}}
        />
      </div>
      {split && (
        <div style={{position: "absolute", top: 0, left: 0, right: 0, height: TOP, background: BG[si % BG.length],
          display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 48,
          fontFamily: FONT, color: "#fff", textAlign: "center", gap: 20}}>
          {scenes[si].badge && <div style={{fontSize: 36, fontWeight: 700, color: "#ffd24a"}}>{scenes[si].badge}</div>}
          <div style={{fontSize: 64, fontWeight: 800, lineHeight: 1.2}}>{scenes[si].title}</div>
          {scenes[si].sub && <div style={{fontSize: 34, opacity: 0.75}}>{scenes[si].sub}</div>}
        </div>
      )}
      {ci >= 0 && (
        <div style={{position: "absolute", left: 0, right: 0, top: split ? 820 : 900, textAlign: "center",
          fontFamily: FONT, fontSize: 68, fontWeight: 900, lineHeight: 1.25, padding: "0 40px"}}>
          {captions[ci].text.split(" ").map((w, i) => (
            <span key={i} style={{color: captions[ci].hl.includes(i) ? HL : "#fff", marginRight: 14,
              WebkitTextStroke: "8px #000", paintOrder: "stroke fill"}}>{w}</span>
          ))}
        </div>
      )}
    </AbsoluteFill>
  );
};
