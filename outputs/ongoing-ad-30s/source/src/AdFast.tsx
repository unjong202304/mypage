import React from "react";
import {AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame} from "remotion";
import {Check, LogoWhite, Phone, ScreenImg, ScreenVid, Stage} from "./parts";
import {A, C, FONT, prog, sec} from "./theme";

const CL = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
export const abs = (s: React.CSSProperties): React.CSSProperties => ({position: "absolute", ...s});
export const PINK = "#db386c";
export const sp = (f: number, at: number) => spring({frame: f - at, fps: 30, config: {damping: 12, stiffness: 210, mass: 0.65}});

// Words slam in one by one with a little overshoot. `hl` words are tinted.
export const Slam: React.FC<{text: string; at?: number; size?: number; hl?: string[]; top: number; stagger?: number; align?: "center" | "left"; color?: string}> =
  ({text, at = 2, size = 84, hl = [], top, stagger = 3, align = "center", color = C.ivory}) => {
    const f = useCurrentFrame();
    return (
      <div style={abs({left: 50, right: 50, top, textAlign: align, fontSize: size, fontWeight: 900, lineHeight: 1.18, letterSpacing: "-0.02em", color})}>
        {text.split(" ").map((w, i) => {
          const s = sp(f, at + i * stagger);
          return (
            <span key={i} style={{display: "inline-block", marginRight: size * 0.22, opacity: Math.min(1, s * 2.2), transform: `translateY(${(1 - s) * 46}px) scale(${1.5 - 0.5 * s})`,
              color: hl.some((h) => w.includes(h)) ? PINK : color}}>{w}</span>
          );
        })}
      </div>
    );
  };

// Ruby bar that sweeps across at a cut.
const Wipe: React.FC = () => {
  const f = useCurrentFrame();
  const x = interpolate(f, [0, 11], [-90, 125], CL);
  return <div style={abs({top: "-10%", height: "120%", width: "62%", left: `${x}%`, transform: "skewX(-14deg)", opacity: f < 12 ? 1 : 0,
    background: `linear-gradient(90deg, rgba(189,30,81,0), ${C.red} 38%, ${PINK} 62%, rgba(219,56,108,0))`})} />;
};

// Hard cut with a small punch-in; optional wipe.
export const Cut: React.FC<{wipe?: boolean; punch?: boolean; children: React.ReactNode}> = ({wipe, punch = true, children}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={abs({inset: 0, transform: punch ? `scale(${1 + 0.08 * (1 - prog(f, 0, 9))})` : undefined})}>{children}</div>
      {wipe && <Wipe />}
    </AbsoluteFill>
  );
};

const Tap: React.FC<{x: number; y: number; at: number}> = ({x, y, at}) => {
  const p = interpolate(useCurrentFrame(), [at, at + 14], [0, 1], CL);
  return <div style={abs({left: x - 50, top: y - 50, width: 100, height: 100, borderRadius: 50, border: `5px solid rgba(250,249,246,${0.8 * (1 - p)})`, transform: `scale(${0.4 + p})`, opacity: p > 0 && p < 1 ? 1 : 0})} />;
};

// ---- A 0-1.8s: the 2 a.m. hook (user's illustration, cropped text-free) ----
const SA: React.FC = () => {
  const f = useCurrentFrame();
  const colon = Math.floor(f / 8) % 2 ? 0.25 : 1;
  return (
    <Stage>
      <div style={abs({inset: 0, overflow: "hidden"})}>
        <Img src={A("ref-night.jpg")} style={{position: "absolute", left: 0, top: 450, width: 1080, height: 1470, objectFit: "cover", transform: `scale(${1 + 0.16 * prog(f, 0, 54)})`, transformOrigin: "50% 35%"}} />
      </div>
      <div style={abs({left: 0, right: 0, top: 0, height: 900, background: `linear-gradient(180deg, ${C.bg} 62%, transparent)`})} />
      <Slam text="롱폼 하나 끝내면," at={3} top={170} size={88} />
      <Slam text="벌써 새벽 2시." at={19} top={300} size={88} hl={["새벽"]} />
      <div style={abs({right: 60, top: 560, padding: "10px 26px", borderRadius: 18, background: "rgba(0,0,0,0.55)", border: `2px solid ${C.red}`, fontFamily: "monospace", fontSize: 74, fontWeight: 900,
        color: PINK, transform: `scale(${0.6 + 0.4 * sp(f, 24)})`, opacity: Math.min(1, sp(f, 24) * 2)})}>02<span style={{opacity: colon}}>:</span>00</div>
    </Stage>
  );
};

