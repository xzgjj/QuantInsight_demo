import time

from fastapi import APIRouter, HTTPException, Query

from app.core.envelope import ApiMeta, ok
from app.datahub.mock_provider import get_market_provider

router = APIRouter()


@router.get("/search")
async def search_companies(q: str = Query(min_length=1, max_length=64)):
    started = time.perf_counter()
    provider = get_market_provider()
    results = await provider.search_companies(q)
    return ok(
        [item.model_dump() for item in results],
        meta=ApiMeta(
            source=provider.name,
            data_version="mock-equity-2026-04-26",
            warnings=["Mock company search."],
            took_ms=int((time.perf_counter() - started) * 1000),
        ),
    )


@router.get("/{symbol}/snapshot")
async def company_snapshot(symbol: str):
    started = time.perf_counter()
    provider = get_market_provider()
    try:
        snapshot = await provider.get_company_snapshot(symbol)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    return ok(
        snapshot.model_dump(mode="json"),
        meta=ApiMeta(
            source=snapshot.source,
            as_of=snapshot.as_of,
            data_version=snapshot.data_version,
            warnings=snapshot.warnings,
            took_ms=int((time.perf_counter() - started) * 1000),
        ),
    )
