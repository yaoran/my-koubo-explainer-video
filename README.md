# my-koubo-explainer-video

为真人或数字人口播素材制作左侧人物卡、右侧信息图和底部字幕的 16:9 横版讲解片。

## 使用前准备

- 输入：本地口播视频，可选文稿、Logo、真实截图和配色要求。
- 运行依赖：Node.js/npm、FFmpeg/ffprobe、Python 3；转写脚本需要 whisper-cli 和本地 Whisper 模型，可通过 WHISPER_MODEL 指定。Remotion 工程依赖随模板的 package.json 和 package-lock.json 提供。

## 产出

Remotion 可编辑工程、分镜、字幕、预览与 1080p MP4 成片。

## 安装

本仓库为私有仓库，下载与安装需要有访问权限的 GitHub 账号。运行包位于 `skill/`，入口为 [skill/SKILL.md](skill/SKILL.md)。

本机手动安装：

```bash
gh repo clone yaoran/my-koubo-explainer-video
cd my-koubo-explainer-video
# 先确认目标没有已有同名 Skill；已有版本需核对后再更新。
mkdir -p "$HOME/.agents/skills/my-koubo-explainer-video"
rsync -a skill/ "$HOME/.agents/skills/my-koubo-explainer-video/"
```

也可以把下面这段话发给 Codex、Claude Code 或其他具备终端能力的 Agent：

```text
请从 https://github.com/yaoran/my-koubo-explainer-video 安装 my-koubo-explainer-video。
先确认 GitHub 账号有该私有仓库访问权限，核对现有同名 Skill，避免覆盖已有改动。
将 skill/ 运行包放入当前 Agent 的技能目录，检查 SKILL.md、引用文件和前置依赖，并报告实际安装位置。
```

Skills CLI 命令（需已有 Node.js/npx 和该仓库访问权限）：

```bash
npx skills add https://github.com/yaoran/my-koubo-explainer-video --skill my-koubo-explainer-video --global
```

## 调用示例

> 用 my-koubo-explainer-video 把这段口播配上信息图，做成 16:9 横版，先看预览。

## 使用边界

使用已有口播素材，不负责生成数字人、克隆声音或制作竖版；原素材保持不变。

仓库提供 Skill 规则、所需脚本、模板和随包示例。密钥、个人视频、生成成片与运行依赖不随仓库分发；使用该 Skill 时仍需按实际环境检查工具和权限。