// ---- B 1.8-3.3s: shoot, edit, shoot again ----
const SB: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Stage>
      <Slam text="찍고," at={2} top={150} size={96} />
      <Slam text="편집하고," at={10} top={270} size={96} />
      <Slam text="또 찍고." at={18} top={390} size={96} hl={["또"]} />
      {[0, 1, 2].map((i) => {
        const s = sp(f, 6 + i * 5);
        return (
          <div key={i} style={abs({left: 40 + i * 345, top: 620 + i * 50 + (1 - s) * 900, width: 320, height: 1000, borderRadius: 26, overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.55)", border: `2px solid ${C.line}`})}>
            <Img src={A(`ref-strip${i}.jpg`)} style={{width: "100%", height: "100%", objectFit: "cover"}} />
          </div>
        );
      })}
    </Stage>
  );
};

// ---- C 3.3-4.6s: not enough hands ----
const SC: React.FC = () => {
  const f = useCurrentFrame();
  const rows = [["롱폼 업로드", true], ["쇼츠 1", false], ["쇼츠 2", false], ["쇼츠 3", false]] as const;
  return (
    <Stage>
      <Slam text="쇼츠까지는," at={2} top={170} size={92} />
      <Slam text="손이 모자라죠." at={12} top={295} size={92} hl={["모자라죠."]} />
      {rows.map(([t, done], i) => {
        const s = sp(f, 8 + i * 4);
        return (
          <div key={t} style={abs({left: 100 + (i % 2 ? 1 : -1) * (1 - s) * 900, top: 620 + i * 190, width: 880, height: 150, borderRadius: 28, display: "flex", alignItems: "center", gap: 28, padding: "0 40px",
            fontSize: 56, fontWeight: 800, background: "linear-gradient(180deg,#2b2c30,#232427)", border: `1px solid ${C.line}`, opacity: done ? 0.6 : 1})}>
            <Check p={done ? 1 : 0} size={64} />{t}
            {!done && <span style={{marginLeft: "auto", fontSize: 36, color: PINK}}>대기</span>}
          </div>
        );
      })}
    </Stage>
  );
};

// ---- D 4.6-6.2s: logo slam ----
const SD: React.FC = () => {
  const f = useCurrentFrame();
  const s = sp(f, 4);
  return (
    <Stage>
      <div style={abs({left: 0, right: 0, top: 420, display: "flex", justifyContent: "center", transform: `scale(${0.5 + 0.5 * s})`, opacity: Math.min(1, s * 2)})}><LogoWhite w={820} /></div>
      <Slam text="롱폼은 지금처럼," at={14} top={820} size={84} />
      <Slam text="쇼츠는 온고잉이." at={22} top={950} size={96} hl={["온고잉이."]} />
    </Stage>
  );
};

// ---- E 6.2-8.2s: phone tilts in, file / link ----
const SE: React.FC = () => {
  const f = useCurrentFrame();
  const p = sp(f, 2);
  return (
    <Stage>
      <Slam text="파일도, 링크도" at={2} top={140} size={86} hl={["링크도"]} />
      <Slam text="간편하게." at={11} top={250} size={86} />
      <div style={abs({left: 290, top: 470 + (1 - p) * 500, transform: `perspective(2000px) rotateY(${(1 - p) * -22}deg) rotateX(${(1 - p) * 8}deg)`, opacity: Math.min(1, p * 2)})}>
        <Phone w={500}><ScreenVid src="rec-file-link.mp4" from={70} /></Phone>
      </div>
    </Stage>
  );
};

// ---- F 8.2-10.2s: choose yourself or hand it over ----
const SF: React.FC = () => {
  const f = useCurrentFrame();
  const p = sp(f, 2);
  const l = sp(f, 4), r = sp(f, 12);
  return (
    <Stage>
      <div style={abs({left: 60 + (1 - l) * -700, top: 150, fontSize: 90, fontWeight: 900})}>직접 정하거나,</div>
      <div style={abs({right: 60 + (1 - r) * -700, top: 270, fontSize: 90, fontWeight: 900, color: PINK, textAlign: "right"})}>편하게 맡기거나.</div>
      <div style={abs({left: 290, top: 470 + (1 - p) * 500, transform: `perspective(2000px) rotateY(${(1 - p) * 22}deg)`, opacity: Math.min(1, p * 2)})}>
        <Phone w={500}><ScreenVid src="rec-auto-manual.mp4" from={96} /></Phone>
      </div>
    </Stage>
  );
};

