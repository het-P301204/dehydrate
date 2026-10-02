from pydantic import BaseModel
from enum import Enum
from typing import List, Optional
from datetime import datetime


class ReportFormat(str, Enum):
    MARKDOWN = "markdown"
    JSON = "json"


class ReportTemplate(str, Enum):
    SECURITY_ASSESSMENT = "security_assessment"
    VULNERABILITY_SUMMARY = "vulnerability_summary"
    EXECUTIVE_SUMMARY = "executive_summary"
    TECHNICAL_DETAIL = "technical_detail"


class ReportRequest(BaseModel):
    template: ReportTemplate
    finding_ids: List[str] = []
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    format: ReportFormat = ReportFormat.MARKDOWN
    title: str = "DEHYDRATE Security Research Report"
    author: str = "Security Research Team"


class ReportResponse(BaseModel):
    title: str
    format: ReportFormat
    template: ReportTemplate
    content: str
    generated_at: datetime
    finding_count: int
    metadata: dict
