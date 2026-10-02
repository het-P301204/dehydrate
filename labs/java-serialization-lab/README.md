# DEHYDRATE — Java Serialization Lab

**LAB USE ONLY — Authorized Security Research Environment**

Python-based simulation of Java serialization vulnerability concepts.
Covers CommonsCollections, Spring, WildFly, and WebLogic gadget chains.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/analyze` | Analyze Java serialized payload for gadget chains |
| GET | `/gadget-chains` | List all known gadget chains |
| POST | `/gadget-chains/simulate` | Simulate ysoserial-style payload structure |
| POST | `/scan` | Alias for `/analyze` used by backend |
| GET | `/detection-patterns` | YARA/Suricata pattern templates |

## Gadget Chains Covered

- CommonsCollections 1, 2, 6 (CVE-2015-4852)
- Spring Framework (CVE-2016-1000027)
- WildFly JMS (CVE-2017-12149)
- Oracle WebLogic (CVE-2019-2725)

## Running Locally

```bash
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8080 --reload
```
