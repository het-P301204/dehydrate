"""
Payload simulation API — generates educational lab-safe payload demonstrations.
NEVER generates real exploits. All outputs are clearly marked as demonstrations.
"""
import base64
import struct
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Request

from models.payload import (
    PayloadSimulateRequest,
    PayloadSimulateResponse,
    SerializationFormat,
    DemoType,
)
from rate_limiter import limiter

router = APIRouter()

SAFETY_WARNING = (
    "LAB DEMONSTRATION ONLY. This payload representation is for educational analysis. "
    "It is a synthetic structure that illustrates deserialization concepts and does NOT "
    "constitute a functional exploit. Not for use outside authorized research environments."
)

# Synthetic demonstration structures — these are illustrative, not functional exploits
DEMO_STRUCTURES: dict[SerializationFormat, dict[DemoType, dict]] = {
    SerializationFormat.PICKLE: {
        DemoType.PROOF_OF_EXECUTION: {
            "structure": {
                "protocol": 2,
                "opcodes": [
                    {"op": "PROTO", "arg": 2, "note": "Pickle protocol version"},
                    {"op": "GLOBAL", "arg": "builtins print", "note": "LAB DEMO: loads print() — in real exploit this would be os.system"},
                    {"op": "MARK", "note": "Push mark object"},
                    {"op": "UNICODE", "arg": "[DEHYDRATE Lab: Deserialization Demo - Proof of Execution]", "note": "Argument string"},
                    {"op": "TUPLE", "note": "Build argument tuple"},
                    {"op": "REDUCE", "note": "Call the function — this opcode is the execution trigger"},
                    {"op": "STOP", "note": "End of pickle stream"},
                ],
                "demo_note": "In a real exploit, GLOBAL would load os.system or subprocess.Popen instead of print.",
            },
            "raw_repr": "c2\\x02\\nbuiltins\\nprint\\n(V[DEHYDRATE Lab: Proof of Execution Demo]\\ntR.",
            "metadata": {"opcode_count": 7, "risk_opcodes": ["GLOBAL", "REDUCE"], "demo_target": "print() — safe demonstration"},
        },
        DemoType.LOCAL_FILE_MARKER: {
            "structure": {
                "protocol": 2,
                "opcodes": [
                    {"op": "GLOBAL", "arg": "builtins open", "note": "LAB DEMO: file open — illustrates file access gadget"},
                    {"op": "UNICODE", "arg": "/tmp/serial_lab_demo.txt", "note": "Target file path"},
                    {"op": "UNICODE", "arg": "w", "note": "Write mode"},
                    {"op": "TUPLE2", "note": "Arguments tuple"},
                    {"op": "REDUCE", "note": "Execution trigger"},
                    {"op": "STOP"},
                ],
                "demo_note": "Illustrates how deserialization can trigger file I/O. In real attacks, attacker writes shells or reads sensitive files.",
            },
            "raw_repr": "c2\\x02\\nbuiltins\\nopen\\n(V/tmp/serial_lab_demo.txt\\nVw\\ntR.",
            "metadata": {"opcode_count": 6, "risk_opcodes": ["GLOBAL", "REDUCE"], "demo_target": "open() — file marker"},
        },
        DemoType.ENV_INFO: {
            "structure": {
                "protocol": 4,
                "opcodes": [
                    {"op": "STACK_GLOBAL", "arg": "os environ", "note": "LAB DEMO: access environment variables"},
                    {"op": "REDUCE", "note": "Execution trigger"},
                    {"op": "STOP"},
                ],
                "demo_note": "Illustrates environment variable enumeration. Real attackers use this to exfiltrate secrets and credentials.",
            },
            "raw_repr": "\\x80\\x04\\x95...\\x8c\\x02os\\x8c\\x07environ\\x93.",
            "metadata": {"opcode_count": 3, "risk_opcodes": ["STACK_GLOBAL", "REDUCE"], "demo_target": "os.environ"},
        },
        DemoType.LOCAL_CALLBACK: {
            "structure": {
                "protocol": 2,
                "opcodes": [
                    {"op": "GLOBAL", "arg": "urllib.request urlopen", "note": "LAB DEMO: HTTP callback to callback simulator"},
                    {"op": "UNICODE", "arg": "http://callback-simulator.serial.lab/ping", "note": "Callback URL"},
                    {"op": "TUPLE1"},
                    {"op": "REDUCE", "note": "Triggers out-of-band HTTP request"},
                    {"op": "STOP"},
                ],
                "demo_note": "Illustrates SSRF via deserialization. In real exploits, callbacks confirm execution and exfiltrate data.",
            },
            "raw_repr": "c2\\x02\\nurllib.request\\nurlopen\\n(Vhttp://callback-simulator.serial.lab/ping\\ntR.",
            "metadata": {"opcode_count": 5, "risk_opcodes": ["GLOBAL", "REDUCE"], "demo_target": "urlopen callback"},
        },
        DemoType.SYNTHETIC: {
            "structure": {
                "protocol": 4,
                "opcodes": [
                    {"op": "FRAME", "note": "Protocol 4 frame header"},
                    {"op": "MEMOIZE", "note": "Store object in memo for reuse"},
                    {"op": "STOP"},
                ],
                "demo_note": "Generic synthetic pickle structure for format analysis.",
            },
            "raw_repr": "\\x80\\x04\\x95\\x10\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x94.",
            "metadata": {"opcode_count": 3, "risk_opcodes": [], "demo_target": "synthetic frame"},
        },
    },
    SerializationFormat.JAVA: {
        DemoType.PROOF_OF_EXECUTION: {
            "structure": {
                "magic": "0xACED0005",
                "stream_version": 5,
                "class_descriptors": [
                    {"class": "org.apache.commons.collections.functors.InvokerTransformer", "note": "DEMO: gadget class"},
                    {"class": "java.lang.Runtime", "note": "DEMO: execution target"},
                ],
                "gadget_chain": "CommonsCollections1 (simplified demonstration)",
                "demo_note": "Real CC1 chain triggers Runtime.exec() via transformer chain during ObjectInputStream.readObject().",
            },
            "raw_repr": "ACED0005...73720040...6F72672E617061636865...(truncated for safety)",
            "metadata": {"stream_version": 5, "class_count": 2, "gadget": "CommonsCollections1", "cve": "CVE-2015-4852"},
        },
        DemoType.SYNTHETIC: {
            "structure": {
                "magic": "0xACED0005",
                "stream_version": 5,
                "content": "Synthetic Java serialized object for analysis",
            },
            "raw_repr": "ACED0005...(synthetic)",
            "metadata": {"stream_version": 5, "class_count": 0},
        },
    },
    SerializationFormat.DOTNET_VIEWSTATE: {
        DemoType.PROOF_OF_EXECUTION: {
            "structure": {
                "format": "BinaryFormatter",
                "mac_present": False,
                "gadget": "ObjectDataProvider",
                "class_descriptors": [
                    {"class": "System.Windows.Data.ObjectDataProvider", "note": "DEMO: WPF gadget class"},
                    {"class": "System.Diagnostics.Process", "note": "DEMO: execution class"},
                ],
                "demo_note": "ObjectDataProvider.MethodName is invoked during deserialization when MAC validation is absent.",
            },
            "raw_repr": "FF010F...4F626A65637444617461...(truncated for safety)",
            "metadata": {"mac_bypass": True, "gadget": "ObjectDataProvider", "cve": "CVE-2019-0820"},
        },
        DemoType.SYNTHETIC: {
            "structure": {
                "format": "BinaryFormatter (synthetic)",
                "mac_present": True,
                "content": "Synthetic .NET serialized stream",
            },
            "raw_repr": "FF01...(synthetic)",
            "metadata": {"mac_bypass": False},
        },
    },
    SerializationFormat.ML_CONTAINER: {
        DemoType.PROOF_OF_EXECUTION: {
            "structure": {
                "container_format": "PyTorch ZIP (.pt)",
                "inner_format": "Pickle protocol 4",
                "embedded_pickle": {
                    "opcodes": [
                        {"op": "GLOBAL", "arg": "builtins print", "note": "LAB DEMO: safe print"},
                        {"op": "REDUCE", "note": "Execution trigger on model load"},
                    ],
                },
                "demo_note": "Malicious .pt file — pickle payload executes when torch.load() is called without weights_only=True.",
            },
            "raw_repr": "504B0304...(ZIP)...\\x80\\x04...(pickle)",
            "metadata": {"container": "zip", "inner": "pickle", "cve": "CVE-2022-45907"},
        },
        DemoType.SYNTHETIC: {
            "structure": {
                "container_format": "safetensors (safe alternative)",
                "content": {"__metadata__": {"format": "pt"}, "tensor.weight": "..."},
                "demo_note": "safetensors format — no pickle, no code execution risk.",
            },
            "raw_repr": '{\"__metadata__\": {\"format\": \"pt\"}}...(binary tensor data)',
            "metadata": {"container": "safetensors", "is_safe": True},
        },
    },
}


