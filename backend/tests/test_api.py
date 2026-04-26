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


def test_document_upload_parse_chunks_metrics_and_duplicate():
    filing_text = (
        "Apple annual filing\n"
        "Revenue was 383,285 USD for fiscal year 2025. "
        "Gross margin was 45.6%. Net income was 96,995 USD."
    )
    files = {"file": ("aapl-10k.txt", filing_text.encode(), "text/plain")}
    response = client.post(
        "/api/v1/documents",
        files=files,
        data={"symbol": "AAPL", "document_type": "10-K"},
    )

    assert response.status_code == 200
    body = response.json()
    document = body["data"]["document"]
    assert document["parse_status"] == "completed"
    assert document["chunk_count"] >= 1
    assert document["metric_candidate_count"] >= 2
    assert body["meta"]["source"] == "document-service"

    document_id = document["document_id"]
    chunks_response = client.get(f"/api/v1/documents/{document_id}/chunks")
    assert chunks_response.status_code == 200
    assert chunks_response.json()["data"][0]["page_start"] == 1

    metrics_response = client.get(f"/api/v1/documents/{document_id}/metrics")
    assert metrics_response.status_code == 200
    metric_names = {item["metric_name"] for item in metrics_response.json()["data"]}
    assert "revenue" in metric_names
    assert "gross_margin" in metric_names

    duplicate_response = client.post(
        "/api/v1/documents",
        files={"file": ("aapl-copy.txt", filing_text.encode(), "text/plain")},
        data={"symbol": "AAPL", "document_type": "10-K"},
    )
    assert duplicate_response.status_code == 200
    assert duplicate_response.json()["data"]["duplicate"] is True
    assert duplicate_response.json()["data"]["document"]["document_id"] == document_id


def test_document_upload_rejects_unsupported_file_type():
    response = client.post(
        "/api/v1/documents",
        files={"file": ("notes.exe", b"not a filing", "application/octet-stream")},
    )

    assert response.status_code == 400
    assert response.json()["detail"]["code"] == "UNSUPPORTED_FILE_TYPE"
