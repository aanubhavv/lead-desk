"""
Authentication service — password hashing, JWT creation/verification, token blacklisting.
"""

import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt

from app.config import settings
from app.database import get_database

# --- Password hashing (bcrypt directly — passlib has compat issues with bcrypt>=4.1) ---


def hash_password(plain: str) -> str:
    """Hash a plaintext password with bcrypt."""
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plaintext password against its bcrypt hash."""
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


# --- JWT token operations ---

def create_access_token(subject: str) -> tuple[str, str]:
    """
    Create a short-lived access token.

    Returns (token_string, jti).
    """
    jti = str(uuid.uuid4())
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.jwt_access_token_expire_minutes
    )
    payload = {
        "sub": subject,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "jti": jti,
        "type": "access",
    }
    token = jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return token, jti


def create_refresh_token(subject: str) -> tuple[str, str]:
    """
    Create a longer-lived refresh token.

    Returns (token_string, jti).
    """
    jti = str(uuid.uuid4())
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.jwt_refresh_token_expire_days
    )
    payload = {
        "sub": subject,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "jti": jti,
        "type": "refresh",
    }
    token = jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return token, jti


def decode_token(token: str) -> dict:
    """
    Decode and verify a JWT. Raises JWTError on invalid/expired tokens.

    Returns the full payload dict.
    """
    return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])


# --- Token blacklisting ---

async def blacklist_token(jti: str, expires_at: datetime) -> None:
    """Add a token's JTI to the blacklist. The TTL index will auto-remove it after expiry."""
    db = get_database()
    await db.token_blacklist.update_one(
        {"jti": jti},
        {"$set": {"jti": jti, "expires_at": expires_at}},
        upsert=True,
    )


async def is_token_blacklisted(jti: str) -> bool:
    """Check if a token has been revoked."""
    db = get_database()
    doc = await db.token_blacklist.find_one({"jti": jti})
    return doc is not None


# --- User lookup ---

async def get_user_by_username(username: str) -> dict | None:
    """Fetch an admin user document by username."""
    db = get_database()
    return await db.users.find_one({"username": username})
