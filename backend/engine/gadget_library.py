"""
Gadget library — loads gadget chain data from data/gadgets.json.
Provides search, filter, and retrieval functions.
"""
import json
import os
from typing import Optional
from models.gadget import GadgetChain, GadgetNode, GadgetEdge

_GADGETS_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "gadgets.json")

_cache: Optional[list[GadgetChain]] = None


def _load_gadgets() -> list[GadgetChain]:
    global _cache
    if _cache is None:
        with open(_GADGETS_PATH, "r", encoding="utf-8") as f:
            raw = json.load(f)
        _cache = [GadgetChain(**item) for item in raw]
    return _cache


def get_all_gadgets() -> list[GadgetChain]:
    """Return all gadget chains."""
    return _load_gadgets()


def get_gadget_by_id(gadget_id: str) -> Optional[GadgetChain]:
    """Return a gadget chain by ID."""
    for g in _load_gadgets():
        if g.id == gadget_id:
            return g
    return None


def get_gadgets_by_language(language: str) -> list[GadgetChain]:
    """Return gadget chains for a specific language (case-insensitive)."""
    lang = language.lower()
    return [g for g in _load_gadgets() if g.language.lower() == lang]


def get_gadgets_by_severity(severity: str) -> list[GadgetChain]:
    """Return gadget chains matching a severity level."""
    sev = severity.lower()
    return [g for g in _load_gadgets() if g.severity.lower() == sev]


def get_available_languages() -> list[str]:
    """Return deduplicated list of languages from all gadget chains."""
    langs = sorted(set(g.language for g in _load_gadgets()))
    return langs


def get_gadgets_summary() -> list[dict]:
    """Return a lightweight summary of all gadgets (no node/edge data)."""
    return [
        {
            "id": g.id,
            "name": g.name,
            "language": g.language,
            "severity": g.severity,
            "affected_library": g.affected_library,
            "cve": g.cve,
            "node_count": len(g.nodes),
            "description": g.description[:120] + "..." if len(g.description) > 120 else g.description,
        }
        for g in _load_gadgets()
    ]
