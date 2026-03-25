from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "FlowHolt Engine"
    app_env: str = "development"
    app_port: int = 8000
    supabase_url: str = ""
    supabase_secret_key: str = ""
    supabase_service_role_key: str = ""
    groq_api_key: str = ""
    huggingface_api_key: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
