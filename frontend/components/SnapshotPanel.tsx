import type { CompanySnapshot } from "@/lib/api";

type SnapshotPanelProps = {
  snapshot: CompanySnapshot;
};

const metricLabels: Record<string, string> = {
  revenue_ttm: "收入 TTM",
  gross_margin: "毛利率",
  pe_ttm: "P/E TTM"
};

export function SnapshotPanel({ snapshot }: SnapshotPanelProps) {
  const tone = snapshot.change_percent >= 0 ? "text-positive" : "text-negative";
  const formatter = new Intl.NumberFormat("zh-CN", { notation: "compact", maximumFractionDigits: 1 });

  return (
    <section className="border-b border-line bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-7 lg:grid-cols-[0.42fr_0.58fr]">
        <div>
          <div className="text-sm font-medium text-graphite">{snapshot.exchange}</div>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal text-ink">
            {snapshot.symbol} · <span className="lang-zh">苹果公司</span>
            <span className="lang-en">{snapshot.name}</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-graphite">
            <span className="lang-zh">
              消费电子、服务收入和生态硬件共同构成的全球科技公司。当前页面用于验证公司研究、
              财报证据和 AI 分析闭环。
            </span>
            <span className="lang-en">
              Global technology company across consumer devices, services, and ecosystem hardware.
            </span>
          </p>
          <div className="mt-6 flex flex-wrap items-end gap-4">
            <div className="text-4xl font-semibold">{snapshot.price.toFixed(2)}</div>
            <div className="pb-1 text-base text-graphite">{snapshot.currency}</div>
            <div className={`pb-1 text-base font-medium ${tone}`}>
              {snapshot.change_percent.toFixed(2)}%
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {Object.entries(snapshot.metrics).map(([key, value]) => (
            <div className="rounded-md border border-line bg-panel p-5" key={key}>
              <div className="text-xs uppercase text-graphite">{metricLabels[key] ?? key}</div>
              <div className="mt-3 text-2xl font-semibold text-ink">
                {typeof value === "number" && value > 1000000 ? formatter.format(value) : value}
              </div>
              <div className="mt-3 text-xs leading-5 text-graphite">
                <span className="lang-zh">来源、口径和版本见右侧审计栏</span>
                <span className="lang-en">Source and method in audit rail</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
