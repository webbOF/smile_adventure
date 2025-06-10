"""
Users Models - Enhanced for ASD Children and Healthcare Professionals
Extends the existing auth system with specialized models for comprehensive autism support
"""

from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, JSON, Float
from sqlalchemy.orm import relationship, validates
from sqlalchemy.sql import func
from sqlalchemy.ext.hybrid import hybrid_property
import enum

from app.core.database import Base
from app.auth.models import User, UserRole  # Import existing User model

# =============================================================================
# CONSTANTS
# =============================================================================

CASCADE_DELETE_ORPHAN = "all, delete-orphan"
CHILDREN_TABLE_ID = "children.id"
USERS_TABLE_ID = "auth_users.id"

# =============================================================================
# ENUMS FOR ASD-SPECIFIC DATA
# =============================================================================

class SupportLevel(enum.Enum):
    """ASD Support Level Classification"""
    LEVEL_1 = 1  # Requiring support
    LEVEL_2 = 2  # Requiring substantial support  
    LEVEL_3 = 3  # Requiring very substantial support

class ActivityType(enum.Enum):
    """Types of activities for tracking"""
    DENTAL_CARE = "dental_care"
    THERAPY_SESSION = "therapy_session"
    MEDICATION = "medication"
    EXERCISE = "exercise"
    SOCIAL_INTERACTION = "social_interaction"
    SENSORY_BREAK = "sensory_break"
    EDUCATIONAL = "educational"
    FREE_PLAY = "free_play"

# =============================================================================
# CHILD MODEL - ASD-FOCUSED
# =============================================================================

