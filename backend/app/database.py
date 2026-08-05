"""
MongoDB connection management using Motor (async driver).

Exposes the database instance and manages connection lifecycle
through FastAPI's lifespan context manager.
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from fastapi import FastAPI

from app.config import settings

# Module-level references — set during lifespan
_client: AsyncIOMotorClient | None = None
_database: AsyncIOMotorDatabase | None = None


def get_database() -> AsyncIOMotorDatabase:
    """Return the active database instance. Raises if called before startup."""
    if _database is None:
        raise RuntimeError("Database not initialised — app lifespan has not started.")
    return _database


async def _create_indexes(db: AsyncIOMotorDatabase) -> None:
    """Create required indexes on first startup."""
    # Leads: index on email and created_at for queries + sorting
    await db.leads.create_index("email")
    await db.leads.create_index([("created_at", -1)])

    # Admin users: unique username
    await db.users.create_index("username", unique=True)

    # Token blacklist: unique jti + TTL auto-expiry
    await db.token_blacklist.create_index("jti", unique=True)
    await db.token_blacklist.create_index("expires_at", expireAfterSeconds=0)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Manage MongoDB connection lifecycle."""
    global _client, _database

    # Startup
    _client = AsyncIOMotorClient(settings.mongodb_uri)
    _database = _client[settings.mongodb_db_name]

    # Verify the connection
    await _client.admin.command("ping")
    print(f"✓ Connected to MongoDB — database: {settings.mongodb_db_name}")

    await _create_indexes(_database)
    print("✓ Database indexes ensured")

    yield

    # Shutdown
    if _client is not None:
        _client.close()
        print("✓ MongoDB connection closed")
    _client = None
    _database = None
