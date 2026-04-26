from datetime import UTC, datetime
from uuid import uuid4

from pydantic import BaseModel, Field


class ToolCall(BaseModel):
    tool_name: str
    payload: dict
    result_summary: str


class AuditRecord(BaseModel):
    audit_id: str = Field(default_factory=lambda: str(uuid4()))
    model: str
    input_summary: str
    tool_calls: list[ToolCall]
    evidence_ids: list[str]
    token_usage: dict[str, int]
    disclaimer_required: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class AuditStore:
    def __init__(self) -> None:
        self._records: dict[str, AuditRecord] = {}

    def create_mock_company_audit(self, symbol: str) -> AuditRecord:
        record = AuditRecord(
            model="mock-llm-v1",
            input_summary=f"Summarize company snapshot for {symbol}.",
            tool_calls=[
                ToolCall(
                    tool_name="get_company_snapshot",
                    payload={"symbol": symbol},
                    result_summary="Returned mock snapshot with quote and metrics.",
                )
            ],
            evidence_ids=[f"snapshot:{symbol.upper()}:mock-equity-2026-04-26"],
            token_usage={"prompt_tokens": 128, "completion_tokens": 96, "total_tokens": 224},
        )
        self._records[record.audit_id] = record
        return record

    def get(self, audit_id: str) -> AuditRecord | None:
        return self._records.get(audit_id)


audit_store = AuditStore()