class Child(Base):
    """
    Child model with ASD-specific features and progress tracking
    Designed for comprehensive autism spectrum support
    """
    __tablename__ = "children"
    
    # Primary fields
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    age = Column(Integer, nullable=False)
    date_of_birth = Column(DateTime(timezone=True), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    
    # Parent relationship - references existing auth User
    parent_id = Column(Integer, ForeignKey("auth_users.id"), nullable=False, index=True)
    
    # Gamification fields
    points = Column(Integer, default=0, nullable=False)
    level = Column(Integer, default=1, nullable=False)
    achievements = Column(JSON, default=list, nullable=False)  # List of achievement IDs
    
    # ASD-specific clinical information
    diagnosis = Column(String(200), nullable=True, 
                      doc="Specific ASD diagnosis details")
    support_level = Column(Integer, nullable=True,
                          doc="Support level 1-3 based on DSM-5")
    diagnosis_date = Column(DateTime(timezone=True), nullable=True)
    diagnosing_professional = Column(String(200), nullable=True)
    
    # Comprehensive sensory profile (JSON structure)
    sensory_profile = Column(JSON, nullable=True, doc="""
    {
        "auditory": {"sensitivity": "high|moderate|low", "preferences": []},
        "visual": {"sensitivity": "high|moderate|low", "triggers": []},
        "tactile": {"sensitivity": "high|moderate|low", "preferred_textures": []},
        "vestibular": {"sensitivity": "high|moderate|low", "activities": []},
        "proprioceptive": {"needs": "high|moderate|low", "activities": []},
        "gustatory": {"sensitivity": "high|moderate|low", "preferences": []},
        "olfactory": {"sensitivity": "high|moderate|low", "triggers": []}
    }
    """)
    
    # Behavioral and clinical notes
    behavioral_notes = Column(Text, nullable=True,
                             doc="Clinical observations and behavioral patterns")
    communication_style = Column(String(100), nullable=True,
                                doc="verbal|non-verbal|mixed|alternative")
    communication_notes = Column(Text, nullable=True)
    
    # Therapy and intervention information
    current_therapies = Column(JSON, default=list, nullable=False, doc="""
    [
        {
            "type": "ABA|speech|occupational|physical",
            "provider": "provider_name",
            "frequency": "2x_weekly",
            "start_date": "2024-01-01",
            "goals": ["goal1", "goal2"]
        }
    ]
    """)
    
    # Emergency and safety information
    emergency_contacts = Column(JSON, default=list, nullable=False)
    safety_protocols = Column(JSON, default=dict, nullable=False, doc="""
    {
        "elopement_risk": "high|moderate|low|none",
        "medical_conditions": [],
        "medications": [],
        "emergency_procedures": [],
        "calming_strategies": []
    }
    """)
    
    # Progress tracking fields
    baseline_assessment = Column(JSON, nullable=True, doc="Initial assessment data")
    last_assessment_date = Column(DateTime(timezone=True), nullable=True)
    progress_notes = Column(JSON, default=list, nullable=False)
      # Status and metadata
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
      # Relationships
    parent = relationship("User", back_populates="children")
    activities = relationship("Activity", back_populates="child", 
                            cascade=CASCADE_DELETE_ORPHAN, lazy="dynamic")
    game_sessions = relationship("GameSession", back_populates="child", 
                               cascade=CASCADE_DELETE_ORPHAN, lazy="dynamic")
    assessments = relationship("Assessment", back_populates="child",
                             cascade=CASCADE_DELETE_ORPHAN, lazy="dynamic")
    reports = relationship("Report", back_populates="child",
                          cascade=CASCADE_DELETE_ORPHAN, lazy="dynamic")
    
    # ==========================================================================
    # VALIDATION METHODS
    # ==========================================================================
    
    @validates('age')
    def validate_age(self, key, age):
        """Validate age is reasonable for ASD tracking"""
        if age < 0 or age > 25:
            raise ValueError("Age must be between 0 and 25 for this system")
        return age
    
    @validates('support_level')
    def validate_support_level(self, key, level):
        """Validate ASD support level"""
        if level is not None and level not in [1, 2, 3]:
            raise ValueError("Support level must be 1, 2, or 3 based on DSM-5")
        return level
    
    @validates('name')
    def validate_name(self, key, name):
        """Validate and format child name"""
        if not name or not name.strip():
            raise ValueError("Child name cannot be empty")
        return name.strip().title()
    
    # ==========================================================================
    # BUSINESS LOGIC METHODS
    # ==========================================================================
    
    def calculate_level(self) -> int:
        """Calculate level based on points (100 points per level)"""
        return min((self.points // 100) + 1, 50)  # Max level 50
    
    def add_points(self, points: int, activity_type: str = None) -> dict:
        """
        Add points and update level with activity context
        
        Returns:
            dict: Updated stats and any level-up information
        """
        old_level = self.level
        self.points += points
        self.level = self.calculate_level()
        
        result = {
            "points_added": points,
            "total_points": self.points,
            "old_level": old_level,
            "new_level": self.level,
            "level_up": self.level > old_level
        }
        
        # Check for achievements
        if activity_type and self.level > old_level:
            achievement = self._check_achievements(activity_type, self.level)
            if achievement:
                result["achievement"] = achievement
        
        return result
    
    def get_current_week_points(self) -> int:
        """Get points earned in current week"""
        from datetime import timedelta
        week_ago = datetime.now(timezone.utc) - timedelta(days=7)
        
        # This would require a query in practice - placeholder
        return sum(
            activity.points_earned 
            for activity in self.activities 
            if activity.completed_at >= week_ago
        )
    
    def get_sensory_preferences(self, category: str = None) -> dict:
        """Get sensory preferences for specific category or all"""
        if not self.sensory_profile:
            return {}
        
        if category:
            return self.sensory_profile.get(category, {})
        
        return self.sensory_profile
    
    def update_sensory_profile(self, category: str, data: dict) -> None:
        """Update specific sensory category"""
        if not self.sensory_profile:
            self.sensory_profile = {}
        
        self.sensory_profile[category] = data
        # Mark as modified for SQLAlchemy
        self.sensory_profile = self.sensory_profile.copy()
    
    def add_progress_note(self, note: str, author: str, category: str = "general") -> None:
        """Add a progress note with timestamp"""
        if not self.progress_notes:
            self.progress_notes = []
        
        progress_note = {
            "date": datetime.now(timezone.utc).isoformat(),
            "author": author,
            "category": category,
            "note": note
        }
        
        self.progress_notes.append(progress_note)
        # Mark as modified for SQLAlchemy
        self.progress_notes = self.progress_notes.copy()
    
    def _check_achievements(self, activity_type: str, level: int) -> Optional[dict]:
        """Check and award achievements based on activity and level"""
        achievement_map = {
            "dental_care": {
                5: "dental_rookie",
                10: "dental_champion", 
                20: "dental_master"
            },
            "therapy_session": {
                5: "therapy_starter",
                15: "therapy_dedicated",
                30: "therapy_expert"
            }
        }
        
        if activity_type in achievement_map:
            level_achievements = achievement_map[activity_type]
            for req_level, achievement_id in level_achievements.items():
                if level >= req_level and achievement_id not in self.achievements:
                    self.achievements.append(achievement_id)
                    # Mark as modified for SQLAlchemy
                    self.achievements = self.achievements.copy()
                    
                    return {
                        "id": achievement_id,
                        "name": achievement_id.replace("_", " ").title(),
                        "earned_at": datetime.now(timezone.utc).isoformat()
                    }
        
        return None
    
    # ==========================================================================
    # HYBRID PROPERTIES
    # ==========================================================================
    
    @hybrid_property
    def full_profile_complete(self) -> bool:
        """Check if child has complete profile for optimal tracking"""
        required_fields = [
            self.diagnosis,
            self.support_level,
            self.sensory_profile,
            self.communication_style
        ]
        return all(field is not None for field in required_fields)
    
    @hybrid_property
    def age_category(self) -> str:
        """Get age category for age-appropriate interventions"""
        if self.age < 3:
            return "early_intervention"
        elif self.age < 6:
            return "preschool"
        elif self.age < 12:
            return "elementary"
        elif self.age < 18:
            return "adolescent"
        else:
            return "adult"
    
    # ==========================================================================
    # REPRESENTATION METHODS
    # ==========================================================================
    
    def __repr__(self):
        return f"<Child {self.name} (age {self.age}, level {self.level}, {self.points}pts)>"
    
    def __str__(self):
        return f"{self.name} - Level {self.level}"

# =============================================================================
# ACTIVITY TRACKING MODEL
# =============================================================================

class Activity(Base):
    """
    Activity tracking with comprehensive ASD-focused data collection
    """
    __tablename__ = "activities"
    
    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey(CHILDREN_TABLE_ID), nullable=False, index=True)
    
    # Activity identification
    activity_type = Column(String(50), nullable=False, index=True)
    activity_name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=True, index=True)  # healthcare, education, social
    
    # Gamification
    points_earned = Column(Integer, default=0, nullable=False)
    difficulty_level = Column(Integer, nullable=True)  # 1-5 scale
    
    # Timing and completion
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    duration_minutes = Column(Integer, nullable=True)
    
    # ASD-specific tracking
    emotional_state_before = Column(String(50), nullable=True)
    emotional_state_after = Column(String(50), nullable=True)
    anxiety_level_before = Column(Integer, nullable=True)  # 1-10 scale
    anxiety_level_after = Column(Integer, nullable=True)   # 1-10 scale
    
    # Support and assistance
    support_level_needed = Column(String(50), nullable=True)  # minimal, moderate, extensive
    support_provided_by = Column(String(100), nullable=True)  # parent, therapist, aide
    assistive_technology_used = Column(JSON, default=list, nullable=False)
    
    # Environmental factors
    environment_type = Column(String(50), nullable=True)  # home, clinic, school, community
    environmental_modifications = Column(JSON, default=list, nullable=False)
    sensory_accommodations = Column(JSON, default=list, nullable=False)
    
    # Outcome and notes
    completion_status = Column(String(50), default="completed", nullable=False)
    success_rating = Column(Integer, nullable=True)  # 1-5 scale
    challenges_encountered = Column(JSON, default=list, nullable=False)
    strategies_used = Column(JSON, default=list, nullable=False)
    notes = Column(Text, nullable=True)
    
    # Verification and validation
    verified_by_parent = Column(Boolean, default=False, nullable=False)
    verified_by_professional = Column(Boolean, default=False, nullable=False)
    verification_notes = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    data_source = Column(String(50), default="manual", nullable=False)  # manual, game, sensor
    
    # Relationships
    child = relationship("Child", back_populates="activities")
    
    def __repr__(self):
        return f"<Activity {self.activity_type}: {self.activity_name} (+{self.points_earned}pts)>"

# =============================================================================
# GAME SESSION MODEL
# =============================================================================

# NOTE: GameSession model is now defined in app.reports.models for comprehensive analytics
# The relationship is maintained here using string reference

# =============================================================================
# ASSESSMENT MODEL
# =============================================================================

class Assessment(Base):
    """
    Formal assessments and evaluations for progress tracking
    """
    __tablename__ = "assessments"
    
    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"), nullable=False, index=True)
    
    # Assessment identification
    assessment_type = Column(String(100), nullable=False, index=True)
    assessment_name = Column(String(200), nullable=False)
    version = Column(String(50), nullable=True)
    
    # Administration details
    administered_by = Column(String(200), nullable=False)
    administered_date = Column(DateTime(timezone=True), nullable=False)
    location = Column(String(200), nullable=True)
    
    # Scores and results
    raw_scores = Column(JSON, nullable=True)
    standard_scores = Column(JSON, nullable=True)
    percentiles = Column(JSON, nullable=True)
    age_equivalents = Column(JSON, nullable=True)
    
    # Interpretation and recommendations
    interpretation = Column(Text, nullable=True)
    recommendations = Column(JSON, default=list, nullable=False)
    goals_identified = Column(JSON, default=list, nullable=False)
    
    # Progress tracking
    previous_assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=True)
    progress_summary = Column(Text, nullable=True)
    areas_of_growth = Column(JSON, default=list, nullable=False)
    areas_of_concern = Column(JSON, default=list, nullable=False)
    
    # Status and metadata
    status = Column(String(50), default="completed", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    child = relationship("Child", back_populates="assessments")
    previous_assessment = relationship("Assessment", remote_side=[id])
    
    def __repr__(self):
        return f"<Assessment {self.assessment_type} for child {self.child_id}>"

# =============================================================================
# PROFESSIONAL PROFILE MODEL
# =============================================================================

class ProfessionalProfile(Base):
    """
    Extended profile information for healthcare professionals
    Linked to existing User with role=PROFESSIONAL
    """
    __tablename__ = "professional_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("auth_users.id"), nullable=False, unique=True)
    
    # Professional credentials
    license_type = Column(String(100), nullable=True)  # MD, DDS, OTR, SLP, etc.
    license_number = Column(String(100), nullable=True, index=True)
    license_state = Column(String(50), nullable=True)
    license_expiry = Column(DateTime(timezone=True), nullable=True)
    
    # Specialization and expertise
    primary_specialty = Column(String(200), nullable=True)
    subspecialties = Column(JSON, default=list, nullable=False)
    certifications = Column(JSON, default=list, nullable=False)
    years_experience = Column(Integer, nullable=True)
    
    # Practice information
    clinic_name = Column(String(200), nullable=True)
    clinic_address = Column(Text, nullable=True)
    clinic_phone = Column(String(20), nullable=True)
    practice_type = Column(String(100), nullable=True)  # private, hospital, clinic
    
    # ASD-specific qualifications
    asd_experience_years = Column(Integer, nullable=True)
    asd_certifications = Column(JSON, default=list, nullable=False)
    preferred_age_groups = Column(JSON, default=list, nullable=False)
    treatment_approaches = Column(JSON, default=list, nullable=False)
    
    # Professional ratings and metrics
    patient_count = Column(Integer, default=0, nullable=False)
    average_rating = Column(Float, nullable=True)
    total_sessions = Column(Integer, default=0, nullable=False)
    
    # Availability and scheduling
    available_days = Column(JSON, default=list, nullable=False)
    available_hours = Column(JSON, nullable=True)
    accepts_new_patients = Column(Boolean, default=True, nullable=False)
    
    # Professional bio and approach
    bio = Column(Text, nullable=True)
    treatment_philosophy = Column(Text, nullable=True)
    languages_spoken = Column(JSON, default=["English"], nullable=False)
    
    # Status and verification
    is_verified = Column(Boolean, default=False, nullable=False)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    verified_by = Column(Integer, nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    
    # Relationships
    user = relationship("User", backref="professional_profile")
    
    @validates('years_experience', 'asd_experience_years')
    def validate_experience(self, key, years):
        """Validate experience years are reasonable"""
        if years is not None and (years < 0 or years > 50):
            raise ValueError(f"{key} must be between 0 and 50 years")
        return years
    
    @validates('license_number')
    def validate_license_number(self, key, license_num):
        """Validate license number format"""
        if license_num and len(license_num.strip()) < 3:
            raise ValueError("License number must be at least 3 characters")
        return license_num.upper().strip() if license_num else None
    
    def __repr__(self):
        return f"<ProfessionalProfile {self.primary_specialty} - {self.clinic_name}>"

# =============================================================================
# RELATIONSHIP SETUP FOR EXISTING USER MODEL
# =============================================================================

# Extend the existing User model with children relationship
User.children = relationship("Child", back_populates="parent", lazy="dynamic")