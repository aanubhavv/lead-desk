"""
FastAPI dependency for authenticating admin requests.

Extracts the JWT from the Authorization header, validates it,
checks the blacklist, and resolves the admin user from MongoDB.
"""

from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.exceptions import UnauthorizedException
from app.services.auth_service import decode_token, is_token_blacklisted, get_user_by_username

from jose import JWTError

# FastAPI security scheme — auto-documents the Bearer token in OpenAPI/Swagger
_bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
) -> dict:
    """
    Dependency that enforces admin authentication.

    Validates the JWT access token, checks if it's blacklisted,
    and returns the full admin user document from MongoDB.
    Raises 401 on any failure.
    """
    if credentials is None:
        raise UnauthorizedException("Authorization header missing.")

    token = credentials.credentials

    # Decode & verify
    try:
        payload = decode_token(token)
    except JWTError:
        raise UnauthorizedException("Invalid or expired token.")

    # Must be an access token
    if payload.get("type") != "access":
        raise UnauthorizedException("Invalid token type.")

    # Check blacklist
    jti = payload.get("jti")
    if jti and await is_token_blacklisted(jti):
        raise UnauthorizedException("Token has been revoked.")

    # Resolve user
    username = payload.get("sub")
    if not username:
        raise UnauthorizedException("Invalid token payload.")

    user = await get_user_by_username(username)
    if user is None:
        raise UnauthorizedException("User no longer exists.")

    return user
