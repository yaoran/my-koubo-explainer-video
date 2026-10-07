// 运行：node --test scripts/validate.test.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { readThemeIds, textWidth, validateStoryboard } from "./validate.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const templateDir = join(here, "..", "template");
const loadExample = () =>
  JSON.parse(
    readFileSync(join(templateDir, "src", "storyboards", "example.json"), "utf8"),
  );
const themes = readThemeIds(templateDir);

test("文字宽度：全角 1、半角 0.56、空格 0.3", () => {
  assert.equal(textWidth("内容系统"), 4);
  assert.ok(Math.abs(textWidth("AI 分身") - (0.56 * 2 + 0.3 + 2)) < 1e-9);
});

test("能从 themes.ts 读出配色 id", () => {
  assert.ok(themes.includes("lime"));
  assert.ok(themes.includes("lavender"));
});

test("示例分镜没有错误", () => {
  const { errors } = validateStoryboard(loadExample(), { themes });
  assert.deepEqual(errors, []);
});

test("未知配色报错", () => {
  const sb = { ...loadExample(), theme: "pink" };
  const { errors } = validateStoryboard(sb, { themes });
  assert.ok(errors.some((e) => e.includes('theme "pink"')));
});

test("页与页之间有空档时报错", () => {
  const sb = loadExample();
  const scenes = sb.scenes.map((s, i) => (i === 1 ? { ...s, start: s.start + 1 } : s));
  const { errors } = validateStoryboard({ ...sb, scenes }, { themes });
  assert.ok(errors.some((e) => e.includes("不留空档")));
});

test("元素时刻落在本页之外时报错", () => {
  const sb = loadExample();
  const first = sb.scenes[0];
  const rows = [{ ...first.rows[0], items: [{ kind: "text", text: "x", at: 999 }] }];
  const scenes = [{ ...first, rows }, ...sb.scenes.slice(1)];
  const { errors } = validateStoryboard({ ...sb, scenes }, { themes });
  assert.ok(errors.some((e) => e.includes("at=999")));
});

test("标题过宽报错", () => {
  const sb = loadExample();
  const scenes = [
    { ...sb.scenes[0], titleSize: "xl", title: ["这是一行明显超过容量的特别特别长的标题"] },
    ...sb.scenes.slice(1),
  ];
  const { errors } = validateStoryboard({ ...sb, scenes }, { themes });
  assert.ok(errors.some((e) => e.includes("超过 12.5")));
});

test("字幕重叠与过长报错", () => {
  const sb = loadExample();
  const captions = [
    { start: 0, end: 3, text: "短句" },
    { start: 2, end: 5, text: "一".repeat(40) },
  ];
  const { errors } = validateStoryboard({ ...sb, captions }, { themes });
  assert.ok(errors.some((e) => e.includes("时间重叠")));
  assert.ok(errors.some((e) => e.includes("超过字幕条容量")));
});

test("未知内容块和缺字段报错", () => {
  const sb = loadExample();
  const first = sb.scenes[0];
  const rows = [{ items: [{ kind: "chart" }, { kind: "stat", label: "A" }] }];
  const scenes = [{ ...first, rows }, ...sb.scenes.slice(1)];
  const { errors } = validateStoryboard({ ...sb, scenes }, { themes });
  assert.ok(errors.some((e) => e.includes('未知 kind "chart"')));
  assert.ok(errors.some((e) => e.includes("缺字段 value")));
});

test("没有口播素材只提醒不报错", () => {
  const { errors, warnings } = validateStoryboard(loadExample(), { themes });
  assert.deepEqual(errors, []);
  assert.ok(warnings.some((w) => w.includes("talk.src 为空")));
});
