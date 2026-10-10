// Long-form -> short: the wide source with a range being picked, then the same clip in the dark "세로형 자막 강조형" layout (title on top, caption highlight below; no blur background).
// public/assets/longform-short.mp4 is the face-blurred clip (video-pipeline/mosaic_faces.py); credit line is required for CC BY sources.
import React from "react";
import {AbsoluteFill, interpolate, OffthreadVideo, useCurrentFrame} from "remotion";
import {abs, PINK, sp, Slam} from "./AdFast";
import {Stage} from "./parts";
import {A, C, prog} from "./theme";

const CL = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
export const TemplateShow: React.FC<{src?: string; title?: string; caption?: string; hl?: string[]; credit?: string; totalLabel?: string}> =
  ({src = "longform-short.mp4", title = "시간이란 무엇인가", caption = "", hl = [], credit = "영상 출처: 카오스 사이언스 (CC BY) · 얼굴 블러 처리", totalLabel = "롱폼 · 1시간 59분"}) => {
    const f = useCurrentFrame();
    const toShort = prog(f, 78, 96);
    const sel = prog(f, 20, 66);
    return (
      <AbsoluteFill style={{background: C.bg}}>
        {toShort < 1 && (
          <div style={abs({inset: 0, opacity: 1 - toShort})}>
            <Stage>
              <Slam text="롱폼에서" at={2} top={170} size={100} hl={["롱폼에서"]} />
              <div style={abs({left: 50, top: 520, width: 980, height: 551, borderRadius: 28, overflow: "hidden", boxShadow: "0 40px 90px rgba(0,0,0,0.6)", transform: `scale(${1 - 0.06 * toShort})`})}>
                <OffthreadVideo src={A(src)} muted style={{width: "100%", height: "100%", objectFit: "cover"}} />
              </div>
              <div style={abs({left: 50, top: 1130, width: 980, height: 18, borderRadius: 9, background: "rgba(255,255,255,0.18)"})}>
                <div style={abs({left: 300, width: 330 * sel, top: -8, height: 34, borderRadius: 10, background: "rgba(219,56,108,0.5)", border: `4px solid ${PINK}`})} />
              </div>
              <div style={abs({left: 0, right: 0, top: 1200, textAlign: "center", fontSize: 40, fontWeight: 700, color: C.mute})}>{totalLabel}</div>
              <div style={abs({left: 0, right: 0, top: 1300, textAlign: "center", fontSize: 76, fontWeight: 900, opacity: prog(f, 50, 66)})}>이 구간만 골라</div>
            </Stage>
          </div>
        )}
        {toShort > 0 && (
          <div style={{...abs({inset: 0}), opacity: toShort, transform: `scale(${1.08 - 0.08 * toShort})`, background: `linear-gradient(180deg,#141416,#0b0b0d)`, fontFamily: "Pretendard, 'Noto Sans KR', sans-serif", wordBreak: "keep-all"}}>
            <div style={abs({left: 60, right: 60, top: 250, padding: "26px 36px", borderRadius: 24, background: "rgba(255,255,255,0.95)", color: C.ink, fontSize: 70, fontWeight: 900, textAlign: "center", transform: `scale(${0.8 + 0.2 * sp(f, 90)})`})}>{title}</div>
            <div style={abs({left: 0, right: 0, top: 560, height: 608, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.6)"})}>
              <OffthreadVideo src={A(src)} muted style={{width: "100%", height: "100%", objectFit: "cover"}} />
            </div>
            <div style={abs({left: 50, right: 50, top: 1300, textAlign: "center", fontSize: 92, fontWeight: 900, lineHeight: 1.25, color: "#fff"})}>
              {caption ? caption.split(" ").map((w, i) => <React.Fragment key={i}><span style={{color: hl.some((h) => w.includes(h)) ? "#ffd84d" : "#fff"}}>{w}</span>{" "}</React.Fragment>) : null}
            </div>
            <div style={abs({left: 0, right: 0, top: 1620, textAlign: "center", fontSize: 44, fontWeight: 900, color: PINK, opacity: prog(f, 110, 124)})}>쇼츠 완성 · 세로형 자막 강조형</div>
            <div style={abs({left: 0, right: 0, bottom: 70, textAlign: "center", fontSize: 28, color: "rgba(255,255,255,0.75)"})}>{credit}</div>
          </div>
        )}
      </AbsoluteFill>
    );
  };
