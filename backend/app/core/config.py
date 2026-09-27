import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "DOGFOOD 2026 API"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres:postgres_password_example@db:5432/dogfood_db"
    )

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
