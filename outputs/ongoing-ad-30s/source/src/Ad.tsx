import React from "react";
import {AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from "remotion";
import {Check, Headline, LogoWhite, Phone, ScreenImg, ScreenVid, Stage, fade} from "./parts";
import {A, C, FONT, SCENES, prog, sec} from "./theme";

const CL = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const abs = (s: React.CSSProperties): React.CSSProperties => ({position: "absolute", ...s});
const CLIPS = ["clip-travel.mp4", "clip-talk.mp4", "clip-cooking.mp4"]; // licensed stock (Mixkit / Pexels); not product output
const THUMBS = ["thumb-travel.png", "thumb-talk.png", "thumb-cooking.png"];

// ---------- S1 0-3s: long timeline -> short cards, logo ----------
const Film: React.FC = () => (
  <div style={abs({inset: 0, borderRadius: 14, background: "#0b0b0e", border: `1px solid ${C.line}`, overflow: "hidden"})}>
    {[6, undefined].map((t, k) => (
      <div key={k} style={abs({left: 0, right: 0, height: 12, ...(t ? {top: t} : {bottom: 6}),
        backgroundImage: "repeating-linear-gradient(90deg, rgba(250,249,246,.55) 0 14px, transparent 14px 30px)"})} />
    ))}
    <div style={abs({left: 6, right: 6, top: 26, bottom: 26, display: "flex", gap: 6})}>
      {Array.from({length: 12}).map((_, i) => (
        <div key={i} style={{flex: 1, borderRadius: 6, backgroundImage: `url(${A(THUMBS[i % 3])})`, backgroundSize: "cover", backgroundPosition: `${(i * 37) % 100}% 50%`, filter: "brightness(0.8)"}} />
      ))}
    </div>
  </div>
);

const S1: React.FC = () => {
  const f = useCurrentFrame();
  const segs = [0.08, 0.42, 0.74];
  const SX = 60, SW = 960, SY = 760, SH = 150;
  const out = prog(f, 40, 66);
  return (
    <Stage>
      <Headline text="긴 영상, 매력적인 숏폼으로." top={200} at={8} />
      <div style={abs({left: SX, top: SY, width: SW, height: SH, opacity: prog(f, 0, 12) * (1 - out * 0.9), transform: `translateY(${-out * 30}px)`})}>
        <Film />
        {segs.map((a, i) => (
          <div key={i} style={abs({left: `${a * 100}%`, top: 10, bottom: 10, width: "12%", borderRadius: 10, border: `3px solid ${C.red}`,
            background: "rgba(189,30,81,0.25)", opacity: prog(f, 14 + i * 7, 24 + i * 7)})} />
        ))}
      </div>
      {[0, 1, 2].map((i) => {
        const s = prog(f, 38 + i * 6, 62 + i * 6);
        const x0 = SX + segs[i] * SW, x1 = 90 + i * 315;
        return (
          <div key={i} style={abs({left: x0 + (x1 - x0) * s, top: SY + (980 - SY) * s, width: 115 + 155 * s, height: 150 + 330 * s, opacity: s > 0.01 ? 1 : 0,
            borderRadius: 26, overflow: "hidden", border: `2px solid ${C.line}`, boxShadow: "0 30px 60px rgba(0,0,0,0.5)", background: "#000"})}>
            <OffthreadVideo src={A(CLIPS[i])} muted style={{width: "100%", height: "100%", objectFit: "cover"}} />
          </div>
        );
      })}
      <div style={abs({left: 0, right: 0, top: 1530, display: "flex", justifyContent: "center", opacity: prog(f, 62, 84), transform: `translateY(${(1 - prog(f, 62, 84)) * 20}px)`})}>
        <LogoWhite w={520} />
      </div>
    </Stage>
  );
};

// ---------- S2 3-7s: real first screen, file tab -> link tab (screen recording) ----------
const S2: React.FC = () => {
  const p = prog(useCurrentFrame(), 0, 24);
  return (
    <Stage>
      <Headline text="파일도, 링크도 간편하게." top={190} at={4} />
      <div style={abs({left: 270, top: 400 + (1 - p) * 300, opacity: p})}>
        <Phone w={540}><ScreenVid src="rec-file-link.mp4" from={66} /></Phone>
      </div>
    </Stage>
  );
};

// ---------- S3 7-11s: real selection cards, auto -> manual (screen recording) ----------
const S3: React.FC = () => {
  const p = prog(useCurrentFrame(), 0, 24);
  return (
    <Stage>
      <Headline text="직접 정하거나, 편하게 맡기거나." top={190} at={4} />
      <div style={abs({left: 270, top: 440 + (1 - p) * 300, opacity: p})}>
        <Phone w={540}><ScreenVid src="rec-auto-manual.mp4" from={96} /></Phone>
      </div>
    </Stage>
  );
};

// ---------- S4 11-18s: two ways side by side, real screens, both lead to production ----------
const S4: React.FC = () => {
  const f = useCurrentFrame();
  const merge = prog(f, 120, 160);
  const swap = fade(f, 96, 112);
  const pop = (a: number) => prog(f, a, a + 20);
  const Label: React.FC<{x: number; text: string; a: number}> = ({x, text, a}) => (
    <div style={abs({left: x, width: 430, top: 340, textAlign: "center", opacity: pop(a), transform: `translateY(${(1 - pop(a)) * 18}px)`})}>
      <div style={{fontSize: 36, fontWeight: 900, paddingBottom: 10, borderBottom: `4px solid ${C.red}`, display: "inline-block"}}>{text}</div>
    </div>
  );
  return (
    <Stage>
      <Headline text="원하는 스타일을 미리 보고" top={150} at={2} size={62} />
      <Label x={70} text="내가 구간 정해주기" a={6} />
      <Label x={580} text="온고잉이 알아서" a={18} />
      <div style={abs({left: 70, top: 430 + (1 - pop(10)) * 140, opacity: pop(10)})}>
        <Phone w={430}>
          <ScreenImg src="shot-title.png" />
          <ScreenImg src="shot-templates.png" opacity={swap} />
        </Phone>
      </div>
      <div style={abs({left: 580, top: 430 + (1 - pop(22)) * 140, opacity: pop(22)})}>
        <Phone w={430}><ScreenImg src="shot-auto.png" /></Phone>
      </div>
      <svg width={1080} height={1920} style={abs({left: 0, top: 0})}>
        {["M285 1400 C285 1500 540 1480 540 1560", "M795 1400 C795 1500 540 1480 540 1560"].map((d) => (
          <path key={d} d={d} fill="none" stroke={C.red} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - merge} />
        ))}
      </svg>
      <div style={abs({left: 0, right: 0, top: 1570, display: "flex", justifyContent: "center", opacity: prog(f, 150, 172)})}>
        <div style={{padding: "14px 40px", borderRadius: 999, background: `linear-gradient(180deg,#db386c,${C.red})`, fontSize: 38, fontWeight: 800, boxShadow: `0 8px 0 ${C.redDeep}, 0 18px 30px rgba(0,0,0,0.35)`}}>제작 · 검수로 이어져요</div>
      </div>
    </Stage>
  );
};

