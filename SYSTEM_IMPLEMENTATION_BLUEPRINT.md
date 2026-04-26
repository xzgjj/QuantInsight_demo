# QuantInsight System Implementation Blueprint

## 1. Product North Star

QuantInsight is a research workflow product, not a stock-picking bot. The system must help a user move from an investment question to traceable data, document evidence, AI-assisted reasoning, quantitative validation, report output, and alerts.

The core product loop is:

```text
Question -> Entity/Scope -> Data Pack -> Evidence Pack -> AI Analysis -> Validation -> Report/Alert
```

Every step must expose status, source, confidence, and next action. If the system cannot prove a fact, it must show the missing evidence instead of inventing a conclusion.

## 2. Benchmark Objects

| Object | What to learn | What not to copy |
|---|---|---|
| OpenBB Platform | Provider abstraction, standardized routers, Pydantic models, API/client consistency, data transformation pipeline. | A broad terminal-like command surface before the MVP proves one tight workflow. |
| FinGPT / FinRobot | Finance-specific AI workflows, RAG over filings/reports, multi-agent decomposition, benchmark mindset. | Prediction-first UX or opaque model outputs without local evidence. |
| Microsoft Qlib | Research-to-backtest workflow, data versioning, model experiment discipline, risk/return evaluation. | Heavy ML pipeline before daily-data strategy templates are stable. |
| vectorbt | Fast exploratory backtesting, signal-to-portfolio loop, metrics/trades/logs as first-class outputs. | Over-optimizing for high-dimensional quant experiments in the first stage. |
| Bloomberg / Koyfin / TradingView | Dense financial UI, watchlists, comparable company views, chart/table ergonomics. | Terminal breadth, paid-data assumptions, or trading execution workflows. |
| Fiscal.ai / Fintool | Question-first AI research, source-backed answers, filing/call/document retrieval, saved dashboards and alerts. | Opaque AI summaries that cannot be traced to evidence rows. |

Implementation references used in this blueprint:

- OpenBB architecture and provider routing: https://openbb.co/blog/exploring-the-architecture-behind-the-openbb-platform/
- OpenBB TET data pipeline: https://openbb.co/blog/the-openbb-platform-data-pipeline/
- FinGPT product and ecosystem overview: https://fingpt.io/
- Microsoft Qlib research overview: https://www.microsoft.com/en-us/research/publication/qlib-an-ai-oriented-quantitative-investment-platform/
- vectorbt documentation: https://vectorbt.dev/
- OpenBB Workspace docs: https://docs.openbb.co/workspace
- Bloomberg research workflow: https://professional.bloomberg.com/products/bloomberg-terminal/research/
- Fiscal.ai product reference: https://fiscal.ai/
- Fintool AI equity research reference: https://fintool.com/
- Koyfin product reference: https://www.koyfin.com/

## 3. Product UX Reference Model

The product should not look like a marketing page or a sparse demo. It should feel like a compact research workspace with a clear operating path.

Reference products and what they imply for QuantInsight:

| Reference | UX lesson | QuantInsight decision |
|---|---|---|
| OpenBB Workspace | A research workspace must let users compose data widgets and move from data to shared reports. | Use modular panels, not decorative sections. Every panel should map to an API/tool or report artifact. |
| Fiscal.ai / FinChat | Company research works best when traditional data tables, first-party IR content, and AI summaries live in the same context. | Keep AI guidance on the company page, with visible suggested tasks and evidence requirements. |
| Fintool | AI equity workflows should begin with natural-language questions, document scope, and source-backed answers. | Merge the AI research actions into one assistant panel: select task, confirm evidence scope, generate result, add to report. |
| Bloomberg / Koyfin | Financial users scan dense snapshots, watchlists, and comparable facts before reading long text. | Put company identity, price, metrics, catalysts, filings, and audit metadata above narrative. |
| FinRobot / financial agent papers | AI equity research needs structured company analysis, valuation/risk modules, and numerical support. | AI actions must be task-based: summarize, compare, find missing evidence, draft report, prepare backtest. |

### Layout Ratio Rules

The first implementation should follow these measurable layout constraints:

