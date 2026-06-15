# deepseek-knowledge-pipeline

## 🎯 DeepSeek 会话 → 知识库文章

所有 DeepSeek 会话已沉淀为 21 篇知识文章，原始会话已全部删除。

## ✅ 最终产出（21 篇）

| # | 产物 | 类型 |
|---|------|------|
| 1 | [居家健身训练指南.md](knowledge-base/居家健身训练指南.md) | 📄 知识文章 |
| 2 | [黄金投资完全指南.md](knowledge-base/黄金投资完全指南.md) | 📄 + 🔧 工具建议 |
| 3 | [口腔健康指南.md](knowledge-base/口腔健康指南.md) | 📄 知识文章 |
| 4 | [饮食营养指南.md](knowledge-base/饮食营养指南.md) | 📄 + 🔧 工具建议 |
| 5 | [睡眠与养生指南.md](knowledge-base/睡眠与养生指南.md) | 📄 知识文章 |
| 6 | [个人财务规划指南.md](knowledge-base/个人财务规划指南.md) | 📄 知识文章 |
| 7 | [基金定投与退休规划指南.md](knowledge-base/基金定投与退休规划指南.md) | 📄 知识文章 |
| 8 | [选购指南系列.md](knowledge-base/选购指南系列.md) | 📄 知识文章 |
| 9 | [中国历史文化指南.md](knowledge-base/中国历史文化指南.md) | 📄 知识文章 |
| 10 | [产品变现指南.md](knowledge-base/产品变现指南.md) | 📄 知识文章 |
| 11 | [哲思与冷知识.md](knowledge-base/哲思与冷知识.md) | 📄 知识文章 |
| 12 | [生活技巧合集.md](knowledge-base/生活技巧合集.md) | 📄 知识文章 |
| 13 | [职业规划与自我认知.md](knowledge-base/职业规划与自我认知.md) | 📄 知识文章 |
| 14 | [Claude Code 与 AI 开发实践指南.md](knowledge-base/Claude Code 与 AI 开发实践指南.md) | 📄 知识文章 |
| 15 | [实用工具集.md](knowledge-base/实用工具集.md) | 📄 🔧 工具需求文档 |
| 16 | [副业创业指南.md](knowledge-base/副业创业指南.md) | 📄 知识文章 |
| 17 | [科技与日常杂谈.md](knowledge-base/科技与日常杂谈.md) | 📄 知识文章 |
| 18 | [JavaScript 实用代码笔记.md](knowledge-base/JavaScript 实用代码笔记.md) | 📄 代码参考 |
| 19 | [Vue 开发笔记.md](knowledge-base/Vue 开发笔记.md) | 📄 代码参考 |
| 20 | [前端工程化笔记.md](knowledge-base/前端工程化笔记.md) | 📄 代码参考 |
| 21 | [2025年中国经济运行分析.md](knowledge-base/2025年中国经济运行分析.md) | 📄 经济参考 |

## 📂 项目结构

```
conan/
├── CLAUDE.md              ← 本文件
├── .claude/settings.json  ← 项目配置（含 skill 注册）
├── scripts/
│   ├── export-deepseek-chats.mjs  ← 会话导出脚本
│   └── categorize-chats.mjs       ← 分类脚本
├── knowledge-base/        ← 所有知识文章
└── deepseek-chats/        ← 空（原始会话已全部清理）
```

## 🔧 Skill

已创建 `deepseek-knowledge-pipeline` skill，可通过 `/deepseek-knowledge-pipeline` 调用。