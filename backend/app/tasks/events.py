import json
import uuid
from collections.abc import AsyncGenerator
from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Literal

TaskEventName = Literal["stage", "warning", "partial", "result", "error", "done"]


@dataclass
class TaskEvent:
    event: TaskEventName
    data: dict

    def to_sse(self) -> str:
        return f"event: {self.event}\ndata: {json.dumps(self.data, default=str)}\n\n"


@dataclass
class TaskRecord:
    task_id: str
    task_type: str
    status: str = "queued"
    progress: int = 0
    events: list[TaskEvent] = field(default_factory=list)
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))


class InMemoryTaskStore:
    def __init__(self) -> None:
        self._tasks: dict[str, TaskRecord] = {}

    def create_demo_task(self, task_type: str) -> TaskRecord:
        task = TaskRecord(task_id=str(uuid.uuid4()), task_type=task_type)
        task.events.extend(
            [
                TaskEvent("stage", {"stage": "queued", "progress": 10}),
                TaskEvent("stage", {"stage": "running", "progress": 45}),
                TaskEvent("partial", {"message": "Mock task emitted a partial result."}),
                TaskEvent("result", {"summary": "Mock task completed."}),
                TaskEvent("done", {"status": "completed", "progress": 100}),
            ]
        )
        task.status = "completed"
        task.progress = 100
        self._tasks[task.task_id] = task
        return task

    def create_document_parse_task(self, filename: str) -> TaskRecord:
        task = TaskRecord(task_id=str(uuid.uuid4()), task_type="document_parse")
        task.events.extend(
            [
                TaskEvent("stage", {"stage": "queued", "progress": 5, "filename": filename}),
                TaskEvent("stage", {"stage": "validating", "progress": 20}),
                TaskEvent("stage", {"stage": "extracting_text", "progress": 45}),
                TaskEvent(
                    "warning",
                    {
                        "code": "MOCK_PARSER",
                        "message": "Stage 2 parser preserves evidence plumbing, not final layout.",
                    },
                ),
                TaskEvent(
                    "partial",
                    {"message": "Text chunks and metric candidates are available."},
                ),
                TaskEvent("result", {"summary": "Document parsing completed."}),
                TaskEvent("done", {"status": "completed", "progress": 100}),
            ]
        )
        task.status = "completed"
        task.progress = 100
        self._tasks[task.task_id] = task
        return task

    def create_filing_fetch_task(self, symbol: str, source: str) -> TaskRecord:
        task = TaskRecord(task_id=str(uuid.uuid4()), task_type="filing_fetch")
        task.events.extend(
            [
                TaskEvent("stage", {"stage": "queued", "progress": 5, "symbol": symbol}),
                TaskEvent("stage", {"stage": "resolving_entity", "progress": 20}),
                TaskEvent("stage", {"stage": "fetching_filing_index", "progress": 45}),
                TaskEvent("partial", {"message": f"Fetched filing catalog from {source}."}),
                TaskEvent("stage", {"stage": "normalizing_facts", "progress": 75}),
                TaskEvent("result", {"summary": "Filing facts are ready for chart review."}),
                TaskEvent("done", {"status": "completed", "progress": 100}),
            ]
        )
        task.status = "completed"
        task.progress = 100
        self._tasks[task.task_id] = task
        return task

    def get(self, task_id: str) -> TaskRecord | None:
        return self._tasks.get(task_id)

    async def stream(self, task_id: str) -> AsyncGenerator[str, None]:
        task = self.get(task_id)
        if task is None:
            yield TaskEvent("error", {"code": "TASK_NOT_FOUND", "message": task_id}).to_sse()
            yield TaskEvent("done", {"status": "failed"}).to_sse()
            return
        for event in task.events:
            yield event.to_sse()


task_store = InMemoryTaskStore()
