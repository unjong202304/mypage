import {Easing, interpolate} from "remotion";

export const FPS = 30;
// Brand values from the asset pack's BRAND_GUIDE.md: body charcoal #191A1C, ruby #9E002C (buttons use #bd1e51 -> #9E002C),
// inquiry-sheet ivory #faf9f6. The guide warns no single value is "the" brand colour; ruby here is the button ramp.
export const C = {bg: "#191a1c", panel: "#232427", ivory: "#faf9f6", red: "#bd1e51", redDeep: "#9e002c",
  mute: "rgba(250,249,246,0.62)", line: "rgba(250,249,246,0.16)", ink: "#191a1c"};
export const FONT = 'Pretendard, "Noto Sans KR", "Noto Sans CJK KR", "Malgun Gothic", sans-serif';
export const ease = Easing.bezier(0.2, 0.8, 0.2, 1);
export const prog = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease});
import {staticFile} from "remotion";
export const A = (name: string) => staticFile("assets/" + name);
export const sec = (s: number) => Math.round(s * FPS);
// Scene windows in seconds. make_audio.py cues are written against the same windows.
export const SCENES = [[0, 3], [3, 7], [7, 11], [11, 18], [18, 24], [24, 30]] as const;
