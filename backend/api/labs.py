"""
Labs API — manages simulated lab environments.
Labs are simulated (no actual Docker orchestration here).
"""
import json
import os
import uuid
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, HTTPException

from models.lab import Lab, LabType, LabStatus, LabStartRequest, LabStopRequest, LabResetRequest, LabResponse

router = APIRouter()

_LABS_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "labs.json")

# In-memory lab state (loaded from JSON, mutated by start/stop/reset)
_lab_state: dict[str, Lab] = {}


def _load_labs() -> None:
    global _lab_state
    if _lab_state:
        return
    with open(_LABS_PATH, "r", encoding="utf-8") as f:
        raw = json.load(f)
    for item in raw:
        lab = Lab(**item)
        _lab_state[lab.id] = lab


def _get_labs() -> list[Lab]:
    _load_labs()
    return list(_lab_state.values())


def _get_lab(lab_id: str) -> Lab:
    _load_labs()
    if lab_id not in _lab_state:
        raise HTTPException(status_code=404, detail=f"Lab '{lab_id}' not found")
    return _lab_state[lab_id]


@router.get("", summary="List all labs")
async def list_labs() -> dict:
    """Return all available labs with their current status."""
    labs = _get_labs()
    return {
        "labs": [lab.model_dump() for lab in labs],
        "total": len(labs),
        "running": sum(1 for l in labs if l.status == LabStatus.RUNNING),
    }


@router.post("/start", summary="Start a lab")
async def start_lab(request: LabStartRequest) -> LabResponse:
    """
    Start a simulated lab environment.
    In production this would trigger Docker container startup.
    Here we update the in-memory state to reflect a running lab.
    """
    _load_labs()
    # Find lab by type
    target_lab = None
    for lab in _lab_state.values():
        if lab.type == request.lab_type:
            target_lab = lab
            break

    if target_lab is None:
        raise HTTPException(status_code=404, detail=f"No lab found for type '{request.lab_type}'")

    if target_lab.status == LabStatus.RUNNING:
        return LabResponse(
            success=True,
            lab=target_lab,
            message=f"Lab '{target_lab.name}' is already running.",
        )

    # Simulate starting
    target_lab.status = LabStatus.RUNNING
    target_lab.started_at = datetime.now(timezone.utc)
    target_lab.container_id = f"serial_{target_lab.id}_{uuid.uuid4().hex[:8]}"

    return LabResponse(
        success=True,
        lab=target_lab,
        message=f"Lab '{target_lab.name}' started successfully.",
    )


@router.post("/stop", summary="Stop a lab")
async def stop_lab(request: LabStopRequest) -> LabResponse:
    """Stop a running lab."""
    lab = _get_lab(request.lab_id)

    if lab.status == LabStatus.STOPPED:
        return LabResponse(
            success=True,
            lab=lab,
            message=f"Lab '{lab.name}' is already stopped.",
        )

    lab.status = LabStatus.STOPPED
    lab.started_at = None
    lab.container_id = None

    return LabResponse(
        success=True,
        lab=lab,
        message=f"Lab '{lab.name}' stopped successfully.",
    )


@router.post("/reset", summary="Reset a lab")
async def reset_lab(request: LabResetRequest) -> LabResponse:
    """Reset a lab to its initial state."""
    lab = _get_lab(request.lab_id)

    lab.status = LabStatus.RESETTING
    # Simulate reset — bring back to stopped with clean state
    lab.status = LabStatus.STOPPED
    lab.started_at = None
    lab.container_id = None

    return LabResponse(
        success=True,
        lab=lab,
        message=f"Lab '{lab.name}' has been reset to initial state.",
    )


@router.get("/{lab_id}", summary="Get a specific lab")
async def get_lab(lab_id: str) -> dict:
    """Return details for a specific lab by ID."""
    lab = _get_lab(lab_id)
    return lab.model_dump()
