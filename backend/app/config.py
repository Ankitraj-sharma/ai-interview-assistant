import os
from typing import List

try:
    from pydantic_settings import BaseSettings
    class Settings(BaseSettings):
        SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
        SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
        GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
        GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
        JWT_SECRET: str = os.getenv("JWT_SECRET", "supersecretjwtkeyforinterviewassistant2026")
        JWT_ALGORITHM: str = "HS256"
        ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
        ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
        ALLOWED_ORIGINS: List[str] = [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "*"
        ]
        UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
        VECTOR_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "vector_store")

        class Config:
            env_file = ".env"
            extra = "allow"

    settings = Settings()
except ImportError:
    class FallbackSettings:
        SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
        SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
        GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
        GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
        JWT_SECRET: str = os.getenv("JWT_SECRET", "supersecretjwtkeyforinterviewassistant2026")
        JWT_ALGORITHM: str = "HS256"
        ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
        ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
        ALLOWED_ORIGINS: List[str] = ["*"]
        UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
        VECTOR_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "vector_store")

    settings = FallbackSettings()
