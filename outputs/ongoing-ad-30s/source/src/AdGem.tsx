// 온고잉 40초 광고 — 9 scenes from the written spec (공감 훅 → 결과 몽타주 → 로고 전환 → STEP1 보내기 → STEP2 맡기기/고르기/검수 → STEP3 받기 → 엔딩).
// UI is drawn in code with the real UI wording; no camera zoom anywhere; the review step says "사람이 확인" (no unverifiable "전문가"). Safe area: nothing below y=1470 or right of x=940.
import React from "react";
import {AbsoluteFill, Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame} from "remotion";
import {abs, Cut, sp} from "./AdFast";
import {Cursor} from "./AdReal";
import {center} from "./AdEasy";
import {prog, sec} from "./theme";

const CL = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const G = {bg: "#0B0C10", red: "#E50914", mute: "#A0A5B5", green: "#2f8f5b"};
const FONT = "Pretendard, 'Noto Sans KR', 'Noto Sans CJK KR', sans-serif";
export const SC = [0, 2.8, 6.4, 9.2, 14.4, 19.6, 24.8, 29.8, 35.0, 40.0];

const Glass: React.FC<{style: React.CSSProperties; children?: React.ReactNode}> = ({style, children}) => (
  <div style={{background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)", borderRadius: 36, ...style}}>{children}</div>
);
const Bg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: `radial-gradient(900px 700px at 50% 108%, rgba(229,9,20,0.20), transparent 62%), radial-gradient(800px 600px at 15% -5%, rgba(255,255,255,0.05), transparent 60%), ${G.bg}`, fontFamily: FONT, color: "#fff", wordBreak: "keep-all"}}>{children}</AbsoluteFill>
);
const pop3d = (f: number, at: number): React.CSSProperties => {
  const s = sp(f, at);
  return {transform: `perspective(1000px) rotateX(${(1 - s) * 28}deg) rotateY(${(1 - s) * -14}deg) translateY(${(1 - s) * 60}px)`, opacity: Math.min(1, s * 2)};
};
const typed = (text: string, f: number, start: number, fpc: number) => text.slice(0, Math.max(0, Math.min(text.length, Math.floor((f - start) / fpc))));
const Btn: React.FC<{text: string; style?: React.CSSProperties}> = ({text, style}) => (
  <div style={{display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 22, background: G.red, fontWeight: 900, boxShadow: "0 10px 0 #8d050c", ...style}}>{text}</div>
);

