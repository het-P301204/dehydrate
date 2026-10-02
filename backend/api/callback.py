"""
Callback API — simulated out-of-band callback event log.
All events are synthetic; no real network requests are made.
"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from engine.callback_simulator import get_events, clear_events, trigger_callback
from rate_limiter import limiter

router = APIRouter()

VALID_PAYLOAD_TYPES = [
    "python-pickle", "java-cc1", "java-cc6", "dotnet-viewstate",
    "ml-pytorch", "ml-sklearn", "celery-task", "generic",
]
VALID_CALLBACK_TYPES = ["dns", "http", "rmi", "ldap"]


class CallbackTriggerRequest(BaseModel):
    payload_type: str = "generic"
    callback_type: str = "http"


@router.get("/events", summary="Get callback event log")
async def get_callback_events() -> dict:
    """Return all simulated callback events (newest first, max 100)."""
    events = get_events()
    return {
        "events": events,
        "total": len(events),
        "note": "All events are simulated. No real network requests are made.",
    }


@router.post("/trigger", summary="Trigger a simulated callback event")
@limiter.limit("30/minute")
async def trigger_callback_event(http_request: Request, request: CallbackTriggerRequest) -> dict:
    """
    Simulate a callback event as would be triggered by a deserialization exploit.
    Records the event in the in-memory log.
    No real DNS/HTTP/RMI/LDAP requests are made.
    """
    if request.payload_type not in VALID_PAYLOAD_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid payload_type '{request.payload_type}'. Choose from: {VALID_PAYLOAD_TYPES}",
        )

    if request.callback_type not in VALID_CALLBACK_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid callback_type '{request.callback_type}'. Choose from: {VALID_CALLBACK_TYPES}",
        )

    event = trigger_callback(
        payload_type=request.payload_type,
        callback_type=request.callback_type,
    )
    return {
        "success": True,
        "event": event,
        "note": "Simulated callback recorded. No real network request was made.",
    }


@router.delete("/events", summary="Clear all callback events")
async def clear_callback_events() -> dict:
    """Clear the in-memory callback event log."""
    count = clear_events()
    return {"success": True, "cleared": count}
