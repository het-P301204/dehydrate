"""
Fingerprint API — returns runtime environment information for the lab context.
Safe: no external network calls, reads only Python runtime metadata.
"""
import sys
import platform
import importlib.metadata
from fastapi import APIRouter

router = APIRouter()

# Libraries of interest for deserialization research
LIBRARIES_OF_INTEREST = [
    "pickle",       # stdlib — no package version
    "fastapi",
    "pydantic",
    "uvicorn",
    "httpx",
    "python-jose",
    "slowapi",
    "rich",
    "cryptography",
    "PyYAML",
    "requests",
    "numpy",
    "scikit-learn",
    "torch",
    "joblib",
    "celery",
]


def _get_version(package: str) -> str:
    try:
        return importlib.metadata.version(package)
    except importlib.metadata.PackageNotFoundError:
        return "not installed"


@router.get("", summary="Get lab runtime fingerprint")
async def get_runtime_fingerprint() -> dict:
    """
    Returns Python runtime information for the current lab environment.
    Used to understand the deserialization attack surface of this instance.
    No external network calls; reads Python runtime metadata only.
    """
    python_version = sys.version
    platform_info = platform.platform()
    arch = platform.machine()

    libraries = {}
    for lib in LIBRARIES_OF_INTEREST:
        if lib == "pickle":
            libraries[lib] = {"version": "stdlib", "note": "Built-in — no package version"}
        else:
            ver = _get_version(lib)
            libraries[lib] = {
                "version": ver,
                "installed": ver != "not installed",
            }

    # Risk indicators based on installed libraries
    risk_indicators = []

    if libraries.get("torch", {}).get("installed"):
        risk_indicators.append({
            "library": "torch",
            "indicator": "PyTorch installed — torch.load() without weights_only=True is vulnerable to pickle RCE",
            "risk": "HIGH",
            "recommendation": "Ensure weights_only=True in all torch.load() calls",
        })

    if libraries.get("scikit-learn", {}).get("installed"):
        risk_indicators.append({
            "library": "scikit-learn",
            "indicator": "scikit-learn installed — joblib.load() of untrusted models is vulnerable",
            "risk": "HIGH",
            "recommendation": "Verify model file hashes before loading",
        })

    if libraries.get("celery", {}).get("installed"):
        risk_indicators.append({
            "library": "celery",
            "indicator": "Celery installed — check CELERY_TASK_SERIALIZER is not 'pickle'",
            "risk": "MEDIUM",
            "recommendation": "Set CELERY_TASK_SERIALIZER='json'",
        })

    risk_indicators.append({
        "library": "pickle",
        "indicator": "pickle is always available in Python — never deserialize untrusted pickle data",
        "risk": "INFO",
        "recommendation": "Use safe alternatives: JSON, MessagePack, Protocol Buffers",
    })

    return {
        "runtime": "Python",
        "python_version": python_version,
        "python_version_info": {
            "major": sys.version_info.major,
            "minor": sys.version_info.minor,
            "micro": sys.version_info.micro,
        },
        "platform": platform_info,
        "architecture": arch,
        "libraries": libraries,
        "risk_indicators": risk_indicators,
        "environment": "LAB",
        "note": "This fingerprint reflects the DEHYDRATE API server runtime, not the isolated lab containers.",
    }
