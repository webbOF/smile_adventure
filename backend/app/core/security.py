"""
Security utilities and middleware for Smile Adventure
Comprehensive JWT utilities, password hashing, and security middleware
"""

import logging
import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from passlib.hash import bcrypt
from fastapi import HTTPException, status, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import re

from app.core.config import settings
from app.core.database import get_db

# Setup logging
logger = logging.getLogger(__name__)

# =============================================================================
# PASSWORD HASHING CONFIGURATION
# =============================================================================

# Password hashing context with multiple schemes for flexibility
pwd_context = CryptContext(
    schemes=["bcrypt", "pbkdf2_sha256"],
    deprecated="auto",
    bcrypt__rounds=12,  # Increase rounds for better security
)

# =============================================================================
# JWT CONFIGURATION
# =============================================================================

class JWTManager:
    """JWT token management with enhanced security features"""
    
    def __init__(self):
        self.secret_key = settings.SECRET_KEY
        self.algorithm = settings.ALGORITHM
        self.access_token_expire = settings.ACCESS_TOKEN_EXPIRE_MINUTES
        self.refresh_token_expire = settings.REFRESH_TOKEN_EXPIRE_MINUTES
    
    def create_access_token(
        self, 
        data: Dict[str, Any], 
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """
        Create JWT access token
        
        Args:
            data: Payload data to encode
            expires_delta: Custom expiration time
            
        Returns:
            str: Encoded JWT token
        """
        to_encode = data.copy()
          # Set expiration time
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=self.access_token_expire)
        
        # Add standard claims
        to_encode.update({
            "exp": expire,
            "iat": datetime.now(timezone.utc),
            "type": "access",
            "iss": settings.APP_NAME,
        })
        
        try:
            encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
            logger.debug(f"Access token created for subject: {data.get('sub', 'unknown')}")
            return encoded_jwt
        except Exception as e:
            logger.error(f"Error creating access token: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not create access token"
            )
    
    def create_refresh_token(
        self, 
        data: Dict[str, Any], 
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """
        Create JWT refresh token
        
        Args:
            data: Payload data to encode
            expires_delta: Custom expiration time
            
        Returns:
            str: Encoded JWT refresh token
        """
        to_encode = data.copy()
          # Set expiration time
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=self.refresh_token_expire)
        
        # Add standard claims
        to_encode.update({
            "exp": expire,
            "iat": datetime.now(timezone.utc),
            "type": "refresh",
            "iss": settings.APP_NAME,
        })
        
        try:
            encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
            logger.debug(f"Refresh token created for subject: {data.get('sub', 'unknown')}")
            return encoded_jwt
        except Exception as e:
            logger.error(f"Error creating refresh token: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not create refresh token"
            )
    
    def verify_token(self, token: str, token_type: str = "access") -> Optional[Dict[str, Any]]:
        """
        Verify and decode JWT token
        
        Args:
            token: JWT token to verify
            token_type: Expected token type ('access' or 'refresh')
            
        Returns:
            Optional[Dict]: Decoded payload if valid, None otherwise
        """
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            
            # Verify token type
            if payload.get("type") != token_type:
                logger.warning(f"Invalid token type. Expected: {token_type}, Got: {payload.get('type')}")
                return None
            
            # Verify issuer
            if payload.get("iss") != settings.APP_NAME:
                logger.warning(f"Invalid token issuer: {payload.get('iss')}")
                return None
            
            logger.debug(f"Token verified successfully for subject: {payload.get('sub', 'unknown')}")
            return payload
            
        except jwt.ExpiredSignatureError:
            logger.warning("Token has expired")
            return None
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid token: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error verifying token: {e}")
            return None
    
    def refresh_access_token(self, refresh_token: str) -> Optional[str]:
        """
        Create new access token from refresh token
        
        Args:
            refresh_token: Valid refresh token
            
        Returns:
            Optional[str]: New access token if refresh token is valid
        """
        payload = self.verify_token(refresh_token, token_type="refresh")
        if not payload:
            return None
        
        # Create new access token with same subject
        new_token_data = {"sub": payload.get("sub")}
        return self.create_access_token(new_token_data)

# =============================================================================
# PASSWORD UTILITIES
# =============================================================================

