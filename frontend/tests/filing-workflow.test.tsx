import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FilingWorkflow } from "@/components/FilingWorkflow";

describe("FilingWorkflow", () => {
  it("renders parser stages and metric evidence", () => {
    render(<FilingWorkflow />);

    expect(screen.getByText("财报解析工作流")).toBeInTheDocument();
    expect(screen.getByText("解析时间线")).toBeInTheDocument();
    expect(screen.getAllByText("指标候选")).toHaveLength(2);
    expect(screen.getByText("毛利率 Gross Margin")).toBeInTheDocument();
    expect(screen.getByText("自由现金流 Free Cash Flow")).toBeInTheDocument();
    expect(screen.getByText("stage2-document-mock-v1")).toBeInTheDocument();
    expect(screen.getByText("优秀报告分析推荐")).toBeInTheDocument();

    fireEvent.click(screen.getByText("上传财报"));
    expect(screen.getByText("样例财报已上传并完成 hash 去重。")).toBeInTheDocument();
    fireEvent.click(screen.getByText("引用原文页码"));
    expect(screen.getByText("已定位第 1 页证据，可加入 AI 摘要和报告草稿。")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Peer Margin Bridge: Apple vs Microsoft"));
    expect(screen.getByText("已选择：Peer Margin Bridge: Apple vs Microsoft，可作为当前证据包的报告写法参考。")).toBeInTheDocument();
  });
});
