"""
ML model file analysis simulator.
Analyzes model files (pickle-based .pkl, .joblib, .pt, etc.) for embedded
deserialization gadgets. Never executes model code or weights.
"""
import io
from typing import Any
from engine.pickle_simulator import analyze_pickle_safe, DANGEROUS_OPCODES

# Known ML framework serialization magic bytes
ML_MAGIC_BYTES = {
    "pytorch": b'PK\x03\x04',  # ZIP archive (PyTorch uses ZIP)
    "pickle": b'\x80\x04',  # Protocol 4 pickle
    "pickle2": b'\x80\x02',  # Protocol 2 pickle
    "joblib": b'\x80\x03',  # Protocol 3 (joblib default)
    "numpy_npy": b'\x93NUMPY',  # NumPy .npy
    "hdf5": b'\x89HDF\r\n\x1a\n',  # HDF5 (Keras)
    "safetensors": b'{"__metadata__"',  # safetensors JSON header
}

# Dangerous patterns specifically in ML contexts
ML_DANGEROUS_PATTERNS = {
    b'torch.load': "PyTorch torch.load without weights_only=True",
    b'pickle.loads': "Direct pickle deserialization",
    b'joblib.load': "Joblib load without verification",
    b'numpy.load': "NumPy load with allow_pickle",
    b'__reduce__': "__reduce__ method (custom deserialization hook)",
    b'__reduce_ex__': "__reduce_ex__ method (custom deserialization hook)",
    b'subprocess': "subprocess reference (potential command execution)",
    b'os.system': "os.system reference (command execution)",
}


def detect_format(data: bytes) -> str:
    """Detect the ML model format from magic bytes."""
    for fmt, magic in ML_MAGIC_BYTES.items():
        if data[:len(magic)] == magic:
            return fmt
    # Check if it's a generic pickle
    if len(data) >= 2 and data[0] == 0x80 and data[1] in range(0, 6):
        return f"pickle_proto_{data[1]}"
    return "unknown"


def analyze_ml_model_safe(data: bytes, filename: str = "") -> dict:
    """
    Analyze an ML model file for embedded deserialization risks.
    Does NOT execute the model or load weights into memory.
    """
    detected_format = detect_format(data)
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "unknown"

    # For pickle-based formats, run full pickle analysis
    pickle_analysis = None
    if detected_format.startswith("pickle") or detected_format == "joblib":
        pickle_analysis = analyze_pickle_safe(data)

    # For PyTorch ZIP format, look for pickle data inside
    pytorch_pickle_analysis = None
    if detected_format == "pytorch":
        # PyTorch .pt files are ZIP archives containing pickle files
        # We scan the raw bytes for pickle opcodes as a heuristic
        pickle_analysis_raw = analyze_pickle_safe(data)
        pytorch_pickle_analysis = pickle_analysis_raw

    # Scan for dangerous ML patterns
    dangerous_patterns_found = []
    for pattern, description in ML_DANGEROUS_PATTERNS.items():
        if pattern in data:
            dangerous_patterns_found.append({
                "pattern": pattern.decode("utf-8", errors="replace"),
                "description": description,
                "risk": "HIGH",
            })

    suspicious_operations = dangerous_patterns_found
    if pickle_analysis:
        suspicious_operations = suspicious_operations + pickle_analysis.get("suspicious_operations", [])

    # Risk scoring
    risk_score = 0
    for item in suspicious_operations:
        risk = item.get("risk", "LOW")
        if risk == "CRITICAL":
            risk_score += 40
        elif risk == "HIGH":
            risk_score += 20
        elif risk == "MEDIUM":
            risk_score += 10
        else:
            risk_score += 5

    # Bonus risk for unsafe formats
    if detected_format in ("pytorch", "pickle", "joblib", "pickle2", "pickle_proto_2", "pickle_proto_4"):
        risk_score += 20

    risk_score = min(100, risk_score)

    recommendations = [
        "Use safetensors format instead of pickle-based formats for model weights.",
        "When loading PyTorch models, use torch.load(..., weights_only=True) (PyTorch 2.x).",
        "Validate model file hashes before loading from untrusted sources.",
        "Run model loading in an isolated sandbox environment.",
        "Prefer ONNX format for model interchange when pickle is not required.",
    ]

    return {
        "detected_format": detected_format,
        "file_extension": ext,
        "size_bytes": len(data),
        "suspicious_operations": suspicious_operations,
        "dangerous_patterns": dangerous_patterns_found,
        "pickle_analysis": pickle_analysis,
        "pytorch_pickle_analysis": pytorch_pickle_analysis,
        "risk_score": risk_score,
        "recommendations": recommendations,
        "is_safe_format": detected_format == "safetensors",
    }


def build_object_graph(data: bytes, filename: str = "") -> dict:
    """Build an object graph for ML model analysis."""
    analysis = analyze_ml_model_safe(data, filename)
    graph = {"nodes": [], "edges": [], "root": None}

    graph["nodes"].append({
        "id": "ml-input",
        "label": f"ML Model ({analysis['detected_format']})",
        "type": "input",
        "details": {
            "format": analysis["detected_format"],
            "size_bytes": analysis["size_bytes"],
            "extension": analysis["file_extension"],
        },
    })

    for idx, item in enumerate(analysis.get("dangerous_patterns", [])):
        node_id = f"ml-danger-{idx}"
        graph["nodes"].append({
            "id": node_id,
            "label": item["pattern"],
            "type": "dangerous_pattern",
            "details": item,
        })
        graph["edges"].append({
            "source": "ml-input",
            "target": node_id,
            "label": item["risk"],
        })

    graph["root"] = "ml-input"
    return graph