// ---- G 10.2-12.4s: a style for every channel ----
const NAMES = ["댓글 반응형", "뉴스 전달형", "영화·드라마 설명형", "자막 강조형", "정보·꿀팁형", "스토리·브이로그형", "박스 강조형", "예능 리액션형"];
const SG: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Stage>
      <Slam text="채널에 맞는" at={2} top={140} size={88} />
      <Slam text="스타일로" at={9} top={255} size={88} hl={["스타일로"]} />
      {NAMES.map((n, i) => {
        const s = sp(f, 8 + i * 3);
        const col = i % 2, row = Math.floor(i / 2);
        return (
          <div key={n} style={abs({left: 60 + col * 490, top: 470 + row * 120 + (1 - s) * 60, width: 470, height: 96, borderRadius: 48, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 38, fontWeight: 800, opacity: Math.min(1, s * 2), transform: `scale(${0.7 + 0.3 * s})`, whiteSpace: "nowrap",
            background: i === 0 ? `linear-gradient(180deg,${PINK},${C.red})` : "rgba(255,255,255,0.1)", boxShadow: i === 0 ? `0 6px 0 ${C.redDeep}` : "none"})}>{n}</div>
        );
      })}
      <div style={abs({left: 330, top: 1010 + (1 - sp(f, 20)) * 700})}><Phone w={420}><ScreenImg src="shot-templates.png" /></Phone></div>
    </Stage>
  );
};

// ---- H 12.4-15.4s: where title, highlight, comment and channel go ----
const SH: React.FC = () => {
  const f = useCurrentFrame();
  const p = sp(f, 2);
  const labels = [["제목 두 줄 자리", 128], ["원본 하이라이트 장면", 330], ["댓글 자리", 540], ["채널 이름 · 사진 자리", 668]] as const;
  return (
    <Stage>
      <Slam text="제목, 자막, 댓글 자리까지" at={2} top={140} size={70} hl={["댓글"]} />
      <div style={abs({left: 70, top: 380 + (1 - p) * 400, width: 420, height: 746, borderRadius: 30, overflow: "hidden", background: "#0b0b0e", boxShadow: "0 50px 100px rgba(0,0,0,0.6)", border: `2px solid ${C.line}`, opacity: Math.min(1, p * 2)})}>
        <div style={abs({left: 0, right: 0, top: 36, textAlign: "center", fontSize: 30, fontWeight: 900, lineHeight: 1.3})}>이곳에 제목이<br /><span style={{color: "#4de1e1"}}>두 줄로 들어가요</span></div>
        <div style={abs({left: 0, right: 0, top: 190, height: 250, overflow: "hidden"})}>
          <OffthreadVideo src={A("clip-talk.mp4")} muted style={{width: "100%", height: "100%", objectFit: "cover", filter: "blur(7px) brightness(0.8)"}} />
        </div>
        <div style={abs({left: 24, right: 24, top: 470, display: "flex", gap: 12, alignItems: "center", fontSize: 22})}>
          <i style={{width: 36, height: 36, borderRadius: 18, background: "#3ba55d", flex: "none"}} />이곳이 댓글이에요
        </div>
        <div style={abs({left: 0, right: 0, bottom: 34, display: "flex", justifyContent: "center", gap: 10, alignItems: "center", fontSize: 20, color: C.mute})}>
          <i style={{width: 26, height: 26, borderRadius: 13, background: "#555"}} />채널 이름이 들어가요
        </div>
      </div>
      {labels.map(([t, y], i) => {
        const at = 16 + i * 15, s = sp(f, at), d = prog(f, at, at + 10);
        return (
          <React.Fragment key={t}>
            <svg width={1080} height={1920} style={abs({left: 0, top: 0})}>
              <path d={`M${70 + 420 - 20} ${380 + y} L${580} ${380 + y}`} stroke={C.red} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} />
            </svg>
            <div style={abs({left: 600 + (1 - s) * 200, top: 380 + y - 30, fontSize: 40, fontWeight: 800, opacity: Math.min(1, s * 2), whiteSpace: "nowrap"})}>{t}</div>
          </React.Fragment>
        );
      })}
    </Stage>
  );
};

