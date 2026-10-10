import React from "react";
import {Img, interpolate, OffthreadVideo, staticFile, useCurrentFrame} from "remotion";
import {Glass, MONO, useIn, useTyped} from "./kit";

const ACCENT = ["#ffd24a", "#7cf0a8", "#8fb4ff", "#ff9d6e"];
const Center: React.FC<{children: React.ReactNode; gap?: number}> = ({children, gap = 24}) => (
  <div style={{position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center",
    alignItems: "center", padding: "0 40px", gap, textAlign: "center", wordBreak: "keep-all"}}>{children}</div>
);

// Kinetic headline: words pop in one by one, `hl` words are tinted.
export const Title: React.FC<{text: string; hl?: string[]; sub?: string; big: boolean}> = ({text, hl = [], sub, big}) => {
  const f = useCurrentFrame();
  return (
    <Center>
      <div style={{fontSize: big ? 104 : 80, fontWeight: 900, lineHeight: 1.18}}>
        {text.split(" ").map((w, i) => {
          const p = interpolate(f, [i * 3, i * 3 + 6], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
          return <span key={i} style={{display: "inline-block", marginRight: 18, opacity: p, transform: `scale(${0.7 + 0.3 * p})`,
            color: hl.some((h) => w.includes(h)) ? ACCENT[0] : "#fff"}}>{w}</span>;
        })}
      </div>
      {sub && <div style={{fontSize: 34, opacity: 0.7, ...useIn(14)}}>{sub}</div>}
    </Center>
  );
};

export const Stat: React.FC<{value: string; label: string; big: boolean}> = ({value, label, big}) => (
  <Center gap={8}>
    <div style={{fontSize: (big ? 210 : 160) * (value.length > 5 ? 0.75 : 1), fontWeight: 900, color: ACCENT[0], lineHeight: 1, ...useIn(0)}}>{value}</div>
    <div style={{fontSize: 40, opacity: 0.8, ...useIn(6)}}>{label}</div>
  </Center>
);

export const Checklist: React.FC<{title?: string; items: string[]; big: boolean}> = ({title, items, big}) => (
  <Center gap={big ? 30 : 18}>
    {title && <div style={{fontSize: 44, fontWeight: 800, opacity: 0.9, ...useIn(0)}}>{title}</div>}
    {items.map((t, i) => (
      <Glass key={i} style={{width: 560, padding: "16px 26px", display: "flex", gap: 18, alignItems: "center", fontSize: big ? 44 : 38,
        fontWeight: 700, textAlign: "left", ...useIn(6 + i * 9)}}>
        <span style={{color: "#28c840"}}>✓</span>{t}
      </Glass>
    ))}
  </Center>
);

const Skeleton: React.FC<{title: string; good: boolean; h: number}> = ({title, good, h}) => (
  <div style={{height: h, borderRadius: 14, overflow: "hidden", background: good ? "#f4f1ec" : "#e6e6e6", padding: 14, textAlign: "left", color: "#222"}}>
    <div style={{display: "flex", gap: 6, marginBottom: 12}}>{[0, 1, 2].map((i) => <i key={i} style={{width: 9, height: 9, borderRadius: 5, background: "#bbb"}} />)}</div>
    <div style={{height: 120, borderRadius: 10, background: good ? "linear-gradient(135deg,#7c5cff,#ff7ab6)" : "#cfcfcf", padding: 12,
      color: "#fff", fontWeight: 800, fontSize: 26, lineHeight: 1.2}}>{title}</div>
    {[70, 90, 55].map((w, i) => <div key={i} style={{height: 12, width: `${w}%`, background: good ? "#cdbfae" : "#d0d0d0", borderRadius: 6, marginTop: 14}} />)}
    <div style={{height: 34, width: 110, borderRadius: 17, background: good ? "#222" : "#bdbdbd", marginTop: 20}} />
  </div>
);

// Before/after: two website mock-ups side by side with a label chip each.
export const Compare: React.FC<{left: {label: string; title: string}; right: {label: string; title: string}; big?: boolean}> = ({left, right, big}) => (
  <Center>
    <div style={{display: "flex", flexDirection: big ? "column" : "row", gap: big ? 34 : 22, width: big ? 560 : 650}}>
      {[left, right].map((c, i) => (
        <div key={i} style={{flex: 1, ...useIn(i * 8)}}>
          <div style={{display: "inline-block", padding: "4px 16px", borderRadius: 999, background: "rgba(255,255,255,0.9)", color: "#222",
            fontSize: 24, fontWeight: 800, marginBottom: 12}}>{c.label}</div>
          <Skeleton title={c.title} good={i === 1} h={big ? 250 : 330} />
        </div>
      ))}
    </div>
  </Center>
);

// Nodes joined by a line with a travelling pulse, then a status chip.
export const Diagram: React.FC<{nodes: {label: string; sub?: string}[]; status?: string; big?: boolean}> = ({nodes, status, big}) => {
  const f = useCurrentFrame();
  const pulse = (f % 30) / 30;
  return (
    <Center gap={34}>
      <div style={{display: "flex", flexDirection: big ? "column" : "row", alignItems: "center"}}>
        {nodes.map((n, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <div style={{background: "rgba(255,255,255,0.3)", position: "relative",
                ...(big ? {width: 4, height: 40, margin: "4px 0"} : {width: 46, height: 4, margin: "0 4px"})}}>
                <i style={{position: "absolute", width: 12, height: 12, borderRadius: 6, background: ACCENT[1],
                  ...(big ? {left: -4, top: `${pulse * 100}%`} : {top: -4, left: `${pulse * 100}%`})}} />
              </div>
            )}
            <Glass style={{width: big ? 380 : nodes.length > 2 ? 190 : 250, padding: 18, ...useIn(i * 8)}}>
              <div style={{width: 54, height: 54, borderRadius: 16, background: ACCENT[i % 4], color: "#111", fontSize: 30, fontWeight: 900,
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px"}}>{n.label[0].toUpperCase()}</div>
              <div style={{fontFamily: MONO, fontSize: big ? 28 : 21}}>{n.label.length > 13 ? n.label.slice(0, 12) + "…" : n.label}</div>
              {n.sub && <div style={{fontSize: big ? 24 : 18, opacity: 0.6, marginTop: 4}}>{n.sub}</div>}
            </Glass>
          </React.Fragment>
        ))}
      </div>
      {status && <div style={{padding: "8px 22px", borderRadius: 999, background: "rgba(40,200,64,0.25)", fontFamily: MONO, fontSize: big ? 28 : 26, ...useIn(22)}}>✓ {status}</div>}
    </Center>
  );
};

// Document card with a step counter and a filling progress bar.
export const Doc: React.FC<{title: string; file?: string; steps: number; tag?: string}> = ({title, file, steps, tag}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [10, 60], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <Center>
      <Glass style={{width: 580, padding: 30, textAlign: "left", ...useIn(0)}}>
        {file && <div style={{fontFamily: MONO, fontSize: 22, opacity: 0.65}}>▤ {file}</div>}
        <div style={{fontSize: 54, fontWeight: 800, margin: "16px 0 10px"}}>{title}</div>
        <div style={{display: "flex", gap: 12, alignItems: "center", fontSize: 26}}>
          <span style={{padding: "2px 14px", borderRadius: 10, background: "rgba(255,255,255,0.14)"}}>{steps} steps</span>
          {tag && <span style={{opacity: 0.65}}>{tag}</span>}
          <span style={{marginLeft: "auto", fontFamily: MONO}}>{Math.round(p * steps)}/{steps}</span>
        </div>
        <div style={{height: 10, borderRadius: 5, background: "rgba(255,255,255,0.12)", marginTop: 22}}>
          <div style={{height: 10, borderRadius: 5, width: `${p * 100}%`, background: ACCENT[1]}} />
        </div>
        {[80, 60, 70].map((w, i) => <div key={i} style={{height: 12, width: `${w}%`, background: "rgba(255,255,255,0.10)", borderRadius: 6, marginTop: 16}} />)}
      </Glass>
    </Center>
  );
};

