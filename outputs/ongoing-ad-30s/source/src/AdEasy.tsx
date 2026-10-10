// "편하게 보내고 · 편하게 맡기고 · 편하게 받고" — every graphic here is drawn in code (SVG/CSS); only the brand logo is an image.
import React from "react";
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from "remotion";
import {abs, Cut, PINK, sp, Slam} from "./AdFast";
import {Check, LogoWhite, ring, Stage} from "./parts";
import {C, prog, sec} from "./theme";

const CL = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const center = (top: number, children: React.ReactNode, extra: React.CSSProperties = {}) => (
  <div style={abs({left: 0, right: 0, top, display: "flex", justifyContent: "center", ...extra})}>{children}</div>
);
const Pill: React.FC<{text: string; p?: number; bg?: string; size?: number}> = ({text, p = 1, bg = "rgba(255,255,255,0.1)", size = 40}) => (
  <span style={{display: "inline-block", padding: "16px 34px", borderRadius: 999, fontSize: size, fontWeight: 800, background: bg, opacity: Math.min(1, p * 2), transform: `scale(${0.8 + 0.2 * p})`, border: `2px solid ${C.line}`}}>{text}</span>
);

// ---- 0-4s: the 2 a.m. hook, with a clock that spins to 2:00 ----
const E0: React.FC = () => {
  const f = useCurrentFrame();
  const t = prog(f, 0, 64);
  const ticks = Array.from({length: 12}, (_, i) => i);
  return (
    <Stage>
      <Slam text="롱폼 하나 끝내면," at={3} top={170} size={80} />
      <Slam text="벌써 새벽 2시." at={20} top={290} size={100} hl={["새벽"]} />
      {center(640, (
        <svg width={560} height={560} viewBox="0 0 560 560" style={{filter: "drop-shadow(0 30px 50px rgba(0,0,0,0.5))", transform: `scale(${0.85 + 0.15 * prog(f, 0, 12)})`}}>
          <circle cx={280} cy={280} r={262} fill={C.panel} stroke={C.ivory} strokeWidth={10} />
          {ticks.map((i) => <line key={i} x1={280} y1={34} x2={280} y2={i % 3 === 0 ? 70 : 52} stroke={C.ivory} strokeWidth={i % 3 === 0 ? 10 : 5} strokeLinecap="round" transform={`rotate(${i * 30} 280 280)`} />)}
          <line x1={280} y1={280} x2={280} y2={120} stroke={PINK} strokeWidth={10} strokeLinecap="round" transform={`rotate(${2160 * t} 280 280)`} />
          <line x1={280} y1={280} x2={280} y2={170} stroke={C.ivory} strokeWidth={18} strokeLinecap="round" transform={`rotate(${60 * t} 280 280)`} />
          <circle cx={280} cy={280} r={16} fill={C.ivory} />
        </svg>
      ), {transform: `rotate(${(1 - prog(f, 0, 14)) * -12}deg)`})}
      {[0, 1, 2].map((i) => center(1330 + i * 130, <Pill text={`쇼츠 ${i + 1}  ·  대기`} p={prog(f, 66 + i * 7, 78 + i * 7)} />, {opacity: 0.85 - i * 0.18}))}
    </Stage>
  );
};

