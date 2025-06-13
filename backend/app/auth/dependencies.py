"""
Authentication Dependencies & Middleware
Provides dependency injection for FastAPI authentication and authorization
"""

from typing import Optional, Callable, List
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import logging

from app.core.database import get_db
from app.auth.models import User, UserRole, UserStatus
from app.auth.services import AuthService, get_auth_service
from app.auth.schemas import TokenData

# Configure logging
logger = logging.getLogger(__name__)

# =============================================================================
# SECURITY SCHEMES
# =============================================================================

# HTTPBearer security scheme for JWT tokens
security = HTTPBearer(auto_error=False)

# =============================================================================
# CORE AUTHENTICATION DEPENDENCIES
# =============================================================================

async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Get current authenticated user from JWT token
    
    Args:
        request: FastAPI request object
        credentials: HTTP Bearer credentials
        db: Database session
        
    Returns:
        User object if authenticated, None otherwise
        
    Raises:
        HTTPException: If authentication fails
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials required",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    try:
        # Get auth service
        auth_service = get_auth_service(db)
        
        # Verify token
        token_data = auth_service.verify_access_token(credentials.credentials)
        if not token_data:
            logger.warning(f"Invalid token from IP: {request.client.host}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        # Get user from database
        user = auth_service.get_user_by_id(token_data.user_id)
        if not user:
            logger.warning(f"User not found for token: {token_data.user_id}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        # Log successful authentication
        logger.info(f"User authenticated: {user.email} from {request.client.host}")
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"}
        )

async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current active user (must be active and verified)
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Active User object
        
    Raises:
        HTTPException: If user is inactive or unverified
    """
    if not current_user.is_active:
        logger.warning(f"Inactive user attempted access: {current_user.email}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )
    
    if current_user.status != UserStatus.ACTIVE:
        logger.warning(f"Non-active status user attempted access: {current_user.email}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account status does not allow access"
        )
    
    return current_user

async def get_current_verified_user(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    Get current verified user (must be active and email verified)
    
    Args:
        current_user: Current active user
        
    Returns:
        Verified User object
        
    Raises:
        HTTPException: If user email is not verified
    """
    if not current_user.is_verified:
        logger.warning(f"Unverified user attempted access: {current_user.email}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email verification required"
        )
    
    return current_user

# =============================================================================
# ROLE-BASED ACCESS CONTROL
# =============================================================================

def require_role(allowed_roles: List[UserRole]) -> Callable:
    """
    Factory function to create role-based access control dependency
    
    Args:
        allowed_roles: List of allowed user roles
        
    Returns:
        Dependency function that checks user role
    """
    async def role_checker(
        current_user: User = Depends(get_current_verified_user)
    ) -> User:
        """
        Check if current user has required role
        
        Args:
            current_user: Current verified user
            
        Returns:
            User object if authorized
            
        Raises:
            HTTPException: If user doesn't have required role
        """
        if current_user.role not in allowed_roles:
            logger.warning(
                f"Unauthorized access attempt: {current_user.email} "
                f"(role: {current_user.role}) tried to access endpoint requiring {allowed_roles}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {[role.value for role in allowed_roles]}"
            )
        
        logger.info(f"Authorized access: {current_user.email} (role: {current_user.role.value})")
        return current_user
    
    return role_checker

# =============================================================================
# SPECIFIC ROLE DEPENDENCIES
# =============================================================================

# Parent role dependency
require_parent = require_role([UserRole.PARENT])

# Professional role dependency  
require_professional = require_role([UserRole.PROFESSIONAL])

# Admin role dependency
require_admin = require_role([UserRole.ADMIN])

# Professional or Admin dependency (for clinic management)
require_professional_or_admin = require_role([UserRole.PROFESSIONAL, UserRole.ADMIN])

# Any authenticated role dependency (Parent, Professional, or Admin)
require_any_role = require_role([UserRole.PARENT, UserRole.PROFESSIONAL, UserRole.ADMIN])

# =============================================================================
# OPTIONAL AUTHENTICATION DEPENDENCIES
# =============================================================================

async def get_current_user_optional(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Get current user optionally (returns None if not authenticated)
    Useful for endpoints that work for both authenticated and anonymous users
    
    Args:
        request: FastAPI request object
        credentials: HTTP Bearer credentials
        db: Database session
        
    Returns:
        User object if authenticated, None if not authenticated
    """
    if not credentials:
        return None
    
    try:
        # Get auth service
        auth_service = get_auth_service(db)
        
        # Verify token
        token_data = auth_service.verify_access_token(credentials.credentials)
        if not token_data:
            return None
        
        # Get user from database
        user = auth_service.get_user_by_id(token_data.user_id)
        if not user or not user.is_active:
            return None
        
        logger.info(f"Optional auth: User {user.email} authenticated")
        return user
        
    except Exception as e:
        logger.debug(f"Optional authentication failed: {str(e)}")
        return None

# =============================================================================
# MIDDLEWARE UTILITIES
# =============================================================================

async def log_request_info(request: Request):
    """
    Log request information for debugging and monitoring
    
    Args:
        request: FastAPI request object
    """
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")
    method = request.method
    url = str(request.url)
    
    logger.info(
        f"Request: {method} {url} from {client_ip} "
        f"User-Agent: {user_agent[:100]}..."
    )

def get_request_metadata(request: Request) -> dict:
    """
    Extract metadata from request for session tracking
    
    Args:
        request: FastAPI request object
        
    Returns:
        Dictionary with request metadata
    """
    return {
        "ip_address": request.client.host if request.client else None,
        "user_agent": request.headers.get("user-agent"),
        "referer": request.headers.get("referer"),
        "x_forwarded_for": request.headers.get("x-forwarded-for"),
        "x_real_ip": request.headers.get("x-real-ip")
    }

# =============================================================================
# PERMISSION CHECKERS
# =============================================================================

class PermissionChecker:
    """
    Utility class for checking various permissions
    """
    
    @staticmethod
    def can_manage_user(current_user: User, target_user: User) -> bool:
        """
        Check if current user can manage target user
        
        Args:
            current_user: User performing the action
            target_user: User being managed
            
        Returns:
            True if allowed, False otherwise
        """
        # Admin can manage anyone
        if current_user.role == UserRole.ADMIN:
            return True
        
        # Professional can manage their own patients
        if current_user.role == UserRole.PROFESSIONAL and target_user.role == UserRole.PARENT:
            return True
        
        # Users can manage themselves
        if current_user.id == target_user.id:
            return True
        
        return False
    
    @staticmethod
    def can_view_user_data(current_user: User, target_user: User) -> bool:
        """
        Check if current user can view target user's data
        
        Args:
            current_user: User requesting data
            target_user: User whose data is requested
            
        Returns:
            True if allowed, False otherwise
        """
        # Use same logic as manage for now
        return PermissionChecker.can_manage_user(current_user, target_user)
    
    @staticmethod
    def can_create_report(current_user: User) -> bool:
        """
        Check if current user can create reports
        
        Args:
            current_user: User requesting to create report
            
        Returns:
            True if allowed, False otherwise
        """
        return current_user.role in [UserRole.PROFESSIONAL, UserRole.ADMIN]

# =============================================================================
# DEPENDENCY FACTORIES
# =============================================================================

def require_user_access(target_user_id_param: str = "user_id") -> Callable:
    """
    Factory to create dependency that checks if current user can access target user
    
    Args:
        target_user_id_param: Name of path parameter containing target user ID
        
    Returns:
        Dependency function
    """
    async def check_user_access(
        request: Request,
        current_user: User = Depends(get_current_verified_user),
        db: Session = Depends(get_db)
    ) -> User:
        """
        Check if current user can access the target user
        """
        # Get target user ID from path parameters
        target_user_id = request.path_params.get(target_user_id_param)
        if not target_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing {target_user_id_param} parameter"
            )
        
        try:
            target_user_id = int(target_user_id)
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user ID format"
            )
        
        # Get target user
        auth_service = get_auth_service(db)
        target_user = auth_service.get_user_by_id(target_user_id)
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check permissions
        if not PermissionChecker.can_view_user_data(current_user, target_user):
            logger.warning(
                f"Unauthorized user data access: {current_user.email} "
                f"tried to access user {target_user_id}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to user data"
            )
        
        return current_user
    
    return check_user_access

# =============================================================================
# SESSION MANAGEMENT DEPENDENCIES
# =============================================================================

async def create_user_session_on_login(
    request: Request,
    user: User,
    db: Session = Depends(get_db)
) -> None:
    """
    Create user session after successful login
    
    Args:
        request: FastAPI request object
        user: Authenticated user
        db: Database session
    """
    try:
        auth_service = get_auth_service(db)
        session_data = get_request_metadata(request)
        session = auth_service.create_user_session(user, session_data)
        if session:
            logger.info(f"Session created for user {user.email}: {session.session_token[:8]}...")
        else:
            logger.warning(f"Failed to create session for user {user.email}")
            
    except Exception as e:
        logger.error(f"Error creating user session: {str(e)}")
# =============================================================================
# END OF DEPENDENCIES
# =============================================================================