// White pill of round tool icons (initials; no third-party logos).
export const Logos: React.FC<{chips: string[]; label?: string}> = ({chips, label}) => (
  <Center gap={26}>
    <div style={{display: "flex", gap: 16, padding: "18px 26px", borderRadius: 44, background: "#fff", ...useIn(0)}}>
      {chips.map((c, i) => (
        <div key={i} style={{width: 76, height: 76, borderRadius: 38, background: ACCENT[i % 4], color: "#111", fontSize: 38, fontWeight: 900,
          display: "flex", alignItems: "center", justifyContent: "center", ...useIn(i * 4)}}>{c[0].toUpperCase()}</div>
      ))}
    </div>
    {label && <div style={{fontSize: 40, fontWeight: 800, ...useIn(12)}}>{label}</div>}
  </Center>
);

// Supplied image or video (screen recording, site capture) filling the panel.
export const Media: React.FC<{src: string}> = ({src}) => {
  const st: React.CSSProperties = {position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover"};
  return /\.(mp4|webm|mov)$/i.test(src) ? <OffthreadVideo src={staticFile(src)} muted style={st} /> : <Img src={staticFile(src)} style={st} />;
};

const CL = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const TICKS = "repeating-linear-gradient(90deg, rgba(255,255,255,0.10) 0 2px, transparent 2px 24px)";
const Bar: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <div style={{position: "relative", height: 80, borderRadius: 16, background: "rgba(255,255,255,0.08)", backgroundImage: TICKS,
    border: "1px solid rgba(255,255,255,0.15)"}}>{children}</div>
);
const Seg: React.FC<{a: number; b: number; i: number; at: number}> = ({a, b, i, at}) => {
  const f = useCurrentFrame();
  return <div style={{position: "absolute", top: 6, bottom: 6, left: `${a * 100}%`, width: `${(b - a) * 100}%`, borderRadius: 10,
    background: ACCENT[i % 4], opacity: interpolate(f, [at, at + 6], [0, 1], CL)}} />;
};

