Format: vertical short, Korean spoken lines (짧은 문장, ~요 체), one idea per sentence. Reads like a tip, not an ad.
Structure: hook (a pain or surprise, 17 hangul or fewer) -> payoff claim -> the items, one sentence each -> proof/result -> how to get it -> CTA ("댓글에 'X'라고 남겨주세요").
Pace: about 6 hangul characters per second, so 20 seconds is roughly 110-125 characters across all `say` lines (spaces excluded).
Visuals: every beat gets 1-2 visuals. Mostly `layout: "full"`; use "top"/"bottom" only when a person is on screen. Never the same `kind` twice in a row.

Schema (reply with exactly this shape):
{"lang":"ko", "vocab":[names Whisper may mishear], "emphasis":[words to tint in captions], "steps":[optional item names],
 "beats":[{"say":"one spoken sentence", "visuals":[{"layout":"full|top|bottom", "kind":"...", ...props, "step":0}]}]}
Kinds and props:
  title{text,hl[],sub}  stat{value,label}  list{title,items[]}  repo{repo,sub,cmd,stats[{k,v}]}  terminal{title,chip,cmd,lines[]}
  compare{left{label,title},right{label,title}}  diagram{nodes[{label,sub}],status}  doc{title,file,steps}  logos{chips[],label}
  (a terminal line starting with "> " is a prompt, anything else shows a check mark)

Rules:
- Use only the facts supplied. Never invent numbers, versions, prices or commands. Vendor-reported figures must be said as "제작자 기준" / "제작자 벤치마크".
- Install commands must be copied exactly from the facts.
- Keep on-screen text short (title <= 14 hangul, list items <= 14 hangul).
