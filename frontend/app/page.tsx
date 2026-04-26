import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bell,
  Building2,
  FileText,
  Search,
  Sparkles,
  Star
} from "lucide-react";

import { AppShellNav } from "@/components/AppShellNav";
import { MiniTrendChart } from "@/components/MiniTrendChart";
import { TaskStepChips } from "@/components/TaskStepChips";

const workflows = [
  {
    zh: "公司研究",
    en: "Company Research",
    href: "/company/AAPL",
    icon: Building2,
    summary: "从公司快照进入，核对业务结构、关键指标、新闻催化和同行口径。",
    steps: ["确认公司身份", "查看指标来源", "生成 AI 摘要"]
  },
  {
    zh: "财报解析",
    en: "Filing Analysis",
    href: "/filings",
    icon: FileText,
    summary: "上传年报或 10-K，解析页码、文本切片、低置信字段和指标候选。",
    steps: ["校验文件", "提取指标", "回到原文页码"]
  },
  {
    zh: "市场扫描",
    en: "Market Scan",
    href: "/company/00700.HK",
    icon: Search,
    summary: "把自然语言条件转成可编辑筛选器，展示入选和排除原因。",
    steps: ["解析条件", "确认阈值", "输出候选池"]
  },
  {
    zh: "回测实验室",
    en: "Backtest Lab",
    href: "/backtests",
    icon: Activity,
    summary: "把研究假设转换成日频策略模板，记录成本、交易和偏差检查。",
    steps: ["选择模板", "设置成本", "复核偏差"]
  }
];

const recommendedCompanies = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    zhName: "苹果公司",
    reason: "消费电子与服务收入结构清晰，适合作为阶段二财报解析样例。",
    price: "189.12",
    change: "+0.84%"
  },
  {
    symbol: "00700.HK",
    name: "Tencent Holdings",
    zhName: "腾讯控股",
    reason: "港股互联网龙头，适合验证多市场、多币种展示。",
    price: "386.40",
    change: "-0.31%"
  }
];

const followedCompanies = [
  { symbol: "AAPL", label: "苹果公司", note: "等待 10-K 解析复核" },
  { symbol: "MSFT", label: "微软", note: "关注云业务毛利率" },
  { symbol: "NVDA", label: "英伟达", note: "关注数据中心收入" }
];