// One long timeline bar, three clips pulled out of it as vertical shorts.
export const LongShort: React.FC<{label?: string}> = ({label = "긴 영상"}) => (
  <Center gap={34}>
    <div style={{width: 620, ...useIn(0)}}>
      <div style={{fontSize: 26, opacity: 0.7, marginBottom: 10, textAlign: "left"}}>{label}</div>
      <Bar>{[[0.08, 0.2], [0.42, 0.54], [0.74, 0.86]].map(([a, b], i) => <Seg key={i} a={a} b={b} i={i} at={10 + i * 6} />)}</Bar>
    </div>
    <div style={{fontSize: 44, ...useIn(8)}}>↓</div>
    <div style={{display: "flex", gap: 22}}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{width: 180, height: 320, borderRadius: 26, background: `linear-gradient(160deg, ${ACCENT[i]}, #1d1d28)`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 54, color: "#111", ...useIn(16 + i * 6)}}>▶</div>
      ))}
    </div>
  </Center>
);

// File or link in, nothing to install.
export const Drop: React.FC<{chip?: string; file?: string; link?: string}> = ({chip, file = "interview.mp4", link = "https://youtube.com/watch?v=…"}) => {
  const typed = useTyped(link, 16, 30);
  return (
    <Center gap={26}>
      {chip && <div style={{padding: "6px 24px", borderRadius: 999, background: "rgba(40,200,64,0.25)", fontSize: 32, fontWeight: 800, ...useIn(0)}}>{chip}</div>}
      <Glass style={{width: 600, padding: 26, textAlign: "left", ...useIn(4)}}>
        <div style={{fontSize: 26, opacity: 0.7}}>파일 올리기</div>
        <div style={{display: "flex", gap: 16, alignItems: "center", marginTop: 12}}>
          <div style={{width: 60, height: 60, borderRadius: 14, background: ACCENT[2], color: "#111", fontWeight: 900, fontSize: 32,
            display: "flex", alignItems: "center", justifyContent: "center"}}>↑</div>
          <div style={{fontFamily: MONO, fontSize: 28}}>{file}</div>
        </div>
      </Glass>
      <Glass style={{width: 600, padding: 26, textAlign: "left", ...useIn(10)}}>
        <div style={{fontSize: 26, opacity: 0.7}}>링크 붙여넣기</div>
        <div style={{fontFamily: MONO, fontSize: 26, marginTop: 14, padding: "12px 16px", borderRadius: 12, background: "rgba(0,0,0,0.4)", minHeight: 34}}>{typed}</div>
      </Glass>
    </Center>
  );
};

