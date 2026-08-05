"""
Custom exceptions and global error handlers.

Provides a consistent JSON error format across the entire API.
"""

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


# --- Custom exceptions ---

class AppException(Exception):
    """Base application exception with HTTP status and structured body."""

    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: dict | None = None,
    ):
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(message)


class NotFoundException(AppException):
    def __init__(self, message: str = "Resource not found."):
        super().__init__(message=message, status_code=status.HTTP_404_NOT_FOUND)


class UnauthorizedException(AppException):
    def __init__(self, message: str = "Authentication required."):
        super().__init__(message=message, status_code=status.HTTP_401_UNAUTHORIZED)


class ForbiddenException(AppException):
    def __init__(self, message: str = "Access denied."):
        super().__init__(message=message, status_code=status.HTTP_403_FORBIDDEN)


# --- Error response helpers ---

def _error_body(message: str, details: dict | None = None) -> dict:
    body: dict = {"error": True, "message": message}
    if details:
        body["details"] = details
    return body


# --- Handler registration ---

def register_exception_handlers(app: FastAPI) -> None:
    """Attach global exception handlers to the FastAPI app."""

    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content=_error_body(exc.message, exc.details),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        """Transform Pydantic validation errors into field-level messages."""
        field_errors: dict[str, list[str]] = {}
        for err in exc.errors():
            # Build a dotted field path (e.g. "body.name")
            loc_parts = [str(p) for p in err["loc"] if p != "body"]
            field = ".".join(loc_parts) if loc_parts else "general"
            field_errors.setdefault(field, []).append(err["msg"])

        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=_error_body("Validation failed.", details=field_errors),
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        # Log the real error server-side, return a generic message to the client
        import traceback
        traceback.print_exc()
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=_error_body("An internal server error occurred."),
        )
