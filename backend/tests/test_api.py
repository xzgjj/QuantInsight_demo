from fastapi.testclient import TestClient

from app.main import create_app

client = TestClient(create_app())


def test_company_snapshot_envelope():
    response = client.get("/api/v1/companies/AAPL/snapshot")

    assert response.status_code == 200
    body = response.json()
    assert body["data"]["symbol"] == "AAPL"
    assert body["meta"]["source"] == "mock-provider"
    assert body["meta"]["data_version"] == "mock-equity-2026-04-26"
    assert body["error"] is None


def test_ai_audit_mock_contains_required_fields():
    response = client.post("/api/v1/ai/mock/company/AAPL")

    assert response.status_code == 200
    audit = response.json()["data"]["audit"]
    assert audit["tool_calls"][0]["tool_name"] == "get_company_snapshot"
    assert audit["evidence_ids"]
    assert audit["token_usage"]["total_tokens"] > 0
    assert audit["disclaimer_required"] is True


def test_backtest_includes_costs_trades_and_bias_checks():
    response = client.post("/api/v1/backtests/mock", json={"symbol": "AAPL"})

    assert response.status_code == 200
    result = response.json()["data"]
    assert result["cost_model"]["commission_bps"] == 3
    assert len(result["trades"]) == 2
    assert result["bias_checks"][0]["name"] == "lookahead_bias"


def test_task_sse_contract():
    create_response = client.post("/api/v1/tasks/demo")
    task_id = create_response.json()["data"]["task_id"]

    with client.stream("GET", f"/api/v1/tasks/{task_id}/events") as response:
        payload = response.read().decode()

    assert "event: stage" in payload
    assert "event: partial" in payload
    assert "event: result" in payload
    assert "event: done" in payload
