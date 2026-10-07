# 分镜字段与版式容量

分镜是一个 JSON 文件，类型定义在 `template/src/types.ts`。所有时间都是从视频开头算起的秒数。

## 顶层

| 字段 | 说明 |
|---|---|
| `fps` `width` `height` | 固定 `30` `1920` `1080` |
| `duration` | 总时长（秒），等于口播视频时长 |
| `theme` | 配色 id，见 `themes.md` |
| `brand` | 五处固定文字，见下 |
| `talk` | `src` 是 `public/` 下的文件名（建工程后是 `talk.mp4`）；`objectPosition` 调人脸取景，如 `"50% 30%"`；`volume` 默认 1 |
| `captions` | 字幕数组，`{start, end, text}` |
| `scenes` | 页面数组 |

`brand` 五处文字（英文用等宽大写更像参考片）：

| 字段 | 位置 | 参考片写法 |
|---|---|---|
| `topLeft` | 页眉左 | `SKY / AI TWIN SYSTEM` |
| `topRight` | 页眉右 | `PERSONAL IP · 2026` |
| `talkLabel` | 人物卡上方 | `SKY 陈天 · AI 分身` |
| `talkBadge` | 人物卡左下角标 | `AI TWIN / ONLINE` |
| `voiceLabel` | 字幕条左侧 | `VOICE /` |

## 页面 scene

| 字段 | 说明 |
|---|---|
| `start` `end` | 进场和退场时刻。相邻两页必须首尾相接：上一页的 `end` 等于下一页的 `start` |
| `transition` | 进场方式。不填是左推；`"wipe"` 是双色块全屏擦除 |
| `eyebrow` | 标题上方的小标签，`{en, zh}`，显示为 `EN / 中文` |
| `title` | 字符串数组，一个元素一行，最多两行。`**文字**` 显示为主色，`==文字==` 加强调色底 |
| `titleSize` | `"xl"`（97px，适合两行短句）或 `"lg"`（74px，默认，适合一行长句） |
| `watermark` | 右下角淡色大字，全大写英文，不超过 9 个字符，如 `INPUT`、`TOP 05` |
| `rows` | 正文，从上到下的若干行 |

每行 `row`：`items` 是从左到右的内容块；`height` 是行高（px）；`gap` 是块间距；`mt` 是与上一行的间距（第一行默认 28，其余默认 24）。

## 版式容量

信息区宽 1220px。一个汉字算 1，半角字符算 0.56，空格算 0.3。校验脚本按这些上限报错。

| 位置 | 上限 |
|---|---|
| 标题一行，`xl` | 12.5 |
| 标题一行，`lg` | 16.4 |
| 字幕一条 | 37 |
| 水印 | 9 个字符 |

卡片标题不自动换行，按卡片宽度自己断行：两张等宽卡片并排时，每行约 9 个汉字（字号 55）；三段式「卡片 → 箭头 → 卡片」里每张卡约 8 个汉字（字号 47）。

## 内容块

每个块都可以带 `at`（出现时刻）、`flex`（占比）或 `width`（固定宽度 px）。不填 `at` 时按出现顺序从 `start + 0.72` 秒起每隔 0.17 秒出现一个。

| kind | 用途 | 必填 | 可选 |
|---|---|---|---|
| `card` | 卡片：小标签 + 标题 + 副文 | `tone`（`dark` / `light` / `accent`）、`title` | `label`、`sub`、`titleSize`（默认 48）、`labelSize`（默认 17）、`subSize`（默认 25）、`titleAccent`（深色卡上标题用强调色）、`pulses`、`progress` |
| `cells` | 连体格子，适合「A、B、C」三要素 | `items: [{label, text}]` | 每项的 `at`、`pulses` |
| `list` | 列表，逐行出现 | `items: [{text}]` | 每项的 `tag`、`status`、`at`；块上的 `textSize`、`tagColor`（`primary` / `ink`） |
| `arrow` | 箭头，放在两个块之间 | 无 | `top`、`bottom`（箭头上下的小字）、`width` |
| `stat` | 强调色大数字 | `label`、`value` | 建议 `width: 248` |
| `pill` | 横条：左小标签，右文字 | `label`、`text` | `pulses` |
| `meta` | 上下细线的说明行，右侧一个色块标签 | `label`、`tag` | |
| `button` | 按钮，初始强调色，`activeAt` 后变主色 | `text` | `activeAt` |
| `bar` | 通栏主色条，用于片尾关注引导 | `left` | `right` |
| `text` | 一行说明文字 | `text` | |

高亮写法：`pulses` 是 `[亮起, 熄灭]` 的数组，熄灭省略表示亮到这页结束。

```json
"pulses": [[4.08, 5.15], [5.5]]
```

`progress` 只用于 `card`，是一排进度格各自亮起的时刻，例如 `[12.35, 12.4, 12.45, 17.08, 21.33]` 表示五格，后两格在说到对应内容时才亮。

## 常用行高

| 页面 | 行高 |
|---|---|
| 深色卡 + 三连格 | 194 |
| 列表 + 箭头 + 卡片 | 261 |
| 大数字 + 五行列表 | 278 |
| 两张大卡片 | 298 |
| 两个横条 | 123，下面的说明行 95 |
| 卡片 → 箭头 → 卡片 | 285 |
| 三个按钮 | 129，下面的通栏 83 |
