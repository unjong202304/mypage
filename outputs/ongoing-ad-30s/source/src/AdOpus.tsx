// 온고잉 33초 광고 — "새벽 편집실 → 아침". Dark editing-room world that ends on the cream 3D logo.
// Material: real service screens (1170x2532 captures, no test patterns), real customer templates (cut from the brand's own animated ad),
// face-blurred Mixkit footage, the user's 3D logo image, Pretendard (OFL; the web app's own UI face).
// Motion: strong ease-out entrances (cubic-bezier .23,1,.32,1), one authored moment (the tilted template wall), no camera zoom.
// Safe area: nothing that matters below y=1470 or right of x=940.
import React from "react";
import {AbsoluteFill, Audio, continueRender, delayRender, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from "remotion";

const fontHandle = delayRender("Pretendard");
const pretendard = new FontFace("Pretendard", `url(${staticFile("opus/fonts/PretendardVariable.woff2")}) format("woff2")`, {weight: "45 920"});
pretendard.load().then((f) => { document.fonts.add(f); continueRender(fontHandle); }).catch(() => continueRender(fontHandle));

const S = (p: string) => staticFile("opus/" + p);
const T = {ink: "#0f1013", ivory: "#f4efe8", mute: "rgba(244,239,232,0.62)", ruby: "#e0336b", brandRuby: "#9e002c", char: "#191a1c"};
const FONT = "Pretendard, 'Noto Sans CJK KR', sans-serif";
const CL = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const OUT = Easing.bezier(0.23, 1, 0.32, 1);
const INOUT = Easing.bezier(0.77, 0, 0.175, 1);
const p = (f: number, a: number, d = 16, e = OUT) => interpolate(f, [a, a + d], [0, 1], {...CL, easing: e});
const abs = (s: React.CSSProperties): React.CSSProperties => ({position: "absolute", ...s});
const Hl: React.FC<{children: React.ReactNode; c?: string}> = ({children, c = T.ruby}) => <span style={{color: c}}>{children}</span>;

// ---------- primitives ----------
const DarkBg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: `radial-gradient(1200px 900px at 12% 112%, rgba(224,51,107,0.16), transparent 60%), radial-gradient(900px 700px at 100% -10%, rgba(255,255,255,0.05), transparent 60%), ${T.ink}`, fontFamily: FONT, color: T.ivory, wordBreak: "keep-all"}}>{children}</AbsoluteFill>
);

