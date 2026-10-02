# DEHYDRATE — ML Model Lab

**LAB USE ONLY — Authorized Security Research Environment**

Analyzes ML model files for deserialization risks without executing them.
Covers pickle, PyTorch, SafeTensors, ONNX, Keras HDF5, and Joblib formats.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/analyze` | Upload and analyze model file for risks |
| GET | `/format-comparison` | Compare ML formats by safety characteristics |
| GET | `/attack-scenarios` | ML supply-chain attack scenario descriptions |

## Running Locally

```bash
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

## Testing

```bash
# Analyze a model file
curl -X POST http://localhost:8000/analyze \
  -F "file=@model.pkl"
```
