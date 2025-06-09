"""
Core configuration settings for Smile Adventure application
Comprehensive environment and security configuration management
"""

from typing import List, Optional, Union
from pydantic_settings import BaseSettings
from pydantic import validator, Field
import os
from pathlib import Path


class Settings(BaseSettings):
    """
    Application settings configuration with comprehensive environment management
    Handles JWT configuration, database settings, and security parameters
    """
    
    # =============================================================================
    # APPLICATION CONFIGURATION
    # =============================================================================
    APP_NAME: str = Field(default="Smile Adventure", description="Application name")
    APP_VERSION: str = Field(default="1.0.0", description="Application version")
    APP_DESCRIPTION: str = Field(
        default="Healthcare gamification platform for children's medical care tracking",
        description="Application description"
    )
    DEBUG: bool = Field(default=False, description="Debug mode flag")
    ENVIRONMENT: str = Field(default="development", description="Environment: development, staging, production")
    
    # =============================================================================
    # DATABASE CONFIGURATION
    # =============================================================================
    DATABASE_URL: str = Field(
        default="postgresql://user:password@localhost:5432/smile_adventure",
        description="PostgreSQL database connection URL - MUST be configured via environment variables"
    )
    DATABASE_POOL_SIZE: int = Field(default=10, description="Database connection pool size")
    DATABASE_MAX_OVERFLOW: int = Field(default=20, description="Database max overflow connections")
    DATABASE_POOL_TIMEOUT: int = Field(default=30, description="Database pool timeout in seconds")
    DATABASE_POOL_RECYCLE: int = Field(default=3600, description="Database pool recycle time in seconds")
    
    # =============================================================================
    # JWT SECURITY CONFIGURATION
    # =============================================================================
    SECRET_KEY: str = Field(
        default="your-super-secret-key-change-this-in-production-please-use-strong-key",
        description="JWT secret key for token signing"
    )
    ALGORITHM: str = Field(default="HS256", description="JWT algorithm")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, description="Access token expiration in minutes")
    REFRESH_TOKEN_EXPIRE_MINUTES: int = Field(default=10080, description="Refresh token expiration in minutes (7 days)")
    
    # Password policy
    PASSWORD_MIN_LENGTH: int = Field(default=8, description="Minimum password length")
    PASSWORD_REQUIRE_UPPERCASE: bool = Field(default=True, description="Require uppercase in password")
    PASSWORD_REQUIRE_LOWERCASE: bool = Field(default=True, description="Require lowercase in password")
    PASSWORD_REQUIRE_NUMBERS: bool = Field(default=True, description="Require numbers in password")
    PASSWORD_REQUIRE_SPECIAL: bool = Field(default=False, description="Require special characters in password")
    
    # =============================================================================
    # CORS AND SECURITY
    # =============================================================================
    ALLOWED_HOSTS: List[str] = Field(
        default=[
            "http://localhost:3000",
            "http://localhost:8000", 
            "http://127.0.0.1:3000",
            "http://127.0.0.1:8000"
        ],
        description="Allowed CORS origins"
    )
    ALLOWED_METHODS: List[str] = Field(
        default=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        description="Allowed HTTP methods"
    )
    ALLOWED_HEADERS: List[str] = Field(
        default=["*"],
        description="Allowed HTTP headers"
    )
    ALLOW_CREDENTIALS: bool = Field(default=True, description="Allow credentials in CORS")
    
    # =============================================================================
    # API CONFIGURATION
    # =============================================================================
    API_V1_PREFIX: str = Field(default="/api/v1", description="API v1 prefix")
    API_RATE_LIMIT: int = Field(default=100, description="API rate limit per minute")
    API_TIMEOUT: int = Field(default=30, description="API timeout in seconds")
    
    # =============================================================================
    # LOGGING CONFIGURATION
    # =============================================================================
    LOG_LEVEL: str = Field(default="INFO", description="Logging level")
    LOG_FORMAT: str = Field(
        default="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        description="Log format"
    )
    LOG_FILE: Optional[str] = Field(default=None, description="Log file path")
    
    # =============================================================================
    # EXTERNAL SERVICES
    # =============================================================================
    # Email configuration (for future notifications)
    SMTP_SERVER: Optional[str] = Field(default=None, description="SMTP server")
    SMTP_PORT: int = Field(default=587, description="SMTP port")
    SMTP_USERNAME: Optional[str] = Field(default=None, description="SMTP username")
    SMTP_PASSWORD: Optional[str] = Field(default=None, description="SMTP password")
    SMTP_USE_TLS: bool = Field(default=True, description="Use TLS for SMTP")
    
    # Redis configuration (for future caching/sessions)
    REDIS_URL: Optional[str] = Field(default=None, description="Redis connection URL")
    
    # External APIs
    OPENAI_API_KEY: Optional[str] = Field(default=None, description="OpenAI API key")
    
    # =============================================================================
    # GAMIFICATION SETTINGS
    # =============================================================================
    POINTS_PER_ACTIVITY: int = Field(default=10, description="Default points per activity")
    LEVEL_UP_THRESHOLD: int = Field(default=100, description="Points needed to level up")
    MAX_LEVEL: int = Field(default=50, description="Maximum level achievable")
      # =============================================================================
    # FILE UPLOAD CONFIGURATION
    # =============================================================================
    MAX_FILE_SIZE: int = Field(default=5 * 1024 * 1024, description="Max file size in bytes (5MB)")
    UPLOAD_FOLDER: str = Field(default="uploads", description="Upload folder path")
    ALLOWED_FILE_EXTENSIONS: List[str] = Field(
        default=["jpg", "jpeg", "png", "gif", "pdf"],
        description="Allowed file extensions"
    )
    
    # =============================================================================
    # TASK 14 PROFILE ENHANCEMENT CONFIGURATION
    # =============================================================================
    # Avatar upload settings
    AVATAR_MAX_SIZE: int = Field(default=2 * 1024 * 1024, description="Max avatar size in bytes (2MB)")
    AVATAR_ALLOWED_TYPES: List[str] = Field(
        default=["jpg", "jpeg", "png", "gif"],
        description="Allowed avatar file types"
    )
    AVATAR_UPLOAD_PATH: str = Field(default="uploads/avatars", description="Avatar upload directory")
    
    # Profile completion settings
    PROFILE_COMPLETION_REQUIRED_FIELDS: List[str] = Field(
        default=["first_name", "last_name", "email", "phone_number"],
        description="Required fields for profile completion"
    )
    PROFILE_COMPLETION_OPTIONAL_FIELDS: List[str] = Field(
        default=["bio", "location", "avatar", "emergency_contact_name", "emergency_contact_phone"],
        description="Optional fields that contribute to profile completion"
    )
    
    # Professional search settings
    PROFESSIONAL_SEARCH_RADIUS: int = Field(default=25, description="Default search radius in miles")
    PROFESSIONAL_SEARCH_LIMIT: int = Field(default=50, description="Maximum search results")
    
    # Admin settings
    ADMIN_USER_MANAGEMENT_PAGE_SIZE: int = Field(default=20, description="Admin user list page size")
    
    # User preferences defaults
    DEFAULT_LANGUAGE: str = Field(default="en", description="Default user language")
    DEFAULT_TIMEZONE: str = Field(default="UTC", description="Default user timezone")
    DEFAULT_THEME: str = Field(default="light", description="Default UI theme")
    DEFAULT_PRIVACY_LEVEL: str = Field(default="standard", description="Default privacy level")
    
    # =============================================================================
    # VALIDATORS
    # =============================================================================
    @validator("ALLOWED_HOSTS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        """Parse CORS origins from string or list"""
        if isinstance(v, str):
            return [i.strip() for i in v.split(",")]
        return v
    
    @validator("ALLOWED_METHODS", pre=True)
    def assemble_allowed_methods(cls, v: Union[str, List[str]]) -> List[str]:
        """Parse allowed methods from string or list"""
        if isinstance(v, str):
            return [i.strip().upper() for i in v.split(",")]
        return v
    
    @validator("SECRET_KEY")
    def validate_secret_key(cls, v: str) -> str:
        """Validate secret key strength"""
        if len(v) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long")
        return v
    
    @validator("DATABASE_URL")
    def validate_database_url(cls, v: str) -> str:
        """Validate database URL format"""
        if not v.startswith(("postgresql://", "postgresql+psycopg2://")):
            raise ValueError("DATABASE_URL must be a PostgreSQL URL")
        return v
    
    @validator("ENVIRONMENT")
    def validate_environment(cls, v: str) -> str:
        """Validate environment value"""
        allowed_envs = ["development", "staging", "production", "testing"]
        if v.lower() not in allowed_envs:
            raise ValueError(f"ENVIRONMENT must be one of: {', '.join(allowed_envs)}")
        return v.lower()
    
    # =============================================================================
    # COMPUTED PROPERTIES
    # =============================================================================
    @property
    def is_development(self) -> bool:
        """Check if running in development mode"""
        return self.ENVIRONMENT == "development"
    
    @property
    def is_production(self) -> bool:
        """Check if running in production mode"""
        return self.ENVIRONMENT == "production"
    
    @property
    def is_testing(self) -> bool:
        """Check if running in testing mode"""
        return self.ENVIRONMENT == "testing"
    
    @property
    def database_config(self) -> dict:
        """Get database configuration dictionary"""
        return {
            "pool_size": self.DATABASE_POOL_SIZE,
            "max_overflow": self.DATABASE_MAX_OVERFLOW,
            "pool_timeout": self.DATABASE_POOL_TIMEOUT,
            "pool_recycle": self.DATABASE_POOL_RECYCLE,        "pool_pre_ping": True,
            "echo": self.DEBUG,
        }
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        validate_assignment = True


# Global settings instance
settings = Settings()
