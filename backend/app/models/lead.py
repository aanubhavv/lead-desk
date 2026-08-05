"""
Pydantic models for Lead documents.

Separate schemas for: creation (request), response, status update, and DB storage.
"""

from datetime import datetime, timezone
from enum import Enum
from typing import Annotated

from bson import ObjectId
from pydantic import BaseModel, EmailStr, Field, field_validator


# --- Constants ---

class BudgetRange(str, Enum):
    """Allowed budget range values — whitelist enforced on submission."""
    UNDER_1K = "Under $1,000"
    ONE_TO_FIVE_K = "$1,000 – $5,000"
    FIVE_TO_TEN_K = "$5,000 – $10,000"
    TEN_TO_TWENTYFIVE_K = "$10,000 – $25,000"
    OVER_25K = "$25,000+"


class LeadStatus(str, Enum):
    """Allowed lead status values."""
    NEW = "New"
    CONTACTED = "Contacted"
    CLOSED = "Closed"


# --- Request schemas ---

class LeadCreate(BaseModel):
    """Schema for the public lead-submission endpoint."""
    name: Annotated[str, Field(min_length=2, max_length=100, description="Full name")]
    email: EmailStr
    budget_range: BudgetRange
    message: Annotated[str, Field(min_length=10, max_length=2000, description="Project details")]

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Name must not be blank.")
        return stripped

    @field_validator("message")
    @classmethod
    def message_not_blank(cls, v: str) -> str:
        stripped = v.strip()
        if len(stripped) < 10:
            raise ValueError("Message must be at least 10 characters after trimming whitespace.")
        return stripped


class LeadStatusUpdate(BaseModel):
    """Schema for the admin status-update endpoint."""
    status: LeadStatus


# --- Response schemas ---

class LeadResponse(BaseModel):
    """Schema returned to clients for a single lead."""
    id: str
    name: str
    email: str
    budget_range: str
    message: str
    status: str
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_mongo(cls, doc: dict) -> "LeadResponse":
        """Convert a raw MongoDB document into a response model."""
        return cls(
            id=str(doc["_id"]),
            name=doc["name"],
            email=doc["email"],
            budget_range=doc["budget_range"],
            message=doc["message"],
            status=doc["status"],
            created_at=doc["created_at"],
            updated_at=doc["updated_at"],
        )


class LeadListResponse(BaseModel):
    """Paginated list response for leads."""
    leads: list[LeadResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
