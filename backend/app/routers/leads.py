"""
Leads router — public submission + admin management endpoints.
"""

from fastapi import APIRouter, Depends, Query
from typing import Annotated

from app.dependencies import get_current_admin
from app.models.lead import LeadCreate, LeadResponse, LeadListResponse, LeadStatusUpdate
from app.services.lead_service import create_lead, get_lead_by_id, list_leads, update_lead_status

router = APIRouter(prefix="/leads", tags=["Leads"])


# --- Public endpoint ---

@router.post("", response_model=LeadResponse, status_code=201)
async def submit_lead(body: LeadCreate):
    """
    Submit a new lead (public — no auth required).

    Validates all fields server-side and stores the lead in MongoDB.
    """
    return await create_lead(body)


# --- Admin-protected endpoints ---

@router.get("", response_model=LeadListResponse)
async def get_leads(
    _admin: dict = Depends(get_current_admin),
    search: Annotated[str | None, Query(description="Search name, email, or message")] = None,
    page: Annotated[int, Query(ge=1, description="Page number")] = 1,
    page_size: Annotated[int, Query(ge=1, le=100, description="Results per page")] = 20,
    sort_by: Annotated[str, Query(description="Field to sort by")] = "created_at",
    sort_order: Annotated[str, Query(pattern="^(asc|desc)$", description="asc or desc")] = "desc",
):
    """
    List all leads with search, pagination, and sorting (admin only).
    """
    return await list_leads(
        search=search,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(lead_id: str, _admin: dict = Depends(get_current_admin)):
    """
    Get a single lead by ID (admin only).
    """
    return await get_lead_by_id(lead_id)


@router.patch("/{lead_id}", response_model=LeadResponse)
async def patch_lead_status(
    lead_id: str,
    body: LeadStatusUpdate,
    _admin: dict = Depends(get_current_admin),
):
    """
    Update a lead's status (admin only).

    Status must be one of: New, Contacted, Closed.
    """
    return await update_lead_status(lead_id, body.status)
