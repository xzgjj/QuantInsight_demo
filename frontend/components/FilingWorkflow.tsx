"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, FileText, Upload } from "lucide-react";

import { AppShellNav } from "@/components/AppShellNav";
import { KeyDataGlyph } from "@/components/KeyDataGlyph";
import { MiniTrendChart } from "@/components/MiniTrendChart";
import { StatusDot } from "@/components/StatusDot";

const stages = [
  { label: "校验文件", detail: "类型、大小、hash 去重", status: "done" },
  { label: "提取文本", detail: "文本、表格、页码", status: "active" },
  { label: "复核指标", detail: "指标、单位、置信度", status: "waiting" },
  { label: "生成证据", detail: "切片、引用、证据包", status: "waiting" }
];

const metricCandidates = [
  { metric: "收入 Revenue", value: "383,285", unit: "USD", page: 1, confidence: "0.66" },
  { metric: "毛利率 Gross Margin", value: "45.6", unit: "%", page: 1, confidence: "0.66" },
  { metric: "经营利润 Operating Income", value: "114,301", unit: "USD", page: 2, confidence: "0.72" },
  { metric: "经营利润率 Operating Margin", value: "29.8", unit: "%", page: 2, confidence: "0.72" },
  { metric: "净利润 Net Income", value: "96,995", unit: "USD", page: 2, confidence: "0.70" },
  { metric: "摊薄 EPS Diluted EPS", value: "6.42", unit: "USD/share", page: 3, confidence: "0.74" },
  { metric: "经营现金流 Operating Cash Flow", value: "118,254", unit: "USD", page: 4, confidence: "0.76" },
  { metric: "自由现金流 Free Cash Flow", value: "108,807", unit: "USD", page: 4, confidence: "0.73" }
];

const reportRecommendations = [
  "Apple FY2025 Services Margin Review",
  "Consumer Hardware Replacement Cycle Notes",
  "Peer Margin Bridge: Apple vs Microsoft"
];

const companyNews = [
  "公司公告：服务收入继续成为毛利率核心变量",
  "行业新闻：高端手机换机周期延长",
  "供应链：硬件成本压力等待下一季验证"
];

