"""
Professional Routes for Task 16 - Clinical Analytics Integration
Direct professional profile routes as expected by Task 16 tests
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.auth.dependencies import get_current_user, require_professional
from app.users.models import User
from app.users.schemas import ProfessionalProfileCreate, ProfessionalProfileUpdate, ProfessionalProfileResponse
from app.users.profile_routes import (
    create_professional_profile as _create_professional_profile,
    get_professional_profile as _get_professional_profile, 
    update_professional_profile as _update_professional_profile,
    search_professionals as _search_professionals
)

router = APIRouter()

@router.post("/professional-profile", response_model=ProfessionalProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_professional_profile(
    profile_data: ProfessionalProfileCreate,
    current_user: User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """
    Create professional profile (Task 16 endpoint)
    Redirects to existing implementation in profile_routes
    """
    return await _create_professional_profile(profile_data, current_user, db)

@router.get("/professional-profile", response_model=ProfessionalProfileResponse)
async def get_professional_profile(
    current_user: User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """
    Get professional profile (Task 16 endpoint)
    Redirects to existing implementation in profile_routes
    """
    return await _get_professional_profile(current_user, db)

@router.put("/professional-profile", response_model=ProfessionalProfileResponse)
async def update_professional_profile(
    profile_data: ProfessionalProfileUpdate,
    current_user: User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """
    Update professional profile (Task 16 endpoint)
    Redirects to existing implementation in profile_routes
    """
    return await _update_professional_profile(profile_data, current_user, db)

@router.get("/professionals/search")
async def search_professionals(
    specialty: Optional[str] = Query(None, description="Filter by specialty"),
    location: Optional[str] = Query(None, description="Filter by location (city, state, or country)"),
    accepting_patients: Optional[bool] = Query(None, description="Filter by professionals accepting new patients"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of results"),
    current_user: User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """
    Search professionals with filters (Task 16 endpoint)
    Redirects to existing implementation in profile_routes
    """
    # Map accepting_patients to accepts_new_patients parameter name
    accepts_new_patients = accepting_patients if accepting_patients is not None else True
    
    return await _search_professionals(
        specialty=specialty,
        location=location,
        accepts_new_patients=accepts_new_patients,
        limit=limit,
        current_user=current_user,
        db=db
    )
