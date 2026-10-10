import React from "react";
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from "remotion";
import {Btn, Check, Headline, Logo, Mark, Panel, Phone, Stage, Tap, ring, typed} from "./parts";
import {C, FONT, SCENES, prog, sec} from "./theme";

const CL = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const abs = (s: React.CSSProperties): React.CSSProperties => ({position: "absolute", ...s});

// ---------- S1 0-3s: long timeline -> short cards, logo ----------
const Film: React.FC = () => (
  <div style={abs({inset: 0, borderRadius: 14, background: "#0b0b0e", border: `1px solid ${C.line}`, overflow: "hidden"})}>
    {[6, undefined].map((t, k) => (
      <div key={k} style={abs({left: 0, right: 0, height: 12, ...(t ? {top: t} : {bottom: 6}),
        backgroundImage: "repeating-linear-gradient(90deg, rgba(243,238,228,.55) 0 14px, transparent 14px 30px)"})} />
    ))}
    <div style={abs({left: 6, right: 6, top: 26, bottom: 26, display: "flex", gap: 6})}>
      {Array.from({length: 12}).map((_, i) => (
        <div key={i} style={{flex: 1, borderRadius: 6, background: `linear-gradient(135deg, hsl(${20 + i * 9},18%,${26 + (i % 3) * 5}%), #1a1a20)`}} />
      ))}
    </div>
  </div>
);

const ShortCard: React.FC<{i: number}> = ({i}) => (
  <div style={{width: "100%", height: "100%", borderRadius: 26, position: "relative", overflow: "hidden", border: `2px solid ${C.line}`,
    background: `linear-gradient(160deg, hsl(${22 + i * 14},22%,32%), #17171c)`, boxShadow: "0 30px 60px rgba(0,0,0,0.5)"}}>
    <div style={abs({left: "50%", top: "42%", width: 74, height: 74, marginLeft: -37, marginTop: -37, borderRadius: 37, background: C.red,
      boxShadow: `0 8px 0 ${C.redDeep}, 0 14px 24px rgba(0,0,0,0.4)`})}>
      <svg width="74" height="74" viewBox="0 0 100 100"><polygon points="40,28 40,72 74,50" fill={C.ivory} /></svg>
    </div>
    {[70, 54].map((w, k) => <div key={k} style={abs({left: 22, bottom: 30 + k * 22, width: `${w}%`, height: 10, borderRadius: 5, background: "rgba(243,238,228,0.7)"})} />)}
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
            background: "rgba(214,52,43,0.22)", opacity: prog(f, 14 + i * 7, 24 + i * 7)})} />
        ))}
      </div>
      {[0, 1, 2].map((i) => {
        const s = prog(f, 38 + i * 6, 62 + i * 6);
        const x0 = SX + segs[i] * SW, x1 = 90 + i * 315;
        return (
          <div key={i} style={abs({left: x0 + (x1 - x0) * s, top: SY + (980 - SY) * s, width: 115 + 155 * s, height: 150 + 330 * s, opacity: s > 0.01 ? 1 : 0})}>
            <ShortCard i={i} />
          </div>
        );
      })}
      <div style={abs({left: 0, right: 0, top: 1560, display: "flex", justifyContent: "center", opacity: prog(f, 62, 84), transform: `translateY(${(1 - prog(f, 62, 84)) * 20}px)`})}>
        <Logo size={96} />
      </div>
    </Stage>
  );
};

