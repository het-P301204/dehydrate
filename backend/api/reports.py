"""
Reports API — generate security research reports from findings data.
"""
import json
import os
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException

from models.report import ReportRequest, ReportResponse, ReportFormat, ReportTemplate
from models.finding import Finding

router = APIRouter()

_FINDINGS_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "findings.json")


def _load_findings() -> list[Finding]:
    with open(_FINDINGS_PATH, "r", encoding="utf-8") as f:
        raw = json.load(f)
    return [Finding(**item) for item in raw]


def _filter_findings(
    all_findings: list[Finding],
    finding_ids: list[str],
    date_from: datetime | None,
    date_to: datetime | None,
) -> list[Finding]:
    result = all_findings
    if finding_ids:
        result = [f for f in result if f.id in finding_ids]
    if date_from:
        result = [f for f in result if f.created_at >= date_from]
    if date_to:
        result = [f for f in result if f.created_at <= date_to]
    return result


def _severity_emoji(severity: str) -> str:
    return {"critical": "CRITICAL", "high": "HIGH", "medium": "MEDIUM", "low": "LOW", "info": "INFO"}.get(severity, severity.upper())


def _build_markdown(title: str, author: str, findings: list[Finding], template: ReportTemplate) -> str:
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    lines = [
        f"# {title}",
        f"",
        f"**Author:** {author}  ",
        f"**Generated:** {now}  ",
        f"**Template:** {template.value}  ",
        f"**Findings:** {len(findings)}  ",
        f"",
        "---",
        "",
    ]

    if template == ReportTemplate.EXECUTIVE_SUMMARY:
        lines += [
            "## Executive Summary",
            "",
            "This report summarizes deserialization vulnerability findings identified during",
            "security research using the DEHYDRATE platform. Deserialization vulnerabilities",
            "allow attackers to execute arbitrary code by supplying crafted serialized objects",
            "to applications that deserialize untrusted data.",
            "",
            f"**Total Findings:** {len(findings)}",
            f"**Critical:** {sum(1 for f in findings if f.severity == 'critical')}",
            f"**High:** {sum(1 for f in findings if f.severity == 'high')}",
            f"**Medium:** {sum(1 for f in findings if f.severity == 'medium')}",
            f"**Low/Info:** {sum(1 for f in findings if f.severity in ('low', 'info'))}",
            "",
            "## Key Recommendations",
            "",
            "1. Replace pickle-based serialization with JSON, MessagePack, or Protocol Buffers.",
            "2. Implement deserialization allowlists/filters (JEP 290 for Java, RestrictedUnpickler for Python).",
            "3. Never deserialize data from untrusted sources.",
            "4. Apply vendor patches for known gadget chain CVEs.",
            "5. Use safetensors format for ML model interchange.",
            "",
        ]

    elif template == ReportTemplate.VULNERABILITY_SUMMARY:
        lines += [
            "## Vulnerability Summary",
            "",
            "| ID | Title | Severity | Runtime | CVE |",
            "|----|-------|----------|---------|-----|",
        ]
        for f in findings:
            cve = f.cve or "N/A"
            lines.append(f"| {f.id} | {f.title[:50]} | {_severity_emoji(f.severity)} | {f.affected_runtime} | {cve} |")
        lines.append("")

    # Full findings for technical templates
    if template in (ReportTemplate.TECHNICAL_DETAIL, ReportTemplate.SECURITY_ASSESSMENT):
        lines += ["## Findings", ""]
        for f in findings:
            lines += [
                f"### [{_severity_emoji(f.severity)}] {f.title}",
                "",
                f"**ID:** `{f.id}`  ",
                f"**Severity:** {f.severity.upper()}  ",
                f"**Affected Runtime:** {f.affected_runtime}  ",
                f"**Serialization Format:** {f.serialization_format}  ",
                f"**Status:** {f.status}  ",
                f"**CVE:** {f.cve or 'N/A'}  ",
                "",
                "#### Evidence",
                f"> {f.evidence}",
                "",
                "#### Reproduction Steps",
                f"```\n{f.reproduction}\n```",
                "",
                "#### Impact",
                f"{f.impact}",
                "",
                "#### Remediation",
                f"{f.remediation}",
                "",
            ]
            if f.references:
                lines.append("#### References")
                for ref in f.references:
                    lines.append(f"- {ref}")
                lines.append("")
            lines.append("---")
            lines.append("")

    return "\n".join(lines)


@router.post("", response_model=ReportResponse, summary="Generate a security report")
async def generate_report(request: ReportRequest) -> ReportResponse:
    """Generate a formatted security research report from findings data."""
    all_findings = _load_findings()
    findings = _filter_findings(
        all_findings,
        request.finding_ids,
        request.date_from,
        request.date_to,
    )

    if not findings:
        findings = all_findings  # default: include all

    if request.format == ReportFormat.MARKDOWN:
        content = _build_markdown(request.title, request.author, findings, request.template)
    else:
        # JSON format
        content = json.dumps(
            {
                "title": request.title,
                "author": request.author,
                "template": request.template.value,
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "findings": [f.model_dump(mode="json") for f in findings],
                "summary": {
                    "total": len(findings),
                    "critical": sum(1 for f in findings if f.severity == "critical"),
                    "high": sum(1 for f in findings if f.severity == "high"),
                    "medium": sum(1 for f in findings if f.severity == "medium"),
                },
            },
            indent=2,
            default=str,
        )

    return ReportResponse(
        title=request.title,
        format=request.format,
        template=request.template,
        content=content,
        generated_at=datetime.now(timezone.utc),
        finding_count=len(findings),
        metadata={
            "author": request.author,
            "platform": "DEHYDRATE Research Platform",
            "version": "1.0.0",
        },
    )


@router.get("", summary="List available report templates")
async def list_report_templates() -> dict:
    """Return available report templates and formats."""
    return {
        "templates": [t.value for t in ReportTemplate],
        "formats": [f.value for f in ReportFormat],
        "finding_count": len(_load_findings()),
    }
