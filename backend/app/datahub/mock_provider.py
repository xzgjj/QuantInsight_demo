from datetime import UTC, datetime

from app.datahub.provider import (
    CompanySearchResult,
    CompanySnapshot,
    MarketDataProvider,
    ProviderHealth,
)

MOCK_COMPANIES: dict[str, CompanySnapshot] = {
    "AAPL": CompanySnapshot(
        symbol="AAPL",
        name="Apple Inc.",
        exchange="NASDAQ",
        currency="USD",
        price=189.12,
        change_percent=0.84,
        volume=58_240_000,
        metrics={"revenue_ttm": 383_285_000_000, "gross_margin": "45.6%", "pe_ttm": 29.4},
        source="mock-provider",
        as_of=datetime(2026, 4, 26, 0, 0, tzinfo=UTC),
        data_version="mock-equity-2026-04-26",
        warnings=["Mock data for engineering validation only."],
    ),
    "00700.HK": CompanySnapshot(
        symbol="00700.HK",
        name="Tencent Holdings Ltd.",
        exchange="HKEX",
        currency="HKD",
        price=386.40,
        change_percent=-0.31,
        volume=21_540_000,
        metrics={"revenue_ttm": 609_015_000_000, "gross_margin": "49.8%", "pe_ttm": 22.1},
        source="mock-provider",
        as_of=datetime(2026, 4, 26, 0, 0, tzinfo=UTC),
        data_version="mock-equity-2026-04-26",
        warnings=["Mock data for engineering validation only."],
    ),
    "MSFT": CompanySnapshot(
        symbol="MSFT",
        name="Microsoft Corp.",
        exchange="NASDAQ",
        currency="USD",
        price=412.35,
        change_percent=0.42,
        volume=24_120_000,
        metrics={"revenue_ttm": 245_122_000_000, "gross_margin": "69.7%", "pe_ttm": 34.8},
        source="mock-provider",
        as_of=datetime(2026, 4, 26, 0, 0, tzinfo=UTC),
        data_version="mock-equity-2026-04-26",
        warnings=["Mock data for engineering validation only."],
    ),
    "NVDA": CompanySnapshot(
        symbol="NVDA",
        name="NVIDIA Corp.",
        exchange="NASDAQ",
        currency="USD",
        price=921.44,
        change_percent=1.18,
        volume=39_780_000,
        metrics={"revenue_ttm": 130_497_000_000, "gross_margin": "73.0%", "pe_ttm": 48.6},
        source="mock-provider",
        as_of=datetime(2026, 4, 26, 0, 0, tzinfo=UTC),
        data_version="mock-equity-2026-04-26",
        warnings=["Mock data for engineering validation only."],
    ),
}


class MockMarketDataProvider(MarketDataProvider):
    name = "mock-provider"

    async def health(self) -> ProviderHealth:
        return ProviderHealth(name=self.name, status="ok", latency_ms=1)

    async def search_companies(self, query: str) -> list[CompanySearchResult]:
        normalized = query.strip().lower()
        return [
            CompanySearchResult(
                symbol=item.symbol,
                name=item.name,
                exchange=item.exchange,
                country="US" if item.currency == "USD" else "HK",
                sector="Technology",
            )
            for item in MOCK_COMPANIES.values()
            if normalized in item.symbol.lower() or normalized in item.name.lower()
        ]

    async def get_company_snapshot(self, symbol: str) -> CompanySnapshot:
        key = symbol.upper()
        if key not in MOCK_COMPANIES:
            raise KeyError(f"Unknown mock ticker: {symbol}")
        return MOCK_COMPANIES[key]


def get_market_provider() -> MarketDataProvider:
    return MockMarketDataProvider()
