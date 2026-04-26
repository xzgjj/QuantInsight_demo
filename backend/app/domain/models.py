from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class Ticker(TimestampMixin, Base):
    __tablename__ = "tickers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    symbol: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    exchange: Mapped[str] = mapped_column(String(64))
    currency: Mapped[str] = mapped_column(String(16), default="USD")
    country: Mapped[str] = mapped_column(String(64), default="US")
    sector: Mapped[str | None] = mapped_column(String(128))

    quotes: Mapped[list["Quote"]] = relationship(back_populates="ticker")
    metrics: Mapped[list["Metric"]] = relationship(back_populates="ticker")


class Quote(TimestampMixin, Base):
    __tablename__ = "quotes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ticker_id: Mapped[int] = mapped_column(ForeignKey("tickers.id"), index=True)
    price: Mapped[float] = mapped_column(Numeric(18, 4))
    change_percent: Mapped[float] = mapped_column(Numeric(10, 4))
    volume: Mapped[int] = mapped_column(Integer)
    as_of: Mapped[str] = mapped_column(String(64))
    source: Mapped[str] = mapped_column(String(64))
    data_version: Mapped[str] = mapped_column(String(64))

    ticker: Mapped[Ticker] = relationship(back_populates="quotes")


class Metric(TimestampMixin, Base):
    __tablename__ = "metrics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ticker_id: Mapped[int] = mapped_column(ForeignKey("tickers.id"), index=True)
    name: Mapped[str] = mapped_column(String(128))
    value: Mapped[float] = mapped_column(Numeric(20, 6))
    unit: Mapped[str] = mapped_column(String(32))
    period: Mapped[str] = mapped_column(String(32))
    source: Mapped[str] = mapped_column(String(64))
    methodology: Mapped[str] = mapped_column(Text)
    data_version: Mapped[str] = mapped_column(String(64))

    ticker: Mapped[Ticker] = relationship(back_populates="metrics")


class Document(TimestampMixin, Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ticker_id: Mapped[int | None] = mapped_column(ForeignKey("tickers.id"), index=True)
    filename: Mapped[str] = mapped_column(String(255))
    file_hash: Mapped[str] = mapped_column(String(128), unique=True)
    document_type: Mapped[str] = mapped_column(String(64))
    parse_status: Mapped[str] = mapped_column(String(32), default="queued")
    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict)


class Analysis(TimestampMixin, Base):
    __tablename__ = "analyses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ticker_id: Mapped[int | None] = mapped_column(ForeignKey("tickers.id"), index=True)
    analysis_type: Mapped[str] = mapped_column(String(64))
    model: Mapped[str] = mapped_column(String(128))
    tool_calls: Mapped[list] = mapped_column(JSON, default=list)
    evidence_ids: Mapped[list] = mapped_column(JSON, default=list)
    token_usage: Mapped[dict] = mapped_column(JSON, default=dict)
    disclaimer_required: Mapped[bool] = mapped_column(default=True)
    output_summary: Mapped[str] = mapped_column(Text)


class Task(TimestampMixin, Base):
    __tablename__ = "tasks"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    task_type: Mapped[str] = mapped_column(String(64), index=True)
    status: Mapped[str] = mapped_column(String(32), index=True)
    progress: Mapped[int] = mapped_column(Integer, default=0)
    error: Mapped[dict | None] = mapped_column(JSON)
    result: Mapped[dict | None] = mapped_column(JSON)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class DocumentChunk(TimestampMixin, Base):
    __tablename__ = "document_chunks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    document_id: Mapped[int] = mapped_column(ForeignKey("documents.id"), index=True)
    page_start: Mapped[int] = mapped_column(Integer)
    page_end: Mapped[int] = mapped_column(Integer)
    text: Mapped[str] = mapped_column(Text)
    chunk_hash: Mapped[str] = mapped_column(String(128), unique=True)
    parser: Mapped[str] = mapped_column(String(64))
    confidence: Mapped[float] = mapped_column(Numeric(5, 4))


class DocumentTable(TimestampMixin, Base):
    __tablename__ = "document_tables"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    document_id: Mapped[int] = mapped_column(ForeignKey("documents.id"), index=True)
    page: Mapped[int] = mapped_column(Integer)
    table_json: Mapped[dict] = mapped_column(JSON)
    parser: Mapped[str] = mapped_column(String(64))
    confidence: Mapped[float] = mapped_column(Numeric(5, 4))


class MetricObservation(TimestampMixin, Base):
    __tablename__ = "metric_observations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ticker_id: Mapped[int | None] = mapped_column(ForeignKey("tickers.id"), index=True)
    metric_name: Mapped[str] = mapped_column(String(128), index=True)
    value: Mapped[float] = mapped_column(Numeric(20, 6))
    unit: Mapped[str] = mapped_column(String(32))
    period: Mapped[str] = mapped_column(String(32))
    source_document_id: Mapped[int | None] = mapped_column(ForeignKey("documents.id"), index=True)
    page: Mapped[int | None] = mapped_column(Integer)
    confidence: Mapped[float] = mapped_column(Numeric(5, 4))
    data_version: Mapped[str] = mapped_column(String(64))


class EvidenceItem(TimestampMixin, Base):
    __tablename__ = "evidence_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    evidence_type: Mapped[str] = mapped_column(String(64), index=True)
    source: Mapped[str] = mapped_column(String(128))
    source_id: Mapped[str] = mapped_column(String(128), index=True)
    locator: Mapped[dict] = mapped_column(JSON)
    quote: Mapped[str] = mapped_column(Text)
    evidence_hash: Mapped[str] = mapped_column(String(128), unique=True)


class ProviderRun(TimestampMixin, Base):
    __tablename__ = "provider_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    provider: Mapped[str] = mapped_column(String(64), index=True)
    endpoint: Mapped[str] = mapped_column(String(128))
    status: Mapped[str] = mapped_column(String(32), index=True)
    latency_ms: Mapped[int | None] = mapped_column(Integer)
    request_hash: Mapped[str] = mapped_column(String(128), index=True)
    error: Mapped[dict | None] = mapped_column(JSON)