// ---------- S5 18-24s: a finished short (stock footage, labelled) and the review steps ----------
const S5: React.FC = () => {
  const f = useCurrentFrame();
  const p = prog(f, 0, 22);
  const rows = ["제목", "자막", "댓글", "소리"];
  return (
    <Stage>
      <Headline text="AI로 돕고, 사람이 확인합니다." top={170} at={4} size={70} />
      <div style={abs({left: 70, top: 440 + (1 - p) * 200, width: 440, height: 782, borderRadius: 30, overflow: "hidden", opacity: p, background: "#000",
        boxShadow: "0 60px 110px rgba(0,0,0,0.6), 0 0 0 2px #2b2b32"})}>
        <OffthreadVideo src={A("clip-cooking.mp4")} muted style={{width: "100%", height: "100%", objectFit: "cover"}} />
      </div>
      <div style={abs({left: 560, top: 470, width: 450, opacity: prog(f, 10, 28)})}>
        <div style={{fontSize: 36, fontWeight: 900, marginBottom: 14}}>확인하는 항목</div>
        {rows.map((r, i) => {
          const c = prog(f, 44 + i * 28, 56 + i * 28);
          return (
            <div key={r} style={{display: "flex", alignItems: "center", gap: 18, padding: "26px 28px", marginTop: 16, borderRadius: 22, fontSize: 38, fontWeight: 800,
              background: "linear-gradient(180deg,#2b2c30,#232427)", border: `1px solid ${C.line}`}}>
              <Check p={c} size={52} />{r}
            </div>
          );
        })}
      </div>
      <div style={abs({left: 0, right: 0, top: 1330, display: "flex", justifyContent: "center", gap: 18, alignItems: "center", opacity: prog(f, 20, 40)})}>
        {["편집", "검수", "전달"].map((t, i) => (
          <React.Fragment key={t}>
            {i > 0 && <span style={{fontSize: 40, color: C.mute}}>→</span>}
            <span style={{padding: "12px 34px", borderRadius: 999, fontSize: 38, fontWeight: 800, background: t === "검수" ? C.red : "rgba(255,255,255,0.1)"}}>{t}</span>
          </React.Fragment>
        ))}
      </div>
      <div style={abs({left: 0, right: 0, top: 1700, textAlign: "center", fontSize: 26, color: C.mute})}>화면 영상은 라이선스 스톡 영상 예시입니다</div>
    </Stage>
  );
};