// ---------- S2 3-7s: phone with the intake page ----------
const IntakeScreen: React.FC = () => {
  const f = useCurrentFrame();
  const chip = prog(f, 36, 48), bar = prog(f, 40, 66), link = "https://youtu.be/예시";
  return (
    <div style={{padding: "64px 36px 0"}}>
      <Logo size={34} dark />
      <div style={{fontSize: 42, fontWeight: 900, marginTop: 46}}>영상을 보내주세요</div>
      <div style={{fontSize: 22, color: "#6b665c", marginTop: 8}}>전용 링크에서 간편하게 접수해요</div>
      <div style={{marginTop: 34}}><Btn label="영상 파일 선택" at={30} w={448} h={86} fs={28} /></div>
      <div style={{marginTop: 18, padding: "14px 18px", borderRadius: 16, background: "#e9e3d6", opacity: chip, transform: `translateY(${(1 - chip) * 12}px)`}}>
        <div style={{display: "flex", justifyContent: "space-between", fontSize: 22, fontWeight: 700}}><span>여행_원본.mp4</span><span style={{color: "#6b665c"}}>12:48</span></div>
        <div style={{height: 8, borderRadius: 4, background: "#d6cfbf", marginTop: 10}}><div style={{height: 8, borderRadius: 4, width: `${bar * 100}%`, background: C.red}} /></div>
      </div>
      <div style={{textAlign: "center", fontSize: 22, color: "#8a8478", margin: "26px 0 14px"}}>또는</div>
      <div style={{fontSize: 22, fontWeight: 700, marginBottom: 8}}>유튜브 링크</div>
      <div style={{height: 70, borderRadius: 16, border: "2px solid #cfc8b8", background: "#fbf9f4", padding: "0 18px", display: "flex", alignItems: "center", fontSize: 24, color: C.ink}}>
        {typed(f, link, 62, 12)}<i style={{width: 2, height: 30, background: C.red, marginLeft: 2, opacity: Math.floor(f / 8) % 2}} />
      </div>
    </div>
  );
};

const S2: React.FC = () => {
  const f = useCurrentFrame();
  const p = prog(f, 0, 24);
  return (
    <Stage>
      <Headline text="파일도, 링크도 간편하게." top={190} at={4} />
      <div style={abs({left: 280, top: 430 + (1 - p) * 320, opacity: p})}><Phone w={520}><IntakeScreen /></Phone></div>
    </Stage>
  );
};

// ---------- S3 7-11s: two ways, branching ----------
const Choice: React.FC<{left: number; title: string; sub: string; glowAt: number; icon: React.ReactNode}> = ({left, title, sub, glowAt, icon}) => {
  const f = useCurrentFrame();
  const g = prog(f, glowAt, glowAt + 12), p = prog(f, 4, 22);
  return (
    <Panel style={{position: "absolute", left, top: 480, width: 460, height: 520, padding: 36, opacity: p, transform: `translateY(${(1 - p) * 40}px)`, ...ring(g)}}>
      <div style={{height: 200, display: "flex", alignItems: "center", justifyContent: "center"}}>{icon}</div>
      <div style={{fontSize: 44, fontWeight: 900, marginTop: 20}}>{title}</div>
      <div style={{fontSize: 27, color: C.mute, marginTop: 12, lineHeight: 1.4}}>{sub}</div>
    </Panel>
  );
};

const S3: React.FC = () => {
  const f = useCurrentFrame();
  const draw = prog(f, 60, 100);
  const range = (
    <div style={{width: 340, height: 54, borderRadius: 14, background: "rgba(255,255,255,0.08)", position: "relative", border: `1px solid ${C.line}`}}>
      <div style={abs({left: 80, width: 150, top: 6, bottom: 6, borderRadius: 8, background: "rgba(214,52,43,0.28)", border: `2px solid ${C.red}`})} />
      {[80, 226].map((x) => <i key={x} style={abs({left: x, top: -8, width: 10, height: 70, borderRadius: 5, background: C.ivory})} />)}
    </div>
  );
  const wave = (
    <div style={{display: "flex", gap: 10, alignItems: "center", height: 120}}>
      {[40, 80, 112, 64, 96, 48, 72].map((h, i) => <i key={i} style={{width: 18, height: h, borderRadius: 9, background: i % 3 === 1 ? C.red : C.ivory, opacity: 0.9}} />)}
    </div>
  );
  return (
    <Stage>
      <Headline text="직접 정하거나, 편하게 맡기거나." top={190} at={4} />
      <Choice left={60} title="내가 구간 정해주기" sub="원하는 시작·종료를 직접 선택" glowAt={30} icon={range} />
      <Choice left={560} title="온고잉이 알아서" sub="분석부터 편하게 맡기기" glowAt={56} icon={wave} />
      <Tap x={290} y={740} at={28} />
      <Tap x={790} y={740} at={54} />
      <svg width={1080} height={1920} style={abs({left: 0, top: 0})}>
        {["M290 1010 C290 1190 540 1170 540 1350", "M790 1010 C790 1190 540 1170 540 1350"].map((d) => (
          <path key={d} d={d} fill="none" stroke={C.red} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        ))}
      </svg>
      <div style={abs({left: 0, right: 0, top: 1350, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: prog(f, 84, 104)})}>
        <Mark size={110} />
        <div style={{fontSize: 34, color: C.mute, fontWeight: 600}}>두 방식 모두 제작으로 이어져요</div>
      </div>
    </Stage>
  );
};

