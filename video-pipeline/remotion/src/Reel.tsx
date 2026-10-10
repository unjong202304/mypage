import React from "react";
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {Backdrop, PushIn, SANS, Stepper} from "./scenes/kit";
import {RepoCard, Stat} from "./scenes/RepoCard";
import {TerminalWin} from "./scenes/TerminalWin";
import {Checklist, Compare, Diagram, Doc, Logos, Media, Stat, Title} from "./scenes/more";

type Cap = {s: number; e: number; text: string; hl: number[]};
type Scene = {s: number; e: number; layout?: "top" | "bottom" | "full"; kind?: string; [k: string]: any};
export type Props = {video: string; duration: number; captions: Cap[]; scenes: Scene[]};

const FONT = SANS;
const HL = "#ff6a2b";
const TOP = 560; // split layout: scene panel height, face below

const at = <T extends {s: number; e: number}>(xs: T[], t: number) => xs.findIndex((x) => t >= x.s && t < x.e);

const FULL = 1280;
const FACE: Record<string, React.CSSProperties> = {face: {top: 0, bottom: 0}, top: {top: TOP, bottom: 0}, bottom: {top: 0, height: 720}, full: {top: 0, bottom: 0}};
const CAP: Record<string, number> = {face: 900, top: 820, bottom: 560, full: 1000};
const GFX_H: Record<string, number> = {top: TOP, bottom: FULL - 720, full: FULL};
const GFX_TOP: Record<string, number> = {top: 0, bottom: 720, full: 0};

const Body: React.FC<{sc: Scene; big: boolean}> = ({sc, big}) => {
  switch (sc.kind) {
    case "repo": return <RepoCard url={sc.url ?? ""} title={sc.title} sub={sc.sub} badge={sc.badge} stats={sc.stats ?? []} cmd={sc.cmd} />;
    case "terminal": return <TerminalWin title={sc.title} chip={sc.chip} cmd={sc.cmd} lines={sc.lines ?? []} />;
    case "title": return <Title text={sc.text} hl={sc.hl} sub={sc.sub} big={big} />;
    case "stat": return <Stat value={sc.value} label={sc.label} big={big} />;
    case "list": return <Checklist title={sc.title} items={sc.items ?? []} big={big} />;
    case "compare": return <Compare left={sc.left} right={sc.right} />;
    case "diagram": return <Diagram nodes={sc.nodes ?? []} status={sc.status} />;
    case "doc": return <Doc title={sc.title} file={sc.file} steps={sc.steps ?? 5} tag={sc.tag} />;
    case "logos": return <Logos chips={sc.chips ?? []} label={sc.label} />;
    case "media": return <Media src={sc.src} />;
    default: return <Title text={sc.title ?? sc.text ?? ""} sub={sc.sub} big={big} />;
  }
};

const Panel: React.FC<{sc: Scene; i: number}> = ({sc, i}) => {
  const fps = useVideoConfig().fps;
  const dur = Math.round((sc.e - sc.s) * fps);
  const lay = sc.layout ?? "top";
  return (
    <div style={{position: "absolute", top: GFX_TOP[lay], left: 0, right: 0, height: GFX_H[lay], overflow: "hidden"}}>
      <Backdrop i={i}>
        <PushIn dur={dur}><Body sc={sc} big={lay === "full"} /></PushIn>
        {sc.step && <Stepper {...sc.step} />}
      </Backdrop>
    </div>
  );
};

export const Reel: React.FC<Props> = ({video, captions, scenes}) => {
  const fps = useVideoConfig().fps;
  const t = useCurrentFrame() / fps;
  const ci = at(captions, t);
  const si = at(scenes, t);
  const lay = si >= 0 ? scenes[si].layout ?? "top" : "face";
  const zoom = 1 + 0.12 * (Math.max(ci, 0) % 2); // punch-in on every other caption

  return (
    <AbsoluteFill style={{background: "#000"}}>
      <div style={{position: "absolute", left: 0, right: 0, overflow: "hidden", ...FACE[lay]}}>
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
        <div style={{position: "absolute", left: 0, right: 0, top: CAP[lay], textAlign: "center",
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