class PasswordManager:
    """Password management utilities with security policies"""
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """
        Verify a plain password against its hash
        
        Args:
            plain_password: Plain text password
            hashed_password: Hashed password from database
            
        Returns:
            bool: True if password matches, False otherwise
        """
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except Exception as e:
            logger.error(f"Error verifying password: {e}")
            return False
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """
        Generate password hash
        
        Args:
            password: Plain text password
            
        Returns:
            str: Hashed password
        """
        try:
            return pwd_context.hash(password)
        except Exception as e:
            logger.error(f"Error hashing password: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not hash password"
            )
    
    @staticmethod
    def validate_password_strength(password: str) -> Dict[str, Union[bool, str]]:
        """
        Validate password against security policy
        
        Args:
            password: Password to validate
            
        Returns:
            Dict: Validation result with details
        """
        result = {
            "valid": True,
            "errors": []
        }
        
        # Check minimum length
        if len(password) < settings.PASSWORD_MIN_LENGTH:
            result["valid"] = False
            result["errors"].append(f"Password must be at least {settings.PASSWORD_MIN_LENGTH} characters long")
        
        # Check for uppercase letters
        if settings.PASSWORD_REQUIRE_UPPERCASE and not re.search(r'[A-Z]', password):
            result["valid"] = False
            result["errors"].append("Password must contain at least one uppercase letter")
        
        # Check for lowercase letters
        if settings.PASSWORD_REQUIRE_LOWERCASE and not re.search(r'[a-z]', password):
            result["valid"] = False
            result["errors"].append("Password must contain at least one lowercase letter")
        
        # Check for numbers
        if settings.PASSWORD_REQUIRE_NUMBERS and not re.search(r'\d', password):
            result["valid"] = False
            result["errors"].append("Password must contain at least one number")
        
        # Check for special characters
        if settings.PASSWORD_REQUIRE_SPECIAL and not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            result["valid"] = False
            result["errors"].append("Password must contain at least one special character")
        
        return result
    
    @staticmethod
    def generate_random_password(length: int = 12) -> str:
        """
        Generate a secure random password
        
        Args:
            length: Password length
            
        Returns:
            str: Random password
        """
        alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
        return ''.join(secrets.choice(alphabet) for _ in range(length))

# =============================================================================
# SECURITY MIDDLEWARE
# =============================================================================

class SecurityMiddleware:
    """Security middleware for request processing"""
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        """Process request through security middleware"""
        
        # Add security headers to response
        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", []))
                
                # Add security headers
                security_headers = [
                    (b"x-content-type-options", b"nosniff"),
                    (b"x-frame-options", b"DENY"),
                    (b"x-xss-protection", b"1; mode=block"),
                    (b"strict-transport-security", b"max-age=31536000; includeSubDomains"),
                    (b"referrer-policy", b"strict-origin-when-cross-origin"),
                ]
                
                headers.extend(security_headers)
                message["headers"] = headers
            
            await send(message)
        
        await self.app(scope, receive, send_wrapper)

# =============================================================================
# AUTHENTICATION DEPENDENCIES
# =============================================================================

# HTTP Bearer token scheme
security = HTTPBearer(auto_error=False)

class AuthenticationService:
    """Authentication service for FastAPI dependencies"""
    
    def __init__(self):
        self.jwt_manager = JWTManager()
        self.password_manager = PasswordManager()
    
    async def get_current_user(
        self,
        credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
        db: Session = Depends(get_db)
    ):
        """
        Get current authenticated user from JWT token
        
        Args:
            credentials: HTTP Authorization credentials
            db: Database session
            
        Returns:
            User: Current authenticated user
            
        Raises:
            HTTPException: If authentication fails
        """
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
        if not credentials:
            raise credentials_exception
        
        # Verify token
        payload = self.jwt_manager.verify_token(credentials.credentials)
        if not payload:
            raise credentials_exception
        
        # Get user email from token
        email: str = payload.get("sub")
        if not email:
            raise credentials_exception
        
        # Import here to avoid circular imports
        from app.users.crud import get_user_by_email
        
        # Get user from database
        user = get_user_by_email(db, email=email)
        if not user:
            raise credentials_exception
        
        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Inactive user"
            )
        
        return user
    
    async def get_current_active_user(
        self,
        current_user = Depends(lambda: AuthenticationService().get_current_user)
    ):
        """
        Get current active user (alias for backward compatibility)
        
        Args:
            current_user: Current user from get_current_user
            
        Returns:
            User: Current active user
        """
        return current_user

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def generate_csrf_token() -> str:
    """Generate CSRF token"""
    return secrets.token_urlsafe(32)

def validate_csrf_token(token: str, expected: str) -> bool:
    """Validate CSRF token"""
    return secrets.compare_digest(token, expected)

def generate_api_key() -> str:
    """Generate API key"""
    return secrets.token_urlsafe(32)

# =============================================================================
# GLOBAL INSTANCES
# =============================================================================

# Create global instances
jwt_manager = JWTManager()
password_manager = PasswordManager()
auth_service = AuthenticationService()

# =============================================================================
# EXPORTS
# =============================================================================

__all__ = [
    "JWTManager",
    "PasswordManager", 
    "SecurityMiddleware",
    "AuthenticationService",
    "jwt_manager",
    "password_manager",
    "auth_service",
    "generate_csrf_token",
    "validate_csrf_token",
    "generate_api_key",
]
