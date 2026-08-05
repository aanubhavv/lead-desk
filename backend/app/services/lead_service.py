"""
Lead CRUD service — all database operations for leads.
"""

import math
import re
from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId

from app.database import get_database
from app.exceptions import NotFoundException
from app.models.lead import LeadCreate, LeadResponse, LeadListResponse, LeadStatus


async def create_lead(data: LeadCreate) -> LeadResponse:
    """Insert a new lead document and return it."""
    db = get_database()
    now = datetime.now(timezone.utc)

    doc = {
        "name": data.name,
        "email": data.email,
        "budget_range": data.budget_range.value,
        "message": data.message,
        "status": LeadStatus.NEW.value,
        "created_at": now,
        "updated_at": now,
    }

    result = await db.leads.insert_one(doc)
    doc["_id"] = result.inserted_id
    return LeadResponse.from_mongo(doc)


async def get_lead_by_id(lead_id: str) -> LeadResponse:
    """Fetch a single lead by its ObjectId string."""
    db = get_database()

    try:
        oid = ObjectId(lead_id)
    except (InvalidId, Exception):
        raise NotFoundException(f"Lead with id '{lead_id}' not found.")

    doc = await db.leads.find_one({"_id": oid})
    if doc is None:
        raise NotFoundException(f"Lead with id '{lead_id}' not found.")
    return LeadResponse.from_mongo(doc)


async def list_leads(
    search: str | None = None,
    page: int = 1,
    page_size: int = 20,
    sort_by: str = "created_at",
    sort_order: str = "desc",
) -> LeadListResponse:
    """
    List leads with optional search, pagination, and sorting.

    Search matches against name, email, and message (case-insensitive).
    """
    db = get_database()

    # Build query filter
    query: dict = {}
    if search:
        # Escape regex special chars for safety, then do case-insensitive match
        escaped = re.escape(search)
        regex = {"$regex": escaped, "$options": "i"}
        query["$or"] = [
            {"name": regex},
            {"email": regex},
            {"message": regex},
        ]

    # Validate & clamp pagination
    page = max(1, page)
    page_size = max(1, min(page_size, 100))

    # Sorting
    allowed_sort_fields = {"created_at", "updated_at", "name", "email", "status"}
    if sort_by not in allowed_sort_fields:
        sort_by = "created_at"
    sort_direction = -1 if sort_order == "desc" else 1

    # Count total matches
    total = await db.leads.count_documents(query)
    total_pages = math.ceil(total / page_size) if total > 0 else 1

    # Fetch the page
    skip = (page - 1) * page_size
    cursor = db.leads.find(query).sort(sort_by, sort_direction).skip(skip).limit(page_size)
    docs = await cursor.to_list(length=page_size)

    leads = [LeadResponse.from_mongo(doc) for doc in docs]

    return LeadListResponse(
        leads=leads,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


async def update_lead_status(lead_id: str, new_status: LeadStatus) -> LeadResponse:
    """Update only the status field of a lead."""
    db = get_database()

    try:
        oid = ObjectId(lead_id)
    except (InvalidId, Exception):
        raise NotFoundException(f"Lead with id '{lead_id}' not found.")

    now = datetime.now(timezone.utc)
    result = await db.leads.find_one_and_update(
        {"_id": oid},
        {"$set": {"status": new_status.value, "updated_at": now}},
        return_document=True,  # return the updated document
    )

    if result is None:
        raise NotFoundException(f"Lead with id '{lead_id}' not found.")

    return LeadResponse.from_mongo(result)
