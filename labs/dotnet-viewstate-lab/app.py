"""
DEHYDRATE .NET ViewState Lab
==========================
Python simulation of .NET ViewState / ObjectStateFormatter deserialization attacks.
LAB ENVIRONMENT ONLY — NOT FOR PRODUCTION USE

Covers:
  - ViewState MAC validation bypass (missing enableViewStateMac)
  - ObjectStateFormatter gadget chains
  - MachineKey theft scenarios
  - ysoserial.net payload structure analysis
"""
import base64
import hashlib
import hmac
import struct
import re
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

app = FastAPI(
    title="DEHYDRATE .NET ViewState Lab",
    description=".NET ViewState deserialization vulnerability simulation — LAB USE ONLY",
    version="1.0.0",
)

LAB_MARKER = "DEHYDRATE_DOTNET_LAB_CONFIRMED"

# .NET ViewState magic token — base64 of 0xFF 0x01 header
VIEWSTATE_PREAMBLE = bytes([0xFF, 0x01])

# Known ObjectStateFormatter / BinaryFormatter gadget payloads
DOTNET_GADGET_CHAINS = {
    "ActivitySurrogateSelector": {
        "class": "System.Workflow.ComponentModel.Serialization.ActivitySurrogateSelector",
        "impact": "Remote Code Execution",
        "net_versions": [".NET Framework 3.5+"],
        "description": "Uses Activity serialization surrogate to load arbitrary assemblies",
        "cve": "CVE-2017-8759",
    },
    "TextFormattingRunProperties": {
        "class": "Microsoft.VisualStudio.Text.Formatting.TextFormattingRunProperties",
        "impact": "Remote Code Execution",
        "net_versions": [".NET Framework 4.x"],
        "description": "WPF/VisualStudio gadget chain via PropertyChangedBase",
        "cve": "N/A — ysoserial.net gadget",
    },
    "ObjectDataProvider": {
        "class": "System.Windows.Data.ObjectDataProvider",
        "impact": "Remote Code Execution",
        "net_versions": [".NET Framework 4.x"],
        "description": "WPF ObjectDataProvider can DEHYDRATE Process.Start via method parameters",
        "cve": "N/A — ysoserial.net gadget",
    },
    "WindowsClaimsIdentity": {
        "class": "System.Security.Claims.WindowsClaimsIdentity",
        "impact": "Remote Code Execution",
        "net_versions": [".NET Framework 4.x", "Exchange Server"],
        "description": "Used in ProxyLogon-style attacks via Exchange deserialization endpoint",
        "cve": "CVE-2021-26855",
    },
    "SessionSecurityTokenHandler": {
        "class": "System.IdentityModel.Tokens.SessionSecurityTokenHandler",
        "impact": "Remote Code Execution",
        "net_versions": [".NET Framework 4.x", "SharePoint"],
        "description": "SharePoint deserialization chain via BinaryFormatter in SAML token handling",
        "cve": "CVE-2020-16952",
    },
}

# ── Models ────────────────────────────────────────────────────────────────────

class ViewStateRequest(BaseModel):
    viewstate: str  # raw ViewState string (typically base64)
    validation_key: Optional[str] = None  # hex MachineKey (for MAC verification)
    validation_algorithm: str = "SHA1"

class MacForgeRequest(BaseModel):
    payload_base64: str
    machinekey_hex: str
    algorithm: str = "SHA1"

class GadgetSimulateRequest(BaseModel):
    chain: str
    command: Optional[str] = "calc.exe"
    generator: str = "ysoserial.net"


# ── Helpers ───────────────────────────────────────────────────────────────────

def _decode_viewstate(vs: str) -> bytes:
    """Decode a ViewState value (handles URL-safe b64 and padding)."""
    try:
        vs = vs.strip()
        # Handle URL-encoded spaces
        vs = vs.replace(" ", "+")
        # Add padding if needed
        vs += "=" * (4 - len(vs) % 4) if len(vs) % 4 else ""
        return base64.b64decode(vs)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid ViewState encoding: {e}")

def _verify_mac(data: bytes, mac: bytes, key_hex: str, alg: str) -> bool:
    """Verify a ViewState MAC signature."""
    try:
        key = bytes.fromhex(key_hex)
        if alg.upper() in ("SHA1", "HMACSHA1"):
            computed = hmac.new(key, data, hashlib.sha1).digest()
        elif alg.upper() in ("SHA256", "HMACSHA256"):
            computed = hmac.new(key, data, hashlib.sha256).digest()
        else:
            computed = hmac.new(key, data, hashlib.sha1).digest()
        return hmac.compare_digest(computed, mac)
    except Exception:
        return False


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "running", "lab": "dotnet-viewstate", "version": "1.0.0"}

