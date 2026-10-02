"""
.NET ViewState and deserialization analysis simulator.
Analyzes ViewState MAC signatures and ObjectDataProvider gadget patterns.
Never executes any .NET code.
"""
import base64
import hashlib
from typing import Any

# ViewState starts with two bytes: 0xFF 0x01 (binary format marker)
VIEWSTATE_BINARY_MAGIC = b'\xff\x01'

# Known .NET dangerous type names
DANGEROUS_DOTNET_TYPES = [
    "System.Diagnostics.Process",
    "System.Windows.Data.ObjectDataProvider",
    "System.Windows.Markup.XamlReader",
    "System.Web.UI.ObjectStateFormatter",
    "Microsoft.VisualStudio.Text.Formatting.TextFormattingRunProperties",
    "System.TypeConfuseDelegateGadget",
    "ClaimsPrincipal",
    "System.Runtime.Remoting",
    "System.Configuration.Install.AssemblyInstaller",
]

GADGET_SIGNATURES = {
    "ObjectDataProvider": b'ObjectDataProvider',
    "TypeConfuseDelegate": b'TypeConfuseDelegateGadget',
    "TextFormattingRunProperties": b'TextFormattingRunProperties',
    "ActivitySurrogateSelector": b'ActivitySurrogateSelector',
    "XamlReader": b'XamlReader',
    "WindowsIdentity": b'WindowsIdentity',
}


def analyze_viewstate_safe(data: bytes) -> dict:
    """
    Analyze .NET ViewState or deserialization stream without executing it.
    """
    is_binary_viewstate = data[:2] == VIEWSTATE_BINARY_MAGIC
    has_mac = False
    mac_bytes = None

    # ViewState with MAC: last 20 bytes (SHA1) or 32 bytes (SHA256) are MAC
    if is_binary_viewstate and len(data) > 20:
        # Heuristic: check if last segment looks like a hash
        potential_mac = data[-20:]
        has_mac = True  # simplified: assume MAC present if binary format
        mac_bytes = potential_mac.hex()

    detected_gadgets = []
    for gadget_name, signature in GADGET_SIGNATURES.items():
        if signature in data:
            detected_gadgets.append({
                "gadget": gadget_name,
                "risk": "CRITICAL",
                "description": f".NET gadget chain signature found: {gadget_name}",
            })

    dangerous_types_found = []
    for type_name in DANGEROUS_DOTNET_TYPES:
        if type_name.encode("utf-8") in data or type_name.encode("utf-16-le") in data:
            dangerous_types_found.append({
                "type": type_name,
                "risk": "HIGH",
                "description": f"Dangerous .NET type reference found: {type_name}",
            })

    suspicious_operations = detected_gadgets + dangerous_types_found

    # Risk score
    risk_score = 0
    if is_binary_viewstate:
        risk_score += 10
    if not has_mac:
        risk_score += 30  # no MAC = major vulnerability
    for item in suspicious_operations:
        risk = item.get("risk", "LOW")
        if risk == "CRITICAL":
            risk_score += 40
        elif risk == "HIGH":
            risk_score += 20
    risk_score = min(100, risk_score)

    return {
        "is_binary_viewstate": is_binary_viewstate,
        "has_mac_validation": has_mac,
        "mac_bytes": mac_bytes,
        "detected_gadget_chains": detected_gadgets,
        "dangerous_types": dangerous_types_found,
        "suspicious_operations": suspicious_operations,
        "size_bytes": len(data),
        "risk_score": risk_score,
        "mac_bypass_possible": not has_mac,
    }


def build_object_graph(data: bytes) -> dict:
    """Build a simplified .NET object graph."""
    analysis = analyze_viewstate_safe(data)
    graph = {"nodes": [], "edges": [], "root": None}

    graph["nodes"].append({
        "id": "vs-input",
        "label": ".NET ViewState / Serialized Stream",
        "type": "input",
        "details": {
            "is_binary_viewstate": analysis.get("is_binary_viewstate"),
            "has_mac": analysis.get("has_mac_validation"),
            "size_bytes": analysis.get("size_bytes"),
        },
    })

    for idx, g in enumerate(analysis.get("detected_gadget_chains", [])):
        node_id = f"dotnet-gadget-{idx}"
        graph["nodes"].append({
            "id": node_id,
            "label": g["gadget"],
            "type": "gadget",
            "details": g,
        })
        graph["edges"].append({"source": "vs-input", "target": node_id, "label": "gadget"})

    graph["root"] = "vs-input"
    return graph
