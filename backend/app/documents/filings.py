import uuid
from datetime import UTC, datetime
from typing import Literal

import httpx
from pydantic import BaseModel, Field

from app.core.config import get_settings

ReviewStatus = Literal["pending", "accepted", "disputed"]
ReviewerType = Literal["human", "ai", "internal"]


class FilingSummary(BaseModel):
    filing_id: str
    symbol: str
    cik: str
    form_type: str
    accession_number: str
    filing_date: str
    report_period: str
    source: str
    source_url: str
    data_version: str


class FinancialFact(BaseModel):
    fact_id: str
    symbol: str
    filing_id: str
    metric_name: str
    label: str
    value: float
    unit: str
    period: str
    fiscal_year: int
    confidence: float
    source_url: str


class ChartReview(BaseModel):
    review_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    symbol: str
    metric_name: str
    status: ReviewStatus
    reviewer: ReviewerType
    note: str
    evidence_ids: list[str]
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class InternalResearchNote(BaseModel):
    note_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    symbol: str
    title: str
    source_owner: str
    stance: str
    evidence_ids: list[str]
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class ChartReviewRequest(BaseModel):
    symbol: str
    metric_name: str
    status: ReviewStatus = "pending"
    reviewer: ReviewerType = "human"
    note: str
    evidence_ids: list[str] = Field(default_factory=list)


class InMemoryFilingProvider:
    data_version = "stage3-sec-edgar-mock-v1"
    source = "sec-edgar-mock"

    def __init__(self) -> None:
        self._filings = {
            "AAPL": [
                FilingSummary(
                    filing_id="aapl-2025-10k",
                    symbol="AAPL",
                    cik="0000320193",
                    form_type="10-K",
                    accession_number="0000320193-25-000079",
                    filing_date="2025-10-31",
                    report_period="2025-09-27",
                    source=self.source,
                    source_url=(
                        "https://www.sec.gov/Archives/edgar/data/320193/"
                        "000032019325000079/0000320193-25-000079-index.htm"
                    ),
                    data_version=self.data_version,
                ),
                FilingSummary(
                    filing_id="aapl-2025-q3-10q",
                    symbol="AAPL",
                    cik="0000320193",
                    form_type="10-Q",
                    accession_number="0000320193-25-000063",
                    filing_date="2025-08-01",
                    report_period="2025-06-28",
                    source=self.source,
                    source_url=(
                        "https://www.sec.gov/Archives/edgar/data/320193/"
                        "000032019325000063/0000320193-25-000063-index.htm"
                    ),
                    data_version=self.data_version,
                ),
            ]
        }
        self._facts = {
            "AAPL": [
                ("revenue", "收入 Revenue", 383285.0, "USD million", "FY2025", 2025, 0.92),
                ("gross_margin", "毛利率 Gross Margin", 45.6, "%", "FY2025", 2025, 0.88),
                (
                    "operating_income",
                    "经营利润 Operating Income",
                    114301.0,
                    "USD million",
                    "FY2025",
                    2025,
                    0.9,
                ),
                ("net_income", "净利润 Net Income", 96995.0, "USD million", "FY2025", 2025, 0.91),
                ("diluted_eps", "摊薄 EPS Diluted EPS", 6.42, "USD/share", "FY2025", 2025, 0.87),
                (
                    "operating_cash_flow",
                    "经营现金流 Operating Cash Flow",
                    118254.0,
                    "USD million",
                    "FY2025",
                    2025,
                    0.89,
                ),
                (
                    "free_cash_flow",
                    "自由现金流 Free Cash Flow",
                    108807.0,
                    "USD million",
                    "FY2025",
                    2025,
                    0.84,
                ),
            ]
        }
        self._reviews: dict[str, list[ChartReview]] = {}
        self._notes: dict[str, list[InternalResearchNote]] = {
            "AAPL": [
                InternalResearchNote(
                    symbol="AAPL",
                    title="服务收入韧性跟踪",
                    source_owner="internal-research",
                    stance="服务收入仍是毛利率稳定性的主要解释变量，需用 10-K 分部数据复核。",
                    evidence_ids=["filing:aapl-2025-10k", "fact:gross_margin"],
                )
            ]
        }

    def list_filings(self, symbol: str) -> list[FilingSummary]:
        return self._filings.get(symbol.upper(), [])

    def select_filing(self, symbol: str, form_type: str = "10-K") -> FilingSummary | None:
        filings = self.list_filings(symbol)
        for filing in filings:
            if filing.form_type == form_type:
                return filing
        return filings[0] if filings else None

    def get_facts(self, symbol: str) -> list[FinancialFact]:
        filing = self.select_filing(symbol)
        if filing is None:
            return []
        return [
            FinancialFact(
                fact_id=f"fact:{symbol.upper()}:{metric_name}",
                symbol=symbol.upper(),
                filing_id=filing.filing_id,
                metric_name=metric_name,
                label=label,
                value=value,
                unit=unit,
                period=period,
                fiscal_year=fiscal_year,
                confidence=confidence,
                source_url=filing.source_url,
            )
            for metric_name, label, value, unit, period, fiscal_year, confidence in self._facts.get(
                symbol.upper(), []
            )
        ]

    def create_chart_review(self, request: ChartReviewRequest) -> ChartReview:
        payload = request.model_dump()
        payload["symbol"] = request.symbol.upper()
        review = ChartReview(**payload)
        self._reviews.setdefault(review.symbol, []).append(review)
        return review

    def list_chart_reviews(self, symbol: str) -> list[ChartReview]:
        return self._reviews.get(symbol.upper(), [])

    def list_internal_notes(self, symbol: str) -> list[InternalResearchNote]:
        return self._notes.get(symbol.upper(), [])


