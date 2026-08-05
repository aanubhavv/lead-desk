"""
FastAPI application entry point.

Configures the app with:
- MongoDB lifespan (connect on startup, close on shutdown)
- CORS middleware for the Next.js frontend
- Auth and Leads routers
- Global exception handlers
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import lifespan
from app.exceptions import register_exception_handlers
from app.routers.auth import router as auth_router
from app.routers.leads import router as leads_router

app = FastAPI(
    title="LeadDesk API",
    description="Lead capture and management backend",
    version="1.0.0",
    lifespan=lifespan,
)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ---
app.include_router(auth_router)
app.include_router(leads_router)

# --- Exception handlers ---
register_exception_handlers(app)


@app.get("/", tags=["Health"])
async def health():
    """Health check endpoint."""
    return {"status": "ok", "service": "LeadDesk API"}
