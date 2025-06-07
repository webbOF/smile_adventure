"""
CRUD operations for users and children
"""

from sqlalchemy.orm import Session
from app.users.models import User, Child, Activity
from app.auth.utils import get_password_hash
from typing import Optional, List

# User CRUD operations
def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user by email"""
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Get user by ID"""
    return db.query(User).filter(User.id == user_id).first()

def create_user(db: Session, email: str, password: str, full_name: str, phone: str = None) -> User:
    """Create new user"""
    hashed_password = get_password_hash(password)
    db_user = User(
        email=email,
        hashed_password=hashed_password,
        full_name=full_name,
        phone=phone
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Child CRUD operations
def get_children_by_parent(db: Session, parent_id: int) -> List[Child]:
    """Get all children for a parent"""
    return db.query(Child).filter(Child.parent_id == parent_id, Child.is_active == True).all()

def get_child_by_id(db: Session, child_id: int) -> Optional[Child]:
    """Get child by ID"""
    return db.query(Child).filter(Child.id == child_id).first()

def create_child(db: Session, name: str, age: int, parent_id: int, avatar_url: str = None) -> Child:
    """Create new child"""
    db_child = Child(
        name=name,
        age=age,
        parent_id=parent_id,
        avatar_url=avatar_url
    )
    db.add(db_child)
    db.commit()
    db.refresh(db_child)
    return db_child

def update_child_points(db: Session, child_id: int, points_to_add: int) -> Optional[Child]:
    """Update child's points and level"""
    child = get_child_by_id(db, child_id)
    if child:
        child.points += points_to_add
        # Simple level calculation: level up every 100 points
        child.level = (child.points // 100) + 1
        db.commit()
        db.refresh(child)
    return child

# Activity CRUD operations
def create_activity(
    db: Session, 
    child_id: int, 
    activity_type: str, 
    description: str = None, 
    points_earned: int = 0
) -> Activity:
    """Create new activity"""
    db_activity = Activity(
        child_id=child_id,
        activity_type=activity_type,
        description=description,
        points_earned=points_earned
    )
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    
    # Update child's points
    if points_earned > 0:
        update_child_points(db, child_id, points_earned)
    
    return db_activity

def get_activities_by_child(db: Session, child_id: int, limit: int = 50) -> List[Activity]:
    """Get recent activities for a child"""
    return db.query(Activity).filter(Activity.child_id == child_id).order_by(Activity.completed_at.desc()).limit(limit).all()
