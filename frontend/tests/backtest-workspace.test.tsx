import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BacktestWorkspace } from "@/components/BacktestWorkspace";

describe("BacktestWorkspace", () => {
  it("outputs trades after running the workflow", () => {
    render(<BacktestWorkspace />);

    expect(screen.getByText("回测实验室")).toBeInTheDocument();
    fireEvent.click(screen.getByText("选择模板：毛利率改善 + 估值回归"));
    expect(screen.getByText("选择模板：服务收入占比提升 + 低波动过滤")).toBeInTheDocument();
    fireEvent.click(screen.getByText("输出交易"));
    expect(screen.getByText("2025-01-03")).toBeInTheDocument();
    expect(screen.getAllByText("3 bps")).toHaveLength(2);
  });
});
