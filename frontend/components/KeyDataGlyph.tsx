import { BarChart3, FileSearch, Layers3, Sigma, ShieldCheck } from "lucide-react";

const nodes = [
  { label: "指标候选", value: "8", icon: Sigma },
  { label: "覆盖页码", value: "1-4", icon: FileSearch },
  { label: "来源切片", value: "12", icon: Layers3 },
  { label: "平均置信度", value: "0.72", icon: BarChart3 },
  { label: "审计状态", value: "待复核", icon: ShieldCheck }
];

export function KeyDataGlyph() {
  return (
    <section className="rounded-md border border-line bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-ink">关键数据图谱</h2>
          <p className="mt-2 text-sm leading-6 text-graphite">
            把指标候选、页码、切片、置信度和审计状态放在同一张横图里，方便继续交给 AI 摘要或报告草稿引用。
          </p>
        </div>
        <span className="rounded-md border border-line bg-panel px-3 py-1 text-xs text-graphite">AAPL 10-K</span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {nodes.map((node) => {
          const Icon = node.icon;
          return (
            <div className="rounded-md border border-line bg-panel p-3" key={node.label}>
              <div className="flex items-center gap-2 text-xs text-graphite">
                <Icon aria-hidden="true" className="h-4 w-4 text-graphite" />
                {node.label}
              </div>
              <div className="mt-2 text-xl font-semibold text-ink">{node.value}</div>
            </div>
          );
        })}
      </div>

      <svg aria-hidden="true" className="mt-6 h-40 w-full" viewBox="0 0 960 190">
        <path d="M40 150 H900" stroke="#d8dee8" strokeWidth="2" />
        <path d="M120 32 V158 M300 32 V158 M480 32 V158 M660 32 V158 M840 32 V158" stroke="#eef2f7" strokeWidth="2" />
        <path
          d="M70 138 C150 112, 190 120, 260 88 S380 66, 460 92 S590 126, 680 72 S800 44, 900 58"
          fill="none"
          stroke="#067647"
          strokeLinecap="round"
          strokeWidth="8"
        />
        <path
          d="M70 138 C150 112, 190 120, 260 88 S380 66, 460 92 S590 126, 680 72 S800 44, 900 58 L900 162 L70 162 Z"
          fill="#067647"
          opacity="0.10"
        />
        {[
          { x: 70, y: 138, label: "收入" },
          { x: 260, y: 88, label: "毛利率" },
          { x: 460, y: 92, label: "经营利润" },
          { x: 680, y: 72, label: "自由现金流" },
          { x: 900, y: 58, label: "回购" }
        ].map((point) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} fill="#ffffff" r="9" stroke="#067647" strokeWidth="4" />
            <text fill="#344054" fontSize="18" x={point.x - 30} y={point.y - 18}>
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </section>
  );
}