| Surface | Desktop grid | Mobile grid | Notes |
|---|---|---|---|
| App shell | `max-width: 1280px`, 24px outer padding | 16px outer padding | Keep top navigation stable. |
| Home hero | `main 68% / queue 32%` | single column | Hero height should be 260-340px, not full-screen. |
| Home body | `content 72% / watchlist 28%` | single column | Recommended companies should appear before generic tools. |
| Company header | `identity 42% / metrics 58%` | identity then metrics | Do not hide Apple/company identity behind generic text. |
| Company research body | `research 68% / AI+audit 32%` | single column | AI is a work panel, not a floating chatbot. |
| Filing page | `document rail 28% / extraction 72%` | single column | Timeline, candidates, and evidence stay visible together. |

### First Screen Wireframes

Home, desktop:

```text
1280 container
┌──────────────────────────────────────────────────────────────┐
│  QuantInsight / 投研工作台              中文 EN   登录        │ 64
├──────────────────────────────────────────────────────────────┤
│  68%: search + research thesis        │ 32%: 今日研究队列     │ 300
├───────────────────────────────────────┴──────────────────────┤
│  72%: 推荐研究公司 + 工作入口         │ 28%: 我的关注 + AI说明│
└──────────────────────────────────────────────────────────────┘
```

Home workflow card content requirements:

Each workflow card must be written as a concrete task surface, not as a simple navigation tile.

```text
Title      -> one workflow name
Summary    -> what the user can complete
Flow text  -> three plain-text steps, not independent mini buttons
Target     -> one card-level destination page or tool
Feedback   -> visible state after action starts
Visual     -> icon container + hover motion + optional data sparkline
```

Current task card model:

| Card | Summary requirement | Plain flow text |
|---|---|---|
| 公司研究 | Company identity, business structure, key metrics, catalysts, and comparable definitions. | 确认公司身份 / 查看指标来源 / 生成 AI 摘要 |
| 财报解析 | Upload validation, duplicate detection, chunks, metric candidates, low-confidence fields, and page evidence. | 校验文件 / 提取指标 / 回到原文页码 |
| 市场扫描 | Natural-language screening, threshold confirmation, candidate reasons, and exclusions. | 解析条件 / 确认阈值 / 输出候选池 |
| 回测实验室 | Hypothesis-to-template conversion, costs, trades, and bias checks. | 选择模板 / 设置成本 / 复核偏差 |

All production pages should share this visual grammar:

- top app shell with language and login;
- task cards with icon, summary, and plain flow text; the whole card is the only click target;
- at least one visual data element per research surface, such as sparkline, timeline, metric card, or evidence table;
- hover motion limited to `translateY(-2px)` or arrow movement, avoiding decorative animation that distracts from research work.
- page-specific controls must have visible state feedback; if a button appears on a page, it either navigates, changes state, or starts a mock/API task.

### Visual Review Targets

QuantInsight should be judged against these concrete visual targets before each stage commit:

| Area | Target | Current stage-2 expectation |
|---|---|---|
| Density | More information than a landing page, less than a terminal wall. | First screen shows identity, metrics, workflow status, AI task, audit, and next actions. |
| Proportion | Stable two-column desktop ratios with one-column mobile fallback. | Home `68/32`, company `42/58` header and `68/32` body, filing `28/72`. |
| Evidence visibility | A fact can be traced without leaving the current path. | Filing page shows parser, data version, metric table, page number, confidence, and selected reference state. |
| AI interaction | AI is a workflow panel, not four disconnected buttons. | One AI assistant panel controls task selection, evidence scope, generation, and report handoff. |
| Supporting context | Users see comparable reports and relevant news near the evidence path. | Filing rail includes report recommendations and company/industry news with selected state feedback. |
| Visual hierarchy | Primary thesis should lead; supporting process labels must not compete with it. | Home removes the three background process cards and uses “从问题进入，形成可追溯的研究结论” as the first-screen headline. |
| Filing analytics | Filing evidence should resemble an institutional report metric pack, not a three-number demo. | Stage 2 mock includes revenue, gross margin, operating income, operating margin, net income, diluted EPS, operating cash flow, and free cash flow. |

## 4. Primary User Journeys

Company page, desktop:

```text
1280 container
┌──────────────────────────────────────────────────────────────┐
│  QuantInsight / 投研工作台              中文 EN   登录        │ 64
├──────────────────────────────────────────────────────────────┤
│  42%: AAPL 苹果公司 identity/price     │ 58%: key metrics     │ 220
├────────────────────────────────────────┬─────────────────────┤
│  68%: thesis, catalysts, filings,      │ 32%: AI task panel   │
│       peer/backtest/report modules     │      + audit rail    │
└────────────────────────────────────────┴─────────────────────┘
```

