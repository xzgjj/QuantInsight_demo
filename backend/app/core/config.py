from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="QI_", extra="ignore")

    app_name: str = "QuantInsight"
    env: str = "local"
    api_v1_prefix: str = "/api/v1"
    database_url: str = Field(
        default="postgresql+asyncpg://quant:quant@localhost:5432/quantinsight"
    )
    redis_url: str = "redis://localhost:6379/0"
    provider_mode: str = "mock"
    disclaimer_required: bool = True


@lru_cache
def get_settings() -> Settings:
    return Settings()
