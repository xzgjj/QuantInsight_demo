import Link from "next/link";
import { CheckCircle2, FileText, LineChart, Search, Star } from "lucide-react";

import { AiResearchPanel } from "@/components/AiResearchPanel";
import { AuditRail } from "@/components/AuditRail";
import { MiniTrendChart } from "@/components/MiniTrendChart";
import { TaskStepChips } from "@/components/TaskStepChips";
import type { ApiMeta, CompanySnapshot } from "@/lib/api";

type CompanyResearchWorkspaceProps = {
  snapshot: CompanySnapshot;
  meta: ApiMeta;
};

const catalysts = [
  { label: "服务收入占比", value: "持续提升", tone: "positive" },
  { label: "硬件换机周期", value: "等待验证", tone: "neutral" },
  { label: "毛利率变化", value: "45.6%", tone: "positive" }
];

const researchModules = [
  {
    title: "财报证据",
    href: "/filings",
    icon: FileText,
    summary: "上传 10-K/年报，解析文本切片、页码和指标候选，再回到公司页形成证据包。",
    steps: ["上传文件", "抽取指标", "引用页码"]
  },
  {
    title: "回测假设",
    href: "/backtests",
    icon: LineChart,
    summary: "把“毛利率改善”“估值回归”等判断转换成日频策略模板，记录成本和偏差检查。",
    steps: ["选择模板", "设置成本", "输出交易"]
  }
];

const quickCompanies = [
  { symbol: "AAPL", label: "苹果公司", type: "推荐", note: "财报审查样例完整" },
  { symbol: "MSFT", label: "微软", type: "收藏", note: "云业务毛利率跟踪" },
  { symbol: "NVDA", label: "英伟达", type: "收藏", note: "数据中心收入验证" }
];

export function CompanyResearchWorkspace({ snapshot, meta }: CompanyResearchWorkspaceProps) {
  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[0.68fr_0.32fr]">
      <div className="space-y-4">
        <section className="rounded-md border border-line bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <div className="text-xs font-medium text-graphite">公司切换</div>
              <div className="mt-2 flex items-center gap-3 rounded-md border border-line bg-panel px-3 py-2">
                <Search aria-hidden="true" className="h-4 w-4 text-graphite" />
                <span className="text-sm text-graphite">
                  搜索公司、代码或研究问题，选择后刷新当前研究上下文
                </span>
              </div>
            </div>
            <div className="grid gap-2 md:grid-cols-3">
              {quickCompanies.map((company) => (
                <Link
                  className={`rounded-md border p-3 text-sm transition hover:border-ink ${
                    snapshot.symbol === company.symbol ? "border-ink bg-panel" : "border-line bg-white"
                  }`}
                  href={`/company/${company.symbol}`}
                  key={company.symbol}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-ink">{company.symbol}</span>
                    <span className="inline-flex items-center gap-1 text-xs text-graphite">
                      {company.type === "收藏" ? <Star aria-hidden="true" className="h-3 w-3" /> : null}
                      {company.type}
                    </span>
                  </div>
                  <div className="mt-1 text-graphite">{company.label}</div>
                  <div className="mt-1 text-xs text-graphite">{company.note}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-md border border-line bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-base font-semibold text-ink">
              <span className="lang-zh">研究摘要</span>
              <span className="lang-en">Research Brief</span>
            </h2>
            <span className="rounded-md border border-line bg-panel px-2 py-1 text-xs text-graphite">
              {snapshot.symbol}
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-graphite">
            <span className="lang-zh">
              当前研究路径从公司快照开始，先确认收入、毛利率和估值口径，再进入财报解析和
              AI 证据包。页面不会直接给出买入或卖出建议，而是帮助用户把结论拆成可验证的事实。
            </span>
            <span className="lang-en">
              Start with snapshot facts, validate revenue, margin, and valuation definitions, then
              move into filing evidence and AI-assisted research.
            </span>
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {catalysts.map((item) => (
              <div className="rounded-md border border-line bg-panel p-4" key={item.label}>
                <div className="text-xs text-graphite">{item.label}</div>
                <div
                  className={`mt-2 text-base font-semibold ${
                    item.tone === "positive" ? "text-positive" : "text-ink"
                  }`}
                >
                  {item.value}
                </div>
                <div className="mt-2 text-positive">
                  <MiniTrendChart tone={item.tone === "positive" ? "positive" : "neutral"} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {researchModules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                className="group rounded-md border border-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-ink hover:shadow-md"
                href={module.href}
                key={module.title}
              >
                <Icon aria-hidden="true" className="h-5 w-5 text-graphite" />
                <h3 className="mt-4 text-base font-semibold text-ink">{module.title}</h3>
                <p className="mt-2 text-sm leading-6 text-graphite">{module.summary}</p>
                <TaskStepChips steps={module.steps} />
              </Link>
            );
          })}
        </section>

        <section className="rounded-md border border-line bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-ink">报告草稿</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {["公司概览", "核心指标", "风险与缺口"].map((item) => (
              <div className="rounded-md border border-line bg-panel p-4" key={item}>
                <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-positive" />
                <div className="mt-3 text-sm font-semibold text-ink">{item}</div>
                <div className="mt-1 text-xs text-graphite">等待 AI 按证据包补全</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <aside className="space-y-4">
        <AiResearchPanel />
        <AuditRail meta={meta} />
      </aside>
    </section>
  );
}
