"""
Authentication Schemas - Pydantic models for request/response validation
Comprehensive validation rules and serialization for authentication endpoints
Updated for Pydantic v2
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
from enum import Enum
import re

# =============================================================================
# ENUMS FOR API
# =============================================================================

class UserRoleSchema(str, Enum):
    """User role enumeration for API"""
    PARENT = "parent"
    PROFESSIONAL = "professional"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

class UserStatusSchema(str, Enum):
    """User status enumeration for API"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"
    DELETED = "deleted"

# =============================================================================
# BASE SCHEMAS
# =============================================================================

class UserBase(BaseModel):
    """Base user schema with common fields"""
    email: EmailStr = Field(..., description="User email address")
    first_name: str = Field(..., min_length=2, max_length=100, description="First name")
    last_name: str = Field(..., min_length=2, max_length=100, description="Last name")
    phone: Optional[str] = Field(None, description="Phone number (optional)")
    timezone: str = Field(default="UTC", description="User timezone")
    language: str = Field(default="en", max_length=10, description="Preferred language")
    
    @field_validator('first_name', 'last_name')
    @classmethod
    def validate_names(cls, v):
        """Validate name fields"""
        if not v or not v.strip():
            raise ValueError('Name cannot be empty')
        # Allow letters, spaces, hyphens, apostrophes, and dots (for titles like Dr.)
        if not re.match(r"^[a-zA-Z\s\-'.]+$", v.strip()):
            raise ValueError('Name can only contain letters, spaces, hyphens, apostrophes, and dots')
        return v.strip().title()
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        """Validate phone number format"""
        if v:
            # Remove all non-digit characters
            cleaned = re.sub(r'\D', '', v)
            if len(cleaned) < 10:
                raise ValueError('Phone number must be at least 10 digits')
            if len(cleaned) > 15:
                raise ValueError('Phone number cannot exceed 15 digits')
            return cleaned
        return v
    
    @field_validator('timezone')
    @classmethod
    def validate_timezone(cls, v):
        """Validate timezone format"""
        if v and v not in ['UTC', 'EST', 'PST', 'MST', 'CST']:  # Add more as needed
            return 'UTC'  # Default to UTC for unknown timezones
        return v

# =============================================================================
# AUTHENTICATION SCHEMAS
# =============================================================================

class UserLogin(BaseModel):
    """User login request schema"""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=1, description="User password")
    remember_me: bool = Field(default=False, description="Remember login session")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "parent@example.com",
                "password": "SecurePassword123!",
                "remember_me": False
            }
        }
    }

class UserRegister(UserBase):
    """User registration request schema"""
    password: str = Field(..., min_length=8, max_length=128, description="User password")
    password_confirm: str = Field(..., description="Password confirmation")
    role: UserRoleSchema = Field(default=UserRoleSchema.PARENT, description="User role")
    
    # Professional-specific fields (optional for parents)
    license_number: Optional[str] = Field(None, max_length=100, description="Professional license number")
    specialization: Optional[str] = Field(None, max_length=200, description="Medical specialization")
    clinic_name: Optional[str] = Field(None, max_length=200, description="Clinic or practice name")
    clinic_address: Optional[str] = Field(None, description="Clinic address")
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if len(v) > 128:
            raise ValueError('Password cannot exceed 128 characters')
        
        # Check for at least one uppercase, one lowercase, and one digit
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        
        # Check for very common weak passwords only (exact matches)
        weak_passwords = ['password', '123456', 'qwerty', 'abc123', 'password123', '12345678']
        if v.lower() in weak_passwords:
            raise ValueError('Password is too common or weak')
        
        return v
    
    @model_validator(mode='after')
    def validate_passwords_match(self):
        """Validate that passwords match"""
        if self.password and self.password_confirm and self.password != self.password_confirm:
            raise ValueError('Passwords do not match')
        return self
    
    @model_validator(mode='after')
    def validate_professional_fields(self):
        """Validate professional-specific fields"""
        if self.role == UserRoleSchema.PROFESSIONAL:
            if not self.license_number:
                raise ValueError('License number is required for healthcare professionals')
        return self
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "dr.smith@clinic.com",
                "first_name": "John",
                "last_name": "Smith",
                "phone": "1234567890",
                "password": "SecurePassword123!",
                "password_confirm": "SecurePassword123!",
                "role": "professional",
                "license_number": "MD123456",
                "specialization": "Pediatric Dentistry",
                "clinic_name": "SmileCare Pediatric Clinic"
            }
        }
    }

class PasswordChange(BaseModel):
    """Password change request schema"""
    current_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=8, max_length=128, description="New password")
    new_password_confirm: str = Field(..., description="New password confirmation")
    
    @field_validator('new_password')
    @classmethod
    def validate_new_password(cls, v):
        """Validate new password strength (same as registration)"""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if len(v) > 128:
            raise ValueError('Password cannot exceed 128 characters')
        
        # Check for at least one uppercase, one lowercase, and one digit
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        
        # Check for very common weak passwords only (exact matches)
        weak_passwords = ['password', '123456', 'qwerty', 'abc123', 'password123', '12345678']
        if v.lower() in weak_passwords:
            raise ValueError('Password is too common or weak')
        
        return v
    
    @model_validator(mode='after')
    def validate_passwords_match(self):
        """Validate that new passwords match"""
        if self.new_password and self.new_password_confirm and self.new_password != self.new_password_confirm:
            raise ValueError('New passwords do not match')
        return self

