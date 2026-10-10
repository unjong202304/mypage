// "간단하게 보내고, 편집은 온고잉" — the real intake / template / title / delivery pages from the asset pack, driven with taps and zooms.
// The pack's screens are recordings and QA captures of the guide state, not proof of a live run: nothing here claims more than the page shows.
import React from "react";
import {AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from "remotion";
import {abs, Cut, PINK, sp, Slam} from "./AdFast";
import {center, Pill} from "./AdEasy";
import {Check, LogoWhite, ring, Stage} from "./parts";
import {A, C, prog, sec} from "./theme";
import {MOUTH} from "./mouthData";

const CL = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
// The preview is the WHOLE page (never cropped), as large as the safe area allows; the parts that must be read are lifted out into a callout (see Callout).
const FL = 380, FT = 330, FW = 520;
const crop = (uw: number) => ({px: (ux: number) => FL + (ux * FW) / uw, py: (uy: number) => FT + (uy * FW) / uw});

export const Tap: React.FC<{x: number; y: number; at: number}> = ({x, y, at}) => {
  const p = interpolate(useCurrentFrame(), [at, at + 16], [0, 1], CL);
  if (p <= 0 || p >= 1) return null;
  return <div style={abs({left: x - 60, top: y - 60, width: 120, height: 120, borderRadius: 60, border: `7px solid rgba(219,56,108,${1 - p})`, background: `rgba(219,56,108,${0.25 * (1 - p)})`, transform: `scale(${0.4 + 1.1 * p})`})} />;
};
const Box: React.FC<{x: number; y: number; w: number; h: number; at: number}> = ({x, y, w, h, at}) => {
  const p = prog(useCurrentFrame(), at, at + 10);
  return <div style={abs({left: x, top: y, width: w, height: h, borderRadius: 22, opacity: p, ...ring(p)})} />;
};
type Stop = {x: number; y: number; t: number};
const ptLerp = (a: number, b: number, p: number) => a + (b - a) * p;
// Mouse pointer that glides to each stop, presses (shrinks + ring) at frame t, then moves on.
export const Cursor: React.FC<{stops: Stop[]}> = ({stops}) => {
  const f = useCurrentFrame();
  const first = stops[0];
  let x = first.x + 260, y = first.y + 300;
  let from = {x, y}, depart = Math.max(0, first.t - 26);
  let idx = 0;
  for (let i = 0; i < stops.length; i++) {
    if (f >= stops[i].t) { from = {x: stops[i].x, y: stops[i].y}; idx = i + 1; depart = i + 1 < stops.length ? Math.max(stops[i].t + 8, stops[i + 1].t - 26) : 1e9; }
  }
  const target = stops[Math.min(idx, stops.length - 1)];
  if (idx < stops.length) {
    const p = prog(f, depart, target.t);
    x = ptLerp(from.x, target.x, p); y = ptLerp(from.y, target.y, p);
  } else { x = from.x; y = from.y; }
  const press = stops.some((st) => f >= st.t && f < st.t + 9);
  return (
    <>
      {stops.map((st, i) => <Tap key={i} x={st.x} y={st.y} at={st.t} />)}
      <svg width={74} height={74} viewBox="0 0 74 74" style={{position: "absolute", left: x - 8, top: y - 6, transform: `scale(${press ? 0.82 : 1})`, transformOrigin: "8px 6px", filter: "drop-shadow(0 8px 10px rgba(0,0,0,0.5))", opacity: prog(f, Math.max(0, first.t - 30), first.t - 20)}}>
        <path d="M8 6 L8 56 L22 43 L32 66 L42 62 L32 40 L52 40 Z" fill="#fff" stroke="#111" strokeWidth={4} strokeLinejoin="round" />
      </svg>
    </>
  );
};
// The whole page in a phone-style frame. uw/uh = the page's own size in UI px.
const Frame: React.FC<{uw: number; uh: number; children: React.ReactNode}> = ({uw, uh, children}) => {
  const f = useCurrentFrame();
  const o = Math.min(1, sp(f, 3) * 2.4), h = (FW * uh) / uw;
  return (
    <div style={abs({left: FL - 14, top: FT - 14, width: FW + 28, height: h + 28, borderRadius: 48, background: "#0b0b0d", boxShadow: "0 50px 110px rgba(0,0,0,0.6), 0 0 0 2px #2b2b32", opacity: o})}>
      <div style={abs({left: 14, top: 14, width: FW, height: h, borderRadius: 36, overflow: "hidden", background: C.ivory})}>{children}</div>
    </div>
  );
};
// Callout: the same real page, a slice of it enlarged next to the preview, with the clicks replayed in it.
const CX = 190, CY = 1160, CW = 700, CH = 270;
type CTap = {ux: number; uy: number; t: number};
const Callout: React.FC<{file: string; video?: {from: number; rate: number}; uw: number; uh: number; x0: number; x1: number; y0: number; t0: number; taps?: CTap[]}> = ({file, video, uw, uh, x0, x1, y0, t0, taps = []}) => {
  const f = useCurrentFrame();
  if (f < t0) return null;
  const p = sp(f, t0), s = CW / (x1 - x0);
  return (
    <div style={abs({left: CX, top: CY, width: CW, height: CH, borderRadius: 30, overflow: "hidden", border: "7px solid #fff", boxShadow: "0 24px 60px rgba(0,0,0,0.6)", background: C.ivory, opacity: Math.min(1, p * 2), transform: `scale(${0.7 + 0.3 * p})`})}>
      <div style={abs({left: -x0 * s, top: -y0 * s, width: uw * s, height: uh * s})}>
        {video ? <OffthreadVideo src={A(file)} startFrom={video.from} playbackRate={video.rate} muted style={{width: "100%", height: "100%", objectFit: "fill"}} /> : <Img src={A(file)} style={{width: "100%", height: "100%", objectFit: "fill"}} />}
      </div>
      {taps.map((tp, i) => <Tap key={i} x={(tp.ux - x0) * s} y={(tp.uy - y0) * s} at={tp.t} />)}
    </div>
  );
};
const fillCss: React.CSSProperties = {width: "100%", height: "100%", objectFit: "fill"};
const Vid: React.FC<{src: string; from: number; rate: number}> = ({src, from, rate}) => <OffthreadVideo src={A(src)} startFrom={from} playbackRate={rate} muted style={fillCss} />;
const Shot: React.FC<{src: string; o?: number}> = ({src, o = 1}) => <Img src={A(src)} style={{...fillCss, position: "absolute", inset: 0, opacity: o}} />;
// scene headline pill (top safe row)
const Head: React.FC<{n: string; text: string}> = ({n, text}) => {
  const p = sp(useCurrentFrame(), 2);
  return center(222, (
    <div style={{display: "flex", alignItems: "center", gap: 18, padding: "10px 34px 10px 14px", borderRadius: 999, background: C.red, fontSize: 52, fontWeight: 900, boxShadow: `0 8px 0 ${C.redDeep}`, transform: `scale(${0.8 + 0.2 * p})`, opacity: Math.min(1, p * 2)}}>
      <span style={{width: 66, height: 66, borderRadius: 33, background: C.ivory, color: C.redDeep, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44}}>{n}</span>{text}
    </div>
  ));
};

const HOOK_CUTS = [
  () => <Frame uw={390} uh={844}><Vid src="rec-file-link.mp4" from={0} rate={1} /></Frame>,
  () => <Frame uw={375} uh={812}><Shot src="shot-templates.png" /></Frame>,
  () => <Frame uw={390} uh={844}><Shot src="shot-delivery.png" /></Frame>,
];
const H: React.FC = () => {
  const f = useCurrentFrame();
  const k = f >= 48 && f < 132 ? Math.min(2, Math.floor((f - 48) / 28)) : -1;
  return (
    <AbsoluteFill style={{background: f < 48 ? `linear-gradient(160deg,${PINK},${C.redDeep})` : `linear-gradient(180deg,#202124,${C.bg})`, fontFamily: "Pretendard, 'Noto Sans KR', sans-serif", wordBreak: "keep-all", color: C.ivory}}>
      {f < 48 && (
        <>
          <Slam text="새벽까지" at={2} top={560} size={150} />
          <Slam text="편집하던 쇼츠," at={12} top={760} size={130} color="#fff" />
        </>
      )}
      {k >= 0 && HOOK_CUTS[k]()}
      {f >= 132 && (
        <>
          <Slam text="방법은" at={134} top={640} size={150} />
          <Slam text="이겁니다" at={146} top={850} size={210} hl={["이겁니다"]} />
          <div style={abs({left: 0, right: 0, top: 1250, textAlign: "center", fontSize: 120, color: PINK, opacity: prog(f, 160, 172), transform: `translateY(${8 * Math.sin(f / 4)}px)`})}>▼</div>
        </>
      )}
    </AbsoluteFill>
  );
};

// ---- send: file tab, then the link tab (real intake page) ----
const C1 = crop(390);
const R1: React.FC = () => (
  <Stage>
    <Head n="1" text="간단하게 보내기" />
    <Frame uw={390} uh={844}><Vid src="rec-file-link.mp4" from={75} rate={0.85} /></Frame>
    <Cursor stops={[{x: C1.px(117), y: C1.py(269), t: 30}, {x: C1.px(291), y: C1.py(269), t: 98}, {x: C1.px(194), y: C1.py(366), t: 150}]} />
    <Callout file="rec-file-link.mp4" video={{from: 75, rate: 0.85}} uw={390} uh={844} x0={10} x1={380} y0={245} t0={14} taps={[{ux: 117, uy: 269, t: 30}, {ux: 291, uy: 269, t: 98}, {ux: 194, uy: 366, t: 150}]} />
  </Stage>
);

// ---- hand over: let ongoing choose, or choose yourself (real mode switch) ----
const R2: React.FC = () => (
  <Stage>
    <Head n="2" text="맡기기 · 직접 정하기" />
    <Frame uw={390} uh={844}><Vid src="rec-auto-manual.mp4" from={30} rate={0.8} /></Frame>
    <Cursor stops={[{x: C1.px(292), y: C1.py(163), t: 62}, {x: C1.px(70), y: C1.py(163), t: 138}]} />
    <Callout file="rec-auto-manual.mp4" video={{from: 30, rate: 0.8}} uw={390} uh={844} x0={10} x1={380} y0={118} t0={14} taps={[{ux: 292, uy: 163, t: 62}, {ux: 70, uy: 163, t: 138}]} />
  </Stage>
);

// ---- templates, then the title (real pages; the cards are a QA capture) ----
const C3 = crop(375);
const R3: React.FC = () => {
  const f = useCurrentFrame();
  const sw = prog(f, 100, 114);
  return (
    <Stage>
      <Head n="2" text="미리 보고 고르기" />
      <Frame uw={375} uh={812}><Shot src="shot-templates.png" o={1 - sw} /><Shot src="shot-title.png" o={sw} /></Frame>
      {f < 100 && <Box x={C3.px(181)} y={C3.py(347)} w={(148 * FW) / 375} h={(152 * FW) / 375} at={44} />}
      <Cursor stops={[{x: C3.px(255), y: C3.py(424), t: 44}, {x: C3.px(45), y: C3.py(346), t: 132}]} />
      <Callout file="shot-title.png" uw={375} uh={812} x0={10} x1={365} y0={330} t0={112} taps={[{ux: 45, uy: 346, t: 132}]} />
    </Stage>
  );
};

// ---- check: the items reviewed (abstract card; the operator screen is not in the pack) ----
const R4: React.FC = () => {
  const f = useCurrentFrame();
  const items = ["제목", "자막", "댓글", "소리"];
  return (
    <Stage>
      <Head n="2" text="사람이 확인" />
      {items.map((t, i) => {
        const p = sp(f, 24 + i * 14), ck = prog(f, 38 + i * 14, 50 + i * 14);
        return center(380 + i * 190, (
          <div style={{width: 560, height: 150, borderRadius: 36, background: C.panel, border: `3px solid ${ck > 0.5 ? "#2f8f5b" : C.line}`, display: "flex", alignItems: "center", gap: 36, padding: "0 36px", fontSize: 56, fontWeight: 900, opacity: Math.min(1, p * 2), transform: `translateX(${(1 - p) * 120}px)`}}>
            <Check p={ck} size={86} /><span>{t}</span><span style={{marginLeft: "auto", fontSize: 38, color: C.mute, fontWeight: 600}}>{ck > 0.5 ? "확인 완료" : "확인 중"}</span>
          </div>
        ), {key: t, left: 340, right: 140});
      })}
      <div style={abs({left: 0, right: 0, top: 1150, textAlign: "center", fontSize: 26, color: C.mute})}>※ 확인 항목을 설명하기 위한 그래픽입니다</div>
    </Stage>
  );
};

// ---- receive: the link arrives in the connected messenger (drawn, generic chat), then the real delivery page ----
const DMScreen: React.FC = () => {
  const f = useCurrentFrame();
  const b1 = sp(f, 18), b2 = sp(f, 36);
  return (
    <div style={{width: 390, height: 844, background: "#e8ecf0", fontFamily: "Pretendard, 'Noto Sans KR', sans-serif", color: C.ink, position: "relative"}}>
      <div style={abs({left: 0, right: 0, top: 0, height: 96, background: "#fff", display: "flex", alignItems: "flex-end", padding: "0 22px 14px", fontSize: 24, fontWeight: 900, borderBottom: "1px solid #d5dae0"})}>온고잉 · ONGOING STUDIO</div>
      <div style={abs({left: 18, top: 130, maxWidth: 270, padding: "14px 18px", borderRadius: "6px 20px 20px 20px", background: "#fff", fontSize: 21, fontWeight: 700, lineHeight: 1.4, opacity: Math.min(1, b1 * 2), transform: `translateY(${(1 - b1) * 24}px)`})}>완성본이 준비되었습니다. 아래 링크에서 확인해 주세요.</div>
      <div style={abs({left: 18, top: 262, width: 300, padding: 14, borderRadius: "6px 20px 20px 20px", background: "#fff", opacity: Math.min(1, b2 * 2), transform: `translateY(${(1 - b2) * 24}px)`})}>
        <div style={{height: 92, borderRadius: 12, background: `linear-gradient(135deg,${PINK},#2a0b16)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 40}}>▶</div>
        <div style={{marginTop: 12, fontSize: 20, fontWeight: 900}}>당신의 쇼츠가 완성됐어요</div>
        <div style={{marginTop: 4, fontSize: 16, color: "#6b7078"}}>완성본 링크</div>
      </div>
    </div>
  );
};
const R5: React.FC = () => {
  const f = useCurrentFrame();
  const page = prog(f, 134, 146);
  return (
    <Stage>
      <Head n="3" text="링크로 받기" />
      <Frame uw={390} uh={844}>
        <div style={abs({inset: 0, opacity: 1 - page})}><div style={abs({left: 0, top: 0, width: 390, height: 844})}><DMScreen /></div></div>
        <div style={abs({inset: 0, opacity: page})}><Shot src="shot-delivery.png" /></div>
      </Frame>
      {f >= 146 && <Box x={C1.px(48)} y={C1.py(564)} w={C1.px(342) - C1.px(48)} h={C1.py(600) - C1.py(564)} at={158} />}
      <Cursor stops={[{x: C1.px(150), y: C1.py(420), t: 128}, {x: C1.px(193), y: C1.py(582), t: 168}]} />
      <Callout file="shot-delivery.png" uw={390} uh={844} x0={10} x1={380} y0={540} t0={150} taps={[{ux: 193, uy: 582, t: 168}]} />
    </Stage>
  );
};

const R6: React.FC = () => {
  const f = useCurrentFrame();
  const s = sp(f, 62), pulse = 1 + 0.025 * Math.sin(f / 5);
  return (
    <Stage>
      <Slam text="간단하게 보내고," at={3} top={300} size={108} hl={["간단하게"]} />
      <Slam text="편집은 온고잉." at={26} top={470} size={124} hl={["온고잉."]} />
      {center(840, <div style={{transform: `scale(${(0.6 + 0.4 * s) * pulse})`, opacity: Math.min(1, s * 2)}}><LogoWhite w={800} /></div>)}
      {center(1230, <div style={{display: "flex", gap: 22}}>{["보내기", "맡기기", "받기"].map((t, i) => <Pill key={t} text={`✓ ${t}`} p={prog(f, 80 + i * 8, 92 + i * 8)} />)}</div>)}
    </Stage>
  );
};

// ---- meme layer: stickers, "press here" arrows and click bursts, timed to the narration (absolute seconds). All drawn here; nothing borrowed. ----
type Ov = {t0: number; t1: number; kind: "sticker" | "point" | "burst"; x: number; y: number; text?: string; size?: number; rot?: number; dir?: "up" | "down" | "left" | "right"; color?: string};
const OV: Ov[] = [
  // send (narration 6.6-11.8)
  {t0: 6.7, t1: 8.5, kind: "sticker", x: 540, y: 1105, text: "📱 폰 영상 그대로 OK!", rot: -3},
  {t0: 7.0, t1: 8.4, kind: "point", x: 536, y: 712, dir: "up"},
  {t0: 8.7, t1: 10.5, kind: "sticker", x: 540, y: 1105, text: "🔗 링크만 붙여넣기!", rot: 2},
  {t0: 9.0, t1: 10.4, kind: "point", x: 768, y: 712, dir: "up"},
  {t0: 10.8, t1: 12.6, kind: "sticker", x: 540, y: 1105, text: "누르면 끝!", rot: -2, color: "#ff6f91"},
  {t0: 11.4, t1: 12.2, kind: "burst", x: 639, y: 818, text: "딸깍!"},
  // hand over (13.0-19.0)
  {t0: 14.3, t1: 16.2, kind: "sticker", x: 540, y: 1105, text: "맡기면 알아서 척척 ✨", rot: -3},
  {t0: 14.7, t1: 16.0, kind: "point", x: 769, y: 600, dir: "up"},
  {t0: 16.5, t1: 19.0, kind: "sticker", x: 540, y: 1105, text: "직접 정해도 OK ✋", rot: 3},
  {t0: 17.2, t1: 18.6, kind: "point", x: 473, y: 600, dir: "up"},
  // templates + title (19.7-24.2)
  {t0: 20.9, t1: 22.6, kind: "sticker", x: 540, y: 1105, text: "👀 미리 보고 골라요", rot: -2},
  {t0: 21.1, t1: 22.4, kind: "point", x: 734, y: 1040, dir: "up"},
  {t0: 22.8, t1: 25.2, kind: "sticker", x: 540, y: 1105, text: "제목은 내 손으로 ✍️", rot: 2},
  {t0: 23.5, t1: 24.8, kind: "point", x: 442, y: 836, dir: "up"},
  // review (25.7-29.8)
  {t0: 26.2, t1: 29.9, kind: "sticker", x: 540, y: 1210, text: "마지막은 사람이 한 번 더! 👀", size: 54, rot: -2},
  // receive (30.8-35.1)
  {t0: 31.1, t1: 34.0, kind: "sticker", x: 540, y: 1105, text: "💬 메신저로 링크 도착!", rot: -2},
  {t0: 35.0, t1: 35.8, kind: "burst", x: 580, y: 890, text: "톡!"},
  {t0: 34.4, t1: 36.6, kind: "sticker", x: 540, y: 1105, text: "눌러서 확인, 끝!", rot: 2, color: "#ff6f91"},
];
// ---- 고잉이: an original editor mascot. Mouth follows the narration loudness (mouthData.ts), the arm points at whatever the narration is pointing at. ----
const MX = 20, MY = 560, SHX = MX + 250, SHY = MY + 330;   // canvas position of the mascot and of its pointing shoulder
const idleArm = 95;
const pointAt = (t: number) => {
  const tg = OV.filter((o) => o.kind === "point" || o.kind === "burst").sort((a, b) => a.t0 - b.t0);
  const ang = (o: Ov) => (Math.atan2(o.y - SHY, o.x - SHX) * 180) / Math.PI;
  let cur = idleArm, prev = idleArm;
  for (const o of tg) {
    if (t >= o.t0) {
      const k = Math.min(1, (t - o.t0) / 0.25), back = t > o.t1 ? Math.min(1, (t - o.t1) / 0.25) : 0;
      const a = prev + (ang(o) - prev) * k;
      cur = t > o.t1 ? a + (idleArm - a) * back : a;
      prev = t > o.t1 ? idleArm : ang(o);
    }
  }
  return cur;
};
const Mascot: React.FC = () => {
  const f = useCurrentFrame(), t = f / 30;
  if (t < 6.5 || t > 36.7) return null;
  const lvl = MOUTH[Math.min(f, MOUTH.length - 1)] ?? 0;
  const p = sp(f, 195), out = 1 - prog(f, 1068, 1100);
  const blink = (f % 96) < 4 ? 0.1 : 1;
  const cheer = OV.some((o) => o.kind === "sticker" && t >= o.t0 && t <= o.t1);
  const arm = pointAt(t);
  const bob = Math.sin(f / 9) * 4 - lvl * 6;
  const skin = "#ffd9b8", dark = "#1b1b1f", ruby = "#bd1e51";
  return (
    <svg width={340} height={470} viewBox="0 0 340 470" style={{position: "absolute", left: MX, top: MY, opacity: Math.min(1, p * 2) * out, transform: `translateY(${bob + (1 - p) * 60}px) rotate(${Math.sin(f / 14) * 1.5}deg)`, transformOrigin: "170px 460px", filter: "drop-shadow(0 18px 24px rgba(0,0,0,0.5))"}}>
      <rect x={70} y={250} width={200} height={215} rx={64} fill={ruby} />
      <path d="M135 252 Q170 285 205 252" fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" />
      <path d="M150 275 v40 M190 275 v40" stroke="#fff" strokeWidth={6} strokeLinecap="round" />
      <ellipse cx={92} cy={350} rx={22} ry={60} fill={ruby} transform="rotate(8 92 350)" />
      <circle cx={88} cy={410} r={24} fill={skin} />
      <circle cx={170} cy={150} r={105} fill={skin} />
      <path d="M62 140 Q170 -20 278 140 Q250 96 170 92 Q90 96 62 140Z" fill="#26262b" />
      <path d="M72 140 Q170 0 268 140" fill="none" stroke="#fff" strokeWidth={13} strokeLinecap="round" />
      <circle cx={64} cy={160} r={27} fill={ruby} stroke="#fff" strokeWidth={7} />
      <circle cx={276} cy={160} r={27} fill={ruby} stroke="#fff" strokeWidth={7} />
      <path d="M276 184 Q268 232 222 236" fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" />
      <circle cx={218} cy={236} r={10} fill={dark} />
      {[135, 205].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={160} rx={13} ry={18 * blink + 1} fill={dark} />
          {blink > 0.5 && <circle cx={x + 4} cy={153} r={4.5} fill="#fff" />}
          <path d={`M${x - 20} ${cheer ? 118 : 126} Q${x} ${cheer ? 104 : 116} ${x + 20} ${cheer ? 118 : 126}`} fill="none" stroke={dark} strokeWidth={6} strokeLinecap="round" />
        </g>
      ))}
      <circle cx={108} cy={192} r={16} fill="#ff9bb0" opacity={0.65} />
      <circle cx={232} cy={192} r={16} fill="#ff9bb0" opacity={0.65} />
      <ellipse cx={170} cy={212} rx={22 + lvl * 6} ry={4 + 24 * lvl} fill="#3a1220" />
      {lvl > 0.3 && <ellipse cx={170} cy={212 + (4 + 24 * lvl) * 0.5} rx={13} ry={Math.min(9, 3 + 8 * lvl)} fill="#ff6f91" />}
      <g transform={`translate(250 330) rotate(${arm})`}>
        <rect x={0} y={-19} width={118} height={38} rx={19} fill={ruby} />
        <circle cx={128} cy={0} r={26} fill={skin} />
        <rect x={136} y={-8} width={44} height={16} rx={8} fill={skin} />
      </g>
    </svg>
  );
};

const Meme: React.FC<{o: Ov}> = ({o}) => {
  const f = useCurrentFrame(), t = f / 30;
  if (t < o.t0 || t > o.t1) return null;
  const p = sp(f, Math.round(o.t0 * 30)), out = 1 - prog(f, Math.round((o.t1 - 0.2) * 30), Math.round(o.t1 * 30));
  const wob = Math.sin((t - o.t0) * 9) * 1.4;
  if (o.kind === "sticker") {
    return <div style={abs({left: 90, width: 900, top: o.y - 60, display: "flex", justifyContent: "center", opacity: Math.min(1, p * 2) * out, transform: `scale(${0.5 + 0.5 * p}) rotate(${(o.rot ?? 0) + wob}deg)`})}>
      <span style={{padding: "14px 40px", borderRadius: 26, background: o.color ?? "#ffe14d", color: "#161616", fontSize: o.size ?? 70, fontWeight: 900, border: "7px solid #161616", boxShadow: "10px 10px 0 #161616", fontFamily: "Pretendard, 'Noto Sans KR', sans-serif", whiteSpace: "nowrap"}}>{o.text}</span>
    </div>;
  }
  if (o.kind === "point") {  // arrow whose tip sits on (x,y), bobbing toward the target
    const bob = Math.sin((t - o.t0) * 12) * 14, rot = {up: 0, right: 90, down: 180, left: 270}[o.dir ?? "up"];
    return <svg width={150} height={190} viewBox="0 0 150 190" style={{position: "absolute", left: o.x - 75, top: o.y - 8, opacity: Math.min(1, p * 2) * out, transformOrigin: "75px 8px", transform: `rotate(${rot}deg) translateY(${bob}px)`, filter: "drop-shadow(0 10px 12px rgba(0,0,0,0.5))"}}>
      <path d="M75 8 L140 88 L100 88 L100 182 L50 182 L50 88 L10 88 Z" fill={PINK} stroke="#fff" strokeWidth={8} strokeLinejoin="round" />
    </svg>;
  }
  const pts = Array.from({length: 16}, (_, i) => { const a = (i / 16) * Math.PI * 2, r = i % 2 ? 78 : 130; return `${150 + Math.cos(a) * r},${150 + Math.sin(a) * r}`; }).join(" ");
  return <svg width={300} height={300} viewBox="0 0 300 300" style={{position: "absolute", left: o.x - 150, top: o.y - 150, opacity: out, transform: `scale(${0.4 + 0.8 * p}) rotate(${wob * 3}deg)`}}>
    <polygon points={pts} fill="#ffe14d" stroke="#161616" strokeWidth={8} strokeLinejoin="round" />
    <text x={150} y={176} textAnchor="middle" fontSize={66} fontWeight={900} fill="#161616" fontFamily="Pretendard, 'Noto Sans KR', sans-serif">{o.text}</text>
  </svg>;
};

export const REAL_PLAN: [number, number, React.FC, boolean][] = [[0, 6.5, H, false], [6.5, 12.9, R1, true], [12.9, 19.6, R2, true], [19.6, 25.6, R3, true], [25.6, 30.7, R4, true], [30.7, 36.7, R5, true], [36.7, 41.2, R6, true]];
export const REAL_FRAMES = sec(41.2);

export const AdReal: React.FC<{narration?: boolean}> = ({narration = false}) => (
  <AbsoluteFill style={{background: C.bg}}>
    {REAL_PLAN.map(([a, b, Comp, wipe], i) => <Sequence key={i} from={sec(a)} durationInFrames={sec(b - a)}><Cut wipe={wipe} punch={false}><Comp /></Cut></Sequence>)}
    <Mascot />
    {OV.map((o, i) => <Meme key={i} o={o} />)}
    <Audio src={staticFile("audio_real.wav")} volume={narration ? 0.5 : 1} />
    {narration && <Audio src={staticFile("narration_real.wav")} />}
  </AbsoluteFill>
);
