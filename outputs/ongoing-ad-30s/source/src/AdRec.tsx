// 온고잉 33초 광고 — the user's own screen recording of the real intake flow, framed by motion graphics.
// Picture follows the voice: every scene boundary is a narration line boundary (public/rec/narration_rec.json, written by
// make_narration_rec.py), so no line is ever cut by a scene change or by the end of the video.
// The recording uses a third-party music video, so prep_rec.py blurs every region showing it (embed, slider thumbnails,
// template video zone), its title/channel, the pasted URL and the typed title. UI stays sharp.
// Motion: ease-out entrances (cubic-bezier .23,1,.32,1), no camera zoom, nothing scrolls; one authored device = the step rail.
// Safe area: everything that matters sits in y 220..1450, x <= 940.
import React from "react";
import {AbsoluteFill, Audio, continueRender, delayRender, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from "remotion";

const fontHandle = delayRender("Pretendard");
const pretendard = new FontFace("Pretendard", `url(${staticFile("opus/fonts/PretendardVariable.woff2")}) format("woff2")`, {weight: "45 920"});
pretendard.load().then((f) => { document.fonts.add(f); continueRender(fontHandle); }).catch(() => continueRender(fontHandle));

const O = (p: string) => staticFile("opus/" + p);
const R = (p: string) => staticFile("rec/" + p);
const T = {ink: "#0f1013", ivory: "#f4efe8", mute: "rgba(244,239,232,0.6)", faint: "rgba(244,239,232,0.16)", ruby: "#e0336b", brandRuby: "#9e002c", char: "#191a1c"};
const FONT = "Pretendard, 'Noto Sans CJK KR', sans-serif";
const CL = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const OUT = Easing.bezier(0.23, 1, 0.32, 1);
const INOUT = Easing.bezier(0.77, 0, 0.175, 1);
const p = (f: number, a: number, d = 16, e = OUT) => interpolate(f, [a, a + d], [0, 1], {...CL, easing: e});
const abs = (s: React.CSSProperties): React.CSSProperties => ({position: "absolute", ...s});
const Hl: React.FC<{children: React.ReactNode; c?: string}> = ({children, c = T.ruby}) => <span style={{color: c}}>{children}</span>;

// ---------- timeline (frames @30 fps), from narration_rec.json ----------
const SC = {hook: [0, 90], file: [90, 236], link: [236, 360], range: [360, 444], choose: [444, 525], tpl: [525, 669], send: [669, 846], end: [846, 995]} as const;
export const REC_FRAMES = 995;

// ---------- primitives ----------
const Lines: React.FC<{lines: React.ReactNode[]; at: number; top: number; size: number; color?: string; out?: number; left?: number}> = ({lines, at, top, size, color = T.ivory, out, left = 72}) => {
  const f = useCurrentFrame();
  const leave = out === undefined ? 0 : p(f, out, 8, INOUT);
  return (
    <div style={abs({left, right: 140, top, fontFamily: FONT, fontSize: size, fontWeight: 820, letterSpacing: "-0.035em", lineHeight: 1.13, color, opacity: 1 - leave, transform: `translateY(${-16 * leave}px)`, wordBreak: "keep-all"})}>
      {lines.map((l, i) => {
        const q = p(f, at + i * 3, 18);
        return (
          <div key={i} style={{overflow: "hidden", paddingBottom: size * 0.1, marginBottom: -size * 0.1}}>
            <div style={{transform: `translateY(${(1 - q) * 105}%)`, filter: `blur(${(1 - q) * 6}px)`}}>{l}</div>
          </div>
        );
      })}
    </div>
  );
};

// Phone: the recording's crop is 880x1730; the screen keeps that ratio, nothing inside is cut.
const CLIP_W = 880, CLIP_H = 1730;
const PH = {x: 70, y: 400, h: 1050, bez: 12};
const SCR_H = PH.h - 2 * PH.bez, K = SCR_H / CLIP_H, SCR_W = CLIP_W * K, PH_W = SCR_W + 2 * PH.bez;
const at = (cx: number, cy: number) => ({x: PH.x + PH.bez + cx * K, y: PH.y + PH.bez + cy * K});

type Layer = {from: number; dur: number} & ({clip: string; start: number; rate: number} | {img: string});
const FADE = 6;
const LAYERS: Layer[] = [
  {from: 90, dur: 146, clip: "file", start: 0, rate: 0.76},
  {from: 236, dur: 36, clip: "link", start: 0, rate: 1},
  {from: 272, dur: 88, clip: "link", start: 1.2, rate: 2.45},
  {from: 360, dur: 84, clip: "range", start: 0, rate: 3.07},
  {from: 444, dur: 81, img: "rec/choose.png"},
  {from: 525, dur: 65, clip: "tpl_a", start: 0.2, rate: 1.25},
  {from: 590, dur: 79, clip: "tpl_b", start: 4.0, rate: 2.09},
  {from: 669, dur: 71, clip: "confirm", start: 0.3, rate: 1},
  {from: 740, dur: 50, clip: "done", start: 0, rate: 1},
  {from: 790, dur: 56, img: "opus/delivery-design42-sanitized.png"},
];

const LayerView: React.FC<{l: Layer}> = ({l}) => {
  const f = useCurrentFrame();   // local to the Sequence
  const o = p(f, 0, FADE, INOUT);
  const style: React.CSSProperties = {position: "absolute", inset: 0, opacity: o, filter: o < 1 ? `blur(${(1 - o) * 2}px)` : undefined};
  if ("img" in l) return <Img src={staticFile(l.img)} style={{...style, width: "100%", height: "auto", bottom: "auto"}} />;
  return <div style={style}><OffthreadVideo src={R(l.clip + ".mp4")} muted startFrom={Math.round(l.start * 30)} playbackRate={l.rate} style={{width: "100%", height: "100%"}} /></div>;
};

const Phone: React.FC = () => {
  const f = useCurrentFrame();
  const q = p(f, SC.file[0], 22);
  const leave = p(f, SC.end[0] - 8, 10, INOUT);
  return (
    <div style={abs({left: PH.x, top: PH.y, width: PH_W, height: PH.h, borderRadius: 64, padding: PH.bez, boxSizing: "border-box", background: "linear-gradient(160deg,#2a2b31,#0a0a0c 60%)",
      boxShadow: "0 50px 90px -24px rgba(0,0,0,0.8), 0 18px 32px -12px rgba(0,0,0,0.6), inset 0 0 0 1.5px rgba(255,255,255,0.09)",
      opacity: q * (1 - leave), transform: `perspective(1400px) translateY(${(1 - q) * 46}px) rotateX(${(1 - q) * 10}deg)`})}>
      <div style={{position: "relative", width: "100%", height: "100%", borderRadius: 52, overflow: "hidden", background: "#f7f5f2"}}>
        {LAYERS.map((l, i) => (
          <Sequence key={i} from={l.from} durationInFrames={l.dur + (i < LAYERS.length - 1 ? FADE : 0)} layout="none">
            <LayerView l={l} />
          </Sequence>
        ))}
      </div>
    </div>
  );
};

// A finger press on the phone: soft dot, then a ring that opens and fades.
const PRESSES: [number, number, number][] = [ // [frame, clipX, clipY]
  [245, 634, 475], [300, 135, 475], [310, 715, 372], [433, 243, 1270], [643, 748, 1258], [717, 70, 1571], [734, 517, 1692], [830, 440, 1315],
];
const Press: React.FC<{x: number; y: number; at: number}> = ({x, y, at: a}) => {
  const f = useCurrentFrame();
  if (f < a - 8 || f > a + 20) return null;
  const dot = f < a + 4 ? p(f, a - 8, 6) : 1 - p(f, a + 4, 8);
  const ring = p(f, a, 16);
  return (
    <>
      <div style={abs({left: x - 22, top: y - 22, width: 44, height: 44, borderRadius: 22, background: "rgba(255,255,255,0.94)", boxShadow: "0 0 0 2px rgba(224,51,107,0.85), 0 6px 16px rgba(0,0,0,0.35)", opacity: dot, transform: `scale(${0.9 + 0.1 * dot})`})} />
      <div style={abs({left: x - 58, top: y - 58, width: 116, height: 116, borderRadius: 58, border: `4px solid ${T.ruby}`, opacity: f >= a ? 1 - ring : 0, transform: `scale(${0.35 + 0.9 * ring})`})} />
    </>
  );
};

// Focus frame: a ruby outline that draws around a UI region on the phone, held while it matters.
const Focus: React.FC<{box: [number, number, number, number]; from: number; to: number}> = ({box, from, to}) => {
  const f = useCurrentFrame();
  if (f < from || f > to + 10) return null;
  const q = p(f, from, 14) * (1 - p(f, to, 8, INOUT));
  const a = at(box[0], box[1]), b = at(box[2], box[3]);
  const pad = 8;
  return <div style={abs({left: a.x - pad, top: a.y - pad, width: b.x - a.x + 2 * pad, height: b.y - a.y + 2 * pad, borderRadius: 18, border: `3px solid ${T.ruby}`, boxShadow: "0 0 0 6px rgba(224,51,107,0.18)", opacity: q, transform: `scale(${1.04 - 0.04 * q})`})} />;
};

const Check: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.2 4.2L19 7" stroke={color} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" /></svg>
);