// ---- I 15.4-17.4s: preview before you commit ----
const SI: React.FC = () => {
  const f = useCurrentFrame();
  const p = sp(f, 2);
  return (
    <Stage>
      <Slam text="미리 보고," at={2} top={140} size={96} />
      <Slam text="정하세요." at={10} top={265} size={96} hl={["정하세요."]} />
      <div style={abs({left: 280, top: 470 + (1 - p) * 600, transform: `scale(${0.92 + 0.08 * p})`})}><Phone w={520}><ScreenImg src="shot-title.png" /></Phone></div>
      <Tap x={700} y={1100} at={26} />
      <div style={abs({left: 0, right: 0, top: 1740, display: "flex", justifyContent: "center", opacity: prog(f, 30, 40), transform: `scale(${0.8 + 0.2 * sp(f, 30)})`})}>
        <span style={{padding: "12px 40px", borderRadius: 999, background: C.red, fontSize: 44, fontWeight: 800, boxShadow: `0 7px 0 ${C.redDeep}`}}>✓ 설정 미리보기</span>
      </div>
    </Stage>
  );
};

// ---- J 17.4-20.4s: reviewed before delivery ----
const SJ: React.FC = () => {
  const f = useCurrentFrame();
  const p = sp(f, 2);
  const rows = ["제목", "자막", "댓글", "소리"];
  return (
    <Stage>
      <Slam text="AI로 돕고," at={2} top={130} size={80} />
      <Slam text="사람이 확인합니다." at={10} top={235} size={80} hl={["확인합니다."]} />
      <div style={abs({left: 60, top: 470 + (1 - p) * 500, width: 400, height: 710, borderRadius: 30, overflow: "hidden", background: "#000", boxShadow: "0 50px 100px rgba(0,0,0,0.6)", border: `2px solid ${C.line}`})}>
        <OffthreadVideo src={A("clip-cooking.mp4")} muted style={{width: "100%", height: "100%", objectFit: "cover"}} />
      </div>
      {rows.map((r, i) => {
        const s = sp(f, 12 + i * 9), c = prog(f, 22 + i * 14, 30 + i * 14);
        return (
          <div key={r} style={abs({left: 520 + (1 - s) * 600, top: 480 + i * 170, width: 500, height: 140, borderRadius: 26, display: "flex", alignItems: "center", gap: 22, padding: "0 32px", fontSize: 46, fontWeight: 800,
            background: "linear-gradient(180deg,#2b2c30,#232427)", border: `1px solid ${C.line}`})}><Check p={c} size={60} />{r}</div>
        );
      })}
      <div style={abs({left: 0, right: 0, top: 1300, display: "flex", justifyContent: "center", gap: 18, alignItems: "center", opacity: prog(f, 40, 52)})}>
        {["편집", "검수", "전달"].map((t, i) => (
          <React.Fragment key={t}>{i > 0 && <span style={{fontSize: 44, color: C.mute}}>→</span>}
            <span style={{padding: "14px 40px", borderRadius: 999, fontSize: 44, fontWeight: 800, background: t === "검수" ? C.red : "rgba(255,255,255,0.1)"}}>{t}</span></React.Fragment>
        ))}
      </div>
      <div style={abs({left: 0, right: 0, top: 1780, textAlign: "center", fontSize: 26, color: C.mute})}>화면 영상은 라이선스 스톡 영상 예시입니다</div>
    </Stage>
  );
};

// ---- K 20.4-23.4s: the result link ----
const SK: React.FC = () => {
  const f = useCurrentFrame();
  const p = sp(f, 2);
  const pulse = 0.5 + 0.5 * Math.sin(f / 4);
  return (
    <Stage>
      <Slam text="검수한 완성본을" at={2} top={130} size={80} />
      <Slam text="링크로" at={12} top={235} size={96} hl={["링크로"]} />
      <div style={abs({left: 270, top: 430 + (1 - p) * 700, transform: `scale(${0.9 + 0.1 * p})`})}>
        <Phone w={540}>
          <ScreenImg src="shot-delivery.png" />
          <div style={abs({left: "5.7%", width: "85.2%", top: "66.2%", height: "5.6%", borderRadius: 14, boxShadow: `0 0 0 ${3 + 3 * pulse}px rgba(219,56,108,${0.9 * prog(f, 30, 40)}), 0 0 ${50 * pulse}px rgba(219,56,108,0.5)`})} />
        </Phone>
      </div>
      <Tap x={540} y={430 + 0.69 * 1170 + 24} at={52} />
    </Stage>
  );
};