class PasswordReset(BaseModel):
    """Password reset request schema"""
    email: EmailStr = Field(..., description="Email address for password reset")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "user@example.com"
            }
        }
    }

class PasswordResetConfirm(BaseModel):
    """Password reset confirmation schema"""
    token: str = Field(..., description="Password reset token")
    new_password: str = Field(..., min_length=8, max_length=128, description="New password")
    new_password_confirm: str = Field(..., description="New password confirmation")
    
    @field_validator('new_password')
    @classmethod
    def validate_new_password(cls, v):
        """Validate new password strength"""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        
        # Check for very common weak passwords only (exact matches)
        weak_passwords = ['password', '123456', 'qwerty', 'abc123', 'password123', '12345678']
        if v.lower() in weak_passwords:
            raise ValueError('Password is too common or weak')
            
        return v
    
    @model_validator(mode='after')
    def validate_passwords_match(self):
        """Validate that passwords match"""
        if self.new_password and self.new_password_confirm and self.new_password != self.new_password_confirm:
            raise ValueError('Passwords do not match')
        return self

# =============================================================================
# TOKEN SCHEMAS
# =============================================================================

class Token(BaseModel):
    """JWT token response schema"""
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration time in seconds")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_in": 1800
            }
        }
    }

class TokenRefresh(BaseModel):
    """Token refresh request schema"""
    refresh_token: str = Field(..., description="JWT refresh token")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            }
        }
    }

class TokenData(BaseModel):
    """Token payload data schema"""
    user_id: int = Field(..., description="User ID")
    email: str = Field(..., description="User email")
    role: UserRoleSchema = Field(..., description="User role")
    session_id: Optional[str] = Field(None, description="Session ID")

# =============================================================================
# RESPONSE SCHEMAS
# =============================================================================

class UserResponse(UserBase):
    """User response schema (public information)"""
    id: int = Field(..., description="User ID")
    full_name: str = Field(..., description="Full name")
    role: UserRoleSchema = Field(..., description="User role")
    status: UserStatusSchema = Field(..., description="Account status")
    is_active: bool = Field(..., description="Account active status")
    is_verified: bool = Field(..., description="Email verification status")
    email_verified_at: Optional[datetime] = Field(None, description="Email verification timestamp")
    last_login_at: Optional[datetime] = Field(None, description="Last login timestamp")
    created_at: datetime = Field(..., description="Account creation timestamp")
    avatar_url: Optional[str] = Field(None, description="Profile picture URL")
    
    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": 1,
                "email": "parent@example.com",
                "first_name": "John",
                "last_name": "Doe",
                "full_name": "John Doe",
                "phone": "1234567890",
                "role": "parent",
                "status": "active",
                "is_active": True,
                "is_verified": True,
                "email_verified_at": "2025-06-07T10:00:00Z",
                "last_login_at": "2025-06-07T14:00:00Z",
                "created_at": "2025-06-01T10:00:00Z",
                "timezone": "UTC",
                "language": "en"
            }
        }
    }

class UserDetailResponse(UserResponse):
    """Detailed user response schema (for profile/admin)"""
    bio: Optional[str] = Field(None, description="User biography")
    license_number: Optional[str] = Field(None, description="Professional license number")
    specialization: Optional[str] = Field(None, description="Medical specialization")
    clinic_name: Optional[str] = Field(None, description="Clinic name")
    clinic_address: Optional[str] = Field(None, description="Clinic address")
    failed_login_attempts: int = Field(..., description="Failed login attempts count")
    locked_until: Optional[datetime] = Field(None, description="Account lock expiration")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")

class LoginResponse(BaseModel):
    """Login response schema"""
    user: UserResponse = Field(..., description="User information")
    token: Token = Field(..., description="Authentication tokens")
    message: str = Field(default="Login successful", description="Response message")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "user": {
                    "id": 1,
                    "email": "parent@example.com",
                    "first_name": "John",
                    "last_name": "Doe",
                    "role": "parent",
                    "status": "active"
                },
                "token": {
                    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    "token_type": "bearer",
                    "expires_in": 1800
                },
                "message": "Login successful"
            }
        }
    }

class RegisterResponse(BaseModel):
    """Registration response schema"""
    user: UserResponse = Field(..., description="Created user information")
    message: str = Field(default="Registration successful", description="Response message")
    verification_required: bool = Field(default=True, description="Whether email verification is required")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "user": {
                    "id": 1,
                    "email": "newuser@example.com",
                    "first_name": "Jane",
                    "last_name": "Doe",
                    "role": "parent",
                    "status": "pending"
                },
                "message": "Registration successful. Please check your email for verification.",
                "verification_required": True
            }
        }
    }

# =============================================================================
# LIST AND PAGINATION SCHEMAS
# =============================================================================

class UserListResponse(BaseModel):
    """User list response with pagination"""
    users: List[UserResponse] = Field(..., description="List of users")
    total: int = Field(..., description="Total number of users")
    page: int = Field(..., description="Current page number")
    size: int = Field(..., description="Page size")
    pages: int = Field(..., description="Total number of pages")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "users": [],
                "total": 100,
                "page": 1,
                "size": 20,
                "pages": 5
            }
        }
    }

# =============================================================================
# ERROR SCHEMAS
# =============================================================================

class ErrorResponse(BaseModel):
    """Standard error response schema"""
    error: bool = Field(default=True, description="Error flag")
    message: str = Field(..., description="Error message")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional error details")
    status_code: int = Field(..., description="HTTP status code")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "error": True,
                "message": "Validation error",
                "details": {"field": ["Field is required"]},
                "status_code": 422
            }
        }
    }
