from fastapi import APIRouter

from app.core.envelope import ApiMeta, ok
from app.quant.backtest import BacktestRequest, run_mock_backtest

router = APIRouter()


@router.post("/mock")
async def run_backtest(request: BacktestRequest):
    result = run_mock_backtest(request)
    return ok(
        result.model_dump(),
        meta=ApiMeta(
            source="quant-engine-mock",
            data_version=result.data_version,
            warnings=result.warnings,
        ),
    )