export function FilingWorkflow() {
  const [action, setAction] = useState<"idle" | "uploaded" | "extracted" | "cited">("idle");
  const [selectedReport, setSelectedReport] = useState(reportRecommendations[0]);
  const [selectedNews, setSelectedNews] = useState(companyNews[0]);
  const activeMessage = useMemo(() => {
    if (action === "uploaded") return "样例财报已上传并完成 hash 去重。";
    if (action === "extracted") return "已抽取 8 个核心指标候选，等待置信度复核。";
    if (action === "cited") return "已定位第 1 页证据，可加入 AI 摘要和报告草稿。";
    return "选择左侧动作开始演示财报解析闭环。";
  }, [action]);

  return (
    <main className="min-h-screen bg-panel">
      <AppShellNav />

      <section className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-6">
          <div>
            <div className="text-sm font-medium text-graphite">财报解析工作流</div>
            <h1 className="mt-2 text-3xl font-semibold text-ink">把年报变成可追溯证据包</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-graphite">
              上传文件后先做校验和去重，再解析文本切片、指标候选、低置信字段和原文页码。
            </p>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            onClick={() => setAction("uploaded")}
            type="button"
          >
            <Upload aria-hidden="true" className="h-4 w-4" />
            上传财报
          </button>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[0.28fr_0.72fr]">
        <aside className="space-y-4">
          <section className="rounded-md border border-line bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <FileText aria-hidden="true" className="h-5 w-5 text-graphite" />
              <h2 className="text-base font-semibold text-ink">AAPL 10-K</h2>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-graphite">状态</dt>
                <dd className="flex items-center gap-2 font-medium text-ink">
                  <StatusDot tone="warning" />
                  提取文本中
                </dd>
              </div>
              <div>
                <dt className="text-graphite">Parser</dt>
                <dd className="font-medium text-ink">stage2-mock-parser</dd>
              </div>
              <div>
                <dt className="text-graphite">Data version</dt>
                <dd className="font-medium text-ink">stage2-document-mock-v1</dd>
              </div>
            </dl>
            <div className="mt-4 text-positive">
              <MiniTrendChart tone="positive" />
            </div>
            <div className="mt-4 grid gap-2">
              <button
                className="rounded-md border border-line bg-white px-3 py-2 text-left text-sm text-ink hover:border-ink"
                onClick={() => setAction("uploaded")}
                type="button"
              >
                上传样例财报
              </button>
              <button
                className="rounded-md border border-line bg-white px-3 py-2 text-left text-sm text-ink hover:border-ink"
                onClick={() => setAction("extracted")}
                type="button"
              >
                抽取指标候选
              </button>
              <button
                className="rounded-md border border-line bg-white px-3 py-2 text-left text-sm text-ink hover:border-ink"
                onClick={() => setAction("cited")}
                type="button"
              >
                引用原文页码
              </button>
            </div>
          </section>

          <section className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4" />
              <p>PDF 版式和表格结构需要置信度复核，低置信字段不能直接进入报告。</p>
            </div>
          </section>

          <section className="rounded-md border border-line bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-ink">优秀报告分析推荐</h2>
            <div className="mt-3 space-y-2">
              {reportRecommendations.map((item) => (
                <button
                  className={`w-full rounded-md border px-3 py-2 text-left text-sm hover:border-ink ${
                    selectedReport === item ? "border-ink bg-white text-ink" : "border-line bg-panel text-graphite"
                  }`}
                  key={item}
                  onClick={() => setSelectedReport(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
            <p className="mt-3 rounded-md border border-line bg-panel px-3 py-2 text-xs leading-5 text-graphite">
              已选择：{selectedReport}，可作为当前证据包的报告写法参考。
            </p>
          </section>

          <section className="rounded-md border border-line bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-ink">公司/行业新闻</h2>
            <div className="mt-3 space-y-3">
              {companyNews.map((item) => (
                <button
                  className={`w-full border-b border-line pb-3 text-left text-sm leading-6 last:border-b-0 last:pb-0 ${
                    selectedNews === item ? "text-ink" : "text-graphite"
                  }`}
                  key={item}
                  onClick={() => setSelectedNews(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
            <p className="mt-3 rounded-md border border-line bg-panel px-3 py-2 text-xs leading-5 text-graphite">
              当前关注：{selectedNews}
            </p>
          </section>
        </aside>

        <div className="space-y-4">
          <section className="rounded-md border border-line bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-ink">解析时间线</h2>
            <div className="mt-3 rounded-md border border-line bg-panel px-3 py-2 text-sm text-graphite">
              {activeMessage}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              {stages.map((stage) => (
                <div className="rounded-md border border-line bg-panel p-4" key={stage.label}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-ink">{stage.label}</div>
                    {stage.status === "done" ? (
                      <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-positive" />
                    ) : null}
                  </div>
                  <div className="mt-2 text-sm text-graphite">{stage.detail}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-line bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-ink">指标候选</h2>
            <div className="mt-4 overflow-hidden rounded-md border border-line">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-panel text-graphite">
                  <tr>
                    <th className="px-4 py-3 font-medium">指标</th>
                    <th className="px-4 py-3 font-medium">数值</th>
                    <th className="px-4 py-3 font-medium">单位</th>
                    <th className="px-4 py-3 font-medium">页码</th>
                    <th className="px-4 py-3 font-medium">置信度</th>
                  </tr>
                </thead>
                <tbody>
                  {metricCandidates.map((item) => (
                    <tr className="border-t border-line" key={item.metric}>
                      <td className="px-4 py-3 font-medium text-ink">{item.metric}</td>
                      <td className="px-4 py-3 text-ink">{item.value}</td>
                      <td className="px-4 py-3 text-graphite">{item.unit}</td>
                      <td className="px-4 py-3 text-graphite">{item.page}</td>
                      <td className="px-4 py-3 text-graphite">{item.confidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-md border border-line bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-ink">证据预览</h2>
            <p className="mt-3 text-sm leading-6 text-graphite">
              第 1-4 页包含收入、毛利率、经营利润、EPS、经营现金流和自由现金流候选。每个字段都会保存页码、parser、置信度和
              source text，后续 AI 摘要只能引用这些证据。
            </p>
          </section>

          <KeyDataGlyph />
        </div>
      </section>
    </main>
  );
}
