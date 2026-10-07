#!/bin/bash
# 从模板新建一个视频工程，并把口播视频放进 public/。
# 用法：new_project.sh <工程目录> [口播视频]
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="${1:?用法：new_project.sh <工程目录> [口播视频]}"
TALK="${2:-}"

if [ -e "$TARGET/package.json" ]; then
  echo "错误  $TARGET 已经是一个工程，不覆盖。换个目录，或直接在里面继续做。" >&2
  exit 1
fi
if [ -n "$TALK" ] && [ ! -f "$TALK" ]; then
  echo "错误  找不到口播视频：$TALK" >&2
  exit 1
fi

mkdir -p "$TARGET"
cp -R "$SKILL_DIR/template/." "$TARGET/"
mkdir -p "$TARGET/out" "$TARGET/public"

if [ -n "$TALK" ]; then
  # 统一转成 H.264 + AAC：手机直出的 HEVC / 可变帧率素材在渲染时容易卡帧
  ffmpeg -v error -y -i "$TALK" -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k "$TARGET/public/talk.mp4"
  echo "口播素材  $TARGET/public/talk.mp4"
  ffprobe -v error -show_entries format=duration:stream=codec_type,width,height,r_frame_rate -of default=nw=1 "$TARGET/public/talk.mp4"
fi

(cd "$TARGET" && npm install --no-audit --no-fund --loglevel=error)
echo "工程就绪  $TARGET"
