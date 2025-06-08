"""
Database models for users and children - FIXED VERSION
Eliminato conflitto User model, ora usa solo auth/models.py
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

# Import User dal modulo auth (single source of truth)
from app.auth.models import User

class Child(Base):
    """Child user model - Enhanced with ASD support"""
    __tablename__ = "children"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    avatar_url = Column(String(500), nullable=True)
    
    # Gamification fields
    points = Column(Integer, default=0)
    level = Column(Integer, default=1)
    
    # ASD-specific fields (enhanced from original)
    diagnosis = Column(String(200), nullable=True)  # ASD diagnosis details
    support_level = Column(Integer, nullable=True)  # 1, 2, or 3
    sensory_profile = Column(JSON, nullable=True)   # JSON sensory preferences
    behavioral_notes = Column(Text, nullable=True)  # Clinical notes
    
    # Parent relationship - now references auth User model
    parent_id = Column(Integer, ForeignKey("auth_users.id"), nullable=False, index=True)
    
    # Status and metadata
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
      # Relationships - corrected to use auth User
    parent = relationship("User")  # Remove back_populates to avoid circular import issues
    activities = relationship("Activity", back_populates="child", cascade="all, delete-orphan")
    game_sessions = relationship("GameSession", back_populates="child", cascade="all, delete-orphan")
    
    def calculate_level(self) -> int:
        """Calculate level based on points (100 points per level)"""
        return (self.points // 100) + 1
    
    def add_points(self, points: int) -> None:
        """Add points and update level"""
        self.points += points
        self.level = self.calculate_level()
    
    def __repr__(self):
        return f"<Child {self.name} (age {self.age}, level {self.level})>"

class Activity(Base):
    """Activity tracking model - Enhanced for ASD children"""
    __tablename__ = "activities"
    
    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"), nullable=False, index=True)
    
    # Activity details
    activity_type = Column(String(50), nullable=False, index=True)  # 'dental_care', 'therapy_session', etc.
    activity_name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    
    # Gamification
    points_earned = Column(Integer, default=0)
    
    # Completion tracking
    completed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    verified_by_parent = Column(Boolean, default=False)
    
    # ASD-specific tracking
    emotional_state_before = Column(String(50), nullable=True)  # calm, anxious, excited, etc.
    emotional_state_after = Column(String(50), nullable=True)
    difficulty_level = Column(Integer, nullable=True)  # 1-5 scale
    support_needed = Column(String(100), nullable=True)  # minimal, moderate, extensive
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    child = relationship("Child", back_populates="activities")
    
    def __repr__(self):
        return f"<Activity {self.activity_type}: {self.activity_name} (+{self.points_earned}pts)>"

class GameSession(Base):
    """Game session tracking for Smile Adventure interactions"""
    __tablename__ = "game_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"), nullable=False, index=True)
    
    # Session details
    session_type = Column(String(50), nullable=False)  # dental_visit, therapy_session, free_play
    scenario_name = Column(String(200), nullable=False)
    
    # Timing
    started_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    duration_seconds = Column(Integer, nullable=True)  # Calculated duration
    
    # Game progress
    levels_completed = Column(Integer, default=0)
    score = Column(Integer, default=0)
    interactions_count = Column(Integer, default=0)
    
    # ASD progress tracking
    emotional_data = Column(JSON, nullable=True)  # Track emotional states during session
    interaction_data = Column(JSON, nullable=True)  # Track how child interacted
    completion_status = Column(String(20), default="in_progress")  # in_progress, completed, abandoned
    
    # Parent feedback
    parent_notes = Column(Text, nullable=True)
    parent_rating = Column(Integer, nullable=True)  # 1-5 scale
    
    # Relationship
    child = relationship("Child", back_populates="game_sessions")
    
    def mark_completed(self) -> None:
        """Mark session as completed and calculate duration"""
        from datetime import datetime, timezone
        self.ended_at = datetime.now(timezone.utc)
        if self.started_at:
            delta = self.ended_at - self.started_at
            self.duration_seconds = int(delta.total_seconds())
        self.completion_status = "completed"
    
    def __repr__(self):
        return f"<GameSession {self.scenario_name} for {self.child.name if self.child else 'Unknown'}>"