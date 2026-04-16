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
    llm_mode: str = "mock"  # legacy, kept for backwards compat
    llm_provider: str = "auto"  # auto | ollama | gemini | groq | openai | anthropic | deepseek | xai | mock
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.1:8b"
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o"
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-20250514"
    deepseek_api_key: str = ""
    deepseek_model: str = "deepseek-chat"
    xai_api_key: str = ""
    xai_model: str = "grok-3"
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = "noreply@flowholt.local"
    smtp_use_tls: bool = True
    slack_default_webhook_url: str = ""
    session_secret: str = "flowholt-local-dev-secret"
    session_ttl_hours: int = 168
    allow_dev_login: bool = True
    public_base_url: str = ""
    scheduler_secret: str = ""
    webhook_signature_tolerance_seconds: int = 300
    execution_mode: str = "sync"
    worker_lease_seconds: int = 60
    execution_artifact_retention_days: int = 14
    chat_attachment_dir: str = str(Path(__file__).resolve().parents[1] / "storage" / "chat-attachments")
    chat_attachment_max_bytes: int = 5 * 1024 * 1024
    chat_attachment_text_preview_chars: int = 8000
    vault_encryption_key: str = ""
    db_pool_min: int = 2
    db_pool_max: int = 10
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
