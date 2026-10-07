# 七种页面

每种页面对应一类口播句子。先判断这句话在讲什么，再选页面，不要按版式好不好看来选。完整可运行的写法见 `template/src/storyboards/example.json`，下面按它的页序说明。

| # | 这段口播在讲 | 页面 | 示例页 |
|---|---|---|---|
| 1 | 亮身份、抛结论，并点出几个组成要素 | 深色主体卡 + 三连格逐格高亮 | 第 1 页 |
| 2 | 多个来源或输入汇到一个东西里 | 列表 → 箭头 → 深色卡（带进度格） | 第 2 页 |
| 3 | 一个数字加它的清单 | 强调色大数字 + 逐行列表 | 第 3 页 |
| 4 | 并列的两件事或两个方向 | 两张大卡片，说到第二张时高亮 | 第 4 页 |
| 5 | 一个概念的两个关键词，或带出处 | 两个横条 + 说明行 | 第 5 页 |
| 6 | 分工、转化、前后对照 | 浅色卡 → 箭头 → 深色卡 | 第 6 页 |
| 7 | 结尾号召关注 | 说明文字 + 三个按钮 + 通栏 | 第 7 页 |

没有合适的页面时，优先把内容改写成能放进这七种里的结构；确实放不进再考虑加内容块。

## 1. 主体卡 + 三连格

开场页。标题两行用 `xl`，第二行用 `**主色**` 做反转。三连格在说到每个词时依次亮起。

```json
{
  "titleSize": "xl",
  "title": ["现在跟你说话的，", "**不是真人陈天**"],
  "rows": [{
    "height": 194, "gap": 26,
    "items": [
      { "kind": "card", "tone": "dark", "flex": 358, "label": "LIVE SUBJECT", "title": "AI 陈天", "titleSize": 54, "titleAccent": true },
      { "kind": "cells", "flex": 438, "items": [
        { "label": "01 / SCRIPT", "text": "文案", "pulses": [[4.08]] },
        { "label": "02 / VOICE", "text": "声音", "pulses": [[4.25]] },
        { "label": "03 / VISUAL", "text": "画面", "pulses": [[4.42]] }
      ]}
    ]
  }]
}
```

参考片里三连格是扫两遍后常亮：第一遍 `[亮, 灭]`，第二遍只写 `[亮]`。只想亮一次就各写一个 `[亮]`。

## 2. 列表 → 箭头 → 深色卡

列表每一行的 `at` 对到口播念到它的时刻。深色卡的 `progress` 前几格随卡片一起亮，后面的格子留给后续补充的内容。

```json
{ "height": 261, "items": [
  { "kind": "list", "flex": 386, "items": [
    { "tag": "INPUT 01", "text": "所见所闻", "at": 11.5 },
    { "tag": "INPUT 02", "text": "知识库", "at": 11.65 }
  ]},
  { "kind": "arrow", "width": 120, "at": 12.17 },
  { "kind": "card", "tone": "dark", "flex": 347, "at": 12.2, "label": "AI CONTENT SYSTEM", "title": "持续吸收\n持续处理", "titleSize": 50, "progress": [12.35, 12.4, 12.45, 17.08, 21.33] }
]}
```

列表 3–5 行。超过 5 行拆成两页。

## 3. 大数字 + 列表

标题里的数字用 `**5 个**` 染成主色，和左侧大数字呼应。列表用 `"tagColor": "ink"`，序号写 `01`–`05`，`status` 写一个统一的小词（如 `READY`）。

```json
{ "height": 278, "gap": 36, "items": [
  { "kind": "stat", "width": 248, "label": "SELECTED TODAY", "value": "05" },
  { "kind": "list", "tagColor": "ink", "textSize": 27, "items": [
    { "tag": "01", "text": "真实实践", "status": "READY" }
  ]}
]}
```

## 4. 两张大卡片

左深右浅。说到第二件事时给右卡一个短高亮 `"pulses": [[35.1, 35.5]]`。卡片标题按 9 个汉字一行手动断行。

```json
{ "height": 298, "gap": 22, "items": [
  { "kind": "card", "tone": "dark", "label": "01 / AI IN BUSINESS", "labelSize": 21, "title": "AI 怎么真正用进工作\n和业务", "titleSize": 55, "sub": "不只演示，更关注真实流程与结果。", "subSize": 27 },
  { "kind": "card", "tone": "light", "label": "02 / GEO", "labelSize": 21, "title": "让品牌在各类 AI 里\n被看见", "titleSize": 55, "sub": "被理解 · 被推荐 · 成为答案", "subSize": 27, "pulses": [[35.1, 35.5]] }
]}
```

## 5. 两个横条 + 说明行

标题用 `xl` 一行，关键词加 `==高亮底==`。说明行右侧的色块标签适合放人名、出处。这一页在参考片里用 `"transition": "wipe"` 进场，因为它是全片的转折点。

```json
"rows": [
  { "height": 123, "gap": 22, "items": [
    { "kind": "pill", "label": "01 / LEARN", "text": "持续学习", "pulses": [[45.95, 46.75]] },
    { "kind": "pill", "label": "02 / OUTPUT", "text": "持续输出", "pulses": [[46.25, 46.7]] }
  ]},
  { "height": 95, "mt": 28, "items": [{ "kind": "meta", "label": "IDEA INSPIRED BY", "tag": "余一老师" }] }
]
```

## 6. 卡片 → 箭头 → 卡片

左边是现状或一方，右边是结果或另一方，箭头上下可各放一个小词。右卡的 `at` 对到说到它的时刻。

```json
{ "height": 285, "items": [
  { "kind": "card", "tone": "light", "flex": 347, "label": "REAL CHEN TIAN", "title": "继续实践", "titleSize": 47, "sub": "所见所闻 · 经验 · 判断" },
  { "kind": "arrow", "width": 177, "top": "SYNC", "bottom": "METHOD" },
  { "kind": "card", "tone": "dark", "flex": 347, "label": "AI CHEN TIAN", "title": "及时输出", "titleSize": 47, "sub": "经验 · 判断 · 方法" }
]}
```

## 7. 结尾号召

三个按钮初始是强调色，说到对应词时逐个变成主色（`activeAt`）。通栏左侧写关注引导。

```json
"rows": [
  { "mt": 26, "items": [{ "kind": "text", "text": "我是 AI 陈天。关注我，一起把 AI 真正变成业务增长的一部分。" }] },
  { "height": 129, "gap": 20, "mt": 26, "items": [
    { "kind": "button", "text": "研究 AI", "activeAt": 63.55 },
    { "kind": "button", "text": "搞懂 GEO", "activeAt": 63.72 },
    { "kind": "button", "text": "业务增长", "activeAt": 63.9 }
  ]},
  { "height": 83, "mt": 28, "items": [{ "kind": "bar", "left": "关注 SKY 陈天", "right": "AI TWIN / CONTINUOUS OUTPUT" }] }
]
```

## 小标签怎么写

`eyebrow.en`、卡片的 `label`、水印都是等宽大写英文，2–4 个词，概括这一页或这张卡的角色，例如 `IDENTITY CHECK`、`TWO MAIN TRACKS`、`01 / LEARN`。它们是装饰性的信息层，不要写成完整句子，也不要放口播里没有的事实。
