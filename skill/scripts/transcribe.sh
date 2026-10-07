#!/bin/bash
# 把口播视频转写成带时间戳的短句，供写分镜时对时间。
# 用法：transcribe.sh <口播视频> <输出目录>
# 产出：<输出目录>/transcript.json（whisper 原始结果）和 transcript.txt（每行 [起–止] 文本）
set -euo pipefail

VIDEO="${1:?用法：transcribe.sh <口播视频> <输出目录>}"
OUT="${2:?用法：transcribe.sh <口播视频> <输出目录>}"
MODEL="${WHISPER_MODEL:-$HOME/.cache/whisper-cpp/ggml-large-v3-turbo-q5_0.bin}"

[ -f "$VIDEO" ] || { echo "错误  找不到视频：$VIDEO" >&2; exit 1; }
command -v whisper-cli >/dev/null || { echo "错误  没有 whisper-cli，先 brew install whisper-cpp" >&2; exit 1; }
[ -f "$MODEL" ] || { echo "错误  找不到模型 $MODEL，可用环境变量 WHISPER_MODEL 指定" >&2; exit 1; }

mkdir -p "$OUT"
ffmpeg -v error -y -i "$VIDEO" -ar 16000 -ac 1 "$OUT/audio.wav"
# --max-len 1 + --split-on-word 让结果按短句切开，时间戳才够细
whisper-cli -m "$MODEL" -l zh -f "$OUT/audio.wav" -ojf -of "$OUT/transcript" --max-len 1 --split-on-word true -np >/dev/null 2>&1
rm -f "$OUT/audio.wav"

python3 - "$OUT/transcript.json" "$OUT/transcript.txt" <<'EOF'
import json, sys
segments = json.load(open(sys.argv[1], encoding="utf-8"))["transcription"]
lines = [
    f"[{s['offsets']['from'] / 1000:6.2f}–{s['offsets']['to'] / 1000:6.2f}] {s['text'].strip()}"
    for s in segments
    if s["text"].strip()
]
open(sys.argv[2], "w", encoding="utf-8").write("\n".join(lines) + "\n")
print("\n".join(lines))
EOF
echo "时长（秒）：$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$VIDEO")"
