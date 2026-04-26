from fastapi import APIRouter

from app.api.v1 import (
    routes_ai,
    routes_backtests,
    routes_companies,
    routes_documents,
    routes_health,
    routes_tasks,
)

api_router = APIRouter()
api_router.include_router(routes_health.router, tags=["health"])
api_router.include_router(routes_companies.router, prefix="/companies", tags=["companies"])
api_router.include_router(routes_tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(routes_ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(routes_backtests.router, prefix="/backtests", tags=["backtests"])
api_router.include_router(routes_documents.router, prefix="/documents", tags=["documents"])
