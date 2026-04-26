import type { ApiMeta } from "@/lib/api";

type AuditRailProps = {
  meta: ApiMeta;
};

export function AuditRail({ meta }: AuditRailProps) {
  return (
    <aside className="rounded-md border border-line bg-white p-4">
      <h2 className="text-sm font-semibold text-ink">Source & Audit</h2>
      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-graphite">Source</dt>
          <dd className="font-medium text-ink">{meta.source}</dd>
        </div>
        <div>
          <dt className="text-graphite">As of</dt>
          <dd className="font-medium text-ink">{new Date(meta.as_of).toLocaleString()}</dd>
        </div>
        <div>
          <dt className="text-graphite">Data version</dt>
          <dd className="break-all font-medium text-ink">{meta.data_version}</dd>
        </div>
      </dl>
      {meta.warnings.length > 0 ? (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {meta.warnings.join(" ")}
        </div>
      ) : null}
    </aside>
  );
}