// ---------- the step rail (right column, x 648..940) ----------
const COL = 652;
const STEPS: [string, number, number][] = [ // [label, active from, done from]
  ["영상 보내기", SC.file[0], SC.range[0]],
  ["구간 고르기", SC.range[0], SC.tpl[0]],
  ["템플릿 미리보기", SC.tpl[0], SC.send[0]],
  ["접수", SC.send[0], 740],
  ["검수 후 링크로", 740, 99999],
];
const Rail: React.FC = () => {
  const f = useCurrentFrame();
  const leave = Math.max(p(f, SC.end[0] - 8, 10, INOUT), p(f, SC.tpl[0] - 4, 10, INOUT) * (1 - p(f, SC.tpl[1] - 6, 12)));
  const ROW = 74, TOP = 418;
  const fill = interpolate(f, STEPS.map(([, a]) => a), STEPS.map((_, i) => i), CL);
  return (
    <div style={abs({left: COL, top: TOP, width: 288, opacity: 1 - leave, fontFamily: FONT})}>
      <div style={abs({left: 15, top: 18, width: 3, height: ROW * 4, background: T.faint, borderRadius: 2})} />
      <div style={abs({left: 15, top: 18, width: 3, height: ROW * Math.max(0, fill), background: T.ruby, borderRadius: 2})} />
      {STEPS.map(([label, a, d], i) => {
        const q = p(f, SC.file[0] + 6 + i * 3, 16);
        const on = f >= a && f < d, done = f >= d;
        const lit = p(f, a, 10);
        return (
          <div key={label} style={abs({left: 0, top: i * ROW, height: ROW, display: "flex", alignItems: "flex-start", gap: 18, opacity: q, transform: `translateX(${(1 - q) * 16}px)`})}>
            <div style={{width: 33, height: 33, marginTop: 2, borderRadius: 17, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box",
              background: done ? T.ruby : on ? T.ink : "#1b1c20", border: `3px solid ${done || on ? T.ruby : "rgba(244,239,232,0.22)"}`, boxShadow: on ? `0 0 0 ${6 * lit}px rgba(224,51,107,0.2)` : undefined}}>
              {done ? <Check size={20} color={T.ivory} /> : <div style={{width: 9, height: 9, borderRadius: 5, background: on ? T.ruby : "rgba(244,239,232,0.3)"}} />}
            </div>
            <div style={{fontSize: on ? 32 : 28, fontWeight: on ? 780 : 600, letterSpacing: "-0.03em", lineHeight: "37px", color: on ? T.ivory : done ? T.mute : "rgba(244,239,232,0.38)", whiteSpace: "nowrap"}}>{label}</div>
          </div>
        );
      })}
    </div>
  );
};

