"""
Pydantic models for admin User documents and auth payloads.
"""

from datetime import datetime
from pydantic import BaseModel, Field
from typing import Annotated


# --- Request schemas ---

class LoginRequest(BaseModel):
    """Credentials submitted to the login endpoint."""
    username: Annotated[str, Field(min_length=3, max_length=50)]
    password: Annotated[str, Field(min_length=6, max_length=128)]


class RefreshRequest(BaseModel):
    """Payload for the token refresh endpoint."""
    refresh_token: str


# --- Response schemas ---

class TokenResponse(BaseModel):
    """JWT token pair returned on successful login."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """Public representation of an admin user."""
    id: str
    username: str
    created_at: datetime

    @classmethod
    def from_mongo(cls, doc: dict) -> "UserResponse":
        return cls(
            id=str(doc["_id"]),
            username=doc["username"],
            created_at=doc["created_at"],
        )