export default function WorkbenchPage() {
  return (
    <main className="min-h-screen bg-panel">
      <AppShellNav />

      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[1fr_360px]">
          <div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-ink md:text-5xl">
              <span className="lang-zh">从问题进入，形成可追溯的研究结论</span>
              <span className="lang-en">Start from a question, end with traceable research</span>
            </h1>
            <div className="mt-5 flex max-w-2xl items-center gap-3 rounded-md border border-line bg-panel px-4 py-3 shadow-sm transition focus-within:border-ink">
              <Search aria-hidden="true" className="h-5 w-5 text-graphite" />
              <div className="min-w-0 flex-1 text-sm text-graphite">
                <span className="lang-zh">搜索公司、代码或直接输入研究问题，例如：苹果服务收入趋势</span>
                <span className="lang-en">
                  Search a company, ticker, or question, such as Apple service revenue trend
                </span>
              </div>
            </div>
          </div>
          <section className="rounded-md border border-line bg-panel p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Bell aria-hidden="true" className="h-4 w-4" />
              <span className="lang-zh">今日研究队列</span>
              <span className="lang-en">Today&apos;s Research Queue</span>
            </div>
            <div className="mt-4 space-y-3 text-sm text-graphite">
              <p>
                <span className="lang-zh">苹果：财报解析后生成证据包和 AI 摘要。</span>
                <span className="lang-en">Apple: create evidence pack and AI brief after filing parse.</span>
              </p>
              <p>
                <span className="lang-zh">腾讯：检查收入、毛利率和估值口径是否一致。</span>
                <span className="lang-en">Tencent: compare revenue, margin, and valuation definitions.</span>
              </p>
            </div>
          </section>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">
                <span className="lang-zh">推荐研究公司</span>
                <span className="lang-en">Recommended Companies</span>
              </h2>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {recommendedCompanies.map((company) => (
                <Link
                  className="group rounded-md border border-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-ink hover:shadow-md"
                  href={`/company/${company.symbol}`}
                  key={company.symbol}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm text-graphite">{company.symbol}</div>
                      <h3 className="mt-1 text-xl font-semibold text-ink">
                        <span className="lang-zh">{company.zhName}</span>
                        <span className="lang-en">{company.name}</span>
                      </h3>
                    </div>
                    <ArrowRight
                      aria-hidden="true"
                      className="h-5 w-5 text-graphite transition group-hover:translate-x-1 group-hover:text-ink"
                    />
                  </div>
                  <p className="mt-4 text-sm leading-6 text-graphite">{company.reason}</p>
                  <div className="mt-5 flex items-end gap-3">
                    <span className="text-2xl font-semibold text-ink">{company.price}</span>
                    <span
                      className={`pb-1 text-sm font-medium ${
                        company.change.startsWith("+") ? "text-positive" : "text-negative"
                      }`}
                    >
                      {company.change}
                    </span>
                  </div>
                  <div
                    className={`mt-3 ${
                      company.change.startsWith("+") ? "text-positive" : "text-negative"
                    }`}
                  >
                    <MiniTrendChart tone={company.change.startsWith("+") ? "positive" : "negative"} />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ink">
              <span className="lang-zh">核心工作入口</span>
              <span className="lang-en">Core Workflows</span>
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {workflows.map((tile) => {
                const Icon = tile.icon;
                return (
                  <Link
                    className="group rounded-md border border-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-ink hover:shadow-md"
                    href={tile.href}
                    key={tile.zh}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="rounded-md border border-line bg-panel p-2">
                          <Icon aria-hidden="true" className="h-5 w-5 text-graphite" />
                        </span>
                        <div className="text-base font-semibold text-ink">
                          <span className="lang-zh">{tile.zh}</span>
                          <span className="lang-en">{tile.en}</span>
                        </div>
                      </div>
                      <ArrowRight
                        aria-hidden="true"
                        className="h-5 w-5 text-graphite transition group-hover:translate-x-1"
                      />
                    </div>
                    <p className="mt-4 text-sm leading-6 text-graphite">{tile.summary}</p>
                    <TaskStepChips steps={tile.steps} />
                  </Link>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-md border border-line bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Star aria-hidden="true" className="h-4 w-4 text-positive" />
              <span className="lang-zh">我的关注</span>
              <span className="lang-en">Watchlist</span>
            </div>
            <div className="mt-4 space-y-3">
              {followedCompanies.map((company) => (
                <Link
                  className="block rounded-md border border-line bg-panel p-3 transition hover:border-ink"
                  href={`/company/${company.symbol}`}
                  key={company.symbol}
                >
                  <div className="text-sm font-semibold text-ink">
                    {company.symbol} · {company.label}
                  </div>
                  <div className="mt-1 text-sm text-graphite">{company.note}</div>
                </Link>
              ))}
            </div>
          </section>
          <section className="rounded-md border border-line bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles aria-hidden="true" className="h-4 w-4 text-positive" />
              <h2 className="text-sm font-semibold text-ink">
                <span className="lang-zh">AI 可以帮你做什么</span>
                <span className="lang-en">How AI Helps</span>
              </h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-graphite">
              <span className="lang-zh">
                让 AI 按证据包生成公司摘要、列出缺失数据、设计回测假设，最后沉淀成报告草稿。
              </span>
              <span className="lang-en">
                Ask AI to summarize evidence, list missing data, design backtest assumptions, and
                draft reports.
              </span>
            </p>
          </section>
        </aside>
      </section>
    </main>
  );
}
