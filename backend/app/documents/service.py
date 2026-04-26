import hashlib
import re
import uuid
from pathlib import PurePath

from pydantic import BaseModel, Field

MAX_UPLOAD_BYTES = 10 * 1024 * 1024
ALLOWED_EXTENSIONS = {".pdf", ".txt"}
ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "text/plain",
    "application/octet-stream",
}


class DocumentChunk(BaseModel):
    chunk_id: str
    document_id: str
    page_start: int
    page_end: int
    text: str
    chunk_hash: str
    parser: str
    confidence: float


class MetricCandidate(BaseModel):
    metric_id: str
    document_id: str
    metric_name: str
    value: str
    unit: str
    period: str
    page: int
    confidence: float
    source_text: str


class DocumentRecord(BaseModel):
    document_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    symbol: str | None = None
    filename: str
    file_hash: str
    document_type: str
    parse_status: str
    duplicate: bool = False
    task_id: str
    metadata: dict
    chunks: list[DocumentChunk]
    metrics: list[MetricCandidate]
    warnings: list[str] = Field(default_factory=list)


class DocumentValidationError(ValueError):
    def __init__(self, code: str, message: str) -> None:
        self.code = code
        super().__init__(message)


class InMemoryDocumentStore:
    def __init__(self) -> None:
        self._documents: dict[str, DocumentRecord] = {}
        self._hash_index: dict[str, str] = {}

    def validate_upload(
        self, *, filename: str, content_type: str | None, payload: bytes
    ) -> None:
        safe_name = PurePath(filename).name
        suffix = PurePath(safe_name).suffix.lower()
        if suffix not in ALLOWED_EXTENSIONS:
            raise DocumentValidationError(
                "UNSUPPORTED_FILE_TYPE", "Only PDF and text filings are supported in stage 2."
            )
        if content_type and content_type not in ALLOWED_CONTENT_TYPES:
            raise DocumentValidationError(
                "UNSUPPORTED_CONTENT_TYPE", f"Unsupported upload content type: {content_type}."
            )
        if len(payload) == 0:
            raise DocumentValidationError("EMPTY_FILE", "Uploaded filing is empty.")
        if len(payload) > MAX_UPLOAD_BYTES:
            raise DocumentValidationError("FILE_TOO_LARGE", "Uploaded filing exceeds 10 MB.")

    def find_duplicate(self, payload: bytes) -> DocumentRecord | None:
        file_hash = hashlib.sha256(payload).hexdigest()
        existing_id = self._hash_index.get(file_hash)
        if existing_id is None:
            return None
        existing = self._documents[existing_id].model_copy(deep=True)
        existing.duplicate = True
        return existing

    def create_document(
        self,
        *,
        filename: str,
        content_type: str | None,
        payload: bytes,
        symbol: str | None,
        document_type: str,
        task_id: str,
    ) -> DocumentRecord:
        safe_name = PurePath(filename).name
        suffix = PurePath(safe_name).suffix.lower()
        self.validate_upload(filename=filename, content_type=content_type, payload=payload)

        file_hash = hashlib.sha256(payload).hexdigest()
        existing = self.find_duplicate(payload)
        if existing:
            return existing

        text, warnings = _extract_text(payload, suffix)
        chunks = _chunk_text(text)
        document_id = str(uuid.uuid4())
        chunks = [chunk.model_copy(update={"document_id": document_id}) for chunk in chunks]
        metrics = _extract_metric_candidates(document_id, chunks)
        record = DocumentRecord(
            document_id=document_id,
            symbol=symbol.upper() if symbol else None,
            filename=safe_name,
            file_hash=file_hash,
            document_type=document_type,
            parse_status="completed",
            task_id=task_id,
            metadata={
                "size_bytes": len(payload),
                "content_type": content_type or "unknown",
                "page_count": max((chunk.page_end for chunk in chunks), default=1),
                "parser": "stage2-mock-parser",
            },
            chunks=chunks,
            metrics=metrics,
            warnings=warnings,
        )
        self._documents[document_id] = record
        self._hash_index[file_hash] = document_id
        return record

    def get(self, document_id: str) -> DocumentRecord | None:
        return self._documents.get(document_id)


def _extract_text(payload: bytes, suffix: str) -> tuple[str, list[str]]:
    warnings: list[str] = []
    try:
        text = payload.decode("utf-8")
    except UnicodeDecodeError:
        text = payload.decode("latin-1", errors="ignore")
        warnings.append("Decoded filing with latin-1 fallback.")

    cleaned = "".join(char if char.isprintable() or char in "\n\t\f" else " " for char in text)
    if suffix == ".pdf":
        warnings.append("Stage 2 mock parser does not preserve full PDF layout or tables.")
    if len(cleaned.strip()) < 40:
        warnings.append("Low text density detected; OCR may be required in a later stage.")
    return cleaned.strip() or "No extractable text.", warnings


def _chunk_text(text: str) -> list[DocumentChunk]:
    pages = text.split("\f") if "\f" in text else [text]
    chunks: list[DocumentChunk] = []
    for page_index, page_text in enumerate(pages, start=1):
        normalized = re.sub(r"\s+", " ", page_text).strip()
        if not normalized:
            continue
        for start in range(0, len(normalized), 900):
            snippet = normalized[start : start + 900]
            chunk_hash = hashlib.sha256(f"{page_index}:{snippet}".encode()).hexdigest()
            chunks.append(
                DocumentChunk(
                    chunk_id=f"chunk-{len(chunks) + 1}",
                    document_id="pending",
                    page_start=page_index,
                    page_end=page_index,
                    text=snippet,
                    chunk_hash=chunk_hash,
                    parser="stage2-mock-parser",
                    confidence=0.72,
                )
            )
    return chunks


def _extract_metric_candidates(
    document_id: str, chunks: list[DocumentChunk]
) -> list[MetricCandidate]:
    metric_patterns = {
        "revenue": r"\b(revenue|sales)\b[^0-9\-]{0,40}([\-\d,.]+)\s?(usd|hkd|rmb|cny|%)?",
        "gross_margin": r"\b(gross margin)\b[^0-9\-]{0,40}([\-\d,.]+)\s?(%)?",
        "net_income": r"\b(net income|profit)\b[^0-9\-]{0,40}([\-\d,.]+)\s?(usd|hkd|rmb|cny)?",
        "eps": r"\b(eps|earnings per share)\b[^0-9\-]{0,40}([\-\d,.]+)\s?(usd|hkd|rmb|cny)?",
        "operating_cash_flow": (
            r"\b(operating cash flow|cash from operations)\b[^0-9\-]{0,40}"
            r"([\-\d,.]+)\s?(usd|hkd|rmb|cny)?"
        ),
    }
    candidates: list[MetricCandidate] = []
    for chunk in chunks:
        lower_text = chunk.text.lower()
        for metric_name, pattern in metric_patterns.items():
            match = re.search(pattern, lower_text, flags=re.IGNORECASE)
            if not match:
                continue
            unit = (match.group(3) if len(match.groups()) >= 3 else None) or "unknown"
            candidates.append(
                MetricCandidate(
                    metric_id=f"metric-{len(candidates) + 1}",
                    document_id=document_id,
                    metric_name=metric_name,
                    value=match.group(2).replace(",", ""),
                    unit=unit.upper(),
                    period="document",
                    page=chunk.page_start,
                    confidence=0.66,
                    source_text=chunk.text[max(match.start() - 80, 0) : match.end() + 80],
                )
            )
    return candidates


document_store = InMemoryDocumentStore()
