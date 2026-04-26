"use client";

import { useState } from "react";
import { Activity, CheckCircle2, Settings2, Table2 } from "lucide-react";

const trades = [
  { date: "2025-01-03", side: "BUY", price: "184.20", fee: "3 bps" },
  { date: "2025-03-28", side: "SELL", price: "191.40", fee: "3 bps" }
];

const templates = ["毛利率改善 + 估值回归", "服务收入占比提升 + 低波动过滤"];

export function BacktestWorkspace() {
  const [template, setTemplate] = useState("毛利率改善 + 估值回归");
  const [cost, setCost] = useState("3 bps");
  const [showTrades, setShowTrades] = useState(false);

  return (
    <main className="min-h-screen bg-panel">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-6 py-7">
          <div className="text-sm font-medium text-graphite">回测实验室</div>
          <h1 className="mt-2 text-3xl font-semibold text-ink">把研究假设变成可复核交易记录</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-graphite">
            当前是阶段二交互样例：选择模板、设置成本、输出交易。后续会接真实 Quant Engine。
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[0.34fr_0.66fr]">
        <aside className="space-y-4">
          <section className="rounded-md border border-line bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-base font-semibold text-ink">
              <Activity aria-hidden="true" className="h-5 w-5 text-graphite" />
              回测设置
            </div>
            <div className="mt-4 space-y-3">
              <button
                className="w-full rounded-md border border-line bg-panel px-3 py-2 text-left text-sm text-ink hover:border-ink"
                onClick={() => setTemplate(template === templates[0] ? templates[1] : templates[0])}
                type="button"
              >
                选择模板：{template}
              </button>
              <button
                className="w-full rounded-md border border-line bg-panel px-3 py-2 text-left text-sm text-ink hover:border-ink"
                onClick={() => setCost(cost === "3 bps" ? "5 bps" : "3 bps")}
                type="button"
              >
                设置成本：{cost}
              </button>
              <button
                className="w-full rounded-md bg-ink px-3 py-2 text-left text-sm font-medium text-white"
                onClick={() => setShowTrades(true)}
                type="button"
              >
                输出交易
              </button>
            </div>
          </section>
        </aside>

        <div className="space-y-4">
          <section className="rounded-md border border-line bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-base font-semibold text-ink">
              <Settings2 aria-hidden="true" className="h-5 w-5 text-graphite" />
              偏差与成本检查
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {["包含交易成本", "无未来函数", "记录数据版本"].map((item) => (
                <div className="rounded-md border border-line bg-panel p-4" key={item}>
                  <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-positive" />
                  <div className="mt-2 text-sm font-semibold text-ink">{item}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-line bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-base font-semibold text-ink">
              <Table2 aria-hidden="true" className="h-5 w-5 text-graphite" />
              交易记录
            </div>
            {showTrades ? (
              <div className="mt-4 overflow-hidden rounded-md border border-line">
                <table className="w-full text-left text-sm">
                  <thead className="bg-panel text-graphite">
                    <tr>
                      <th className="px-4 py-3 font-medium">日期</th>
                      <th className="px-4 py-3 font-medium">方向</th>
                      <th className="px-4 py-3 font-medium">价格</th>
                      <th className="px-4 py-3 font-medium">成本</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((trade) => (
                      <tr className="border-t border-line" key={trade.date}>
                        <td className="px-4 py-3">{trade.date}</td>
                        <td className="px-4 py-3">{trade.side}</td>
                        <td className="px-4 py-3">{trade.price}</td>
                        <td className="px-4 py-3">{trade.fee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-4 text-sm text-graphite">点击“输出交易”后展示可复核交易记录。</p>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