// Small sharp panel under the rail.
const Panel: React.FC<{from: number; to: number; top: number; children: React.ReactNode}> = ({from, to, top, children}) => {
  const f = useCurrentFrame();
  if (f < from || f > to + 10) return null;
  const q = p(f, from, 18) * (1 - p(f, to, 8, INOUT));
  return <div style={abs({left: COL, top, width: 288, opacity: q, transform: `translateY(${(1 - q) * 18}px)`, fontFamily: FONT})}>{children}</div>;
};

// Two real intake options, shown side by side as chips; the active one lights.
const Opt: React.FC<{label: string; sub: string; on: boolean}> = ({label, sub, on}) => (
  <div style={{padding: "16px 20px", borderRadius: 18, marginBottom: 12, background: on ? "rgba(224,51,107,0.14)" : "rgba(255,255,255,0.04)", border: `2px solid ${on ? T.ruby : "rgba(255,255,255,0.1)"}`}}>
    <div style={{fontSize: 28, fontWeight: 760, letterSpacing: "-0.03em", color: on ? T.ivory : T.mute}}>{label}</div>
    <div style={{fontSize: 21, color: T.mute, marginTop: 4}}>{sub}</div>
  </div>
);

// Crop of the real choice cards (choose.png, same 880x1730 space as the clips).
const Card: React.FC<{box: [number, number, number, number]; w: number; ring: number}> = ({box, w, ring}) => {
  const s = w / (box[2] - box[0]);
  return (
    <div style={{position: "relative", width: w, height: (box[3] - box[1]) * s, borderRadius: 16, overflow: "hidden", marginBottom: 16,
      boxShadow: `0 24px 40px -18px rgba(0,0,0,0.7), 0 0 0 ${3 * ring}px ${T.ruby}, 0 0 0 ${9 * ring}px rgba(224,51,107,0.18)`}}>
      <Img src={R("choose.png")} style={abs({left: -box[0] * s, top: -box[1] * s, width: CLIP_W * s, height: CLIP_H * s})} />
    </div>
  );
};

