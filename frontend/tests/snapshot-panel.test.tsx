import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SnapshotPanel } from "@/components/SnapshotPanel";

describe("SnapshotPanel", () => {
  it("renders company quote and metrics", () => {
    render(
      <SnapshotPanel
        snapshot={{
          symbol: "AAPL",
          name: "Apple Inc.",
          exchange: "NASDAQ",
          currency: "USD",
          price: 189.12,
          change_percent: 0.84,
          volume: 58240000,
          metrics: { revenue_ttm: 383285000000, gross_margin: "45.6%", pe_ttm: 29.4 },
          source: "mock-provider",
          as_of: "2026-04-26T00:00:00Z",
          data_version: "mock-equity-2026-04-26",
          warnings: []
        }}
      />
    );

    expect(screen.getByText("苹果公司")).toBeInTheDocument();
    expect(screen.getByText("189.12")).toBeInTheDocument();
    expect(screen.getByText("毛利率")).toBeInTheDocument();
  });
});
