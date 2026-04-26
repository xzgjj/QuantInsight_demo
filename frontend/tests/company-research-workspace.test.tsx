import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CompanyResearchWorkspace } from "@/components/CompanyResearchWorkspace";

const snapshot = {
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
  warnings: ["Mock data for engineering validation only."]
};

const meta = {
  source: "mock-provider",
  as_of: "2026-04-26T00:00:00Z",
  data_version: "mock-equity-2026-04-26",
  warnings: ["Mock data for engineering validation only."]
};

describe("CompanyResearchWorkspace", () => {
  it("renders AI tasks, report draft, and audit context", () => {
    render(<CompanyResearchWorkspace snapshot={snapshot} meta={meta} />);

    expect(screen.getByText("研究摘要")).toBeInTheDocument();
    expect(screen.getByText("AI 研究助手")).toBeInTheDocument();
    expect(screen.getByText("报告草稿")).toBeInTheDocument();
    expect(screen.getByText("生成公司摘要")).toBeInTheDocument();
    fireEvent.click(screen.getByText("生成结果"));
    expect(screen.getByText(/苹果当前研究重点/)).toBeInTheDocument();
    expect(screen.getByText("mock-provider")).toBeInTheDocument();
  });
});