// ---- S1 공감 훅 (no zoom on the photo) ----
const S1: React.FC = () => {
  const f = useCurrentFrame(), s = sp(f, 4);
  return (
    <AbsoluteFill style={{background: "#000", fontFamily: FONT}}>
      <Img src={staticFile("creator_intro.jpg")} style={{width: "100%", height: "100%", objectFit: "cover"}} />
      <div style={abs({inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.6))"})} />
      <div style={abs({left: 90, right: 90, top: 700, height: 300, borderRadius: 40, background: "#0a0a0c", border: `6px solid ${G.red}`, boxShadow: `0 0 60px rgba(229,9,20,0.45), 0 30px 60px rgba(0,0,0,0.6)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 108, fontWeight: 900, color: "#fff", transform: `translateY(${(1 - s) * -900}px) rotate(${(1 - s) * -8}deg)`})}>
        또<span style={{color: G.red, margin: "0 20px"}}>밤새</span>편집?
      </div>
    </AbsoluteFill>
  );
};

// ---- S2 결과 퀵 몽타주: three glass cards stack up, 0.8 s apart ----
const MiniTpl: React.FC<{a: string; b: string; name: string}> = ({a, b, name}) => (
  <div style={{width: 224}}>
    <div style={{height: 190, borderRadius: 20, background: `linear-gradient(170deg,${a},${b})`, position: "relative", overflow: "hidden"}}>
      <div style={abs({left: 16, right: 16, top: 16, height: 34, borderRadius: 9, background: "rgba(255,255,255,0.9)"})} />
      <div style={abs({left: 16, right: 16, bottom: 16, height: 30, borderRadius: 9, background: "rgba(0,0,0,0.55)"})} />
    </div>
    <div style={{marginTop: 10, fontSize: 24, fontWeight: 800, textAlign: "center"}}>{name}</div>
  </div>
);
const S2: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Bg>
      <Glass style={{...abs({left: 100, top: 410, width: 780, height: 270, padding: 34}), ...pop3d(f, 0)}}>
        <div style={{fontSize: 30, color: G.mute}}>유튜브 영상 링크</div>
        <div style={{marginTop: 16, display: "flex", gap: 16}}>
          <div style={{flex: 1, height: 92, borderRadius: 20, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.14)", display: "flex", alignItems: "center", padding: "0 24px", fontSize: 30, color: "#fff"}}>https://youtube.com/watch?v=…</div>
          <Btn text="영상 불러오기" style={{height: 92, padding: "0 28px", fontSize: 30}} />
        </div>
      </Glass>
      <Glass style={{...abs({left: 160, top: 730, width: 780, height: 330, padding: "28px 34px"}), ...pop3d(f, 24)}}>
        <div style={{fontSize: 30, color: G.mute, marginBottom: 16}}>템플릿</div>
        <div style={{display: "flex", gap: 24}}>
          <MiniTpl a="#E50914" b="#5a0a0f" name="세로형 자막 강조형" />
          <MiniTpl a="#3a3f4b" b="#14161c" name="다크 미니멀" />
          <MiniTpl a="#f2a541" b="#7a3a14" name="박스 강조형" />
        </div>
      </Glass>
      <Glass style={{...abs({left: 100, top: 1110, width: 780, height: 260, padding: 30}), ...pop3d(f, 48)}}>
        <div style={{fontSize: 28, color: G.mute}}>온고잉 · 메신저</div>
        <div style={{marginTop: 14, display: "flex", gap: 20, alignItems: "center", background: "#fff", color: "#14161c", borderRadius: "10px 26px 26px 26px", padding: "18px 24px"}}>
          <div style={{width: 130, height: 90, borderRadius: 14, background: `linear-gradient(135deg,${G.red},#2a0b16)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 40}}>▶</div>
          <div><div style={{fontSize: 30, fontWeight: 900}}>완성본이 준비되었습니다</div><div style={{fontSize: 24, color: "#6b7078", marginTop: 4}}>완성본 링크</div></div>
        </div>
      </Glass>
    </Bg>
  );
};

// ---- S3 전환 브릿지: the logo plate spins in, then shrinks to the top-right watermark ----
const PLATE = {w: 720, h: Math.round((720 * 441) / 699)};
const WM = {x: 860, y: 284, w: 140};     // watermark centre / width (top-right safe area)
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const s = sp(f, 3), q = prog(f, 54, 80);
  const x = 540 + (WM.x - 540) * q, y = 780 + (WM.y - 780) * q, sc = (1 - q) * (0.6 + 0.4 * s) + q * (WM.w / PLATE.w);
  return (
    <Bg>
      <div style={abs({left: x - PLATE.w / 2, top: y - PLATE.h / 2, width: PLATE.w, height: PLATE.h, borderRadius: 34, overflow: "hidden", boxShadow: "0 40px 90px rgba(0,0,0,0.6), 0 0 80px rgba(229,9,20,0.25)", transform: `perspective(1200px) rotateY(${(1 - s) * -90}deg) scale(${sc})`, opacity: Math.min(1, s * 2.5)})}>
        <Img src={staticFile("logo_plate.png")} style={{width: "100%", height: "100%"}} />
      </div>
    </Bg>
  );
};
const Watermark: React.FC = () => {
  const t = useCurrentFrame() / 30;
  if (t < SC[2] + 80 / 30 || t >= SC[8]) return null;
  return <Img src={staticFile("logo_plate.png")} style={{position: "absolute", left: WM.x - WM.w / 2, top: WM.y - 44, width: WM.w, height: Math.round((WM.w * 441) / 699), borderRadius: 12, boxShadow: "0 10px 24px rgba(0,0,0,0.5)"}} />;
};

// ---- S4 STEP 1 보내기: pick a file, switch to the link tab, type the address ----
const S4: React.FC = () => {
  const f = useCurrentFrame();
  const link = f >= 78;
  const url = typed("https://youtube.com/watch?v=abc123", f, 84, 1.2);
  return (
    <Bg>
      <Glass style={{...abs({left: 100, top: 400, width: 840, height: 820}), ...pop3d(f, 0)}}>
        <div style={abs({left: 44, top: 34, fontSize: 44, fontWeight: 900})}>영상 보내기</div>
        {["파일 불러오기", "링크로 불러오기"].map((t, i) => {
          const on = (i === 1) === link;
          return <div key={t} style={{...abs({left: 44 + i * 386, top: 120, width: 370, height: 84}), borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 900, background: on ? G.red : "rgba(255,255,255,0.08)", color: on ? "#fff" : G.mute, boxShadow: on ? "0 0 36px rgba(229,9,20,0.5)" : "none"}}>{t}</div>;
        })}
        {!link ? (
          <>
            <div style={abs({left: 44, top: 240, width: 752, height: 340, borderRadius: 28, border: "3px dashed rgba(255,255,255,0.25)"})} />
            <div style={abs({left: 44, top: 280, width: 752, textAlign: "center", fontSize: 34, color: G.mute})}>영상을 드래그해 업로드</div>
            <Btn text="또는 파일 선택" style={abs({left: 230, top: 400, width: 380, height: 96, fontSize: 34})} />
            {f >= 34 && <div style={{...abs({left: 44, top: 620, width: 752, height: 84}), borderRadius: 20, background: "rgba(47,143,91,0.18)", border: `2px solid ${G.green}`, display: "flex", alignItems: "center", padding: "0 28px", fontSize: 32, fontWeight: 800, opacity: prog(f, 34, 44)}}>✓ 내 폰 촬영본.mp4</div>}
          </>
        ) : (
          <>
            <div style={{...abs({left: 44, top: 260, width: 752, height: 100}), borderRadius: 20, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.16)", display: "flex", alignItems: "center", padding: "0 28px", fontSize: 32}}>{url}<span style={{opacity: f % 20 < 10 ? 1 : 0, color: G.red}}>|</span></div>
            {f >= 128 && <div style={abs({left: 706, top: 280, width: 60, height: 60, borderRadius: 30, background: G.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 900, opacity: prog(f, 128, 136)})}>✓</div>}
            <Btn text="영상 불러오기" style={abs({left: 44, top: 400, width: 752, height: 100, fontSize: 36})} />
          </>
        )}
      </Glass>
      <Cursor stops={[{x: 520, y: 848, t: 27}, {x: 715, y: 562, t: 75}, {x: 520, y: 850, t: 140}]} />
    </Bg>
  );
};

// ---- S5 STEP 2 맡기기: 온고잉이 알아서 <-> 내가 구간 정해주기 ----
const wave = (i: number) => 0.3 + 0.7 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.53));
const S5: React.FC = () => {
  const f = useCurrentFrame();
  const kp = prog(f, 74, 90), manual = f >= 78;
  const drag = prog(f, 96, 130);
  return (
    <Bg>
      <Glass style={{...abs({left: 100, top: 400, width: 840, height: 880}), ...pop3d(f, 0)}}>
        <div style={{...abs({left: 40, top: 40, width: 760, height: 130}), borderRadius: 65, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.14)"}}>
          <div style={{...abs({top: 15, left: 15 + 370 * kp, width: 370, height: 100}), borderRadius: 50, background: `linear-gradient(180deg,#ff2d3a,${G.red})`, boxShadow: "0 0 44px rgba(229,9,20,0.65)"}} />
          <div style={{...abs({top: 0, left: 15, width: 370, height: 130}), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 900, color: manual ? G.mute : "#fff"}}>온고잉이 알아서</div>
          <div style={{...abs({top: 0, left: 385, width: 370, height: 130}), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 900, color: manual ? "#fff" : G.mute}}>내가 구간 정해주기</div>
        </div>
        <div style={{...abs({left: 40, top: 200, width: 760, height: 520}), borderRadius: 28, background: "rgba(0,0,0,0.35)", overflow: "hidden"}}>
          <div style={abs({left: 28, right: 28, top: 80, height: 330, display: "flex", alignItems: "center", justifyContent: "space-between"})}>
            {Array.from({length: 40}, (_, i) => <div key={i} style={{width: 10, borderRadius: 5, height: 330 * wave(i), background: "rgba(255,255,255,0.3)"}} />)}
          </div>
          {!manual && [70, 300, 530].map((x, i) => {
            const p = sp(f, 18 + i * 15);
            return <div key={x} style={{...abs({left: x, top: 60, width: 160, height: 370}), borderRadius: 22, background: "rgba(229,9,20,0.25)", border: `5px solid ${G.red}`, opacity: Math.min(1, p * 2), transform: `scale(${0.7 + 0.3 * p})`}}><span style={{position: "absolute", top: -28, right: -12, fontSize: 52, color: G.red}}>✦</span></div>;
          })}
          {manual && <div style={{...abs({left: 120, top: 60, width: 120 + 240 * drag, height: 370}), borderRadius: 22, background: "rgba(229,9,20,0.25)", border: `5px solid ${G.red}`}}><div style={abs({right: -22, top: 160, width: 40, height: 40, borderRadius: 20, background: "#fff", boxShadow: "0 0 0 10px rgba(255,255,255,0.25)"})} /></div>}
          <div style={abs({left: 0, right: 0, bottom: 30, textAlign: "center", fontSize: 32, fontWeight: 700, color: G.mute})}>{manual ? "구간과 템플릿을 직접 선택해요" : "구간·제목·템플릿을 자동으로 골라요"}</div>
        </div>
      </Glass>
      <Cursor stops={[{x: 710, y: 505, t: 74}, {x: 700, y: 860, t: 130}]} />
    </Bg>
  );
};

// ---- S6 STEP 2 고르기: 3D template carousel + typed title ----
const TPL: [string, string, string][] = [["#E50914", "#5a0a0f", "세로형 자막 강조형"], ["#3a3f4b", "#14161c", "다크 미니멀"], ["#f2a541", "#7a3a14", "박스 강조형"], ["#2f8f5b", "#0f3a24", "자막 팝형"], ["#e8e3d8", "#8a8577", "페이퍼"]];
const S6: React.FC = () => {
  const f = useCurrentFrame();
  const rot = -144 * prog(f, 4, 66), picked = f >= 72;
  return (
    <Bg>
      <div style={abs({left: 0, top: 0, width: 1080, height: 1920, perspective: 1500, opacity: Math.min(1, sp(f, 0) * 2)})}>
        <div style={abs({left: 0, top: 0, width: 1080, height: 1920, transformStyle: "preserve-3d"})}>
          {TPL.map(([a, b, name], i) => {
            const ang = i * 72 + rot, c = Math.cos((ang * Math.PI) / 180), sel = picked && i === 2;
            return (
              <div key={name} style={{...abs({left: 540 - 115, top: 790 - 210, width: 230, height: 420}), zIndex: Math.round(c * 100) + 100, opacity: 0.35 + 0.65 * ((c + 1) / 2), transform: `rotateY(${ang}deg) translateZ(360px) scale(${sel ? 1.08 : 1})`}}>
                <div style={{height: 380, borderRadius: 26, background: `linear-gradient(170deg,${a},${b})`, position: "relative", overflow: "hidden", boxShadow: sel ? "0 0 0 6px #fff, 0 0 60px rgba(229,9,20,0.8)" : "0 20px 40px rgba(0,0,0,0.5)"}}>
                  <div style={abs({left: 20, right: 20, top: 22, height: 44, borderRadius: 11, background: "rgba(255,255,255,0.9)"})} />
                  <div style={abs({left: 20, right: 20, bottom: 24, height: 40, borderRadius: 11, background: "rgba(0,0,0,0.55)"})} />
                </div>
                <div style={{marginTop: 10, fontSize: 26, fontWeight: 800, textAlign: "center"}}>{name}</div>
              </div>
            );
          })}
        </div>
      </div>
      <Glass style={{...abs({left: 120, top: 1160, width: 800, height: 150, padding: "20px 34px", borderRadius: 30}), opacity: prog(f, 70, 82)}}>
        <div style={{fontSize: 26, color: G.mute}}>내가 제목 정하기</div>
        <div style={{marginTop: 8, fontSize: 44, fontWeight: 900}}>{typed("여행 마지막 날 뜻밖의 풍경", f, 88, 3)}<span style={{opacity: f % 20 < 10 ? 1 : 0, color: G.red}}>|</span></div>
      </Glass>
    </Bg>
  );
};

// ---- S7 AI 사무실: 선별 · 검수 · 고객 응대 desks (original bot avatars), then a person confirms ----
const Bot: React.FC<{on: boolean; f: number}> = ({on, f}) => (
  <svg width={96} height={104} viewBox="0 0 96 104">
    <line x1={48} y1={6} x2={48} y2={20} stroke="#fff" strokeWidth={4} strokeLinecap="round" />
    <circle cx={48} cy={6} r={6} fill={on && f % 24 < 12 ? G.red : "#5a0a0f"} />
    <rect x={10} y={20} width={76} height={62} rx={20} fill="#1b1e26" stroke={G.red} strokeWidth={4} />
    <circle cx={34} cy={50} r={8} fill="#fff" /><circle cx={62} cy={50} r={8} fill="#fff" />
    <circle cx={36} cy={52} r={3.5} fill="#14161c" /><circle cx={64} cy={52} r={3.5} fill="#14161c" />
    <rect x={30} y={90} width={36} height={10} rx={5} fill="#2b2f3a" />
  </svg>
);
const DESKS: {name: string; sub: string}[] = [{name: "선별", sub: "쇼츠로 쓸 구간 고르기"}, {name: "검수", sub: "제목 · 자막 · 소리 확인"}, {name: "고객 응대", sub: "문의 · 수정 요청 받기"}];
const S7: React.FC = () => {
  const f = useCurrentFrame();
  const stamp = sp(f, 108);
  return (
    <Bg>
      <Glass style={{...abs({left: 100, top: 400, width: 840, height: 800}), ...pop3d(f, 0)}}>
        <div style={abs({left: 44, top: 30, fontSize: 38, fontWeight: 900, display: "flex", alignItems: "center", gap: 14})}><span style={{width: 16, height: 16, borderRadius: 8, background: G.red, opacity: 0.5 + 0.5 * Math.sin(f / 4)}} />ONGOING · AI 사무실</div>
        {DESKS.map((d, i) => {
          const at = 18 + i * 20, p = sp(f, at), on = f >= at + 6, k = f - (at + 10);
          return (
            <div key={d.name} style={{...abs({left: 44, top: 100 + i * 225, width: 752, height: 200}), borderRadius: 28, background: "rgba(0,0,0,0.38)", border: "1px solid rgba(255,255,255,0.1)", opacity: Math.min(1, p * 2), transform: `translateX(${(1 - p) * 110}px)`}}>
              <div style={abs({left: 24, top: 40})}><Bot on={on} f={f} /></div>
              <div style={abs({left: 148, top: 26, fontSize: 40, fontWeight: 900})}>{d.name}</div>
              <div style={abs({left: 148, top: 82, fontSize: 25, color: G.mute})}>{d.sub}</div>
              {i === 0 && <div style={abs({left: 148, top: 128, right: 28, height: 40, display: "flex", gap: 6})}>
                {Array.from({length: 22}, (_, j) => <div key={j} style={{flex: 1, borderRadius: 4, background: (j >= 6 && j <= 9) || (j >= 15 && j <= 18) ? (k > j ? G.red : "rgba(255,255,255,0.18)") : "rgba(255,255,255,0.18)"}} />)}
              </div>}
              {i === 1 && <div style={abs({left: 148, top: 124, display: "flex", gap: 14})}>
                {["제목", "자막", "소리"].map((t, j) => <span key={t} style={{padding: "6px 18px", borderRadius: 999, fontSize: 24, fontWeight: 800, background: k > 8 + j * 8 ? "rgba(47,143,91,0.25)" : "rgba(255,255,255,0.1)", border: `2px solid ${k > 8 + j * 8 ? G.green : "rgba(255,255,255,0.15)"}`}}>{k > 8 + j * 8 ? "✓ " : ""}{t}</span>)}
              </div>}
              {i === 2 && <div style={abs({left: 148, top: 124, display: "flex", gap: 12, alignItems: "center"})}>
                <span style={{padding: "6px 18px", borderRadius: 999, fontSize: 23, fontWeight: 800, background: "rgba(255,255,255,0.1)", opacity: k > 4 ? 1 : 0}}>편집·수정 요청</span>
                <span style={{padding: "6px 18px", borderRadius: 999, fontSize: 23, fontWeight: 800, background: G.red, opacity: k > 16 ? 1 : 0}}>접수 완료</span>
              </div>}
            </div>
          );
        })}
      </Glass>
      {f >= 108 && (
        <div style={abs({left: 280, top: 1130, width: 520, height: 150, borderRadius: 30, background: G.green, border: "6px solid #fff", boxShadow: "0 24px 50px rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, fontWeight: 900, opacity: Math.min(1, stamp * 3), transform: `rotate(${-8 + (1 - stamp) * 14}deg) scale(${1 + (1 - stamp) * 1.4})`})}>사람이 확인 ✓</div>
      )}
    </Bg>
  );
};

// ---- S8 STEP 3 받기: push notification, chat bubble, tap -> finished short opens ----
const S8: React.FC = () => {
  const f = useCurrentFrame();
  const nt = sp(f, 30), bub = sp(f, 90), open = sp(f, 140);
  const PX = 260, PY = 380, PWd = 560, PH = 1000;
  const L = (a: number, b: number) => a + (b - a) * open;
  return (
    <Bg>
      <div style={{...abs({left: PX, top: PY, width: PWd, height: PH}), borderRadius: 72, background: "#0b0b0d", padding: 14, boxShadow: "0 60px 110px rgba(0,0,0,0.65), 0 0 0 2px #2b2b32", opacity: Math.min(1, sp(f, 0) * 2.4)}}>
        <div style={{position: "relative", width: "100%", height: "100%", borderRadius: 58, overflow: "hidden", background: "#e8ecf0", color: "#14161c"}}>
          <div style={abs({left: 0, right: 0, top: 0, height: 110, background: "#fff", display: "flex", alignItems: "flex-end", padding: "0 28px 16px", fontSize: 28, fontWeight: 900, borderBottom: "1px solid #d5dae0"})}>온고잉 · ONGOING STUDIO</div>
          <div style={{...abs({left: 20, right: 20, top: 14, padding: "16px 22px", borderRadius: 26, background: "rgba(20,22,28,0.94)", color: "#fff", boxShadow: "0 16px 30px rgba(0,0,0,0.4)", transform: `translateY(${(1 - nt) * -160}px)`, opacity: Math.min(1, nt * 2), zIndex: 3})}}>
            <div style={{fontSize: 22, color: G.mute}}>온고잉 · 방금</div>
            <div style={{fontSize: 30, fontWeight: 900, marginTop: 2}}>완성본 링크가 도착했어요</div>
          </div>
          <div style={{...abs({left: 24, top: 300, width: 380, height: 300}), borderRadius: `${L(10, 0)}px ${L(26, 0)}px ${L(26, 0)}px ${L(26, 0)}px`, background: "#fff", padding: 20, opacity: Math.min(1, bub * 2) * (1 - Math.min(1, open * 2)), transform: `translateY(${(1 - bub) * 30}px)`}}>
            <div style={{height: 150, borderRadius: 16, background: `linear-gradient(135deg,${G.red},#2a0b16)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 56}}>▶</div>
            <div style={{marginTop: 14, fontSize: 28, fontWeight: 900}}>당신의 쇼츠가 완성됐어요</div>
            <div style={{fontSize: 22, color: "#6b7078", marginTop: 2}}>완성본 링크</div>
          </div>
          {f >= 140 && (
            <div style={abs({left: L(24, 0), top: L(300, 0), width: L(380, 532), height: L(300, 972), borderRadius: L(26, 0), overflow: "hidden", background: `linear-gradient(170deg,${G.red},#220609 75%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff"})}>
              <div style={{fontSize: 44 * open, fontWeight: 900, opacity: open, marginBottom: 30}}>당신의 쇼츠가 완성됐어요</div>
              <svg width={140} height={140} viewBox="0 0 120 120" style={{opacity: open}}><circle cx={60} cy={60} r={56} fill="rgba(255,255,255,0.22)" /><path d="M48 34 L88 60 L48 86 Z" fill="#fff" /></svg>
              <div style={abs({left: 40, right: 40, bottom: 80, height: 10, borderRadius: 5, background: "rgba(255,255,255,0.3)", opacity: open})}><div style={{width: `${interpolate(f, [150, 200], [8, 70], CL)}%`, height: "100%", borderRadius: 5, background: "#fff"}} /></div>
            </div>
          )}
        </div>
      </div>
      <Cursor stops={[{x: 488, y: 806, t: 126}]} />
    </Bg>
  );
};

// ---- S9 엔딩 ----
const S9: React.FC = () => {
  const f = useCurrentFrame();
  const s = sp(f, 4), b = sp(f, 40), pulse = 1 + 0.03 * Math.sin(f / 5);
  return (
    <Bg>
      <div style={abs({left: 540 - 380, top: 640 - 240, width: 760, height: Math.round((760 * 441) / 699), borderRadius: 40, overflow: "hidden", boxShadow: "0 50px 100px rgba(0,0,0,0.6), 0 0 90px rgba(229,9,20,0.3)", opacity: Math.min(1, s * 2), transform: `scale(${0.85 + 0.15 * s})`})}>
        <Img src={staticFile("logo_plate.png")} style={{width: "100%", height: "100%"}} />
      </div>
      {center(1080, <div style={{transform: `scale(${(0.7 + 0.3 * b) * pulse})`, opacity: Math.min(1, b * 2)}}><Btn text="영상 보내기" style={{width: 620, height: 140, fontSize: 60, borderRadius: 34, boxShadow: "0 12px 0 #8d050c, 0 0 60px rgba(229,9,20,0.5)"}} /></div>)}
    </Bg>
  );
};

// ---- stickers (absolute seconds, timed to the narration) ----
type St = {t0: number; t1: number; y: number; text: string; rot: number; color?: string; size?: number};
const STK: St[] = [
  {t0: 3.2, t1: 6.2, y: 330, text: "보내면 끝!", rot: -3},
  {t0: 6.9, t1: 9.2, y: 1120, text: "방법은 이것!", rot: 2},
  {t0: 9.4, t1: 11.5, y: 330, text: "1단계 보내기", rot: -2},
  {t0: 11.8, t1: 14.2, y: 330, text: "링크만 쏙!", rot: 3, color: "#ff6f91"},
  {t0: 14.6, t1: 16.6, y: 330, text: "2단계 맡기기", rot: -2},
  {t0: 16.9, t1: 19.4, y: 330, text: "알아서 척척 ✨", rot: 2, color: "#ff6f91"},
  {t0: 19.8, t1: 22.0, y: 330, text: "취향대로 픽!", rot: -3},
  {t0: 22.6, t1: 24.6, y: 330, text: "제목도 직접 ✍️", rot: 2, color: "#ff6f91"},
  {t0: 25.0, t1: 27.6, y: 330, text: "AI 사무실 출근!", rot: -2},
  {t0: 28.4, t1: 29.7, y: 330, text: "사람이 확인 👀", rot: 3, color: "#ff6f91"},
  {t0: 30.0, t1: 32.6, y: 320, text: "3단계 받기", rot: -2},
  {t0: 33.0, t1: 35.0, y: 320, text: "링크로 도착! 💬", rot: 3, color: "#ff6f91"},
  {t0: 35.4, t1: 37.6, y: 330, text: "온고잉 서포트", rot: -2},
  {t0: 37.8, t1: 39.95, y: 330, text: "영상만 보내기", rot: 2, color: "#ff6f91"},
];
const Sticker: React.FC<{o: St}> = ({o}) => {
  const f = useCurrentFrame(), t = f / 30;
  if (t < o.t0 || t > o.t1) return null;
  const p = sp(f, Math.round(o.t0 * 30)), out = 1 - prog(f, Math.round((o.t1 - 0.2) * 30), Math.round(o.t1 * 30));
  const wob = Math.sin((t - o.t0) * 9) * 1.4;
  return (
    <div style={abs({left: 90, width: 860, top: o.y - 60, display: "flex", justifyContent: "center", opacity: Math.min(1, p * 2) * out, transform: `scale(${0.5 + 0.5 * p}) rotate(${o.rot + wob}deg)`})}>
      <span style={{padding: "14px 40px", borderRadius: 26, background: o.color ?? "#ffe14d", color: "#161616", fontSize: o.size ?? 70, fontWeight: 900, border: "7px solid #161616", boxShadow: "10px 10px 0 #161616", fontFamily: FONT, whiteSpace: "nowrap"}}>{o.text}</span>
    </div>
  );
};

const SCENES: [React.FC, boolean][] = [[S1, false], [S2, true], [S3, true], [S4, true], [S5, true], [S6, true], [S7, true], [S8, true], [S9, true]];
export const GEM_FRAMES = sec(40);
export const AdGem: React.FC<{narration?: boolean}> = ({narration = false}) => (
  <AbsoluteFill style={{background: G.bg}}>
    {SCENES.map(([Comp, wipe], i) => <Sequence key={i} from={sec(SC[i])} durationInFrames={sec(SC[i + 1] - SC[i])}><Cut wipe={wipe} punch={false}><Comp /></Cut></Sequence>)}
    <Watermark />
    {STK.map((o, i) => <Sticker key={i} o={o} />)}
    <Audio src={staticFile("audio_gem.wav")} volume={narration ? 0.5 : 1} />
    {narration && <Audio src={staticFile("narration_gem.wav")} />}
  </AbsoluteFill>
);
