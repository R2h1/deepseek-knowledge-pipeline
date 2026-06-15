---
name: deepseek-knowledge-pipeline
description: >
  DeepSeek Chat 会话知识沉淀管线。当用户想要从 DeepSeek 聊天记录中提取知识、合并同类会话、产出知识文章或工具文档时触发。
  适用于："帮我整理 DeepSeek 会话"、"把聊天记录变成知识库"、"合并同类会话"、"沉淀知识"、"清理 DeepSeek 会话"、"把会话做成文章或工具"。
  这是一个交互式管线，每步需要用户确认后再继续。
---

# DeepSeek Knowledge Pipeline

## 概述

从 DeepSeek 拉取所有会话 → 分类归档 → 同类合并为知识文章/工具文档 → 删除已沉淀的原始会话。

整个流程是**用户确认驱动**的：每产出一篇，等用户确认后再做下一篇。

## 前置条件

- 项目根目录有 `scripts/export-deepseek-chats.mjs`（导出脚本）
- 项目根目录有 `scripts/categorize-chats.mjs`（分类脚本）
- 项目根目录下有 `deepseek-chats/` 目录（存放原始会话）
- 输出目录为 `knowledge-base/`
- Chrome MCP 可用（用于在 DeepSeek 网页上删除会话）

## 工作流程

### 第一步：导出会话

当用户还没有拉取过会话，或需要增量同步时：

```bash
node scripts/export-deepseek-chats.mjs
```

这会从 DeepSeek API 拉取所有会话到 `knowledge-base/` 目录，但不对应项目目录，而是 `deepseek-chats/`。

**说明：** 首次导出需要先在 `scripts/export-deepseek-chats.mjs` 中设置有效的 `AUTH_TOKEN`（从浏览器 DevTools 的 DeepSeek API 请求中获取 `authorization` 头的值）。

脚本会自动：
- 分页拉取所有会话列表
- 逐个下载会话内容
- 保存为 markdown 文件（文件名格式：`会话ID前8位_标题.md`）
- 跳过已导出的会话（增量同步）

### 第二步：分类

```bash
node scripts/categorize-chats.mjs
```

将会话按标题关键词归类到 8 个大类 × 子类的目录结构中：

```
deepseek-chats/
├── 编程开发/   (JavaScript, Vue, Nginx, CSS, Element UI, 工程工具等)
├── 理财投资/   (资产财务, 投资产品, 保险社保, 房产贷款)
├── 健康生活/   (健身训练, 饮食营养, 医疗健康, 生活作息)
├── 生活杂谈/   (人文历史, 科技数码, 日常闲聊)
├── 副业创业/   (自媒体, App产品, 电商)
├── AI与工具/   (Claude Code, DeepSeek, AI应用)
├── 日常工具/   (效率工具, 趣味工具)
└── 个人规划/   (目标规划, 自我认知)
```

如果用户没有运行过分类脚本，运行它。如果已经分类好了，跳到下一步。

### 第三步：识别合并方案

遍历分类目录，找出**同类主题**的会话（相同子目录下的文件），制定合并方案：

**合并原则：**
- 同类/相似度高的会话合并成一篇知识文章或工具文档
- 能形成工具的优先做成工具文档（如计算器、生成器等）
- 每篇产物覆盖 2-10 个会话为宜

**展示合并方案给用户确认，例如：**

```
发现以下同类会话可合并：

📂 健康生活/健身训练（3个）
  ▸ 腹部软肉核心训练计划（30条AI回复）
  ▸ 运动记录计划反馈（89条AI回复）
  ▸ 练背核心指南（2条AI回复）
  → 建议合并为「居家健身训练指南」

📂 理财投资/投资产品（3个）
  ▸ 黄金属性与市场全面解析（5条）
  ▸ 黄金更值钱（2条）
  ▸ 黄金与比特币关系动态演变分析（1条）
  → 建议合并为「黄金投资完全指南」
```

征得用户同意后进入下一步。

### 第四步：产出知识文章

每篇知识文章的**标准格式**：

