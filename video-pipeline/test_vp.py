from vp import chunk, plan_keep, remap

W = [{"w": w, "s": s, "e": e} for w, s, e in
     [("클로드가", 0.0, 0.5), ("방금", 0.55, 0.9), ("웹", 1.0, 1.2), ("디자이너들을", 1.25, 2.0), ("끝장냈어요", 3.0, 3.6)]]

keep = plan_keep(W, 10)
assert len(keep) == 2 and keep[0][0] == 0 and abs(keep[1][0] - 2.92) < 1e-6, keep  # 1s pause removed, 0.08 pad

edit, total = remap(W, keep)
assert edit[-1]["s"] < 2.2 and abs(total - (2.08 + 0.76)) < 0.01, (edit, total)  # last word moved up by the cut

c = chunk(edit, ["끝장"])
assert [x["text"] for x in c] == ["클로드가 방금 웹", "디자이너들을 끝장냈어요"], c
assert c[1]["hl"] == [1], c  # emphasis lands on the right word
print("ok")