// Pick the range yourself, or let the AI mark the good parts.
export const Timeline: React.FC<{manual: string; auto: string}> = ({manual, auto}) => {
  const f = useCurrentFrame();
  const x = interpolate(f, [6, 40], [0.08, 0.5], CL);
  return (
    <Center gap={46}>
      <div style={{width: 620, textAlign: "left", ...useIn(0)}}>
        <div style={{fontSize: 32, fontWeight: 800, marginBottom: 12}}>{manual}</div>
        <Bar><div style={{position: "absolute", top: 5, bottom: 5, left: `${x * 100}%`, width: "26%", border: `3px solid ${ACCENT[0]}`,
          borderRadius: 10, background: "rgba(255,210,74,0.25)"}} /></Bar>
      </div>
      <div style={{width: 620, textAlign: "left", ...useIn(10)}}>
        <div style={{fontSize: 32, fontWeight: 800, marginBottom: 12}}>{auto} <span style={{fontSize: 22, padding: "2px 12px", borderRadius: 8, background: "rgba(124,240,168,0.3)"}}>AI</span></div>
        <Bar>{[[0.05, 0.17], [0.37, 0.5], [0.7, 0.84]].map(([a, b], i) => <Seg key={i} a={a} b={b} i={1} at={26 + i * 8} />)}</Bar>
      </div>
    </Center>
  );
};

// Three caption looks; the middle one gets picked.
export const Styles: React.FC<{items?: string[]}> = ({items = ["굵은 흰색", "형광 노랑", "네온 핑크"]}) => {
  const f = useCurrentFrame();
  const pick = f > 24 ? 1 : -1;
  const look = [{c: "#fff", bg: "#111"}, {c: "#ffd24a", bg: "#1f1a05"}, {c: "#ff5fc8", bg: "#1a0b18"}];
  return (
    <Center gap={30}>
      <div style={{display: "flex", gap: 18}}>
        {items.slice(0, 3).map((t, i) => (
          <div key={i} style={{width: 190, height: 300, borderRadius: 22, background: look[i].bg, display: "flex", flexDirection: "column",
            justifyContent: "flex-end", padding: 16, textAlign: "left", transform: `scale(${pick === i ? 1.06 : 1})`,
            border: `4px solid ${pick === i ? "#7cf0a8" : "rgba(255,255,255,0.15)"}`, ...useIn(i * 6)}}>
            <div style={{fontSize: 36, fontWeight: 900, color: look[i].c, WebkitTextStroke: "4px #000", paintOrder: "stroke fill", lineHeight: 1.2}}>자막<br />스타일</div>
            <div style={{fontSize: 20, opacity: 0.7, marginTop: 10}}>{t}</div>
          </div>
        ))}
      </div>
      <div style={{fontSize: 34, fontWeight: 800, color: "#7cf0a8", ...useIn(28)}}>✓ 스타일 적용</div>
    </Center>
  );
};