// Headline: each line rises out of its own mask; leaves upward when `out` is given.
const Lines: React.FC<{lines: React.ReactNode[]; at: number; top: number; size: number; color?: string; out?: number}> = ({lines, at, top, size, color = T.ivory, out}) => {
  const f = useCurrentFrame();
  const leave = out === undefined ? 0 : p(f, out, 8, INOUT);
  return (
    <div style={abs({left: 90, right: 140, top, fontFamily: FONT, fontSize: size, fontWeight: 820, letterSpacing: "-0.035em", lineHeight: 1.12, color, opacity: 1 - leave, transform: `translateY(${-18 * leave}px)`})}>
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

// Phone frame around full-page captures (never cropped). Screens cross-fade by their own opacity.
const SCREEN_W = 1170, SCREEN_H = 2532;
const Phone: React.FC<{x: number; y: number; w: number; screens: {src: string; o: number}[]; at?: number}> = ({x, y, w, screens, at = 2}) => {
  const f = useCurrentFrame();
  const q = p(f, at, 22);
  const bez = w * 0.028, h = (w - 2 * bez) * (SCREEN_H / SCREEN_W) + 2 * bez;
  return (
    <div style={abs({left: x, top: y, width: w, height: h, borderRadius: w * 0.13, padding: bez, boxSizing: "border-box", background: "linear-gradient(160deg,#25262c,#0a0a0c 60%)",
      boxShadow: "0 50px 90px -24px rgba(0,0,0,0.8), 0 18px 32px -12px rgba(0,0,0,0.6), inset 0 0 0 1.5px rgba(255,255,255,0.09)",
      opacity: q, transform: `perspective(1400px) translateY(${(1 - q) * 46}px) rotateX(${(1 - q) * 10}deg)`})}>
      <div style={{position: "relative", width: "100%", height: "100%", borderRadius: w * 0.105, overflow: "hidden", background: "#fff"}}>
        {screens.map((s, i) => <Img key={i} src={S(s.src)} style={{position: "absolute", inset: 0, width: "100%", height: "100%", opacity: s.o, filter: s.o > 0 && s.o < 1 ? `blur(${(1 - Math.abs(2 * s.o - 1)) * 2}px)` : undefined}} />)}
      </div>
    </div>
  );
};
// UI-point (390-wide page coordinates) -> canvas, for a Phone at (x, y, w).
const onPhone = (x: number, y: number, w: number) => {
  const bez = w * 0.028, k = (w - 2 * bez) / 390;
  return (ux: number, uy: number) => ({x: x + bez + ux * k, y: y + bez + uy * k});
};
// A finger press: a soft dot, then a ring that opens and fades.
const Press: React.FC<{x: number; y: number; at: number}> = ({x, y, at}) => {
  const f = useCurrentFrame();
  if (f < at - 8 || f > at + 20) return null;
  const dot = f < at + 4 ? p(f, at - 8, 6) : 1 - p(f, at + 4, 8);
  const ring = p(f, at, 16);
  return (
    <>
      <div style={abs({left: x - 22, top: y - 22, width: 44, height: 44, borderRadius: 22, background: "rgba(255,255,255,0.92)", boxShadow: "0 6px 16px rgba(0,0,0,0.35)", opacity: dot, transform: `scale(${0.9 + 0.1 * dot})`})} />
      <div style={abs({left: x - 60, top: y - 60, width: 120, height: 120, borderRadius: 60, border: "4px solid rgba(255,255,255,0.9)", opacity: f >= at ? 1 - ring : 0, transform: `scale(${0.35 + 0.9 * ring})`})} />
    </>
  );
};
const Check: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.2 4.2L19 7" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" /></svg>
);

// ---------- scenes ----------
const Hook: React.FC = () => (
  <AbsoluteFill style={{background: T.ink}}>
    <Img src={S("hook.jpg")} style={{width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.82) saturate(0.9)"}} />
    <div style={abs({inset: 0, background: "linear-gradient(180deg, rgba(10,10,12,0.88) 0%, rgba(10,10,12,0.4) 36%, rgba(10,10,12,0) 52%, rgba(10,10,12,0.5) 100%)"})} />
    <Lines at={4} top={250} size={112} lines={["촬영보다", <><Hl>편집이</Hl> 더 오래</>, "걸리시죠?"]} />
  </AbsoluteFill>
);

const Footage: React.FC = () => {
  const f = useCurrentFrame();
  const sw = p(f, 52, 14, INOUT);
  return (
    <DarkBg>
      <div style={abs({inset: 0, opacity: 1 - sw, filter: sw > 0 ? `blur(${sw * 6}px)` : undefined})}>
        <OffthreadVideo src={S("travel.mp4")} muted style={{width: "100%", height: "100%", objectFit: "cover"}} />
        <div style={abs({inset: 0, background: "linear-gradient(180deg, rgba(10,10,12,0.78) 0%, rgba(10,10,12,0) 34%, rgba(10,10,12,0) 70%, rgba(10,10,12,0.35) 100%)"})} />
      </div>
      {f >= 50 && (
        <div style={abs({left: 90, top: 700, width: 850, height: 478, borderRadius: 28, overflow: "hidden", opacity: sw, transform: `translateY(${(1 - sw) * 30}px)`, boxShadow: "0 40px 80px -20px rgba(0,0,0,0.75)"})}>
          <OffthreadVideo src={S("cooking.mp4")} muted startFrom={20} style={{width: "100%", height: "100%", objectFit: "cover"}} />
        </div>
      )}
      <Lines at={6} top={250} size={100} lines={["찍어 둔 영상,", <>그대로 <Hl>보내세요.</Hl></>]} />
      <div style={abs({left: 90, top: 1400, fontSize: 22, color: T.mute, fontFamily: FONT})}>영상: Mixkit · 얼굴 블러 처리</div>
    </DarkBg>
  );
};

const PH = {x: 310, y: 472, w: 460};
const P3 = onPhone(PH.x, PH.y, PH.w);
const Send: React.FC = () => {
  const f = useCurrentFrame();
  const sw = p(f, 96, 10, INOUT);
  return (
    <DarkBg>
      {f < 90 ? <Lines at={4} out={80} top={230} size={86} lines={["폰 속 영상은", <><Hl>그대로</Hl> 올리고,</>]} />
        : <Lines at={90} top={230} size={86} lines={["롱폼은", <><Hl>링크만</Hl> 넣으면 끝.</>]} />}
      <Phone {...PH} screens={[{src: "intake-file-manual-native.png", o: 1 - sw}, {src: "intake-link-manual-native.png", o: sw}]} />
      <Press {...P3(163, 292)} at={60} />
      <Press {...P3(291, 226)} at={92} />
      <Press {...P3(195, 307)} at={140} />
    </DarkBg>
  );
};

const Choose: React.FC = () => {
  const f = useCurrentFrame();
  const sw = p(f, 74, 10, INOUT);
  return (
    <DarkBg>
      {f < 70 ? <Lines at={4} out={62} top={230} size={86} lines={["구간과 템플릿,", <><Hl>온고잉이</Hl> 알아서.</>]} />
        : <Lines at={72} top={230} size={86} lines={[<>아니면 <Hl>내가</Hl></>, "직접 정해도 돼요."]} />}
      <Phone {...PH} screens={[{src: "auto-guide-native.png", o: 1 - sw}, {src: "manual-guide-native.png", o: sw}]} />
      <Press {...P3(192, 388)} at={32} />
      <Press {...P3(192, 415)} at={112} />
    </DarkBg>
  );
};

// The authored moment: a tilted wall of real templates drifting in three columns.
const TPL: [string, string][] = [["comment", "댓글 반응형"], ["news", "뉴스 전달형"], ["box", "박스 강조형"], ["info", "정보·꿀팁형"], ["variety", "예능 리액션형"], ["movie", "영화·드라마 설명형"], ["story", "스토리·브이로그형"], ["talk", "자막 강조형"]];
const CW = 218, CH = Math.round((CW * 431) / 245), ITEM = CH + 64;
const Wall: React.FC<{f: number}> = ({f}) => {
  const cols = [{x: 92, dir: -1, off: 0, shift: 0}, {x: 92 + CW + 30, dir: 1, off: -ITEM * 0.5, shift: 3}, {x: 92 + 2 * (CW + 30), dir: -1, off: -ITEM * 0.2, shift: 5}];
  return (
    <div style={abs({left: 0, top: 0, width: 1080, height: 1920, transform: "perspective(1800px) rotateX(16deg) rotateZ(-6deg)", transformOrigin: "430px 980px"})}>
      {cols.map((c, ci) => {
        const y0 = c.off + c.dir * f * 2.1 - ITEM;
        return (
          <div key={ci} style={abs({left: c.x, top: 440 + (((y0 % ITEM) + ITEM) % ITEM) - ITEM, width: CW})}>
            {Array.from({length: 6}, (_, k) => {
              const base = Math.floor(-(c.off + c.dir * f * 2.1) / ITEM);
              const [key, name] = TPL[(((k + c.shift + base) % TPL.length) + TPL.length) % TPL.length];
              return (
                <div key={k} style={{height: ITEM}}>
                  <Img src={S(`tpl/${key}.png`)} style={{width: CW, height: CH, borderRadius: 18, boxShadow: "0 26px 40px -16px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)"}} />
                  <div style={{marginTop: 14, fontSize: 25, fontWeight: 650, color: T.mute, letterSpacing: "-0.02em", fontFamily: FONT}}>{name}</div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
const ANAT = {x: 108, y: 540, w: 471, h: 835};
const PARTS: [number, string, string][] = [[125, "제목 두 줄", "채널 톤에 맞춘 글꼴·색"], [380, "원본 하이라이트", "고른 구간을 가운데에"], [560, "댓글 자리", "보이거나 숨기거나"], [765, "채널 이름", "끝까지 내 채널로"]];
const Templates: React.FC = () => {
  const f = useCurrentFrame();
  const wallIn = p(f, 0, 26), wallOut = p(f, 88, 12, INOUT);
  const card = p(f, 98, 22);
  return (
    <DarkBg>
      <div style={abs({inset: 0, opacity: wallIn * (1 - wallOut), filter: `blur(${(1 - wallIn) * 10 + wallOut * 8}px)`,
        WebkitMaskImage: "linear-gradient(180deg, transparent 27%, #000 37%, #000 69%, transparent 77%)", maskImage: "linear-gradient(180deg, transparent 27%, #000 37%, #000 69%, transparent 77%)"})}>
        <Wall f={f} />
      </div>
      {f < 92 ? (
        <>
          <Lines at={6} out={84} top={230} size={92} lines={["채널에 맞는", <><Hl>실제 템플릿</Hl>으로.</>]} />
          <div style={abs({left: 90, top: 452, fontSize: 30, fontWeight: 600, color: T.mute, fontFamily: FONT, opacity: p(f, 18, 16) * (1 - p(f, 84, 8))})}>고객이 고르는 편집 스타일 23종</div>
        </>
      ) : (
        <Lines at={98} top={230} size={84} lines={["제목, 자막, 댓글", <>자리까지 <Hl>보기 좋게.</Hl></>]} />
      )}
      {f >= 96 && (
        <>
          <Img src={S("tpl/anatomy_card.png")} style={abs({left: ANAT.x, top: ANAT.y, width: ANAT.w, height: ANAT.h, borderRadius: 26, boxShadow: "0 50px 90px -24px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.07)", opacity: card, transform: `translateY(${(1 - card) * 40}px)`})} />
          {PARTS.map(([ry, title, sub], i) => {
            const q = p(f, 110 + i * 7, 18);
            const y = ANAT.y + ry;
            return (
              <React.Fragment key={title}>
                <div style={abs({left: ANAT.x + ANAT.w - 6, top: y - 1.5, width: 64, height: 3, background: T.ruby, transformOrigin: "left center", transform: `scaleX(${q})`})} />
                <div style={abs({left: ANAT.x + ANAT.w - 12, top: y - 6, width: 12, height: 12, borderRadius: 6, background: T.ruby, opacity: q})} />
                <div style={abs({left: ANAT.x + ANAT.w + 72, top: y - 26, width: 300, opacity: q, transform: `translateX(${(1 - q) * 14}px)`, fontFamily: FONT})}>
                  <div style={{fontSize: 36, fontWeight: 760, letterSpacing: "-0.03em"}}>{title}</div>
                  <div style={{fontSize: 24, color: T.mute, marginTop: 4}}>{sub}</div>
                </div>
              </React.Fragment>
            );
          })}
        </>
      )}
    </DarkBg>
  );
};

const STEPS = ["사람 검수", "편집실 재검수", "링크 전달"];
const Deliver: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <DarkBg>
      <Lines at={4} top={230} size={86} lines={["두 번 검수한", <>완성본을 <Hl>링크로.</Hl></>]} />
      <Phone x={325} y={545} w={430} screens={[{src: "delivery-design42-sanitized.png", o: 1}]} />
      <div style={abs({left: 90, top: 458, display: "flex", gap: 14, fontFamily: FONT})}>
        {STEPS.map((s, i) => {
          const q = p(f, 20 + i * 26, 14);
          return (
            <div key={s} style={{display: "flex", alignItems: "center", gap: 8, padding: "10px 20px 10px 14px", borderRadius: 999, fontSize: 26, fontWeight: 700,
              background: q > 0.5 ? "rgba(224,51,107,0.18)" : "rgba(255,255,255,0.06)", border: `1.5px solid ${q > 0.5 ? T.ruby : "rgba(255,255,255,0.12)"}`, color: q > 0.5 ? T.ivory : T.mute}}>
              <span style={{opacity: q, transform: `scale(${0.8 + 0.2 * q})`, display: "flex"}}><Check size={26} color={T.ruby} /></span>{s}
            </div>
          );
        })}
      </div>
      <Press {...onPhone(325, 545, 430)(193, 582)} at={120} />
    </DarkBg>
  );
};

const End: React.FC = () => {
  const f = useCurrentFrame();
  const q = p(f, 0, 18);
  return (
    <AbsoluteFill style={{background: "#efebe6", fontFamily: FONT}}>
      <Img src={S("logo3d_full.png")} style={abs({left: 0, top: -8 + (1 - q) * 14, width: 1080, height: Math.round((1080 * 1376) / 768), opacity: q})} />
      <Lines at={10} top={290} size={96} color={T.char} lines={["영상은 보내고,", <>편집은 <Hl c={T.brandRuby}>온고잉.</Hl></>]} />
      <div style={abs({left: 90, top: 1392, fontSize: 22, color: "rgba(25,26,28,0.55)", opacity: p(f, 30, 16)})}>영상 소스: Mixkit · 화면: 온고잉 실제 서비스 화면</div>
    </AbsoluteFill>
  );
};

// ---------- timeline ----------
export const OPUS_SCENES: [number, number, React.FC][] = [[0, 3.0, Hook], [3.0, 6.6, Footage], [6.6, 12.4, Send], [12.4, 17.4, Choose], [17.4, 23.4, Templates], [23.4, 28.6, Deliver], [28.6, 33.0, End]];
export const OPUS_FRAMES = 990;
const Grain: React.FC = () => {
  const f = useCurrentFrame();
  const r = (n: number) => Math.floor((Math.sin(f * 12.9898 + n * 78.233) * 43758.5453) % 1 * 384);
  return <div style={abs({inset: 0, backgroundImage: `url(${S("grain.png")})`, backgroundSize: "384px 384px", backgroundPosition: `${r(1)}px ${r(2)}px`, mixBlendMode: "overlay", opacity: 0.07, pointerEvents: "none"})} />;
};
const Enter: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{opacity: interpolate(f, [0, 6], [0, 1], CL)}}>{children}</AbsoluteFill>;
};
export const AdOpus: React.FC<{narration?: boolean}> = ({narration = true}) => (
  <AbsoluteFill style={{background: T.ink}}>
    {OPUS_SCENES.map(([a, b, Comp], i) => (
      <Sequence key={i} from={Math.round(a * 30)} durationInFrames={Math.round((b - a) * 30)}><Enter><Comp /></Enter></Sequence>
    ))}
    <div style={abs({inset: 0, background: "radial-gradient(ellipse at 50% 45%, transparent 58%, rgba(0,0,0,0.28) 100%)", pointerEvents: "none"})} />
    <Grain />
    <Audio src={staticFile("audio_opus.wav")} volume={narration ? 0.45 : 1} />
    {narration && <Audio src={staticFile("narration_opus.wav")} />}
  </AbsoluteFill>
);
