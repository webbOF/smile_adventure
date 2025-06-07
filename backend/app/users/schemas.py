"""
Pydantic schemas for request/response models - FIXED VERSION
Aggiornati per supportare il nuovo sistema auth e ASD features
"""

from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field, field_validator
from enum import Enum

# =============================================================================
# ENUMS FOR VALIDATION
# =============================================================================

class ActivityTypeEnum(str, Enum):
    """Activity types for children"""
    DENTAL_CARE = "dental_care"
    THERAPY_SESSION = "therapy_session"
    MEDICATION = "medication"
    EXERCISE = "exercise"
    SOCIAL_INTERACTION = "social_interaction"
    SENSORY_BREAK = "sensory_break"
    FREE_PLAY = "free_play"
    EDUCATIONAL = "educational"

class SessionTypeEnum(str, Enum):
    """Game session types"""
    DENTAL_VISIT = "dental_visit"
    THERAPY_SESSION = "therapy_session"
    FREE_PLAY = "free_play"
    ASSESSMENT = "assessment"
    PRACTICE_SESSION = "practice_session"

class EmotionalStateEnum(str, Enum):
    """Emotional states for tracking"""
    CALM = "calm"
    HAPPY = "happy"
    EXCITED = "excited"
    ANXIOUS = "anxious"
    FRUSTRATED = "frustrated"
    OVERWHELMED = "overwhelmed"
    FOCUSED = "focused"
    TIRED = "tired"

class SupportLevelEnum(str, Enum):
    """Support levels for activities"""
    MINIMAL = "minimal"
    MODERATE = "moderate"
    EXTENSIVE = "extensive"

# =============================================================================
# USER PROFILE SCHEMAS
# =============================================================================

class UserProfileUpdate(BaseModel):
    """Schema for updating user profile"""
    first_name: Optional[str] = Field(None, min_length=2, max_length=100)
    last_name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, pattern=r'^\+?[\d\s\-\(\)]{10,15}$')
    timezone: Optional[str] = Field(None, max_length=50)
    language: Optional[str] = Field(None, max_length=10)
    bio: Optional[str] = Field(None, max_length=500)
    avatar_url: Optional[str] = Field(None, max_length=500)
    
    # Professional fields (only for professionals)
    license_number: Optional[str] = Field(None, max_length=100)
    specialization: Optional[str] = Field(None, max_length=200)
    clinic_name: Optional[str] = Field(None, max_length=200)
    clinic_address: Optional[str] = Field(None, max_length=500)
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "first_name": "John",
                "last_name": "Doe",
                "phone": "+1234567890",
                "timezone": "America/New_York",
                "bio": "Parent of two wonderful children"
            }
        }
    }

class UserWithChildrenResponse(BaseModel):
    """User response with children information"""
    id: int
    email: str
    first_name: str
    last_name: str
    full_name: str
    phone: Optional[str] = None
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    children: List['ChildResponse'] = []
    total_children: int = 0
    
    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": 1,
                "email": "parent@example.com",
                "first_name": "John",
                "last_name": "Doe",
                "full_name": "John Doe",
                "role": "parent",
                "children": [],
                "total_children": 2
            }
        }
    }

# =============================================================================
# CHILD SCHEMAS
# =============================================================================

class ChildBase(BaseModel):
    """Base child schema"""
    name: str = Field(..., min_length=2, max_length=100)
    age: int = Field(..., ge=0, le=18)
    avatar_url: Optional[str] = Field(None, max_length=500)
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        """Validate child name"""
        if not v or not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip().title()

