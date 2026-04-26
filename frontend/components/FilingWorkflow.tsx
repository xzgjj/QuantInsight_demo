"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bot,
  Building2,
  CheckCircle2,
  Database,
  FileText,
  Search,
  Star,
  UserCheck
} from "lucide-react";

import { AppShellNav } from "@/components/AppShellNav";
import { KeyDataGlyph } from "@/components/KeyDataGlyph";
import { MiniTrendChart } from "@/components/MiniTrendChart";
import { StatusDot } from "@/components/StatusDot";

type CompanyOption = {
  symbol: string;
  name: string;
  reason: string;
  list: "推荐" | "收藏";
  hasFilingData: boolean;
};

const companyOptions: CompanyOption[] = [
  {
    symbol: "AAPL",
    name: "苹果公司",
    reason: "SEC 财报、核心指标和审查样例已接入",
    list: "推荐",
    hasFilingData: true
  },
  {
    symbol: "MSFT",
    name: "微软",
    reason: "云业务和毛利率适合后续同行比较",
    list: "收藏",
    hasFilingData: false
  },
  {
    symbol: "NVDA",
    name: "英伟达",
    reason: "数据中心收入和现金流需要持续跟踪",
    list: "收藏",
    hasFilingData: false
  }
];

const stages = [
  { label: "定位公司", detail: "Ticker -> CIK", status: "done" },
  { label: "抓取财报", detail: "10-K、10-Q、8-K", status: "active" },
  { label: "标准化事实", detail: "指标、单位、周期", status: "waiting" },
  { label: "审查图表", detail: "异常、人工、AI", status: "waiting" }
];

const metricCandidates = [
  { metric: "收入 Revenue", value: "383,285", unit: "USD", page: 1, confidence: "0.66" },
  { metric: "毛利率 Gross Margin", value: "45.6", unit: "%", page: 1, confidence: "0.66" },
  { metric: "经营利润 Operating Income", value: "114,301", unit: "USD", page: 2, confidence: "0.72" },
  { metric: "经营利润率 Operating Margin", value: "29.8", unit: "%", page: 2, confidence: "0.72" },
  { metric: "净利润 Net Income", value: "96,995", unit: "USD", page: 2, confidence: "0.70" },
  { metric: "摊薄 EPS Diluted EPS", value: "6.42", unit: "USD/share", page: 3, confidence: "0.74" },
  { metric: "经营现金流 Operating Cash Flow", value: "118,254", unit: "USD", page: 4, confidence: "0.76" },
  { metric: "自由现金流 Free Cash Flow", value: "108,807", unit: "USD", page: 4, confidence: "0.73" }
];

const reportRecommendations = [
  "Apple FY2025 Services Margin Review",
  "Consumer Hardware Replacement Cycle Notes",
  "Peer Margin Bridge: Apple vs Microsoft"
];

const companyNews = [
  "公司公告：服务收入继续成为毛利率核心变量",
  "行业新闻：高端手机换机周期延长",
  "供应链：硬件成本压力等待下一季验证"
];

const filingSources = [
  { form: "10-K", date: "2025-10-31", period: "2025-09-27", source: "SEC EDGAR", status: "已选中" },
  { form: "10-Q", date: "2025-08-01", period: "2025-06-28", source: "SEC EDGAR", status: "可比较" },
  { form: "8-K", date: "2025-05-02", period: "事件公告", source: "SEC EDGAR", status: "补充事件" }
];

const analysisSources = [
  { label: "人工审查", icon: UserCheck, detail: "确认自由现金流与经营现金流口径一致。" },
  { label: "AI 审查", icon: Bot, detail: "检查毛利率异常点是否需要回到分部收入。" },
  { label: "内部资料", icon: Database, detail: "服务收入韧性跟踪，不覆盖公开财报事实。" }
];

