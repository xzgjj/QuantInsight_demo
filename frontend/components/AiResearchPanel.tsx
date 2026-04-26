"use client";

import { useState } from "react";
import { Bot, CheckCircle2, FileText, MessageSquare, Send } from "lucide-react";

const tasks = [
  {
    id: "summary",
    label: "生成公司摘要",
    prompt: "基于证据包生成苹果研究摘要",
    output: "苹果当前研究重点集中在服务收入、毛利率稳定性和硬件换机周期。缺口：真实 10-K 表格解析尚未接入。"
  },
  {
    id: "missing",
    label: "检查缺失证据",
    prompt: "找出财报中缺失或低置信指标",
    output: "低置信字段：PDF 表格结构、分部收入、经营现金流同比。建议先上传 10-K 并回到原文页码复核。"
  },
  {
    id: "peer",
    label: "同行比较提纲",
    prompt: "生成同行比较提纲",
    output: "比较对象建议：微软、谷歌、三星。维度：收入结构、毛利率、服务/云收入占比、估值口径。"
  },
  {
    id: "report",
    label: "加入报告草稿",
    prompt: "把当前结论加入报告草稿",
    output: "已生成报告段落结构：公司概览、核心指标、证据引用、风险缺口、下一步回测假设。"
  }
];

export function AiResearchPanel() {
  const [activeTask, setActiveTask] = useState(tasks[0]);
  const [isGenerated, setIsGenerated] = useState(false);

  return (
    <section className="rounded-md border border-line bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Bot aria-hidden="true" className="h-5 w-5 text-graphite" />
        <h2 className="text-base font-semibold text-ink">AI 研究助手</h2>
      </div>

      <div className="mt-4 rounded-md border border-line bg-panel p-3 text-sm text-graphite">
        <MessageSquare aria-hidden="true" className="mb-2 h-4 w-4" />
        这不是四个孤立按钮，而是一条 AI 工作流：先选择任务，再确认证据范围，最后生成可加入报告的结果。
      </div>

      <div className="mt-4 grid gap-2">
        {tasks.map((task) => (
          <button
            className={`flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition ${
              activeTask.id === task.id
                ? "border-ink bg-ink text-white"
                : "border-line bg-white text-ink hover:border-ink"
            }`}
            key={task.id}
            onClick={() => {
              setActiveTask(task);
              setIsGenerated(false);
            }}
            type="button"
          >
            {task.label}
            {activeTask.id === task.id ? <CheckCircle2 aria-hidden="true" className="h-4 w-4" /> : null}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-md border border-line bg-panel p-3">
        <div className="text-xs text-graphite">当前任务</div>
        <div className="mt-1 text-sm font-semibold text-ink">{activeTask.prompt}</div>
        <div className="mt-3 flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2">
          <span className="flex-1 text-sm text-graphite">证据范围：公司快照 + 财报候选 + 审计栏</span>
          <FileText aria-hidden="true" className="h-4 w-4 text-graphite" />
        </div>
        <button
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-3 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5"
          onClick={() => setIsGenerated(true)}
          type="button"
        >
          <Send aria-hidden="true" className="h-4 w-4" />
          生成结果
        </button>
      </div>

      {isGenerated ? (
        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-950">
          {activeTask.output}
        </div>
      ) : null}
    </section>
  );
}
