"""
Users Schemas - Enhanced Pydantic models for ASD-focused user management
Comprehensive validation rules and serialization for all user types
"""

from datetime import datetime, date
from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field, field_validator, model_validator
from enum import Enum
import re

# =============================================================================
# VALIDATION CONSTANTS
# =============================================================================

PHONE_PATTERN = r'^[+]?[1-9][\d\s\-()]{7,15}$'
PHONE_ERROR_MSG = 'Invalid phone number format'
NAME_PATTERN = r'^[a-zA-Z\s\-\']+$'

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
    """Individual sensory domain configuration with enhanced validation"""
    sensitivity: str = Field(..., pattern="^(high|moderate|low)$")
    preferences: List[str] = Field(default_factory=list, max_length=20)
    triggers: List[str] = Field(default_factory=list, max_length=20)
    accommodations: List[str] = Field(default_factory=list, max_length=20)
    
    @field_validator('preferences', 'triggers', 'accommodations')
    @classmethod
    def validate_string_lists(cls, v):
        if not isinstance(v, list):
            raise ValueError('Must be a list of strings')
        for item in v:
            if not isinstance(item, str):
                raise ValueError('All items must be strings')
            if len(item.strip()) == 0:
                raise ValueError('Items cannot be empty strings')
            if len(item) > 100:
                raise ValueError('Individual items cannot exceed 100 characters')
        return [item.strip().lower() for item in v if item.strip()]
    
    @field_validator('sensitivity')
    @classmethod
    def validate_sensitivity(cls, v):
        allowed_values = ['high', 'moderate', 'low']
        if v.lower() not in allowed_values:
            raise ValueError(f'Sensitivity must be one of: {", ".join(allowed_values)}')
        return v.lower()

class SensoryProfileSchema(BaseModel):
    """Comprehensive sensory profile with validation"""
    auditory: Optional[SensoryDomainSchema] = None
    visual: Optional[SensoryDomainSchema] = None
    tactile: Optional[SensoryDomainSchema] = None
    vestibular: Optional[SensoryDomainSchema] = None
    proprioceptive: Optional[SensoryDomainSchema] = None
    gustatory: Optional[SensoryDomainSchema] = None
    olfactory: Optional[SensoryDomainSchema] = None
    
    @model_validator(mode='after')
    def validate_sensory_profile(self):
        """Ensure at least one sensory domain is provided if profile exists"""
        sensory_domains = [
            self.auditory, self.visual, self.tactile, self.vestibular,
            self.proprioceptive, self.gustatory, self.olfactory
        ]
        if all(domain is None for domain in sensory_domains):
            raise ValueError('At least one sensory domain must be provided')
        return self
    
    def get_high_sensitivity_domains(self) -> List[str]:
        """Helper method to identify high sensitivity domains"""
        high_sensitivity = []
        domains = {
            'auditory': self.auditory,
            'visual': self.visual,
            'tactile': self.tactile,
            'vestibular': self.vestibular,
            'proprioceptive': self.proprioceptive,
            'gustatory': self.gustatory,
            'olfactory': self.olfactory
        }
        for name, domain in domains.items():
            if domain and domain.sensitivity == 'high':
                high_sensitivity.append(name)
        return high_sensitivity

