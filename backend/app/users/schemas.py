"""
Users Schemas - Enhanced Pydantic models for ASD-focused user management
Comprehensive validation rules and serialization for all user types
"""

from datetime import datetime, date
from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field, field_validator, model_validator
from enum import Enum

# =============================================================================
# ENUMS FOR VALIDATION
# =============================================================================

class SupportLevelEnum(int, Enum):
    """ASD Support Level Enum"""
    LEVEL_1 = 1  # Requiring support
    LEVEL_2 = 2  # Requiring substantial support
    LEVEL_3 = 3  # Requiring very substantial support

class ActivityTypeEnum(str, Enum):
    """Activity types"""
    DENTAL_CARE = "dental_care"
    THERAPY_SESSION = "therapy_session"
    MEDICATION = "medication"
    EXERCISE = "exercise"
    SOCIAL_INTERACTION = "social_interaction"
    SENSORY_BREAK = "sensory_break"
    EDUCATIONAL = "educational"
    FREE_PLAY = "free_play"

class EmotionalStateEnum(str, Enum):
    """Emotional states"""
    CALM = "calm"
    HAPPY = "happy"
    EXCITED = "excited"
    ANXIOUS = "anxious"
    FRUSTRATED = "frustrated"
    OVERWHELMED = "overwhelmed"
    FOCUSED = "focused"
    TIRED = "tired"

class CommunicationStyleEnum(str, Enum):
    """Communication styles"""
    VERBAL = "verbal"
    NON_VERBAL = "non_verbal"
    MIXED = "mixed"
    ALTERNATIVE = "alternative"

# =============================================================================
# SENSORY PROFILE SCHEMAS
# =============================================================================

class SensoryDomainSchema(BaseModel):
    """Individual sensory domain configuration"""
    sensitivity: str = Field(..., pattern="^(high|moderate|low)$")
    preferences: List[str] = Field(default_factory=list)
    triggers: List[str] = Field(default_factory=list)
    accommodations: List[str] = Field(default_factory=list)

class SensoryProfileSchema(BaseModel):
    """Comprehensive sensory profile"""
    auditory: Optional[SensoryDomainSchema] = None
    visual: Optional[SensoryDomainSchema] = None
    tactile: Optional[SensoryDomainSchema] = None
    vestibular: Optional[SensoryDomainSchema] = None
    proprioceptive: Optional[SensoryDomainSchema] = None
    gustatory: Optional[SensoryDomainSchema] = None
    olfactory: Optional[SensoryDomainSchema] = None

class TherapyInfoSchema(BaseModel):
    """Therapy information schema"""
    type: str = Field(..., description="Type of therapy (ABA, speech, OT, PT)")
    provider: str = Field(..., description="Therapy provider name")
    frequency: str = Field(..., description="Frequency (e.g., '2x_weekly')")
    start_date: date = Field(..., description="Therapy start date")
    goals: List[str] = Field(default_factory=list, description="Current therapy goals")
    notes: Optional[str] = Field(None, description="Additional notes")

class SafetyProtocolSchema(BaseModel):
    """Safety protocols and emergency information"""
    elopement_risk: str = Field(..., pattern="^(high|moderate|low|none)$")
    medical_conditions: List[str] = Field(default_factory=list)
    medications: List[str] = Field(default_factory=list)
    emergency_procedures: List[str] = Field(default_factory=list)
    calming_strategies: List[str] = Field(default_factory=list)
    triggers_to_avoid: List[str] = Field(default_factory=list)

# =============================================================================
# CHILD SCHEMAS
# =============================================================================

class ChildBase(BaseModel):
    """Base child schema"""
    name: str = Field(..., min_length=2, max_length=100)
    age: int = Field(..., ge=0, le=25)
    date_of_birth: Optional[date] = None
    avatar_url: Optional[str] = Field(None, max_length=500)
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if not v or not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip().title()