Interaction state rules:

- Search has four states: empty, suggestions, selected entity, no result.
- Company panels have five states: loading, partial, warning, empty evidence, complete.
- AI work panel has five states: choose task, confirm evidence scope, running, review result, add to report.
- Login can remain a UI entry in this stage, but it must reserve the future authenticated state: user avatar, saved watchlist, research basket.

### 3.1 Company Research

1. User enters a ticker, company name, or natural language question.
2. System resolves candidates with exchange, country, currency, and confidence.
3. User selects one entity or accepts the top match.
4. System builds a company snapshot data pack:
   - quote
   - basic profile
   - key metrics
   - recent filings/news placeholders
   - data source metadata
5. UI shows a loading state by section, not a blank page.
6. If one provider fails, the failed block shows a provider warning while the rest of the page remains usable.
7. User can ask an AI question from the company context.
8. AI response must show tool calls, evidence ids, disclaimer status, and missing-evidence warnings.

Required UI states:

| State | User sees |
|---|---|
| resolving | Search suggestions with exchange/country hints. |
| loading | Section-level skeletons and task stage labels. |
| partial | Loaded quote/metrics remain visible while AI or filings continue. |
| warning | Data source warnings next to affected facts. |
| no evidence | Explicit message that the claim cannot be verified. |
| complete | Snapshot, evidence rail, AI brief, and next actions. |

### 3.2 Filing Analysis

1. User uploads or selects a filing.
2. System validates file type, size, hash, and duplicate status.
3. A task starts and emits SSE stages: queued, parsing, table extraction, chunking, metric candidates, done.
4. UI displays a timeline, page thumbnails placeholder, extracted metrics table, and low-confidence fields.
5. Every extracted metric links to source page and extraction method.
6. User can ask a filing-specific question.

Required failure behavior:

| Failure | Behavior |
|---|---|
| unsupported file | Reject before upload task starts. |
| duplicate hash | Reuse existing document record. |
| OCR needed | Mark as low confidence and queue OCR-capable parser later. |
| table parse failed | Preserve text chunks and show table warning. |

### 3.3 Natural Language Screening

1. User describes a screen, for example: "US software companies with high gross margin and positive FCF".
2. System extracts candidate filters and ambiguous terms.
3. UI shows an editable filter builder before execution.
4. User confirms or edits.
5. System returns candidates with include/exclude reasons, source metadata, and warnings.
6. User can save the screen or convert it to an alert.

Ambiguous terms must not run silently. "High", "cheap", "strong growth", and "low risk" need threshold suggestions and confirmation.

### 3.4 Backtest Lab

1. User picks a strategy template.
2. System asks for symbol universe, date range, rebalance frequency, costs, and benchmark.
3. Before running, UI shows data availability and bias warnings.
4. Backtest task emits SSE progress.
5. Result must include metrics, equity curve, trades, cost model, assumptions, bias checks, and data version.
6. User can save the run to a research project.

The MVP backtest remains daily-frequency and template-based. No intraday, options, leverage, or live trading in early phases.

### 3.5 Report and Alert

1. User saves snapshots, AI answers, charts, filing snippets, and backtests into a research basket.
2. System generates a draft report with citations.
3. User edits and exports.
4. Alerts can be created from price, volume, filings, metric thresholds, or saved screens.
5. Every alert execution records input data version and trigger reason.

## 5. API Contract Principles

All API responses use:

```json
{
  "data": {},
  "meta": {
    "source": "provider-or-service",
    "as_of": "2026-04-26T00:00:00Z",
    "data_version": "provider-version",
    "warnings": [],
    "took_ms": 12
  },
  "error": null
}
```

Errors should keep the same envelope shape when possible:

```json
{
  "data": null,
  "meta": {
    "source": "quantinsight",
    "as_of": "2026-04-26T00:00:00Z",
    "data_version": "runtime",
    "warnings": []
  },
  "error": {
    "code": "PROVIDER_UNAVAILABLE",
    "message": "Market data provider is unavailable.",
    "details": { "provider": "mock-provider" }
  }
}
```

## 6. MVP Endpoint Map

