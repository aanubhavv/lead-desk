"""
Application settings loaded from environment variables.

Uses pydantic-settings to validate and parse .env values at startup.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration — all values come from env vars / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # MongoDB
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "leaddesk"

    # JWT
    jwt_secret_key: str = "change-me"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7
    jwt_algorithm: str = "HS256"

    # CORS — comma-separated list of allowed origins
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origin_list(self) -> list[str]:
        """Parse comma-separated CORS_ORIGINS into a list."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


# Singleton instance used throughout the app
settings = Settings()
