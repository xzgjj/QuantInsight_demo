import type { CompanySnapshot } from "@/lib/api";

type SnapshotPanelProps = {
  snapshot: CompanySnapshot;
};

const metricLabels: Record<string, string> = {
  revenue_ttm: "Revenue TTM",
  gross_margin: "Gross Margin",
  pe_ttm: "P/E TTM"
};

export function SnapshotPanel({ snapshot }: SnapshotPanelProps) {
  const tone = snapshot.change_percent >= 0 ? "text-positive" : "text-negative";

  return (
    <section className="border-b border-line bg-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="text-sm text-graphite">{snapshot.exchange}</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">
            {snapshot.symbol} · {snapshot.name}
          </h1>
          <div className="mt-5 flex flex-wrap items-end gap-4">
            <div className="text-4xl font-semibold">{snapshot.price.toFixed(2)}</div>
            <div className="pb-1 text-base text-graphite">{snapshot.currency}</div>
            <div className={`pb-1 text-base font-medium ${tone}`}>
              {snapshot.change_percent.toFixed(2)}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {Object.entries(snapshot.metrics).map(([key, value]) => (
            <div className="rounded-md border border-line bg-panel p-4" key={key}>
              <div className="text-xs uppercase text-graphite">{metricLabels[key] ?? key}</div>
              <div className="mt-2 text-lg font-semibold">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
