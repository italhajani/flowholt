from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "FlowHolt Backend"
    app_env: str = "development"
    api_prefix: str = "/api"
    database_url: str = ""
    database_path: str = str(Path(__file__).resolve().parents[1] / "flowholt.db")
    cors_origin: str = "http://localhost:5173"
    llm_mode: str = "mock"
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.1:8b"
    session_secret: str = "flowholt-local-dev-secret"
    session_ttl_hours: int = 168
    allow_dev_login: bool = True
    public_base_url: str = ""
    scheduler_secret: str = ""
    webhook_signature_tolerance_seconds: int = 300
    execution_mode: str = "sync"
    worker_lease_seconds: int = 60
    execution_artifact_retention_days: int = 14
    supabase_url: str = ""
    supabase_jwt_secret: str = ""
    supabase_expected_audience: str = "authenticated"
    supabase_jwks_cache_ttl_seconds: int = 600

    model_config = SettingsConfigDict(
        env_file=(str(Path(__file__).resolve().parents[1] / ".env"), ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
