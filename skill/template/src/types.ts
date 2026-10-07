// 分镜数据结构。所有时间都是相对整条视频开头的秒数，直接从转写时间戳里抄。

export type Caption = { start: number; end: number; text: string };

/** 说到它时高亮一次：[亮起, 熄灭]。熄灭省略表示一直亮到这页结束。 */
export type Pulse = [number, number?];

type Timed = {
  /** 出现时刻（秒）。不填则按所在页的默认节奏依次出现。 */
  at?: number;
  /** 行内占比，和 CSS flex 一致。 */
  flex?: number;
  /** 固定宽度（px，1080p 基准），填了就不参与 flex。 */
  width?: number;
};

export type CardBlock = Timed & {
  kind: "card";
  tone: "dark" | "light" | "accent";
  label?: string;
  /** 用 \n 手动换行。 */
  title: string;
  sub?: string;
  titleSize?: number;
  labelSize?: number;
  subSize?: number;
  /** 深色卡片上把标题染成强调色。 */
  titleAccent?: boolean;
  pulses?: Pulse[];
  /** 进度格，每个数字是该格亮起的时刻。 */
  progress?: number[];
};

export type CellsBlock = Timed & {
  kind: "cells";
  items: { label: string; text: string; at?: number; pulses?: Pulse[] }[];
};

export type ListBlock = Timed & {
  kind: "list";
  textSize?: number;
  tagColor?: "primary" | "ink";
  items: { tag?: string; text: string; status?: string; at?: number }[];
};

export type ArrowBlock = Timed & { kind: "arrow"; top?: string; bottom?: string };

export type StatBlock = Timed & { kind: "stat"; label: string; value: string };

export type PillBlock = Timed & {
  kind: "pill";
  label: string;
  text: string;
  pulses?: Pulse[];
};

export type MetaBlock = Timed & { kind: "meta"; label: string; tag: string };

export type ButtonBlock = Timed & { kind: "button"; text: string; activeAt?: number };

export type BarBlock = Timed & { kind: "bar"; left: string; right?: string };

export type TextBlock = Timed & { kind: "text"; text: string };

export type Block =
  | CardBlock
  | CellsBlock
  | ListBlock
  | ArrowBlock
  | StatBlock
  | PillBlock
  | MetaBlock
  | ButtonBlock
  | BarBlock
  | TextBlock;

export type Row = {
  /** 行高（px）。不填由内容撑开。 */
  height?: number;
  gap?: number;
  /** 与上一行的间距。 */
  mt?: number;
  items: Block[];
};

export type Scene = {
  /** 这一页开始进场的时刻；上一页同时开始退场。 */
  start: number;
  /** 这一页开始退场的时刻，等于下一页的 start。 */
  end: number;
  /** 进场方式：push 是整页左推（默认），wipe 是双色块全屏擦除，用于大段落切换。 */
  transition?: "push" | "wipe";
  eyebrow: { en: string; zh: string };
  /** 每个元素一行。**蓝字** 用主色，==高亮== 用强调色底。 */
  title: string[];
  titleSize?: "xl" | "lg";
  /** 右下角淡色大字，建议全大写英文、不超过 8 个字符。 */
  watermark: string;
  rows: Row[];
};

export type Brand = {
  topLeft: string;
  topRight: string;
  talkLabel: string;
  talkBadge: string;
  voiceLabel: string;
};

export type Storyboard = {
  fps: number;
  width: number;
  height: number;
  /** 总时长（秒），一般等于口播视频时长。 */
  duration: number;
  theme: string;
  brand: Brand;
  talk: {
    /** public/ 下的口播视频文件名，声音直接用它的音轨。 */
    src: string;
    /** 人脸在卡片里的取景位置，等同 CSS object-position。 */
    objectPosition?: string;
    volume?: number;
  };
  captions: Caption[];
  scenes: Scene[];
};

export type ExplainerProps = {
  storyboard: Storyboard;
  /** 覆盖分镜里的 theme，方便同一份分镜对比多套配色。 */
  theme?: string;
};
