import type { CSSProperties } from "react";
import {
  DUR,
  FONT_MONO,
  FONT_SANS,
  colorAt,
  colorPulse,
  progress,
  useSeconds,
  useTheme,
} from "../lib/anim";
import type {
  ArrowBlock,
  BarBlock,
  Block,
  ButtonBlock,
  CardBlock,
  CellsBlock,
  ListBlock,
  MetaBlock,
  PillBlock,
  StatBlock,
  TextBlock,
} from "../types";
import { Reveal } from "./Reveal";

const BORDER = 3;
const RADIUS = 6;

const mono = (size: number, color: string): CSSProperties => ({
  fontFamily: FONT_MONO,
  fontWeight: 700,
  fontSize: size,
  letterSpacing: "0.04em",
  color,
  whiteSpace: "nowrap",
});

const fill: CSSProperties = { width: "100%", height: "100%", boxSizing: "border-box" };

const Card = ({ block }: { block: CardBlock }) => {
  const theme = useTheme();
  const t = useSeconds();
  const isDark = block.tone === "dark";
  const base =
    block.tone === "dark"
      ? theme.dark
      : block.tone === "accent"
        ? theme.accent
        : theme.surface;
  const background = colorPulse(t, base, theme.accent, block.pulses);
  const fg = isDark ? theme.onDark : theme.ink;
  const labelColor = isDark ? theme.onDarkAccent : theme.primary;

  return (
    <div
      style={{
        ...fill,
        background,
        border: `${BORDER}px solid ${isDark ? theme.dark : theme.line}`,
        borderRadius: RADIUS,
        padding: "0 34px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 14,
      }}
    >
      {block.label ? (
        <div style={mono(block.labelSize ?? 17, labelColor)}>{block.label}</div>
      ) : null}
      <div
        style={{
          fontFamily: FONT_SANS,
          fontWeight: 600,
          fontSize: block.titleSize ?? 48,
          lineHeight: 1.12,
          color: block.titleAccent ? theme.onDarkAccent : fg,
          // 不自动折行：换行位置由分镜里的 \n 决定，避免孤字
          whiteSpace: "pre",
        }}
      >
        {block.title}
      </div>
      {block.sub ? (
        <div
          style={{
            fontFamily: FONT_SANS,
            fontWeight: 500,
            fontSize: block.subSize ?? 25,
            color: fg,
            marginTop: 2,
          }}
        >
          {block.sub}
        </div>
      ) : null}
      {block.progress ? (
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          {block.progress.map((onAt, i) => (
            <div
              key={i}
              style={{
                width: 48,
                height: 10,
                background: colorAt(t, theme.onDarkMuted, theme.onDarkAccent, onAt),
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

const Cells = ({ block, at }: { block: CellsBlock; at: number }) => {
  const theme = useTheme();
  const t = useSeconds();
  return (
    <div
      style={{
        ...fill,
        display: "flex",
        border: `${BORDER}px solid ${theme.line}`,
        borderRadius: RADIUS,
        overflow: "hidden",
        background: theme.surface,
      }}
    >
      {block.items.map((item, i) => {
        const itemAt = item.at ?? at + 0.9 + i * DUR.stagger;
        const shown = progress(t, itemAt);
        return (
          <div
            key={item.label}
            style={{
              flex: 1,
              background: colorPulse(t, theme.surface, theme.accent, item.pulses),
              borderLeft: i === 0 ? "none" : `2px solid ${theme.line}`,
              padding: "0 24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 14,
            }}
          >
            <div style={{ opacity: shown, transform: `translateY(${(1 - shown) * 10}px)` }}>
              <div style={mono(16, theme.ink)}>{item.label}</div>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontWeight: 600,
                  fontSize: 37,
                  color: theme.ink,
                  marginTop: 12,
                }}
              >
                {item.text}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const List = ({ block, at }: { block: ListBlock; at: number }) => {
  const theme = useTheme();
  const tagColor = block.tagColor === "ink" ? theme.ink : theme.primary;
  return (
    <div style={{ ...fill, display: "flex", flexDirection: "column" }}>
      {block.items.map((item, i) => (
        <Reveal
          key={item.text}
          at={item.at ?? at + i * 0.09}
          dx={-18}
          dy={0}
          style={{ flex: 1, display: "flex" }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 26,
              padding: "0 22px",
              marginBottom: 6,
              background: theme.surface,
              borderBottom: `2px solid ${theme.line}`,
            }}
          >
            {item.tag ? <div style={mono(16, tagColor)}>{item.tag}</div> : null}
            <div
              style={{
                flex: 1,
                fontFamily: FONT_SANS,
                fontWeight: 600,
                fontSize: block.textSize ?? 29,
                color: theme.ink,
              }}
            >
              {item.text}
            </div>
            {item.status ? (
              <div style={mono(16, theme.primary)}>{item.status}</div>
            ) : null}
          </div>
        </Reveal>
      ))}
    </div>
  );
};

const Arrow = ({ block }: { block: ArrowBlock }) => {
  const theme = useTheme();
  return (
    <div
      style={{
        ...fill,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 22,
      }}
    >
      {block.top ? <div style={mono(16, theme.primary)}>{block.top}</div> : null}
      <svg width="32" height="26" viewBox="0 0 34 26" fill="none">
        <path
          d="M2 13h28M20 3l10 10-10 10"
          stroke={theme.primary}
          strokeWidth="6"
          strokeLinecap="square"
        />
      </svg>
      {block.bottom ? <div style={mono(16, theme.primary)}>{block.bottom}</div> : null}
    </div>
  );
};

const Stat = ({ block }: { block: StatBlock }) => {
  const theme = useTheme();
  return (
    <div
      style={{
        ...fill,
        background: theme.accent,
        border: `${BORDER}px solid ${theme.line}`,
        borderRadius: RADIUS,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 30px",
        gap: 4,
      }}
    >
      <div style={mono(17, theme.onAccent)}>{block.label}</div>
      <div
        style={{
          fontFamily: FONT_MONO,
          fontWeight: 800,
          fontSize: 134,
          lineHeight: 1,
          color: theme.onAccent,
        }}
      >
        {block.value}
      </div>
    </div>
  );
};

const Pill = ({ block }: { block: PillBlock }) => {
  const theme = useTheme();
  const t = useSeconds();
  return (
    <div
      style={{
        ...fill,
        background: colorPulse(t, theme.surface, theme.accent, block.pulses),
        border: `${BORDER}px solid ${theme.line}`,
        borderRadius: RADIUS,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 30px",
      }}
    >
      <div style={mono(17, theme.primary)}>{block.label}</div>
      <div
        style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 43, color: theme.ink }}
      >
        {block.text}
      </div>
    </div>
  );
};

const Meta = ({ block }: { block: MetaBlock }) => {
  const theme = useTheme();
  return (
    <div
      style={{
        ...fill,
        borderTop: `2px solid ${theme.line}`,
        borderBottom: `2px solid ${theme.line}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
      }}
    >
      <div style={mono(16, theme.inkSoft)}>{block.label}</div>
      <div
        style={{
          background: theme.tag,
          color: theme.onTag,
          fontFamily: FONT_SANS,
          fontWeight: 600,
          fontSize: 27,
          padding: "10px 18px",
          borderRadius: 4,
        }}
      >
        {block.tag}
      </div>
    </div>
  );
};

const Button = ({ block }: { block: ButtonBlock }) => {
  const theme = useTheme();
  const t = useSeconds();
  return (
    <div
      style={{
        ...fill,
        background: colorAt(t, theme.accent, theme.primary, block.activeAt),
        color: colorAt(t, theme.onAccent, theme.onPrimary, block.activeAt),
        border: `${BORDER}px solid ${theme.line}`,
        borderRadius: RADIUS,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_SANS,
        fontWeight: 600,
        fontSize: 50,
      }}
    >
      {block.text}
    </div>
  );
};

const Bar = ({ block }: { block: BarBlock }) => {
  const theme = useTheme();
  return (
    <div
      style={{
        ...fill,
        background: theme.primary,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
      }}
    >
      <div
        style={{
          fontFamily: FONT_SANS,
          fontWeight: 600,
          fontSize: 34,
          color: theme.onPrimary,
        }}
      >
        {block.left}
      </div>
      {block.right ? <div style={mono(17, theme.onPrimary)}>{block.right}</div> : null}
    </div>
  );
};

const Text = ({ block }: { block: TextBlock }) => {
  const theme = useTheme();
  return (
    <div
      style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 33, color: theme.inkSoft }}
    >
      {block.text}
    </div>
  );
};

const renderBlock = (block: Block, at: number) => {
  switch (block.kind) {
    case "card":
      return <Card block={block} />;
    case "cells":
      return <Cells block={block} at={at} />;
    case "list":
      return <List block={block} at={at} />;
    case "arrow":
      return <Arrow block={block} />;
    case "stat":
      return <Stat block={block} />;
    case "pill":
      return <Pill block={block} />;
    case "meta":
      return <Meta block={block} />;
    case "button":
      return <Button block={block} />;
    case "bar":
      return <Bar block={block} />;
    case "text":
      return <Text block={block} />;
  }
};

/** 一个内容块：负责占位宽度和进场，内部样式交给各自的组件。 */
export const BlockView = ({ block, at }: { block: Block; at: number }) => {
  const sizing: CSSProperties =
    block.width !== undefined
      ? { width: block.width, flex: "none" }
      : { flex: block.flex ?? 1, minWidth: 0 };
  // 列表自己逐行进场，外层不再整体淡入。
  if (block.kind === "list") {
    return <div style={sizing}>{renderBlock(block, at)}</div>;
  }
  return (
    <Reveal at={at} style={sizing}>
      {renderBlock(block, at)}
    </Reveal>
  );
};
