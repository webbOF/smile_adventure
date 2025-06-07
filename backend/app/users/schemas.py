"""
Pydantic schemas for request/response models
"""

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Child schemas
class ChildBase(BaseModel):
    name: str
    age: int
    avatar_url: Optional[str] = None

class ChildCreate(ChildBase):
    pass

class ChildResponse(ChildBase):
    id: int
    points: int
    level: int
    parent_id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Activity schemas
class ActivityBase(BaseModel):
    activity_type: str
    description: Optional[str] = None
    points_earned: int = 0

class ActivityCreate(ActivityBase):
    child_id: int

class ActivityResponse(ActivityBase):
    id: int
    child_id: int
    completed_at: datetime
    verified_by_parent: bool
    
    class Config:
        from_attributes = True

# Combined response schemas
class UserWithChildren(UserResponse):
    children: List[ChildResponse] = []

class ChildWithActivities(ChildResponse):
    activities: List[ActivityResponse] = []
