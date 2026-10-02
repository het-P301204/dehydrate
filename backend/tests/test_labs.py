import pytest
from httpx import AsyncClient, ASGITransport
from main import app


@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "DEHYDRATE"


@pytest.mark.asyncio
async def test_list_labs():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/labs")
    assert response.status_code == 200
    data = response.json()
    assert "labs" in data
    assert isinstance(data["labs"], list)
    assert len(data["labs"]) > 0
    assert "total" in data


@pytest.mark.asyncio
async def test_get_lab_by_id():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/labs/python-pickle-lab")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "python-pickle-lab"
    assert data["type"] == "python-pickle"


@pytest.mark.asyncio
async def test_get_lab_not_found():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/labs/nonexistent-lab")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_start_lab():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/labs/start", json={"lab_type": "python-pickle"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["lab"]["status"] == "running"
    assert data["lab"]["type"] == "python-pickle"


@pytest.mark.asyncio
async def test_stop_lab():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Start first
        await client.post("/api/labs/start", json={"lab_type": "java-serialization"})
        # Then stop
        response = await client.post("/api/labs/stop", json={"lab_id": "java-serialization-lab"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["lab"]["status"] == "stopped"


@pytest.mark.asyncio
async def test_reset_lab():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/labs/reset", json={"lab_id": "python-pickle-lab"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["lab"]["status"] == "stopped"
