from pydantic import BaseModel
from enum import Enum
from datetime import datetime
from typing import Optional, List


class Severity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class FindingStatus(str, Enum):
    OPEN = "open"
    IN_REVIEW = "in_review"
    REMEDIATED = "remediated"
    WONT_FIX = "wont_fix"


class Finding(BaseModel):
    id: str
    title: str
    severity: Severity
    affected_runtime: str
    serialization_format: str
    evidence: str
    reproduction: str
    impact: str
    remediation: str
    references: List[str] = []
    status: FindingStatus
    created_at: datetime
    lab_id: Optional[str] = None
    cve: Optional[str] = None
