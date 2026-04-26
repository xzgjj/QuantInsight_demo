type StatusDotProps = {
  tone?: "positive" | "warning" | "neutral";
};

export function StatusDot({ tone = "neutral" }: StatusDotProps) {
  const className =
    tone === "positive" ? "bg-positive" : tone === "warning" ? "bg-amber-500" : "bg-graphite";

  return <span aria-hidden="true" className={`h-2 w-2 rounded-full ${className}`} />;
}
