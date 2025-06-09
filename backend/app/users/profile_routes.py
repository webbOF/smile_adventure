"""
Task 14: Enhanced User Profile Routes Implementation
File: backend/app/users/profile_routes.py

Complete user profile management with role-specific features
"""

from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.core.database import get_db
from app.auth.models import User, UserRole, UserStatus
from app.auth.dependencies import (
    get_current_user, get_current_verified_user,
    require_parent, require_professional, require_admin
)
from app.users.models import Child, ProfessionalProfile
from app.auth.schemas import UserResponse, UserDetailResponse
from app.users.schemas import (
    ProfessionalProfileCreate,
    ProfessionalProfileUpdate, ProfessionalProfileResponse
)
from app.users.crud import get_professional_service
import logging

logger = logging.getLogger(__name__)

# Create router for profile management
router = APIRouter()

# =============================================================================
# GENERAL PROFILE ROUTES
# =============================================================================

@router.get("/profile", response_model=UserDetailResponse)
async def get_detailed_user_profile(
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed user profile with role-specific information
    
    Returns comprehensive profile data including:
    - Basic user information
    - Role-specific data (professional profile, children count, etc.)
    - Profile completion status
    - Recent activity summary
    """
    try:        # Base user data
        profile_data = {
            "id": current_user.id,
            "email": current_user.email,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "full_name": current_user.full_name,
            "phone": current_user.phone,
            "role": current_user.role.value,
            "status": current_user.status.value,
            "is_active": current_user.is_active,
            "is_verified": current_user.is_verified,
            "failed_login_attempts": current_user.failed_login_attempts,
            "email_verified_at": current_user.email_verified_at,
            "last_login_at": current_user.last_login_at,
            "created_at": current_user.created_at,
            "timezone": current_user.timezone,
            "language": current_user.language,
            "avatar_url": current_user.avatar_url,
            "bio": current_user.bio,
            "updated_at": current_user.updated_at
        }
        
        # Role-specific data
        if current_user.role == UserRole.PARENT:
            # Add children count and recent activity
            children_count = db.query(Child).filter(
                and_(
                    Child.parent_id == current_user.id,
                    Child.is_active == True
                )
            ).count()
            
            profile_data.update({
                "children_count": children_count,
                "role_specific_data": {
                    "total_children": children_count,
                    "active_children": children_count
                }
            })
            
        elif current_user.role == UserRole.PROFESSIONAL:
            # Add professional profile information
            prof_service = get_professional_service(db)
            prof_profile = prof_service.get_profile_by_user(current_user.id)
            
            profile_data.update({
                "license_number": current_user.license_number,
                "specialization": current_user.specialization,
                "clinic_name": current_user.clinic_name,
                "clinic_address": current_user.clinic_address,
                "professional_profile": prof_profile.__dict__ if prof_profile else None,
                "role_specific_data": {
                    "has_professional_profile": prof_profile is not None,
                    "is_verified": prof_profile.is_verified if prof_profile else False,
                    "patient_count": prof_profile.patient_count if prof_profile else 0
                }
            })
        
        # Calculate profile completion
        completion_score = _calculate_profile_completion(current_user, db)
        profile_data["profile_completion"] = completion_score
        
        return UserDetailResponse(**profile_data)
        
    except Exception as e:
        logger.error(f"Error getting detailed profile for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve detailed profile"
        )

@router.put("/profile", response_model=UserResponse)
async def update_user_profile(
    update_data: Dict[str, Any],
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Update user profile with comprehensive validation
    
    Allows updating:
    - Basic information (name, phone, bio)
    - Preferences (timezone, language)
    - Professional information (for professionals)
    """
    try:
        # Define allowed fields based on role
        allowed_fields = {
            "first_name", "last_name", "phone", "timezone", 
            "language", "bio", "avatar_url"
        }
        
        # Add role-specific allowed fields
        if current_user.role == UserRole.PROFESSIONAL:
            allowed_fields.update({
                "specialization", "clinic_name", "clinic_address"
            })
        
        # Filter update data to only allowed fields
        filtered_data = {
            key: value for key, value in update_data.items()
            if key in allowed_fields
        }
        
        if not filtered_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid fields provided for update"
            )
        
        # Update user fields
        for field, value in filtered_data.items():
            if hasattr(current_user, field):
                setattr(current_user, field, value)
        
        # Update full_name if first_name or last_name changed
        if "first_name" in filtered_data or "last_name" in filtered_data:
            current_user.full_name = f"{current_user.first_name} {current_user.last_name}"
        
        current_user.updated_at = datetime.now(timezone.utc)
        
        db.commit()
        db.refresh(current_user)
        
        logger.info(f"Profile updated for user {current_user.id}")
        return UserResponse.model_validate(current_user)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating profile for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )

