import { OffthreadVideo, staticFile } from "remotion";
import {
  DUR,
  FONT_MONO,
  FONT_SANS,
  progress,
  useSeconds,
  useTheme,
} from "../lib/anim";
import type { Brand, Caption, Storyboard } from "../types";

// 固定外壳的坐标（1080p 基准，按参考片实测 ×1.5）
const MARGIN_X = 64;
const TALK = { left: 64, top: 322, width: 360, height: 640, shadow: 14 };
const VOICE = { left: 500, top: 940, height: 94 };

const monoLabel = (color: string, size = 16.5) => ({
  fontFamily: FONT_MONO,
  fontWeight: 700,
  fontSize: size,
  letterSpacing: "0.05em",
  color,
  whiteSpace: "nowrap" as const,
});

export const Background = () => {
  const theme = useTheme();
  return (
    <div style={{ position: "absolute", inset: 0, background: theme.bg }}>
      {/* 左上角淡网格，往右下渐隐 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.035,
          backgroundImage: `linear-gradient(${theme.grid} 1.5px, transparent 1.5px), linear-gradient(90deg, ${theme.grid} 1.5px, transparent 1.5px)`,
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 60% 70% at 12% 18%, #000 0%, transparent 100%)",
        }}
      />
    </div>
  );
};

export const TopBar = ({ brand }: { brand: Brand }) => {
  const theme = useTheme();
  const shown = progress(useSeconds(), 0, 0.5);
  return (
    <div style={{ position: "absolute", left: MARGIN_X, right: MARGIN_X, top: 42, opacity: shown }}>
      <div
        style={{
          height: 2,
          background: theme.line,
          transform: `scaleX(${shown})`,
          transformOrigin: "left",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: theme.accent,
              border: `2px solid ${theme.line}`,
            }}
          />
          <div style={monoLabel(theme.ink)}>{brand.topLeft}</div>
        </div>
        <div style={monoLabel(theme.ink)}>{brand.topRight}</div>
      </div>
    </div>
  );
};

export const TalkCard = ({
  talk,
  brand,
}: {
  talk: Storyboard["talk"];
  brand: Brand;
}) => {
  const theme = useTheme();
  const shown = progress(useSeconds(), 0.45, 0.3);
  return (
    <div style={{ opacity: shown }}>
      <div
        style={{
          position: "absolute",
          left: TALK.left,
          top: TALK.top - 37,
          width: TALK.width,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={monoLabel(theme.ink, 18)}>{brand.talkLabel}</div>
        <div style={{ flex: 1, height: 2, background: theme.line }} />
      </div>
      {/* 错位的强调色底边 */}
      <div
        style={{
          position: "absolute",
          left: TALK.left + TALK.shadow,
          top: TALK.top + TALK.shadow,
          width: TALK.width,
          height: TALK.height,
          background: theme.accent,
          borderRadius: 8,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: TALK.left,
          top: TALK.top,
          width: TALK.width,
          height: TALK.height,
          boxSizing: "border-box",
          border: `3px solid ${theme.line}`,
          borderRadius: 8,
          overflow: "hidden",
          background: theme.dark,
        }}
      >
        {talk.src ? (
          <OffthreadVideo
            src={staticFile(talk.src)}
            volume={talk.volume ?? 1}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: talk.objectPosition ?? "50% 50%",
            }}
          />
        ) : (
          // 口播素材还没到位时的占位，方便先看版式和配色
          <div
            style={{
              ...monoLabel(theme.onDarkMuted, 18),
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            TALK VIDEO
          </div>
        )}
        <div
          style={{
            position: "absolute",
            left: 14,
            bottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "7px 12px",
            background: "rgba(12, 18, 14, 0.78)",
            borderRadius: 3,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: theme.accent,
            }}
          />
          <div style={monoLabel("#FFFFFF", 15)}>{brand.talkBadge}</div>
        </div>
      </div>
    </div>
  );
};

export const VoiceBar = ({
  captions,
  brand,
}: {
  captions: Caption[];
  brand: Brand;
}) => {
  const theme = useTheme();
  const t = useSeconds();
  const current = captions.find((c) => t >= c.start && t < c.end);
  const shown = progress(t, 0.3, 0.5);
  return (
    <div
      style={{
        position: "absolute",
        left: VOICE.left,
        right: MARGIN_X,
        top: VOICE.top,
        height: VOICE.height,
        boxSizing: "border-box",
        borderTop: `2px solid ${theme.line}`,
        borderBottom: `2px solid ${theme.line}`,
        // 自带底色：全屏擦除换页时字幕条不会被色块吞掉
        background: theme.bg,
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "0 28px",
        opacity: shown,
      }}
    >
      <div style={monoLabel(theme.primary, 16)}>{brand.voiceLabel}</div>
      {current ? (
        <div
          style={{
            fontFamily: FONT_SANS,
            fontWeight: 600,
            fontSize: 31,
            color: theme.ink,
            whiteSpace: "nowrap",
            opacity:
              progress(t, current.start, DUR.caption) *
              (1 - progress(t, current.end - DUR.caption, DUR.caption)),
          }}
        >
          {current.text}
        </div>
      ) : null}
    </div>
  );
};
