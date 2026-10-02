from pydantic import BaseModel
from enum import Enum
from typing import Optional


class SerializationFormat(str, Enum):
    PICKLE = "pickle"
    JAVA = "java"
    DOTNET_VIEWSTATE = "dotnet_viewstate"
    ML_CONTAINER = "ml_container"


class DemoType(str, Enum):
    PROOF_OF_EXECUTION = "proof_of_execution"
    LOCAL_FILE_MARKER = "local_file_marker"
    LOCAL_CALLBACK = "local_callback"
    ENV_INFO = "env_info"
    SYNTHETIC = "synthetic"


class PayloadSimulateRequest(BaseModel):
    format: SerializationFormat
    demo_type: DemoType
    encoding: str = "base64"


class PayloadSimulateResponse(BaseModel):
    format: SerializationFormat
    demo_type: DemoType
    raw_representation: str
    base64_encoded: str
    hex_encoded: str
    decoded_structure: dict
    metadata: dict
    safety_classification: str = "LAB_SAFE_DEMONSTRATION"
    warning: str = "This is a controlled lab demonstration payload. Not for use outside authorized environments."


class ObjectInspectRequest(BaseModel):
    data: str
    format: str  # pickle | java | viewstate | ml
    encoding: str = "base64"  # raw | base64 | hex


class ObjectInspectResponse(BaseModel):
    format: str
    encoding_detected: str
    object_graph: dict
    suspicious_operations: list
    risk_score: int  # 0-100
    risk_level: str
    format_metadata: dict
    warnings: list[str]
    safety_note: str = "Analysis performed without code execution."
