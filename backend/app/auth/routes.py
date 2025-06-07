"""
Authentication routes and endpoints - FIXED VERSION
Eliminati import circolari e dipendenze non risolte
"""

from datetime import datetime, timezone
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.auth.models import User, UserRole, UserStatus
from app.auth.schemas import (
    UserRegister, UserLogin, UserResponse, LoginResponse, 
    RegisterResponse, PasswordChange, PasswordReset, 
    PasswordResetConfirm, Token, TokenRefresh, ErrorResponse
)
from app.auth.services import get_auth_service, AuthService
from app.auth.dependencies import (
    get_current_user, get_current_active_user, get_current_verified_user,
    require_parent, require_professional, require_admin, 
    check_login_rate_limit, create_user_session_on_login
)

# Create router
router = APIRouter()

# =============================================================================
# AUTHENTICATION ENDPOINTS
# =============================================================================

@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserRegister,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Register a new user account
    
    Creates a new user account with email verification required.
    Supports both parent and professional registration.
    """
    try:
        # Get auth service
        auth_service = get_auth_service(db)
        
        # Create user
        user = auth_service.create_user(user_data)
        
        # Create user response
        user_response = UserResponse.model_validate(user)
        
        return RegisterResponse(
            user=user_response,
            message="Registration successful. Please check your email for verification.",
            verification_required=True
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed. Please try again."
        )

@router.post("/login", response_model=LoginResponse)
async def login_user(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
    _: None = Depends(check_login_rate_limit)  # Rate limiting
):
    """
    User login with email and password
    
    Returns access and refresh tokens upon successful authentication.
    Includes rate limiting and account lockout protection.
    """
    try:
        # Get auth service
        auth_service = get_auth_service(db)
        
        # Authenticate user
        user = auth_service.authenticate_user(form_data.username, form_data.password)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        # Create tokens
        access_token = auth_service.create_access_token(user)
        refresh_token = auth_service.create_refresh_token(user)
        
        # Create session
        await create_user_session_on_login(request, user, db)
        
        # Prepare response
        user_response = UserResponse.model_validate(user)
        token_response = Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=30 * 60  # 30 minutes in seconds
        )
        
        return LoginResponse(
            user=user_response,
            token=token_response,
            message="Login successful"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed. Please try again."
        )

@router.post("/refresh", response_model=Dict[str, Any])
async def refresh_token(
    token_data: TokenRefresh,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token
    
    Provides a new access token when the current one expires,
    without requiring the user to log in again.
    """
    try:
        # Get auth service
        auth_service = get_auth_service(db)
        
        # Refresh access token
        new_access_token = auth_service.refresh_access_token(token_data.refresh_token)
        
        if not new_access_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        return {
            "access_token": new_access_token,
            "token_type": "bearer",
            "expires_in": 30 * 60,  # 30 minutes
            "message": "Token refreshed successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )

@router.post("/logout")
async def logout_user(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    User logout
    
    Invalidates all user sessions across all devices.
    In a production environment, this would also blacklist the current token.
    """
    try:
        # Get auth service
        auth_service = get_auth_service(db)
        
        # Invalidate all user sessions
        success = auth_service.invalidate_user_sessions(current_user.id)
        
        return {
            "message": "Logout successful",
            "user_id": current_user.id,
            "sessions_invalidated": success
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )

# =============================================================================
# USER PROFILE ENDPOINTS
# =============================================================================

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_verified_user)
):
    """
    Get current authenticated user profile
    
    Returns detailed information about the currently logged-in user.
    Requires a valid access token and verified email.
    """
    return UserResponse.model_validate(current_user)

@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    update_data: Dict[str, Any],
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Update current user profile
    
    Allows users to update their profile information.
    Certain fields may be restricted based on user role.
    """
    try:
        # Get auth service
        auth_service = get_auth_service(db)
        
        # Update user
        updated_user = auth_service.update_user(current_user.id, update_data)
        
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update profile"
            )
        
        return UserResponse.model_validate(updated_user)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Profile update failed"
        )

# =============================================================================
# PASSWORD MANAGEMENT ENDPOINTS
# =============================================================================

