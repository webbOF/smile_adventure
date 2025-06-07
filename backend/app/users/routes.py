"""
User management routes and endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.auth.routes import get_current_user
from app.users import crud, schemas
from app.users.models import User

router = APIRouter()

@router.post("/register", response_model=schemas.UserResponse)
async def register_user(
    user_data: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    """
    Register a new user (parent/guardian)
    """
    # Check if user already exists
    existing_user = crud.get_user_by_email(db, email=user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user = crud.create_user(
        db=db,
        email=user_data.email,
        password=user_data.password,
        full_name=user_data.full_name,
        phone=user_data.phone
    )
    
    return user

@router.get("/me", response_model=schemas.UserWithChildren)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user profile with children
    """
    children = crud.get_children_by_parent(db, parent_id=current_user.id)
    user_data = schemas.UserResponse.from_orm(current_user)
    children_data = [schemas.ChildResponse.from_orm(child) for child in children]
    
    return schemas.UserWithChildren(
        **user_data.dict(),
        children=children_data
    )

@router.post("/children", response_model=schemas.ChildResponse)
async def create_child(
    child_data: schemas.ChildCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new child profile
    """
    child = crud.create_child(
        db=db,
        name=child_data.name,
        age=child_data.age,
        parent_id=current_user.id,
        avatar_url=child_data.avatar_url
    )
    
    return child

@router.get("/children", response_model=List[schemas.ChildResponse])
async def get_my_children(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all children for current user
    """
    children = crud.get_children_by_parent(db, parent_id=current_user.id)
    return children

@router.get("/children/{child_id}", response_model=schemas.ChildWithActivities)
async def get_child_details(
    child_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get child details with recent activities
    """
    child = crud.get_child_by_id(db, child_id=child_id)
    
    if not child or child.parent_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child not found"
        )
    
    activities = crud.get_activities_by_child(db, child_id=child_id, limit=20)
    child_data = schemas.ChildResponse.from_orm(child)
    activities_data = [schemas.ActivityResponse.from_orm(activity) for activity in activities]
    
    return schemas.ChildWithActivities(
        **child_data.dict(),
        activities=activities_data
    )

@router.post("/activities", response_model=schemas.ActivityResponse)
async def create_activity(
    activity_data: schemas.ActivityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new activity for a child
    """
    # Verify child belongs to current user
    child = crud.get_child_by_id(db, child_id=activity_data.child_id)
    if not child or child.parent_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child not found"
        )
    
    activity = crud.create_activity(
        db=db,
        child_id=activity_data.child_id,
        activity_type=activity_data.activity_type,
        description=activity_data.description,
        points_earned=activity_data.points_earned
    )
    
    return activity
