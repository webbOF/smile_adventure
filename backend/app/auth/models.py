"""
Authentication Models - SQLAlchemy models for user authentication
Enhanced with role-based access control and comprehensive user management
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum, Text, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import validates
from passlib.context import CryptContext
import enum

from app.core.database import Base

# Initialize password context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# =============================================================================
# USER ROLE ENUMS
# =============================================================================

class UserRole(enum.Enum):
    """User role enumeration for role-based access control"""
    PARENT = "parent"           # Parent/Guardian of children
    PROFESSIONAL = "professional"  # Healthcare professional
    ADMIN = "admin"            # System administrator
    SUPER_ADMIN = "super_admin"  # Super administrator

class UserStatus(enum.Enum):
    """User account status enumeration"""
    ACTIVE = "active"          # Active account
    INACTIVE = "inactive"      # Temporarily inactive
    SUSPENDED = "suspended"    # Suspended account
    PENDING = "pending"        # Pending activation
    DELETED = "deleted"        # Soft deleted

# =============================================================================
# USER AUTHENTICATION MODEL
# =============================================================================

class User(Base):
    """
    Enhanced User model with role-based access control
    Supports parents, healthcare professionals, and administrators
    """
    __tablename__ = "auth_users"
    
    # Primary fields
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    # Personal information
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    full_name = Column(String(200), nullable=True)  # Computed field
    phone = Column(String(20), nullable=True)
    
    # Role and permissions
    role = Column(Enum(UserRole), default=UserRole.PARENT, nullable=False, index=True)
    status = Column(Enum(UserStatus), default=UserStatus.PENDING, nullable=False, index=True)
    
    # Security fields
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    email_verified_at = Column(DateTime(timezone=True), nullable=True)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime(timezone=True), nullable=True)
    
    # Professional-specific fields (for healthcare professionals)
    license_number = Column(String(100), nullable=True, index=True)
    specialization = Column(String(200), nullable=True)
    clinic_name = Column(String(200), nullable=True)
    clinic_address = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    created_by = Column(Integer, nullable=True)  # User ID who created this account
    last_modified_by = Column(Integer, nullable=True)  # User ID who last modified
    
    # Additional metadata
    timezone = Column(String(50), default="UTC", nullable=False)
    language = Column(String(10), default="en", nullable=False)
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
      # Database indexes for performance
    __table_args__ = (
        Index('idx_user_email_status', 'email', 'status'),
        Index('idx_user_role_active', 'role', 'is_active'),
        Index('idx_user_created_at', 'created_at'),
        Index('idx_user_last_login', 'last_login_at'),
    )
    
    # Relationships (defined separately to avoid circular imports)
    # children = relationship("Child", back_populates="parent", lazy="dynamic")
    # Note: Relationship is defined in users/models.py to avoid circular imports
    
    def __init__(self, **kwargs):
        """Initialize user with computed fields"""
        super().__init__(**kwargs)
        if self.first_name and self.last_name:
            self.full_name = f"{self.first_name} {self.last_name}"
    
    @validates('email')
    def validate_email(self, key, email):
        """Validate email format"""
        if not email or '@' not in email:
            raise ValueError("Invalid email format")
        return email.lower().strip()
    
    @validates('role')
    def validate_role(self, key, role):
        """Validate user role"""
        if isinstance(role, str):
            try:
                return UserRole(role)
            except ValueError:
                raise ValueError(f"Invalid role: {role}")
        return role
    
    @validates('phone')
    def validate_phone(self, key, phone):
        """Validate and format phone number"""
        if phone:
            # Remove all non-digit characters
            cleaned = ''.join(filter(str.isdigit, phone))
            if len(cleaned) < 10:
                raise ValueError("Phone number must be at least 10 digits")
            return cleaned
        return phone
    
    def set_password(self, password: str) -> None:
        """Hash and set password"""
        if not password or len(password) < 8:
            raise ValueError("Password must be at least 8 characters long")
        self.hashed_password = pwd_context.hash(password)
    
    def verify_password(self, password: str) -> bool:
        """Verify password against hash"""
        return pwd_context.verify(password, self.hashed_password)
    
    def is_account_locked(self) -> bool:
        """Check if account is locked due to failed attempts"""
        if self.locked_until:
            return datetime.now(timezone.utc) < self.locked_until
        return False
    
    def increment_failed_login(self) -> None:
        """Increment failed login attempts and lock if necessary"""
        self.failed_login_attempts += 1
        # Lock account after 5 failed attempts for 30 minutes
        if self.failed_login_attempts >= 5:
            self.locked_until = datetime.now(timezone.utc).replace(
                minute=datetime.now(timezone.utc).minute + 30
            )
    
    def reset_failed_login(self) -> None:
        """Reset failed login attempts after successful login"""
        self.failed_login_attempts = 0
        self.locked_until = None
        self.last_login_at = datetime.now(timezone.utc)
    
    def can_access_admin(self) -> bool:
        """Check if user has admin access"""
        return self.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN] and self.is_active
    
    def can_access_professional(self) -> bool:
        """Check if user has professional access"""
        return self.role in [UserRole.PROFESSIONAL, UserRole.ADMIN, UserRole.SUPER_ADMIN] and self.is_active
    
    def is_parent(self) -> bool:
        """Check if user is a parent"""
        return self.role == UserRole.PARENT and self.is_active
    
    def __repr__(self):
        return f"<User {self.email} ({self.role.value})>"
    
    def __str__(self):
        return f"{self.full_name} ({self.email})"

# =============================================================================
# USER SESSION MODEL
# =============================================================================

class UserSession(Base):
    """
    User session tracking for enhanced security
    Tracks active sessions and enables session management
    """
    __tablename__ = "auth_user_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    session_token = Column(String(255), unique=True, nullable=False, index=True)
    refresh_token = Column(String(255), unique=True, nullable=True, index=True)
    
    # Session metadata
    ip_address = Column(String(45), nullable=True)  # Supports IPv6
    user_agent = Column(Text, nullable=True)
    device_info = Column(Text, nullable=True)
    location = Column(String(200), nullable=True)
    
    # Session timing
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_accessed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    
    # Session status
    is_active = Column(Boolean, default=True, nullable=False)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    revoked_by = Column(Integer, nullable=True)  # User ID who revoked
    
    def is_expired(self) -> bool:
        """Check if session is expired"""
        return datetime.now(timezone.utc) > self.expires_at
    
    def is_valid(self) -> bool:
        """Check if session is valid (active and not expired)"""
        return self.is_active and not self.is_expired()
    
    def revoke(self, revoked_by: int = None) -> None:
        """Revoke the session"""
        self.is_active = False
        self.revoked_at = datetime.now(timezone.utc)
        self.revoked_by = revoked_by
    
    def update_access(self) -> None:
        """Update last accessed timestamp"""
        self.last_accessed_at = datetime.now(timezone.utc)
    
    __table_args__ = (
        Index('idx_session_user_active', 'user_id', 'is_active'),
        Index('idx_session_token', 'session_token'),
        Index('idx_session_expires', 'expires_at'),
    )
    
    def __repr__(self):
        return f"<UserSession {self.session_token[:8]}... for user {self.user_id}>"

# =============================================================================
# PASSWORD RESET MODEL
# =============================================================================

class PasswordResetToken(Base):
    """
    Password reset token management
    Secure password reset functionality with expiration
    """
    __tablename__ = "auth_password_reset_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    token = Column(String(255), unique=True, nullable=False, index=True)
    
    # Token metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used_at = Column(DateTime(timezone=True), nullable=True)
    
    # Security
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    
    def is_expired(self) -> bool:
        """Check if token is expired"""
        return datetime.now(timezone.utc) > self.expires_at
    
    def is_used(self) -> bool:
        """Check if token has been used"""
        return self.used_at is not None
    
    def is_valid(self) -> bool:
        """Check if token is valid (not expired and not used)"""
        return not self.is_expired() and not self.is_used()
    
    def use_token(self) -> None:
        """Mark token as used"""
        self.used_at = datetime.now(timezone.utc)
    
    __table_args__ = (
        Index('idx_reset_token_user', 'user_id'),
        Index('idx_reset_token_expires', 'expires_at'),
    )
    
    def __repr__(self):
        return f"<PasswordResetToken {self.token[:8]}... for user {self.user_id}>"