// Template callouts: a dot on the phone, a hairline to the right column, a label level with the dot.
// The rail steps aside while templates are on screen, so the column is free.
const CALLOUTS: [number, number, number, number, string][] = [ // [from, to, clipX, clipY, label]
  [536, 589, 352, 293, "제목"], [548, 589, 348, 794, "자막"], [598, 668, 231, 854, "댓글 자리"], [610, 668, 363, 975, "채널 이름"],
];
const Callout: React.FC<{from: number; to: number; cx: number; cy: number; label: string}> = ({from, to, cx, cy, label}) => {
  const f = useCurrentFrame();
  if (f < from || f > to + 10) return null;
  const q = p(f, from, 18) * (1 - p(f, to, 8, INOUT));
  const a = at(cx, cy);
  return (
    <>
      <svg width={1080} height={1920} style={abs({left: 0, top: 0, overflow: "visible", opacity: Math.min(1, q * 3)})}>
        <path d={`M${a.x} ${a.y} H${COL - 4}`} pathLength={1} fill="none" stroke={T.ruby} strokeWidth={3} strokeDasharray="1 1" strokeDashoffset={1 - q} />
      </svg>
      <div style={abs({left: a.x - 9, top: a.y - 9, width: 18, height: 18, borderRadius: 9, background: T.ruby, boxShadow: "0 0 0 5px rgba(224,51,107,0.28)", opacity: q})} />
      <div style={abs({left: COL + 8, top: a.y - 24, fontFamily: FONT, fontSize: 38, fontWeight: 780, letterSpacing: "-0.03em", color: T.ivory, opacity: p(f, from + 8, 12) * (1 - p(f, to, 8, INOUT)), transform: `translateX(${(1 - q) * 12}px)`, whiteSpace: "nowrap"})}>{label}</div>
    </>
  );
};

// Review steps after submit.
const REVIEW: [number, string][] = [[711, "사람 검수"], [756, "편집실 재검수"], [798, "완성본 링크 전달"]];