class TherapyInfoSchema(BaseModel):
    """Therapy information schema with enhanced validation"""
    type: str = Field(..., description="Type of therapy (ABA, speech, OT, PT)")
    provider: str = Field(..., description="Therapy provider name")
    frequency: str = Field(..., description="Frequency (e.g., '2x_weekly')")
    start_date: date = Field(..., description="Therapy start date")
    goals: List[str] = Field(default_factory=list, description="Current therapy goals")
    notes: Optional[str] = Field(None, description="Additional notes", max_length=1000)
    
    @field_validator('type')
    @classmethod
    def validate_therapy_type(cls, v):
        if v.strip() == '':
            raise ValueError('Therapy type cannot be empty')
        # Normalize common abbreviations
        normalized = v.strip().lower()
        if normalized in ['aba']:
            return 'ABA'
        elif normalized in ['ot', 'occupational']:
            return 'Occupational Therapy'
        elif normalized in ['pt', 'physical']:
            return 'Physical Therapy'
        elif normalized in ['speech', 'speech_therapy']:
            return 'Speech Therapy'
        return v.strip().title()
    
    @field_validator('provider')
    @classmethod
    def validate_provider(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError('Provider name must be at least 2 characters')
        if len(v.strip()) > 200:
            raise ValueError('Provider name cannot exceed 200 characters')
        return v.strip()
    
    @field_validator('frequency')
    @classmethod
    def validate_frequency(cls, v):
        allowed_patterns = [
            'daily', 'weekly', '2x_weekly', '3x_weekly', '4x_weekly', '5x_weekly',
            'biweekly', 'monthly', 'as_needed', 'intensive'
        ]
        normalized = v.strip().lower().replace(' ', '_')
        if normalized not in allowed_patterns:
            raise ValueError(f'Frequency must be one of: {", ".join(allowed_patterns)}')
        return normalized
    
    @field_validator('start_date')
    @classmethod
    def validate_start_date(cls, v):
        from datetime import date, timedelta
        today = date.today()
        # Start date cannot be more than 10 years in the past
        earliest_allowed = today - timedelta(days=10*365)
        if v < earliest_allowed:
            raise ValueError('Start date cannot be more than 10 years ago')
        # Start date cannot be more than 1 year in the future
        latest_allowed = today + timedelta(days=365)
        if v > latest_allowed:
            raise ValueError('Start date cannot be more than 1 year in the future')
        return v
    
    @field_validator('goals')
    @classmethod
    def validate_goals(cls, v):
        if len(v) > 10:
            raise ValueError('Cannot have more than 10 therapy goals')
        for goal in v:
            if not isinstance(goal, str) or len(goal.strip()) == 0:
                raise ValueError('All goals must be non-empty strings')
            if len(goal) > 200:
                raise ValueError('Individual goals cannot exceed 200 characters')
        return [goal.strip() for goal in v if goal.strip()]

class SafetyProtocolSchema(BaseModel):
    """Safety protocols and emergency information with enhanced validation"""
    elopement_risk: str = Field(..., pattern="^(high|moderate|low|none)$")
    medical_conditions: List[str] = Field(default_factory=list, max_length=15)
    medications: List[str] = Field(default_factory=list, max_length=20)
    emergency_procedures: List[str] = Field(default_factory=list, max_length=10)
    calming_strategies: List[str] = Field(default_factory=list, max_length=15)
    triggers_to_avoid: List[str] = Field(default_factory=list, max_length=20)
    
    @field_validator('elopement_risk')
    @classmethod
    def validate_elopement_risk(cls, v):
        allowed_values = ['high', 'moderate', 'low', 'none']
        if v.lower() not in allowed_values:
            raise ValueError(f'Elopement risk must be one of: {", ".join(allowed_values)}')
        return v.lower()
    
    @field_validator('medical_conditions', 'medications', 'emergency_procedures', 
                    'calming_strategies', 'triggers_to_avoid')
    @classmethod
    def validate_string_lists(cls, v):
        if not isinstance(v, list):
            raise ValueError('Must be a list of strings')
        for item in v:
            if not isinstance(item, str):
                raise ValueError('All items must be strings')
            if len(item.strip()) == 0:
                raise ValueError('Items cannot be empty strings')
            if len(item) > 150:
                raise ValueError('Individual items cannot exceed 150 characters')
        return [item.strip() for item in v if item.strip()]
    
    @model_validator(mode='after')
    def validate_safety_completeness(self):
        """Ensure high-risk profiles have adequate safety measures"""
        if self.elopement_risk == 'high':
            if not self.emergency_procedures:
                raise ValueError('High elopement risk requires emergency procedures')
            if not self.calming_strategies:
                raise ValueError('High elopement risk requires calming strategies')
        return self

# =============================================================================
# CHILD SCHEMAS
# =============================================================================

class ChildBase(BaseModel):
    """Base child schema with comprehensive validation"""
    name: str = Field(..., min_length=2, max_length=100)
    age: int = Field(..., ge=0, le=25)
    date_of_birth: Optional[date] = None
    avatar_url: Optional[str] = Field(None, max_length=500)
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if not v or not v.strip():
            raise ValueError('Name cannot be empty')
        # Check for invalid characters
        import re
        if not re.match(r'^[a-zA-Z\s\'-]+$', v.strip()):
            raise ValueError('Name can only contain letters, spaces, hyphens, and apostrophes')
        return v.strip().title()
    
    @field_validator('age')
    @classmethod
    def validate_age(cls, v):
        if v < 0:
            raise ValueError('Age cannot be negative')
        if v > 25:
            raise ValueError('Age cannot exceed 25 for this application')
        return v
    
    @field_validator('date_of_birth')
    @classmethod
    def validate_date_of_birth(cls, v):
        if v is None:
            return v
        from datetime import date, timedelta
        today = date.today()
        # Check if birth date is not in the future
        if v > today:
            raise ValueError('Date of birth cannot be in the future')
        # Check if birth date is reasonable (not more than 25 years ago)
        earliest_allowed = today - timedelta(days=25*365 + 6)  # Account for leap years
        if v < earliest_allowed:
            raise ValueError('Date of birth cannot be more than 25 years ago')
        return v
    
    @field_validator('avatar_url')
    @classmethod
    def validate_avatar_url(cls, v):
        if v is None:
            return v
        import re
        # Basic URL validation
        url_pattern = re.compile(
            r'^https?://'  # http:// or https://
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
            r'localhost|'  # localhost...
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
            r'(?::\d+)?'  # optional port
            r'(?:/?|[/?]\S+)$', re.IGNORECASE)
        if not url_pattern.match(v):
            raise ValueError('Invalid URL format for avatar')
        return v
    
    @model_validator(mode='after')
    def validate_age_consistency(self):
        """Validate age is consistent with date of birth"""
        if self.date_of_birth and self.age:
            from datetime import date
            today = date.today()
            calculated_age = today.year - self.date_of_birth.year - (
                (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
            )
            if abs(calculated_age - self.age) > 1:  # Allow 1 year tolerance
                raise ValueError('Age does not match date of birth')
        return self

class ChildCreate(ChildBase):
    """Schema for creating a child with comprehensive validation"""
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
    current_therapies: List[TherapyInfoSchema] = Field(default_factory=list, max_length=10)
    
    # Safety and emergency
    emergency_contacts: List[Dict[str, str]] = Field(default_factory=list, max_length=5)
    safety_protocols: Optional[SafetyProtocolSchema] = Field(None)
    
    @field_validator('diagnosis')
    @classmethod
    def validate_diagnosis(cls, v):
        if v is None:
            return v
        if len(v.strip()) < 3:
            raise ValueError('Diagnosis must be at least 3 characters')
        # Check for common ASD terminology
        asd_terms = ['autism', 'asperger', 'pdd', 'pervasive', 'spectrum']
        if not any(term in v.lower() for term in asd_terms):
            # Allow but warn
            pass
        return v.strip()
    
    @field_validator('support_level')
    @classmethod
    def validate_support_level(cls, v):
        if v is None:
            return v
        if v not in [1, 2, 3]:
            raise ValueError('Support level must be 1, 2, or 3 according to DSM-5')
        return v
    
    @field_validator('diagnosis_date')
    @classmethod
    def validate_diagnosis_date(cls, v):
        if v is None:
            return v
        from datetime import date, timedelta
        today = date.today()
        # Diagnosis cannot be in the future
        if v > today:
            raise ValueError('Diagnosis date cannot be in the future')
        # Diagnosis cannot be more than 25 years ago (max age in system)
        earliest_allowed = today - timedelta(days=25*365)
        if v < earliest_allowed:
            raise ValueError('Diagnosis date cannot be more than 25 years ago')
        return v
    
    @field_validator('current_therapies')
    @classmethod
    def validate_therapies(cls, v):
        if len(v) > 10:
            raise ValueError('Cannot have more than 10 concurrent therapies')
        # Check for duplicate therapy types
        therapy_types = [therapy.type.lower() for therapy in v]
        if len(therapy_types) != len(set(therapy_types)):
            raise ValueError('Cannot have duplicate therapy types')
        return v
    
    @field_validator('emergency_contacts')
    @classmethod
    def validate_emergency_contacts(cls, v):
        if len(v) > 5:
            raise ValueError('Cannot have more than 5 emergency contacts')
        required_fields = ['name', 'phone', 'relationship']
        for i, contact in enumerate(v):
            if not isinstance(contact, dict):
                raise ValueError(f'Emergency contact {i+1} must be a dictionary')
            for field in required_fields:
                if field not in contact or not contact[field]:
                    raise ValueError(f'Emergency contact {i+1} missing required field: {field}')
            # Validate phone number format (basic)
            import re
            phone = contact['phone'].strip()
            if not re.match(r'^[\+]?[1-9][\d\s\-\(\)]{7,15}$', phone):
                raise ValueError(f'Invalid phone number format for emergency contact {i+1}')
        return v
    
    @model_validator(mode='after')
    def validate_child_profile_consistency(self):
        """Validate consistency across child profile fields"""
        # If support level is provided, diagnosis should be provided
        if self.support_level and not self.diagnosis:
            raise ValueError('Support level requires a diagnosis to be specified')
        
        # If diagnosis date is provided, diagnosis should be provided
        if self.diagnosis_date and not self.diagnosis:
            raise ValueError('Diagnosis date requires a diagnosis to be specified')
        
        # Age consistency with diagnosis date
        if self.diagnosis_date and self.age:
            from datetime import date
            diagnosis_age = self.age - (date.today().year - self.diagnosis_date.year)
            if diagnosis_age < 0:
                raise ValueError('Diagnosis date cannot be before birth')
            if diagnosis_age < 1 and self.support_level in [2, 3]:
                # Early diagnosis validation
                pass  # Allow early diagnosis for severe cases
        
        # Safety protocol consistency
        if self.safety_protocols and self.safety_protocols.elopement_risk == 'high':
            if not self.emergency_contacts:
                raise ValueError('High elopement risk requires emergency contacts')
        
        return self
    
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
    """Schema for updating child information with validation"""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    age: Optional[int] = Field(None, ge=0, le=25)
    avatar_url: Optional[str] = Field(None, max_length=500)
    diagnosis: Optional[str] = Field(None, max_length=200)
    support_level: Optional[SupportLevelEnum] = None
    communication_style: Optional[CommunicationStyleEnum] = None
    communication_notes: Optional[str] = Field(None, max_length=1000)
    sensory_profile: Optional[SensoryProfileSchema] = Field(None)
    behavioral_notes: Optional[str] = Field(None, max_length=2000)
    current_therapies: Optional[List[TherapyInfoSchema]] = None
    safety_protocols: Optional[SafetyProtocolSchema] = None
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if v is None:
            return v
        if not v or not v.strip():
            raise ValueError('Name cannot be empty')
        import re
        if not re.match(r'^[a-zA-Z\s\'-]+$', v.strip()):
            raise ValueError('Name can only contain letters, spaces, hyphens, and apostrophes')
        return v.strip().title()
    
    @field_validator('age')
    @classmethod
    def validate_age(cls, v):
        if v is None:
            return v
        if v < 0:
            raise ValueError('Age cannot be negative')
        if v > 25:
            raise ValueError('Age cannot exceed 25 for this application')
        return v
    
    @field_validator('support_level')
    @classmethod
    def validate_support_level(cls, v):
        if v is None:
            return v
        if v not in [1, 2, 3]:
            raise ValueError('Support level must be 1, 2, or 3 according to DSM-5')
        return v
    
    @field_validator('current_therapies')
    @classmethod
    def validate_therapies(cls, v):
        if v is None:
            return v
        if len(v) > 10:
            raise ValueError('Cannot have more than 10 concurrent therapies')
        # Check for duplicate therapy types
        therapy_types = [therapy.type.lower() for therapy in v]
        if len(therapy_types) != len(set(therapy_types)):
            raise ValueError('Cannot have duplicate therapy types')
        return v

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
# GAME SESSION SCHEMAS - MOVED TO app.reports.schemas
# =============================================================================
# Note: GameSession schemas (GameSessionCreate, GameSessionUpdate, GameSessionResponse) 
# have been moved to app.reports.schemas for consistency with the analytics system.
# Import them from app.reports.schemas instead.

# =============================================================================
# PROFESSIONAL SCHEMAS
# =============================================================================

class ProfessionalProfileCreate(BaseModel):
    """Schema for creating professional profile with comprehensive validation"""
    license_type: Optional[str] = Field(None, max_length=100)
    license_number: Optional[str] = Field(None, max_length=100)
    license_state: Optional[str] = Field(None, max_length=50)
    license_expiry: Optional[date] = None
    primary_specialty: Optional[str] = Field(None, max_length=200)
    subspecialties: List[str] = Field(default_factory=list, max_length=10)
    certifications: List[str] = Field(default_factory=list, max_length=15)
    experience_years: Optional[int] = Field(None, ge=0, le=50)
    
    clinic_name: Optional[str] = Field(None, max_length=200)
    clinic_address: Optional[str] = Field(None, max_length=500)
    clinic_phone: Optional[str] = Field(None, max_length=20)
    practice_type: Optional[str] = Field(None, max_length=100)
    
    asd_experience_years: Optional[int] = Field(None, ge=0, le=50)
    asd_certifications: List[str] = Field(default_factory=list, max_length=10)
    preferred_age_groups: List[str] = Field(default_factory=list, max_length=8)
    treatment_approaches: List[str] = Field(default_factory=list, max_length=15)
    
    bio: Optional[str] = Field(None, max_length=2000)
    treatment_philosophy: Optional[str] = Field(None, max_length=1000)
    languages_spoken: List[str] = Field(default=["English"], max_length=10)
    
    accepts_new_patients: bool = True
    
    @field_validator('license_type')
    @classmethod
    def validate_license_type(cls, v):
        if v is None:
            return v
        allowed_types = [
            'MD', 'DO', 'PhD', 'PsyD', 'LCSW', 'LPC', 'LPCC', 'LMHC', 'LMFT',
            'OTR/L', 'PT', 'DPT', 'SLP', 'CCC-SLP', 'BCBA', 'BCaBA', 'RN', 'NP'
        ]
        if v.upper() not in allowed_types:
            # Allow custom license types but validate format
            import re
            if not re.match(r'^[A-Za-z0-9/\-]{2,10}$', v):
                raise ValueError('License type format is invalid')
        return v.upper()
    
    @field_validator('license_number')
    @classmethod
    def validate_license_number(cls, v):
        if v is None:
            return v
        import re
        # Basic validation for license number format
        if not re.match(r'^[A-Za-z0-9\-]{3,20}$', v):
            raise ValueError('License number format is invalid')
        return v.upper()
    
    @field_validator('license_state')
    @classmethod
    def validate_license_state(cls, v):
        if v is None:
            return v
        # US states and territories abbreviations
        us_states = [
            'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
            'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
            'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
            'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
            'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
            'DC', 'PR', 'VI', 'GU', 'AS', 'MP'
        ]
        if v.upper() not in us_states:
            raise ValueError('Must be a valid US state or territory abbreviation')
        return v.upper()
    
    @field_validator('license_expiry')
    @classmethod
    def validate_license_expiry(cls, v):
        if v is None:
            return v
        from datetime import date, timedelta
        today = date.today()
        # License expiry cannot be in the past
        if v < today:
            raise ValueError('License expiry date cannot be in the past')
        # License expiry cannot be more than 10 years in the future
        max_expiry = today + timedelta(days=10*365)
        if v > max_expiry:
            raise ValueError('License expiry date cannot be more than 10 years in the future')
        return v
    @field_validator('experience_years', 'asd_experience_years')
    @classmethod
    def validate_experience_years(cls, v):
        if v is None:
            return v
        if v < 0:
            raise ValueError('Experience years cannot be negative')
        if v > 50:
            raise ValueError('Experience years cannot exceed 50')
        return v
    
    @field_validator('subspecialties', 'certifications', 'asd_certifications', 
                    'preferred_age_groups', 'treatment_approaches', 'languages_spoken')
    @classmethod
    def validate_string_lists(cls, v):
        if not isinstance(v, list):
            raise ValueError('Must be a list of strings')
        for item in v:
            if not isinstance(item, str):
                raise ValueError('All items must be strings')
            if len(item.strip()) == 0:
                raise ValueError('Items cannot be empty strings')
            if len(item) > 100:
                raise ValueError('Individual items cannot exceed 100 characters')
        return [item.strip() for item in v if item.strip()]
    
    @field_validator('preferred_age_groups')
    @classmethod
    def validate_age_groups(cls, v):
        allowed_groups = [
            'infants', 'toddlers', 'preschool', 'elementary', 'middle_school',
            'high_school', 'young_adults', 'adults'
        ]
        for group in v:
            if group.lower().replace(' ', '_') not in allowed_groups:
                raise ValueError(f'Invalid age group: {group}. Must be one of: {", ".join(allowed_groups)}')
        return [group.lower().replace(' ', '_') for group in v]
    
    @field_validator('clinic_phone')
    @classmethod
    def validate_clinic_phone(cls, v):
        if v is None:
            return v
        import re
        # Basic phone number validation
        if not re.match(r'^[\+]?[1-9][\d\s\-\(\)]{7,15}$', v.strip()):
            raise ValueError('Invalid phone number format')
        return v.strip()
    
    @model_validator(mode='after')
    def validate_professional_profile_consistency(self):
        """Validate consistency across professional profile fields"""
        # If license info is provided, all license fields should be provided
        license_fields = [self.license_type, self.license_number, self.license_state]
        if any(license_fields) and not all(license_fields):
            raise ValueError('If license information is provided, type, number, and state are all required')
          # ASD experience cannot exceed total experience
        if (self.asd_experience_years is not None and 
            self.experience_years is not None and 
            self.asd_experience_years > self.experience_years):
            raise ValueError('ASD experience years cannot exceed total experience years')
        
        # Validate clinic information consistency
        clinic_fields = [self.clinic_name, self.clinic_address, self.clinic_phone]
        if any(clinic_fields) and not self.clinic_name:
            raise ValueError('Clinic name is required if clinic information is provided')
        
        return self

class ProfessionalProfileUpdate(BaseModel):
    """Schema for updating professional profile with validation"""
    license_type: Optional[str] = Field(None, max_length=100)
    license_number: Optional[str] = Field(None, max_length=100)
    license_state: Optional[str] = Field(None, max_length=50)
    license_expiry: Optional[date] = None
    primary_specialty: Optional[str] = Field(None, max_length=200)
    subspecialties: Optional[List[str]] = None
    certifications: Optional[List[str]] = None
    experience_years: Optional[int] = Field(None, ge=0, le=50)
    
    clinic_name: Optional[str] = Field(None, max_length=200)
    clinic_address: Optional[str] = Field(None, max_length=500)
    clinic_phone: Optional[str] = Field(None, max_length=20)
    practice_type: Optional[str] = Field(None, max_length=100)
    
    asd_experience_years: Optional[int] = Field(None, ge=0, le=50)
    asd_certifications: Optional[List[str]] = None
    preferred_age_groups: Optional[List[str]] = None
    treatment_approaches: Optional[List[str]] = None
    
    bio: Optional[str] = Field(None, max_length=2000)
    treatment_philosophy: Optional[str] = Field(None, max_length=1000)
    languages_spoken: Optional[List[str]] = None
    
    accepts_new_patients: Optional[bool] = None
    
    # Apply same validators as create schema
    validate_license_type = field_validator('license_type')(ProfessionalProfileCreate.validate_license_type)
    validate_license_number = field_validator('license_number')(ProfessionalProfileCreate.validate_license_number)
    validate_license_state = field_validator('license_state')(ProfessionalProfileCreate.validate_license_state)
    validate_license_expiry = field_validator('license_expiry')(ProfessionalProfileCreate.validate_license_expiry)
    validate_experience_years = field_validator('experience_years', 'asd_experience_years')(ProfessionalProfileCreate.validate_experience_years)
    validate_clinic_phone = field_validator('clinic_phone')(ProfessionalProfileCreate.validate_clinic_phone)

class ProfessionalProfileResponse(BaseModel):
    """Professional profile response schema"""
    id: int
    user_id: int
    license_type: Optional[str] = None
    license_number: Optional[str] = None
    primary_specialty: Optional[str] = None
    subspecialties: List[str] = Field(default_factory=list)
    experience_years: Optional[int] = None
    
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
# AGE-SPECIFIC VALIDATION SCHEMAS
# =============================================================================

class AgeSpecificValidator:
    """Age-specific validation for activities and content"""
    
    AGE_CATEGORIES = {
        'toddler': (0, 3),
        'preschool': (3, 6),
        'elementary': (6, 12),
        'teen': (12, 18),
        'young_adult': (18, 25)
    }
    
    AGE_APPROPRIATE_ACTIVITIES = {
        'toddler': [
            'sensory_play', 'simple_routines', 'basic_communication',
            'motor_development', 'parallel_play'
        ],
        'preschool': [
            'dental_care', 'basic_self_care', 'social_play', 'pre_academic',
            'following_directions', 'sensory_breaks'
        ],
        'elementary': [
            'academic_tasks', 'social_skills', 'self_advocacy',
            'organized_activities', 'therapy_sessions', 'homework'
        ],
        'teen': [
            'independence_skills', 'job_training', 'social_navigation',
            'self_management', 'academic_goals', 'transition_planning'
        ],
        'young_adult': [
            'employment', 'independent_living', 'relationships',
            'self_advocacy', 'community_participation', 'life_skills'
        ]
    }
    
    @classmethod
    def get_age_category(cls, age: int) -> str:
        """Get age category for given age"""
        for category, (min_age, max_age) in cls.AGE_CATEGORIES.items():
            if min_age <= age < max_age:
                return category
        return 'young_adult' if age >= 18 else 'unknown'
    
    @classmethod
    def validate_age_appropriate_activity(cls, age: int, activity_type: str) -> bool:
        """Validate if activity is age-appropriate"""
        age_category = cls.get_age_category(age)
        appropriate_activities = cls.AGE_APPROPRIATE_ACTIVITIES.get(age_category, [])
        
        # Allow all activities but provide guidance
        return True  # We don't restrict, just inform

class SupportLevelValidator:
    """Support level specific validation"""
    
    SUPPORT_LEVEL_DESCRIPTIONS = {
        1: "Requiring support - difficulties with social communication and inflexible behaviors",
        2: "Requiring substantial support - marked difficulties in verbal and nonverbal social communication",
        3: "Requiring very substantial support - severe difficulties in verbal and nonverbal communication"
    }
    
    TYPICAL_SUPPORT_NEEDS = {
        1: {
            'communication': ['social_cues', 'conversation_skills', 'nonverbal_communication'],
            'behavior': ['flexibility', 'transitions', 'organization'],
            'sensory': ['mild_sensitivities', 'some_accommodations']
        },
        2: {
            'communication': ['significant_support', 'alternative_communication', 'social_scripts'],
            'behavior': ['substantial_structure', 'routine_support', 'behavior_plans'],
            'sensory': ['moderate_sensitivities', 'regular_accommodations']
        },
        3: {
            'communication': ['intensive_support', 'augmentative_communication', 'basic_needs'],
            'behavior': ['extensive_structure', 'constant_support', 'safety_protocols'],
            'sensory': ['significant_sensitivities', 'comprehensive_accommodations']
        }
    }
    
    @classmethod
    def get_typical_needs(cls, support_level: int) -> Dict[str, List[str]]:
        """Get typical support needs for a support level"""
        return cls.TYPICAL_SUPPORT_NEEDS.get(support_level, {})
    
    @classmethod
    def validate_support_consistency(cls, support_level: int, 
                                   sensory_profile: Optional[Dict],
                                   safety_protocols: Optional[Dict]) -> bool:
        """Validate support level consistency with other data"""
        if support_level == 3:
            # Level 3 should have comprehensive safety protocols
            if safety_protocols and safety_protocols.get('elopement_risk') == 'none':
                # This might be inconsistent but not invalid
                pass
        
        return True

# =============================================================================
# ENHANCED RESPONSE SCHEMAS WITH COMPUTED FIELDS
# =============================================================================

class EnhancedChildResponse(ChildResponse):
    """Enhanced child response with computed fields and validation"""
    
    # Computed age category
    age_category: Optional[str] = None
    
    # Support level description
    support_level_description: Optional[str] = None
    
    # Profile completeness metrics
    profile_completeness_score: Optional[float] = None
    missing_profile_sections: List[str] = Field(default_factory=list)
    
    # Recent activity metrics
    activities_last_30_days: int = 0
    average_daily_points: float = 0.0
    most_frequent_activity_type: Optional[str] = None
    
    # Progress indicators
    skill_development_areas: List[str] = Field(default_factory=list)
    areas_needing_attention: List[str] = Field(default_factory=list)
    
    # Recommendations
    suggested_activities: List[str] = Field(default_factory=list)
    next_assessment_due: Optional[date] = None
    
    def compute_age_category(self) -> str:
        """Compute age category based on age"""
        return AgeSpecificValidator.get_age_category(self.age)
    
    def compute_profile_completeness(self) -> float:
        """Compute profile completeness score (0-100)"""
        score = 0
        total_sections = 10
        
        # Required sections with weights
        sections = {
            'basic_info': 15,  # name, age, dob
            'diagnosis': 15,   # diagnosis, support level
            'communication': 10,
            'sensory_profile': 15,
            'therapies': 10,
            'safety_protocols': 15,
            'emergency_contacts': 10,
            'behavioral_notes': 5,
            'avatar': 5
        }
        
        # This would be implemented based on actual data
        # For now, return a placeholder
        return 75.0

class EnhancedActivityResponse(ActivityResponse):
    """Enhanced activity response with additional metrics"""
    
    # Age appropriateness
    age_appropriate: bool = True
    age_category_match: bool = True
    
    # Support level consistency
    support_level_appropriate: bool = True
    
    # Improvement metrics
    emotional_improvement_score: Optional[float] = None
    anxiety_reduction_percentage: Optional[float] = None
    
    # Activity effectiveness
    effectiveness_rating: Optional[str] = None  # 'highly_effective', 'effective', 'needs_improvement'
    
    # Recommendations
    similar_activities_suggested: List[str] = Field(default_factory=list)
    next_steps: List[str] = Field(default_factory=list)
    
    def compute_emotional_improvement(self) -> Optional[float]:
        """Compute emotional improvement score"""
        if (self.emotional_state_before and self.emotional_state_after and
            self.anxiety_level_before and self.anxiety_level_after):
            
            # Simple scoring algorithm
            positive_states = ['calm', 'happy', 'excited', 'focused']
            
            state_improvement = 0
            if (self.emotional_state_before not in positive_states and 
                self.emotional_state_after in positive_states):
                state_improvement = 25
            
            anxiety_improvement = max(0, self.anxiety_level_before - self.anxiety_level_after) * 10
            
            return min(100, state_improvement + anxiety_improvement)
        
        return None

# =============================================================================
# BULK OPERATION SCHEMAS
# =============================================================================

class BulkChildUpdateSchema(BaseModel):
    """Schema for bulk updating multiple children"""
    child_ids: List[int] = Field(..., min_length=1, max_length=50)
    updates: Dict[str, Any] = Field(..., description="Fields to update for all children")
    
    @field_validator('child_ids')
    @classmethod
    def validate_child_ids(cls, v):
        if len(set(v)) != len(v):
            raise ValueError('Duplicate child IDs not allowed')
        return v

class BatchActivityCreateSchema(BaseModel):
    """Schema for creating multiple activities at once"""
    activities: List[ActivityCreate] = Field(..., min_length=1, max_length=20)
    
    @field_validator('activities')
    @classmethod
    def validate_activities_batch(cls, v):
        # Check for duplicate activities for same child
        child_activity_pairs = []
        for activity in v:
            pair = (activity.child_id, activity.activity_type, activity.activity_name)
            if pair in child_activity_pairs:
                raise ValueError('Duplicate activities detected in batch')
            child_activity_pairs.append(pair)
        return v

# =============================================================================
# REPORT AND ANALYTICS SCHEMAS
# =============================================================================

class ChildProgressReportRequest(BaseModel):
    """Schema for requesting child progress reports"""
    child_id: int
    date_from: date
    date_to: date
    include_activities: bool = True
    include_sessions: bool = True
    include_assessments: bool = True
    include_emotional_analysis: bool = True
    format: str = Field(default="detailed", pattern="^(summary|detailed|comprehensive)$")
    
    @model_validator(mode='after')
    def validate_date_range(self):
        if self.date_to < self.date_from:
            raise ValueError('date_to must be after date_from')
        
        from datetime import date, timedelta
        if (self.date_to - self.date_from) > timedelta(days=365):
            raise ValueError('Date range cannot exceed 365 days')
        
        return self

class AnalyticsFilterSchema(BaseModel):
    """Schema for analytics filtering"""
    child_ids: Optional[List[int]] = None
    age_range: Optional[tuple[int, int]] = None
    support_levels: Optional[List[int]] = None
    activity_types: Optional[List[str]] = None
    date_range: Optional[tuple[date, date]] = None
    
    @field_validator('support_levels')
    @classmethod
    def validate_support_levels(cls, v):
        if v is None:
            return v
        for level in v:
            if level not in [1, 2, 3]:
                raise ValueError('Support levels must be 1, 2, or 3')
        return v

# =============================================================================
# API RESPONSE WRAPPERS
# =============================================================================

class PaginatedResponse(BaseModel):
    """Generic paginated response wrapper"""
    items: List[Any]
    total: int
    page: int
    size: int
    pages: int
    has_next: bool
    has_previous: bool

class ValidationErrorDetail(BaseModel):
    """Detailed validation error information"""
    field: str
    message: str
    invalid_value: Optional[Any] = None
    suggestion: Optional[str] = None

class EnhancedErrorResponse(BaseModel):
    """Enhanced error response with detailed validation information"""
    error: str
    details: List[ValidationErrorDetail] = Field(default_factory=list)
    suggestions: List[str] = Field(default_factory=list)
    documentation_link: Optional[str] = None

# =============================================================================
# WEBHOOK AND NOTIFICATION SCHEMAS
# =============================================================================

class NotificationPreferencesSchema(BaseModel):
    """Schema for notification preferences"""
    email_notifications: bool = True
    push_notifications: bool = True
    sms_notifications: bool = False
    
    activity_reminders: bool = True
    therapy_reminders: bool = True
    assessment_reminders: bool = True
    achievement_notifications: bool = True
    progress_reports: bool = True
    
    notification_frequency: str = Field(default="daily", pattern="^(immediate|daily|weekly)$")
    quiet_hours_start: Optional[str] = Field(None, pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$")
    quiet_hours_end: Optional[str] = Field(None, pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$")

# =============================================================================
# TASK 14: PROFILE MANAGEMENT SCHEMAS
# =============================================================================

class ProfileCompletionResponse(BaseModel):
    """Profile completion status response"""
    completion_percentage: float = Field(..., ge=0, le=100)
    completed_sections: List[str] = Field(default_factory=list)
    missing_sections: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    
    class Config:
        json_schema_extra = {
            "example": {
                "completion_percentage": 85.0,
                "completed_sections": ["basic_info", "contact", "professional"],
                "missing_sections": ["avatar", "bio"],
                "recommendations": ["Upload a profile photo", "Add a professional bio"]
            }
        }

class UserProfileUpdate(BaseModel):
    """Schema for updating user profile information"""
    first_name: Optional[str] = Field(None, min_length=2, max_length=50)
    last_name: Optional[str] = Field(None, min_length=2, max_length=50)
    phone: Optional[str] = Field(None, max_length=20)
    bio: Optional[str] = Field(None, max_length=1000)
    timezone: Optional[str] = Field(None, max_length=50)
    language: Optional[str] = Field(None, max_length=10)
    
    @field_validator('first_name', 'last_name')
    @classmethod
    def validate_names(cls, v):
        if v is None:
            return v
        if not re.match(NAME_PATTERN, v.strip()):
            raise ValueError('Names can only contain letters, spaces, hyphens, and apostrophes')
        return v.strip().title()
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if v is None:
            return v
        if not re.match(PHONE_PATTERN, v.strip()):
            raise ValueError(PHONE_ERROR_MSG)
        return v.strip()

class AvatarUploadResponse(BaseModel):
    """Response schema for avatar upload"""
    avatar_url: str = Field(..., description="URL of the uploaded avatar")
    success: bool = Field(default=True)
    message: str = Field(default="Avatar uploaded successfully")

class UserPreferences(BaseModel):
    """User preferences schema"""
    email_notifications: bool = Field(default=True)
    sms_notifications: bool = Field(default=False)
    push_notifications: bool = Field(default=True)
    data_sharing_consent: bool = Field(default=False)
    marketing_consent: bool = Field(default=False)
    preferred_communication_time: Optional[str] = Field(None, pattern="^(morning|afternoon|evening|any)$")
    language: str = Field(default="en", max_length=10)
    timezone: str = Field(default="UTC", max_length=50)
    
    class Config:
        json_schema_extra = {
            "example": {
                "email_notifications": True,
                "sms_notifications": False,
                "push_notifications": True,
                "data_sharing_consent": False,
                "marketing_consent": False,
                "preferred_communication_time": "morning",
                "language": "en",
                "timezone": "America/New_York"
            }
        }

class ProfessionalSearchFilters(BaseModel):
    """Filters for professional search functionality"""
    specialty: Optional[str] = Field(None, max_length=200)
    location: Optional[str] = Field(None, max_length=200)
    max_distance: Optional[int] = Field(None, ge=1, le=100)
    accepts_new_patients: Optional[bool] = None
    asd_specialization: Optional[bool] = None
    preferred_age_groups: Optional[List[str]] = None
    languages_spoken: Optional[List[str]] = None
    min_experience_years: Optional[int] = Field(None, ge=0, le=50)
    max_rating: Optional[float] = Field(None, ge=1.0, le=5.0)
    
    @field_validator('preferred_age_groups')
    @classmethod
    def validate_age_groups(cls, v):
        if v is None:
            return v
        allowed_groups = [
            'infants', 'toddlers', 'preschool', 'elementary', 'middle_school',
            'high_school', 'young_adults', 'adults'
        ]
        for group in v:
            if group.lower().replace(' ', '_') not in allowed_groups:
                raise ValueError(f'Invalid age group: {group}')
        return [group.lower().replace(' ', '_') for group in v]

class ProfessionalSearchResponse(BaseModel):
    """Response schema for professional search"""
    professionals: List[ProfessionalProfileResponse] = Field(default_factory=list)
    total_count: int = Field(default=0)
    page: int = Field(default=1)
    page_size: int = Field(default=20)
    total_pages: int = Field(default=0)

class AdminUserFilters(BaseModel):
    """Filters for admin user management"""
    role: Optional[str] = Field(None, pattern="^(parent|professional|admin)$")
    status: Optional[str] = Field(None, pattern="^(active|inactive|pending|locked)$")
    is_verified: Optional[bool] = None
    created_after: Optional[datetime] = None
    created_before: Optional[datetime] = None
    search_query: Optional[str] = Field(None, max_length=100)

class AdminUserResponse(BaseModel):
    """Admin view of user information"""
    id: int
    email: str
    first_name: str
    last_name: str
    full_name: str
    role: str
    status: str
    is_active: bool
    is_verified: bool
    email_verified_at: Optional[datetime] = None
    last_login_at: Optional[datetime] = None
    failed_login_attempts: int = 0
    locked_until: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Role-specific data
    children_count: Optional[int] = None
    professional_verified: Optional[bool] = None
    
    model_config = {"from_attributes": True}

class AdminUserUpdate(BaseModel):
    """Schema for admin user updates"""
    status: Optional[str] = Field(None, pattern="^(active|inactive|pending|locked)$")
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    role: Optional[str] = Field(None, pattern="^(parent|professional|admin)$")
    reset_failed_attempts: Optional[bool] = False
    unlock_account: Optional[bool] = False

# =============================================================================
# NOTIFICATION AND SYSTEM SCHEMAS
# =============================================================================

class NotificationSchema(BaseModel):
    """Schema for system notifications"""
    id: Optional[int] = None
    user_id: int
    title: str = Field(..., max_length=200)
    message: str = Field(..., max_length=1000)
    type: str = Field(..., pattern="^(info|warning|error|success)$")
    is_read: bool = Field(default=False)
    created_at: Optional[datetime] = None

class SystemHealthResponse(BaseModel):
    """System health check response"""
    status: str = Field(..., pattern="^(healthy|degraded|unhealthy)$")
    database_connected: bool
    total_users: int
    active_users: int
    total_children: int
    total_professionals: int
    system_uptime: str
    version: str

# =============================================================================
# CLINICAL ANALYTICS SCHEMAS (TASK 16)
# =============================================================================

class ClinicalInsightResponse(BaseModel):
    """Clinical insight response schema"""
    insight_type: str = Field(..., description="Type of insight")
    title: str = Field(..., description="Insight title")
    description: str = Field(..., description="Insight description")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    supporting_data: Dict[str, Any] = Field(default_factory=dict, description="Supporting data")
    recommendations: List[str] = Field(default_factory=list, description="Recommendations")
    priority: str = Field(..., pattern="^(high|medium|low)$", description="Priority level")

class PopulationAnalyticsRequest(BaseModel):
    """Population analytics request schema"""
    date_from: Optional[datetime] = Field(None, description="Start date for analysis")
    date_to: Optional[datetime] = Field(None, description="End date for analysis")
    age_min: Optional[int] = Field(None, ge=0, le=25, description="Minimum age filter")
    age_max: Optional[int] = Field(None, ge=0, le=25, description="Maximum age filter")
    support_level: Optional[int] = Field(None, ge=1, le=3, description="Support level filter")

class CohortComparisonRequest(BaseModel):
    """Cohort comparison request schema"""
    cohorts: List[Dict[str, Any]] = Field(..., min_length=2, max_length=5)
    metrics: List[str] = Field(default_factory=lambda: ["engagement", "progress", "completion_rate"])

class ClinicalMetricsResponse(BaseModel):
    """Clinical metrics response schema"""
    patient_count: int = Field(..., description="Total patient count")
    total_sessions: int = Field(..., description="Total sessions")
    average_engagement: float = Field(..., description="Average engagement score")
    improvement_rate: float = Field(..., description="Improvement rate percentage")
    completion_rate: float = Field(..., description="Completion rate percentage")
    assessment_scores: Dict[str, float] = Field(default_factory=dict)
    behavioral_trends: Dict[str, Any] = Field(default_factory=dict)

# =============================================================================
# FORWARD REFERENCES RESOLUTION (Updated)
# =============================================================================

# Rebuild all models to resolve forward references
ChildResponse.model_rebuild()
ChildDetailResponse.model_rebuild()
ActivityResponse.model_rebuild()
ProfessionalProfileResponse.model_rebuild()
AssessmentResponse.model_rebuild()
EnhancedChildResponse.model_rebuild()
EnhancedActivityResponse.model_rebuild()
PaginatedResponse.model_rebuild()

# =============================================================================
# ADVANCED VALIDATION UTILITIES
# =============================================================================

class ValidationUtils:
    """Utility class for common validation patterns"""
    
    @staticmethod
    def validate_json_structure(data: Dict[str, Any], required_keys: List[str], 
                               optional_keys: List[str] = None) -> Dict[str, Any]:
        """Validate JSON structure has required keys and no unexpected keys"""
        if not isinstance(data, dict):
            raise ValueError("Data must be a dictionary")
        
        # Check required keys
        missing_keys = [key for key in required_keys if key not in data]
        if missing_keys:
            raise ValueError(f"Missing required keys: {', '.join(missing_keys)}")
        
        # Check for unexpected keys
        allowed_keys = set(required_keys)
        if optional_keys:
            allowed_keys.update(optional_keys)
        
        unexpected_keys = [key for key in data.keys() if key not in allowed_keys]
        if unexpected_keys:
            raise ValueError(f"Unexpected keys: {', '.join(unexpected_keys)}")
        
        return data
    
    @staticmethod
    def validate_age_appropriate_content(age: int, content_category: str) -> bool:
        """Validate content is age-appropriate"""
        age_ranges = {
            'toddler': (0, 3),
            'preschool': (3, 6),
            'elementary': (6, 12),
            'teen': (12, 18),
            'young_adult': (18, 25)
        }
        
        for category, (min_age, max_age) in age_ranges.items():
            if min_age <= age < max_age:
                return content_category in ['universal', category]
        
        return content_category == 'universal'

class SensoryProfileValidator:
    """Advanced validation for sensory profiles"""
    
    VALID_SENSORY_DOMAINS = [
        'auditory', 'visual', 'tactile', 'vestibular', 
        'proprioceptive', 'gustatory', 'olfactory'
    ]
    
    SENSORY_KEYWORDS = {
        'auditory': [
            'noise', 'sound', 'music', 'volume', 'pitch', 'frequency',
            'loud', 'quiet', 'whisper', 'echo', 'background_noise'
        ],
        'visual': [
            'light', 'bright', 'dim', 'color', 'pattern', 'movement',
            'flashing', 'glare', 'contrast', 'visual_clutter'
        ],
        'tactile': [
            'texture', 'temperature', 'pressure', 'soft', 'rough',
            'smooth', 'wet', 'dry', 'sticky', 'fabric', 'touch'
        ],
        'vestibular': [
            'movement', 'spinning', 'swinging', 'balance', 'dizzy',
            'motion', 'rocking', 'tilting', 'acceleration'
        ],
        'proprioceptive': [
            'body_awareness', 'pressure', 'weight', 'heavy_work',
            'joint_compression', 'muscle', 'position', 'force'
        ],
        'gustatory': [
            'taste', 'flavor', 'sweet', 'sour', 'bitter', 'salty',
            'spicy', 'texture', 'temperature', 'food'
        ],
        'olfactory': [
            'smell', 'odor', 'scent', 'fragrance', 'perfume',
            'chemical', 'cleaning_products', 'food_smells'
        ]
    }
    
    @classmethod
    def validate_sensory_keywords(cls, domain: str, items: List[str]) -> List[str]:
        """Validate that sensory items are appropriate for the domain"""
        if domain not in cls.VALID_SENSORY_DOMAINS:
            raise ValueError(f"Invalid sensory domain: {domain}")
        
        domain_keywords = cls.SENSORY_KEYWORDS.get(domain, [])
        validated_items = []
        
        for item in items:
            item_lower = item.lower().replace(' ', '_')
            # Check if item contains domain-relevant keywords
            is_relevant = any(keyword in item_lower for keyword in domain_keywords)
            if not is_relevant and len(item) > 5:  # Allow short generic terms
                # Warning: item might not be relevant to domain
                pass
            validated_items.append(item)
        
        return validated_items

class TherapyValidator:
    """Advanced validation for therapy information"""
    
    THERAPY_TYPES = {
        'ABA': ['Applied Behavior Analysis', 'behavioral', 'behavior_modification'],
        'Speech Therapy': ['speech', 'language', 'communication', 'articulation'],
        'Occupational Therapy': ['OT', 'occupational', 'fine_motor', 'sensory_integration'],
        'Physical Therapy': ['PT', 'physical', 'gross_motor', 'movement'],
        'Social Skills': ['social', 'peer_interaction', 'social_communication'],
        'Music Therapy': ['music', 'rhythm', 'singing', 'instruments'],
        'Art Therapy': ['art', 'creative', 'expression', 'drawing']
    }
    
    FREQUENCY_PATTERNS = {
        'daily': 7,
        'weekly': 1,
        '2x_weekly': 2,
        '3x_weekly': 3,
        '4x_weekly': 4,
        '5x_weekly': 5,
        'biweekly': 0.5,
        'monthly': 0.25,
        'intensive': 10,  # Intensive programs
        'as_needed': 0  # Variable frequency
    }
    
    @classmethod
    def validate_therapy_intensity(cls, therapies: List[Dict]) -> bool:
        """Validate total therapy intensity is reasonable"""
        total_weekly_hours = 0
        
        for therapy in therapies:
            frequency = therapy.get('frequency', '').lower()
            if frequency in cls.FREQUENCY_PATTERNS:
                sessions_per_week = cls.FREQUENCY_PATTERNS[frequency]
                # Assume 1 hour per session on average
                total_weekly_hours += sessions_per_week
        
        # Check for reasonable limits
        if total_weekly_hours > 40:  # More than full-time work
            raise ValueError("Total therapy hours per week exceeds reasonable limits")
        
        return True

# =============================================================================
# COMPLEX JSON FIELD SCHEMAS
# =============================================================================

class EmergencyContactSchema(BaseModel):
    """Schema for emergency contact validation"""
    name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=10, max_length=20)
    relationship: str = Field(..., min_length=2, max_length=50)
    email: Optional[str] = Field(None, max_length=200)
    address: Optional[str] = Field(None, max_length=300)
    is_primary: bool = False
    notes: Optional[str] = Field(None, max_length=500)
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        import re
        if not re.match(r'^[\+]?[1-9][\d\s\-\(\)]{7,15}$', v.strip()):
            raise ValueError('Invalid phone number format')
        return v.strip()
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        if v is None:
            return v
        import re
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, v):
            raise ValueError('Invalid email format')
        return v.lower()

class ProgressNoteSchema(BaseModel):
    """Schema for progress note validation"""
    date: datetime = Field(..., description="Date of progress note")
    category: str = Field(..., description="Category of progress")
    note: str = Field(..., min_length=5, max_length=2000, description="Progress note content")
    author: str = Field(..., min_length=2, max_length=100, description="Author of the note")
    visibility: str = Field(default="parent", pattern="^(parent|professional|both)$")
    tags: List[str] = Field(default_factory=list, max_length=10)
    
    @field_validator('category')
    @classmethod
    def validate_category(cls, v):
        allowed_categories = [
            'behavior', 'communication', 'social', 'academic', 'sensory',
            'motor_skills', 'self_care', 'therapy', 'medical', 'general'
        ]
        if v.lower() not in allowed_categories:
            raise ValueError(f"Category must be one of: {', '.join(allowed_categories)}")
        return v.lower()
    
    @field_validator('tags')
    @classmethod
    def validate_tags(cls, v):
        for tag in v:
            if not isinstance(tag, str) or len(tag.strip()) == 0:
                raise ValueError('All tags must be non-empty strings')
            if len(tag) > 30:
                raise ValueError('Individual tags cannot exceed 30 characters')
        return [tag.strip().lower() for tag in v if tag.strip()]

# =============================================================================
# TASK 14 PROFILE ENHANCEMENT SCHEMAS
# =============================================================================

class ProfileCompletionResponse(BaseModel):
    """Profile completion status response"""
    completion_percentage: int = Field(..., ge=0, le=100, description="Profile completion percentage")
    missing_fields: List[str] = Field(default_factory=list, description="List of missing profile fields")
    recommendations: List[str] = Field(default_factory=list, description="Profile improvement recommendations")
    
    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    """Enhanced user profile update schema"""
    first_name: Optional[str] = Field(None, min_length=1, max_length=50, description="User's first name")
    last_name: Optional[str] = Field(None, min_length=1, max_length=50, description="User's last name")
    phone_number: Optional[str] = Field(None, description="User's phone number")
    bio: Optional[str] = Field(None, max_length=500, description="User biography")
    location: Optional[str] = Field(None, max_length=100, description="User location")
    emergency_contact_name: Optional[str] = Field(None, max_length=100, description="Emergency contact name")
    emergency_contact_phone: Optional[str] = Field(None, description="Emergency contact phone")
    preferred_communication: Optional[str] = Field(None, description="Preferred communication method")
    
    @field_validator('first_name', 'last_name', 'emergency_contact_name')
    @classmethod
    def validate_names(cls, v):
        if v is not None:
            if not re.match(NAME_PATTERN, v):
                raise ValueError('Name must contain only letters, spaces, hyphens, and apostrophes')
        return v
    
    @field_validator('phone_number', 'emergency_contact_phone')
    @classmethod
    def validate_phone(cls, v):
        if v is not None:
            if not re.match(PHONE_PATTERN, v):
                raise ValueError(PHONE_ERROR_MSG)
        return v

class AvatarUploadResponse(BaseModel):
    """Avatar upload response schema"""
    success: bool = Field(..., description="Upload success status")
    avatar_url: Optional[str] = Field(None, description="URL of uploaded avatar")
    message: str = Field(..., description="Upload status message")
    
    class Config:
        from_attributes = True

class UserPreferences(BaseModel):
    """User preferences schema"""
    language: str = Field(default="en", description="Preferred language")
    timezone: str = Field(default="UTC", description="User timezone")
    notifications_enabled: bool = Field(default=True, description="Email notifications enabled")
    privacy_level: str = Field(default="standard", description="Privacy level setting")
    theme: str = Field(default="light", description="UI theme preference")
    
    @field_validator('language')
    @classmethod
    def validate_language(cls, v):
        allowed_languages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko']
        if v not in allowed_languages:
            raise ValueError(f"Language must be one of: {', '.join(allowed_languages)}")
        return v
    
    @field_validator('privacy_level')
    @classmethod
    def validate_privacy_level(cls, v):
        allowed_levels = ['public', 'standard', 'private']
        if v not in allowed_levels:
            raise ValueError(f"Privacy level must be one of: {', '.join(allowed_levels)}")
        return v
    
    @field_validator('theme')
    @classmethod
    def validate_theme(cls, v):
        allowed_themes = ['light', 'dark', 'auto']
        if v not in allowed_themes:
            raise ValueError(f"Theme must be one of: {', '.join(allowed_themes)}")
        return v

class ProfessionalSearchFilters(BaseModel):
    """Professional search filters schema"""
    specializations: Optional[List[str]] = Field(None, description="Professional specializations")
    location: Optional[str] = Field(None, description="Search location")
    experience_years: Optional[int] = Field(None, ge=0, le=50, description="Minimum years of experience")
    availability: Optional[str] = Field(None, description="Availability preference")
    max_distance: Optional[int] = Field(None, ge=1, le=100, description="Maximum distance in miles")
    accepts_insurance: Optional[bool] = Field(None, description="Accepts insurance")
    
    @field_validator('specializations')
    @classmethod
    def validate_specializations(cls, v):
        if v is not None:
            allowed_specializations = [
                'behavioral_therapy', 'occupational_therapy', 'speech_therapy',
                'physical_therapy', 'psychology', 'psychiatry', 'dentistry',
                'pediatrics', 'neurology', 'special_education'
            ]
            for spec in v:
                if spec not in allowed_specializations:
                    raise ValueError(f"Invalid specialization. Allowed: {', '.join(allowed_specializations)}")
        return v
    
    @field_validator('availability')
    @classmethod
    def validate_availability(cls, v):
        if v is not None:
            allowed_availability = ['weekdays', 'weekends', 'evenings', 'flexible']
            if v not in allowed_availability:
                raise ValueError(f"Availability must be one of: {', '.join(allowed_availability)}")
        return v

class AdminUserResponse(BaseModel):
    """Admin user management response schema"""
    id: int = Field(..., description="User ID")
    email: str = Field(..., description="User email")
    full_name: str = Field(..., description="User full name")
    role: str = Field(..., description="User role")
    is_active: bool = Field(..., description="User active status")
    is_verified: bool = Field(..., description="User verification status")
    created_at: datetime = Field(..., description="Account creation date")
    last_login: Optional[datetime] = Field(None, description="Last login date")
    profile_completion: int = Field(..., description="Profile completion percentage")
    
    class Config:
        from_attributes = True

# =============================================================================
# END OF FILE
# =============================================================================