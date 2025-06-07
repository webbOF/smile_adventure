"""
Authentication routes and endpoints
Enhanced with comprehensive security features
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.core.database import get_db
from app.core.security import jwt_manager, password_manager, auth_service
from app.users.models import User
from app.users.crud import get_user_by_email
from app.users import schemas

router = APIRouter()

@router.post("/login", response_model=Dict[str, Any])
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    User login endpoint with enhanced security
    
    Returns both access and refresh tokens
    """
    # Get user by email
    user = get_user_by_email(db, email=form_data.username)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not password_manager.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user account"
        )
    
    # Create tokens
    token_data = {"sub": user.email, "user_id": user.id}
    access_token = jwt_manager.create_access_token(data=token_data)
    refresh_token = jwt_manager.create_refresh_token(data=token_data)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": jwt_manager.access_token_expire * 60,  # Convert to seconds
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "is_active": user.is_active
        }
    }

@router.post("/refresh", response_model=Dict[str, Any])
async def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token
    """
    # Verify refresh token
    payload = jwt_manager.verify_token(refresh_token, token_type="refresh")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user email from token
    email = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    # Verify user still exists and is active
    user = get_user_by_email(db, email=email)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Create new access token
    token_data = {"sub": user.email, "user_id": user.id}
    new_access_token = jwt_manager.create_access_token(data=token_data)
    
    return {
        "access_token": new_access_token,
        "token_type": "bearer",
        "expires_in": jwt_manager.access_token_expire * 60
    }

@router.get("/me", response_model=schemas.UserResponse)
async def get_current_user_info(
    current_user: User = Depends(auth_service.get_current_user)
):
    """
    Get current authenticated user information
    """
    return current_user

@router.post("/logout")
async def logout(
    current_user: User = Depends(auth_service.get_current_user)
):
    """
    User logout endpoint
    
    Note: In a stateless JWT system, actual logout would require
    token blacklisting, which could be implemented with Redis
    """
    return {
        "message": "Successfully logged out",
        "user_id": current_user.id
    }

@router.post("/change-password")
async def change_password(
    old_password: str,
    new_password: str,
    current_user: User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Change user password
    """
    # Verify old password
    if not password_manager.verify_password(old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    
    # Validate new password strength
    validation_result = password_manager.validate_password_strength(new_password)
    if not validation_result["valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Password validation failed: {', '.join(validation_result['errors'])}"
        )
    
    # Update password
    current_user.hashed_password = password_manager.get_password_hash(new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}

# Export the get_current_user dependency for use in other modules
get_current_user = auth_service.get_current_user