// ---------- scenes (absolute frames; rendered on one stage) ----------
const Stage: React.FC = () => {
  const f = useCurrentFrame();
  const inRange = (k: keyof typeof SC) => f >= SC[k][0] && f < SC[k][1];
  return (
    <AbsoluteFill style={{background: `radial-gradient(1100px 900px at 8% 108%, rgba(224,51,107,0.17), transparent 60%), radial-gradient(900px 700px at 100% -10%, rgba(255,255,255,0.05), transparent 60%), ${T.ink}`, color: T.ivory, fontFamily: FONT}}>
      {/* headlines */}
      {inRange("file") && <Sequence from={SC.file[0]} layout="none"><Lines at={4} out={SC.file[1] - SC.file[0] - 8} top={230} size={70} lines={["폰에 찍어 둔 영상,", <><Hl>그대로</Hl> 올리고</>]} /></Sequence>}
      {inRange("link") && <Sequence from={SC.link[0]} layout="none"><Lines at={2} out={SC.link[1] - SC.link[0] - 8} top={230} size={70} lines={["유튜브 롱폼은", <><Hl>링크만</Hl> 붙여 넣고</>]} /></Sequence>}
      {inRange("range") && <Sequence from={SC.range[0]} layout="none"><Lines at={2} out={SC.range[1] - SC.range[0] - 8} top={230} size={70} lines={["쓰고 싶은 구간은", <><Hl>내가 직접</Hl> 고르고</>]} /></Sequence>}
      {inRange("choose") && <Sequence from={SC.choose[0]} layout="none"><Lines at={2} out={SC.choose[1] - SC.choose[0] - 8} top={230} size={70} lines={["고르기 어렵다면", <><Hl>온고잉에게</Hl> 맡기고</>]} /></Sequence>}
      {inRange("tpl") && <Sequence from={SC.tpl[0]} layout="none"><Lines at={2} out={SC.tpl[1] - SC.tpl[0] - 8} top={230} size={70} lines={[<><Hl>실제 템플릿</Hl>으로</>, "미리 보고 정하고"]} /></Sequence>}
      {inRange("send") && <Sequence from={SC.send[0]} layout="none"><Lines at={2} out={SC.send[1] - SC.send[0] - 8} top={230} size={70} lines={["두 번 검수한 완성본,", <><Hl>링크로</Hl> 받으세요</>]} /></Sequence>}

      <Phone />
      <Rail />

      {/* scene panels under the rail (y 830..1440) */}
      <Panel from={SC.file[0] + 20} to={SC.link[1] - 6} top={840}>
        <Opt label="폰 영상 올리기" sub="파일 불러오기" on={f < SC.link[0] + 9} />
        <Opt label="유튜브 링크 넣기" sub="링크로 불러오기" on={f >= SC.link[0] + 9} />
      </Panel>
      <Panel from={SC.range[0] + 8} to={SC.range[1] - 4} top={840}>
        <Opt label="구간 직접 선택" sub="시작·끝을 손잡이로" on />
        <Opt label="최대 3개 구간" sub="구간마다 쇼츠 한 편" on={false} />
      </Panel>
      <Panel from={SC.choose[0] + 4} to={SC.choose[1] - 6} top={830}>
        <Card box={[22, 202, 429, 387]} w={288} ring={0} />
        <Card box={[451, 202, 858, 387]} w={288} ring={p(f, SC.choose[0] + 30, 14)} />
      </Panel>
      {CALLOUTS.map(([a, b, x, y, l]) => <Callout key={l} from={a} to={b} cx={x} cy={y} label={l} />)}
      <Panel from={SC.send[0] + 30} to={SC.send[1] - 6} top={840}>
        {REVIEW.map(([t, label]) => {
          const q = p(f, t, 14);
          return (
            <div key={label} style={{display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderRadius: 16, marginBottom: 12, fontSize: 27, fontWeight: 720, letterSpacing: "-0.03em",
              background: q > 0.5 ? "rgba(224,51,107,0.14)" : "rgba(255,255,255,0.04)", border: `2px solid ${q > 0.5 ? T.ruby : "rgba(255,255,255,0.1)"}`, color: q > 0.5 ? T.ivory : T.mute, whiteSpace: "nowrap"}}>
              <span style={{display: "flex", opacity: 0.35 + 0.65 * q, transform: `scale(${0.85 + 0.15 * q})`}}><Check size={26} color={q > 0.5 ? T.ruby : T.mute} /></span>{label}
            </div>
          );
        })}
      </Panel>

      {/* focus frames on the phone */}
      <Focus box={[245, 640, 640, 840]} from={SC.file[0] + 40} to={SC.file[1] - 10} />
      <Focus box={[40, 1050, 840, 1330]} from={SC.range[0] + 12} to={SC.range[0] + 66} />
      <Focus box={[451, 202, 858, 387]} from={SC.choose[0] + 30} to={SC.choose[1] - 8} />
      <Focus box={[30, 1540, 850, 1600]} from={700} to={738} />

      {PRESSES.map(([a, x, y]) => <Press key={a} at={a} {...at(x, y)} />)}
      <div style={abs({left: 72, top: 1462, fontSize: 20, color: "rgba(244,239,232,0.42)", opacity: f >= SC.link[0] && f < SC.end[0] ? 1 : 0})}>실제 접수 화면 녹화 · 원본 영상·제목·주소는 블러 처리</div>
    </AbsoluteFill>
  );
};

