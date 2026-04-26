"""stage 3 evidence intelligence schema

Revision ID: 0003_stage3_evidence_intelligence
Revises: 0002_document_evidence_schema
Create Date: 2026-04-26
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0003_stage3_evidence_intelligence"
down_revision: str | None = "0002_document_evidence_schema"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "filing_sources",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("ticker_id", sa.Integer(), nullable=True),
        sa.Column("symbol", sa.String(length=32), nullable=False),
        sa.Column("cik", sa.String(length=32), nullable=False),
        sa.Column("form_type", sa.String(length=32), nullable=False),
        sa.Column("accession_number", sa.String(length=64), nullable=False),
        sa.Column("filing_date", sa.String(length=32), nullable=False),
        sa.Column("report_period", sa.String(length=32), nullable=False),
        sa.Column("source", sa.String(length=64), nullable=False),
        sa.Column("source_url", sa.Text(), nullable=False),
        sa.Column("data_version", sa.String(length=64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["ticker_id"], ["tickers.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("accession_number"),
    )
    op.create_index(op.f("ix_filing_sources_cik"), "filing_sources", ["cik"])
    op.create_index(op.f("ix_filing_sources_form_type"), "filing_sources", ["form_type"])
    op.create_index(op.f("ix_filing_sources_symbol"), "filing_sources", ["symbol"])
    op.create_index(op.f("ix_filing_sources_ticker_id"), "filing_sources", ["ticker_id"])

    op.create_table(
        "financial_facts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("ticker_id", sa.Integer(), nullable=True),
        sa.Column("filing_source_id", sa.Integer(), nullable=True),
        sa.Column("metric_name", sa.String(length=128), nullable=False),
        sa.Column("label", sa.String(length=255), nullable=False),
        sa.Column("value", sa.Numeric(precision=20, scale=6), nullable=False),
        sa.Column("unit", sa.String(length=32), nullable=False),
        sa.Column("period", sa.String(length=32), nullable=False),
        sa.Column("fiscal_year", sa.Integer(), nullable=True),
        sa.Column("confidence", sa.Numeric(precision=5, scale=4), nullable=False),
        sa.Column("source_url", sa.Text(), nullable=False),
        sa.Column("data_version", sa.String(length=64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["filing_source_id"], ["filing_sources.id"]),
        sa.ForeignKeyConstraint(["ticker_id"], ["tickers.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_financial_facts_filing_source_id"), "financial_facts", ["filing_source_id"])
    op.create_index(op.f("ix_financial_facts_metric_name"), "financial_facts", ["metric_name"])
    op.create_index(op.f("ix_financial_facts_ticker_id"), "financial_facts", ["ticker_id"])

    op.create_table(
        "chart_reviews",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("ticker_id", sa.Integer(), nullable=True),
        sa.Column("metric_name", sa.String(length=128), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("reviewer", sa.String(length=32), nullable=False),
        sa.Column("note", sa.Text(), nullable=False),
        sa.Column("evidence_ids", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["ticker_id"], ["tickers.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_chart_reviews_metric_name"), "chart_reviews", ["metric_name"])
    op.create_index(op.f("ix_chart_reviews_reviewer"), "chart_reviews", ["reviewer"])
    op.create_index(op.f("ix_chart_reviews_status"), "chart_reviews", ["status"])
    op.create_index(op.f("ix_chart_reviews_ticker_id"), "chart_reviews", ["ticker_id"])

    op.create_table(
        "internal_research_notes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("ticker_id", sa.Integer(), nullable=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("source_owner", sa.String(length=128), nullable=False),
        sa.Column("stance", sa.Text(), nullable=False),
        sa.Column("evidence_ids", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["ticker_id"], ["tickers.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_internal_research_notes_ticker_id"), "internal_research_notes", ["ticker_id"]
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_internal_research_notes_ticker_id"), table_name="internal_research_notes")
    op.drop_table("internal_research_notes")
    op.drop_index(op.f("ix_chart_reviews_ticker_id"), table_name="chart_reviews")
    op.drop_index(op.f("ix_chart_reviews_status"), table_name="chart_reviews")
    op.drop_index(op.f("ix_chart_reviews_reviewer"), table_name="chart_reviews")
    op.drop_index(op.f("ix_chart_reviews_metric_name"), table_name="chart_reviews")
    op.drop_table("chart_reviews")
    op.drop_index(op.f("ix_financial_facts_ticker_id"), table_name="financial_facts")
    op.drop_index(op.f("ix_financial_facts_metric_name"), table_name="financial_facts")
    op.drop_index(op.f("ix_financial_facts_filing_source_id"), table_name="financial_facts")
    op.drop_table("financial_facts")
    op.drop_index(op.f("ix_filing_sources_ticker_id"), table_name="filing_sources")
    op.drop_index(op.f("ix_filing_sources_symbol"), table_name="filing_sources")
    op.drop_index(op.f("ix_filing_sources_form_type"), table_name="filing_sources")
    op.drop_index(op.f("ix_filing_sources_cik"), table_name="filing_sources")
    op.drop_table("filing_sources")