def _make_synthetic_bytes(fmt: SerializationFormat, demo_type: DemoType) -> bytes:
    """Generate a safe synthetic byte sequence for demonstration purposes."""
    markers = {
        SerializationFormat.PICKLE: b"\x80\x02\x8c\x05hello\x94.",
        SerializationFormat.JAVA: b"\xac\xed\x00\x05\x74\x00\x10SERIAL_LAB_DEMO",
        SerializationFormat.DOTNET_VIEWSTATE: b"\xff\x01\x00\x00SERIAL_DEMO",
        SerializationFormat.ML_CONTAINER: b"PK\x03\x04SERIAL_ML_DEMO",
    }
    base = markers.get(fmt, b"SERIAL_DEMO")
    suffix = demo_type.value.encode("utf-8", errors="replace")
    return base + b"_" + suffix


@router.post("/simulate", response_model=PayloadSimulateResponse, summary="Generate lab-safe payload demonstration")
@limiter.limit("60/minute")
async def simulate_payload(http_request: Request, request: PayloadSimulateRequest) -> PayloadSimulateResponse:
    """
    Generate a structured educational representation of a deserialization payload.

    This endpoint NEVER generates functional exploits. It returns:
    - A synthetic structural representation for educational analysis
    - Base64 and hex encodings of a safe demonstration byte sequence
    - Metadata about the format and attack class

    All outputs carry safety classification markers.
    """
    demo_data = DEMO_STRUCTURES.get(request.format, {}).get(
        request.demo_type,
        DEMO_STRUCTURES.get(request.format, {}).get(DemoType.SYNTHETIC, {})
    )

    if not demo_data:
        raise HTTPException(
            status_code=400,
            detail=f"No demonstration available for format={request.format}, demo_type={request.demo_type}"
        )

    synthetic_bytes = _make_synthetic_bytes(request.format, request.demo_type)
    b64 = base64.b64encode(synthetic_bytes).decode("ascii")
    hex_enc = synthetic_bytes.hex()
    raw_repr = demo_data.get("raw_repr", synthetic_bytes.decode("latin-1", errors="replace"))

    return PayloadSimulateResponse(
        format=request.format,
        demo_type=request.demo_type,
        raw_representation=raw_repr,
        base64_encoded=b64,
        hex_encoded=hex_enc,
        decoded_structure=demo_data.get("structure", {}),
        metadata={
            **demo_data.get("metadata", {}),
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "is_functional_exploit": False,
            "environment": "LAB",
        },
        safety_classification="LAB_SAFE_DEMONSTRATION",
        warning=SAFETY_WARNING,
    )
