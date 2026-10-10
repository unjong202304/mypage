import React from "react";
import {Img, interpolate, OffthreadVideo, staticFile, useCurrentFrame} from "remotion";
import {Glass, MONO, useIn} from "./kit";

const ACCENT = ["#ffd24a", "#7cf0a8", "#8fb4ff", "#ff9d6e"];
const Center: React.FC<{children: React.ReactNode; gap?: number}> = ({children, gap = 24}) => (
  <div style={{position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center",
    alignItems: "center", padding: "0 40px", gap, textAlign: "center"}}>{children}</div>
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
