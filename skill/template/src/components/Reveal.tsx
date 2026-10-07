import type { CSSProperties, ReactNode } from "react";
import { DUR, progress, useSeconds } from "../lib/anim";

type RevealProps = {
  at: number;
  children: ReactNode;
  /** 进场位移（px），正数表示从下方/右方滑入。 */
  dx?: number;
  dy?: number;
  dur?: number;
  style?: CSSProperties;
};

/** 淡入 + 小位移 + 由虚到实的进场，对应参考片里卡片出现的方式。 */
export const Reveal = ({
  at,
  children,
  dx = 0,
  dy = 10,
  dur = DUR.enter,
  style,
}: RevealProps) => {
  const p = progress(useSeconds(), at, dur);
  return (
    <div
      style={{
        ...style,
        opacity: p,
        filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined,
        transform: `translate(${(1 - p) * dx}px, ${(1 - p) * dy}px)`,
      }}
    >
      {children}
    </div>
  );
};
