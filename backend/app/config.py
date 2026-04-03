from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "FlowHolt Backend"
    app_env: str = "development"
    api_prefix: str = "/api"
    database_path: str = str(Path(__file__).resolve().parents[1] / "flowholt.db")
    cors_origin: str = "http://localhost:5173"
    llm_mode: str = "mock"
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.1:8b"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
