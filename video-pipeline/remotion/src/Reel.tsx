import React from "react";
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {Backdrop, PushIn, SANS, Stepper} from "./scenes/kit";
import {RepoCard, Stat} from "./scenes/RepoCard";
import {TerminalWin} from "./scenes/TerminalWin";

type Cap = {s: number; e: number; text: string; hl: number[]};
type Scene = {
  s: number; e: number; kind?: "card" | "repo" | "terminal"; title: string; sub?: string; badge?: string;
  url?: string; stats?: Stat[]; cmd?: string; chip?: string; lines?: string[];
  step?: {ordinal: string; labels: string[]; active: number};
};
export type Props = {video: string; duration: number; captions: Cap[]; scenes: Scene[]};

const FONT = SANS;
const HL = "#ff6a2b";
const TOP = 560; // split layout: scene panel height, face below

const at = <T extends {s: number; e: number}>(xs: T[], t: number) => xs.findIndex((x) => t >= x.s && t < x.e);

const Panel: React.FC<{sc: Scene; i: number}> = ({sc, i}) => {
  const fps = useVideoConfig().fps;
  const dur = Math.round((sc.e - sc.s) * fps);
  return (
    <div style={{position: "absolute", top: 0, left: 0, right: 0, height: TOP, overflow: "hidden"}}>
      <Backdrop i={i}>
        <PushIn dur={dur}>
          {sc.kind === "repo" ? (
            <RepoCard url={sc.url ?? ""} title={sc.title} sub={sc.sub} badge={sc.badge} stats={sc.stats ?? []} cmd={sc.cmd} />
          ) : sc.kind === "terminal" ? (
            <TerminalWin title={sc.title} chip={sc.chip} cmd={sc.cmd} lines={sc.lines ?? []} />
          ) : (
            <div style={{position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center",
              alignItems: "center", padding: 48, textAlign: "center", gap: 20}}>
              {sc.badge && <div style={{fontSize: 36, fontWeight: 700, color: "#ffd24a"}}>{sc.badge}</div>}
              <div style={{fontSize: 64, fontWeight: 800, lineHeight: 1.2}}>{sc.title}</div>
              {sc.sub && <div style={{fontSize: 34, opacity: 0.75}}>{sc.sub}</div>}
            </div>
          )}
        </PushIn>
        {sc.step && <Stepper {...sc.step} />}
      </Backdrop>
    </div>
  );
};

export const Reel: React.FC<Props> = ({video, captions, scenes}) => {
  const fps = useVideoConfig().fps;
  const t = useCurrentFrame() / fps;
  const ci = at(captions, t);
  const split = at(scenes, t) >= 0;
  const zoom = 1 + 0.12 * (Math.max(ci, 0) % 2); // punch-in on every other caption

  return (
    <AbsoluteFill style={{background: "#000"}}>
      <div style={{position: "absolute", left: 0, right: 0, bottom: 0, top: split ? TOP : 0, overflow: "hidden"}}>
        <OffthreadVideo
          src={staticFile(video)}
          style={{width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})`}}
        />
      </div>
      {scenes.map((sc, i) => (
        <Sequence key={i} from={Math.round(sc.s * fps)} durationInFrames={Math.max(1, Math.round((sc.e - sc.s) * fps))} layout="none">
          <Panel sc={sc} i={i} />
        </Sequence>
      ))}
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
