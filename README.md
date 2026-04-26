# QuantInsight Demo

AI 原生金融分析与轻量量化研究平台原型项目。

QuantInsight Demo 处于 0-1 阶段，当前重点是完成产品规划、系统架构、核心交互原型、技术选型和工程启动标准，为后续正式开发打基础。

## 项目定位

QuantInsight 不是低价 Bloomberg，也不是单纯 AI 聊天工具，而是面向个人投资者、独立研究者、财经内容创作者和轻量量化用户的中文投研工作台。

核心目标：

```text
把金融数据、财报、公告、新闻、AI 分析和量化验证组织成可追溯、可审计、可沉淀的研究流程。
```

## 核心能力规划

| 模块 | 说明 |
|---|---|
| 工作台 | 市场概览、关注列表、预警、最近研究、AI 入口 |
| 公司研究 | 行情、财务、估值、新闻公告、AI 投研摘要、来源追溯 |
| 财报解析 | PDF 上传、表格解析、指标提取、原文页码、异常检测 |
| 同行比较 | 自动同行推荐、估值/成长/盈利/质量对比、AI 差异解释 |
| 自然语言筛选 | 将用户描述转为可编辑筛选条件，并展示候选池 |
| 量化回测 | 策略模板、成本模型、净值曲线、交易记录、偏差检查 |
| 报告与研究项目 | 研究篮、笔记、引用、报告导出 |
| 预警系统 | 价格、成交量、公告、财务指标、筛选器触发 |

## 当前阶段

当前仓库主要包含：

- 产品研究文档。
- 竞品与市场分析。
- 交互流程和数据库/API 设计。
- 设计系统与技术架构选型。
- v1/v2 SVG 产品原型图。
- 0-1 架构报告与实现计划。
- AI 协作与工程执行规范。

尚未创建实际前后端代码工程。

## 目录结构

```text
QuantInsight/
  assets/
    product-mockups/              # 产品原型图与线框图
  doc/                            # 产品、竞品、架构、交互、市场分析文档
  AGENT_EXECUTION_PROTOCOL.md     # AI/代码代理执行规范
  ARCHITECTURE_0_TO_1_REPORT.md   # 0-1 架构与交付规划报告
  CLAUDE.md                       # 长期项目准则
  implementation_plan.md          # 项目实现路径
  notes.txt                       # 当前进度与上下文断点
  diff.md                         # 关键变更记录
  README.md                       # 项目入口说明
```

## 重点文档阅读顺序

1. [ARCHITECTURE_0_TO_1_REPORT.md](./ARCHITECTURE_0_TO_1_REPORT.md)
2. [doc/金融分析平台-01-研究方案报告.md](./doc/金融分析平台-01-研究方案报告.md)
3. [doc/金融分析平台-02-概念设计与落地流程.md](./doc/金融分析平台-02-概念设计与落地流程.md)
4. [doc/金融分析平台-04-设计系统与技术架构选型.md](./doc/金融分析平台-04-设计系统与技术架构选型.md)
5. [doc/金融分析平台-08-市场现实交付分析与友商优秀实践.md](./doc/金融分析平台-08-市场现实交付分析与友商优秀实践.md)
6. [implementation_plan.md](./implementation_plan.md)

## 产品原型

v2 产品级原型图：

- [工作台](./assets/product-mockups/v2-dashboard-prototype.svg)
- [公司研究](./assets/product-mockups/v2-company-research-prototype.svg)
- [财报解析](./assets/product-mockups/v2-filing-analysis-prototype.svg)
- [同行比较](./assets/product-mockups/v2-peer-comparison-prototype.svg)
- [自然语言筛选](./assets/product-mockups/v2-screener-prototype.svg)
- [量化回测](./assets/product-mockups/v2-backtest-prototype.svg)

## 技术栈方向

| 层级 | 推荐 |
|---|---|
| 前端 | Next.js、React、TypeScript、Tailwind CSS、shadcn/ui |
| 状态 | TanStack Query、Zustand |
| 表格图表 | TanStack Table、TradingView Lightweight Charts、ECharts |
| 后端 | FastAPI、Pydantic、SQLAlchemy 2.x |
| 数据库 | PostgreSQL、Redis、pgvector |
| 数据源 | AKShare、Tushare、yfinance、SEC EDGAR、FRED |
| 文档解析 | PyMuPDF、pdfplumber、Camelot、PaddleOCR |
| AI/RAG | OpenAI-compatible LLM、LangChain/LlamaIndex 可选 |
| 量化 | pandas、numpy、vectorbt 思路，后续 Backtrader/zipline-reloaded/Qlib |

## 工程约束

- 0-1 阶段默认模块化单体。
- AI 调用必须可审计。
- 回测必须记录数据版本、成本模型、交易记录和偏差检查。
- 数据库迁移必须通过迁移脚本执行。
- 所有金融数据必须包含来源、时间、单位、口径。
- 不输出买入/卖出等个性化投资建议。

## 后续开发启动建议

第一阶段建议先完成：

1. 创建 `frontend/` 与 `backend/` 工程。
2. 建立 FastAPI + Next.js + PostgreSQL + Redis 基座。
3. 建立数据库迁移机制。
4. 实现公司搜索与公司快照 mock/真实数据闭环。
5. 实现一个 AI Copilot 工具调用审计样例。
6. 实现一个日频回测模板样例。

## 参考对象

- Bloomberg Terminal
- Wind / Choice
- Koyfin
- FinChat
- OpenBB
- QuantConnect
- TradingView
- Microsoft Qlib

## 合规声明

本项目用于金融数据分析、研究辅助和量化验证原型，不提供个性化投资建议，不承诺收益，不替代持牌投资顾问。
