# QuantInsight Demo

QuantInsight Demo 是一个 AI 原生金融分析与轻量量化研究平台的 0-1 原型项目。

本项目当前不是完整可运行产品，而是用于沉淀产品定位、竞品对标、交互流程、系统架构、核心原型和后续工程建设标准的项目基线。

## 项目声明

QuantInsight 面向个人投资者、独立研究者、财经内容创作者和轻量量化用户，目标是构建一个中文友好、可追溯、可审计、可验证的投研工作台。

它不是：

- 低价版 Bloomberg。
- 单纯 AI 聊天工具。
- 自动荐股或自动交易系统。
- 保证收益的投资决策系统。

它要解决的核心问题是：

```text
把金融数据、财报、公告、新闻、AI 分析和量化验证组织成可追溯、可审计、可沉淀的研究流程。
```

## 项目核心能力

| 能力 | 说明 |
|---|---|
| 工作台 | 聚合市场概览、关注列表、预警、最近研究和 AI 入口 |
| 公司研究 | 查看行情、财务、估值、新闻公告、AI 摘要和来源证据 |
| 财报解析 | 解析 PDF 财报，提取指标、定位原文页码、识别异常 |
| 同行比较 | 对公司进行估值、成长、盈利、质量和风险比较 |
| 自然语言筛选 | 将用户描述转换为可编辑、可复核的筛选条件 |
| 量化回测 | 用日频策略模板验证假设，展示成本、交易和偏差检查 |
| 研究报告 | 将图表、数据、AI 结论和引用沉淀为研究材料 |
| 预警监控 | 对价格、成交量、公告、财务指标和筛选器进行持续监控 |

## 如何理解这个项目

建议按以下顺序理解：

1. 先看项目定位：它是投研工作台，不是荐股工具。
2. 再看用户路径：用户从问题进入，经由数据、证据、AI 和验证形成结论。
3. 再看系统架构：前端工作台、后端数据服务、AI 工具调用、量化引擎和审计链路如何配合。
4. 最后看原型图：确认核心页面如何承载真实投研行为。

## 当前仓库内容

```text
QuantInsight/
  assets/
    product-mockups/              # 产品线框图与原型图
  doc/                            # 产品、竞品、交互、架构、市场分析文档
  AGENT_EXECUTION_PROTOCOL.md     # AI/代码代理执行规范
  ARCHITECTURE_0_TO_1_REPORT.md   # 0-1 架构与交付规划报告
  CLAUDE.md                       # 长期项目准则
  implementation_plan.md          # 实施规划
  notes.txt                       # 当前进度与上下文断点
  diff.md                         # 关键变更记录
  README.md                       # 项目声明与入口说明
```

当前实际被 Git 追踪的公开入口文件以仓库状态为准。部分规划文档和原型资产可能按 `.gitignore` 被排除，用于本地规划和建设过程。

## 关键文档入口

如果本地包含完整文档，推荐阅读：

| 文档 | 用途 |
|---|---|
| `ARCHITECTURE_0_TO_1_REPORT.md` | 了解 0-1 架构、技术选型、风险和交付标准 |
| `doc/金融分析平台-01-研究方案报告.md` | 了解产品战略、用户、范围和 MVP 判断 |
| `doc/金融分析平台-02-概念设计与落地流程.md` | 了解用户行为、交互状态、接口和数据库设计 |
| `doc/金融分析平台-04-设计系统与技术架构选型.md` | 了解设计系统、核心抽象和模块选型 |
| `doc/金融分析平台-08-市场现实交付分析与友商优秀实践.md` | 了解市场需求、友商优秀实践和现实交付标准 |
| `implementation_plan.md` | 了解后续实施路线、阶段任务和验收标准 |

## 原型图入口

核心产品原型位于：

```text
assets/product-mockups/
```

重点原型包括：

- 工作台
- 公司研究
- 财报解析
- 同行比较
- 自然语言筛选
- 量化回测

这些原型用于验证用户路径、信息密度、状态反馈、AI 证据链和量化审计要求，不是最终 UI 定稿。

## 构建项目的理解方式

后续真正进入开发时，应把本项目理解为一个模块化单体系统：

```text
前端工作台
  -> API 服务
  -> 数据源适配层
  -> 文档解析服务
  -> AI 工具调用与审计
  -> 量化回测引擎
  -> 预警与报告服务
  -> PostgreSQL / Redis / 对象存储 / 向量检索
```

第一性原则：

- 数据必须可追溯。
- AI 必须可审计。
- 回测必须可复现。
- 用户路径必须闭环。
- 合规边界必须清晰。

## 技术方向

当前规划中的主技术方向：

| 层级 | 方向 |
|---|---|
| 前端 | Next.js、React、TypeScript、Tailwind CSS、shadcn/ui |
| 状态管理 | TanStack Query、Zustand |
| 表格图表 | TanStack Table、TradingView Lightweight Charts、ECharts |
| 后端 | FastAPI、Pydantic、SQLAlchemy |
| 数据库 | PostgreSQL、Redis、pgvector |
| 数据源 | AKShare、Tushare、yfinance、SEC EDGAR、FRED |
| 文档解析 | PyMuPDF、pdfplumber、Camelot、PaddleOCR |
| AI/RAG | OpenAI-compatible LLM、受控工具调用、引用校验 |
| 量化 | pandas、numpy、vectorbt 思路，后续参考 Backtrader、zipline-reloaded、Qlib |

具体实施阶段、环境基线、接口验收和 POC 任务不放在 README 中，应以 `implementation_plan.md` 和架构报告为准。

当前数据源状态：

- 默认仍使用 mock provider，保证本地测试和截图稳定。
- 财报抓取已预留 SEC EDGAR live provider：设置 `QI_FILING_PROVIDER=sec`，并把 `QI_SEC_USER_AGENT` 改成真实产品/联系人后可走后端抓取。
- 当前 Codex 本地连接器没有财经 MCP，后续 Alpha Vantage / FMP / OpenBB MCP 或 REST 接入应放在 provider 层，不直接耦合前端页面。

## 工程原则

- 0-1 阶段默认模块化单体。
- 数据库变更必须通过迁移脚本执行。
- 所有金融数据必须包含来源、时间、单位和口径。
- AI 输出必须保留来源、工具调用和审计记录。
- 回测必须记录数据版本、成本模型、交易记录和偏差检查。
- 不输出买入、卖出、目标价保证等个性化投资建议。

## 对标对象

本项目参考但不复制以下产品和方案：

- Bloomberg Terminal
- Wind / Choice
- Koyfin
- FinChat
- OpenBB
- QuantConnect
- TradingView
- Microsoft Qlib

## 合规声明

本项目用于金融数据分析、研究辅助和量化验证原型，不提供个性化投资建议，不承诺收益，不替代持牌投资顾问或任何合规金融服务。