class ChildCreate(ChildBase):
    """Schema for creating a child"""
    # ASD-specific fields
    diagnosis: Optional[str] = Field(None, max_length=200, description="ASD diagnosis details")
    support_level: Optional[int] = Field(None, ge=1, le=3, description="Support level (1=minimal, 2=moderate, 3=extensive)")
    sensory_profile: Optional[Dict[str, Any]] = Field(None, description="JSON sensory preferences and triggers")
    behavioral_notes: Optional[str] = Field(None, max_length=1000, description="Behavioral observations and notes")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "Emma",
                "age": 8,
                "diagnosis": "Autism Spectrum Disorder",
                "support_level": 2,
                "sensory_profile": {
                    "sound_sensitivity": "high",
                    "light_sensitivity": "moderate",
                    "preferred_textures": ["soft", "smooth"],
                    "calming_activities": ["deep pressure", "music"]
                },
                "behavioral_notes": "Responds well to visual schedules and routine"
            }
        }
    }

class ChildUpdate(BaseModel):
    """Schema for updating child information"""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    age: Optional[int] = Field(None, ge=0, le=18)
    avatar_url: Optional[str] = Field(None, max_length=500)
    diagnosis: Optional[str] = Field(None, max_length=200)
    support_level: Optional[int] = Field(None, ge=1, le=3)
    sensory_profile: Optional[Dict[str, Any]] = None
    behavioral_notes: Optional[str] = Field(None, max_length=1000)
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        """Validate child name if provided"""
        if v is not None:
            if not v or not v.strip():
                raise ValueError('Name cannot be empty')
            return v.strip().title()
        return v

class ChildResponse(ChildBase):
    """Child response schema"""
    id: int
    points: int = 0
    level: int = 1
    support_level: Optional[int] = None
    diagnosis: Optional[str] = None
    is_active: bool = True
    created_at: datetime
    
    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": 1,
                "name": "Emma",
                "age": 8,
                "points": 250,
                "level": 3,
                "support_level": 2,
                "diagnosis": "Autism Spectrum Disorder",
                "is_active": True,
                "created_at": "2025-06-01T10:00:00Z"
            }
        }
    }

class ChildDetailResponse(ChildResponse):
    """Detailed child response with additional information"""
    sensory_profile: Optional[Dict[str, Any]] = None
    behavioral_notes: Optional[str] = None
    updated_at: Optional[datetime] = None
    progress_summary: Optional[Dict[str, Any]] = None
    recent_activities_count: int = 0
    recent_sessions_count: int = 0
    
    model_config = {
        "from_attributes": True
    }

# =============================================================================
# ACTIVITY SCHEMAS
# =============================================================================

class ActivityBase(BaseModel):
    """Base activity schema"""
    activity_type: ActivityTypeEnum = Field(..., description="Type of activity")
    activity_name: str = Field(..., min_length=2, max_length=200, description="Name of the activity")
    description: Optional[str] = Field(None, max_length=1000, description="Activity description")
    points_earned: int = Field(default=0, ge=0, le=100, description="Points earned for completion")

class ActivityCreate(ActivityBase):
    """Schema for creating an activity"""
    child_id: int = Field(..., description="ID of the child performing the activity")
    
    # ASD-specific tracking fields
    emotional_state_before: Optional[EmotionalStateEnum] = Field(None, description="Child's emotional state before activity")
    emotional_state_after: Optional[EmotionalStateEnum] = Field(None, description="Child's emotional state after activity")
    difficulty_level: Optional[int] = Field(None, ge=1, le=5, description="Difficulty level (1-5 scale)")
    support_needed: Optional[SupportLevelEnum] = Field(None, description="Level of support needed")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "child_id": 1,
                "activity_type": "dental_care",
                "activity_name": "Brushing teeth with timer",
                "description": "Successfully brushed teeth for 2 minutes using visual timer",
                "points_earned": 10,
                "emotional_state_before": "anxious",
                "emotional_state_after": "calm",
                "difficulty_level": 3,
                "support_needed": "moderate"
            }
        }
    }

class ActivityResponse(ActivityBase):
    """Activity response schema"""
    id: int
    child_id: int
    emotional_state_before: Optional[str] = None
    emotional_state_after: Optional[str] = None
    difficulty_level: Optional[int] = None
    support_needed: Optional[str] = None
    completed_at: datetime
    verified_by_parent: bool = False
    
    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": 1,
                "child_id": 1,
                "activity_type": "dental_care",
                "activity_name": "Brushing teeth",
                "points_earned": 10,
                "emotional_state_before": "anxious",
                "emotional_state_after": "calm",
                "completed_at": "2025-06-08T09:00:00Z",
                "verified_by_parent": True
            }
        }
    }