class ChildCreate(ChildBase):
    """Schema for creating a child"""
    # Clinical information
    diagnosis: Optional[str] = Field(None, max_length=200, description="ASD diagnosis details")
    support_level: Optional[SupportLevelEnum] = Field(None, description="ASD support level 1-3")
    diagnosis_date: Optional[date] = Field(None, description="Date of diagnosis")
    diagnosing_professional: Optional[str] = Field(None, max_length=200)
    
    # Communication
    communication_style: Optional[CommunicationStyleEnum] = Field(None)
    communication_notes: Optional[str] = Field(None, max_length=1000)
    
    # Comprehensive profiles
    sensory_profile: Optional[SensoryProfileSchema] = Field(None)
    behavioral_notes: Optional[str] = Field(None, max_length=2000)
    
    # Therapy information
    current_therapies: List[TherapyInfoSchema] = Field(default_factory=list)
    
    # Safety and emergency
    emergency_contacts: List[Dict[str, str]] = Field(default_factory=list)
    safety_protocols: Optional[SafetyProtocolSchema] = Field(None)
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "Emma",
                "age": 8,
                "date_of_birth": "2016-03-15",
                "diagnosis": "Autism Spectrum Disorder",
                "support_level": 2,
                "communication_style": "mixed",
                "sensory_profile": {
                    "auditory": {
                        "sensitivity": "high",
                        "triggers": ["sudden_loud_noises", "overlapping_sounds"],
                        "accommodations": ["noise_cancelling_headphones", "quiet_space"]
                    },
                    "visual": {
                        "sensitivity": "moderate",
                        "preferences": ["dim_lighting", "minimal_visual_clutter"]
                    }
                },
                "current_therapies": [
                    {
                        "type": "ABA",
                        "provider": "Behavioral Health Center",
                        "frequency": "3x_weekly",
                        "start_date": "2024-01-15",
                        "goals": ["increase_communication", "reduce_problem_behaviors"]
                    }
                ],
                "safety_protocols": {
                    "elopement_risk": "moderate",
                    "calming_strategies": ["deep_pressure", "sensory_break", "preferred_music"]
                }
            }
        }
    }

class ChildUpdate(BaseModel):
    """Schema for updating child information"""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    age: Optional[int] = Field(None, ge=0, le=25)
    avatar_url: Optional[str] = Field(None, max_length=500)
    diagnosis: Optional[str] = Field(None, max_length=200)
    support_level: Optional[SupportLevelEnum] = None
    communication_style: Optional[CommunicationStyleEnum] = None
    communication_notes: Optional[str] = Field(None, max_length=1000)
    sensory_profile: Optional[SensoryProfileSchema] = None
    behavioral_notes: Optional[str] = Field(None, max_length=2000)
    current_therapies: Optional[List[TherapyInfoSchema]] = None
    safety_protocols: Optional[SafetyProtocolSchema] = None

class ChildResponse(ChildBase):
    """Child response schema"""
    id: int
    parent_id: int
    points: int = 0
    level: int = 1
    achievements: List[str] = Field(default_factory=list)
    
    # Clinical information
    diagnosis: Optional[str] = None
    support_level: Optional[int] = None
    communication_style: Optional[str] = None
    
    # Status and metadata
    is_active: bool = True
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Computed properties
    full_profile_complete: Optional[bool] = None
    age_category: Optional[str] = None
    
    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": 1,
                "parent_id": 1,
                "name": "Emma",
                "age": 8,
                "points": 250,
                "level": 3,
                "achievements": ["dental_rookie", "therapy_starter"],
                "diagnosis": "Autism Spectrum Disorder",
                "support_level": 2,
                "communication_style": "mixed",
                "is_active": True,
                "created_at": "2024-06-01T10:00:00Z",
                "full_profile_complete": True,
                "age_category": "elementary"
            }
        }
    }

class ChildDetailResponse(ChildResponse):
    """Detailed child response with full profile"""
    diagnosis_date: Optional[date] = None
    diagnosing_professional: Optional[str] = None
    communication_notes: Optional[str] = None
    sensory_profile: Optional[Dict[str, Any]] = None
    behavioral_notes: Optional[str] = None
    current_therapies: List[Dict[str, Any]] = Field(default_factory=list)
    emergency_contacts: List[Dict[str, Any]] = Field(default_factory=list)
    safety_protocols: Optional[Dict[str, Any]] = None
    progress_notes: List[Dict[str, Any]] = Field(default_factory=list)
    last_assessment_date: Optional[datetime] = None
    
    # Recent activity summary
    recent_activities_count: int = 0
    recent_sessions_count: int = 0
    current_week_points: int = 0

# =============================================================================
# ACTIVITY SCHEMAS
# =============================================================================

class ActivityBase(BaseModel):
    """Base activity schema"""
    activity_type: ActivityTypeEnum
    activity_name: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    category: Optional[str] = Field(None, max_length=50)
    points_earned: int = Field(default=0, ge=0, le=100)
    difficulty_level: Optional[int] = Field(None, ge=1, le=5)

