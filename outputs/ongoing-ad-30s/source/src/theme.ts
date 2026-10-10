import {Easing, interpolate} from "remotion";

export const FPS = 30;
// PLACEHOLDER palette from the brief (charcoal / ivory / brand red). Replace `red` with the real brand value.
export const C = {bg: "#15151a", panel: "#212127", ivory: "#f3eee4", red: "#d6342b", redDeep: "#9e2019",
  mute: "rgba(243,238,228,0.62)", line: "rgba(243,238,228,0.16)", ink: "#1a1a1e"};
export const FONT = 'Pretendard, "Noto Sans KR", "Noto Sans CJK KR", "Malgun Gothic", sans-serif';
export const ease = Easing.bezier(0.2, 0.8, 0.2, 1);
export const prog = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease});
export const sec = (s: number) => Math.round(s * FPS);
// Scene windows in seconds. make_audio.py cues are written against the same windows.
export const SCENES = [[0, 3], [3, 7], [7, 11], [11, 18], [18, 24], [24, 30]] as const;