# =============================================================================
# GAME SESSION SCHEMAS
# =============================================================================

class GameSessionBase(BaseModel):
    """Base game session schema"""
    session_type: SessionTypeEnum = Field(..., description="Type of game session")
    scenario_name: str = Field(..., min_length=2, max_length=200, description="Name of the scenario")

class GameSessionCreate(GameSessionBase):
    """Schema for creating a game session"""
    child_id: int = Field(..., description="ID of the child playing")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "child_id": 1,
                "session_type": "dental_visit",
                "scenario_name": "Visit to Dr. Smith's Clinic"
            }
        }
    }

class GameSessionUpdate(BaseModel):
    """Schema for updating game session progress"""
    levels_completed: Optional[int] = Field(None, ge=0)
    score: Optional[int] = Field(None, ge=0)
    interactions_count: Optional[int] = Field(None, ge=0)
    emotional_data: Optional[Dict[str, Any]] = None
    interaction_data: Optional[Dict[str, Any]] = None
    parent_notes: Optional[str] = Field(None, max_length=1000)
    parent_rating: Optional[int] = Field(None, ge=1, le=5)

class GameSessionResponse(GameSessionBase):
    """Game session response schema"""
    id: int
    child_id: int
    started_at: datetime
    ended_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    levels_completed: int = 0
    score: int = 0
    interactions_count: int = 0
    completion_status: str = "in_progress"
    
    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": 1,
                "child_id": 1,
                "session_type": "dental_visit",
                "scenario_name": "Visit to Dr. Smith's Clinic",
                "started_at": "2025-06-08T10:00:00Z",
                "ended_at": "2025-06-08T10:15:00Z",
                "duration_seconds": 900,
                "levels_completed": 3,
                "score": 85,
                "completion_status": "completed"
            }
        }
    }

# =============================================================================
# PROGRESS AND ANALYTICS SCHEMAS
# =============================================================================

class ChildProgressResponse(BaseModel):
    """Comprehensive child progress response"""
    child_id: int
    child_name: str
    current_level: int
    total_points: int
    period_days: int
    activity_stats: Dict[str, Any]
    game_stats: Dict[str, Any]
    progress_summary: Dict[str, Any]
    generated_at: datetime
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "child_id": 1,
                "child_name": "Emma",
                "current_level": 3,
                "total_points": 250,
                "period_days": 30,
                "activity_stats": {
                    "total_activities": 15,
                    "total_points": 150,
                    "activity_types": {
                        "dental_care": {"count": 8, "total_points": 80},
                        "therapy_session": {"count": 7, "total_points": 70}
                    }
                },
                "game_stats": {
                    "total_sessions": 12,
                    "completed_sessions": 10,
                    "completion_rate": 83.33,
                    "average_score": 78.5
                },
                "generated_at": "2025-06-08T12:00:00Z"
            }
        }
    }

class ActivityStatsResponse(BaseModel):
    """Activity statistics response"""
    period_days: int
    total_activities: int
    total_points: int
    verified_activities: int
    activity_types: Dict[str, Dict[str, Union[int, float]]]
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "period_days": 30,
                "total_activities": 25,
                "total_points": 250,
                "verified_activities": 20,
                "activity_types": {
                    "dental_care": {
                        "count": 12,
                        "total_points": 120,
                        "avg_difficulty": 2.5
                    },
                    "therapy_session": {
                        "count": 13,
                        "total_points": 130,
                        "avg_difficulty": 3.2
                    }
                }
            }
        }
    }

class GameStatsResponse(BaseModel):
    """Game session statistics response"""
    period_days: int
    total_sessions: int
    completed_sessions: int
    completion_rate: float
    total_score: int
    average_score: float
    total_duration_minutes: float
    average_duration_minutes: float
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "period_days": 30,
                "total_sessions": 15,
                "completed_sessions": 12,
                "completion_rate": 80.0,
                "total_score": 940,
                "average_score": 78.33,
                "total_duration_minutes": 180.5,
                "average_duration_minutes": 15.04
            }
        }
    }