class ActivityCreate(ActivityBase):
    """Schema for creating an activity"""
    child_id: int = Field(..., description="ID of child performing activity")
    
    # Timing
    started_at: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=0, le=480)  # Max 8 hours
    
    # ASD-specific tracking
    emotional_state_before: Optional[EmotionalStateEnum] = None
    emotional_state_after: Optional[EmotionalStateEnum] = None
    anxiety_level_before: Optional[int] = Field(None, ge=1, le=10)
    anxiety_level_after: Optional[int] = Field(None, ge=1, le=10)
    
    # Support information
    support_level_needed: Optional[str] = Field(None, pattern="^(minimal|moderate|extensive)$")
    support_provided_by: Optional[str] = Field(None, max_length=100)
    assistive_technology_used: List[str] = Field(default_factory=list)
    
    # Environment
    environment_type: Optional[str] = Field(None, pattern="^(home|clinic|school|community)$")
    environmental_modifications: List[str] = Field(default_factory=list)
    sensory_accommodations: List[str] = Field(default_factory=list)
    
    # Outcome
    success_rating: Optional[int] = Field(None, ge=1, le=5)
    challenges_encountered: List[str] = Field(default_factory=list)
    strategies_used: List[str] = Field(default_factory=list)
    notes: Optional[str] = Field(None, max_length=1000)
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "child_id": 1,
                "activity_type": "dental_care",
                "activity_name": "Brushing teeth with visual schedule",
                "description": "Used visual schedule to guide tooth brushing routine",
                "points_earned": 15,
                "difficulty_level": 3,
                "emotional_state_before": "anxious",
                "emotional_state_after": "calm",
                "anxiety_level_before": 6,
                "anxiety_level_after": 3,
                "support_level_needed": "moderate",
                "environment_type": "home",
                "sensory_accommodations": ["soft_toothbrush", "favorite_toothpaste_flavor"],
                "success_rating": 4,
                "strategies_used": ["visual_schedule", "positive_reinforcement", "countdown_timer"]
            }
        }
    }

class ActivityResponse(ActivityBase):
    """Activity response schema"""
    id: int
    child_id: int
    
    # Timing information
    started_at: Optional[datetime] = None
    completed_at: datetime
    duration_minutes: Optional[int] = None
    
    # ASD tracking data
    emotional_state_before: Optional[str] = None
    emotional_state_after: Optional[str] = None
    anxiety_level_before: Optional[int] = None
    anxiety_level_after: Optional[int] = None
    
    # Support and environment
    support_level_needed: Optional[str] = None
    support_provided_by: Optional[str] = None
    environment_type: Optional[str] = None
    
    # Outcome data
    completion_status: str
    success_rating: Optional[int] = None
    challenges_encountered: List[str] = Field(default_factory=list)
    strategies_used: List[str] = Field(default_factory=list)
    notes: Optional[str] = None
    
    # Verification
    verified_by_parent: bool = False
    verified_by_professional: bool = False
    
    # Metadata
    created_at: datetime
    data_source: str = "manual"
    
    model_config = {"from_attributes": True}

# =============================================================================
# GAME SESSION SCHEMAS
# =============================================================================

class GameSessionCreate(BaseModel):
    """Schema for creating a game session"""
    child_id: int
    session_type: str = Field(..., max_length=50)
    scenario_name: str = Field(..., max_length=200)
    scenario_id: Optional[str] = Field(None, max_length=100)
    device_type: Optional[str] = Field(None, max_length=50)

class GameSessionUpdate(BaseModel):
    """Schema for updating game session progress"""
    levels_completed: Optional[int] = Field(None, ge=0)
    max_level_reached: Optional[int] = Field(None, ge=0)
    score: Optional[int] = Field(None, ge=0)
    interactions_count: Optional[int] = Field(None, ge=0)
    correct_responses: Optional[int] = Field(None, ge=0)
    help_requests: Optional[int] = Field(None, ge=0)
    
    # ASD-specific data
    emotional_data: Optional[Dict[str, Any]] = None
    interaction_patterns: Optional[Dict[str, Any]] = None
    
    # Parent feedback
    parent_notes: Optional[str] = Field(None, max_length=1000)
    parent_rating: Optional[int] = Field(None, ge=1, le=5)
    parent_observed_behavior: Optional[Dict[str, Any]] = None

