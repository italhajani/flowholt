"""
Knowledge Base router — CRUD for knowledge bases, documents, and search.
"""
from __future__ import annotations

from typing import Any

from .._router_imports import *  # noqa: F401,F403

from ..models import (
    KnowledgeBaseCreate,
    KnowledgeBaseSummary,
    KnowledgeBaseUpdate,
    KnowledgeDocumentOut,
    KnowledgeSearchRequest,
    KnowledgeSearchResult,
)
from ..repository import (
    add_knowledge_document,
    create_knowledge_base,
    delete_knowledge_base,
    delete_knowledge_document,
    get_knowledge_base,
    list_knowledge_bases,
    list_knowledge_documents,
    search_knowledge_chunks,
    update_knowledge_base,
)

router = APIRouter()


# ── Knowledge Base CRUD ──

@router.get("/knowledge", response_model=list[KnowledgeBaseSummary])
async def api_list_knowledge_bases(
    session: dict[str, Any] = Depends(get_session_context),
):
    workspace_id = str(session["workspace"]["id"])
    rows = list_knowledge_bases(workspace_id)
    return rows


@router.post("/knowledge", response_model=KnowledgeBaseSummary, status_code=201)
async def api_create_knowledge_base(
    body: KnowledgeBaseCreate,
    session: dict[str, Any] = Depends(get_session_context),
):
    workspace_id = str(session["workspace"]["id"])
    row = create_knowledge_base(
        workspace_id,
        name=body.name,
        description=body.description,
        embedding_model=body.embedding_model,
        chunk_size=body.chunk_size,
        chunk_overlap=body.chunk_overlap,
    )
    return row


@router.get("/knowledge/{kb_id}", response_model=KnowledgeBaseSummary)
async def api_get_knowledge_base(kb_id: str):
    row = get_knowledge_base(kb_id)
    if not row:
        raise HTTPException(status_code=404, detail="Knowledge base not found")
    return row


@router.put("/knowledge/{kb_id}", response_model=KnowledgeBaseSummary)
async def api_update_knowledge_base(kb_id: str, body: KnowledgeBaseUpdate):
    updates = body.model_dump(exclude_unset=True)
    row = update_knowledge_base(kb_id, **updates)
    if not row:
        raise HTTPException(status_code=404, detail="Knowledge base not found")
    return row


@router.delete("/knowledge/{kb_id}", status_code=204)
async def api_delete_knowledge_base(kb_id: str):
    if not delete_knowledge_base(kb_id):
        raise HTTPException(status_code=404, detail="Knowledge base not found")


# ── Documents ──

@router.get("/knowledge/{kb_id}/documents", response_model=list[KnowledgeDocumentOut])
async def api_list_documents(kb_id: str):
    return list_knowledge_documents(kb_id)


@router.post("/knowledge/{kb_id}/documents", response_model=KnowledgeDocumentOut, status_code=201)
async def api_upload_document(kb_id: str, filename: str = "untitled.txt", content: str = ""):
    """Upload text content as a knowledge document. Chunks are created automatically."""
    if not get_knowledge_base(kb_id):
        raise HTTPException(status_code=404, detail="Knowledge base not found")
    return add_knowledge_document(kb_id, filename=filename, content=content)


@router.delete("/knowledge/documents/{doc_id}", status_code=204)
async def api_delete_document(doc_id: str):
    if not delete_knowledge_document(doc_id):
        raise HTTPException(status_code=404, detail="Document not found")


# ── Search ──

@router.post("/knowledge/{kb_id}/search", response_model=list[KnowledgeSearchResult])
async def api_search_knowledge(kb_id: str, body: KnowledgeSearchRequest):
    if not get_knowledge_base(kb_id):
        raise HTTPException(status_code=404, detail="Knowledge base not found")
    return search_knowledge_chunks(kb_id, body.query, top_k=body.top_k)
