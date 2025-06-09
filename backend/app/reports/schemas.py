"""
Reports Schemas - Pydantic models for API serialization and validation
Game Session and Report data validation with comprehensive ASD support
"""

from datetime import datetime
from typing import Optional, Dict, Any, List, Union
from pydantic import BaseModel, Field, validator, ConfigDict
from enum import Enum

# =============================================================================
# ENUMS FOR VALIDATION
# =============================================================================

class SessionTypeEnum(str, Enum):
    """Session types for validation"""
    DENTAL_VISIT = "dental_visit"
    THERAPY_SESSION = "therapy_session"
    SOCIAL_SCENARIO = "social_scenario"
    SENSORY_EXPLORATION = "sensory_exploration"
    DAILY_ROUTINE = "daily_routine"
    EMERGENCY_PREPARATION = "emergency_preparation"

class EmotionalStateEnum(str, Enum):
    """Emotional states for validation"""
    CALM = "calm"
    HAPPY = "happy"
    EXCITED = "excited"
    ANXIOUS = "anxious"
    FRUSTRATED = "frustrated"
    OVERWHELMED = "overwhelmed"
    FOCUSED = "focused"
    TIRED = "tired"
    CONFUSED = "confused"
    CONFIDENT = "confident"

class ReportTypeEnum(str, Enum):
    """Report types for validation"""
    PROGRESS = "progress"
    ASSESSMENT = "assessment"
    SUMMARY = "summary"
    INCIDENT = "incident"
    RECOMMENDATION = "recommendation"
    DISCHARGE = "discharge"

class ReportStatusEnum(str, Enum):
    """Report status for validation"""
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    PUBLISHED = "published"
    ARCHIVED = "archived"

# =============================================================================
# GAME SESSION SCHEMAS
# =============================================================================

class GameSessionBase(BaseModel):
    """Base schema for game sessions"""
    child_id: int = Field(..., description="ID of the child participating in the session")
    session_type: SessionTypeEnum = Field(..., description="Type of game session scenario")
    scenario_name: str = Field(..., min_length=1, max_length=200, description="Name of the scenario")
    scenario_id: Optional[str] = Field(None, max_length=100, description="Unique scenario identifier")
    scenario_version: Optional[str] = Field(None, max_length=20, description="Scenario version number")

class GameSessionCreate(GameSessionBase):
    """Schema for creating a new game session"""
    device_type: Optional[str] = Field(None, max_length=50, description="Device used for session")
    device_model: Optional[str] = Field(None, max_length=100, description="Specific device model")
    app_version: Optional[str] = Field(None, max_length=20, description="App version used")
    environment_type: Optional[str] = Field(None, max_length=50, description="Environment where session took place")
    support_person_present: bool = Field(False, description="Whether a support person was present")

class GameSessionUpdate(BaseModel):
    """Schema for updating game session progress"""
    # Game progress metrics
    levels_completed: Optional[int] = Field(None, ge=0, description="Number of levels completed")
    max_level_reached: Optional[int] = Field(None, ge=0, description="Highest level reached")
    score: Optional[int] = Field(None, ge=0, description="Current score")
    interactions_count: Optional[int] = Field(None, ge=0, description="Total interactions")
    correct_responses: Optional[int] = Field(None, ge=0, description="Number of correct responses")
    incorrect_responses: Optional[int] = Field(None, ge=0, description="Number of incorrect responses")
    help_requests: Optional[int] = Field(None, ge=0, description="Number of help requests")
    hint_usage_count: Optional[int] = Field(None, ge=0, description="Number of hints used")
    
    # Session control
    pause_count: Optional[int] = Field(None, ge=0, description="Number of pauses")
    total_pause_duration: Optional[int] = Field(None, ge=0, description="Total pause duration in seconds")
    
    # Complex data fields
    emotional_data: Optional[Dict[str, Any]] = Field(None, description="Emotional state tracking data")
    interaction_patterns: Optional[Dict[str, Any]] = Field(None, description="Behavioral interaction analytics")
    achievements_unlocked: Optional[List[str]] = Field(None, description="Achievements earned in session")
    progress_markers_hit: Optional[List[str]] = Field(None, description="Progress markers achieved")
    
    # Parent/caregiver input
    parent_notes: Optional[str] = Field(None, max_length=1000, description="Parent observations and notes")
    parent_rating: Optional[int] = Field(None, ge=1, le=5, description="Parent rating of session (1-5)")
    parent_observed_behavior: Optional[Dict[str, Any]] = Field(None, description="Parent behavioral observations")
    
    # AI analysis
    ai_analysis: Optional[Dict[str, Any]] = Field(None, description="AI-generated insights and recommendations")

