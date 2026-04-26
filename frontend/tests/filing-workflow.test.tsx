import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FilingWorkflow } from "@/components/FilingWorkflow";

describe("FilingWorkflow", () => {
  it("renders parser stages and metric evidence", () => {
    render(<FilingWorkflow />);

    expect(screen.getByText("财报审查")).toBeInTheDocument();
    expect(screen.getByText("解析时间线")).toBeInTheDocument();
    expect(screen.getByText("等待选择公司")).toBeInTheDocument();
    expect(screen.queryByText("指标候选")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText(/AAPL · 苹果公司/));
    expect(screen.getByText("stage3-sec-edgar-mock-v1")).toBeInTheDocument();
    expect(screen.getByText("抓取来源")).toBeInTheDocument();
    expect(screen.getByText("已从 SEC-like provider 抓取 AAPL 财报列表，等待选择目标 filing。")).toBeInTheDocument();

    fireEvent.click(screen.getByText("选择 10-K"));
    expect(screen.getAllByText("指标候选").length).toBeGreaterThan(0);
    expect(screen.getByText("毛利率 Gross Margin")).toBeInTheDocument();
    expect(screen.getByText("自由现金流 Free Cash Flow")).toBeInTheDocument();
    expect(screen.getByText("优秀报告分析推荐")).toBeInTheDocument();
    expect(screen.getByText("图表审查工具")).toBeInTheDocument();

    expect(screen.getByText("已选中 10-K，8 个核心财务事实进入图表审查。")).toBeInTheDocument();
    fireEvent.click(screen.getByText("确认自由现金流"));
    expect(screen.getByText("自由现金流图表已由人工审查确认，可加入证据链。")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Peer Margin Bridge: Apple vs Microsoft"));
    expect(screen.getByText("已选择：Peer Margin Bridge: Apple vs Microsoft，可作为当前证据包的报告写法参考。")).toBeInTheDocument();
  });
});