filing_provider = InMemoryFilingProvider()


SEC_CONCEPTS = {
    "revenue": [
        "RevenueFromContractWithCustomerExcludingAssessedTax",
        "Revenues",
        "SalesRevenueNet",
    ],
    "gross_profit": ["GrossProfit"],
    "operating_income": ["OperatingIncomeLoss"],
    "net_income": ["NetIncomeLoss"],
    "diluted_eps": ["EarningsPerShareDiluted"],
    "operating_cash_flow": ["NetCashProvidedByUsedInOperatingActivities"],
    "capex": ["PaymentsToAcquirePropertyPlantAndEquipment"],
}

FACT_LABELS = {
    "revenue": "收入 Revenue",
    "gross_profit": "毛利润 Gross Profit",
    "gross_margin": "毛利率 Gross Margin",
    "operating_income": "经营利润 Operating Income",
    "operating_margin": "经营利润率 Operating Margin",
    "net_income": "净利润 Net Income",
    "diluted_eps": "摊薄 EPS Diluted EPS",
    "operating_cash_flow": "经营现金流 Operating Cash Flow",
    "free_cash_flow": "自由现金流 Free Cash Flow",
}


class SecEdgarFilingProvider(InMemoryFilingProvider):
    source = "sec-edgar"
    data_version = "sec-edgar-live"

    def __init__(self, user_agent: str) -> None:
        super().__init__()
        self.user_agent = user_agent
        self._client = httpx.Client(
            headers={
                "User-Agent": user_agent,
                "Accept-Encoding": "gzip, deflate",
            },
            timeout=15.0,
            follow_redirects=True,
        )
        self._cik_cache: dict[str, str] = {}

    def list_filings(self, symbol: str) -> list[FilingSummary]:
        cik = self._resolve_cik(symbol)
        payload = self._get_json(f"https://data.sec.gov/submissions/CIK{cik}.json")
        recent = payload.get("filings", {}).get("recent", {})
        forms = recent.get("form", [])
        accession_numbers = recent.get("accessionNumber", [])
        filing_dates = recent.get("filingDate", [])
        report_dates = recent.get("reportDate", [])
        primary_docs = recent.get("primaryDocument", [])

        filings: list[FilingSummary] = []
        cik_path = str(int(cik))
        for index, form_type in enumerate(forms):
            if form_type not in {"10-K", "10-Q", "8-K", "20-F", "6-K"}:
                continue
            accession = accession_numbers[index]
            accession_path = accession.replace("-", "")
            primary_doc = primary_docs[index] if index < len(primary_docs) else ""
            source_url = (
                f"https://www.sec.gov/Archives/edgar/data/{cik_path}/"
                f"{accession_path}/{primary_doc}"
            )
            filings.append(
                FilingSummary(
                    filing_id=f"{symbol.upper()}-{accession}",
                    symbol=symbol.upper(),
                    cik=cik,
                    form_type=form_type,
                    accession_number=accession,
                    filing_date=filing_dates[index],
                    report_period=report_dates[index] if index < len(report_dates) else "",
                    source=self.source,
                    source_url=source_url,
                    data_version=self.data_version,
                )
            )
            if len(filings) >= 10:
                break
        return filings

    def select_filing(self, symbol: str, form_type: str = "10-K") -> FilingSummary | None:
        filings = self.list_filings(symbol)
        for filing in filings:
            if filing.form_type == form_type:
                return filing
        return filings[0] if filings else None

    def get_facts(self, symbol: str) -> list[FinancialFact]:
        cik = self._resolve_cik(symbol)
        filing = self.select_filing(symbol)
        if filing is None:
            return []
        payload = self._get_json(f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json")
        us_gaap = payload.get("facts", {}).get("us-gaap", {})
        extracted = {
            metric: self._latest_annual_fact(us_gaap, tags)
            for metric, tags in SEC_CONCEPTS.items()
        }

        facts: list[FinancialFact] = []
        for metric_name in (
            "revenue",
            "gross_profit",
            "operating_income",
            "net_income",
            "diluted_eps",
            "operating_cash_flow",
        ):
            item = extracted.get(metric_name)
            if item is None:
                continue
            facts.append(self._fact_from_sec(symbol, filing, metric_name, item, confidence=0.95))

        revenue = extracted.get("revenue")
        gross_profit = extracted.get("gross_profit")
        operating_income = extracted.get("operating_income")
        operating_cash_flow = extracted.get("operating_cash_flow")
        capex = extracted.get("capex")
        if revenue and gross_profit and revenue["value"]:
            facts.append(
                self._computed_fact(
                    symbol,
                    filing,
                    "gross_margin",
                    gross_profit["value"] / revenue["value"] * 100,
                    "%",
                    revenue,
                )
            )
        if revenue and operating_income and revenue["value"]:
            facts.append(
                self._computed_fact(
                    symbol,
                    filing,
                    "operating_margin",
                    operating_income["value"] / revenue["value"] * 100,
                    "%",
                    revenue,
                )
            )
        if operating_cash_flow and capex:
            facts.append(
                self._computed_fact(
                    symbol,
                    filing,
                    "free_cash_flow",
                    operating_cash_flow["value"] - abs(capex["value"]),
                    operating_cash_flow["unit"],
                    operating_cash_flow,
                )
            )

        return facts

    def _resolve_cik(self, symbol: str) -> str:
        normalized = symbol.upper()
        if normalized in self._cik_cache:
            return self._cik_cache[normalized]
        payload = self._get_json("https://www.sec.gov/files/company_tickers.json")
        for item in payload.values():
            if item.get("ticker", "").upper() == normalized:
                cik = str(item["cik_str"]).zfill(10)
                self._cik_cache[normalized] = cik
                return cik
        raise KeyError(f"No SEC CIK found for symbol: {symbol}")

    def _get_json(self, url: str) -> dict:
        response = self._client.get(url)
        response.raise_for_status()
        return response.json()

    def _latest_annual_fact(self, us_gaap: dict, tags: list[str]) -> dict | None:
        candidates: list[dict] = []
        for tag in tags:
            concept = us_gaap.get(tag, {})
            for unit, rows in concept.get("units", {}).items():
                for row in rows:
                    if row.get("form") not in {"10-K", "20-F"}:
                        continue
                    if row.get("fy") is None or row.get("val") is None:
                        continue
                    candidates.append(
                        {
                            "value": float(row["val"]),
                            "unit": unit,
                            "period": f"FY{row['fy']}",
                            "fiscal_year": int(row["fy"]),
                            "filed": row.get("filed", ""),
                        }
                    )
        if not candidates:
            return None
        return sorted(candidates, key=lambda item: (item["fiscal_year"], item["filed"]))[-1]

    def _fact_from_sec(
        self,
        symbol: str,
        filing: FilingSummary,
        metric_name: str,
        item: dict,
        confidence: float,
    ) -> FinancialFact:
        return FinancialFact(
            fact_id=f"fact:{symbol.upper()}:{metric_name}",
            symbol=symbol.upper(),
            filing_id=filing.filing_id,
            metric_name=metric_name,
            label=FACT_LABELS[metric_name],
            value=round(float(item["value"]), 4),
            unit=item["unit"],
            period=item["period"],
            fiscal_year=item["fiscal_year"],
            confidence=confidence,
            source_url=filing.source_url,
        )

    def _computed_fact(
        self,
        symbol: str,
        filing: FilingSummary,
        metric_name: str,
        value: float,
        unit: str,
        source_item: dict,
    ) -> FinancialFact:
        return FinancialFact(
            fact_id=f"fact:{symbol.upper()}:{metric_name}",
            symbol=symbol.upper(),
            filing_id=filing.filing_id,
            metric_name=metric_name,
            label=FACT_LABELS[metric_name],
            value=round(float(value), 4),
            unit=unit,
            period=source_item["period"],
            fiscal_year=source_item["fiscal_year"],
            confidence=0.82,
            source_url=filing.source_url,
        )


def get_filing_provider():
    settings = get_settings()
    if settings.filing_provider.lower() != "sec":
        return filing_provider
    return SecEdgarFilingProvider(settings.sec_user_agent)
