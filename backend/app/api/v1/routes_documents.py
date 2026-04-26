import time
from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.core.envelope import ApiMeta, ok
from app.documents.service import DocumentValidationError, document_store
from app.tasks.events import task_store

router = APIRouter()


@router.post("")
async def upload_document(
    file: Annotated[UploadFile, File()],
    symbol: Annotated[str | None, Form()] = None,
    document_type: Annotated[str, Form()] = "filing",
):
    started = time.perf_counter()
    payload = await file.read()
    try:
        document_store.validate_upload(
            filename=file.filename or "upload",
            content_type=file.content_type,
            payload=payload,
        )
        duplicate = document_store.find_duplicate(payload)
        if duplicate:
            return ok(
                {
                    "document": _document_summary(duplicate),
                    "task_id": duplicate.task_id,
                    "duplicate": True,
                },
                meta=ApiMeta(
                    source="document-service",
                    data_version="stage2-document-mock-v1",
                    warnings=duplicate.warnings,
                    took_ms=int((time.perf_counter() - started) * 1000),
                ),
            )

        task = task_store.create_document_parse_task(file.filename or "upload")
        record = document_store.create_document(
            filename=file.filename or "upload",
            content_type=file.content_type,
            payload=payload,
            symbol=symbol,
            document_type=document_type,
            task_id=task.task_id,
        )
    except DocumentValidationError as exc:
        detail = {"code": exc.code, "message": str(exc)}
        raise HTTPException(status_code=400, detail=detail) from exc

    return ok(
        {
            "document": _document_summary(record),
            "task_id": record.task_id,
            "duplicate": record.duplicate,
        },
        meta=ApiMeta(
            source="document-service",
            data_version="stage2-document-mock-v1",
            warnings=record.warnings,
            took_ms=int((time.perf_counter() - started) * 1000),
        ),
    )


@router.get("/{document_id}")
async def get_document(document_id: str):
    record = document_store.get(document_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Document not found.")
    return ok(
        _document_summary(record),
        meta=ApiMeta(
            source="document-service",
            data_version="stage2-document-mock-v1",
            warnings=record.warnings,
        ),
    )


@router.get("/{document_id}/chunks")
async def get_document_chunks(document_id: str):
    record = document_store.get(document_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Document not found.")
    return ok(
        [chunk.model_dump() for chunk in record.chunks],
        meta=ApiMeta(
            source="document-service",
            data_version="stage2-document-mock-v1",
            warnings=record.warnings,
        ),
    )


@router.get("/{document_id}/metrics")
async def get_document_metrics(document_id: str):
    record = document_store.get(document_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Document not found.")
    return ok(
        [metric.model_dump() for metric in record.metrics],
        meta=ApiMeta(
            source="document-service",
            data_version="stage2-document-mock-v1",
            warnings=record.warnings,
        ),
    )


def _document_summary(record):
    return {
        "document_id": record.document_id,
        "symbol": record.symbol,
        "filename": record.filename,
        "file_hash": record.file_hash,
        "document_type": record.document_type,
        "parse_status": record.parse_status,
        "metadata": record.metadata,
        "chunk_count": len(record.chunks),
        "metric_candidate_count": len(record.metrics),
        "warnings": record.warnings,
    }
