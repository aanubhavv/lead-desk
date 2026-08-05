"""
CLI script to seed the first admin user.

Usage (from the backend/ directory):
    python -m scripts.seed_admin

Prompts for username and password interactively.
Password is hashed with bcrypt before storage.
Refuses to create duplicates.
"""

import asyncio
import getpass
import sys

from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone


async def main() -> None:
    # Import here to avoid loading the full app just for the script
    from app.config import settings
    from app.services.auth_service import hash_password

    print("=" * 50)
    print("  LeadDesk — Admin User Setup")
    print("=" * 50)
    print()

    # Prompt for credentials
    username = input("Enter admin username: ").strip()
    if len(username) < 3:
        print("✗ Username must be at least 3 characters.")
        sys.exit(1)

    password = getpass.getpass("Enter admin password: ")
    if len(password) < 6:
        print("✗ Password must be at least 6 characters.")
        sys.exit(1)

    password_confirm = getpass.getpass("Confirm password: ")
    if password != password_confirm:
        print("✗ Passwords do not match.")
        sys.exit(1)

    # Connect to MongoDB
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client[settings.mongodb_db_name]

    # Check for existing user
    existing = await db.users.find_one({"username": username})
    if existing:
        print(f"✗ User '{username}' already exists. Aborting.")
        client.close()
        sys.exit(1)

    # Create the admin user
    hashed = hash_password(password)
    doc = {
        "username": username,
        "hashed_password": hashed,
        "created_at": datetime.now(timezone.utc),
    }
    await db.users.insert_one(doc)

    print()
    print(f"✓ Admin user '{username}' created successfully.")
    print(f"  Database: {settings.mongodb_db_name}")
    print()

    client.close()


if __name__ == "__main__":
    asyncio.run(main())
