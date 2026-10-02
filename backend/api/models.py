"""
ML Models API — file upload and analysis for ML model security research.
Never executes uploaded files.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from engine.ml_simulator import analyze_ml_model_safe, build_object_graph
from rate_limiter import limiter

router = APIRouter()

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


@router.post("/analyze", summary="Analyze ML model file for security risks")
@limiter.limit("20/minute")
async def analyze_model(request: Request, file: UploadFile = File(...)) -> dict:
    """
    Upload and analyze an ML model file for embedded deserialization risks.
    Supported: .pkl, .joblib, .pt, .pth, .h5, .keras, .safetensors, .npy

    The file is NEVER executed or loaded into an ML framework.
    Analysis is purely static (byte-level pattern matching).
    """
    if file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File exceeds 50MB maximum allowed size")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File exceeds 50MB maximum allowed size")

    filename = file.filename or "uploaded_model"

    analysis = analyze_ml_model_safe(content, filename=filename)
    object_graph = build_object_graph(content, filename=filename)

    risk_score = analysis.get("risk_score", 0)
    risk_level = "CRITICAL" if risk_score >= 80 else "HIGH" if risk_score >= 60 else "MEDIUM" if risk_score >= 40 else "LOW" if risk_score > 0 else "INFO"

    return {
        "filename": filename,
        "file_size_bytes": len(content),
        "analysis": analysis,
        "object_graph": object_graph,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "safety_note": "File was analyzed statically. No model code or weights were executed.",
        "is_safe_format": analysis.get("is_safe_format", False),
    }
