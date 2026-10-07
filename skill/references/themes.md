# 配色

定义在 `template/src/themes.ts`。对比图见 `assets/palettes.jpg`，也可以用任意分镜现场出一张：

```bash
node scripts/render.mjs palettes <工程目录>/app <分镜.json> [--at 秒,秒,秒]
```

| id | 名称 | 底色 | 主色 | 强调色 | 深色卡 | 适合 |
|---|---|---|---|---|---|---|
| `lime` | 原片荧光绿 | `#F3F6F0` | `#265BD5` | `#BDF34B` | `#173323` | 与参考片一致 |
| `lavender` | 淡紫科技 | `#F4F0FF` | `#5B3DA8` | `#A78BFA` | `#2B1F52` | 用户的品牌风格，默认用这套 |
| `violetNight` | 深紫夜 | `#15102A` | `#BDD6FF` | `#A78BFA` | `#F4F0FF` | 深色版，夜间感、发布会感 |
| `navyMint` | 海军青 | `#F1F5F9` | `#1D4ED8` | `#5EEAD4` | `#0B2545` | 咨询、企业服务，冷静克制 |
| `warmAmber` | 暖米橙 | `#F7F3EA` | `#C2410C` | `#FFC83D` | `#2A2118` | 讲故事、线下活动，更有人味 |

`lavender` 取自用户的《PPT淡紫科技风格预设》v1.1：背景 `#F4F0FF`、标题 `#5B3DA8`、强调 `#A78BFA`、冰蓝 `#BDD6FF`、正文 `#302A42`。

## 每个颜色管什么

| 字段 | 用在哪 |
|---|---|
| `bg` `grid` | 画布底色、左上角淡网格 |
| `ink` `inkSoft` `line` | 标题和正文、次要文字、描边和分隔线 |
| `primary` `onPrimary` | 小标签、标题里的 `**主色**`、箭头、按钮激活态、通栏 |
| `accent` `onAccent` | 高亮底、大数字块、人物卡的错位底边、擦除转场的第二块色 |
| `dark` `onDark` `onDarkAccent` `onDarkMuted` | 深色卡片的底、字、小标签、未点亮的进度格 |
| `surface` | 浅色卡片和列表行的底 |
| `tag` `onTag` | 说明行右侧的色块标签 |
| `watermark` | 右下角淡色大字，比底色略深一点即可 |

## 新增一套

在 `themes.ts` 的 `themes` 里加一项，然后用 `palettes` 出图检查三处对比度：强调色底上的字（`onAccent`）、深色卡上的小标签（`onDarkAccent`）、水印不能抢正文。验证过后同步回 Skill 的 `template/`。