const Hook: React.FC = () => (
  <AbsoluteFill style={{background: T.ink}}>
    <Img src={O("hook.jpg")} style={{width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.82) saturate(0.9)"}} />
    <div style={abs({inset: 0, background: "linear-gradient(180deg, rgba(10,10,12,0.88) 0%, rgba(10,10,12,0.4) 36%, rgba(10,10,12,0) 52%, rgba(10,10,12,0.5) 100%)"})} />
    <Lines at={4} top={250} size={112} left={90} lines={["촬영보다", <><Hl>편집이</Hl> 더 오래</>, "걸리시죠?"]} />
  </AbsoluteFill>
);

const End: React.FC = () => {
  const f = useCurrentFrame();
  const q = p(f, 0, 18);
  return (
    <AbsoluteFill style={{background: "#efebe6", fontFamily: FONT}}>
      <Img src={O("logo3d_full.png")} style={abs({left: 0, top: -8 + (1 - q) * 14, width: 1080, height: Math.round((1080 * 1376) / 768), opacity: q})} />
      <Lines at={10} top={270} size={84} left={90} color={T.char} lines={["영상은 간단하게 보내고,", <>편집은 <Hl c={T.brandRuby}>온고잉에게.</Hl></>]} />
    </AbsoluteFill>
  );
};

const Grain: React.FC = () => {
  const f = useCurrentFrame();
  const r = (n: number) => Math.floor((Math.sin(f * 12.9898 + n * 78.233) * 43758.5453) % 1 * 384);
  return <div style={abs({inset: 0, backgroundImage: `url(${O("grain.png")})`, backgroundSize: "384px 384px", backgroundPosition: `${r(1)}px ${r(2)}px`, mixBlendMode: "overlay", opacity: 0.06, pointerEvents: "none"})} />;
};

export const AdRec: React.FC = () => {
  const f = useCurrentFrame();
  const hookOut = p(f, SC.hook[1] - 6, 8, INOUT);
  const endIn = p(f, SC.end[0], 10, INOUT);
  return (
    <AbsoluteFill style={{background: T.ink}}>
      {f >= SC.hook[1] - 8 && f < SC.end[0] + 12 && <Stage />}
      {f < SC.hook[1] + 2 && <AbsoluteFill style={{opacity: 1 - hookOut, filter: hookOut > 0 ? `blur(${hookOut * 6}px)` : undefined}}><Hook /></AbsoluteFill>}
      {f >= SC.end[0] && <Sequence from={SC.end[0]} layout="none"><AbsoluteFill style={{opacity: endIn}}><End /></AbsoluteFill></Sequence>}
      <div style={abs({inset: 0, background: "radial-gradient(ellipse at 50% 45%, transparent 60%, rgba(0,0,0,0.26) 100%)", pointerEvents: "none"})} />
      <Grain />
      <Audio src={staticFile("audio_rec.wav")} volume={0.4} />
      <Audio src={R("narration_rec.wav")} />
    </AbsoluteFill>
  );
};
