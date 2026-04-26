from fastapi import APIRouter

from app.ai.audit import audit_store
from app.core.envelope import ok

router = APIRouter()


@router.post("/mock/company/{symbol}")
async def create_company_ai_audit(symbol: str):
    record = audit_store.create_mock_company_audit(symbol)
    return ok(
        {
            "audit": record.model_dump(mode="json"),
            "answer": (
                f"{symbol.upper()} mock summary generated with one audited tool call and "
                "one evidence id. This is not investment advice."
            ),
        }
    )
