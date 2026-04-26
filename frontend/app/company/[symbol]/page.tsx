import { AppShellNav } from "@/components/AppShellNav";
import { CompanyResearchWorkspace } from "@/components/CompanyResearchWorkspace";
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
      <AppShellNav />
      <SnapshotPanel snapshot={envelope.data} />
      <CompanyResearchWorkspace snapshot={envelope.data} meta={envelope.meta} />
    </main>
  );
}