// ---- 4-9.5s: send (file or link flies into the ongoing portal) ----
const Flyer: React.FC<{x0: number; y0: number; t0: number; w: number; h: number; children: React.ReactNode}> = ({x0, y0, t0, w, h, children}) => {
  const f = useCurrentFrame();
  const p = prog(f, t0, t0 + 34);
  if (f < t0) return null;
  const x = x0 + (540 - x0) * p, y = y0 + (1010 - y0) * p - Math.sin(Math.PI * p) * 140;
  return <div style={abs({left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `scale(${1 - 0.7 * p}) rotate(${(1 - p) * -8}deg)`, opacity: 1 - Math.max(0, (p - 0.86) / 0.14)})}>{children}</div>;
};
const E1: React.FC = () => {
  const f = useCurrentFrame();
  const pulse = (k: number) => prog(f, 50 + k * 56, 80 + k * 56);
  const absorbed = [58, 92, 114, 148].some((a) => f >= a && f < a + 10);
  return (
    <Stage>
      <div style={abs({left: 0, right: 0, top: 120, textAlign: "center", fontSize: 44, fontWeight: 900, color: PINK, letterSpacing: "0.1em", opacity: prog(f, 0, 10)})}>STEP 01</div>
      <Slam text="편하게 보내고" at={3} top={190} size={104} hl={["편하게"]} />
      <div style={abs({left: 0, right: 0, top: 350, textAlign: "center", fontSize: 50, fontWeight: 600, color: C.mute, opacity: prog(f, 22, 36)})}>파일도, 링크도 불러오기만 하면</div>
      {[0, 1].map((k) => <div key={k} style={abs({left: 540 - 190, top: 1010 - 190, width: 380, height: 380, borderRadius: 90, border: `4px solid ${C.red}`, opacity: (1 - pulse(k)) * (f > 50 + k * 56 ? 0.9 : 0), transform: `scale(${1 + pulse(k) * 0.7})`})} />)}
      <div style={abs({left: 540 - 180, top: 1010 - 180, width: 360, height: 360, borderRadius: 86, display: "flex", alignItems: "center", justifyContent: "center",
        background: `linear-gradient(160deg,${PINK},${C.redDeep})`, boxShadow: `0 30px 70px rgba(0,0,0,0.5), 0 0 ${absorbed ? 90 : 40}px rgba(219,56,108,0.5)`, transform: `scale(${(0.6 + 0.4 * sp(f, 8)) * (absorbed ? 1.06 : 1)})`})}>
        <LogoWhite w={270} />
      </div>
      {[16, 80].map((t0) => (
        <Flyer key={"a" + t0} x0={170} y0={560} t0={t0} w={290} h={200}>
          <div style={{width: "100%", height: "100%", borderRadius: 26, background: C.panel, border: `3px solid ${C.line}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, boxShadow: "0 20px 40px rgba(0,0,0,0.4)"}}>
            <svg width={96} height={72} viewBox="0 0 96 72"><rect x={2} y={2} width={92} height={68} rx={12} fill="none" stroke={C.ivory} strokeWidth={5} /><path d="M38 20 L64 36 L38 52 Z" fill={PINK} /></svg>
            <span style={{fontSize: 34, fontWeight: 800}}>영상 파일</span>
          </div>
        </Flyer>
      ))}
      {[36, 106].map((t0) => (
        <Flyer key={"b" + t0} x0={910} y0={600} t0={t0} w={370} h={120}>
          <div style={{width: "100%", height: "100%", borderRadius: 999, background: C.ivory, color: C.ink, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontSize: 38, fontWeight: 800, boxShadow: "0 20px 40px rgba(0,0,0,0.4)"}}>
            <svg width={44} height={44} viewBox="0 0 44 44"><path d="M18 26 L26 18 M14 22 l-4 4 a8 8 0 0 0 12 12 l4 -4 M30 22 l4 -4 a8 8 0 0 0 -12 -12 l-4 4" fill="none" stroke={C.redDeep} strokeWidth={5} strokeLinecap="round" /></svg>영상 링크
          </div>
        </Flyer>
      ))}
      {center(1380, <div style={{display: "flex", gap: 24}}><Pill text="파일 불러오기" p={prog(f, 40, 54)} /><Pill text="링크로 불러오기" p={prog(f, 50, 64)} /></div>)}
    </Stage>
  );
};

// ---- 9.5-13.8s: hand over (do it yourself, or let it run) ----
const wave = (i: number) => 0.35 + 0.65 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.53));
const E2a: React.FC = () => {
  const f = useCurrentFrame();
  const auto = f >= 62;
  const knob = prog(f, 58, 72);
  const dragX = 150 + 330 * prog(f, 8, 48);
  return (
    <Stage>
      <div style={abs({left: 0, right: 0, top: 120, textAlign: "center", fontSize: 44, fontWeight: 900, color: PINK, letterSpacing: "0.1em", opacity: prog(f, 0, 10)})}>STEP 02</div>
      <Slam text="편하게 맡기고" at={3} top={190} size={104} hl={["편하게"]} />
      {center(480, (
        <div style={{position: "relative", width: 920, height: 140, borderRadius: 70, background: C.panel, border: `3px solid ${C.line}`, opacity: prog(f, 6, 18)}}>
          <div style={abs({top: 10, bottom: 10, left: 10 + 450 * knob, width: 450, borderRadius: 60, background: `linear-gradient(180deg,${PINK},${C.red})`, boxShadow: `0 8px 0 ${C.redDeep}`})} />
          <div style={abs({top: 0, bottom: 0, left: 10, width: 450, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 900, color: auto ? C.mute : C.ivory})}>내가 구간 정해주기</div>
          <div style={abs({top: 0, bottom: 0, right: 10, width: 450, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 900, color: auto ? C.ivory : C.mute})}>온고잉이 알아서</div>
        </div>
      ))}
      {center(720, (
        <div style={{position: "relative", width: 920, height: 520, borderRadius: 40, background: C.panel, border: `3px solid ${C.line}`, overflow: "hidden", opacity: prog(f, 10, 24)}}>
          <div style={abs({left: 40, right: 40, top: 70, height: 300, display: "flex", alignItems: "center", justifyContent: "space-between"})}>
            {Array.from({length: 46}, (_, i) => <div key={i} style={{width: 10, borderRadius: 5, height: 300 * wave(i), background: "rgba(250,249,246,0.3)"}} />)}
          </div>
          {!auto && (
            <>
              <div style={abs({left: dragX - 130, top: 50, width: 260, height: 340, borderRadius: 24, background: "rgba(219,56,108,0.28)", border: `5px solid ${PINK}`})} />
              <div style={abs({left: dragX + 112, top: 190, width: 36, height: 36, borderRadius: 18, background: C.ivory, boxShadow: "0 0 0 10px rgba(250,249,246,0.25)"})} />
            </>
          )}
          {auto && [150, 420, 690].map((x, i) => {
            const p = sp(f, 72 + i * 8);
            return (
              <div key={x} style={abs({left: x, top: 50, width: 200, height: 340, borderRadius: 24, background: "rgba(219,56,108,0.28)", border: `5px solid ${PINK}`, opacity: Math.min(1, p * 2), transform: `scale(${0.7 + 0.3 * p})`, ...ring(p * 0.6)})}>
                <span style={{position: "absolute", top: -26, right: -14, fontSize: 56, color: PINK}}>✦</span>
              </div>
            );
          })}
          <div style={abs({left: 0, right: 0, bottom: 34, textAlign: "center", fontSize: 38, fontWeight: 700, color: C.mute})}>
            {auto ? "구간·제목·템플릿을 자동으로 골라요" : "구간과 템플릿을 직접 선택해요"}
          </div>
        </div>
      ))}
    </Stage>
  );
};

// ---- 13.8-18s: preview templates, AI helps, a person checks ----
const GRADS = [["#db386c", "#6b1230"], ["#3a7bd5", "#16315c"], ["#f2a541", "#7a3a14"], ["#2f8f5b", "#123d28"], ["#8e5ad7", "#35195e"], ["#e8e3d8", "#8a8577"]];
const E2b: React.FC = () => {
  const f = useCurrentFrame();
  const hot = f < 34 ? -1 : f < 58 ? 1 : f < 82 ? 4 : 2;
  return (
    <Stage>
      <Slam text="미리 보고 정하고" at={2} top={130} size={92} hl={["미리"]} />
      {center(340, (
        <div style={{display: "grid", gridTemplateColumns: "repeat(3, 270px)", gap: 30}}>
          {GRADS.map(([a, b], i) => {
            const p = sp(f, 6 + i * 4), on = hot === i;
            return (
              <div key={i} style={{position: "relative", width: 270, height: 440, borderRadius: 28, background: `linear-gradient(170deg,${a},${b})`, opacity: Math.min(1, p * 2), transform: `scale(${(0.7 + 0.3 * p) * (on ? 1.07 : 1)})`, ...(on ? ring(1) : {boxShadow: "0 20px 40px rgba(0,0,0,0.4)"})}}>
                <div style={abs({left: 24, right: 24, top: 36, height: 56, borderRadius: 14, background: "rgba(255,255,255,0.88)", color: C.ink, fontSize: 28, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center"})}>제목</div>
                <div style={abs({left: 24, right: 24, top: 190, height: 70, borderRadius: 14, border: "3px dashed rgba(255,255,255,0.7)", color: "#fff", fontSize: 26, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center"})}>댓글 자리</div>
                <div style={abs({left: 24, right: 24, bottom: 36, height: 60, borderRadius: 14, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 28, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center"})}>자막</div>
              </div>
            );
          })}
        </div>
      ))}
      {center(1380, (
        <div style={{display: "flex", alignItems: "center", gap: 26}}>
          <Pill text="AI로 돕고" p={prog(f, 50, 62)} />
          <span style={{fontSize: 52, color: C.mute, opacity: prog(f, 60, 68)}}>→</span>
          <span style={{opacity: prog(f, 66, 78), display: "inline-flex", alignItems: "center", gap: 16}}><Check p={prog(f, 74, 86)} size={64} /><Pill text="사람이 확인" p={prog(f, 66, 78)} bg={C.red} /></span>
        </div>
      ))}
    </Stage>
  );
};

// ---- 18-24s: receive (one link to the finished video) ----
const E3: React.FC = () => {
  const f = useCurrentFrame();
  const line = prog(f, 26, 50);
  const fillBar = interpolate(f, [90, 170], [0.08, 0.92], CL);
  return (
    <Stage>
      <div style={abs({left: 0, right: 0, top: 120, textAlign: "center", fontSize: 44, fontWeight: 900, color: PINK, letterSpacing: "0.1em", opacity: prog(f, 0, 10)})}>STEP 03</div>
      <Slam text="편하게 받고" at={3} top={190} size={104} hl={["편하게"]} />
      {center(400, <div style={{transform: `scale(${0.6 + 0.4 * sp(f, 14)})`, opacity: prog(f, 12, 22), width: 200, height: 200, borderRadius: 50, background: `linear-gradient(160deg,${PINK},${C.redDeep})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 50px rgba(0,0,0,0.5)"}}><LogoWhite w={150} /></div>)}
      <div style={abs({left: 538, top: 610, width: 4, height: 110 * line, background: `repeating-linear-gradient(180deg, ${PINK} 0 14px, transparent 14px 26px)`})} />
      {center(730, <Pill text="🔗 완성본 링크" p={prog(f, 46, 60)} bg={C.ivory} size={44} />, {color: C.ink})}
      {center(900, (
        <div style={{position: "relative", width: 420, height: 800, borderRadius: 64, padding: 14, background: "#0b0b0d", boxShadow: "0 60px 110px rgba(0,0,0,0.6), 0 0 0 2px #2b2b32", transform: `translateY(${(1 - sp(f, 56)) * 160}px)`, opacity: prog(f, 56, 66)}}>
          <div style={{position: "relative", width: "100%", height: "100%", borderRadius: 50, overflow: "hidden", background: `linear-gradient(170deg,${PINK},#2a0b16 70%)`}}>
            <svg width={120} height={120} viewBox="0 0 120 120" style={{position: "absolute", left: 150, top: 300}}><circle cx={60} cy={60} r={56} fill="rgba(255,255,255,0.2)" /><path d="M48 34 L88 60 L48 86 Z" fill="#fff" /></svg>
            <div style={abs({left: 30, right: 30, bottom: 70, height: 10, borderRadius: 5, background: "rgba(255,255,255,0.3)"})}><div style={{width: `${fillBar * 100}%`, height: "100%", borderRadius: 5, background: "#fff"}} /></div>
            <div style={abs({left: 0, right: 0, top: 90, textAlign: "center", fontSize: 40, fontWeight: 900})}>완성본</div>
          </div>
        </div>
      ))}
      {center(950, <Pill text="검수 완료 ✓" p={prog(f, 84, 98)} bg="#2f8f5b" size={36} />, {left: 640, right: 20, transform: "rotate(6deg)"})}
    </Stage>
  );
};

// ---- 24-30s: the promise, then the logo ----
const E4: React.FC = () => {
  const f = useCurrentFrame();
  const s = sp(f, 84), pulse = 1 + 0.025 * Math.sin(f / 5);
  return (
    <Stage>
      <Slam text="편하게 보내고," at={3} top={300} size={104} hl={["편하게"]} />
      <Slam text="편하게 맡기고," at={26} top={450} size={104} hl={["편하게"]} />
      <Slam text="편하게 받으세요." at={50} top={600} size={104} hl={["편하게"]} />
      {center(930, <div style={{transform: `scale(${(0.6 + 0.4 * s) * pulse})`, opacity: Math.min(1, s * 2)}}><LogoWhite w={780} /></div>)}
      <Slam text="영상은 보내고, 편집은 온고잉" at={104} top={1180} size={60} hl={["온고잉"]} stagger={4} />
    </Stage>
  );
};

const PLAN: [number, number, React.FC, boolean][] = [[0, 4, E0, false], [4, 9.5, E1, true], [9.5, 13.8, E2a, true], [13.8, 18, E2b, true], [18, 24, E3, true], [24, 30, E4, true]];

export const AdEasy: React.FC<{narration?: boolean}> = ({narration = false}) => (
  <AbsoluteFill style={{background: C.bg}}>
    {PLAN.map(([a, b, Comp, wipe], i) => <Sequence key={i} from={sec(a)} durationInFrames={sec(b - a)}><Cut wipe={wipe}><Comp /></Cut></Sequence>)}
    <Audio src={staticFile("audio_easy.wav")} volume={narration ? 0.5 : 1} />
    {narration && <Audio src={staticFile("narration_easy.wav")} />}
  </AbsoluteFill>
);