@app.post("/analyze")
def analyze_viewstate(req: ViewStateRequest):
    """
    Analyze a .NET ViewState payload:
      - Detect MAC presence and algorithm
      - Identify ObjectStateFormatter vs BinaryFormatter encoding
      - Flag potential gadget chain class names embedded in payload
    """
    data = _decode_viewstate(req.viewstate)

    has_preamble = data[:2] == VIEWSTATE_PREAMBLE
    size = len(data)

    # Heuristic: last 20 bytes = SHA1 MAC, last 32 = SHA256 MAC
    potential_mac_sha1 = data[-20:] if size > 24 else None
    potential_mac_sha256 = data[-32:] if size > 36 else None

    # Scan for .NET class names
    dotnet_class_pattern = rb"[A-Z][a-zA-Z0-9]+(?:\.[A-Z][a-zA-Z0-9]+){2,}"
    class_refs = [m.decode("ascii", errors="ignore") for m in re.findall(dotnet_class_pattern, data)]

    # Check for known gadget chain classes
    matched_chains = []
    for chain_name, chain_info in DOTNET_GADGET_CHAINS.items():
        if any(frag in data_str for frag in chain_info["class"].split(".") for data_str in [data.decode("ascii", errors="ignore")]):
            matched_chains.append({"chain": chain_name, "cve": chain_info["cve"]})

    mac_present = False
    mac_valid = None
    if req.validation_key and potential_mac_sha1:
        mac_present = True
        mac_valid = _verify_mac(data[:-20], potential_mac_sha1, req.validation_key, req.validation_algorithm)

    return {
        "valid_viewstate_preamble": has_preamble,
        "size_bytes": size,
        "mac_present": mac_present,
        "mac_valid": mac_valid,
        "class_references": class_refs[:30],
        "gadget_chains_detected": matched_chains,
        "risk_level": "CRITICAL" if matched_chains else ("HIGH" if not mac_present else "MEDIUM"),
        "lab_marker": LAB_MARKER,
    }

@app.post("/forge-mac")
def forge_mac(req: MacForgeRequest):
    """
    Demonstrate MAC forging when a MachineKey is known/stolen.
    Returns the HMAC signature for the given payload — used to show how
    stolen MachineKeys enable authenticated deserialization attacks.
    """
    try:
        payload = base64.b64decode(req.payload_base64)
        key = bytes.fromhex(req.machinekey_hex)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid input: {e}")

    alg = req.algorithm.upper()
    if "256" in alg:
        mac = hmac.new(key, payload, hashlib.sha256).digest()
        alg_name = "HMACSHA256"
    else:
        mac = hmac.new(key, payload, hashlib.sha1).digest()
        alg_name = "HMACSHA1"

    signed = payload + mac
    return {
        "original_payload_b64": req.payload_base64,
        "mac_hex": mac.hex(),
        "mac_b64": base64.b64encode(mac).decode(),
        "signed_payload_b64": base64.b64encode(signed).decode(),
        "algorithm": alg_name,
        "note": "Demonstrates MachineKey-based MAC bypass — lab simulation only",
        "lab_marker": LAB_MARKER,
    }

@app.get("/gadget-chains")
def list_gadget_chains():
    """List all known .NET deserialization gadget chains."""
    return {
        "chains": [
            {
                "name": name,
                "class": info["class"],
                "impact": info["impact"],
                "net_versions": info["net_versions"],
                "description": info["description"],
                "cve": info["cve"],
            }
            for name, info in DOTNET_GADGET_CHAINS.items()
        ],
        "total": len(DOTNET_GADGET_CHAINS),
        "lab_marker": LAB_MARKER,
    }

@app.post("/gadget-chains/simulate")
def simulate_gadget(req: GadgetSimulateRequest):
    """
    Simulate a ysoserial.net payload structure for the given gadget chain.
    Returns structural metadata — no actual .NET execution.
    """
    chain = DOTNET_GADGET_CHAINS.get(req.chain)
    if not chain:
        raise HTTPException(status_code=404, detail=f"Unknown chain '{req.chain}'")

    # Simulate the ViewState preamble + placeholder class data
    simulated = VIEWSTATE_PREAMBLE + req.chain.encode() + b"\x00" * 8
    simulated_b64 = base64.b64encode(simulated).decode()

    return {
        "chain": req.chain,
        "class": chain["class"],
        "cve": chain["cve"],
        "command_would_embed": req.command,
        "simulated_viewstate": simulated_b64,
        "ysoserial_command": f"ysoserial.exe -g {req.chain} -f ViewState -c \"{req.command}\"",
        "note": "Structural simulation only — no .NET runtime invoked",
        "lab_marker": LAB_MARKER,
    }

@app.get("/machinekey-scenarios")
def machinekey_scenarios():
    """Describes common MachineKey exposure scenarios used in real attacks."""
    return {
        "scenarios": [
            {
                "name": "Default MachineKey",
                "description": "Application uses default or well-known MachineKey from online examples",
                "prevalence": "HIGH",
                "real_world_example": "Telerik RadGrid (CVE-2017-11317)",
            },
            {
                "name": "LFI to MachineKey",
                "description": "Local File Inclusion reads web.config exposing the MachineKey",
                "prevalence": "MEDIUM",
                "real_world_example": "Exchange Server (CVE-2021-26855 + CVE-2021-27065)",
            },
            {
                "name": "Source Code Leak",
                "description": "GitHub/S3 leak of web.config or appsettings.json containing key",
                "prevalence": "MEDIUM",
                "real_world_example": "Various SaaS applications",
            },
        ],
        "lab_marker": LAB_MARKER,
    }