class GameSessionComplete(BaseModel):
    """Schema for completing a game session"""
    exit_reason: str = Field("completed", max_length=100, description="Reason for session completion")
    final_emotional_state: Optional[EmotionalStateEnum] = Field(None, description="Child's emotional state at end")
    session_summary_notes: Optional[str] = Field(None, max_length=500, description="Brief session summary")

class GameSessionResponse(BaseModel):
    """Response schema for game session data"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    child_id: int
    session_type: str
    scenario_name: str
    scenario_id: Optional[str] = None
    scenario_version: Optional[str] = None
    
    # Timing
    started_at: datetime
    ended_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    pause_count: int = 0
    total_pause_duration: int = 0
    
    # Game metrics
    levels_completed: int = 0
    max_level_reached: int = 0
    score: int = 0
    interactions_count: int = 0
    correct_responses: int = 0
    incorrect_responses: int = 0
    help_requests: int = 0
    hint_usage_count: int = 0
    
    # Status and completion
    completion_status: str
    exit_reason: Optional[str] = None
    achievements_unlocked: List[str] = Field(default_factory=list)
    progress_markers_hit: List[str] = Field(default_factory=list)
    
    # Parent feedback
    parent_rating: Optional[int] = None
    parent_notes: Optional[str] = None
    
    # Environment and technical
    device_type: Optional[str] = None
    environment_type: Optional[str] = None
    support_person_present: bool = False
    session_data_quality: str = "good"
    
    # Computed metrics (calculated fields)
    engagement_score: Optional[float] = None
    success_rate: Optional[float] = None
    session_summary: Optional[Dict[str, Any]] = None

class GameSessionAnalytics(BaseModel):
    """Schema for session analytics and insights"""
    session_id: int
    basic_metrics: Dict[str, Any] = Field(..., description="Basic performance metrics")
    behavioral_insights: Dict[str, Any] = Field(..., description="Behavioral pattern analysis")
    emotional_journey: Dict[str, Any] = Field(..., description="Emotional state progression")
    learning_indicators: Dict[str, Any] = Field(..., description="Learning and skill development indicators")
    recommendations: Dict[str, Any] = Field(..., description="Recommendations for future sessions")

# =============================================================================
# REPORT SCHEMAS
# =============================================================================

class ReportBase(BaseModel):
    """Base schema for reports"""
    child_id: int = Field(..., description="ID of the child this report concerns")
    report_type: ReportTypeEnum = Field(..., description="Type of clinical report")
    title: str = Field(..., min_length=1, max_length=200, description="Report title")
    report_version: str = Field("1.0", max_length=10, description="Report version number")
    template_used: Optional[str] = Field(None, max_length=100, description="Template used for report generation")

class ReportCreate(ReportBase):
    """Schema for creating a new report"""
    professional_id: Optional[int] = Field(None, description="ID of the professional creating the report")
    content: Dict[str, Any] = Field(..., description="Report content structure")
    metrics: Optional[Dict[str, Any]] = Field(None, description="Quantitative metrics and analysis")
    period_start: Optional[datetime] = Field(None, description="Start date of reporting period")
    period_end: Optional[datetime] = Field(None, description="End date of reporting period")
    sessions_included: List[int] = Field(default_factory=list, description="Game session IDs included in report")
    activities_included: List[int] = Field(default_factory=list, description="Activity IDs included in report")
    sharing_permissions: Optional[Dict[str, Any]] = Field(None, description="Report sharing and access permissions")
    attachments: List[Dict[str, Any]] = Field(default_factory=list, description="Supporting documents and media")
    auto_generated: bool = Field(False, description="Whether report was auto-generated")

class ReportUpdate(BaseModel):
    """Schema for updating an existing report"""
    title: Optional[str] = Field(None, min_length=1, max_length=200, description="Updated report title")
    content: Optional[Dict[str, Any]] = Field(None, description="Updated report content")
    metrics: Optional[Dict[str, Any]] = Field(None, description="Updated metrics and analysis")
    period_start: Optional[datetime] = Field(None, description="Updated start date")
    period_end: Optional[datetime] = Field(None, description="Updated end date")
    sessions_included: Optional[List[int]] = Field(None, description="Updated session IDs")
    activities_included: Optional[List[int]] = Field(None, description="Updated activity IDs")
    sharing_permissions: Optional[Dict[str, Any]] = Field(None, description="Updated sharing permissions")
    attachments: Optional[List[Dict[str, Any]]] = Field(None, description="Updated attachments")
    validation_notes: Optional[str] = Field(None, max_length=1000, description="Validation or review notes")

class ReportStatusUpdate(BaseModel):
    """Schema for updating report status"""
    status: ReportStatusEnum = Field(..., description="New report status")
    reviewer_notes: Optional[str] = Field(None, max_length=1000, description="Reviewer notes or comments")

class ReportResponse(BaseModel):
    """Response schema for report data"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    child_id: int
    professional_id: Optional[int] = None
    report_type: str
    title: str
    report_version: str
    template_used: Optional[str] = None
    
    # Content (may be filtered based on permissions)
    content: Optional[Dict[str, Any]] = None
    metrics: Optional[Dict[str, Any]] = None
    
    # Time period
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None
    sessions_included: List[int] = Field(default_factory=list)
    activities_included: List[int] = Field(default_factory=list)
    
    # Workflow
    status: str
    created_at: datetime
    updated_at: datetime
    reviewed_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    
    # Metadata
    auto_generated: bool = False
    peer_reviewed: bool = False
    validation_notes: Optional[str] = None
    
    # Computed fields
    summary: Optional[Dict[str, Any]] = None
    can_edit: Optional[bool] = None
    can_share: Optional[bool] = None