// ---------- S4 11-18s: two lanes merge into production ----------
const Step: React.FC<{at: number; n: number; title: string; h: number; children?: React.ReactNode}> = ({at, n, title, h, children}) => {
  const p = prog(useCurrentFrame(), at, at + 14);
  return (
    <Panel style={{height: h, padding: "22px 24px", opacity: p, transform: `translateY(${(1 - p) * 26}px)`, marginBottom: 20}}>
      <div style={{display: "flex", alignItems: "center", gap: 12, fontSize: 28, fontWeight: 800}}>
        <i style={{width: 38, height: 38, borderRadius: 19, background: C.red, display: "inline-flex", alignItems: "center", justifyContent: "center", fontStyle: "normal", fontSize: 22}}>{n}</i>{title}
      </div>
      <div style={{marginTop: 16}}>{children}</div>
    </Panel>
  );
};

const Track: React.FC<{marks: [number, number][]; at: number; handles?: boolean}> = ({marks, at, handles}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: "relative", height: 50, borderRadius: 12, background: "rgba(255,255,255,0.08)", border: `1px solid ${C.line}`}}>
      {marks.map(([a, b], i) => (
        <div key={i} style={abs({left: `${a * 100}%`, width: `${(b - a) * 100}%`, top: 5, bottom: 5, borderRadius: 8, border: `2px solid ${C.red}`, background: "rgba(214,52,43,0.28)", opacity: prog(f, at + i * 8, at + 8 + i * 8)})}>
          {handles && i === 0 && [0, 1].map((k) => <i key={k} style={abs({[k ? "right" : "left"]: -6, top: -7, width: 8, height: 54, borderRadius: 4, background: C.ivory})} />)}
        </div>
      ))}
    </div>
  );
};

const Tiles: React.FC<{labels: string[]; pick: number; at: number}> = ({labels, pick, at}) => {
  const f = useCurrentFrame();
  const sel = prog(f, at, at + 10);
  return (
    <div style={{display: "flex", gap: 12}}>
      {labels.map((l, i) => (
        <div key={l} style={{flex: 1}}>
          <div style={{height: 210, borderRadius: 16, background: `linear-gradient(170deg, hsl(${[24, 205, 150][i]},24%,34%), #17171c)`, position: "relative", overflow: "hidden", ...(i === pick ? ring(sel) : {})}}>
            <div style={abs({left: 12, right: 12, top: 16, height: 14, borderRadius: 7, background: "rgba(243,238,228,0.75)"})} />
            <div style={abs({left: 12, right: 30, bottom: 16, height: 12, borderRadius: 6, background: "rgba(243,238,228,0.5)"})} />
          </div>
          <div style={{textAlign: "center", fontSize: 22, fontWeight: 700, marginTop: 10, color: i === pick && sel > 0.5 ? C.ivory : C.mute}}>{l}</div>
        </div>
      ))}
    </div>
  );
};