@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Change user password
    
    Allows authenticated users to change their password.
    Requires current password verification.
    """
    try:
        # Get auth service
        auth_service = get_auth_service(db)
        
        # Change password
        success = auth_service.change_password(current_user.id, password_data)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to change password. Please verify your current password."
            )
        
        # Invalidate all sessions (force re-login with new password)
        auth_service.invalidate_user_sessions(current_user.id)
        
        return {
            "message": "Password changed successfully",
            "note": "Please log in again with your new password"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password change failed"
        )

@router.post("/forgot-password")
async def forgot_password(
    reset_data: PasswordReset,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Request password reset
    
    Sends a password reset email to the user.
    For security, always returns success even if email doesn't exist.
    """
    try:
        # Get auth service
        auth_service = get_auth_service(db)
        
        # Create password reset token (always returns success for security)
        token = auth_service.create_password_reset_token(reset_data.email)
        
        # In production, send email here
        # await send_password_reset_email(reset_data.email, token)
        
        return {
            "message": "If an account with this email exists, you will receive password reset instructions.",
            "email": reset_data.email
        }
        
    except Exception as e:
        # Don't reveal errors for security
        return {
            "message": "If an account with this email exists, you will receive password reset instructions.",
            "email": reset_data.email
        }

@router.post("/reset-password")
async def reset_password(
    reset_data: PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    """
    Reset password using token
    
    Completes the password reset process using the token sent via email.
    """
    try:
        # Get auth service
        auth_service = get_auth_service(db)
        
        # Reset password
        success = auth_service.reset_password(reset_data)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        return {
            "message": "Password reset successful. Please log in with your new password."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset failed"
        )

# =============================================================================
# EMAIL VERIFICATION ENDPOINTS
# =============================================================================

@router.post("/verify-email/{user_id}")
async def verify_email(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Verify user email address
    
    Marks the user's email as verified and activates the account.
    In production, this would require a verification token.
    """
    try:
        # Get auth service
        auth_service = get_auth_service(db)
        
        # Verify email
        success = auth_service.verify_email(user_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {
            "message": "Email verified successfully. Your account is now active.",
            "user_id": user_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email verification failed"
        )

# =============================================================================
# ADMIN ENDPOINTS (Requires admin role)
# =============================================================================

@router.get("/users", response_model=Dict[str, Any])
async def get_users_list(
    skip: int = 0,
    limit: int = 100,
    role: Optional[UserRole] = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get list of users (Admin only)
    
    Returns paginated list of users with optional role filtering.
    Only accessible to administrators.
    """
    try:
        # Get auth service
        auth_service = get_auth_service(db)
        
        # Get users list
        users = auth_service.get_users_list(skip=skip, limit=limit, role=role)
        
        # Get total count for pagination
        total_users = db.query(User).count()
        
        # Convert to response format
        users_response = [UserResponse.model_validate(user) for user in users]
        
        return {
            "users": users_response,
            "total": total_users,
            "skip": skip,
            "limit": limit,
            "has_more": (skip + limit) < total_users
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve users list"
        )

@router.get("/stats", response_model=Dict[str, Any])
async def get_user_statistics(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get user statistics (Admin only)
    
    Returns platform-wide user statistics and metrics.
    Only accessible to administrators.
    """
    try:
        # Get auth service
        auth_service = get_auth_service(db)
        
        # Get user stats
        stats = auth_service.get_user_stats()
        
        return {
            "statistics": stats,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "generated_by": current_user.email
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve statistics"
        )

# =============================================================================
# ROLE-BASED ACCESS EXAMPLES
# =============================================================================

@router.get("/parent-only")
async def parent_only_endpoint(
    current_user: User = Depends(require_parent)
):
    """Example endpoint that requires parent role"""
    return {
        "message": f"Hello parent {current_user.full_name}",
        "user_id": current_user.id,
        "role": current_user.role.value
    }

@router.get("/professional-only")
async def professional_only_endpoint(
    current_user: User = Depends(require_professional)
):
    """Example endpoint that requires professional role"""
    return {
        "message": f"Hello healthcare professional {current_user.full_name}",
        "user_id": current_user.id,
        "role": current_user.role.value,
        "license": current_user.license_number
    }