class ReportSummary(BaseModel):
    """Simplified report summary for listings"""
    id: int
    title: str
    report_type: str
    status: str
    created_at: datetime
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None
    professional_name: Optional[str] = None
    sessions_count: int = 0
    has_metrics: bool = False

class ReportPermissions(BaseModel):
    """Schema for managing report permissions"""
    report_id: int
    parent_access: bool = Field(True, description="Allow parent access to report")
    school_access: bool = Field(False, description="Allow school access to report")
    external_professionals: List[Dict[str, Any]] = Field(default_factory=list, description="External professional access list")
    anonymized_research: bool = Field(False, description="Allow anonymized use for research")
    export_allowed: bool = Field(True, description="Allow report export")
    print_allowed: bool = Field(True, description="Allow report printing")

# =============================================================================
# ANALYTICS AND AGGREGATION SCHEMAS
# =============================================================================

class ChildProgressAnalytics(BaseModel):
    """Comprehensive analytics for a child's progress"""
    child_id: int
    analysis_period: Dict[str, Any] = Field(..., description="Period covered by analysis")
    session_analytics: Dict[str, Any] = Field(..., description="Game session performance trends")
    behavioral_trends: Dict[str, Any] = Field(..., description="Behavioral pattern analysis")
    skill_development: Dict[str, Any] = Field(..., description="Skill progression tracking")
    parent_feedback_trends: Dict[str, Any] = Field(..., description="Parent feedback and satisfaction trends")
    recommendations: List[str] = Field(..., description="Actionable recommendations")
    next_steps: List[str] = Field(..., description="Suggested next steps")

