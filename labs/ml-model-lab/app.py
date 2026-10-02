"""
DEHYDRATE ML Model Lab
====================
Safe ML model serialization analysis — analyzes model files for deserialization
risks WITHOUT executing them.
LAB ENVIRONMENT ONLY — NOT FOR PRODUCTION USE

Covers:
  - pickle-based model formats (.pkl, torch .pt)
  - SafeTensors (safe format)
  - ONNX (safe format)
  - Keras H5 (moderate risk via marshal)
  - Joblib (pickle-backed)
  - Embedded backdoor payload detection
"""
import io
import base64
import struct
import re
import hashlib
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List

app = FastAPI(
    title="DEHYDRATE ML Model Lab",
    description="ML model serialization risk analyzer — LAB USE ONLY",
    version="1.0.0",
)

LAB_MARKER = "DEHYDRATE_ML_LAB_CONFIRMED"

MAX_SIZE = 50 * 1024 * 1024  # 50 MB

# ── Format detection ──────────────────────────────────────────────────────────

FORMAT_SIGNATURES = {
    "pickle_v2":    (b"\x80\x02", "pickle", "HIGH"),
    "pickle_v3":    (b"\x80\x03", "pickle", "HIGH"),
    "pickle_v4":    (b"\x80\x04", "pickle", "HIGH"),
    "pickle_v5":    (b"\x80\x05", "pickle", "HIGH"),
    "pickle_ascii": (b"(",        "pickle", "HIGH"),   # protocol 0 MARK
    "torch_zip":    (b"PK\x03\x04", "torch_zip", "HIGH"),  # ZIP (PyTorch saves as ZIP containing pickle)
    "hdf5":         (b"\x89HDF\r\n\x1a\n", "hdf5", "MEDIUM"),
    "onnx":         (b"\x08\x00", "onnx", "LOW"),
    "safetensors":  (None,         "safetensors", "LOW"),  # JSON header, no binary magic
    "numpy_npz":    (b"PK\x03\x04", "numpy_npz", "LOW"),
    "joblib":       (b"\x80",      "joblib", "HIGH"),
}

def _detect_format(content: bytes, filename: str) -> tuple:
    """Returns (format_name, risk_level, details)."""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    # Extension-based hints
    if ext in ("pt", "pth", "bin"):
        if content[:4] == b"PK\x03\x04":
            return "torch_zip", "HIGH", "PyTorch ZIP archive (contains pickle)"
        return "torch_pickle", "HIGH", "PyTorch model (likely pickle)"
    if ext == "safetensors":
        return "safetensors", "LOW", "SafeTensors format — no executable deserialization"
    if ext == "onnx":
        return "onnx", "LOW", "ONNX protobuf format — no executable deserialization"
    if ext in ("pkl", "pickle"):
        return "pickle", "HIGH", "Pickle format — arbitrary code execution risk"
    if ext in ("h5", "hdf5", "keras"):
        return "hdf5", "MEDIUM", "HDF5/Keras format — moderate risk via marshal() in Lambda layers"
    if ext == "joblib":
        return "joblib", "HIGH", "Joblib format — pickle-backed, arbitrary code execution risk"

    # Magic byte detection
    for sig_name, (magic, fmt, risk) in FORMAT_SIGNATURES.items():
        if magic and content[:len(magic)] == magic:
            return fmt, risk, f"Detected by magic bytes: {magic.hex()}"

    # SafeTensors: starts with JSON-like metadata length
    if len(content) >= 8:
        try:
            header_len = struct.unpack("<Q", content[:8])[0]
            if header_len < len(content) and content[8:8+1] == b"{":
                return "safetensors", "LOW", "SafeTensors format (JSON header detected)"
        except Exception:
            pass

    return "unknown", "MEDIUM", "Unrecognized format — manual inspection recommended"


def _scan_for_dangerous_opcodes(content: bytes) -> List[str]:
    """Scan for pickle opcodes and suspicious class names in binary content."""
    findings = []

    # Pickle GLOBAL opcode followed by module.class
    global_pattern = rb"\x63[\x00-\xff]{1,100}\n[\x00-\xff]{1,100}\n"
    if re.search(global_pattern, content):
        findings.append("Pickle GLOBAL opcode detected — may load arbitrary modules")

    # Suspicious module references
    dangerous_modules = [
        b"os", b"subprocess", b"builtins", b"importlib",
        b"pty", b"socket", b"ctypes", b"marshal", b"code",
    ]
    for mod in dangerous_modules:
        if mod in content:
            findings.append(f"Reference to dangerous module: {mod.decode()}")

    # System command patterns
    cmd_patterns = [b"system", b"popen", b"exec", b"eval", b"__import__"]
    for pat in cmd_patterns:
        if pat in content:
            findings.append(f"Dangerous callable reference: {pat.decode()}")

    return list(set(findings))


