"""
Auth router — login, logout, refresh, and current-user endpoints.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Request
from jose import JWTError

from app.dependencies import get_current_admin
from app.exceptions import UnauthorizedException
from app.models.user import LoginRequest, RefreshRequest, TokenResponse, UserResponse
from app.services.auth_service import (
    verify_password,
    get_user_by_username,
    create_access_token,
    create_refresh_token,
    decode_token,
    blacklist_token,
    is_token_blacklisted,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    """
    Authenticate with username + password. Returns access and refresh tokens.
    """
    user = await get_user_by_username(body.username)
    if user is None or not verify_password(body.password, user["hashed_password"]):
        raise UnauthorizedException("Invalid username or password.")

    access_token, _ = create_access_token(subject=user["username"])
    refresh_token, _ = create_refresh_token(subject=user["username"])

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshRequest):
    """
    Exchange a valid refresh token for a new access + refresh token pair.

    The old refresh token is blacklisted (rotation).
    """
    try:
        payload = decode_token(body.refresh_token)
    except JWTError:
        raise UnauthorizedException("Invalid or expired refresh token.")

    if payload.get("type") != "refresh":
        raise UnauthorizedException("Invalid token type.")

    jti = payload.get("jti")
    if jti and await is_token_blacklisted(jti):
        raise UnauthorizedException("Refresh token has been revoked.")

    username = payload.get("sub")
    if not username:
        raise UnauthorizedException("Invalid token payload.")

    # Verify user still exists
    user = await get_user_by_username(username)
    if user is None:
        raise UnauthorizedException("User no longer exists.")

    # Blacklist the old refresh token to prevent reuse
    if jti:
        exp = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        await blacklist_token(jti, exp)

    # Issue new pair
    access_token, _ = create_access_token(subject=username)
    refresh_token, _ = create_refresh_token(subject=username)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.post("/logout", status_code=204)
async def logout(request: Request, _admin: dict = Depends(get_current_admin)):
    """
    Logout — blacklist the current access token so it cannot be reused.
    """
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "").strip()

    try:
        payload = decode_token(token)
        jti = payload.get("jti")
        if jti:
            exp = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
            await blacklist_token(jti, exp)
    except JWTError:
        pass  # Token already invalid — nothing to blacklist

    return None


@router.get("/me", response_model=UserResponse)
async def me(admin: dict = Depends(get_current_admin)):
    """Return the currently authenticated admin user's info."""
    return UserResponse.from_mongo(admin)
