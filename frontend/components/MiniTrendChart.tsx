type MiniTrendChartProps = {
  tone?: "positive" | "negative" | "neutral";
};

const points = "0,34 24,28 48,30 72,18 96,20 120,10";

export function MiniTrendChart({ tone = "positive" }: MiniTrendChartProps) {
  const stroke =
    tone === "positive" ? "stroke-positive" : tone === "negative" ? "stroke-negative" : "stroke-graphite";

  return (
    <svg aria-hidden="true" className="h-12 w-full" viewBox="0 0 120 44" preserveAspectRatio="none">
      <polyline
        className={`${stroke} fill-none`}
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
      <polygon className={`${stroke} opacity-10`} fill="currentColor" points={`${points} 120,44 0,44`} />
    </svg>
  );
}
