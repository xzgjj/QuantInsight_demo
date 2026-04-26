from datetime import UTC, datetime
from typing import Any, Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class ApiError(BaseModel):
    code: str
    message: str
    details: dict[str, Any] | None = None


class ApiMeta(BaseModel):
    source: str = "quantinsight"
    as_of: datetime = Field(default_factory=lambda: datetime.now(UTC))
    data_version: str = "mock-v1"
    warnings: list[str] = Field(default_factory=list)
    took_ms: int | None = None


class ApiEnvelope(BaseModel, Generic[T]):
    data: T | None
    meta: ApiMeta = Field(default_factory=ApiMeta)
    error: ApiError | None = None


def ok(data: T, *, meta: ApiMeta | None = None) -> ApiEnvelope[T]:
    return ApiEnvelope(data=data, meta=meta or ApiMeta(), error=None)