@router.post("/profile/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Upload user avatar image
    
    Accepts image files and returns the avatar URL
    In production, this would upload to cloud storage (S3, CloudFront, etc.)
    """
    try:
        # Validate file type
        allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
            )
        
        # Validate file size (max 5MB)
        max_size = 5 * 1024 * 1024  # 5MB
        file_content = await file.read()
        if len(file_content) > max_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size too large. Maximum 5MB allowed."
            )
        
        # In production, upload to cloud storage
        # For now, simulate URL generation
        avatar_url = f"https://avatars.smileadventure.com/users/{current_user.id}/{file.filename}"
        
        # Update user avatar URL
        current_user.avatar_url = avatar_url
        current_user.updated_at = datetime.now(timezone.utc)
        
        db.commit()
        
        logger.info(f"Avatar uploaded for user {current_user.id}")
        return {
            "message": "Avatar uploaded successfully",
            "avatar_url": avatar_url
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading avatar for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload avatar"
        )

@router.delete("/profile/avatar")
async def remove_avatar(
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """Remove user avatar"""
    try:
        current_user.avatar_url = None
        current_user.updated_at = datetime.now(timezone.utc)
        
        db.commit()
        
        return {"message": "Avatar removed successfully"}
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error removing avatar for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to remove avatar"
        )

# =============================================================================
# PROFESSIONAL PROFILE ROUTES
# =============================================================================

@router.post("/professional-profile", response_model=ProfessionalProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_professional_profile(
    profile_data: ProfessionalProfileCreate,
    current_user: User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """
    Create professional profile (Professionals only)
    
    Creates detailed professional profile with credentials,
    specializations, and practice information
    """
    try:
        prof_service = get_professional_service(db)
        
        # Check if profile already exists
        existing_profile = prof_service.get_profile_by_user(current_user.id)
        if existing_profile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Professional profile already exists"
            )
        
        # Create professional profile
        profile = prof_service.create_profile(current_user.id, profile_data)
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create professional profile"
            )
        
        logger.info(f"Professional profile created for user {current_user.id}")
        return ProfessionalProfileResponse.model_validate(profile)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating professional profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create professional profile"
        )

@router.get("/professional-profile", response_model=ProfessionalProfileResponse)
async def get_professional_profile(
    current_user: User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """Get current user's professional profile"""
    try:
        prof_service = get_professional_service(db)
        profile = prof_service.get_profile_by_user(current_user.id)
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Professional profile not found"
            )
        
        return ProfessionalProfileResponse.model_validate(profile)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting professional profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve professional profile"
        )

@router.put("/professional-profile", response_model=ProfessionalProfileResponse)
async def update_professional_profile(
    profile_data: ProfessionalProfileUpdate,
    current_user: User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """Update professional profile"""
    try:
        prof_service = get_professional_service(db)
        
        # Update profile
        updated_profile = prof_service.update_profile(current_user.id, profile_data)
        
        if not updated_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Professional profile not found"
            )
        
        logger.info(f"Professional profile updated for user {current_user.id}")
        return ProfessionalProfileResponse.model_validate(updated_profile)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating professional profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update professional profile"
        )

# =============================================================================
# PREFERENCE MANAGEMENT ROUTES
# =============================================================================

@router.get("/preferences")
async def get_user_preferences(
    current_user: User = Depends(get_current_verified_user)
):
    """Get user preferences and settings"""
    return {
        "user_id": current_user.id,
        "timezone": current_user.timezone,
        "language": current_user.language,
        "notification_preferences": {
            "email_notifications": True,  # Default values
            "push_notifications": True,
            "activity_reminders": True,
            "progress_reports": True
        },
        "privacy_settings": {
            "profile_visibility": "private",
            "data_sharing": False
        },
        "accessibility_settings": {
            "high_contrast": False,
            "large_text": False,
            "screen_reader": False
        }
    }