class GameSessionResponse(BaseModel):
    """Game session response schema"""
    id: int
    child_id: int
    session_type: str
    scenario_name: str
    scenario_id: Optional[str] = None
    
    # Timing
    started_at: datetime
    ended_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    
    # Game metrics
    levels_completed: int = 0
    max_level_reached: int = 0
    score: int = 0
    interactions_count: int = 0
    correct_responses: int = 0
    help_requests: int = 0
    
    # Status
    completion_status: str
    exit_reason: Optional[str] = None
    achievement_unlocked: List[str] = Field(default_factory=list)
    
    # Parent feedback
    parent_rating: Optional[int] = None
    parent_notes: Optional[str] = None
    
    # Computed metrics
    engagement_score: Optional[float] = None
    
    model_config = {"from_attributes": True}

# =============================================================================
# PROFESSIONAL SCHEMAS
# =============================================================================

class ProfessionalProfileCreate(BaseModel):
    """Schema for creating professional profile"""
    license_type: Optional[str] = Field(None, max_length=100)
    license_number: Optional[str] = Field(None, max_length=100)
    license_state: Optional[str] = Field(None, max_length=50)
    license_expiry: Optional[date] = None
    
    primary_specialty: Optional[str] = Field(None, max_length=200)
    subspecialties: List[str] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    years_experience: Optional[int] = Field(None, ge=0, le=50)
    
    clinic_name: Optional[str] = Field(None, max_length=200)
    clinic_address: Optional[str] = Field(None, max_length=500)
    clinic_phone: Optional[str] = Field(None, max_length=20)
    practice_type: Optional[str] = Field(None, max_length=100)
    
    asd_experience_years: Optional[int] = Field(None, ge=0, le=50)
    asd_certifications: List[str] = Field(default_factory=list)
    preferred_age_groups: List[str] = Field(default_factory=list)
    treatment_approaches: List[str] = Field(default_factory=list)
    
    bio: Optional[str] = Field(None, max_length=2000)
    treatment_philosophy: Optional[str] = Field(None, max_length=1000)
    languages_spoken: List[str] = Field(default=["English"])
    
    accepts_new_patients: bool = True

class ProfessionalProfileResponse(BaseModel):
    """Professional profile response schema"""
    id: int
    user_id: int
    license_type: Optional[str] = None
    license_number: Optional[str] = None
    primary_specialty: Optional[str] = None
    subspecialties: List[str] = Field(default_factory=list)
    years_experience: Optional[int] = None
    
    clinic_name: Optional[str] = None
    clinic_address: Optional[str] = None
    practice_type: Optional[str] = None
    
    asd_experience_years: Optional[int] = None
    asd_certifications: List[str] = Field(default_factory=list)
    preferred_age_groups: List[str] = Field(default_factory=list)
    treatment_approaches: List[str] = Field(default_factory=list)
    
    patient_count: int = 0
    average_rating: Optional[float] = None
    total_sessions: int = 0
    
    bio: Optional[str] = None
    treatment_philosophy: Optional[str] = None
    languages_spoken: List[str] = Field(default_factory=list)
    
    accepts_new_patients: bool = True
    is_verified: bool = False
    
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = {"from_attributes": True}

# =============================================================================
# ASSESSMENT SCHEMAS
# =============================================================================

class AssessmentCreate(BaseModel):
    """Schema for creating assessments"""
    child_id: int
    assessment_type: str = Field(..., max_length=100)
    assessment_name: str = Field(..., max_length=200)
    version: Optional[str] = Field(None, max_length=50)
    administered_by: str = Field(..., max_length=200)
    administered_date: datetime
    location: Optional[str] = Field(None, max_length=200)
    
    raw_scores: Optional[Dict[str, Any]] = None
    standard_scores: Optional[Dict[str, Any]] = None
    percentiles: Optional[Dict[str, Any]] = None
    age_equivalents: Optional[Dict[str, Any]] = None
    
    interpretation: Optional[str] = Field(None, max_length=5000)
    recommendations: List[str] = Field(default_factory=list)
    goals_identified: List[str] = Field(default_factory=list)

class AssessmentResponse(BaseModel):
    """Assessment response schema"""
    id: int
    child_id: int
    assessment_type: str
    assessment_name: str
    version: Optional[str] = None
    administered_by: str
    administered_date: datetime
    location: Optional[str] = None
    
    raw_scores: Optional[Dict[str, Any]] = None
    standard_scores: Optional[Dict[str, Any]] = None
    percentiles: Optional[Dict[str, Any]] = None
    age_equivalents: Optional[Dict[str, Any]] = None
    
    interpretation: Optional[str] = None
    recommendations: List[str] = Field(default_factory=list)
    goals_identified: List[str] = Field(default_factory=list)
    
    progress_summary: Optional[str] = None
    areas_of_growth: List[str] = Field(default_factory=list)
    areas_of_concern: List[str] = Field(default_factory=list)
    
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = {"from_attributes": True}