const S4: React.FC = () => {
  const f = useCurrentFrame();
  const title = "제주 3박 4일, 이것만 보세요";
  const an = prog(f, 26, 62), done = an > 0.98;
  const merge = prog(f, 150, 186);
  const Lane: React.FC<{x: number; label: string; children: React.ReactNode}> = ({x, label, children}) => (
    <div style={abs({left: x, top: 290, width: 470})}>
      <div style={{fontSize: 32, fontWeight: 900, paddingBottom: 12, borderBottom: `3px solid ${C.red}`, marginBottom: 22, opacity: prog(f, 4, 18)}}>{label}</div>
      {children}
    </div>
  );
  return (
    <Stage>
      <Headline text="원하는 스타일을 미리 보고" top={110} at={2} size={60} />
      <Lane x={50} label="내가 구간 정해주기">
        <Step at={12} n={1} title="구간 지정" h={200}>
          <Track marks={[[0.06, 0.22], [0.42, 0.6], [0.74, 0.9]]} at={22} handles />
          <div style={{display: "flex", gap: 10, marginTop: 14}}>{["구간 1", "구간 2", "구간 3"].map((t) => <span key={t} style={{fontSize: 20, padding: "4px 14px", borderRadius: 999, background: "rgba(255,255,255,0.1)"}}>{t}</span>)}</div>
        </Step>
        <Step at={52} n={2} title="제목 입력" h={150}>
          <div style={{padding: "12px 16px", borderRadius: 12, background: "rgba(0,0,0,0.38)", fontSize: 24, minHeight: 34}}>{typed(f, title, 62, 16)}<i style={{display: "inline-block", width: 2, height: 24, background: C.red, verticalAlign: "middle", opacity: Math.floor(f / 8) % 2}} /></div>
        </Step>
        <Step at={92} n={3} title="템플릿 미리보기" h={330}><Tiles labels={["여행", "토크", "정보"]} pick={0} at={118} /></Step>
      </Lane>
      <Lane x={560} label="온고잉이 알아서">
        <Step at={18} n={1} title="내용 분석" h={200}>
          <div style={{display: "flex", gap: 10}}>{["가로·세로 형태", "영상 내용"].map((t) => <span key={t} style={{fontSize: 20, padding: "4px 14px", borderRadius: 999, background: "rgba(255,255,255,0.1)"}}>{t}</span>)}</div>
          <div style={{height: 10, borderRadius: 5, background: "rgba(255,255,255,0.12)", marginTop: 22}}><div style={{height: 10, borderRadius: 5, width: `${an * 100}%`, background: C.red}} /></div>
          <div style={{fontSize: 22, marginTop: 14, color: done ? "#7fd6a4" : C.mute}}>{done ? "✓ 분석 완료" : "분석 중…"}</div>
        </Step>
        <Step at={58} n={2} title="하이라이트 선별" h={150}><Track marks={[[0.1, 0.2], [0.46, 0.56], [0.78, 0.88]]} at={68} /></Step>
        <Step at={98} n={3} title="스타일 적용" h={330}><Tiles labels={["여행", "토크", "정보"]} pick={2} at={124} /></Step>
      </Lane>
      <svg width={1080} height={1920} style={abs({left: 0, top: 0})}>
        {["M285 1160 C285 1330 540 1300 540 1480", "M795 1160 C795 1330 540 1300 540 1480"].map((d) => (
          <path key={d} d={d} fill="none" stroke={C.red} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - merge} />
        ))}
      </svg>
      <div style={abs({left: 0, right: 0, top: 1480, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: prog(f, 170, 190)})}>
        <Mark size={130} />
        <div style={{fontSize: 34, fontWeight: 700, color: C.mute}}>제작 단계로</div>
      </div>
    </Stage>
  );
};

// ---------- S5 18-24s: finished short + operator review ----------
const ShortScreen: React.FC<{u: number}> = ({u}) => (
  <div style={{position: "absolute", inset: 0, background: "linear-gradient(170deg, #b9774a, #3a2a24 55%, #17171c)"}}>
    <div style={abs({left: 22 * u, right: 22 * u, top: 90 * u, fontSize: 38 * u, fontWeight: 900, color: C.ivory, lineHeight: 1.2, textShadow: "0 3px 10px rgba(0,0,0,0.5)"})}>제주 3박 4일, 이것만 보세요</div>
    <div style={abs({left: 22 * u, right: 22 * u, bottom: 190 * u, padding: `${10 * u}px ${14 * u}px`, borderRadius: 12 * u, background: "rgba(0,0,0,0.55)", fontSize: 26 * u, fontWeight: 800, color: C.ivory})}>여기가 진짜 제주예요 <span style={{fontSize: 18 * u, opacity: 0.7}}>(자막 예시)</span></div>
    <div style={abs({left: 22 * u, bottom: 80 * u, width: 300 * u, padding: `${10 * u}px ${14 * u}px`, borderRadius: 18 * u, background: "rgba(243,238,228,0.92)", color: C.ink, fontSize: 20 * u, lineHeight: 1.3})}>
      <b style={{color: C.red}}>예시 댓글</b> · 저도 가보고 싶어요
    </div>
  </div>
);