class FamilyStatsResponse(BaseModel):
    """Family statistics response"""
    total_children: int
    total_points: int
    total_activities: int
    total_sessions: int
    children: List[Dict[str, Any]]
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "total_children": 2,
                "total_points": 450,
                "total_activities": 40,
                "total_sessions": 25,
                "children": [
                    {
                        "id": 1,
                        "name": "Emma",
                        "level": 3,
                        "points": 250,
                        "activities_count": 25,
                        "sessions_count": 15
                    },
                    {
                        "id": 2,
                        "name": "Alex",
                        "level": 2,
                        "points": 200,
                        "activities_count": 15,
                        "sessions_count": 10
                    }
                ]
            }
        }
    }

# =============================================================================
# SEARCH AND FILTER SCHEMAS
# =============================================================================

class ChildSearchFilters(BaseModel):
    """Filters for child search"""
    search_term: Optional[str] = Field(None, min_length=1, max_length=100)
    age_min: Optional[int] = Field(None, ge=0, le=18)
    age_max: Optional[int] = Field(None, ge=0, le=18)
    support_level: Optional[int] = Field(None, ge=1, le=3)
    
    @field_validator('age_max')
    @classmethod
    def validate_age_range(cls, v, info):
        """Validate that age_max >= age_min"""
        if v is not None and info.data.get('age_min') is not None:
            if v < info.data['age_min']:
                raise ValueError('age_max must be greater than or equal to age_min')
        return v

class ActivitySearchFilters(BaseModel):
    """Filters for activity search"""
    activity_type: Optional[ActivityTypeEnum] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    verified_only: Optional[bool] = False
    min_points: Optional[int] = Field(None, ge=0)
    max_points: Optional[int] = Field(None, ge=0)
    
    @field_validator('max_points')
    @classmethod
    def validate_points_range(cls, v, info):
        """Validate that max_points >= min_points"""
        if v is not None and info.data.get('min_points') is not None:
            if v < info.data['min_points']:
                raise ValueError('max_points must be greater than or equal to min_points')
        return v
    
    @field_validator('date_to')
    @classmethod
    def validate_date_range(cls, v, info):
        """Validate that date_to >= date_from"""
        if v is not None and info.data.get('date_from') is not None:
            if v < info.data['date_from']:
                raise ValueError('date_to must be greater than or equal to date_from')
        return v

# =============================================================================
# BULK OPERATIONS SCHEMAS
# =============================================================================

class BulkVerifyRequest(BaseModel):
    """Request schema for bulk activity verification"""
    activity_ids: List[int] = Field(..., min_length=1, max_length=50)
    verified: bool = True
    
    @field_validator('activity_ids')
    @classmethod
    def validate_activity_ids(cls, v):
        """Validate activity IDs list"""
        if not v:
            raise ValueError('At least one activity ID is required')
        if len(set(v)) != len(v):
            raise ValueError('Duplicate activity IDs are not allowed')
        return v
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "activity_ids": [1, 2, 3, 4, 5],
                "verified": True
            }
        }
    }

class BulkVerifyResponse(BaseModel):
    """Response schema for bulk activity verification"""
    message: str
    updated_count: int
    total_requested: int
    failed_ids: List[int] = []
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "message": "Successfully verified 4 out of 5 activities",
                "updated_count": 4,
                "total_requested": 5,
                "failed_ids": [3]
            }
        }
    }

# =============================================================================
# ERROR AND VALIDATION SCHEMAS
# =============================================================================

class ValidationErrorResponse(BaseModel):
    """Validation error response schema"""
    error: bool = True
    message: str
    field_errors: Dict[str, List[str]] = {}
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "error": True,
                "message": "Validation failed",
                "field_errors": {
                    "age": ["Age must be between 0 and 18"],
                    "name": ["Name is required"]
                }
            }
        }
    }