def _sha256(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "running", "lab": "ml-model", "version": "1.0.0"}

@app.post("/analyze")
async def analyze_model(file: UploadFile = File(...)):
    """
    Analyze an uploaded ML model file for deserialization risks.
    Does NOT execute or deserialize the model.
    """
    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=413, detail=f"File too large (max {MAX_SIZE // 1024 // 1024} MB)")

    filename = file.filename or "unknown"
    fmt, risk, detection_detail = _detect_format(content, filename)

    is_pickle = fmt in ("pickle", "torch_pickle", "torch_zip", "joblib")
    dangerous_opcodes = _scan_for_dangerous_opcodes(content) if is_pickle else []

    recommendations = []
    if is_pickle:
        recommendations.append("Replace pickle-based format with SafeTensors or ONNX")
        recommendations.append("Scan model with ModelScan before loading in production")
        recommendations.append("Never load models from untrusted sources with pickle")
    if fmt == "hdf5":
        recommendations.append("Disable Lambda layers or custom objects unless strictly necessary")
    if not recommendations:
        recommendations.append("Format is safe — maintain integrity verification (hash check)")

    return {
        "filename": filename,
        "size_bytes": len(content),
        "sha256": _sha256(content),
        "format_detected": fmt,
        "detection_method": detection_detail,
        "risk_level": risk,
        "executable_deserialization": is_pickle,
        "dangerous_indicators": dangerous_opcodes,
        "recommendations": recommendations,
        "lab_marker": LAB_MARKER,
    }

@app.get("/format-comparison")
def format_comparison():
    """Compare ML model serialization formats by safety characteristics."""
    return {
        "formats": [
            {
                "name": "SafeTensors",
                "risk": "LOW",
                "executable_code": False,
                "description": "Data-only format. Validates tensor shapes before loading. Recommended.",
                "use_case": "Hugging Face models, PyTorch, JAX",
            },
            {
                "name": "ONNX",
                "risk": "LOW",
                "executable_code": False,
                "description": "Protobuf schema. No arbitrary code. Cross-platform inference.",
                "use_case": "Production inference, cross-framework",
            },
            {
                "name": "pickle (.pkl)",
                "risk": "HIGH",
                "executable_code": True,
                "description": "Executes arbitrary Python during deserialization. Never load from untrusted sources.",
                "use_case": "scikit-learn, legacy models — avoid for distribution",
            },
            {
                "name": "PyTorch (.pt/.pth)",
                "risk": "HIGH",
                "executable_code": True,
                "description": "ZIP archive containing pickle. torch.load() deserializes pickle.",
                "use_case": "PyTorch training — use weights_only=True in PyTorch 2.0+",
            },
            {
                "name": "Joblib",
                "risk": "HIGH",
                "executable_code": True,
                "description": "pickle-backed. Shares all pickle risks.",
                "use_case": "scikit-learn pipelines — safer alternatives exist",
            },
            {
                "name": "Keras HDF5 (.h5)",
                "risk": "MEDIUM",
                "executable_code": True,
                "description": "HDF5 data + Python code in Lambda layers via marshal(). Risk when custom objects enabled.",
                "use_case": "TensorFlow/Keras — prefer SavedModel format",
            },
        ],
        "lab_marker": LAB_MARKER,
    }

@app.get("/attack-scenarios")
def attack_scenarios():
    """Describe ML supply chain attack scenarios via model poisoning."""
    return {
        "scenarios": [
            {
                "name": "Model Hub Poisoning",
                "vector": "Upload malicious pickle-backed .pt to Hugging Face / model zoo",
                "impact": "RCE on any machine that loads the model with torch.load()",
                "real_world": "Research demonstrated (2023 — Hugging Face security report)",
                "mitigation": "Use weights_only=True; scan with ModelScan",
            },
            {
                "name": "Dependency Chain Attack",
                "vector": "Compromise model serialization library (e.g., joblib) in PyPI",
                "impact": "All models saved/loaded via library execute attacker code",
                "real_world": "Theoretical — similar to SolarWinds-style supply chain",
                "mitigation": "Pin dependencies; hash verification; use safer formats",
            },
            {
                "name": "Embedding Backdoor",
                "vector": "Embed pickle REDUCE gadget inside model tensor metadata",
                "impact": "Triggers RCE during model loading, evades content scanners",
                "real_world": "Demonstrated at DEF CON 31 (2023)",
                "mitigation": "Deep scanning with disassembly; format conversion before load",
            },
        ],
        "lab_marker": LAB_MARKER,
    }