# =============================================================================
# PAGINATION AND SEARCH SCHEMAS
# =============================================================================

class PaginationParams(BaseModel):
    """Standard pagination parameters"""
    page: int = Field(default=1, ge=1)
    size: int = Field(default=20, ge=1, le=100)
    sort_by: Optional[str] = Field(None, max_length=50)
    sort_order: str = Field(default="desc", pattern="^(asc|desc)$")

class ChildSearchFilters(BaseModel):
    """Filters for child search"""
    search_term: Optional[str] = Field(None, min_length=1, max_length=100)
    age_min: Optional[int] = Field(None, ge=0, le=25)
    age_max: Optional[int] = Field(None, ge=0, le=25)
    support_level: Optional[SupportLevelEnum] = None
    diagnosis_keyword: Optional[str] = Field(None, max_length=100)
    
    @model_validator(mode='after')
    def validate_age_range(self):
        if self.age_max is not None and self.age_min is not None:
            if self.age_max < self.age_min:
                raise ValueError('age_max must be greater than or equal to age_min')
        return self

class ActivityFilters(BaseModel):
    """Filters for activity search"""
    activity_type: Optional[ActivityTypeEnum] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    verified_only: bool = False
    min_points: Optional[int] = Field(None, ge=0)
    max_points: Optional[int] = Field(None, ge=0)
    support_level: Optional[str] = Field(None, pattern="^(minimal|moderate|extensive)$")
    environment_type: Optional[str] = Field(None, pattern="^(home|clinic|school|community)$")
    success_rating_min: Optional[int] = Field(None, ge=1, le=5)
    
    @model_validator(mode='after')
    def validate_filters(self):
        if (self.max_points is not None and self.min_points is not None and 
            self.max_points < self.min_points):
            raise ValueError('max_points must be greater than or equal to min_points')
        
        if (self.date_to is not None and self.date_from is not None and 
            self.date_to < self.date_from):
            raise ValueError('date_to must be greater than or equal to date_from')
        
        return self

# =============================================================================
# RESPONSE SCHEMAS
# =============================================================================

class SuccessResponse(BaseModel):
    """Generic success response"""
    success: bool = True
    message: str
    data: Optional[Dict[str, Any]] = None

class BulkOperationResponse(BaseModel):
    """Response for bulk operations"""
    success: bool
    total_requested: int
    processed_count: int
    failed_count: int
    failed_ids: List[int] = Field(default_factory=list)
    errors: List[str] = Field(default_factory=list)
    message: str

# =============================================================================
# DASHBOARD SCHEMAS
# =============================================================================

class ChildProgressSummary(BaseModel):
    """Child progress summary for dashboards"""
    child_id: int
    child_name: str
    current_level: int
    total_points: int
    current_week_points: int
    
    # Activity metrics
    total_activities: int
    verified_activities: int
    favorite_activities: List[str]
    
    # Game session metrics
    total_sessions: int
    completed_sessions: int
    average_engagement_score: float
    
    # Progress indicators
    areas_of_growth: List[str]
    areas_needing_support: List[str]
    recent_achievements: List[str]
    
    # Time-based data
    last_activity_date: Optional[datetime] = None
    last_session_date: Optional[datetime] = None
    assessment_due: bool = False
    
    generated_at: datetime

class ParentDashboardResponse(BaseModel):
    """Parent dashboard summary data"""
    user_id: int
    total_children: int
    total_points_all_children: int
    active_children: int
    
    # Recent activity summary
    activities_this_week: int
    sessions_this_week: int
    new_achievements: int
    
    # Children summary
    children_summary: List[Dict[str, Any]]
    
    # Recent activities across all children
    recent_activities: List[ActivityResponse]
    
    # Weekly progress chart data
    weekly_progress: Dict[str, int]  # date -> points
    
    # Alerts and recommendations
    alerts: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    
    generated_at: datetime

# =============================================================================
# FORWARD REFERENCES RESOLUTION
# =============================================================================

ChildResponse.model_rebuild()
ChildDetailResponse.model_rebuild()
ActivityResponse.model_rebuild()
GameSessionResponse.model_rebuild()
ProfessionalProfileResponse.model_rebuild()
AssessmentResponse.model_rebuild()