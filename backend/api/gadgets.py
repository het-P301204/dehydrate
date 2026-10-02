"""
Gadget Chains API — browse and inspect deserialization gadget chain library.
"""
from fastapi import APIRouter, HTTPException

from engine.gadget_library import (
    get_all_gadgets,
    get_gadget_by_id,
    get_gadgets_by_language,
    get_available_languages,
    get_gadgets_summary,
)

router = APIRouter()


@router.get("", summary="List all gadget chains")
async def list_gadgets(language: str = None, severity: str = None) -> dict:
    """
    List all gadget chains.
    Optional filters: language, severity.
    """
    if language:
        gadgets = get_gadgets_by_language(language)
    else:
        gadgets = get_all_gadgets()

    if severity:
        gadgets = [g for g in gadgets if g.severity.lower() == severity.lower()]

    return {
        "gadgets": [g.model_dump() for g in gadgets],
        "total": len(gadgets),
    }


@router.get("/summary", summary="List gadget chains (summary only, no node/edge data)")
async def list_gadgets_summary(language: str = None) -> dict:
    """Return lightweight gadget chain list without full node/edge data."""
    summaries = get_gadgets_summary()
    if language:
        lang = language.lower()
        summaries = [s for s in summaries if s["language"].lower() == lang]
    return {"gadgets": summaries, "total": len(summaries)}


@router.get("/languages", summary="List available languages")
async def list_languages() -> dict:
    """Return all languages represented in the gadget library."""
    langs = get_available_languages()
    return {"languages": langs}


@router.get("/{gadget_id}", summary="Get specific gadget chain")
async def get_gadget(gadget_id: str) -> dict:
    """Return full gadget chain detail including nodes and edges."""
    gadget = get_gadget_by_id(gadget_id)
    if gadget is None:
        raise HTTPException(status_code=404, detail=f"Gadget chain '{gadget_id}' not found")
    return gadget.model_dump()
