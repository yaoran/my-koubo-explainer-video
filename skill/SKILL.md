---
name: my-koubo-explainer-video
description: 把一段口播视频（真人口播或数字人分身）做成「左侧人物卡 + 右侧跟着语音出现的信息图 + 底部字幕条」的 16:9 横版讲解片，用 Remotion 渲染成 1080p MP4。用户说"做口播讲解视频""AI 分身视频""陈天那种视频""口播配信息图""分屏讲解片""把这段口播做成带卡片和字幕的视频"时使用。输入口播视频和可选文稿，由 Agent 转写、写分镜、预览、出片。不负责生成数字人或克隆声音，不做竖版，不做纯剪辑和混剪。
---

# 口播信息图讲解视频

成片由三层组成：左侧竖版人物卡（口播视频原样放入，声音用它的音轨）、右侧信息区（每页一个意思，元素跟着说到的词出现和高亮）、底部字幕条。版式和动效复刻自参考片《陈天-AI视频》，模板在 `template/`，一条视频只需要写一份分镜 JSON。

用户只需给口播视频，可以再给文稿、配色偏好和品牌文字。不要让用户填 JSON。

## 流程

### 1. 确认输入

- **口播视频**：任意画幅，人物卡按 9:16 裁切取景。没有素材时也能先做，`talk.src` 留空会显示占位，用来先定版式和配色。
- **文稿**（可选）：用来校对字幕里的人名和专有词。
- **配色**：用户没指定时用 `lavender`（用户的淡紫科技风）。用户想挑时跑一次 `palettes` 出对比图。五套配色见 `references/themes.md`。
- **品牌文字**：页眉左右、人物卡标签和角标共 5 处，见 `references/storyboard.md` 的 `brand`。用户没给就按其身份拟一版并在交付时说明。

### 2. 建工程

```bash
bash ~/.claude/skills/my-koubo-explainer-video/scripts/new_project.sh <工程目录>/app <口播视频>
```

脚本会复制模板、把口播视频转成 H.264 放到 `public/talk.mp4`、安装依赖（约 1 分钟）。工程目录按当前项目的目录规则选；在 `05_线下AI培训` 里放 `90_制作工程/<业务线>/名称_YYYYMMDD/`，成片交回对应项目目录。

### 3. 转写

```bash
bash ~/.claude/skills/my-koubo-explainer-video/scripts/transcribe.sh <口播视频> <工程目录>/app/out
```

得到 `transcript.txt`，每行一个短句和起止秒数。时间以转写为准，文字以文稿为准：whisper 常把人名和 GEO 这类词写错，逐句对照改掉。

### 4. 写分镜

在 `src/storyboards/<名称>.json` 写分镜。字段和版式容量看 `references/storyboard.md`，每种页面怎么选、怎么写看 `references/page-recipes.md`，完整样例是 `template/src/storyboards/example.json`。

分页和对时的规则：

- **一页一个意思**，停留 6–13 秒。页边界落在一句话的开头。
- **`scene.start` = 这页第一句开口前约 0.3 秒**。新页标题在 `start + 0.45` 秒就位，正文默认从 `start + 0.72` 秒开始逐个出现。
- **元素的 `at` = 说到它的那一刻**，可提前 0.2 秒以内，不要晚于语音。列表、卡片是口播里的枚举时逐个给 `at`；只是陪衬时不填，按默认节奏出现。
- **高亮 `pulses` = 说到那个词的时刻**。一页最多一组高亮，不要每个元素都闪。
- **字幕按句切**：`start` 是这句开口，`end` 是下一句的 `start`。一条不超过 37 个汉字宽，长句在逗号处拆开。
- **`wipe` 全屏擦除只用在大段落切换**，整条片 0–2 次，其余都用默认的左推。
- **卡片和标题的文字只能提炼口播里说过的内容**，不添加口播没有的数据、案例和结论。

### 5. 校验和预览

```bash
node ~/.claude/skills/my-koubo-explainer-video/scripts/render.mjs stills <工程目录>/app <分镜.json>
```

先自动校验（时间轴错位、标题和字幕溢出、缺字段会直接报错并停止），再每页渲染一张定格帧并拼成一张图，路径打印在最后一行。用 Read 打开拼图逐页看：文字有没有溢出或孤字换行、卡片是否对齐、高亮色上的字是否看得清、每页重心是否居中。有问题改分镜重跑，这一步不满意不要出片。

需要选配色时：

```bash
node ~/.claude/skills/my-koubo-explainer-video/scripts/render.mjs palettes <工程目录>/app <分镜.json> [--at 秒,秒,秒]
```

### 6. 出片

```bash
node ~/.claude/skills/my-koubo-explainer-video/scripts/render.mjs video <工程目录>/app <分镜.json> [--theme id] [--out 成片.mp4]
```

一分钟的片子约渲染 1 分钟。出片后抽查同步：挑 3 个有高亮或逐个出现的时刻，按帧号抽帧，确认画面上的元素和那一刻的语音对得上。

```bash
ffmpeg -v error -i 成片.mp4 -vf "select='eq(n\,帧号)'" -frames:v 1 check.jpg   # 帧号 = 秒数 × fps
```

### 7. 交付

按当前项目的交付规则给出成片绝对路径并打开。说明用了哪套配色、共几页、哪些文字是自己拟的（品牌文字、小标签英文）需要用户确认。静帧通过不代表动效手感通过，请用户看一遍成片再定稿。

## 需要改模板的情况

分镜能表达的都不要改代码。只有这几种情况动 `src/`：

- 新增配色：在 `src/themes.ts` 加一项，字段含义见 `references/themes.md`。
- 现有 10 种内容块都摆不出想要的页面：在 `src/components/blocks.tsx` 加一种，同时更新 `src/types.ts`、`scripts/validate.mjs` 的 `REQUIRED_BY_KIND` 和 `references/storyboard.md`。
- 调整动效时长：改 `src/lib/anim.ts` 的 `DUR`。实测依据在 `references/motion-spec.md`。

在某个工程里验证过的改动，要同步回 `~/.claude/skills/my-koubo-explainer-video/template/`，否则下次新建工程又是旧版。

## 容易踩的坑

- **抽帧对时间不要用 `fps=1/N` 滤镜**。它就近取帧，标出来的时间和实际画面最多差半个间隔。用 `select='eq(n\,帧号)'`。
- **卡片标题不会自动换行**，换行位置用 `\n` 写在分镜里。大标题同理，一行一个数组元素。
- **分镜的 `duration` 要等于口播视频时长**，否则片尾会黑场或被截断。
- **字体用的是本机的 PingFang SC 和 JetBrains Mono**。换机器渲染前先确认这两套字体存在，否则版式容量会变。
- **`render.mjs` 传的是分镜文件，不是 Remotion 的 props 文件**。脚本会自己包一层 `{storyboard, theme}`；手动调 `npx remotion` 时要自己包。

## 文件

- `template/`：Remotion 工程模板（1920×1080，30fps）。
- `scripts/new_project.sh`：建工程。`scripts/transcribe.sh`：转写。`scripts/render.mjs`：预览、配色对比、出片。`scripts/validate.mjs`：分镜校验（`node --test scripts/validate.test.mjs` 跑它的测试）。
- `references/storyboard.md`：分镜字段与版式容量。
- `references/page-recipes.md`：七种页面的选用场景和写法。
- `references/themes.md`：五套配色与新增方法。
- `references/motion-spec.md`：参考片实测的动效参数，以及怎么做原片对照。
- `assets/palettes.jpg`：五套配色对比图。
