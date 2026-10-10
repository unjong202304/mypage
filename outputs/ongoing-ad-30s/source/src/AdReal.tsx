// "간단하게 보내고, 편집은 온고잉" — the real intake / template / title / delivery pages from the asset pack, driven with taps and zooms.
// The pack's screens are recordings and QA captures of the guide state, not proof of a live run: nothing here claims more than the page shows.
import React from "react";
import {AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from "remotion";
import {abs, Cut, PINK, sp, Slam} from "./AdFast";
import {center, E0, Pill} from "./AdEasy";
import {Check, LogoWhite, ring, Stage} from "./parts";
import {A, C, prog, sec} from "./theme";

const CL = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const PW = 600, PL = 240, PT = 350;               // phone width / left / top on the 1080x1920 canvas
const SX = (PW - 2 * 0.022 * PW) / 390;           // screen px per UI px
const px = (ux: number, w = 390) => PL + 0.022 * PW + ux * (PW - 0.044 * PW) / w;
const py = (uy: number, w = 390) => PT + 0.022 * PW + uy * (PW - 0.044 * PW) / w;

const Tap: React.FC<{x: number; y: number; at: number}> = ({x, y, at}) => {
  const p = interpolate(useCurrentFrame(), [at, at + 16], [0, 1], CL);
  if (p <= 0 || p >= 1) return null;
  return <div style={abs({left: x - 60, top: y - 60, width: 120, height: 120, borderRadius: 60, border: `7px solid rgba(219,56,108,${1 - p})`, background: `rgba(219,56,108,${0.25 * (1 - p)})`, transform: `scale(${0.4 + 1.1 * p})`})} />;
};
const Box: React.FC<{x: number; y: number; w: number; h: number; at: number}> = ({x, y, w, h, at}) => {
  const p = prog(useCurrentFrame(), at, at + 10);
  return <div style={abs({left: x, top: y, width: w, height: h, borderRadius: 22, opacity: p, ...ring(p)})} />;
};
// Slow push-in on the phone with a focus zoom between a and b (frames), easing back at c.
const Zoom: React.FC<{ox: number; oy: number; a: number; b: number; c: number; amount?: number; children: React.ReactNode}> = ({ox, oy, a, b, c, amount = 0.2, children}) => {
  const f = useCurrentFrame();
  const z = 1 + 0.02 * prog(f, 0, 200) + amount * (prog(f, a, b) - prog(f, b + 6, c));
  return <div style={abs({inset: 0, transformOrigin: `${ox}px ${oy}px`, transform: `scale(${z})`})}>{children}</div>;
};

type Stop = {x: number; y: number; t: number};
const ptLerp = (a: number, b: number, p: number) => a + (b - a) * p;
// Mouse pointer that glides to each stop, presses (shrinks + ring) at frame t, then moves on.
const Cursor: React.FC<{stops: Stop[]}> = ({stops}) => {
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
// Bottom caption that swaps as each step happens: ① ② ③
const Say: React.FC<{items: {t: number; text: string}[]}> = ({items}) => {
  const f = useCurrentFrame();
  let k = -1;
  items.forEach((it, i) => { if (f >= it.t) k = i; });
  if (k < 0) return null;
  const p = sp(f, items[k].t);
  return center(1725, (
    <div style={{display: "flex", alignItems: "center", gap: 20, padding: "14px 36px 14px 18px", borderRadius: 999, background: C.red, fontSize: 42, fontWeight: 900, boxShadow: `0 8px 0 ${C.redDeep}`, transform: `scale(${0.8 + 0.2 * p})`, opacity: Math.min(1, p * 2)}}>
      <span style={{width: 60, height: 60, borderRadius: 30, background: C.ivory, color: C.redDeep, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40}}>{k + 1}</span>{items[k].text}
    </div>
  ));
};
const PhoneFrame: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  const s = sp(f, 4);
  return (
    <div style={abs({left: PL, top: PT, width: PW, borderRadius: PW * 0.11, padding: PW * 0.022, background: "#0b0b0d", boxShadow: "0 70px 130px rgba(0,0,0,0.65), 0 0 0 2px #2b2b32", transform: `translateY(${(1 - s) * 220}px)`, opacity: Math.min(1, s * 2.4)})}>
      <div style={{position: "relative", width: "100%", paddingTop: `${(844 / 390) * 100}%`, borderRadius: PW * 0.09, overflow: "hidden", background: C.ivory}}><div style={{position: "absolute", inset: 0}}>{children}</div></div>
    </div>
  );
};
const fillCss: React.CSSProperties = {width: "100%", height: "100%", objectFit: "cover", objectPosition: "top"};
const Vid: React.FC<{src: string; from: number; rate: number}> = ({src, from, rate}) => <OffthreadVideo src={A(src)} startFrom={from} playbackRate={rate} muted style={fillCss} />;
const Shot: React.FC<{src: string; o?: number}> = ({src, o = 1}) => <Img src={A(src)} style={{...fillCss, position: "absolute", inset: 0, opacity: o}} />;
const Sub: React.FC<{text: string; top: number; at?: number}> = ({text, top, at = 22}) => (
  <div style={abs({left: 0, right: 0, top, textAlign: "center", fontSize: 46, fontWeight: 600, color: C.mute, opacity: prog(useCurrentFrame(), at, at + 12)})}>{text}</div>
);
const Step: React.FC<{n: string}> = ({n}) => <div style={abs({left: 0, right: 0, top: 70, textAlign: "center", fontSize: 40, fontWeight: 900, color: PINK, letterSpacing: "0.1em", opacity: prog(useCurrentFrame(), 0, 10)})}>{n}</div>;

// ---- send: file tab, then the link tab (real intake page) ----
const R1: React.FC = () => (
  <Stage>
    <Step n="STEP 01" />
    <Slam text="간단하게 보내고" at={2} top={120} size={96} hl={["간단하게"]} />
    <Sub text="폰 촬영본도, 롱폼 링크만으로도" top={250} />
    <Zoom ox={540} oy={800} a={78} b={104} c={176} amount={0.15}>
      <PhoneFrame><Vid src="rec-file-link.mp4" from={75} rate={0.85} /></PhoneFrame>
      <Cursor stops={[{x: px(117), y: py(269), t: 30}, {x: px(291), y: py(269), t: 98}, {x: px(194), y: py(366), t: 150}]} />
    </Zoom>
    <Say items={[{t: 30, text: "폰에 저장된 촬영본 바로 보내기"}, {t: 98, text: "롱폼 링크만 보내기"}, {t: 150, text: "영상 불러오기"}]} />
  </Stage>
);

// ---- hand over: let ongoing choose, or choose yourself (real mode switch) ----
const R2: React.FC = () => (
  <Stage>
    <Step n="STEP 02" />
    <Slam text="맡겨도 좋고," at={2} top={120} size={96} hl={["맡겨도"]} />
    <Slam text="직접 정해도 좋고." at={118} top={250} size={80} hl={["직접"]} />
    <Zoom ox={540} oy={640} a={14} b={36} c={110} amount={0.15}>
      <PhoneFrame><Vid src="rec-auto-manual.mp4" from={30} rate={0.8} /></PhoneFrame>
      <Cursor stops={[{x: px(292), y: py(163), t: 62}, {x: px(70), y: py(163), t: 138}]} />
    </Zoom>
    <Say items={[{t: 62, text: "온고잉이 알아서"}, {t: 138, text: "내가 구간 정해주기"}]} />
  </Stage>
);

// ---- templates, then the title (real pages; the cards are a QA capture) ----
const R3: React.FC = () => {
  const f = useCurrentFrame();
  const sw = prog(f, 100, 114);
  return (
    <Stage>
      <Step n="STEP 02" />
      <div style={abs({inset: 0, opacity: 1 - sw})}><Slam text="템플릿은 미리 보고" at={2} top={120} size={86} hl={["미리"]} /></div>
      <div style={abs({inset: 0, opacity: sw})}><Slam text="제목도 직접" at={102} top={120} size={96} hl={["직접"]} /></div>
      <Zoom ox={540} oy={1030} a={30} b={54} c={96} amount={0.14}>
        <PhoneFrame><Shot src="shot-templates.png" o={1 - sw} /><Shot src="shot-title.png" o={sw} /></PhoneFrame>
        {f < 100 && <Box x={px(181, 375)} y={py(347, 375)} w={242} h={248} at={44} />}
        <Cursor stops={[{x: px(255, 375), y: py(424, 375), t: 44}, {x: px(45, 375), y: py(346, 375), t: 132}]} />
      </Zoom>
      <Say items={[{t: 44, text: "템플릿 고르기"}, {t: 132, text: "내가 제목 정하기"}]} />
    </Stage>
  );
};

// ---- check: the items reviewed (abstract card; the operator screen is not in the pack) ----
const R4: React.FC = () => {
  const f = useCurrentFrame();
  const items = ["제목", "자막", "댓글", "소리"];
  return (
    <Stage>
      <Step n="STEP 02" />
      <Slam text="AI로 돕고," at={2} top={120} size={96} hl={["AI로"]} />
      <Slam text="사람이 확인합니다." at={16} top={250} size={96} hl={["확인합니다."]} />
      {items.map((t, i) => {
        const p = sp(f, 30 + i * 14), ck = prog(f, 44 + i * 14, 56 + i * 14);
        return center(540 + i * 215, (
          <div style={{width: 880, height: 170, borderRadius: 36, background: C.panel, border: `3px solid ${ck > 0.5 ? "#2f8f5b" : C.line}`, display: "flex", alignItems: "center", gap: 36, padding: "0 50px", fontSize: 64, fontWeight: 900, opacity: Math.min(1, p * 2), transform: `translateX(${(1 - p) * 120}px)`}}>
            <Check p={ck} size={86} /><span>{t}</span><span style={{marginLeft: "auto", fontSize: 38, color: C.mute, fontWeight: 600}}>{ck > 0.5 ? "확인 완료" : "확인 중"}</span>
          </div>
        ), {key: t});
      })}
      <div style={abs({left: 0, right: 0, top: 1800, textAlign: "center", fontSize: 28, color: C.mute})}>※ 확인 항목을 설명하기 위한 그래픽입니다</div>
    </Stage>
  );
};

// ---- receive: the real delivery page and its single link ----
const R5: React.FC = () => (
  <Stage>
    <Step n="STEP 03" />
    <Slam text="링크 하나로" at={2} top={120} size={100} hl={["링크"]} />
    <Slam text="편하게 확인하세요." at={14} top={250} size={86} hl={["편하게"]} />
    <Zoom ox={540} oy={PT + 200} a={84} b={110} c={170} amount={0.08}>
      <PhoneFrame><Shot src="shot-delivery.png" /></PhoneFrame>
      <Box x={px(48)} y={py(564)} w={px(342) - px(48)} h={py(600) - py(564)} at={92} />
      <Cursor stops={[{x: px(193), y: py(582), t: 108}]} />
    </Zoom>
    <Say items={[{t: 108, text: "드라이브에서 영상 보기"}]} />
  </Stage>
);

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

export const REAL_PLAN: [number, number, React.FC, boolean][] = [[0, 3.8, E0, false], [3.8, 10.2, R1, true], [10.2, 16.9, R2, true], [16.9, 22.9, R3, true], [22.9, 28, R4, true], [28, 34, R5, true], [34, 38.5, R6, true]];
export const REAL_FRAMES = sec(38.5);

export const AdReal: React.FC<{narration?: boolean}> = ({narration = false}) => (
  <AbsoluteFill style={{background: C.bg}}>
    {REAL_PLAN.map(([a, b, Comp, wipe], i) => <Sequence key={i} from={sec(a)} durationInFrames={sec(b - a)}><Cut wipe={wipe}><Comp /></Cut></Sequence>)}
    <Audio src={staticFile("audio_real.wav")} volume={narration ? 0.5 : 1} />
    {narration && <Audio src={staticFile("narration_real.wav")} />}
  </AbsoluteFill>
);