// ---------- S6 24-30s: real result page, logo lockup ----------
const S6: React.FC = () => {
  const f = useCurrentFrame();
  const p = prog(f, 0, 24), out = prog(f, 98, 116), lock = prog(f, 108, 134);
  return (
    <Stage>
      <div style={{opacity: 1 - out}}>
        <Headline text="검수한 완성본을 링크로" top={190} at={4} size={70} />
        <div style={abs({left: 270, top: 400 + (1 - p) * 300, opacity: p, transform: `scale(${1 - out * 0.06})`})}>
          <Phone w={540}><ScreenImg src="shot-delivery.png" /></Phone>
        </div>
      </div>
      <div style={abs({left: 0, right: 0, top: 640, display: "flex", flexDirection: "column", alignItems: "center", opacity: lock, transform: `translateY(${(1 - lock) * 30}px)`})}>
        <LogoWhite w={760} />
        <div style={{fontSize: 80, fontWeight: 900, lineHeight: 1.25, textAlign: "center", marginTop: 90, letterSpacing: "-0.02em"}}>영상은 보내고,<br />편집은 <span style={{color: "#db386c"}}>온고잉.</span></div>
        <div style={{fontSize: 40, color: C.mute, marginTop: 36, fontWeight: 500, opacity: prog(f, 130, 150)}}>전용 링크에서 시작하세요</div>
      </div>
    </Stage>
  );
};

// ---------- composition ----------
const Scene: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{opacity: Math.min(interpolate(f, [0, 5], [0, 1], CL), interpolate(f, [dur - 4, dur], [1, 0], CL))}}>{children}</AbsoluteFill>;
};

export const Ad: React.FC<{narration?: boolean}> = ({narration = false}) => {
  const els = [<S1 />, <S2 />, <S3 />, <S4 />, <S5 />, <S6 />];
  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT}}>
      {SCENES.map(([a, b], i) => (
        <Sequence key={i} from={sec(a)} durationInFrames={sec(b - a)}><Scene dur={sec(b - a)}>{els[i]}</Scene></Sequence>
      ))}
      <Audio src={staticFile("audio.wav")} volume={narration ? 0.45 : 1} />
      {narration && <Audio src={staticFile("narration.wav")} />}
    </AbsoluteFill>
  );
};
