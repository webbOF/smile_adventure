"""
Core configuration settings for Smile Adventure application
"""

from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings configuration"""    # Application Configuration
    APP_NAME: str = Field(default="Smile Adventure")
    APP_VERSION: str = Field(default="1.0.0")
    APP_DESCRIPTION: str = Field(default="Smile Adventure - Sensory Learning Platform for Children")
    DEBUG: bool = Field(default=False)
    ENVIRONMENT: str = Field(default="development")
    API_V1_PREFIX: str = Field(default="/api/v1")
    LOG_LEVEL: str = Field(default="INFO")
    LOG_FORMAT: str = Field(default="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    LOG_FILE: str = Field(default="")    # Database Configuration - Optimized for Performance
    DATABASE_URL: str = Field(
        default="postgresql://user:password@localhost:5432/smile_adventure"
    )
    # Connection Pool Settings - Optimized for Task 27 Performance
    DATABASE_POOL_SIZE: int = Field(default=20)  # Increased from 10
    DATABASE_MAX_OVERFLOW: int = Field(default=30)  # Increased from 20  
    DATABASE_POOL_TIMEOUT: int = Field(default=20)  # Reduced from 30 for faster timeouts
    DATABASE_POOL_RECYCLE: int = Field(default=1800)  # Reduced from 3600 (30 min instead of 1 hour)
    DATABASE_POOL_PRE_PING: bool = Field(default=True)  # Enable connection validation
    DATABASE_ECHO: bool = Field(default=False)  # Control SQL logging separately from DEBUG
      # JWT Security Configuration
    SECRET_KEY: str = Field(
        default="your-super-secret-key-change-this-in-production-please-make-it-longer-than-32-chars"
    )
    ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30)
    
    # Development Configuration
    AUTO_VERIFY_EMAIL: bool = Field(default=True)  # Auto-verify emails in development
    REQUIRE_EMAIL_VERIFICATION: bool = Field(default=False)  # Bypass verification for testing
      # CORS Configuration
    ALLOWED_HOSTS: List[str] = Field(
        default=[
            "http://localhost:3000",
            "http://localhost:8000", 
            "http://127.0.0.1:3000",
            "http://127.0.0.1:8000"
        ]
    )
    ALLOW_CREDENTIALS: bool = Field(default=True)
    ALLOWED_METHODS: List[str] = Field(default=["*"])
    ALLOWED_HEADERS: List[str] = Field(default=["*"])
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True
    }


# Global settings instance
settings = Settings()
