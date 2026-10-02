"""
Scanner engine — simulates AV/security scanner detection against
lab deserialization payloads. No real scanning is performed.
"""
import random
import time
from models.scanner import ScannerType, ScanResult, ScanIndicator

# Simulated scanner profiles: each scanner has detection rates per sample type
SCANNER_PROFILES = {
    ScannerType.BASIC: {
        "name": "BasicScan AV",
        "base_detection_rate": 0.85,
        "evasion_resistance": 0.2,  # low — easily evaded
        "indicators": [
            "Pickle REDUCE opcode detected",
            "Java serialization magic bytes (0xACED0005)",
            "Known gadget chain signature match",
        ],
    },
    ScannerType.OBFUSCATED: {
        "name": "ObfuScan v2",
        "base_detection_rate": 0.45,
        "evasion_resistance": 0.6,
        "indicators": [
            "Base64 encoded payload",
            "Multi-layer encoding detected",
            "Entropy anomaly in payload",
        ],
    },
    ScannerType.SHADOWPICKLE: {
        "name": "ShadowPickle Evasion Scanner",
        "base_detection_rate": 0.15,
        "evasion_resistance": 0.9,
        "indicators": [
            "Opcode substitution pattern",
            "Custom memo manipulation",
            "Non-standard pickle protocol usage",
        ],
    },
    ScannerType.POLYMORPHIC: {
        "name": "PolymorScan",
        "base_detection_rate": 0.30,
        "evasion_resistance": 0.75,
        "indicators": [
            "Dynamic opcode generation",
            "Runtime self-modification signature",
            "Encrypted payload envelope",
        ],
    },
}

# Sample risk profiles
SAMPLE_RISK_MAP = {
    "basic_pickle": 0.9,
    "cc1_chain": 0.95,
    "cc6_chain": 0.95,
    "spring_chain": 0.90,
    "viewstate_mac_bypass": 0.85,
    "pytorch_malicious": 0.80,
    "sklearn_malicious": 0.80,
    "celery_task": 0.75,
    "shadowpickle_v1": 0.15,
    "shadowpickle_v2": 0.10,
    "shadowpickle_v3": 0.05,
    "default": 0.50,
}

EVASION_TECHNIQUES = {
    ScannerType.SHADOWPICKLE: [
        "Opcode splitting across memo operations",
        "Custom __reduce__ with indirect references",
        "Protocol downgrade to avoid signature match",
    ],
    ScannerType.POLYMORPHIC: [
        "Payload reordering on each generation",
        "Encrypted first stage with key in memo",
        "Dynamic gadget chain selection",
    ],
    ScannerType.OBFUSCATED: [
        "Double base64 encoding",
        "Null byte insertion between opcodes",
    ],
    ScannerType.BASIC: [],
}


def simulate_scan(sample_name: str, scanner_type: ScannerType) -> dict:
    """
    Simulate a scanner run against a sample.
    Returns detection result, confidence, and indicators.
    """
    start_time = time.monotonic()

    profile = SCANNER_PROFILES.get(scanner_type, SCANNER_PROFILES[ScannerType.BASIC])
    sample_risk = SAMPLE_RISK_MAP.get(sample_name, SAMPLE_RISK_MAP["default"])

    # Detection probability: scanner base rate * sample risk * randomness
    detection_prob = profile["base_detection_rate"] * sample_risk
    detected_rand = random.random()

    if detected_rand < detection_prob * 0.7:
        result = ScanResult.DETECTED
        confidence = round(random.uniform(0.75, 0.99), 3)
    elif detected_rand < detection_prob:
        result = ScanResult.SUSPICIOUS
        confidence = round(random.uniform(0.40, 0.74), 3)
    else:
        result = ScanResult.NOT_DETECTED
        confidence = round(random.uniform(0.01, 0.39), 3)

    # Build indicators
    indicators = []
    selected_indicators = profile["indicators"][:2] if result != ScanResult.NOT_DETECTED else profile["indicators"][:1]
    for indicator_text in selected_indicators:
        risk_level = "HIGH" if result == ScanResult.DETECTED else "MEDIUM"
        indicators.append(ScanIndicator(
            name=indicator_text.split(" ")[0],
            value=indicator_text,
            risk=risk_level,
            description=f"Scanner signature match: {indicator_text}",
        ))

    # Evasion techniques detected
    evasion_detected = []
    if result == ScanResult.NOT_DETECTED and scanner_type in EVASION_TECHNIQUES:
        techs = EVASION_TECHNIQUES[scanner_type]
        if techs:
            evasion_detected = [random.choice(techs)]

    # Explanation
    explanations = {
        ScanResult.DETECTED: (
            f"{profile['name']} identified {len(indicators)} matching signature(s). "
            f"Sample '{sample_name}' matches known malicious patterns with {confidence:.1%} confidence."
        ),
        ScanResult.SUSPICIOUS: (
            f"{profile['name']} flagged {len(indicators)} anomalous indicator(s). "
            f"Sample '{sample_name}' shows suspicious characteristics but no exact signature match."
        ),
        ScanResult.NOT_DETECTED: (
            f"{profile['name']} did not flag sample '{sample_name}'. "
            f"The payload may use evasion techniques that bypass this scanner's signatures."
        ),
    }

    recommendations = {
        ScanResult.DETECTED: ["Block and quarantine this payload.", "Update signature database.", "Review source of payload."],
        ScanResult.SUSPICIOUS: ["Escalate for manual review.", "Run in isolated sandbox.", "Check against additional scanners."],
        ScanResult.NOT_DETECTED: ["Consider defense-in-depth with multiple scanners.", "Implement allowlist-based deserialization.", "Do not rely solely on signature-based detection."],
    }

    elapsed_ms = int((time.monotonic() - start_time) * 1000)
    # Add simulated scanner processing delay (scanners aren't instant)
    simulated_duration = random.randint(120, 850)

    return {
        "sample_name": sample_name,
        "scanner_type": scanner_type,
        "result": result,
        "confidence": confidence,
        "indicators": indicators,
        "explanation": explanations[result],
        "scan_duration_ms": simulated_duration,
        "evasion_techniques_detected": evasion_detected,
        "recommendations": recommendations[result],
    }
