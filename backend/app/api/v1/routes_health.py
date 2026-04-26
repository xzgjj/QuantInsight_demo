import time

from fastapi import APIRouter
from sqlalchemy import text

from app.core.config import get_settings
from app.core.envelope import ApiMeta, ok
from app.datahub.mock_provider import get_market_provider
from app.db.session import engine

router = APIRouter()


async def _check_db() -> dict:
    started = time.perf_counter()
    try:
        async with engine.connect() as conn:
            await conn.execute(text("select 1"))
        return {"status": "ok", "latency_ms": int((time.perf_counter() - started) * 1000)}
    except Exception as exc:
        return {"status": "unavailable", "message": str(exc)}


async def _check_redis() -> dict:
    try:
        from redis.asyncio import Redis

        redis = Redis.from_url(get_settings().redis_url, socket_connect_timeout=0.2)
        started = time.perf_counter()
        await redis.ping()
        await redis.aclose()
        return {"status": "ok", "latency_ms": int((time.perf_counter() - started) * 1000)}
    except Exception as exc:
        return {"status": "unavailable", "message": str(exc)}


@router.get("/health")
async def health():
    started = time.perf_counter()
    provider_health = await get_market_provider().health()
    data = {
        "api": {"status": "ok"},
        "db": await _check_db(),
        "redis": await _check_redis(),
        "provider": provider_health.model_dump(mode="json"),
    }
    return ok(
        data,
        meta=ApiMeta(
            source="healthcheck",
            data_version="runtime",
            warnings=[],
            took_ms=int((time.perf_counter() - started) * 1000),
        ),
    )
