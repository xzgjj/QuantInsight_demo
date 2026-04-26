import Link from "next/link";
import { Activity, Building2, FileText, Search } from "lucide-react";

const tiles = [
  { label: "Company Research", href: "/company/AAPL", icon: Building2 },
  { label: "Filing Analysis", href: "/company/AAPL", icon: FileText },
  { label: "Market Scan", href: "/company/00700.HK", icon: Search },
  { label: "Backtest Lab", href: "/company/AAPL", icon: Activity }
];

export default function WorkbenchPage() {
  return (
    <main className="min-h-screen bg-panel">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <div className="text-sm text-graphite">QuantInsight</div>
            <h1 className="text-2xl font-semibold text-ink">Research Workbench</h1>
          </div>
          <Link
            className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white"
            href="/company/AAPL"
          >
            Open AAPL
          </Link>
        </div>
      </header>
      <section className="mx-auto grid max-w-7xl gap-4 px-6 py-6 md:grid-cols-4">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <Link
              className="rounded-md border border-line bg-white p-4 transition hover:border-ink"
              href={tile.href}
              key={tile.label}
            >
              <Icon aria-hidden="true" className="h-5 w-5 text-graphite" />
              <div className="mt-3 text-sm font-semibold text-ink">{tile.label}</div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