```markdown
---
title: 文章标题
tags: [标签1, 标签2]
created: <当前日期>
sources: [来源会话标题1, 来源会话标题2]
---

# 文章标题

> 一句话引言

---

## 一、小节标题

### 1.1 子节标题

正文内容...

---

## 二、小节标题

---

**关联的 DeepSeek 会话（可删除）：**
1. `来源会话标题1` — 日期
2. `来源会话标题2` — 日期
```

**格式要求：**
- 必须包含 frontmatter（title, tags, created, sources）
- 使用 `---` 分隔章节
- 使用表格对比数据
- 使用代码块（\`\`\`）展示代码
- 使用 `>` 做重点引用
- 末尾必须列出关联会话（供用户去网页删除）

**内容要求：**
- 去个性化：去掉用户的个人数据（姓名、年龄、具体日期等），做成通用指南
- 但如果用户有践行记录（如"累计运动 90 天"），可以保留作为案例
- AI 思考过程（THINK 片段）不保留
- 工具类产出口标明「🔧 工具建议」

### 第五步：用户确认

每产出一篇，等待用户确认：

```
第 N 篇完成，等你过目：

| 产物 | 内容 | 关联会话 |
|------|------|---------|
| 文章标题.md | 内容简介 | N 个会话 |

看完了告诉我，确认后删源文件继续。
```

用户确认后：
1. 删除本地源文件：`rm deepseek-chats/.../对应文件.md`
2. 更新 `CLAUDE.md` 中的进度记录
3. 询问用户是否需要通过 Chrome MCP 去 DeepSeek 网页删除对应会话，如果需要：
   - 使用 Chrome MCP 的 `evaluate_script` 在浏览器中定位并删除
   - **注意：置顶的会话不能删！** 先通过 `evaluate_script` 找到侧边栏中"置顶"标签下的会话列表，排除它们
   - 对于通过标题匹配的会话，使用精确匹配，避免误删

### 第六步：循环

重复第三步→第五步，直到所有会话处理完毕。

## 重要注意事项

### 置顶会话保护
永远不要删除置顶的会话！在 Chrome MCP 删除前，先用 JavaScript 找出置顶列表：

```javascript
// 在浏览器中获取置顶会话标题
const container = document.querySelector('._6d215eb');
const items = Array.from(container.querySelectorAll('*'));
let isPinned = false;
const pinnedTitles = [];
for (const el of items) {
  if (el.textContent.trim() === '置顶') { isPinned = true; continue; }
  if (isPinned && el.tagName === 'A') pinnedTitles.push(el.textContent.trim());
  if (isPinned && /昨天|7 天内|30 天内|2026-|2025-/.test(el.textContent.trim())) isPinned = false;
}
```

### 删除操作的精确匹配

在 Chrome MCP 中删除会话时使用精确标题匹配，避免误删：

```javascript
const keep = new Set([...pinnedTitles, ...用户要求保留的标题]);
const links = Array.from(container.querySelectorAll('a[href*="/a/chat/s/"]'));
for (const link of links) {
  if (keep.has(link.textContent.trim())) continue;
  // 点击三点菜单 → 删除 → 确认
}
```

删除流程：
```
点击三点按钮 → 查找"删除"文本元素并点击 → 确认对话框"删除该对话"
```

### 删除操作中需要等待页面重新渲染

每次删除操作后等待 400-800ms，让页面重新渲染。如果一轮中找不到匹配的会话，就停止删除循环。

### 避免误删除
- 永远使用 Set 精确匹配标题，不要使用 includes 模糊匹配
- 删除前向用户展示将要删除的标题列表
- 确认用户同意后再执行删除

## 产出管理

在 `CLAUDE.md` 中记录进度：

```markdown
## ✅ 已完成（N 篇）
| 产物 | 类型 | 关联会话 | 状态 |
|------|------|---------|------|
| 文章标题.md | 📄 知识文章 | 来源会话 | ✅ 已删 |

## 📍 当前进度
- 正在做第 N 篇
- 产物目录：knowledge-base/
- 剩余会话文件数：N 个
```