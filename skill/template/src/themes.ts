export type Theme = {
  id: string;
  name: string;
  /** 画布底色与网格线 */
  bg: string;
  grid: string;
  /** 正文、标题、描边 */
  ink: string;
  inkSoft: string;
  line: string;
  /** 主色：小标签、标题第二行、箭头、按钮激活态 */
  primary: string;
  onPrimary: string;
  /** 强调色：高亮底、数字块、人物卡错位底边 */
  accent: string;
  accentSoft: string;
  onAccent: string;
  /** 深色卡片 */
  dark: string;
  onDark: string;
  onDarkAccent: string;
  onDarkMuted: string;
  /** 浅色卡片与列表行 */
  surface: string;
  /** 小标签块 */
  tag: string;
  onTag: string;
  watermark: string;
};

export const themes: Record<string, Theme> = {
  // 参考片原配色：米白底 + 墨绿 + 荧光绿 + 钴蓝
  lime: {
    id: "lime",
    name: "原片荧光绿",
    bg: "#F3F6F0",
    grid: "#0F2015",
    ink: "#0F2015",
    inkSoft: "#66756B",
    line: "#14241A",
    primary: "#265BD5",
    onPrimary: "#FFFFFF",
    accent: "#BDF34B",
    accentSoft: "#D2F59A",
    onAccent: "#0F2015",
    dark: "#173323",
    onDark: "#FFFFFF",
    onDarkAccent: "#C5F748",
    onDarkMuted: "#5C7466",
    surface: "#E7EEE5",
    tag: "#FDB145",
    onTag: "#2A1A00",
    watermark: "#E5EBE3",
  },
  // 淡紫科技风预设 v1.1：背景 #F4F0FF、标题 #5B3DA8、强调 #A78BFA、冰蓝 #BDD6FF、正文 #302A42
  lavender: {
    id: "lavender",
    name: "淡紫科技",
    bg: "#F4F0FF",
    grid: "#5B3DA8",
    ink: "#241C3D",
    inkSoft: "#6E668A",
    line: "#302A42",
    primary: "#5B3DA8",
    onPrimary: "#FFFFFF",
    accent: "#A78BFA",
    accentSoft: "#D6C8FF",
    onAccent: "#1B1433",
    dark: "#2B1F52",
    onDark: "#FFFFFF",
    onDarkAccent: "#CDBBFF",
    onDarkMuted: "#5D4F8C",
    surface: "#E8E0FB",
    tag: "#BDD6FF",
    onTag: "#1D2B4F",
    watermark: "#E8E1F8",
  },
  // 淡紫科技的深色版：夜紫底 + 亮紫 + 冰蓝
  violetNight: {
    id: "violetNight",
    name: "深紫夜",
    bg: "#15102A",
    grid: "#A78BFA",
    ink: "#F4F0FF",
    inkSoft: "#A79DC7",
    line: "#6A5CA0",
    primary: "#BDD6FF",
    onPrimary: "#15102A",
    accent: "#A78BFA",
    accentSoft: "#5B3DA8",
    onAccent: "#15102A",
    dark: "#F4F0FF",
    onDark: "#241C3D",
    onDarkAccent: "#5B3DA8",
    onDarkMuted: "#C9BEEA",
    surface: "#231B42",
    tag: "#FFD166",
    onTag: "#2A1A00",
    watermark: "#1F1839",
  },
  // 海军蓝 + 薄荷青：偏咨询、企业服务的冷静感
  navyMint: {
    id: "navyMint",
    name: "海军青",
    bg: "#F1F5F9",
    grid: "#0B1B33",
    ink: "#0B1B33",
    inkSoft: "#5E6B7E",
    line: "#12233F",
    primary: "#1D4ED8",
    onPrimary: "#FFFFFF",
    accent: "#5EEAD4",
    accentSoft: "#B6F4EA",
    onAccent: "#06231F",
    dark: "#0B2545",
    onDark: "#FFFFFF",
    onDarkAccent: "#5EEAD4",
    onDarkMuted: "#46618A",
    surface: "#E2E9F2",
    tag: "#FFB86B",
    onTag: "#2A1A00",
    watermark: "#E3E9F1",
  },
  // 暖米底 + 焦橙 + 琥珀黄：更有人味，适合讲故事和线下活动
  warmAmber: {
    id: "warmAmber",
    name: "暖米橙",
    bg: "#F7F3EA",
    grid: "#221A12",
    ink: "#221A12",
    inkSoft: "#7A6E60",
    line: "#2A2118",
    primary: "#C2410C",
    onPrimary: "#FFFFFF",
    accent: "#FFC83D",
    accentSoft: "#FFE39A",
    onAccent: "#221A12",
    dark: "#2A2118",
    onDark: "#FFFFFF",
    onDarkAccent: "#FFC83D",
    onDarkMuted: "#6B5B48",
    surface: "#EEE6D6",
    tag: "#2F7D6B",
    onTag: "#FFFFFF",
    watermark: "#ECE5D5",
  },
};

export const getTheme = (id: string | undefined): Theme => {
  const theme = id ? themes[id] : undefined;
  if (!theme) {
    throw new Error(
      `未知配色 "${id}"，可用：${Object.keys(themes).join(" / ")}`,
    );
  }
  return theme;
};