| Area | Endpoint | Purpose |
|---|---|---|
| Health | `GET /api/v1/health` | API, DB, Redis, provider status. |
| Companies | `GET /api/v1/companies/search?q=` | Resolve company candidates. |
| Companies | `GET /api/v1/companies/{symbol}/snapshot` | Company quote and metrics pack. |
| Tasks | `POST /api/v1/tasks/demo` | Create mock task for SSE plumbing. |
| Tasks | `GET /api/v1/tasks/{task_id}/events` | Stream `stage/warning/partial/result/error/done`. |
| AI | `POST /api/v1/ai/mock/company/{symbol}` | Produce auditable mock company answer. |
| Backtests | `POST /api/v1/backtests/mock` | Return metrics, costs, trades, and bias checks. |

Next endpoint group after Stage 1:

| Area | Endpoint | Purpose |
|---|---|---|
| Documents | `POST /api/v1/documents` | Upload and validate filing. |
| Documents | `GET /api/v1/documents/{id}` | Document metadata and parse status. |
| Documents | `GET /api/v1/documents/{id}/chunks` | Parsed text chunks with page references. |
| Documents | `GET /api/v1/documents/{id}/metrics` | Extracted metric candidates. |
| Screeners | `POST /api/v1/screeners/parse` | NL query to editable filter draft. |
| Screeners | `POST /api/v1/screeners/run` | Run confirmed filter set. |
| Reports | `POST /api/v1/research-baskets` | Save evidence and analysis artifacts. |
| Alerts | `POST /api/v1/alerts` | Create alert rule. |

## 7. Data Model Direction

Stage 1 already has:

- `tickers`
- `quotes`
- `metrics`
- `documents`
- `analyses`
- `tasks`

Stage 2 should add:

| Table | Key fields |
|---|---|
| `document_chunks` | `document_id`, `page_start`, `page_end`, `text`, `chunk_hash`, `parser`, `confidence`. |
| `document_tables` | `document_id`, `page`, `table_json`, `parser`, `confidence`. |
| `metric_observations` | `ticker_id`, `metric_name`, `value`, `unit`, `period`, `source_document_id`, `page`, `confidence`, `data_version`. |
| `evidence_items` | `evidence_type`, `source`, `source_id`, `locator`, `quote`, `hash`, `created_at`. |
| `provider_runs` | `provider`, `endpoint`, `status`, `latency_ms`, `request_hash`, `error`, `created_at`. |

Stage 3 should add:

| Table | Key fields |
|---|---|
| `ai_sessions` | `user_question`, `scope`, `status`, `model`, `disclaimer_required`. |
| `ai_messages` | `session_id`, `role`, `content`, `evidence_ids`, `token_usage`. |
| `tool_call_logs` | `session_id`, `tool_name`, `input_json`, `output_summary`, `status`, `latency_ms`. |

Stage 4-5 should add:

| Table | Key fields |
|---|---|
| `screens` | `name`, `filter_json`, `universe`, `created_at`. |
| `screen_runs` | `screen_id`, `status`, `result_count`, `data_version`, `warnings`. |
| `backtest_runs` | `strategy`, `params_json`, `metrics_json`, `cost_model_json`, `bias_checks_json`, `data_version`. |
| `backtest_trades` | `run_id`, `symbol`, `side`, `quantity`, `price`, `fee`, `executed_at`. |
| `research_baskets` | `name`, `description`, `created_at`. |
| `research_items` | `basket_id`, `item_type`, `payload_json`, `evidence_ids`. |
| `alerts` | `rule_type`, `rule_json`, `status`, `last_checked_at`. |
| `alert_events` | `alert_id`, `triggered_at`, `reason`, `data_version`, `payload_json`. |

## 8. Internal Service Boundaries

Keep the MVP as a modular monolith:

```text
api/v1
  -> core envelope/config
  -> datahub providers
  -> documents parser service
  -> ai audit/tool orchestration
  -> quant backtest service
  -> tasks/event service
  -> db models/repositories
```

Provider rule:

```text
Normalize query -> extract provider data -> normalize response -> attach provenance
```

AI rule:

```text
Intent -> allowed tools -> evidence pack -> answer draft -> citation check -> audited response
```

Backtest rule:

```text
Parameters -> data availability -> signal generation -> portfolio simulation -> bias/cost checks -> result
```

## 9. Callable Tool Plan

