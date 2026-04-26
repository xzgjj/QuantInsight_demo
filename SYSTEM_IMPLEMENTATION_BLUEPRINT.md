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

Implementation references used in this blueprint:

- OpenBB architecture and provider routing: https://openbb.co/blog/exploring-the-architecture-behind-the-openbb-platform/
- OpenBB TET data pipeline: https://openbb.co/blog/the-openbb-platform-data-pipeline/
- FinGPT product and ecosystem overview: https://fingpt.io/
- Microsoft Qlib research overview: https://www.microsoft.com/en-us/research/publication/qlib-an-ai-oriented-quantitative-investment-platform/
- vectorbt documentation: https://vectorbt.dev/

## 3. Primary User Journeys

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

## 4. API Contract Principles

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

## 5. MVP Endpoint Map

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

## 6. Data Model Direction

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

## 7. Internal Service Boundaries

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

## 8. Callable Tool Plan

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

## 9. Stage Gates

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

## 10. Validation Program Requirements

The automated validation script must:

- detect Python, Node, pnpm, Docker, and Docker Compose versions;
- warn when Node is not LTS but avoid blocking local smoke tests;
- validate Docker Compose syntax;
- optionally start local services for integration checks;
- run backend ruff and pytest;
- run frontend lint, tests, and production build;
- optionally run Alembic upgrade/downgrade checks when services are available;
- stop on first hard failure and print the failing phase.

## 11. Review Loop

Each implementation stage must go through three reviews:

1. Contract review: API envelope, SSE events, data provenance, and database migration.
2. UX review: user path, loading/partial/error states, and visible evidence.
3. Engineering review: tests, lint/build, dependency risk, and rollback notes.

Git commit, push, and GitHub branch creation require explicit user approval after tests pass.
