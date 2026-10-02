from pydantic import BaseModel
from typing import List, Optional


class GadgetNode(BaseModel):
    id: str
    label: str
    type: str  # input|deserializer|gadget|transform|execution
    class_name: str
    package: str
    description: str
    security_significance: str
    mitigation: str


class GadgetEdge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None
    animated: bool = True


class GadgetChain(BaseModel):
    id: str
    name: str
    language: str
    severity: str
    affected_library: str
    description: str
    cve: Optional[str] = None
    nodes: List[GadgetNode]
    edges: List[GadgetEdge]
    attack_vector: str = ""
    remediation: str = ""
    references: List[str] = []
