import { Easing, interpolate } from "remotion";
import {
  BODY_DELAY,
  DUR,
  FONT_MONO,
  FONT_SANS,
  TITLE_DELAY,
  progress,
  useSeconds,
  useTheme,
} from "../lib/anim";
import type { Scene } from "../types";
import { BlockView } from "./blocks";
import { Reveal } from "./Reveal";

// 右侧信息区（1080p 基准，按参考片实测 ×1.5）。
// CLIP 是裁切窗口：页面左推出画时在人物卡右侧被裁掉，不会压到人物。
const CLIP = { left: 500, top: 0, width: 1420, height: 938 };
const PAGE = { left: 64, top: 96, width: 1220, height: 828 };
const TITLE_SIZE = { xl: 97, lg: 74 };
const PUSH_OUT_X = -1500;
const PUSH_IN_X = 640;

const MARKUP = /(\*\*.+?\*\*|==.+?==)/;

export type Leave = "push" | "wipe" | "none";

type Motion = { visible: boolean; x: number; opacity: number };

/** 一页在 t 时刻的整体位移与可见性。 */
const pageMotion = (t: number, scene: Scene, leave: Leave): Motion => {
  const enter = scene.transition ?? "push";
  const shownFrom =
    scene.start + (enter === "wipe" ? DUR.wipeCover : DUR.pushInDelay);
  const hiddenFrom =
    scene.end +
    (leave === "wipe" ? DUR.wipeCover : leave === "push" ? DUR.pushOut : 0);
  if (t < shownFrom || t >= hiddenFrom) {
    return { visible: false, x: 0, opacity: 0 };
  }
  const pIn = enter === "wipe" ? 1 : progress(t, shownFrom, DUR.pushIn);
  const pOut =
    leave === "push"
      ? interpolate(t, [scene.end, scene.end + DUR.pushOut], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.in(Easing.cubic),
        })
      : 0;
  return {
    visible: true,
    x: (1 - pIn) * PUSH_IN_X + pOut * PUSH_OUT_X,
    opacity: Math.min(1, pIn * 2.5),
  };
};

const TitleLine = ({ line }: { line: string }) => {
  const theme = useTheme();
  return (
    <div>
      {line.split(MARKUP).map((part, i) => {
        if (part.startsWith("**")) {
          return (
            <span key={i} style={{ color: theme.primary }}>
              {part.slice(2, -2)}
            </span>
          );
        }
        if (part.startsWith("==")) {
          return (
            <span
              key={i}
              style={{
                color: theme.onAccent,
                background: theme.accent,
                padding: "0 12px",
                marginLeft: 4,
              }}
            >
              {part.slice(2, -2)}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
};

const Watermark = ({ scene }: { scene: Scene }) => {
  const theme = useTheme();
  // 页面停留期间缓慢左移，画面不至于完全静止。
  const drift = interpolate(useSeconds(), [scene.start, scene.end], [0, -24]);
  return (
    <div
      style={{
        position: "absolute",
        right: -64,
        top: 786,
        fontFamily: FONT_MONO,
        fontWeight: 800,
        fontSize: 150,
        lineHeight: 1,
        letterSpacing: "-0.02em",
        wordSpacing: "0.2em",
        whiteSpace: "pre",
        color: theme.watermark,
        transform: `translateX(${drift}px)`,
      }}
    >
      {scene.watermark}
    </div>
  );
};

export const SceneView = ({ scene, leave }: { scene: Scene; leave: Leave }) => {
  const theme = useTheme();
  const motion = pageMotion(useSeconds(), scene, leave);
  if (!motion.visible) {
    return null;
  }
  const isWipe = scene.transition === "wipe";
  // 擦除进场时标题已经在色块底下就位，不再单独淡入。
  const titleAt = scene.start + (isWipe ? 0 : TITLE_DELAY);
  const bodyStart = scene.start + BODY_DELAY;
  // 行内未指定时刻的块，按出现顺序错开进场。
  let order = 0;

  return (
    <div style={{ position: "absolute", ...CLIP, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: motion.opacity,
          transform: `translateX(${motion.x}px)`,
        }}
      >
        <Watermark scene={scene} />
        <div
          style={{
            position: "absolute",
            ...PAGE,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 8, background: theme.primary }} />
            <div
              style={{
                fontFamily: FONT_MONO,
                fontWeight: 700,
                fontSize: 19,
                letterSpacing: "0.04em",
                color: theme.primary,
              }}
            >
              {scene.eyebrow.en} /{" "}
              <span style={{ fontFamily: FONT_SANS, fontWeight: 500 }}>
                {scene.eyebrow.zh}
              </span>
            </div>
          </div>

          <Reveal at={titleAt} dy={0} dur={0.2}>
            <div
              style={{
                fontFamily: FONT_SANS,
                fontWeight: 600,
                fontSize: TITLE_SIZE[scene.titleSize ?? "lg"],
                lineHeight: 1.12,
                letterSpacing: scene.titleSize === "xl" ? "0.01em" : 0,
                color: theme.ink,
                marginTop: 22,
                whiteSpace: "nowrap",
              }}
            >
              {scene.title.map((line) => (
                <TitleLine key={line} line={line} />
              ))}
            </div>
          </Reveal>

          {scene.rows.map((row, r) => (
            <div
              key={r}
              style={{
                display: "flex",
                gap: row.gap ?? 0,
                height: row.height,
                marginTop: row.mt ?? (r === 0 ? 28 : 24),
              }}
            >
              {row.items.map((block, b) => {
                const at = block.at ?? bodyStart + order * DUR.stagger;
                order += 1;
                return <BlockView key={b} block={block} at={at} />;
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/** 双色块全屏擦除：深色先扫过，强调色紧跟盖满，再从左向右撤走露出新页。 */
export const Wipe = ({ at }: { at: number }) => {
  const theme = useTheme();
  const t = useSeconds();
  if (t < at || t > at + DUR.wipeClear + 0.05) {
    return null;
  }
  const sweep = (from: number, to: number, a: number, b: number) =>
    interpolate(t, [from, to], [a, b], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  const darkX = sweep(at, at + 0.16, -100, 0);
  const accentIn = sweep(at + 0.06, at + 0.21, -100, 0);
  const accentOut = sweep(at + 0.3, at + DUR.wipeClear, 0, 100);
  const panel = { position: "absolute" as const, inset: 0 };
  return (
    <>
      <div
        style={{
          ...panel,
          background: theme.id === "violetNight" ? theme.surface : theme.dark,
          transform: `translateX(${darkX}%)`,
          opacity: accentIn >= 0 ? 0 : 1,
        }}
      />
      <div
        style={{
          ...panel,
          background: theme.accent,
          transform: `translateX(${accentIn + accentOut}%)`,
        }}
      />
    </>
  );
};
