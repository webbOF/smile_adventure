"""
Game Session Model - Aligned with actual database schema
Simplified model that matches the existing database structure
"""

from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, JSON, Float, Enum
from sqlalchemy.orm import relationship, validates
from sqlalchemy.sql import func
from sqlalchemy.ext.hybrid import hybrid_property
import enum

from app.core.database import Base

# =============================================================================
# SIMPLIFIED GAME SESSION MODEL - MATCHES DATABASE SCHEMA
# =============================================================================

class GameSession(Base):
    """
    Game Session model - aligned with actual database schema
    Tracks individual game sessions for progress monitoring and reporting
    """
    __tablename__ = "game_sessions"
    
    # Primary fields - matching actual database schema exactly
    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"), nullable=False, index=True)
    
    # Session identification and type - using String to match current DB schema
    session_type = Column(String(50), nullable=False, index=True)
    scenario_name = Column(String(200), nullable=False)
    scenario_id = Column(String(100), nullable=True, index=True)
    
    # Timing information
    started_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    
    # Performance metrics
    levels_completed = Column(Integer, default=0, nullable=False)
    max_level_reached = Column(Integer, default=0, nullable=False)
    score = Column(Integer, default=0, nullable=False)
    interactions_count = Column(Integer, default=0, nullable=False)
    correct_responses = Column(Integer, default=0, nullable=False)
    help_requests = Column(Integer, default=0, nullable=False)
    
    # Session data
    emotional_data = Column(JSON, nullable=True)
    interaction_patterns = Column(JSON, nullable=True)
    completion_status = Column(String(20), default="in_progress", nullable=False)
    exit_reason = Column(String(100), nullable=True)
    achievement_unlocked = Column(JSON, default=list, nullable=False)
    
    # Parent feedback and observations
    parent_notes = Column(Text, nullable=True)
    parent_rating = Column(Integer, nullable=True)
    parent_observed_behavior = Column(JSON, nullable=True)
    
    # Technical metadata
    device_type = Column(String(50), nullable=True)
    app_version = Column(String(20), nullable=True)
    session_data_quality = Column(String(20), default="good", nullable=False)
    
    # =========================================================================
    # CALCULATED PROPERTIES AND METHODS
    # =========================================================================
    
    @hybrid_property
    def success_rate(self) -> float:
        """Calculate success rate based on correct vs total responses"""
        total_responses = self.correct_responses + (self.interactions_count - self.correct_responses)
        if total_responses == 0:
            return 0.0
        return round((self.correct_responses / total_responses) * 100, 2)
    
    @hybrid_property
    def engagement_score(self) -> float:
        """Calculate engagement score based on interactions and session duration"""
        if not self.duration_seconds or self.duration_seconds == 0:
            return 0.0
        
        # Base engagement on interactions per minute
        interactions_per_minute = (self.interactions_count / self.duration_seconds) * 60
        
        # Normalize to 0-100 scale (assuming 5 interactions per minute is optimal)
        base_score = min(interactions_per_minute / 5, 1.0) * 50
        
        # Add bonus for completion and achievements
        completion_bonus = 30 if self.completion_status == "completed" else 0
        achievement_bonus = min(len(self.achievement_unlocked or []) * 5, 20)
        
        return round(min(base_score + completion_bonus + achievement_bonus, 100), 2)
    
    @hybrid_property
    def duration_minutes(self) -> float:
        """Get duration in minutes"""
        if self.duration_seconds:
            return round(self.duration_seconds / 60, 2)
        return 0.0
    
    @hybrid_property
    def final_score(self) -> int:
        """Alias for score field for compatibility"""
        return self.score
    
    @hybrid_property
    def game_data(self) -> dict:
        """Combine various data fields into game_data structure"""
        return {
            "emotional_data": self.emotional_data,
            "interaction_patterns": self.interaction_patterns,
            "achievements": self.achievement_unlocked,
            "level": self.max_level_reached,
            "completion_status": self.completion_status
        }
    
    def mark_completed(self, exit_reason: str = "completed"):
        """Mark session as completed and calculate final metrics"""
        self.completion_status = "completed"
        self.exit_reason = exit_reason
        self.ended_at = datetime.now(timezone.utc)
        
        if self.started_at:
            duration = self.ended_at - self.started_at
            self.duration_seconds = int(duration.total_seconds())
    
    @validates('parent_rating')
    def validate_parent_rating(self, key, value):
        """Validate parent rating is between 1 and 5"""
        if value is not None and (value < 1 or value > 5):
            raise ValueError("Parent rating must be between 1 and 5")
        return value
    
    @validates('completion_status')
    def validate_completion_status(self, key, value):
        """Validate completion status"""
        valid_statuses = ['in_progress', 'completed', 'abandoned', 'interrupted']
        if value not in valid_statuses:
            raise ValueError(f"Completion status must be one of: {valid_statuses}")
        return value
    
    def __repr__(self):
        return f"<GameSession {self.id}: {self.scenario_name} for child {self.child_id}>"
