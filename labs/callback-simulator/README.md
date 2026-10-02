# DEHYDRATE — Callback Simulator

**LAB USE ONLY — Authorized Security Research Environment**

Tracks lab execution events and simulates out-of-band callback channels
(DNS, HTTP collaborator, SSRF) used in real deserialization exploits.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check + event count |
| POST | `/callback` | Receive a structured lab event |
| POST | `/ping/{callback_id}` | Lightweight OOB ping receiver |
| GET | `/events` | List captured events (filterable) |
| GET | `/events/{id}` | Retrieve single event |
| DELETE | `/events` | Clear in-memory events |
| GET | `/stats` | Aggregate event statistics |
| GET | `/attack-channels` | Out-of-band channel descriptions |

## Running Locally

```bash
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8080 --reload
```

## Sending a Test Event

```bash
curl -X POST http://localhost:8080/callback \
  -H "Content-Type: application/json" \
  -d '{
    "source_lab": "python-pickle-lab",
    "event_type": "payload_sent",
    "callback_id": "test-001",
    "stage": "pre",
    "data": {"payload_type": "os_system"}
  }'
```
