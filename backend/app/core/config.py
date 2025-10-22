"""
Application Configuration
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment"""
    
    # Database
    DATABASE_URL: str = "sqlite:///./sungazer.db"
    
    # API
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_RELOAD: bool = True
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    # Enphase OAuth Configuration
    ENPHASE_DEV_API_KEY: str = ""  # Application API Key (goes in 'key' header)
    ENPHASE_USER_KEY: str = ""  # User Key (goes in query params for partner apps)
    ENPHASE_CLIENT_ID: str = ""  # OAuth Client ID
    ENPHASE_CLIENT_SECRET: str = ""  # OAuth Client Secret
    ENPHASE_AUTHORIZATION_URL: str = "https://api.enphaseenergy.com/oauth/authorize"
    ENPHASE_TOKEN_URL: str = "https://api.enphaseenergy.com/oauth/token"
    ENPHASE_REDIRECT_URI: str = "http://localhost:8000/api/auth/enphase/callback"
    ENPHASE_BASE_URL: str = "https://api.enphaseenergy.com/api/v4"
    # Legacy for backwards compatibility
    ENPHASE_API_KEY: str = ""
    
    # SolarEdge
    SOLAREDGE_API_KEY: str = ""
    SOLAREDGE_BASE_URL: str = "https://monitoringapi.solaredge.com"
    SOLAREDGE_DAILY_LIMIT: int = 300
    SOLAREDGE_CONCURRENT_LIMIT: int = 3
    
    # Polling - Default values (can be overridden in Settings UI)
    DASHBOARD_TTL_MINUTES: int = 45
    SITE_TTL_MINUTES: int = 15
    POLL_INTERVAL_MINUTES: int = 15
    MAX_REPOLLS: int = 3
    INACTIVITY_TIMEOUT_MINUTES: int = 5
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

