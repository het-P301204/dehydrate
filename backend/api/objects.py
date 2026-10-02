"""
Object Inspection API — safely inspects serialized objects without executing them.
"""
import base64
import binascii
from fastapi import APIRouter, HTTPException, Request

from models.payload import ObjectInspectRequest, ObjectInspectResponse
from engine import pickle_simulator, java_simulator, dotnet_simulator, ml_simulator
from rate_limiter import limiter

router = APIRouter()

MAX_INPUT_BYTES = 1_048_576  # 1 MB


def _decode_input(data: str, encoding: str) -> bytes:
    enc = encoding.lower().strip()
    try:
        if enc in ("base64", "b64"):
            return base64.b64decode(data)
        elif enc == "hex":
            return bytes.fromhex(data.replace(" ", "").replace("0x", ""))
        else:
            return data.encode("latin-1", errors="replace")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to decode input as {encoding}: {e}")


def _risk_level(score: int) -> str:
    if score >= 80:
        return "CRITICAL"
    if score >= 60:
        return "HIGH"
    if score >= 40:
        return "MEDIUM"
    if score >= 20:
        return "LOW"
    return "INFO"


@router.post("/inspect", response_model=ObjectInspectResponse, summary="Inspect serialized object")
@limiter.limit("30/minute")
async def inspect_object(http_request: Request, request: ObjectInspectRequest) -> ObjectInspectResponse:  # noqa: ARG001
    """
    Statically analyze a serialized object.
    Accepted formats: pickle, java, viewstate, ml.
    Accepted encodings: raw, base64, hex.
    Never executes the payload — analysis only.
    """
    # Input validation
    if len(request.data) > MAX_INPUT_BYTES * 2:  # base64 overhead
        raise HTTPException(status_code=413, detail="Input exceeds maximum allowed size (1MB)")

    valid_formats = {"pickle", "java", "viewstate", "ml"}
    if request.format.lower() not in valid_formats:
        raise HTTPException(status_code=400, detail=f"Unknown format '{request.format}'. Choose from: {', '.join(valid_formats)}")

    raw_bytes = _decode_input(request.data, request.encoding)

    if len(raw_bytes) > MAX_INPUT_BYTES:
        raise HTTPException(status_code=413, detail="Decoded payload exceeds 1MB limit")

    fmt = request.format.lower()
    analysis: dict = {}
    object_graph: dict = {}
    format_metadata: dict = {}

    if fmt == "pickle":
        analysis = pickle_simulator.analyze_pickle_safe(raw_bytes)
        object_graph = pickle_simulator.build_object_graph(raw_bytes)
        format_metadata = {
            "format": "Python Pickle",
            "protocol_version": analysis.get("protocol_version", 0),
            "disassembly_preview": (analysis.get("disassembly") or "")[:500],
        }

    elif fmt == "java":
        analysis = java_simulator.analyze_java_safe(raw_bytes)
        object_graph = java_simulator.build_object_graph(raw_bytes)
        format_metadata = {
            "format": "Java Serialized Object",
            "is_java_serialized": analysis.get("is_java_serialized"),
            "stream_version": analysis.get("stream_version"),
            "class_names_found": analysis.get("class_names_found", [])[:10],
        }

    elif fmt == "viewstate":
        analysis = dotnet_simulator.analyze_viewstate_safe(raw_bytes)
        object_graph = dotnet_simulator.build_object_graph(raw_bytes)
        format_metadata = {
            "format": ".NET ViewState / BinaryFormatter",
            "is_binary_viewstate": analysis.get("is_binary_viewstate"),
            "has_mac_validation": analysis.get("has_mac_validation"),
            "mac_bypass_possible": analysis.get("mac_bypass_possible"),
        }

    elif fmt == "ml":
        analysis = ml_simulator.analyze_ml_model_safe(raw_bytes, filename="uploaded")
        object_graph = ml_simulator.build_object_graph(raw_bytes, filename="uploaded")
        format_metadata = {
            "format": "ML Model Container",
            "detected_format": analysis.get("detected_format"),
            "is_safe_format": analysis.get("is_safe_format"),
            "recommendations": analysis.get("recommendations", []),
        }

    risk_score = analysis.get("risk_score", 0)
    suspicious = analysis.get("suspicious_operations", [])

    warnings = []
    if risk_score >= 80:
        warnings.append("CRITICAL risk: This payload exhibits hallmarks of a live exploit. Do not execute.")
    elif risk_score >= 60:
        warnings.append("HIGH risk: Multiple dangerous indicators detected.")
    elif risk_score >= 40:
        warnings.append("MEDIUM risk: Some suspicious patterns detected. Review carefully.")
    elif risk_score > 0:
        warnings.append("LOW risk: Minor indicators detected.")
    else:
        warnings.append("No dangerous indicators detected in static analysis.")

    return ObjectInspectResponse(
        format=fmt,
        encoding_detected=request.encoding,
        object_graph=object_graph,
        suspicious_operations=suspicious,
        risk_score=risk_score,
        risk_level=_risk_level(risk_score),
        format_metadata=format_metadata,
        warnings=warnings,
    )