| Tool | Stage | Purpose |
|---|---|---|
| `get_company_snapshot` | 1 | Company facts and metrics. |
| `search_companies` | 1 | Entity resolution. |
| `run_backtest_template` | 1-2 | Daily strategy validation. |
| `get_provider_health` | 1 | Runtime diagnostics. |
| `get_document_chunks` | 2 | Filing RAG retrieval. |
| `get_metric_observations` | 2 | Auditable financial metric lookup. |
| `parse_screen_query` | 4 | NL to filter draft. |
| `run_screen` | 4 | Candidate generation. |
| `create_report_draft` | 4 | Evidence-backed report generation. |
| `create_alert_rule` | 5 | Convert research condition to monitoring rule. |

Tool calls must be logged with input, output summary, evidence ids, status, latency, model, token usage where relevant, and disclaimer status.

## 10. Stage Gates

### Stage 1: MVP Base

Acceptance:

- Docker Compose config is valid.
- Backend installs on Python 3.11/3.12 and passes ruff + pytest.
- Frontend installs and passes lint + tests + build.
- `/api/v1/health` reports API, DB, Redis, and provider status.
- Company page renders mock snapshot through the real API envelope.
- SSE emits `stage/warning/partial/result/error/done` contract, even if some events are not used by a demo task.
- AI mock returns auditable tool calls and evidence ids.
- Backtest mock returns cost model, trades, metrics, bias checks, and data version.

### Stage 2: Data and Filing Loop

Acceptance:

- Upload validation covers file type, size, hash, and duplicate handling.
- Parse task emits observable stages.
- Extracted metrics link to document page and parser confidence.
- Provider failures degrade section-by-section.

Stage 2 MVP implementation policy:

- Keep parser integration behind a `documents` service boundary.
- Use a mock parser for API/UX/audit plumbing until real PDF parser benchmarks are run.
- Treat PyMuPDF as the likely first text/layout provider, pdfplumber as the likely first table provider, Camelot as a table fallback, and PaddleOCR as a later OCR provider for scanned filings.
- Store parser name, confidence, page locator, chunk hash, and source text with every extracted candidate.
- Reject unsupported files before task execution and deduplicate by SHA-256 hash.

Stage 2 implemented endpoint set:

| Endpoint | Purpose |
|---|---|
| `POST /api/v1/documents` | Upload, validate, hash, deduplicate, parse, chunk, and extract metric candidates. |
| `GET /api/v1/documents/{document_id}` | Retrieve document metadata and parse summary. |
| `GET /api/v1/documents/{document_id}/chunks` | Retrieve page-aware text chunks. |
| `GET /api/v1/documents/{document_id}/metrics` | Retrieve metric candidates with page and confidence. |

Stage 2 implemented UX surface:

| Surface | Implemented behavior |
|---|---|
| Home | Chinese-first headline, search entry, research queue, recommended companies, watchlist, and single-click workflow cards. |
| Company | Snapshot, research brief, catalyst cards, AI task panel, filing evidence path, backtest path, and audit rail. |
| Filings | Upload state, parser timeline, low-confidence warning, 8-metric candidate table, evidence preview, wide key data glyph, report recommendations, and company/industry news. |
| Backtests | Template switch, cost switch, bias checks, and visible trade output. |

### Stage 3: AI Copilot and Evidence Chain

Acceptance:

- Every factual answer cites evidence or says evidence is missing.
- Tool calls are allowlisted.
- AI audit records are queryable.
- No answer gives personalized buy/sell advice.

### Stage 4: Screener, Peers, Report

Acceptance:

- Ambiguous screen terms require confirmation.
- Include/exclude reasons are visible.
- Peer set is editable.
- Reports preserve citations.

### Stage 5: Backtesting and Alerts

Acceptance:

- Backtests store data version, costs, trades, assumptions, and bias checks.
- Alerts can be paused and explain trigger reasons.
- Every triggered alert records data version and source metadata.

## 11. Validation Program Requirements

The automated validation script must:

- detect Python, Node, pnpm, Docker, and Docker Compose versions;
- warn when Node is not LTS but avoid blocking local smoke tests;
- validate Docker Compose syntax;
- optionally start local services for integration checks;
- run backend ruff and pytest;
- run frontend lint, tests, and production build;
- optionally run Alembic upgrade/downgrade checks when services are available;
- stop on first hard failure and print the failing phase.

## 12. Review Loop

Each implementation stage must go through three reviews:

1. Contract review: API envelope, SSE events, data provenance, and database migration.
2. UX review: user path, loading/partial/error states, and visible evidence.
3. Engineering review: tests, lint/build, dependency risk, and rollback notes.

Git commit, push, and GitHub branch creation require explicit user approval after tests pass.
