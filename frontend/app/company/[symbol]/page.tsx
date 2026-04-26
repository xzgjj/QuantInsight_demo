import { AuditRail } from "@/components/AuditRail";
import { SnapshotPanel } from "@/components/SnapshotPanel";
import { fetchCompanySnapshot } from "@/lib/api";

type CompanyPageProps = {
  params: Promise<{ symbol: string }>;
};

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { symbol } = await params;
  const envelope = await fetchCompanySnapshot(symbol);

  if (!envelope.data) {
    throw new Error(envelope.error?.message ?? "Snapshot is empty.");
  }

  return (
    <main className="min-h-screen bg-panel">
      <SnapshotPanel snapshot={envelope.data} />
      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-4">
          <section className="rounded-md border border-line bg-white p-5">
            <h2 className="text-base font-semibold text-ink">AI Brief</h2>
            <p className="mt-3 text-sm leading-6 text-graphite">
              Mock provider data is wired through the same envelope that future real providers will
              use. Every fact on this page carries source, as-of time, data version, and warnings.
            </p>
          </section>
          <section className="rounded-md border border-line bg-white p-5">
            <h2 className="text-base font-semibold text-ink">Backtest Readiness</h2>
            <p className="mt-3 text-sm leading-6 text-graphite">
              The stage 1 backend exposes a mock daily backtest endpoint with costs, trades, metrics,
              and bias checks for validation plumbing.
            </p>
          </section>
        </div>
        <AuditRail meta={envelope.meta} />
      </section>
    </main>
  );
}
