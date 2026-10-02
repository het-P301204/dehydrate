from pydantic import BaseModel
from enum import Enum
from typing import List, Optional


class ScannerType(str, Enum):
    BASIC = "basic"
    OBFUSCATED = "obfuscated"
    SHADOWPICKLE = "shadowpickle"
    POLYMORPHIC = "polymorphic"


class ScanResult(str, Enum):
    DETECTED = "detected"
    SUSPICIOUS = "suspicious"
    NOT_DETECTED = "not_detected"


class ScanRequest(BaseModel):
    sample_name: str
    scanner_type: ScannerType = ScannerType.BASIC
    format: str = "pickle"


class ScanIndicator(BaseModel):
    name: str
    value: str
    risk: str
    description: str


class ScanResponse(BaseModel):
    sample_name: str
    scanner_type: ScannerType
    result: ScanResult
    confidence: float  # 0.0 - 1.0
    indicators: List[ScanIndicator]
    explanation: str
    scan_duration_ms: int
    evasion_techniques_detected: List[str] = []
    recommendations: List[str] = []
