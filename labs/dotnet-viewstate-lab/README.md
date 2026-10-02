# DEHYDRATE — .NET ViewState Lab

**LAB USE ONLY — Authorized Security Research Environment**

Python simulation of .NET ViewState / ObjectStateFormatter deserialization attacks.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/analyze` | Analyze ViewState payload for gadget chains |
| POST | `/forge-mac` | Demo MAC forging with a known MachineKey |
| GET | `/gadget-chains` | List known .NET gadget chains |
| POST | `/gadget-chains/simulate` | Simulate ysoserial.net payload structure |
| GET | `/machinekey-scenarios` | MachineKey exposure attack scenarios |

## Gadget Chains Covered

- ActivitySurrogateSelector (CVE-2017-8759)
- TextFormattingRunProperties
- ObjectDataProvider
- WindowsClaimsIdentity (CVE-2021-26855)
- SessionSecurityTokenHandler (CVE-2020-16952)

## Running Locally

```bash
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 5000 --reload
```
