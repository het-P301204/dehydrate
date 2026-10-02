"""
Scanner API — simulates AV/security scanner detection against payload samples.
"""
from fastapi import APIRouter, HTTPException
from models.scanner import ScanRequest, ScanResponse, ScannerType
from engine.scanner_engine import simulate_scan

router = APIRouter()

AVAILABLE_SAMPLES = [
    "basic_pickle",
    "cc1_chain",
    "cc6_chain",
    "spring_chain",
    "viewstate_mac_bypass",
    "pytorch_malicious",
    "sklearn_malicious",
    "celery_task",
    "shadowpickle_v1",
    "shadowpickle_v2",
    "shadowpickle_v3",
]


@router.get("/samples", summary="List available scanner test samples")
async def list_samples() -> dict:
    """Return the list of pre-built samples that can be scanned."""
    return {
        "samples": AVAILABLE_SAMPLES,
        "scanner_types": [s.value for s in ScannerType],
    }


@router.post("/run", response_model=ScanResponse, summary="Run scanner simulation")
async def run_scanner(request: ScanRequest) -> ScanResponse:
    """
    Simulate running a security scanner against a payload sample.
    No real execution occurs — this models detection/evasion dynamics
    at a behavioral level for educational purposes.
    """
    if request.sample_name not in AVAILABLE_SAMPLES:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown sample '{request.sample_name}'. Available: {AVAILABLE_SAMPLES}",
        )

    result = simulate_scan(request.sample_name, request.scanner_type)
    return ScanResponse(**result)
