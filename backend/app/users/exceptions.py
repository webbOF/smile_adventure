# filepath: app/users/exceptions.py
"""
Custom exceptions for user profile operations
Task 14 - Profile Enhancement Exceptions
"""

from fastapi import HTTPException
from typing import Optional


class ProfileException(HTTPException):
    """Base exception for profile-related operations"""
    
    def __init__(self, status_code: int, detail: str, headers: Optional[dict] = None):
        super().__init__(status_code=status_code, detail=detail, headers=headers)


class ProfileNotFoundError(ProfileException):
    """Raised when a user profile is not found"""
    
    def __init__(self, user_id: int):
        super().__init__(
            status_code=404,
            detail=f"Profile not found for user ID: {user_id}"
        )


class InvalidAvatarError(ProfileException):
    """Raised when avatar upload fails validation"""
    
    def __init__(self, detail: str = "Invalid avatar file"):
        super().__init__(
            status_code=400,
            detail=detail
        )


class AvatarUploadError(ProfileException):
    """Raised when avatar upload fails"""
    
    def __init__(self, detail: str = "Failed to upload avatar"):
        super().__init__(
            status_code=500,
            detail=detail
        )


class ProfileUpdateError(ProfileException):
    """Raised when profile update fails"""
    
    def __init__(self, detail: str = "Failed to update profile"):
        super().__init__(
            status_code=400,
            detail=detail
        )


class InsufficientPermissionsError(ProfileException):
    """Raised when user lacks permissions for operation"""
    
    def __init__(self, detail: str = "Insufficient permissions"):
        super().__init__(
            status_code=403,
            detail=detail
        )


class ProfessionalNotFoundError(ProfileException):
    """Raised when professional profile is not found"""
    
    def __init__(self, professional_id: int):
        super().__init__(
            status_code=404,
            detail=f"Professional not found with ID: {professional_id}"
        )


class PreferencesUpdateError(ProfileException):
    """Raised when user preferences update fails"""
    
    def __init__(self, detail: str = "Failed to update preferences"):
        super().__init__(
            status_code=400,
            detail=detail
        )


class AdminOperationError(ProfileException):
    """Raised when admin operation fails"""
    
    def __init__(self, detail: str = "Admin operation failed"):
        super().__init__(
            status_code=400,
            detail=detail
        )


class FileValidationError(ProfileException):
    """Raised when file validation fails"""
    
    def __init__(self, detail: str = "File validation failed"):
        super().__init__(
            status_code=400,
            detail=detail
        )


class SearchError(ProfileException):
    """Raised when search operation fails"""
    
    def __init__(self, detail: str = "Search operation failed"):
        super().__init__(
            status_code=400,
            detail=detail
        )
