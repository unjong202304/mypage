// "간단하게 보내고, 편집은 온고잉" — the real intake / template / title / delivery pages from the asset pack, driven with taps and zooms.
// The pack's screens are recordings and QA captures of the guide state, not proof of a live run: nothing here claims more than the page shows.
import React from "react";
import {AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from "remotion";
import {abs, Cut, PINK, sp, Slam} from "./AdFast";
import {CAPTIONS} from "./captionData";
import {center, Pill} from "./AdEasy";
import {Check, LogoWhite, Phone, ring, ScreenImg, ScreenVid, Stage} from "./parts";
import {A, C, prog, sec} from "./theme";

const CL = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const PW = 420, PL = 330, PT = 520;               // phone width / left / top on the 1080x1920 canvas
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
const Zoom: React.FC<{ox: number; oy: number; a: number; b: number; c: number; amount?: number; enabled?: boolean; children: React.ReactNode}> = ({ox, oy, a, b, c, amount = 0.2, enabled = false, children}) => {
  const f = useCurrentFrame();
  const z = enabled ? 1 + amount * (prog(f, a, b) - prog(f, b + 6, c)) : 1;
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
  return center(440, (
    <div style={{display: "flex", alignItems: "center", gap: 20, padding: "9px 30px 9px 14px", borderRadius: 999, background: C.red, fontSize: 36, fontWeight: 900, boxShadow: `0 8px 0 ${C.redDeep}`, transform: `scale(${0.8 + 0.2 * p})`, opacity: Math.min(1, p * 2)}}>
      <span style={{width: 52, height: 52, borderRadius: 26, background: C.ivory, color: C.redDeep, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34}}>{k + 1}</span>{items[k].text}
    </div>
  ));
};
const PhoneFrame: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  const s = sp(f, 4);
  return (
    <div style={abs({left: PL, top: PT, width: PW, borderRadius: PW * 0.11, padding: PW * 0.022, background: "#0b0b0d", boxShadow: "0 70px 130px rgba(0,0,0,0.65), 0 0 0 2px #2b2b32", opacity: Math.min(1, s * 2.4)})}>
      <div style={{position: "relative", width: "100%", paddingTop: `${(844 / 390) * 100}%`, borderRadius: PW * 0.09, overflow: "hidden", background: C.ivory}}><div style={{position: "absolute", inset: 0}}>{children}</div></div>
    </div>
  );
};
const fillCss: React.CSSProperties = {width: "100%", height: "100%", objectFit: "cover", objectPosition: "top"};
const Vid: React.FC<{src: string; from: number; rate: number}> = ({src, from, rate}) => <OffthreadVideo src={A(src)} startFrom={from} playbackRate={rate} muted style={fillCss} />;
const Shot: React.FC<{src: string; o?: number}> = ({src, o = 1}) => <Img src={A(src)} style={{...fillCss, position: "absolute", inset: 0, opacity: o}} />;
const HOOK_CUTS: {cap: [string, string?][]; node: () => React.ReactNode}[] = [
  {cap: [["보내고,"]], node: () => <ScreenVid src="rec-file-link.mp4" />},
  {cap: [["고르고,"]], node: () => <ScreenImg src="shot-templates.png" />},
  {cap: [["링크로"], ["받습니다", "hl"]], node: () => <ScreenImg src="shot-delivery.png" />},
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
      {k >= 0 && (
        <>
          <div style={abs({left: 330, top: 470})}>
            <Phone w={420}>{HOOK_CUTS[k].node()}</Phone>
          </div>
        </>
      )}
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
const R1: React.FC = () => (
  <Stage>
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
        <Zoom ox={px(178, 375)} oy={py(406, 375)} a={140} b={158} c={178} amount={0.3} enabled>
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
        {items.map((t, i) => {
        const p = sp(f, 30 + i * 14), ck = prog(f, 44 + i * 14, 56 + i * 14);
        return center(520 + i * 190, (
          <div style={{width: 800, height: 150, borderRadius: 36, background: C.panel, border: `3px solid ${ck > 0.5 ? "#2f8f5b" : C.line}`, display: "flex", alignItems: "center", gap: 36, padding: "0 50px", fontSize: 64, fontWeight: 900, opacity: Math.min(1, p * 2), transform: `translateX(${(1 - p) * 120}px)`}}>
            <Check p={ck} size={86} /><span>{t}</span><span style={{marginLeft: "auto", fontSize: 38, color: C.mute, fontWeight: 600}}>{ck > 0.5 ? "확인 완료" : "확인 중"}</span>
          </div>
        ), {key: t});
      })}
      <div style={abs({left: 0, right: 0, top: 1290, textAlign: "center", fontSize: 28, color: C.mute})}>※ 확인 항목을 설명하기 위한 그래픽입니다</div>
    </Stage>
  );
};

