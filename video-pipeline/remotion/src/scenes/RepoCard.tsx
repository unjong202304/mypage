import React from "react";
import {Glass, MONO, useIn, useTyped} from "./kit";

export type Stat = {k: string; v: string};

// GitHub-style repo card: url bar, logo, big title, stat boxes, typed install line.
export const RepoCard: React.FC<{url: string; title: string; sub?: string; badge?: string; stats: Stat[]; cmd?: string; big?: boolean}> =
  ({url, title, sub, badge, stats, cmd, big}) => {
    const typed = useTyped(cmd ? `$ ${cmd}` : "", 22);
    return (
      <Glass style={{position: "absolute", left: 36, right: 36, top: big ? 300 : 56, padding: 30, height: 440}}>
        <div style={{display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 22, opacity: 0.75, ...useIn(0)}}>
          <span>⌥ {url}</span>
          {badge && <span style={{padding: "2px 14px", borderRadius: 10, background: "rgba(255,255,255,0.12)"}}>{badge}</span>}
        </div>
        <div style={{display: "flex", alignItems: "center", gap: 22, marginTop: 22, ...useIn(4)}}>
          <div style={{width: 96, height: 96, borderRadius: 24, background: "#ffd24a", color: "#1a1a1a", fontSize: 58, fontWeight: 900,
            display: "flex", alignItems: "center", justifyContent: "center"}}>{title[0].toUpperCase()}</div>
          <div>
            <div style={{fontSize: 62, fontWeight: 800, lineHeight: 1.1}}>{title}</div>
            {sub && <div style={{fontSize: 24, opacity: 0.7, marginTop: 6}}>{sub}</div>}
          </div>
        </div>
        <div style={{display: "flex", gap: 14, marginTop: 22}}>
          {stats.slice(0, 3).map((s, i) => (
            <div key={i} style={{flex: 1, padding: "12px 16px", borderRadius: 16, background: "rgba(255,255,255,0.06)", ...useIn(10 + i * 4)}}>
              <div style={{fontSize: 36, fontWeight: 800}}>{s.v}</div>
              <div style={{fontSize: 20, opacity: 0.6, fontFamily: MONO}}>{s.k}</div>
            </div>
          ))}
        </div>
        {cmd && <div style={{marginTop: 20, padding: "12px 18px", borderRadius: 14, background: "rgba(0,0,0,0.45)", fontFamily: MONO, fontSize: 25}}>{typed}</div>}
      </Glass>
    );
  };
