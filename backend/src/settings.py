"""
Application Settings Configuration

This module contains all application settings using Pydantic BaseSettings.
Settings are loaded from environment variables and .env files automatically.
"""

from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with environment variable support."""

    # API Configuration
    app_name: str = Field(default="FareShare API", description="Application name")
    app_version: str = Field(default="1.0.0", description="Application version")
    environment: str = Field(
        default="development", description="Environment (development/production)"
    )

    # Server Configuration
    host: str = Field(default="0.0.0.0", description="Server host")
    port: int = Field(default=8000, description="Server port")

    # Database Configuration
    database_url: str = Field(
        default="postgresql://fareshare_user:fareshare_password@localhost:5432/fareshare",
        description="Database connection URL",
    )

    # CORS Configuration
    cors_origins: List[str] = Field(
        default=[
            "http://localhost:5173",
            "http://localhost:3000",
        ],
        description="Allowed CORS origins",
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Create a global settings instance
settings = Settings()
