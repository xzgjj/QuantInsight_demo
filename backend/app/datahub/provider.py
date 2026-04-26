from abc import ABC, abstractmethod
from datetime import UTC, datetime

from pydantic import BaseModel, Field


class ProviderHealth(BaseModel):
    name: str
    status: str
    latency_ms: int | None = None
    checked_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    message: str | None = None


class CompanySearchResult(BaseModel):
    symbol: str
    name: str
    exchange: str
    country: str
    sector: str | None = None


class CompanySnapshot(BaseModel):
    symbol: str
    name: str
    exchange: str
    currency: str
    price: float
    change_percent: float
    volume: int
    metrics: dict[str, float | str]
    source: str
    as_of: datetime
    data_version: str
    warnings: list[str] = Field(default_factory=list)


class MarketDataProvider(ABC):
    name: str

    @abstractmethod
    async def health(self) -> ProviderHealth:
        raise NotImplementedError

    @abstractmethod
    async def search_companies(self, query: str) -> list[CompanySearchResult]:
        raise NotImplementedError

    @abstractmethod
    async def get_company_snapshot(self, symbol: str) -> CompanySnapshot:
        raise NotImplementedError
