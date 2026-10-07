#!/usr/bin/env node
// 校验分镜 JSON：渲染前先把时间轴错位、文字溢出、字段缺失拦下来。
// 用法：node validate.mjs <storyboard.json> [--app <工程目录>]

import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// 版式容量（单位：一个汉字宽）。超过就会溢出信息区或字幕条。
export const LIMITS = {
  titleXl: 12.5,
  titleLg: 16.4,
  caption: 37,
  watermark: 9,
  sceneMinSeconds: 3,
  sceneMaxSeconds: 20,
};

const REQUIRED_BY_KIND = {
  card: ["tone", "title"],
  cells: ["items"],
  list: ["items"],
  arrow: [],
  stat: ["label", "value"],
  pill: ["label", "text"],
  meta: ["label", "tag"],
  button: ["text"],
  bar: ["left"],
  text: ["text"],
};

const TIME_SLACK = 0.05;

/** 文字显示宽度：全角算 1，半角算 0.56，空格算 0.3。 */
export const textWidth = (text) =>
  [...text].reduce((sum, ch) => {
    if (ch === " ") return sum + 0.3;
    return sum + (ch.charCodeAt(0) > 0x2e7f ? 1 : 0.56);
  }, 0);

const stripMarkup = (line) => line.replace(/\*\*|==/g, "");

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

const blockTimes = (block) => {
  const times = [];
  const push = (label, value) => {
    if (value !== undefined) times.push([label, value]);
  };
  push("at", block.at);
  push("activeAt", block.activeAt);
  (block.progress ?? []).forEach((v, i) => push(`progress[${i}]`, v));
  (block.pulses ?? []).forEach((p, i) => {
    push(`pulses[${i}][0]`, p[0]);
    push(`pulses[${i}][1]`, p[1]);
  });
  (block.items ?? []).forEach((item, i) => {
    push(`items[${i}].at`, item.at);
    (item.pulses ?? []).forEach((p, j) => {
      push(`items[${i}].pulses[${j}][0]`, p[0]);
      push(`items[${i}].pulses[${j}][1]`, p[1]);
    });
  });
  return times;
};

const checkScene = (scene, index, errors, warnings) => {
  const where = `scenes[${index}]`;
  if (!isNumber(scene.start) || !isNumber(scene.end) || scene.end <= scene.start) {
    errors.push(`${where}: start/end 必须是数字且 end > start`);
    return;
  }
  const length = scene.end - scene.start;
  if (length < LIMITS.sceneMinSeconds) {
    warnings.push(`${where}: 只有 ${length.toFixed(1)} 秒，观众来不及读完`);
  }
  if (length > LIMITS.sceneMaxSeconds) {
    warnings.push(`${where}: 长达 ${length.toFixed(1)} 秒，建议拆成两页`);
  }
  if (!scene.eyebrow?.en || !scene.eyebrow?.zh) {
    errors.push(`${where}: 缺 eyebrow.en / eyebrow.zh`);
  }
  if (!Array.isArray(scene.title) || scene.title.length === 0) {
    errors.push(`${where}: title 必须是非空数组（每个元素一行）`);
  } else {
    const limit = scene.titleSize === "xl" ? LIMITS.titleXl : LIMITS.titleLg;
    scene.title.forEach((line) => {
      const width = textWidth(stripMarkup(line));
      if (width > limit) {
        errors.push(
          `${where}: 标题"${stripMarkup(line)}"宽 ${width.toFixed(1)}，超过 ${limit}（${scene.titleSize ?? "lg"}）。缩短、换行或改用 lg`,
        );
      }
    });
    if (scene.title.length > 2) {
      warnings.push(`${where}: 标题超过两行，会把正文挤出安全区`);
    }
  }
  if (!scene.watermark) {
    errors.push(`${where}: 缺 watermark`);
  } else if ([...scene.watermark].length > LIMITS.watermark) {
    warnings.push(`${where}: watermark "${scene.watermark}" 过长，右侧会被裁掉太多`);
  }
  if (scene.transition && !["push", "wipe"].includes(scene.transition)) {
    errors.push(`${where}: transition 只能是 push 或 wipe`);
  }
  if (!Array.isArray(scene.rows) || scene.rows.length === 0) {
    errors.push(`${where}: rows 不能为空`);
    return;
  }
  scene.rows.forEach((row, r) => {
    if (!Array.isArray(row.items) || row.items.length === 0) {
      errors.push(`${where}.rows[${r}]: items 不能为空`);
      return;
    }
    row.items.forEach((block, b) => {
      const at = `${where}.rows[${r}].items[${b}]`;
      const required = REQUIRED_BY_KIND[block.kind];
      if (!required) {
        errors.push(`${at}: 未知 kind "${block.kind}"`);
        return;
      }
      required
        .filter((field) => block[field] === undefined)
        .forEach((field) => errors.push(`${at}(${block.kind}): 缺字段 ${field}`));
      blockTimes(block).forEach(([label, value]) => {
        if (!isNumber(value)) {
          errors.push(`${at}.${label}: 不是数字`);
        } else if (value < scene.start - TIME_SLACK || value > scene.end + TIME_SLACK) {
          errors.push(
            `${at}.${label}=${value} 不在本页时间 ${scene.start}–${scene.end} 内`,
          );
        }
      });
    });
  });
};

