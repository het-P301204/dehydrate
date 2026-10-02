# DEHYDRATE — Python Pickle Lab

**LAB USE ONLY — Authorized Security Research Environment**

This container provides a sandboxed Python pickle deserialization research lab for the DEHYDRATE platform.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/analyze` | Disassemble pickle bytes (safe — no execution) |
| POST | `/build-payload` | Generate demo payloads for study |
| POST | `/lab/execute` | Simulated execution analysis |
| GET | `/shadowpickle/variants` | Scanner evasion technique descriptions |

## Running Locally (standalone)

```bash
pip install -r requirements.txt
uvicorn app:app --reload
```

## Security Notes

- Runs on internal Docker network with no internet access
- Dropped all Linux capabilities (`cap_drop: ALL`)
- Runs as UID 1000 (non-root)
- No actual arbitrary code execution on user-supplied payloads
