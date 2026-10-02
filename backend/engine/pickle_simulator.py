"""
Safe pickle analysis — analyze pickle bytes without executing them.
Uses pickletools.dis for static disassembly only; never calls pickle.loads.
"""
import pickletools
import io
import base64
import binascii
from typing import Any

# Opcode bytes that indicate dangerous behavior
DANGEROUS_OPCODES: dict[bytes, dict] = {
    b'\x63': {"name": "GLOBAL", "risk": "HIGH", "description": "Imports an arbitrary global (module + attribute). Enables loading any callable."},
    b'\x52': {"name": "REDUCE", "risk": "CRITICAL", "description": "Calls a callable with arguments. Core mechanism for arbitrary code execution."},
    b'\x69': {"name": "INST", "risk": "HIGH", "description": "Creates a class instance by name. Equivalent to calling a class constructor."},
    b'\x6f': {"name": "OBJ", "risk": "HIGH", "description": "Creates an object using a callable pushed on the stack."},
    b'\x93': {"name": "STACK_GLOBAL", "risk": "HIGH", "description": "Protocol 4+ GLOBAL: loads a global using two top-of-stack strings."},
    b'\x86': {"name": "NEWOBJ_EX", "risk": "MEDIUM", "description": "Creates a new object with extra keyword arguments."},
    b'\x81': {"name": "NEWOBJ", "risk": "MEDIUM", "description": "Creates a new object via __new__."},
    b'\x58': {"name": "SHORT_BINUNICODE", "risk": "LOW", "description": "Short unicode string — often used to pass module/class names to GLOBAL."},
}

KNOWN_DANGEROUS_MODULES = {
    "os", "subprocess", "sys", "builtins", "importlib",
    "socket", "ctypes", "shutil", "tempfile", "pathlib",
    "__builtin__", "commands", "popen2",
}

KNOWN_DANGEROUS_CLASSES = {
    "system", "popen", "Popen", "call", "check_output",
    "exec", "eval", "compile", "execfile", "__import__",
    "open", "file", "input",
}


def decode_input(data: str, encoding: str) -> bytes:
    """Decode input string to bytes based on encoding."""
    encoding = encoding.lower().strip()
    if encoding in ("base64", "b64"):
        try:
            return base64.b64decode(data)
        except Exception as e:
            raise ValueError(f"Invalid base64 data: {e}")
    elif encoding in ("hex",):
        try:
            return bytes.fromhex(data.replace(" ", "").replace("0x", ""))
        except Exception as e:
            raise ValueError(f"Invalid hex data: {e}")
    else:
        return data.encode("latin-1", errors="replace")


def analyze_pickle_safe(data: bytes) -> dict:
    """
    Analyze pickle data without executing it.
    Returns disassembly, suspicious ops, risk score, and metadata.
    """
    output = io.StringIO()
    disassembly = ""
    parse_error = None

    try:
        pickletools.dis(data, output=output)
        disassembly = output.getvalue()
    except Exception as e:
        parse_error = str(e)
        disassembly = f"[Parse error — incomplete or malformed pickle] {e}"

    # Detect suspicious opcodes
    suspicious_operations = []
    for opcode_byte, info in DANGEROUS_OPCODES.items():
        if opcode_byte in data:
            suspicious_operations.append({
                "opcode": info["name"],
                "hex": "0x" + opcode_byte.hex(),
                "description": info["description"],
                "risk": info["risk"],
            })

    # Scan for dangerous module/class names as strings in the payload
    dangerous_strings = []
    try:
        text_repr = data.decode("latin-1")
        for mod in KNOWN_DANGEROUS_MODULES:
            if mod in text_repr:
                dangerous_strings.append({
                    "type": "dangerous_module",
                    "value": mod,
                    "risk": "HIGH",
                    "description": f"String '{mod}' found — likely used as module argument to GLOBAL opcode.",
                })
        for cls in KNOWN_DANGEROUS_CLASSES:
            if cls in text_repr:
                dangerous_strings.append({
                    "type": "dangerous_class",
                    "value": cls,
                    "risk": "HIGH",
                    "description": f"String '{cls}' found — likely used as class/function argument.",
                })
    except Exception:
        pass

    all_suspicious = suspicious_operations + dangerous_strings

    # Risk scoring
    risk_score = 0
    for item in all_suspicious:
        risk = item.get("risk", "LOW")
        if risk == "CRITICAL":
            risk_score += 40
        elif risk == "HIGH":
            risk_score += 20
        elif risk == "MEDIUM":
            risk_score += 10
        else:
            risk_score += 5
    risk_score = min(100, risk_score)

    # Protocol version
    protocol_version = 0
    if len(data) >= 2 and data[0] == ord('\x80'):
        protocol_version = data[1]

    return {
        "disassembly": disassembly,
        "suspicious_operations": all_suspicious,
        "size_bytes": len(data),
        "protocol_version": protocol_version,
        "risk_score": risk_score,
        "parse_error": parse_error,
        "opcode_count": len([op for op in suspicious_operations]),
    }


def build_object_graph(data: bytes) -> dict:
    """Build a simplified object graph from pickle disassembly."""
    graph = {
        "nodes": [],
        "edges": [],
        "root": None,
    }
    analysis = analyze_pickle_safe(data)

    # Add an input node
    graph["nodes"].append({
        "id": "pickle-input",
        "label": "Serialized Input",
        "type": "input",
        "details": {
            "size_bytes": analysis["size_bytes"],
            "protocol_version": analysis["protocol_version"],
        },
    })

    # Add suspicious operation nodes
    for idx, op in enumerate(analysis["suspicious_operations"]):
        node_id = f"op-{idx}"
        graph["nodes"].append({
            "id": node_id,
            "label": op.get("opcode", op.get("value", "Unknown")),
            "type": "operation",
            "details": op,
        })
        graph["edges"].append({
            "source": "pickle-input",
            "target": node_id,
            "label": op.get("risk", ""),
        })

    graph["root"] = "pickle-input"
    return graph