// ---- L 23.4-26.4s: callback to the hook ----
const SL: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Stage>
      <div style={abs({inset: 0, opacity: 0.4})}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={abs({left: 40 + i * 345, top: 120 + i * 40 - prog(f, 0, 90) * (60 + i * 20), width: 320, height: 1700, borderRadius: 26, overflow: "hidden"})}>
            <Img src={A(`ref-strip${i}.jpg`)} style={{width: "100%", height: "100%", objectFit: "cover"}} />
          </div>
        ))}
      </div>
      <div style={abs({inset: 0, background: `linear-gradient(180deg, ${C.bg}f0, ${C.bg}b0 50%, ${C.bg}f0)`})} />
      <Slam text="롱폼은 지금처럼," at={3} top={640} size={98} />
      <Slam text="쇼츠는 온고잉이." at={14} top={810} size={110} hl={["온고잉이."]} />
    </Stage>
  );
};

// ---- M 26.4-30s: lockup + CTA ----
const SM: React.FC = () => {
  const f = useCurrentFrame();
  const s = sp(f, 4), b = sp(f, 30);
  const pulse = 1 + 0.03 * Math.sin(f / 5);
  return (
    <Stage>
      <Slam text="영상은 보내고," at={2} top={330} size={84} />
      <Slam text="편집은 온고잉." at={10} top={450} size={96} hl={["온고잉."]} />
      <div style={abs({left: 0, right: 0, top: 790, display: "flex", justifyContent: "center", transform: `scale(${0.6 + 0.4 * s})`, opacity: Math.min(1, s * 2)})}><LogoWhite w={780} /></div>
      <div style={abs({left: 0, right: 0, top: 1130, display: "flex", justifyContent: "center", opacity: Math.min(1, b * 2), transform: `scale(${(0.7 + 0.3 * b) * pulse})`})}>
        <span style={{padding: "26px 64px", borderRadius: 28, fontSize: 54, fontWeight: 900, background: `linear-gradient(180deg,${PINK},${C.red})`, boxShadow: `0 10px 0 ${C.redDeep}, 0 24px 40px rgba(0,0,0,0.4)`}}>샘플 템플릿 확인하기 ▶</span>
      </div>
      <div style={abs({left: 0, right: 0, top: 1380, textAlign: "center", fontSize: 34, color: C.mute, fontWeight: 600, lineHeight: 1.7, opacity: prog(f, 44, 58)})}>
        YouTube @ongoing_shortsmaker<br />Instagram @shortsmaker01
      </div>
    </Stage>
  );
};

// seconds: hook 0-6.2 is the fast part
const PLAN: [number, number, React.FC, boolean][] = [
  [0, 1.8, SA, false], [1.8, 3.3, SB, true], [3.3, 4.6, SC, true], [4.6, 6.2, SD, true], [6.2, 8.2, SE, true], [8.2, 10.2, SF, true], [10.2, 12.4, SG, true],
  [12.4, 15.4, SH, true], [15.4, 17.4, SI, true], [17.4, 20.4, SJ, true], [20.4, 23.4, SK, true], [23.4, 26.4, SL, true], [26.4, 30, SM, true],
];

export const AdFast: React.FC<{narration?: boolean}> = ({narration = false}) => (
  <AbsoluteFill style={{background: C.bg, fontFamily: FONT}}>
    {PLAN.map(([a, b, Comp, wipe], i) => (
      <Sequence key={i} from={sec(a)} durationInFrames={sec(b - a)}><Cut wipe={wipe}><Comp /></Cut></Sequence>
    ))}
    <Audio src={staticFile("audio_fast.wav")} volume={narration ? 0.5 : 1} />
    {narration && <Audio src={staticFile("narration_fast.wav")} />}
  </AbsoluteFill>
);
