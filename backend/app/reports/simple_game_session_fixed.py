"""
Simple GameSession model matching the actual database schema
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class GameSession(Base):
    """
    GameSession model matching the actual database table structure
    """
    __tablename__ = "game_sessions"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign key to children table
    child_id = Column(Integer, ForeignKey("children.id"), nullable=False, index=True)
    
    # Session details
    session_type = Column(String(50), nullable=False)
    scenario_name = Column(String(200), nullable=False)
    scenario_id = Column(String(100), nullable=True)
    
    # Timing
    started_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    
    # Progress and performance
    levels_completed = Column(Integer, nullable=False, default=0)
    max_level_reached = Column(Integer, nullable=False, default=0)
    score = Column(Integer, nullable=False, default=0)
    interactions_count = Column(Integer, nullable=False, default=0)
    correct_responses = Column(Integer, nullable=False, default=0)
    help_requests = Column(Integer, nullable=False, default=0)
    
    # Data analysis
    emotional_data = Column(JSON, nullable=True)
    interaction_patterns = Column(JSON, nullable=True)
    
    # Session status
    completion_status = Column(String(20), nullable=False, default="in_progress")
    exit_reason = Column(String(100), nullable=True)
    achievement_unlocked = Column(JSON, nullable=False, default=list)
    
    # Parent feedback
    parent_notes = Column(Text, nullable=True)
    parent_rating = Column(Integer, nullable=True)
    parent_observed_behavior = Column(JSON, nullable=True)
    
    # Technical metadata
    device_type = Column(String(50), nullable=True)
    app_version = Column(String(20), nullable=True)
    session_data_quality = Column(String(20), nullable=False, default="good")
