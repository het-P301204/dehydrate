import pytest
from httpx import AsyncClient, ASGITransport
from main import app


@pytest.mark.asyncio
async def test_list_scanner_samples():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/scanner/samples")
    assert response.status_code == 200
    data = response.json()
    assert "samples" in data
    assert "scanner_types" in data
    assert len(data["samples"]) > 0
    assert "basic_pickle" in data["samples"]


@pytest.mark.asyncio
async def test_run_basic_scanner():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/scanner/run",
            json={"sample_name": "basic_pickle", "scanner_type": "basic"},
        )
    assert response.status_code == 200
    data = response.json()
    assert "result" in data
    assert data["result"] in ("detected", "suspicious", "not_detected")
    assert "confidence" in data
    assert 0.0 <= data["confidence"] <= 1.0
    assert "indicators" in data
    assert "explanation" in data
    assert "scan_duration_ms" in data


@pytest.mark.asyncio
async def test_run_shadowpickle_scanner():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/scanner/run",
            json={"sample_name": "shadowpickle_v3", "scanner_type": "shadowpickle"},
        )
    assert response.status_code == 200
    data = response.json()
    assert "result" in data
    assert "recommendations" in data


@pytest.mark.asyncio
async def test_scanner_invalid_sample():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/scanner/run",
            json={"sample_name": "nonexistent_sample", "scanner_type": "basic"},
        )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_run_all_scanner_types():
    scanner_types = ["basic", "obfuscated", "shadowpickle", "polymorphic"]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        for scanner_type in scanner_types:
            response = await client.post(
                "/api/scanner/run",
                json={"sample_name": "cc1_chain", "scanner_type": scanner_type},
            )
            assert response.status_code == 200, f"Failed for scanner_type={scanner_type}"
