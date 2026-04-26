"""document evidence schema

Revision ID: 0002_document_evidence_schema
Revises: 0001_initial_schema
Create Date: 2026-04-26
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0002_document_evidence_schema"
down_revision: str | None = "0001_initial_schema"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "document_chunks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("document_id", sa.Integer(), nullable=False),
        sa.Column("page_start", sa.Integer(), nullable=False),
        sa.Column("page_end", sa.Integer(), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("chunk_hash", sa.String(length=128), nullable=False),
        sa.Column("parser", sa.String(length=64), nullable=False),
        sa.Column("confidence", sa.Numeric(precision=5, scale=4), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("chunk_hash"),
    )
    op.create_index(op.f("ix_document_chunks_document_id"), "document_chunks", ["document_id"])

    op.create_table(
        "document_tables",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("document_id", sa.Integer(), nullable=False),
        sa.Column("page", sa.Integer(), nullable=False),
        sa.Column("table_json", sa.JSON(), nullable=False),
        sa.Column("parser", sa.String(length=64), nullable=False),
        sa.Column("confidence", sa.Numeric(precision=5, scale=4), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_document_tables_document_id"), "document_tables", ["document_id"])

    op.create_table(
        "metric_observations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("ticker_id", sa.Integer(), nullable=True),
        sa.Column("metric_name", sa.String(length=128), nullable=False),
        sa.Column("value", sa.Numeric(precision=20, scale=6), nullable=False),
        sa.Column("unit", sa.String(length=32), nullable=False),
        sa.Column("period", sa.String(length=32), nullable=False),
        sa.Column("source_document_id", sa.Integer(), nullable=True),
        sa.Column("page", sa.Integer(), nullable=True),
        sa.Column("confidence", sa.Numeric(precision=5, scale=4), nullable=False),
        sa.Column("data_version", sa.String(length=64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["source_document_id"], ["documents.id"]),
        sa.ForeignKeyConstraint(["ticker_id"], ["tickers.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_metric_observations_metric_name"), "metric_observations", ["metric_name"])
    op.create_index(
        op.f("ix_metric_observations_source_document_id"),
        "metric_observations",
        ["source_document_id"],
    )
    op.create_index(op.f("ix_metric_observations_ticker_id"), "metric_observations", ["ticker_id"])

    op.create_table(
        "evidence_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("evidence_type", sa.String(length=64), nullable=False),
        sa.Column("source", sa.String(length=128), nullable=False),
        sa.Column("source_id", sa.String(length=128), nullable=False),
        sa.Column("locator", sa.JSON(), nullable=False),
        sa.Column("quote", sa.Text(), nullable=False),
        sa.Column("evidence_hash", sa.String(length=128), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("evidence_hash"),
    )
    op.create_index(op.f("ix_evidence_items_evidence_type"), "evidence_items", ["evidence_type"])
    op.create_index(op.f("ix_evidence_items_source_id"), "evidence_items", ["source_id"])

    op.create_table(
        "provider_runs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("provider", sa.String(length=64), nullable=False),
        sa.Column("endpoint", sa.String(length=128), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("latency_ms", sa.Integer(), nullable=True),
        sa.Column("request_hash", sa.String(length=128), nullable=False),
        sa.Column("error", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_provider_runs_provider"), "provider_runs", ["provider"])
    op.create_index(op.f("ix_provider_runs_request_hash"), "provider_runs", ["request_hash"])
    op.create_index(op.f("ix_provider_runs_status"), "provider_runs", ["status"])


def downgrade() -> None:
    op.drop_index(op.f("ix_provider_runs_status"), table_name="provider_runs")
    op.drop_index(op.f("ix_provider_runs_request_hash"), table_name="provider_runs")
    op.drop_index(op.f("ix_provider_runs_provider"), table_name="provider_runs")
    op.drop_table("provider_runs")
    op.drop_index(op.f("ix_evidence_items_source_id"), table_name="evidence_items")
    op.drop_index(op.f("ix_evidence_items_evidence_type"), table_name="evidence_items")
    op.drop_table("evidence_items")
    op.drop_index(op.f("ix_metric_observations_ticker_id"), table_name="metric_observations")
    op.drop_index(
        op.f("ix_metric_observations_source_document_id"), table_name="metric_observations"
    )
    op.drop_index(op.f("ix_metric_observations_metric_name"), table_name="metric_observations")
    op.drop_table("metric_observations")
    op.drop_index(op.f("ix_document_tables_document_id"), table_name="document_tables")
    op.drop_table("document_tables")
    op.drop_index(op.f("ix_document_chunks_document_id"), table_name="document_chunks")
    op.drop_table("document_chunks")
