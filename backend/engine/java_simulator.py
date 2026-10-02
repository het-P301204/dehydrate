"""
Java deserialization analysis simulator.
Detects Java serialized object magic bytes and known gadget chain signatures.
Never executes any Java code.
"""
import base64
import binascii
from typing import Any

# Java serialization magic bytes: 0xACED 0x0005
JAVA_MAGIC = b'\xac\xed\x00\x05'

# Known CommonsCollections payload signatures (pattern bytes)
GADGET_SIGNATURES = {
    "CommonsCollections1": b'org.apache.commons.collections.Transformer',
    "CommonsCollections6": b'org.apache.commons.collections6',
    "Spring1": b'org.springframework.core.SerializableTypeWrapper',
    "Groovy1": b'org.codehaus.groovy.runtime.ConvertedClosure',
    "Rome": b'com.sun.syndication.feed.impl.ObjectBean',
    "XBean": b'org.apache.xbean.naming.context.ContextUtil',
    "Jdk7u21": b'com.sun.corba.se.impl.orbutil.ORBUtility',
    "Hibernate1": b'org.hibernate.engine.spi.TypedValue',
}

# Dangerous class name patterns in Java serialization streams
DANGEROUS_CLASSES = [
    b'java.lang.Runtime',
    b'java.lang.ProcessBuilder',
    b'java.io.FileInputStream',
    b'java.io.FileOutputStream',
    b'java.net.URL',
    b'java.net.URLClassLoader',
    b'sun.reflect.annotation.AnnotationInvocationHandler',
    b'com.sun.jndi',
    b'javax.naming',
]


def analyze_java_safe(data: bytes) -> dict:
    """
    Analyze Java serialized data without executing it.
    Checks magic bytes, class descriptors, and known gadget signatures.
    """
    is_java_serialized = data[:4] == JAVA_MAGIC
    stream_version = None
    if is_java_serialized and len(data) >= 6:
        stream_version = int.from_bytes(data[4:6], "big")

    detected_gadgets = []
    for gadget_name, signature in GADGET_SIGNATURES.items():
        if signature in data:
            detected_gadgets.append({
                "gadget": gadget_name,
                "signature": signature.decode("utf-8", errors="replace"),
                "risk": "CRITICAL",
                "description": f"Known gadget chain signature detected: {gadget_name}",
            })

    dangerous_classes_found = []
    for class_pattern in DANGEROUS_CLASSES:
        if class_pattern in data:
            dangerous_classes_found.append({
                "class": class_pattern.decode("utf-8", errors="replace"),
                "risk": "HIGH",
                "description": "Dangerous Java class reference found in stream",
            })

    suspicious_operations = detected_gadgets + dangerous_classes_found

    # Risk score
    risk_score = 0
    if not is_java_serialized:
        risk_score = 0
    else:
        risk_score += 20  # base for being valid Java serialized
        for item in suspicious_operations:
            risk = item.get("risk", "LOW")
            if risk == "CRITICAL":
                risk_score += 40
            elif risk == "HIGH":
                risk_score += 20
            elif risk == "MEDIUM":
                risk_score += 10
    risk_score = min(100, risk_score)

    # Extract readable class names from stream (rough heuristic)
    class_names = []
    try:
        text = data.decode("utf-8", errors="replace")
        import re
        # Java class names follow package.ClassName pattern
        matches = re.findall(r'([a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+\.[A-Z][A-Za-z0-9_]+)', text)
        class_names = list(set(matches[:20]))  # cap at 20
    except Exception:
        pass

    return {
        "is_java_serialized": is_java_serialized,
        "magic_bytes": JAVA_MAGIC.hex() if is_java_serialized else None,
        "stream_version": stream_version,
        "detected_gadget_chains": detected_gadgets,
        "dangerous_classes": dangerous_classes_found,
        "suspicious_operations": suspicious_operations,
        "class_names_found": class_names,
        "size_bytes": len(data),
        "risk_score": risk_score,
    }


def build_object_graph(data: bytes) -> dict:
    """Build a simplified Java object graph."""
    analysis = analyze_java_safe(data)
    graph = {
        "nodes": [],
        "edges": [],
        "root": None,
    }

    graph["nodes"].append({
        "id": "java-input",
        "label": "Java Serialized Stream",
        "type": "input",
        "details": {
            "magic_bytes": analysis.get("magic_bytes"),
            "stream_version": analysis.get("stream_version"),
            "size_bytes": analysis.get("size_bytes"),
        },
    })

    for idx, gadget in enumerate(analysis.get("detected_gadget_chains", [])):
        node_id = f"gadget-{idx}"
        graph["nodes"].append({
            "id": node_id,
            "label": gadget["gadget"],
            "type": "gadget",
            "details": gadget,
        })
        graph["edges"].append({
            "source": "java-input",
            "target": node_id,
            "label": "gadget chain",
        })

    for idx, cls in enumerate(analysis.get("dangerous_classes", [])):
        node_id = f"class-{idx}"
        graph["nodes"].append({
            "id": node_id,
            "label": cls["class"].split(".")[-1],
            "type": "dangerous_class",
            "details": cls,
        })
        graph["edges"].append({
            "source": "java-input",
            "target": node_id,
            "label": "class reference",
        })

    graph["root"] = "java-input"
    return graph