class ProgramEffectivenessReport(BaseModel):
    """Program-wide effectiveness analytics"""
    program_name: str = Field(..., description="Name of the intervention program")
    participant_count: int = Field(..., description="Number of children in analysis")
    analysis_period: Dict[str, Any] = Field(..., description="Time period analyzed")
    overall_metrics: Dict[str, Any] = Field(..., description="Program-wide performance metrics")
    demographic_breakdown: Dict[str, Any] = Field(..., description="Results by demographic groups")
    intervention_effectiveness: Dict[str, Any] = Field(..., description="Effectiveness by intervention type")
    retention_rates: Dict[str, Any] = Field(..., description="Engagement and retention analysis")
    outcome_measures: Dict[str, Any] = Field(..., description="Clinical outcome measurements")

# =============================================================================
# SEARCH AND FILTERING SCHEMAS
# =============================================================================

class GameSessionFilters(BaseModel):
    """Filters for game session queries"""
    child_id: Optional[int] = None
    session_type: Optional[SessionTypeEnum] = None
    scenario_name: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    completion_status: Optional[str] = None
    min_duration: Optional[int] = Field(None, ge=0, description="Minimum session duration in seconds")
    max_duration: Optional[int] = Field(None, ge=0, description="Maximum session duration in seconds")
    min_score: Optional[int] = Field(None, ge=0, description="Minimum session score")
    parent_rating: Optional[int] = Field(None, ge=1, le=5, description="Parent rating filter")

class ReportFilters(BaseModel):
    """Filters for report queries"""
    child_id: Optional[int] = None
    professional_id: Optional[int] = None
    report_type: Optional[ReportTypeEnum] = None
    status: Optional[ReportStatusEnum] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    auto_generated: Optional[bool] = None
    peer_reviewed: Optional[bool] = None
    has_metrics: Optional[bool] = None

class PaginationParams(BaseModel):
    """Standard pagination parameters"""
    page: int = Field(1, ge=1, description="Page number (1-based)")
    page_size: int = Field(20, ge=1, le=100, description="Items per page")
    sort_by: Optional[str] = Field(None, description="Field to sort by")
    sort_order: Optional[str] = Field("desc", pattern="^(asc|desc)$", description="Sort order")

# =============================================================================
# EXPORT AND SHARING SCHEMAS
# =============================================================================

class ExportRequest(BaseModel):
    """Schema for requesting data exports"""
    export_type: str = Field(..., pattern="^(pdf|excel|csv|json)$", description="Export format")
    include_attachments: bool = Field(False, description="Include attached files")
    include_raw_data: bool = Field(False, description="Include raw session data")
    anonymize_data: bool = Field(False, description="Remove identifying information")
    date_range: Optional[Dict[str, datetime]] = Field(None, description="Date range for export")

class ShareRequest(BaseModel):
    """Schema for sharing reports with external parties"""
    recipient_email: str = Field(..., description="Email of recipient")
    recipient_name: str = Field(..., description="Name of recipient")
    access_level: str = Field("view", pattern="^(view|comment|edit)$", description="Access level granted")
    expiry_date: Optional[datetime] = Field(None, description="Access expiry date")
    message: Optional[str] = Field(None, max_length=500, description="Optional message to recipient")
    notify_on_access: bool = Field(True, description="Notify when recipient accesses report")

# =============================================================================
# VALIDATION UTILITIES
# =============================================================================

class ValidationResult(BaseModel):
    """Result of data validation operations"""
    is_valid: bool
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    suggestions: List[str] = Field(default_factory=list)

# Custom validators can be added here for complex validation logic
def validate_emotional_data(cls, v):
    """Validate emotional data structure"""
    if v is None:
        return v
    
    required_fields = ["initial_state", "final_state"]
    for field in required_fields:
        if field not in v:
            raise ValueError(f"Missing required field in emotional_data: {field}")
    
    # Validate state values
    valid_states = [state.value for state in EmotionalStateEnum]
    for field in ["initial_state", "final_state"]:
        if v[field] not in valid_states:
            raise ValueError(f"Invalid emotional state: {v[field]}")
    
    return v

def validate_interaction_patterns(cls, v):
    """Validate interaction patterns structure"""
    if v is None:
        return v
    
    # Validate response times if present
    if "response_times" in v:
        response_times = v["response_times"]
        if isinstance(response_times, dict):
            if "average_ms" in response_times and response_times["average_ms"] < 0:
                raise ValueError("Average response time cannot be negative")
    
    return v
