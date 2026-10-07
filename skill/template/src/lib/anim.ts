import { createContext, useContext } from "react";
import {
  Easing,
  interpolate,
  interpolateColors,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Theme } from "../themes";
import type { Pulse } from "../types";

export const FONT_SANS =
  '"Helvetica Neue", "PingFang SC", "Hiragino Sans GB", Arial, sans-serif';
export const FONT_MONO =
  '"JetBrains Mono", "JetBrainsMono Nerd Font", "SF Mono", Menlo, monospace';

// 动效时长（秒）。参考片里小元素出入约 0.2–0.35 秒，换页约 0.25 秒。
export const DUR = {
  enter: 0.26,
  /** 旧页左推出画 */
  pushOut: 0.25,
  /** 新页晚于旧页起步的时间，以及新页滑入时长 */
  pushInDelay: 0.17,
  pushIn: 0.32,
  /** 擦除色块盖满全屏所需时间，换页发生在这一刻 */
  wipeCover: 0.25,
  wipeClear: 0.47,
  color: 0.18,
  colorOff: 0.3,
  caption: 0.12,
  stagger: 0.17,
} as const;

// 页内元素相对 scene.start 的默认时刻
export const TITLE_DELAY = 0.27;
export const BODY_DELAY = 0.72;

const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);

export const ThemeContext = createContext<Theme | null>(null);

export const useTheme = (): Theme => {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error("useTheme 必须在 ThemeContext 内使用");
  }
  return theme;
};

/** 当前时间（秒），整条视频统一用秒对齐口播。 */
export const useSeconds = (): number => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

/** 0→1 的进场进度。 */
export const progress = (
  t: number,
  at: number,
  dur: number = DUR.enter,
): number =>
  interpolate(t, [at, at + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });

/** t 时刻的高亮强度（0–1），多次高亮取最强的一次。 */
export const pulseLevel = (t: number, pulses: Pulse[] | undefined): number =>
  (pulses ?? []).reduce((level, [onAt, offAt]) => {
    const on = progress(t, onAt, DUR.color);
    const off = offAt === undefined ? 0 : progress(t, offAt, DUR.colorOff);
    return Math.max(level, on * (1 - off));
  }, 0);

/** 按高亮强度在 from 和 to 之间取色。 */
export const colorPulse = (
  t: number,
  from: string,
  to: string,
  pulses: Pulse[] | undefined,
): string => interpolateColors(pulseLevel(t, pulses), [0, 1], [from, to]);

/** onAt 之后从 from 渐变到 to 并保持。 */
export const colorAt = (
  t: number,
  from: string,
  to: string,
  onAt?: number,
): string => colorPulse(t, from, to, onAt === undefined ? undefined : [[onAt]]);