export function FilingWorkflow() {
  const [query, setQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<CompanyOption | null>(null);
  const [action, setAction] = useState<"idle" | "fetched" | "selected" | "reviewed" | "uploaded">("idle");
  const [selectedReport, setSelectedReport] = useState(reportRecommendations[0]);
  const [selectedNews, setSelectedNews] = useState(companyNews[0]);
  const [reviewStatus, setReviewStatus] = useState("待审查");
  const [searchMessage, setSearchMessage] = useState("先搜索或点击左侧公司，页面才会显示财报数据。");

  const hasSelectedFiling = selectedCompany?.hasFilingData && action !== "idle" && action !== "fetched";
  const activeMessage = useMemo(() => {
    if (!selectedCompany) return searchMessage;
    if (!selectedCompany.hasFilingData) return `${selectedCompany.symbol} 已选中，但当前 mock 数据未覆盖该公司。`;
    if (action === "fetched") return `已从 SEC-like provider 抓取 ${selectedCompany.symbol} 财报列表，等待选择目标 filing。`;
    if (action === "selected") return "已选中 10-K，8 个核心财务事实进入图表审查。";
    if (action === "reviewed") return "自由现金流图表已由人工审查确认，可加入证据链。";
    if (action === "uploaded") return "内部资料已加入研究上下文，但不会覆盖公开财报事实。";
    return "已选择公司，点击 10-K 后再展示指标候选和图表审查。";
  }, [action, searchMessage, selectedCompany]);

  function selectCompany(company: CompanyOption) {
    setSelectedCompany(company);
    setQuery(company.symbol);
    setAction(company.hasFilingData ? "fetched" : "idle");
    setReviewStatus("待审查");
    setSearchMessage(`${company.symbol} 已进入财报审查上下文。`);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = query.trim().toUpperCase();
    const found = companyOptions.find(
      (company) => company.symbol === normalized || company.name.includes(query.trim())
    );
    if (found) {
      selectCompany(found);
      return;
    }
    setSelectedCompany(null);
    setAction("idle");
    setSearchMessage(`没有找到 ${query.trim() || "空查询"} 的可抓取公司，请换一个代码或公司名。`);
  }

  return (
    <main className="min-h-screen bg-panel">
      <AppShellNav />

      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-5 px-6 py-6 lg:grid-cols-[1fr_420px]">
          <div>
            <div className="text-sm font-medium text-graphite">财报抓取与审查工作流</div>
            <h1 className="mt-2 text-4xl font-semibold text-ink">财报审查</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-graphite">
              先定位公司，再抓取公开财报；公开财报、内部资料、人工审查和 AI 检查共同进入证据链。
            </p>
          </div>
          <form className="self-end rounded-md border border-line bg-panel p-3 shadow-sm" onSubmit={handleSearch}>
            <label className="text-xs font-medium text-graphite" htmlFor="filing-company-search">
              搜索并抓取
            </label>
            <div className="mt-2 flex gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-line bg-white px-3 py-2">
                <Search aria-hidden="true" className="h-4 w-4 text-graphite" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none"
                  id="filing-company-search"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="输入公司或代码，如 AAPL"
                  value={query}
                />
              </div>
              <button className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white" type="submit">
                抓取
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[0.28fr_0.72fr]">
        <aside className="space-y-4">
          <section className="rounded-md border border-line bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Building2 aria-hidden="true" className="h-5 w-5 text-graphite" />
              <h2 className="text-base font-semibold text-ink">公司推荐</h2>
            </div>
            <div className="mt-3 space-y-2">
              {companyOptions.map((company) => (
                <button
                  className={`w-full rounded-md border p-3 text-left transition hover:border-ink ${
                    selectedCompany?.symbol === company.symbol ? "border-ink bg-panel" : "border-line bg-white"
                  }`}
                  key={company.symbol}
                  onClick={() => selectCompany(company)}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-ink">{company.symbol} · {company.name}</span>
                    <span className="inline-flex items-center gap-1 text-xs text-graphite">
                      {company.list === "收藏" ? <Star aria-hidden="true" className="h-3 w-3" /> : null}
                      {company.list}
                    </span>
                  </div>
                  <div className="mt-1 text-xs leading-5 text-graphite">{company.reason}</div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-line bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <FileText aria-hidden="true" className="h-5 w-5 text-graphite" />
              <h2 className="text-base font-semibold text-ink">
                {selectedCompany ? `${selectedCompany.symbol} · SEC 财报` : "未选择公司"}
              </h2>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-graphite">状态</dt>
                <dd className="flex items-center gap-2 font-medium text-ink">
                  <StatusDot tone={selectedCompany?.hasFilingData ? "warning" : "neutral"} />
                  {selectedCompany ? "抓取就绪" : "等待搜索或选择"}
                </dd>
              </div>
              <div>
                <dt className="text-graphite">Parser</dt>
                <dd className="font-medium text-ink">{selectedCompany?.hasFilingData ? "sec-edgar-mock" : "-"}</dd>
              </div>
              <div>
                <dt className="text-graphite">Data version</dt>
                <dd className="font-medium text-ink">
                  {selectedCompany?.hasFilingData ? "stage3-sec-edgar-mock-v1" : "-"}
                </dd>
              </div>
            </dl>
            {selectedCompany?.hasFilingData ? (
              <div className="mt-4 text-positive">
                <MiniTrendChart tone="positive" />
              </div>
            ) : null}
            <div className="mt-4 grid gap-2">
              <button
                className="rounded-md border border-line bg-white px-3 py-2 text-left text-sm text-ink hover:border-ink disabled:text-graphite"
                disabled={!selectedCompany?.hasFilingData}
                onClick={() => setAction("fetched")}
                type="button"
              >
                抓取公开财报
              </button>
              <button
                className="rounded-md border border-line bg-white px-3 py-2 text-left text-sm text-ink hover:border-ink disabled:text-graphite"
                disabled={!selectedCompany?.hasFilingData}
                onClick={() => setAction("selected")}
                type="button"
              >
                选择 10-K
              </button>
              <button
                className="rounded-md border border-line bg-white px-3 py-2 text-left text-sm text-ink hover:border-ink disabled:text-graphite"
                disabled={!hasSelectedFiling}
                onClick={() => {
                  setAction("reviewed");
                  setReviewStatus("人工已确认");
                }}
                type="button"
              >
                提交图表审查
              </button>
              <button
                className="rounded-md border border-line bg-white px-3 py-2 text-left text-sm text-ink hover:border-ink disabled:text-graphite"
                disabled={!selectedCompany}
                onClick={() => setAction("uploaded")}
                type="button"
              >
                上传内部资料
              </button>
            </div>
          </section>

          <section className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4" />
              <p>内部资料只能作为研究上下文，不能覆盖公开财报事实；AI 结论必须引用证据。</p>
            </div>
          </section>

          {selectedCompany?.hasFilingData ? (
            <section className="rounded-md border border-line bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-ink">抓取来源</h2>
              <div className="mt-3 space-y-2">
                {filingSources.map((filing) => (
                  <div className="rounded-md border border-line bg-panel p-3" key={`${filing.form}-${filing.date}`}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-semibold text-ink">{filing.form}</span>
                      <span className="text-xs text-graphite">{filing.status}</span>
                    </div>
                    <div className="mt-1 text-xs leading-5 text-graphite">
                      {filing.source} · {filing.date} · {filing.period}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </aside>

        <div className="space-y-4">
          <section className="rounded-md border border-line bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-ink">解析时间线</h2>
            <div className="mt-3 rounded-md border border-line bg-panel px-3 py-2 text-sm text-graphite">
              {activeMessage}
            </div>
            {selectedCompany?.hasFilingData ? (
              <div className="mt-4 grid gap-3 md:grid-cols-4">
                {stages.map((stage) => (
                  <div className="rounded-md border border-line bg-panel p-4" key={stage.label}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-ink">{stage.label}</div>
                      {stage.status === "done" ? (
                        <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-positive" />
                      ) : null}
                    </div>
                    <div className="mt-2 text-sm text-graphite">{stage.detail}</div>
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          {!selectedCompany ? (
            <section className="rounded-md border border-dashed border-line bg-white p-8 text-center shadow-sm">
              <h2 className="text-base font-semibold text-ink">等待选择公司</h2>
              <p className="mt-2 text-sm text-graphite">
                默认不展示财报数据。请搜索公司，或点击左侧推荐/收藏后进入抓取和审查流程。
              </p>
            </section>
          ) : null}

          {selectedCompany && !selectedCompany.hasFilingData ? (
            <section className="rounded-md border border-line bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-ink">暂无财报样例数据</h2>
              <p className="mt-2 text-sm leading-6 text-graphite">
                {selectedCompany.symbol} 已进入上下文，但当前前端样例只内置 AAPL。后端已预留 SEC EDGAR live provider，
                可用配置切换到真实抓取。
              </p>
            </section>
          ) : null}

          {hasSelectedFiling ? (
            <>
              <section className="rounded-md border border-line bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-ink">指标候选</h2>
                <div className="mt-4 overflow-hidden rounded-md border border-line">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="bg-panel text-graphite">
                      <tr>
                        <th className="px-4 py-3 font-medium">指标</th>
                        <th className="px-4 py-3 font-medium">数值</th>
                        <th className="px-4 py-3 font-medium">单位</th>
                        <th className="px-4 py-3 font-medium">页码</th>
                        <th className="px-4 py-3 font-medium">置信度</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metricCandidates.map((item) => (
                        <tr className="border-t border-line" key={item.metric}>
                          <td className="px-4 py-3 font-medium text-ink">{item.metric}</td>
                          <td className="px-4 py-3 text-ink">{item.value}</td>
                          <td className="px-4 py-3 text-graphite">{item.unit}</td>
                          <td className="px-4 py-3 text-graphite">{item.page}</td>
                          <td className="px-4 py-3 text-graphite">{item.confidence}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="rounded-md border border-line bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-ink">图表审查工具</h2>
                    <p className="mt-2 text-sm leading-6 text-graphite">
                      用图表把指标变化、异常点和审查结论绑定起来。当前审查状态：{reviewStatus}。
                    </p>
                  </div>
                  <button
                    className="rounded-md bg-ink px-3 py-2 text-sm font-medium text-white"
                    onClick={() => {
                      setAction("reviewed");
                      setReviewStatus("人工已确认");
                    }}
                    type="button"
                  >
                    确认自由现金流
                  </button>
                </div>
                <svg aria-hidden="true" className="mt-5 h-48 w-full" viewBox="0 0 960 220">
                  <path d="M40 174 H920" stroke="#d8dee8" strokeWidth="2" />
                  <path d="M120 40 V182 M300 40 V182 M480 40 V182 M660 40 V182 M840 40 V182" stroke="#eef2f7" strokeWidth="2" />
                  <path
                    d="M60 156 C160 138, 220 144, 310 120 S470 72, 590 96 S720 124, 900 62"
                    fill="none"
                    stroke="#067647"
                    strokeLinecap="round"
                    strokeWidth="7"
                  />
                  <path
                    d="M60 156 C160 138, 220 144, 310 120 S470 72, 590 96 S720 124, 900 62 L900 174 L60 174 Z"
                    fill="#067647"
                    opacity="0.10"
                  />
                  <circle cx="590" cy="96" fill="#fff7ed" r="13" stroke="#d97706" strokeWidth="5" />
                  <text fill="#7c2d12" fontSize="18" x="612" y="102">
                    异常点：需复核 capex
                  </text>
                  <circle cx="900" cy="62" fill="#ffffff" r="11" stroke="#067647" strokeWidth="5" />
                  <text fill="#344054" fontSize="18" x="785" y="44">
                    审查后可入证据链
                  </text>
                </svg>
              </section>

              <section className="grid gap-3 md:grid-cols-3">
                {analysisSources.map((source) => {
                  const Icon = source.icon;
                  return (
                    <div className="rounded-md border border-line bg-white p-4 shadow-sm" key={source.label}>
                      <Icon aria-hidden="true" className="h-5 w-5 text-graphite" />
                      <div className="mt-3 text-sm font-semibold text-ink">{source.label}</div>
                      <div className="mt-2 text-sm leading-6 text-graphite">{source.detail}</div>
                    </div>
                  );
                })}
              </section>

              <section className="rounded-md border border-line bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-ink">证据预览</h2>
                <p className="mt-3 text-sm leading-6 text-graphite">
                  SEC filing URL、财务事实、图表审查和内部资料都会进入 evidence chain。后续 AI 摘要只能引用已登记证据，
                  无证据时必须提示缺口。
                </p>
              </section>

              <KeyDataGlyph />
            </>
          ) : null}

          {selectedCompany?.hasFilingData ? (
            <section className="grid gap-4 lg:grid-cols-2">
              <section className="rounded-md border border-line bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-ink">优秀报告分析推荐</h2>
                <div className="mt-3 space-y-2">
                  {reportRecommendations.map((item) => (
                    <button
                      className={`w-full rounded-md border px-3 py-2 text-left text-sm hover:border-ink ${
                        selectedReport === item ? "border-ink bg-white text-ink" : "border-line bg-panel text-graphite"
                      }`}
                      key={item}
                      onClick={() => setSelectedReport(item)}
                      type="button"
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <p className="mt-3 rounded-md border border-line bg-panel px-3 py-2 text-xs leading-5 text-graphite">
                  已选择：{selectedReport}，可作为当前证据包的报告写法参考。
                </p>
              </section>

              <section className="rounded-md border border-line bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-ink">公司/行业新闻</h2>
                <div className="mt-3 space-y-3">
                  {companyNews.map((item) => (
                    <button
                      className={`w-full border-b border-line pb-3 text-left text-sm leading-6 last:border-b-0 last:pb-0 ${
                        selectedNews === item ? "text-ink" : "text-graphite"
                      }`}
                      key={item}
                      onClick={() => setSelectedNews(item)}
                      type="button"
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <p className="mt-3 rounded-md border border-line bg-panel px-3 py-2 text-xs leading-5 text-graphite">
                  当前关注：{selectedNews}
                </p>
              </section>
            </section>
          ) : null}
        </div>
      </section>
    </main>
  );
}
