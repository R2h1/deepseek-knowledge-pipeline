# deepseek-knowledge-pipeline

将 DeepSeek 聊天记录自动导出、分类、合并为知识库文章。

## ✨ 功能

- 📥 **导出** — 从 DeepSeek API 拉取所有会话到本地 Markdown
- 📂 **分类** — 按内容自动归类到 8 个大类 × 子类
- 📝 **合并** — 同类会话合并为结构化知识文章
- 🧹 **清理** — 已沉淀的会话可批量删除（本地 + 网页）
- 🤖 **Skill** — Claude Code Skill，一键执行全流程

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repo-url>
cd deepseek-knowledge-pipeline
```

### 2. 获取 DeepSeek Token

1. 登录 [chat.deepseek.com](https://chat.deepseek.com)
2. 按 F12 打开 DevTools → Network 标签
3. 刷新页面，找任意 `api/v0/` 的请求
4. 复制 Request Headers 中的 `authorization` 值（以 `Bearer` 开头）

### 3. 设置认证

```bash
# Windows
set DEEPSEEK_AUTH_TOKEN="Bearer xxxxxx"

# 或创建 .env 文件（复制 .env.example 修改）
```

### 4. 导出会话

```bash
node scripts/export-deepseek-chats.mjs
```

### 5. 分类

```bash
node scripts/categorize-chats.mjs
```

### 6. 调用 Skill 进行知识沉淀

在 Claude Code 中执行：

```
/deepseek-knowledge-pipeline
```

## 📁 项目结构

```
deepseek-knowledge-pipeline/
├── .claude/
│   ├── settings.json                    # 项目配置 + skill 注册
│   └── skills/deepseek-knowledge-pipeline/  # Skill 定义
├── scripts/
│   ├── export-deepseek-chats.mjs        # 会话导出脚本
│   └── categorize-chats.mjs             # 分类脚本
├── knowledge-base/                      # ← 产出的知识文章
│   ├── 文章标题.md
│   └── ...
├── deepseek-chats/                      # 原始会话临时存放（可删除）
├── .env.example                         # 环境变量示例
├── .gitignore
├── CLAUDE.md                            # 项目说明
└── README.md
```

## 📄 产出格式

每篇知识文章是标准 Markdown，包含：

```markdown
---
title: 文章标题
tags: [标签1, 标签2]
created: 2026-06-13
sources: [来源会话1, 来源会话2]
---

# 文章标题

> 引言

正文内容...

---

**关联的 DeepSeek 会话（可删除）：**
1. `来源会话1` — 日期
2. `来源会话2` — 日期
```

## 🧠 Skill 工作流程

```
导出 → 分类 → 识别同类会话 → 用户确认 → 产出文章 → 用户确认 → 删除源文件 → 循环
```

通过 `/deepseek-knowledge-pipeline` 调用，每步需用户确认，保证不误删。

## 🛠 脚本说明

| 脚本 | 用途 | 运行方式 |
|------|------|---------|
| `scripts/export-deepseek-chats.mjs` | 从 API 拉取所有会话 | `node scripts/export-deepseek-chats.mjs` |
| `scripts/categorize-chats.mjs` | 按标题关键词自动分类 | `node scripts/categorize-chats.mjs` |

> 注意：`export` 脚本需要设置 `DEEPSEEK_AUTH_TOKEN` 环境变量。

## 📦 依赖

- Node.js >= 18（内置 fetch API）
- Chrome（可选，用于网页批量删除会话）

## 📃 License

MIT