const S5: React.FC = () => {
  const f = useCurrentFrame();
  const p = prog(f, 0, 22);
  const rows = ["제목", "자막", "댓글", "소리"];
  const bars = [30, 56, 44, 70, 38, 62];
  return (
    <Stage>
      <Headline text="AI로 돕고, 사람이 확인합니다." top={170} at={4} size={70} />
      <div style={abs({left: 70, top: 440 + (1 - p) * 200, opacity: p})}><Phone w={430}><ShortScreen u={430 / 520} /></Phone></div>
      <Panel style={{position: "absolute", left: 540, top: 470, width: 470, height: 640, padding: 30, opacity: prog(f, 10, 28)}}>
        <div style={{fontSize: 36, fontWeight: 900, display: "flex", alignItems: "center", gap: 12}}><Mark size={46} />운영자 검수</div>
        {rows.map((r, i) => {
          const c = prog(f, 44 + i * 28, 56 + i * 28);
          return (
            <div key={r} style={{display: "flex", alignItems: "center", gap: 16, padding: "20px 0", borderBottom: i < 3 ? `1px solid ${C.line}` : "none", fontSize: 32, fontWeight: 700, marginTop: i ? 0 : 22}}>
              <Check p={c} size={48} />{r}
              {r === "소리" && <span style={{marginLeft: "auto", display: "flex", gap: 5, alignItems: "flex-end", height: 36}}>{bars.map((b, k) => <i key={k} style={{width: 6, height: Math.max(8, b * 0.5 * (0.55 + 0.45 * Math.sin(f / 4 + k))), background: C.mute, borderRadius: 3}} />)}</span>}
            </div>
          );
        })}
      </Panel>
      <div style={abs({left: 540, width: 470, top: 1150, textAlign: "center", fontSize: 32, color: C.mute, fontWeight: 600, opacity: prog(f, 140, 156)})}>검수 후 전달해요</div>
      <div style={abs({left: 0, right: 0, top: 1480, textAlign: "center", fontSize: 38, color: C.mute, fontWeight: 600, opacity: prog(f, 20, 40)})}>제목 · 자막 · 댓글 · 소리를 직접 확인</div>
    </Stage>
  );
};

// ---------- S6 24-30s: completion page, logo lockup ----------
const DoneScreen: React.FC = () => (
  <div style={{padding: "64px 36px 0"}}>
    <Logo size={34} dark />
    <div style={{fontSize: 38, fontWeight: 900, marginTop: 36}}>완성본이 준비됐어요</div>
    <div style={{fontSize: 22, color: "#2f8f5b", marginTop: 8, fontWeight: 700}}>✓ 운영자 검수 완료</div>
    <div style={{display: "flex", justifyContent: "center", marginTop: 26}}>
      <div style={{width: 230, height: 408, borderRadius: 22, position: "relative", overflow: "hidden", background: "linear-gradient(170deg,#b9774a,#3a2a24 60%,#17171c)"}}>
        <div style={abs({left: "50%", top: "46%", width: 64, height: 64, marginLeft: -32, marginTop: -32, borderRadius: 32, background: "rgba(0,0,0,0.5)"})}>
          <svg width="64" height="64" viewBox="0 0 100 100"><polygon points="40,28 40,72 74,50" fill={C.ivory} /></svg>
        </div>
      </div>
    </div>
    <div style={{display: "flex", gap: 12, marginTop: 24}}>
      <Btn label="다운로드" at={62} w={256} h={78} fs={26} />
      <Btn label="링크 복사" red={false} w={180} h={78} fs={24} />
    </div>
  </div>
);

const S6: React.FC = () => {
  const f = useCurrentFrame();
  const p = prog(f, 0, 24), out = prog(f, 98, 116), lock = prog(f, 108, 134);
  return (
    <Stage>
      <div style={{opacity: 1 - out}}>
        <Headline text="검수한 완성본을 링크로" top={190} at={4} size={70} />
        <div style={abs({left: 280, top: 400 + (1 - p) * 300, opacity: p, transform: `scale(${1 - out * 0.06})`})}><Phone w={520}><DoneScreen /></Phone></div>
      </div>
      <div style={abs({left: 0, right: 0, top: 640, display: "flex", flexDirection: "column", alignItems: "center", opacity: lock, transform: `translateY(${(1 - lock) * 30}px)`})}>
        <Logo size={170} />
        <div style={{fontSize: 80, fontWeight: 900, lineHeight: 1.25, textAlign: "center", marginTop: 90, letterSpacing: "-0.02em"}}>영상은 보내고,<br />편집은 <span style={{color: C.red}}>온고잉.</span></div>
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

export const Ad: React.FC = () => {
  const els = [<S1 />, <S2 />, <S3 />, <S4 />, <S5 />, <S6 />];
  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT}}>
      {SCENES.map(([a, b], i) => (
        <Sequence key={i} from={sec(a)} durationInFrames={sec(b - a)}><Scene dur={sec(b - a)}>{els[i]}</Scene></Sequence>
      ))}
      <Audio src={staticFile("audio.wav")} />
    </AbsoluteFill>
  );
};