class SuccessResponse(BaseModel):
    """Generic success response schema"""
    success: bool = True
    message: str
    data: Optional[Dict[str, Any]] = None
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "success": True,
                "message": "Operation completed successfully",
                "data": {"id": 1, "status": "completed"}
            }
        }
    }

# =============================================================================
# PAGINATION SCHEMAS
# =============================================================================

class PaginationParams(BaseModel):
    """Pagination parameters"""
    page: int = Field(default=1, ge=1, description="Page number (1-based)")
    size: int = Field(default=20, ge=1, le=100, description="Number of items per page")
    
    @property
    def offset(self) -> int:
        """Calculate offset for database queries"""
        return (self.page - 1) * self.size

class PaginatedResponse(BaseModel):
    """Generic paginated response schema"""
    items: List[Any]
    total: int
    page: int
    size: int
    pages: int
    has_next: bool
    has_prev: bool
    
    @classmethod
    def create(
        cls, 
        items: List[Any], 
        total: int, 
        page: int, 
        size: int
    ) -> 'PaginatedResponse':
        """Create paginated response"""
        pages = (total + size - 1) // size  # Ceiling division
        return cls(
            items=items,
            total=total,
            page=page,
            size=size,
            pages=pages,
            has_next=page < pages,
            has_prev=page > 1
        )

# =============================================================================
# PROFESSIONAL SCHEMAS (for healthcare professionals)
# =============================================================================

class ProfessionalChildAccess(BaseModel):
    """Schema for professional access to child data"""
    child_id: int
    access_level: str = Field(..., regex="^(read|write|full)$")
    granted_by: int  # Parent user ID
    granted_at: datetime
    expires_at: Optional[datetime] = None
    notes: Optional[str] = Field(None, max_length=500)

class ProfessionalAnalyticsResponse(BaseModel):
    """Analytics response for healthcare professionals"""
    professional_id: int
    license_number: Optional[str] = None
    specialization: Optional[str] = None
    assigned_children_count: int
    total_sessions_observed: int
    average_improvement_score: Optional[float] = None
    recommendations_given: int
    period_start: datetime
    period_end: datetime
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "professional_id": 1,
                "license_number": "MD123456",
                "specialization": "Pediatric Dentistry",
                "assigned_children_count": 15,
                "total_sessions_observed": 45,
                "average_improvement_score": 7.8,
                "recommendations_given": 12,
                "period_start": "2025-05-01T00:00:00Z",
                "period_end": "2025-06-01T00:00:00Z"
            }
        }
    }

# =============================================================================
# EXPORT SCHEMAS
# =============================================================================

class ExportRequest(BaseModel):
    """Request schema for data export"""
    export_type: str = Field(..., regex="^(activities|sessions|progress|full)$")
    format: str = Field(default="json", regex="^(json|csv|pdf)$")
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    include_sensitive: bool = Field(default=False, description="Include sensitive ASD data")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "export_type": "activities",
                "format": "csv",
                "date_from": "2025-05-01T00:00:00Z",
                "date_to": "2025-06-01T00:00:00Z",
                "include_sensitive": False
            }
        }
    }

class ExportResponse(BaseModel):
    """Response schema for data export"""
    export_id: str
    file_url: str
    file_size_bytes: int
    expires_at: datetime
    format: str
    created_at: datetime
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "export_id": "exp_1234567890",
                "file_url": "/api/exports/exp_1234567890/download",
                "file_size_bytes": 15432,
                "expires_at": "2025-06-09T12:00:00Z",
                "format": "csv",
                "created_at": "2025-06-08T12:00:00Z"
            }
        }
    }

# =============================================================================
# FORWARD REFERENCES RESOLUTION
# =============================================================================

# Update forward references for circular dependencies
UserWithChildrenResponse.model_rebuild()
ChildResponse.model_rebuild()
ChildDetailResponse.model_rebuild()
ActivityResponse.model_rebuild()
GameSessionResponse.model_rebuild()