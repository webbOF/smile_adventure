"""
Database models for users and children
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    """Parent/Guardian user model"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship with children
    children = relationship("Child", back_populates="parent")

class Child(Base):
    """Child user model"""
    __tablename__ = "children"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    avatar_url = Column(String, nullable=True)
    points = Column(Integer, default=0)
    level = Column(Integer, default=1)
    parent_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    parent = relationship("User", back_populates="children")
    activities = relationship("Activity", back_populates="child")

class Activity(Base):
    """Activity tracking model"""
    __tablename__ = "activities"
    
    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"), nullable=False)
    activity_type = Column(String, nullable=False)  # 'dental_care', 'medication', 'exercise', etc.
    description = Column(Text, nullable=True)
    points_earned = Column(Integer, default=0)
    completed_at = Column(DateTime(timezone=True), server_default=func.now())
    verified_by_parent = Column(Boolean, default=False)
    
    # Relationship
    child = relationship("Child", back_populates="activities")