// ---- receive: the link arrives in the connected messenger (drawn, generic chat), then the real delivery page ----
const DMScreen: React.FC = () => {
  const f = useCurrentFrame();
  const b1 = sp(f, 14), b2 = sp(f, 30);
  return (
    <div style={{width: 390, height: 844, transform: `scale(${SX})`, transformOrigin: "0 0", background: "#e8ecf0", fontFamily: "Pretendard, 'Noto Sans KR', sans-serif", color: C.ink, position: "relative"}}>
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
  const page = prog(f, 80, 92);
  return (
    <Stage>
      <PhoneFrame>
        <div style={abs({inset: 0, opacity: 1 - page})}><DMScreen /></div>
        <div style={abs({inset: 0, opacity: page})}><Shot src="shot-delivery.png" /></div>
      </PhoneFrame>
      {f >= 92 && <Box x={px(48)} y={py(564)} w={px(342) - px(48)} h={py(600) - py(564)} at={118} />}
      <Cursor stops={[{x: px(150, 390), y: py(300, 390), t: 72}, {x: px(193), y: py(582), t: 140}]} />
      <Say items={[{t: 14, text: "연결한 메신저로 링크 도착"}, {t: 72, text: "링크 누르기"}, {t: 140, text: "드라이브에서 영상 보기"}]} />
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


// ---- karaoke captions: each word fills left-to-right while it is spoken (timings: make_caption_timing.py) ----
const HIDE: [number, number][] = [[0, 1.65], [4.4, 6.55], [36.7, 41.2]];   // scenes whose big on-screen text already is the caption
type CW = {w: string; s: number; e: number};
const CHUNKS: CW[][] = (() => {
  const out: CW[][] = []; let cur: CW[] = [];
  for (const w of CAPTIONS.flat()) {
    const len = cur.reduce((n, x) => n + x.w.length + 1, 0);
    if (cur.length && (/[,.?!]$/.test(cur[cur.length - 1].w) || len + w.w.length > 15)) { out.push(cur); cur = []; }
    cur.push(w);
  }
  if (cur.length) out.push(cur);
  return out;
})();
const Karaoke: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  if (HIDE.some(([a, b]) => t >= a && t < b)) return null;
  const i = CHUNKS.findIndex((c, k) => t >= c[0].s - 0.12 && t < Math.min(c[c.length - 1].e + 0.4, CHUNKS[k + 1] ? CHUNKS[k + 1][0].s - 0.12 : 1e9));
  if (i < 0) return null;
  const ch = CHUNKS[i];
  const stroke: React.CSSProperties = {WebkitTextStroke: "9px #000", paintOrder: "stroke fill"};
  return (
    <div style={abs({left: 140, width: 800, top: 215, textAlign: "center", fontFamily: "Pretendard, 'Noto Sans KR', sans-serif", wordBreak: "keep-all"})}>
      <div style={{display: "inline-block", padding: "14px 30px 18px", borderRadius: 30, background: "rgba(0,0,0,0.55)", fontSize: 64, fontWeight: 900, lineHeight: 1.3, opacity: Math.min(1, (t - (ch[0].s - 0.12)) * 14)}}>
        {ch.map((w, k) => {
          const p = Math.min(1, Math.max(0, (t - w.s) / Math.max(0.05, w.e - w.s)));
          return (
            <span key={k} style={{position: "relative", display: "inline-block", marginRight: 16}}>
              <span style={{color: "rgba(255,255,255,0.5)", ...stroke}}>{w.w}</span>
              <span style={{position: "absolute", left: 0, top: 0, whiteSpace: "nowrap", color: "#ffe14d", clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`, ...stroke}}>{w.w}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const REAL_PLAN: [number, number, React.FC, boolean][] = [[0, 6.5, H, false], [6.5, 12.9, R1, true], [12.9, 19.6, R2, true], [19.6, 25.6, R3, true], [25.6, 30.7, R4, true], [30.7, 36.7, R5, true], [36.7, 41.2, R6, true]];
export const REAL_FRAMES = sec(41.2);

export const AdReal: React.FC<{narration?: boolean}> = ({narration = false}) => (
  <AbsoluteFill style={{background: C.bg}}>
    {REAL_PLAN.map(([a, b, Comp, wipe], i) => <Sequence key={i} from={sec(a)} durationInFrames={sec(b - a)}><Cut wipe={wipe} punch={false}><Comp /></Cut></Sequence>)}
    <Karaoke />
    <Audio src={staticFile("audio_real.wav")} volume={narration ? 0.5 : 1} />
    {narration && <Audio src={staticFile("narration_real.wav")} />}
  </AbsoluteFill>
);
