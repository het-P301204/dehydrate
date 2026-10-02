"""
DEHYDRATE Java Serialization Lab
==============================
Python-based simulation of Java serialization vulnerability concepts.
LAB ENVIRONMENT ONLY — NOT FOR PRODUCTION USE

Simulates Java serialization formats, gadget chains (CommonsCollections,
Spring, WildFly), and ysoserial-style payload analysis without requiring
a full JDK. Useful for understanding the attack surface and training
detection signatures.
"""
import struct
import base64
import re
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List

app = FastAPI(
    title="DEHYDRATE Java Serialization Lab",
    description="Java serialization vulnerability simulation — LAB USE ONLY",
    version="1.0.0",
)

LAB_MARKER = "DEHYDRATE_JAVA_LAB_CONFIRMED"

# Java serialization magic bytes
JAVA_MAGIC = b"\xac\xed"
JAVA_VERSION = b"\x00\x05"

# Known gadget chain signatures for detection training
GADGET_SIGNATURES = {
    "CommonsCollections1": {
        "class_refs": ["org.apache.commons.collections.Transformer", "InvokerTransformer", "ChainedTransformer"],
        "cve": "CVE-2015-4852",
        "impact": "Remote Code Execution",
        "affected": "Apache Commons Collections <= 3.2.1, <= 4.0",
        "description": "Chains transformer objects to DEHYDRATE arbitrary methods via reflection",
    },
    "CommonsCollections2": {
        "class_refs": ["javassist.ClassPool", "TemplatesImpl", "PriorityQueue"],
        "cve": "CVE-2015-4852",
        "impact": "Remote Code Execution",
        "affected": "Apache Commons Collections 4.0 + Javassist",
        "description": "Uses bytecode injection via TemplatesImpl to execute arbitrary class",
    },
    "CommonsCollections6": {
        "class_refs": ["HashSet", "HashMap", "TiedMapEntry", "LazyMap"],
        "cve": "CVE-2015-4852",
        "impact": "Remote Code Execution",
        "affected": "Apache Commons Collections <= 3.2.1 (Java 8 compatible)",
        "description": "Java 8-compatible chain bypassing serialization filter improvements",
    },
    "Spring1": {
        "class_refs": ["org.springframework.core.SerializableTypeWrapper", "MethodInvokeTypeProvider"],
        "cve": "CVE-2016-1000027",
        "impact": "Remote Code Execution",
        "affected": "Spring Framework <= 5.3.17",
        "description": "Spring framework gadget chain via method invocation wrappers",
    },
    "WildFlyJMS": {
        "class_refs": ["org.jboss.remoting3", "JMXServiceURL", "MLetContent"],
        "cve": "CVE-2017-12149",
        "impact": "Remote Code Execution",
        "affected": "JBoss / WildFly <= 9.x",
        "description": "JBoss JMX invoker deserialization chain via HTTP endpoint",
    },
    "WebLogic": {
        "class_refs": ["weblogic.corba.utils", "MarshalledObject", "JtaTransactionManager"],
        "cve": "CVE-2019-2725",
        "impact": "Remote Code Execution",
        "affected": "Oracle WebLogic 10.3.6, 12.1.3",
        "description": "WebLogic wlsrpc endpoint deserialization without authentication",
    },
}


# ── Models ────────────────────────────────────────────────────────────────────

class JavaPayloadRequest(BaseModel):
    data: str  # base64-encoded bytes
    encoding: str = "base64"

class GadgetRequest(BaseModel):
    chain: str
    command: Optional[str] = "id"

class ScanRequest(BaseModel):
    data: str
    encoding: str = "base64"


# ── Helpers ───────────────────────────────────────────────────────────────────

def _decode_input(data: str, encoding: str) -> bytes:
    if encoding == "base64":
        return base64.b64decode(data)
    elif encoding == "hex":
        return bytes.fromhex(data)
    raise HTTPException(status_code=400, detail="encoding must be 'base64' or 'hex'")

def _is_java_serialized(data: bytes) -> bool:
    return data[:2] == JAVA_MAGIC

