import base64
import pytest
from httpx import AsyncClient, ASGITransport
from main import app

# Safe test pickle: protocol 2, empty dict {}
# bytes: \x80\x02}. (base64: gAJ9Lg==)
SAFE_PICKLE_B64 = base64.b64encode(b"\x80\x02}." ).decode()

# Safe test Java serialized header (just magic + version, no real payload)
JAVA_MAGIC_B64 = base64.b64encode(b"\xac\xed\x00\x05\x74\x00\x04test").decode()

# Simple .NET ViewState-like bytes
VIEWSTATE_B64 = base64.b64encode(b"\xff\x01\x00\x00test_viewstate_data").decode()


@pytest.mark.asyncio
async def test_inspect_pickle_base64():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/object/inspect",
            json={"data": SAFE_PICKLE_B64, "format": "pickle", "encoding": "base64"},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["format"] == "pickle"
    assert "risk_score" in data
    assert 0 <= data["risk_score"] <= 100
    assert "risk_level" in data
    assert "suspicious_operations" in data
    assert "object_graph" in data
    assert "format_metadata" in data
    assert data["safety_note"] == "Analysis performed without code execution."


@pytest.mark.asyncio
async def test_inspect_java_base64():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/object/inspect",
            json={"data": JAVA_MAGIC_B64, "format": "java", "encoding": "base64"},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["format"] == "java"
    assert "risk_score" in data
    assert data["format_metadata"]["is_java_serialized"] is True


@pytest.mark.asyncio
async def test_inspect_viewstate():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/object/inspect",
            json={"data": VIEWSTATE_B64, "format": "viewstate", "encoding": "base64"},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["format"] == "viewstate"
    assert "risk_score" in data


@pytest.mark.asyncio
async def test_inspect_ml_format():
    # Minimal safetensors-like header (safe format)
    safetensors_b64 = base64.b64encode(b'{"__metadata__": {"format": "pt"}}DUMMY_TENSOR').decode()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/object/inspect",
            json={"data": safetensors_b64, "format": "ml", "encoding": "base64"},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["format"] == "ml"
    assert "risk_score" in data


@pytest.mark.asyncio
async def test_inspect_invalid_format():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/object/inspect",
            json={"data": "dGVzdA==", "format": "unknown_format", "encoding": "base64"},
        )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_inspect_invalid_base64():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/object/inspect",
            json={"data": "!!!not_valid_base64!!!", "format": "pickle", "encoding": "base64"},
        )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_inspect_hex_encoding():
    hex_data = b"\x80\x02}.".hex()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/object/inspect",
            json={"data": hex_data, "format": "pickle", "encoding": "hex"},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["format"] == "pickle"


@pytest.mark.asyncio
async def test_inspect_gadget_chain_pickle():
    """Test that a pickle with dangerous opcodes gets a high risk score."""
    # Craft bytes that contain GLOBAL (0x63) and REDUCE (0x52) opcodes
    # This is a structurally representative test — not a real exploit
    dangerous_bytes = b"\x80\x02cos\nsystem\n(Vecho SERIAL\ntR."
    dangerous_b64 = base64.b64encode(dangerous_bytes).decode()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/object/inspect",
            json={"data": dangerous_b64, "format": "pickle", "encoding": "base64"},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["risk_score"] > 0
    assert len(data["suspicious_operations"]) > 0
