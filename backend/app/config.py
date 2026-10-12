from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/jobportal"
    SECRET_KEY: str = "ai-job-portal-super-secret-key-2024-change-in-prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    APP_NAME: str = "AI Job Portal"
    DEBUG: bool = True
    FRONTEND_URL: str = "http://localhost:5173"
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 5242880  # 5MB
    ADMIN_EMAIL: str = "admin@jobportal.com"
    ADMIN_PASSWORD: str = "Admin@123"

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()
