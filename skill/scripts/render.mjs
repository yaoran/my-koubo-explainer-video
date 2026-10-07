#!/usr/bin/env node
// 预览与出片。三种用法（<app> 是 new_project.sh 建出来的工程目录）：
//   node render.mjs stills   <app> <storyboard.json> [--theme id]   每页一张定格帧 + 拼图
//   node render.mjs palettes <app> <storyboard.json> [--at 秒,秒]   同样几帧渲染全部配色 + 拼图
//   node render.mjs video    <app> <storyboard.json> [--theme id] [--out 文件.mp4]

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { loadStoryboard, readThemeIds, report } from "./validate.mjs";

const LABEL_FONT = "/System/Library/Fonts/Hiragino Sans GB.ttc";
const SHEET_TILE = { width: 960, height: 540 };
const STILLS_COLUMNS = 2;
// 取每页结束前一点的画面：此时本页所有元素都已出现。
const SETTLE_BEFORE_END = 0.3;

const parseArgs = (argv) => {
  const [mode, app, storyboard, ...rest] = argv;
  const flags = {};
  for (let i = 0; i < rest.length; i += 2) {
    if (!rest[i].startsWith("--") || rest[i + 1] === undefined) {
      throw new Error(`参数格式不对：${rest[i]}`);
    }
    flags[rest[i].slice(2)] = rest[i + 1];
  }
  if (!["stills", "palettes", "video"].includes(mode) || !app || !storyboard) {
    throw new Error(
      "用法：node render.mjs <stills|palettes|video> <工程目录> <storyboard.json> [--theme id] [--at 秒] [--out 文件]",
    );
  }
  return { mode, app: resolve(app), storyboard: resolve(storyboard), flags };
};

const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, stdio: ["ignore", "ignore", "inherit"] });

const writeProps = (app, storyboard, theme) => {
  const file = join(app, "out", `.props-${theme ?? "default"}.json`);
  writeFileSync(file, JSON.stringify(theme ? { storyboard, theme } : { storyboard }));
  return file;
};

const still = (app, propsFile, frame, outFile) =>
  run(
    "npx",
    [
      "remotion", "still", "src/index.ts", "Explainer", outFile,
      `--frame=${frame}`, "--image-format=jpeg", `--props=${propsFile}`, "--log=error",
    ],
    app,
  );

/** 把若干定格帧拼成一张带标签的对比图。 */
const contactSheet = (files, labels, columns, outFile) => {
  const { width, height } = SHEET_TILE;
  const rows = Math.ceil(files.length / columns);
  const withFont = existsSync(LABEL_FONT);
  const inputs = files.flatMap((f) => ["-i", f]);
  const tiles = files.map((_, i) => {
    const label = withFont
      ? `,drawtext=fontfile='${LABEL_FONT}':text='${labels[i].replace(/[':\\]/g, " ")}':x=(w-tw)/2:y=58:fontsize=26:fontcolor=white:box=1:boxcolor=black@0.65:boxborderw=8`
      : "";
    return `[${i}:v]scale=${width}:${height}${label}[t${i}]`;
  });
  const layout = files
    .map((_, i) => `${(i % columns) * width}_${Math.floor(i / columns) * height}`)
    .join("|");
  const stack =
    files.length === 1
      ? "[t0]copy[v]"
      : `${files.map((_, i) => `[t${i}]`).join("")}xstack=inputs=${files.length}:layout=${layout}:fill=black[v]`;
  run("ffmpeg", [
    "-v", "error", "-y", ...inputs,
    "-filter_complex", [...tiles, stack].join(";"),
    "-map", "[v]", "-frames:v", "1", "-q:v", "3",
    "-s", `${width * Math.min(columns, files.length)}x${height * rows}`, outFile,
  ]);
};

const main = () => {
  const { mode, app, storyboard: file, flags } = parseArgs(process.argv.slice(2));
  if (!existsSync(join(app, "node_modules"))) {
    throw new Error(`${app} 还没装依赖，先运行 new_project.sh 或在该目录执行 npm install`);
  }
  if (!report(file, app)) {
    throw new Error("分镜校验未通过，已停止渲染");
  }
  const sb = loadStoryboard(file);
  const name = basename(file, ".json");
  const outDir = join(app, "out");
  mkdirSync(join(outDir, "stills"), { recursive: true });
  const frameAt = (seconds) =>
    Math.min(Math.round(seconds * sb.fps), Math.round(sb.duration * sb.fps) - 1);

  if (mode === "stills") {
    const theme = flags.theme;
    const props = writeProps(app, sb, theme);
    const files = sb.scenes.map((scene, i) => {
      const out = join(outDir, "stills", `${name}_${theme ?? sb.theme}_p${i + 1}.jpg`);
      still(app, props, frameAt(scene.end - SETTLE_BEFORE_END), out);
      return out;
    });
    const sheet = join(outDir, `${name}_${theme ?? sb.theme}_预览拼图.jpg`);
    contactSheet(
      files,
      sb.scenes.map((s, i) => `P${i + 1} ${s.eyebrow.zh}`),
      STILLS_COLUMNS,
      sheet,
    );
    rmSync(props);
    console.log(sheet);
    return;
  }

  if (mode === "palettes") {
    const themes = readThemeIds(app) ?? [];
    // 默认取第一页、中间一页、最后一页，三种典型版式都能看到
    const middle = sb.scenes[Math.floor(sb.scenes.length / 2)];
    const times = flags.at
      ? flags.at.split(",").map(Number)
      : [...new Set([sb.scenes[0], middle, sb.scenes.at(-1)])].map(
          (scene) => scene.end - SETTLE_BEFORE_END,
        );
    if (times.some((t) => !Number.isFinite(t))) {
      throw new Error(`--at 需要逗号分隔的秒数，收到：${flags.at}`);
    }
    const files = themes.flatMap((theme) => {
      const props = writeProps(app, sb, theme);
      const outs = times.map((t, i) => {
        const out = join(outDir, "stills", `${name}_palette_${theme}_${i + 1}.jpg`);
        still(app, props, frameAt(t), out);
        return out;
      });
      rmSync(props);
      return outs;
    });
    const sheet = join(outDir, `${name}_配色对比.jpg`);
    contactSheet(
      files,
      themes.flatMap((theme) => times.map(() => theme)),
      times.length,
      sheet,
    );
    console.log(sheet);
    return;
  }

  const theme = flags.theme;
  const props = writeProps(app, sb, theme);
  const out = resolve(flags.out ?? join(outDir, `${name}_${theme ?? sb.theme}.mp4`));
  run(
    "npx",
    [
      "remotion", "render", "src/index.ts", "Explainer", out,
      "--codec=h264", "--crf=18", `--props=${props}`, "--log=error",
    ],
    app,
  );
  rmSync(props);
  console.log(out);
};

try {
  main();
} catch (error) {
  console.error(`错误  ${error.message}`);
  process.exit(1);
}