@router.put("/preferences")
async def update_user_preferences(
    preferences: Dict[str, Any],
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """Update user preferences and settings"""
    try:
        # Update basic preferences
        if "timezone" in preferences:
            current_user.timezone = preferences["timezone"]
        if "language" in preferences:
            current_user.language = preferences["language"]
        
        current_user.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(current_user)
        
        # Return updated preferences (similar to GET endpoint but with updated values)
        logger.info(f"Preferences updated for user {current_user.id}")
        return {
            "user_id": current_user.id,
            "timezone": current_user.timezone,
            "language": current_user.language,
            "notification_preferences": {
                "email_notifications": preferences.get("notifications_enabled", True),
                "push_notifications": True,
                "activity_reminders": True,
                "progress_reports": True
            },
            "privacy_settings": {
                "profile_visibility": preferences.get("privacy_level", "private"),
                "data_sharing": False
            },
            "accessibility_settings": {
                "high_contrast": False,
                "large_text": False,
                "screen_reader": False
            },
            "theme": preferences.get("theme", "light"),
            "notifications_enabled": preferences.get("notifications_enabled", True)
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating preferences for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update preferences")

@router.get("/profile/completion")
async def get_profile_completion(
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """Get user profile completion status and score"""
    try:
        completion_data = _calculate_profile_completion(current_user, db)
        return {
            "user_id": current_user.id,
            "completion_percentage": completion_data.get("percentage", 0),
            "completion_score": completion_data.get("score", 0),
            "total_sections": completion_data.get("total_sections", 10),
            "missing_fields": completion_data.get("missing_sections", []),
            "is_complete": completion_data.get("is_complete", False),
            "recommendations": completion_data.get("recommendations", [])
        }
    except Exception as e:
        logger.error(f"Error getting profile completion for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve profile completion"
        )

# =============================================================================
# ADMIN USER MANAGEMENT ROUTES
# =============================================================================

@router.get("/users/{user_id}", response_model=UserDetailResponse)
async def get_user_by_id(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get detailed user information by ID (Admin only)"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Build detailed response similar to get_detailed_user_profile
        # but with admin-level information
        profile_data = {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "full_name": user.full_name,
            "phone": user.phone,
            "role": user.role.value,
            "status": user.status.value,
            "is_active": user.is_active,
            "is_verified": user.is_verified,
            "email_verified_at": user.email_verified_at,
            "last_login_at": user.last_login_at,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
            "failed_login_attempts": user.failed_login_attempts,
            "locked_until": user.locked_until
        }
        
        return UserDetailResponse(**profile_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user"
        )

@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: int,
    status_data: Dict[str, str],
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update user status (Admin only)"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update status
        if "status" in status_data:
            try:
                new_status = UserStatus(status_data["status"])
                user.status = new_status
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid status value"
                )
        
        if "is_active" in status_data:
            user.is_active = bool(status_data["is_active"])
        
        user.updated_at = datetime.now(timezone.utc)
        user.last_modified_by = current_user.id
        
        db.commit()
        
        logger.info(f"User {user_id} status updated by admin {current_user.id}")
        return {"message": "User status updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating user status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user status"
        )

# =============================================================================
# PROFILE SEARCH AND DISCOVERY ROUTES
# =============================================================================

@router.get("/professionals/search")
async def search_professionals(
    specialty: Optional[str] = None,
    location: Optional[str] = None,
    accepts_new_patients: bool = True,
    limit: int = 20,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Search for professional profiles
    
    Available to all verified users for finding healthcare providers
    """
    try:
        prof_service = get_professional_service(db)
        
        professionals = prof_service.search_professionals(
            specialty=specialty,
            location=location,
            accepts_new_patients=accepts_new_patients,
            limit=limit
        )
        
        # Convert to response format
        professionals_response = [
            ProfessionalProfileResponse.model_validate(prof)
            for prof in professionals
        ]
        
        return {
            "professionals": professionals_response,
            "total": len(professionals_response),
            "filters": {
                "specialty": specialty,
                "location": location,
                "accepts_new_patients": accepts_new_patients
            }
        }
        
    except Exception as e:
        logger.error(f"Error searching professionals: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search professionals"
        )

# =============================================================================
# SEARCH AND DISCOVERY ENDPOINTS
# =============================================================================

@router.post("/profile/search/professionals")
async def search_professionals_with_filters(
    search_data: Dict[str, Any],
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Search for professionals with advanced filters (POST version)
    
    Supports complex search criteria including specializations,
    location, experience, and other professional attributes
    """
    try:
        prof_service = get_professional_service(db)
        
        # Extract search parameters
        specialty = search_data.get("specializations", [None])[0] if search_data.get("specializations") else None
        location = search_data.get("location")
        accepts_new_patients = search_data.get("accepts_insurance", True)
        limit = search_data.get("limit", 20)
        
        professionals = prof_service.search_professionals(
            specialty=specialty,
            location=location,
            accepts_new_patients=accepts_new_patients,
            limit=limit
        )
        
        # Convert to response format
        professionals_response = [
            ProfessionalProfileResponse.model_validate(prof)
            for prof in professionals
        ]
        
        return professionals_response
        
    except Exception as e:
        logger.error(f"Error searching professionals with filters: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search professionals"
        )

@router.get("/profile/professional/{professional_id}")
async def get_professional_public_profile(
    professional_id: int,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Get public professional profile by ID
    
    Returns professional profile information that is safe
    to share publicly (excluding sensitive data)
    """
    try:
        prof_service = get_professional_service(db)
        
        # Get the professional user
        professional_user = db.query(User).filter(
            and_(
                User.id == professional_id,
                User.role == UserRole.PROFESSIONAL,
                User.is_active == True
            )
        ).first()
        
        if not professional_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Professional not found"
            )
        
        # Get professional profile
        profile = prof_service.get_profile_by_user(professional_id)
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Professional profile not found"
            )
        
        # Return public profile information
        return {
            "id": professional_user.id,
            "role": professional_user.role,
            "first_name": professional_user.first_name,
            "last_name": professional_user.last_name,
            "bio": professional_user.bio,
            "specialization": professional_user.specialization,
            "clinic_name": professional_user.clinic_name,
            "clinic_address": professional_user.clinic_address,
            "professional_profile": ProfessionalProfileResponse.model_validate(profile).__dict__
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting professional public profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve professional profile"
        )

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def _calculate_profile_completion(user: User, db: Session) -> Dict[str, Any]:
    """Calculate profile completion score and missing sections"""
    score = 0
    total_sections = 10
    missing_sections = []
    
    # Basic information (2 points each)
    if user.first_name and user.last_name:
        score += 2
    else:
        missing_sections.append("basic_info")
    
    if user.phone:
        score += 1
    else:
        missing_sections.append("phone")
    
    if user.bio:
        score += 1
    else:
        missing_sections.append("bio")
    
    if user.avatar_url:
        score += 1
    else:
        missing_sections.append("avatar")
    
    # Email verification (2 points)
    if user.is_verified:
        score += 2
    else:
        missing_sections.append("email_verification")
    
    # Role-specific completion
    if user.role == UserRole.PROFESSIONAL:
        if user.license_number and user.specialization:
            score += 2
        else:
            missing_sections.append("professional_credentials")
            
        # Check for professional profile
        prof_service = get_professional_service(db)
        prof_profile = prof_service.get_profile_by_user(user.id)
        if prof_profile:
            score += 1
        else:
            missing_sections.append("professional_profile")
    
    elif user.role == UserRole.PARENT:
        # Check if parent has any children
        children_count = db.query(Child).filter(
            and_(
                Child.parent_id == user.id,
                Child.is_active == True
            )
        ).count()
        
        if children_count > 0:
            score += 3
        else:
            missing_sections.append("children_profiles")
    
    completion_percentage = (score / total_sections) * 100
    
    return {
        "completion_percentage": min(100, completion_percentage),
        "score": score,
        "max_score": total_sections,
        "missing_sections": missing_sections,
        "is_complete": completion_percentage >= 80
    }