/**
 * @param {object} sb 分镜对象
 * @param {{themes?: string[], publicDir?: string}} [options]
 * @returns {{errors: string[], warnings: string[]}}
 */
export const validateStoryboard = (sb, options = {}) => {
  const errors = [];
  const warnings = [];

  ["fps", "width", "height", "duration"].forEach((key) => {
    if (!isNumber(sb[key]) || sb[key] <= 0) errors.push(`${key} 必须是正数`);
  });
  if (options.themes && !options.themes.includes(sb.theme)) {
    errors.push(`theme "${sb.theme}" 不存在，可用：${options.themes.join(" / ")}`);
  }
  ["topLeft", "topRight", "talkLabel", "talkBadge", "voiceLabel"].forEach((key) => {
    if (!sb.brand?.[key]) errors.push(`brand.${key} 不能为空`);
  });
  if (!sb.talk || typeof sb.talk.src !== "string") {
    errors.push("talk.src 必须是字符串（没有素材时填空字符串）");
  } else if (sb.talk.src === "") {
    warnings.push("talk.src 为空：人物卡显示占位，成片没有声音");
  } else if (options.publicDir && !existsSync(join(options.publicDir, sb.talk.src))) {
    errors.push(`找不到口播视频 public/${sb.talk.src}`);
  }

  const scenes = Array.isArray(sb.scenes) ? sb.scenes : [];
  if (scenes.length === 0) errors.push("scenes 不能为空");
  scenes.forEach((scene, i) => {
    checkScene(scene, i, errors, warnings);
    const next = scenes[i + 1];
    if (next && Math.abs(next.start - scene.end) > TIME_SLACK) {
      errors.push(
        `scenes[${i}].end=${scene.end} 必须等于 scenes[${i + 1}].start=${next.start}（页与页之间不留空档）`,
      );
    }
  });
  const last = scenes[scenes.length - 1];
  if (last && isNumber(sb.duration) && Math.abs(last.end - sb.duration) > 0.5) {
    warnings.push(`最后一页结束于 ${last.end}，与总时长 ${sb.duration} 不一致`);
  }

  const captions = Array.isArray(sb.captions) ? sb.captions : [];
  if (captions.length === 0) warnings.push("captions 为空：底部字幕条不会显示文字");
  captions.forEach((caption, i) => {
    const where = `captions[${i}]`;
    if (!isNumber(caption.start) || !isNumber(caption.end) || caption.end <= caption.start) {
      errors.push(`${where}: start/end 必须是数字且 end > start`);
      return;
    }
    const prev = captions[i - 1];
    if (prev && caption.start < prev.end - TIME_SLACK) {
      errors.push(`${where}: 与上一条字幕时间重叠`);
    }
    if (isNumber(sb.duration) && caption.end > sb.duration + 0.5) {
      errors.push(`${where}: 结束时间超出总时长`);
    }
    const width = textWidth(caption.text ?? "");
    if (width > LIMITS.caption) {
      errors.push(
        `${where}: "${caption.text}" 宽 ${width.toFixed(1)}，超过字幕条容量 ${LIMITS.caption}，请拆成两条`,
      );
    }
  });

  return { errors, warnings };
};

/** 从工程的 themes.ts 里读出可用配色 id。 */
export const readThemeIds = (appDir) => {
  const file = join(appDir, "src", "themes.ts");
  if (!existsSync(file)) return undefined;
  const body = readFileSync(file, "utf8").split("export const themes")[1] ?? "";
  return [...body.matchAll(/^ {2}(\w+): \{/gm)].map((m) => m[1]);
};

export const loadStoryboard = (file) => {
  if (!existsSync(file)) throw new Error(`找不到分镜文件：${file}`);
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    throw new Error(`分镜不是合法 JSON：${error.message}`);
  }
};

/** 校验并打印结果；有错误时返回 false。 */
export const report = (file, appDir) => {
  const result = validateStoryboard(loadStoryboard(file), {
    themes: appDir ? readThemeIds(appDir) : undefined,
    publicDir: appDir ? join(appDir, "public") : undefined,
  });
  result.warnings.forEach((w) => console.error(`提醒  ${w}`));
  result.errors.forEach((e) => console.error(`错误  ${e}`));
  console.error(
    result.errors.length === 0
      ? `校验通过（${result.warnings.length} 条提醒）`
      : `校验未通过：${result.errors.length} 个错误`,
  );
  return result.errors.length === 0;
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const appIndex = args.indexOf("--app");
  const appDir = appIndex >= 0 ? resolve(args[appIndex + 1]) : undefined;
  const file = args.find((a, i) => !a.startsWith("--") && i !== appIndex + 1);
  if (!file) {
    console.error("用法：node validate.mjs <storyboard.json> [--app <工程目录>]");
    process.exit(2);
  }
  try {
    process.exit(report(resolve(file), appDir) ? 0 : 1);
  } catch (error) {
    console.error(`错误  ${error.message}`);
    process.exit(1);
  }
}