def _parse_java_header(data: bytes) -> dict:
    if len(data) < 4:
        return {"valid": False}
    magic = data[:2].hex().upper()
    version = struct.unpack(">H", data[2:4])[0]
    return {
        "valid": data[:2] == JAVA_MAGIC,
        "magic": f"0x{magic}",
        "stream_version": version,
        "size_bytes": len(data),
    }


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "running", "lab": "java-serialization", "version": "1.0.0"}

@app.post("/analyze")
def analyze_payload(req: JavaPayloadRequest):
    """
    Analyze a Java serialized payload: validate magic bytes, detect gadget
    chain signatures, and assess risk — without executing the payload.
    """
    data = _decode_input(req.data, req.encoding)
    header = _parse_java_header(data)

    if not header["valid"]:
        return {
            "valid_java_serialization": False,
            "message": "Not a Java serialized object (missing 0xACED magic)",
            "header": header,
            "lab_marker": LAB_MARKER,
        }

    # Scan for class name strings embedded in the stream
    text_fragments = re.findall(rb"[a-zA-Z][a-zA-Z0-9_$/]{3,}", data)
    class_names = [f.decode("ascii", errors="ignore") for f in text_fragments]

    # Match against known gadget chain signatures
    matched_chains = []
    for chain_name, chain_info in GADGET_SIGNATURES.items():
        hits = [ref for ref in chain_info["class_refs"] if ref in " ".join(class_names)]
        if hits:
            matched_chains.append({
                "chain": chain_name,
                "matched_refs": hits,
                "cve": chain_info["cve"],
                "impact": chain_info["impact"],
            })

    return {
        "valid_java_serialization": True,
        "header": header,
        "class_references_found": class_names[:50],
        "gadget_chains_detected": matched_chains,
        "risk_level": "CRITICAL" if matched_chains else ("HIGH" if class_names else "MEDIUM"),
        "lab_marker": LAB_MARKER,
    }

@app.get("/gadget-chains")
def list_gadget_chains():
    """List all known gadget chains in the research database."""
    return {
        "chains": [
            {
                "name": name,
                "cve": info["cve"],
                "impact": info["impact"],
                "affected": info["affected"],
                "description": info["description"],
            }
            for name, info in GADGET_SIGNATURES.items()
        ],
        "total": len(GADGET_SIGNATURES),
        "lab_marker": LAB_MARKER,
    }

@app.post("/gadget-chains/simulate")
def simulate_gadget_chain(req: GadgetRequest):
    """
    Simulate generating a ysoserial-style payload description for a given chain.
    Returns metadata and structural description — no real JVM execution.
    """
    chain = GADGET_SIGNATURES.get(req.chain)
    if not chain:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown chain '{req.chain}'. Available: {list(GADGET_SIGNATURES)}"
        )

    # Simulate the Java stream header + placeholder class refs
    simulated_magic = JAVA_MAGIC + JAVA_VERSION
    simulated_classname = chain["class_refs"][0].encode()
    simulated_payload = simulated_magic + b"\x73\x72" + simulated_classname

    return {
        "chain": req.chain,
        "cve": chain["cve"],
        "description": chain["description"],
        "simulated_payload_base64": base64.b64encode(simulated_payload).decode(),
        "simulated_payload_hex": simulated_payload.hex(),
        "class_chain": chain["class_refs"],
        "command_embedding": f"Command '{req.command}' would be embedded in {chain['class_refs'][0]}",
        "note": "Structural simulation only — no JVM execution occurred",
        "lab_marker": LAB_MARKER,
    }

@app.post("/scan")
def scan_payload(req: ScanRequest):
    """Alias for /analyze — used by the backend scanner engine."""
    return analyze_payload(JavaPayloadRequest(data=req.data, encoding=req.encoding))

@app.get("/detection-patterns")
def detection_patterns():
    """
    Return YARA / Suricata-style detection patterns for each gadget chain.
    Used for building detection rules.
    """
    patterns = {}
    for name, info in GADGET_SIGNATURES.items():
        patterns[name] = {
            "yara_strings": [f'"{ref}"' for ref in info["class_refs"]],
            "network_signature": f"content:\"|ac ed 00 05|\"; content:\"{info['class_refs'][0]}\";",
            "description": info["description"],
        }
    return {"patterns": patterns, "lab_marker": LAB_MARKER}
