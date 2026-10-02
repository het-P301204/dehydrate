"""
Callback simulator — in-memory event log for simulated out-of-band
callback events (DNS, HTTP) that deserialization payloads would trigger
in real exploitation scenarios. All events are simulated; no real network
calls are made.
"""
import uuid
from datetime import datetime, timezone
from typing import List
from collections import deque

MAX_EVENTS = 100

# In-memory event store (module-level singleton)
_event_store: deque = deque(maxlen=MAX_EVENTS)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_events() -> List[dict]:
    """Return all events as a list (newest first)."""
    return list(reversed(list(_event_store)))


def clear_events() -> int:
    """Clear all events. Returns count cleared."""
    count = len(_event_store)
    _event_store.clear()
    return count


def add_event(event_type: str, payload_type: str, details: dict) -> dict:
    """Add a simulated callback event."""
    event = {
        "id": str(uuid.uuid4()),
        "timestamp": _now(),
        "event_type": event_type,  # dns | http | rmi | ldap
        "payload_type": payload_type,
        "details": details,
        "source_ip": "127.0.0.1",
        "source_port": 0,
        "destination": "callback-simulator.serial.lab",
        "simulated": True,
    }
    _event_store.append(event)
    return event


def trigger_callback(payload_type: str, callback_type: str) -> dict:
    """
    Simulate a callback event as would be triggered by a deserialization payload.
    This does NOT make any real network request.
    """
    CALLBACK_TEMPLATES = {
        "dns": {
            "event_type": "dns",
            "details": {
                "query": f"{payload_type}.callback-simulator.serial.lab",
                "record_type": "A",
                "resolved": False,
                "message": "DNS query intercepted by callback simulator (no real DNS lookup performed)",
            },
        },
        "http": {
            "event_type": "http",
            "details": {
                "method": "GET",
                "url": f"http://callback-simulator.serial.lab/ping?t={payload_type}",
                "status": "intercepted",
                "message": "HTTP request intercepted by callback simulator (no real HTTP request made)",
            },
        },
        "rmi": {
            "event_type": "rmi",
            "details": {
                "registry": "rmi://callback-simulator.serial.lab:1099/ExploitStub",
                "operation": "lookup",
                "message": "RMI lookup intercepted (simulated Java RMI callback)",
            },
        },
        "ldap": {
            "event_type": "ldap",
            "details": {
                "url": f"ldap://callback-simulator.serial.lab:1389/{payload_type}",
                "operation": "lookup",
                "message": "LDAP lookup intercepted (Log4Shell-style JNDI callback simulation)",
            },
        },
    }

    template = CALLBACK_TEMPLATES.get(callback_type, CALLBACK_TEMPLATES["http"])
    return add_event(
        event_type=template["event_type"],
        payload_type=payload_type,
        details=template["details"],
    )
