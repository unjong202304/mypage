import React from "react";
import {Glass, MONO, useIn, useTyped} from "./kit";

// macOS-style terminal window: dots, title, command chip, a typed prompt, then result lines.
export const TerminalWin: React.FC<{title: string; chip?: string; cmd?: string; lines: string[]}> = ({title, chip, cmd, lines}) => {
  const typed = useTyped(cmd ? `> ${cmd}` : "", 6);
  return (
    <Glass style={{position: "absolute", left: 36, right: 36, top: 56, padding: 26, height: 380, background: "rgba(0,0,0,0.42)"}}>
      <div style={{display: "flex", alignItems: "center", gap: 10, fontFamily: MONO, fontSize: 22, opacity: 0.85}}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => <i key={c} style={{width: 14, height: 14, borderRadius: 7, background: c}} />)}
        <span style={{marginLeft: 10}}>{title}</span>
        {chip && <span style={{marginLeft: "auto", padding: "2px 14px", borderRadius: 10, background: "rgba(40,200,64,0.25)"}}>{chip}</span>}
      </div>
      <div style={{marginTop: 28, fontFamily: MONO, fontSize: 28, lineHeight: 1.7}}>
        {cmd && <div>{typed}</div>}
        {lines.map((l, i) => <div key={i} style={{opacity: 0.85, ...useIn(26 + i * 8)}}><span style={{color: "#28c840"}}>✓</span> {l}</div>)}
      </div>
    </Glass>
  );
};
