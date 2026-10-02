import pytest
from httpx import AsyncClient, ASGITransport
from main import app


@pytest.mark.asyncio
async def test_simulate_pickle_proof_of_execution():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/payload/simulate",
            json={"format": "pickle", "demo_type": "proof_of_execution"},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["format"] == "pickle"
    assert data["safety_classification"] == "LAB_SAFE_DEMONSTRATION"
    assert "warning" in data
    assert "base64_encoded" in data
    assert "hex_encoded" in data
    assert "decoded_structure" in data
    assert data["metadata"]["is_functional_exploit"] is False


@pytest.mark.asyncio
async def test_simulate_java_payload():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/payload/simulate",
            json={"format": "java", "demo_type": "proof_of_execution"},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["format"] == "java"
    assert data["safety_classification"] == "LAB_SAFE_DEMONSTRATION"


@pytest.mark.asyncio
async def test_simulate_dotnet_viewstate():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/payload/simulate",
            json={"format": "dotnet_viewstate", "demo_type": "proof_of_execution"},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["format"] == "dotnet_viewstate"


@pytest.mark.asyncio
async def test_simulate_ml_container():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/payload/simulate",
            json={"format": "ml_container", "demo_type": "synthetic"},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["format"] == "ml_container"
    assert data["safety_classification"] == "LAB_SAFE_DEMONSTRATION"


@pytest.mark.asyncio
async def test_simulate_all_pickle_demo_types():
    demo_types = ["proof_of_execution", "local_file_marker", "local_callback", "env_info", "synthetic"]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        for demo_type in demo_types:
            response = await client.post(
                "/api/payload/simulate",
                json={"format": "pickle", "demo_type": demo_type},
            )
            assert response.status_code == 200, f"Failed for demo_type={demo_type}"
            data = response.json()
            assert data["safety_classification"] == "LAB_SAFE_DEMONSTRATION"
