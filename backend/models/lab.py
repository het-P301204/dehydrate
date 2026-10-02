from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime
from typing import Optional


class LabStatus(str, Enum):
    STOPPED = "stopped"
    STARTING = "starting"
    RUNNING = "running"
    RESETTING = "resetting"
    ERROR = "error"


class LabType(str, Enum):
    PYTHON_PICKLE = "python-pickle"
    JAVA_SERIALIZATION = "java-serialization"
    DOTNET_VIEWSTATE = "dotnet-viewstate"
    ML_MODEL = "ml-model"
    CALLBACK_SIMULATOR = "callback-simulator"


class Lab(BaseModel):
    id: str
    name: str
    type: LabType
    status: LabStatus
    runtime: str
    port: Optional[int] = None
    started_at: Optional[datetime] = None
    container_id: Optional[str] = None
    description: str = ""
    vulnerabilities: list[str] = Field(default_factory=list)


class LabStartRequest(BaseModel):
    lab_type: LabType
    config: dict = Field(default_factory=dict)


class LabStopRequest(BaseModel):
    lab_id: str


class LabResetRequest(BaseModel):
    lab_id: str


class LabResponse(BaseModel):
    success: bool
    lab: Lab
    message: str
