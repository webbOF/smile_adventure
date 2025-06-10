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
def validate_emotional_data(v):
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

def validate_interaction_patterns(v):
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

# =============================================================================
# ADVANCED VALIDATION RULES AND ENHANCEMENTS
# =============================================================================

class SessionDataValidator:
    """Advanced validator for session data integrity"""
    
    @staticmethod
    def validate_session_metrics(session_data: Dict[str, Any]) -> ValidationResult:
        """Validate session metrics for consistency and logical constraints"""
        errors = []
        warnings = []
        suggestions = []
        
        # Check logical consistency
        if session_data.get('correct_responses', 0) + session_data.get('incorrect_responses', 0) > session_data.get('interactions_count', 0):
            errors.append("Total responses cannot exceed interaction count")
        
        if session_data.get('help_requests', 0) > session_data.get('interactions_count', 0):
            errors.append("Help requests cannot exceed interaction count")
        
        # Performance indicators
        if session_data.get('levels_completed', 0) == 0 and session_data.get('duration_seconds', 0) > 300:
            warnings.append("Long session with no levels completed - possible engagement issue")
        
        # Score validation
        score = session_data.get('score', 0)
        interactions = session_data.get('interactions_count', 0)
        if score > 0 and interactions == 0:
            errors.append("Score recorded without interactions")
        
        # Duration validation
        duration = session_data.get('duration_seconds', 0)
        pause_duration = session_data.get('total_pause_duration', 0)
        if pause_duration > duration:
            errors.append("Pause duration cannot exceed total session duration")
        
        # Suggestions for improvement
        if session_data.get('hint_usage_count', 0) > session_data.get('help_requests', 0) * 2:
            suggestions.append("Consider adjusting hint availability to encourage independent problem-solving")
        
        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            suggestions=suggestions
        )

class ReportDataValidator:
    """Advanced validator for report data quality"""
    
    @staticmethod
    def _validate_required_sections(report_type: str, content: Dict[str, Any]) -> List[str]:
        """Helper function to validate required sections for report types"""
        errors = []
        
        if report_type == 'progress':
            required_sections = ['executive_summary', 'goals_progress', 'key_achievements']
        elif report_type == 'assessment':
            required_sections = ['assessment_overview', 'findings', 'recommendations']
        else:
            return errors
        
        for section in required_sections:
            if section not in content:
                errors.append(f"Missing required section for {report_type} report: {section}")
        
        return errors
    
    @staticmethod
    def _validate_date_ranges(period_start, period_end) -> tuple[List[str], List[str]]:
        """Helper function to validate date ranges"""
        errors = []
        warnings = []
        
        if period_start and period_end:
            if period_start >= period_end:
                errors.append("Report period start date must be before end date")
            
            # Check for reasonable reporting periods
            from datetime import timedelta
            if (period_end - period_start).days > 365:
                warnings.append("Report covers more than one year - consider breaking into smaller periods")
        
        return errors, warnings
    
    @staticmethod
    def _validate_session_inclusion(sessions_included: List[int], report_type: str) -> List[str]:
        """Helper function to validate session inclusion"""
        warnings = []
        
        if len(sessions_included) == 0 and report_type in ['progress', 'summary']:
            warnings.append("No sessions included in report - may lack supporting data")
        
        return warnings
    
    @staticmethod
    def validate_report_content(report_data: Dict[str, Any]) -> ValidationResult:
        """Validate report content for completeness and clinical standards"""
        errors = []
        warnings = []
        suggestions = []
        
        # Check required content sections for different report types
        report_type = report_data.get('report_type')
        content = report_data.get('content', {})
        
        # Validate required sections
        section_errors = ReportDataValidator._validate_required_sections(report_type, content)
        errors.extend(section_errors)
        
        # Validate date ranges
        period_start = report_data.get('period_start')
        period_end = report_data.get('period_end')
        date_errors, date_warnings = ReportDataValidator._validate_date_ranges(period_start, period_end)
        errors.extend(date_errors)
        warnings.extend(date_warnings)
        
        # Validate session inclusion
        sessions_included = report_data.get('sessions_included', [])
        session_warnings = ReportDataValidator._validate_session_inclusion(sessions_included, report_type)
        warnings.extend(session_warnings)
        
        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            suggestions=suggestions
        )

# =============================================================================
# ENHANCED FIELD VALIDATORS
# =============================================================================

def _validate_engagement_score(v: Dict[str, Any]) -> None:
    """Helper function to validate engagement score range"""
    if 'engagement_score' in v:
        score = v['engagement_score']
        if not isinstance(score, (int, float)) or score < 0 or score > 1:
            raise ValueError("Engagement score must be between 0 and 1")

def _validate_attention_metrics(v: Dict[str, Any]) -> None:
    """Helper function to validate attention metrics"""
    if 'attention_spans' in v:
        attention_data = v['attention_spans']
        if isinstance(attention_data, list):
            for span in attention_data:
                if not isinstance(span, (int, float)) or span < 0:
                    raise ValueError("Attention span values must be non-negative")

def validate_engagement_metrics(v):
    """Enhanced validation for engagement metrics"""
    if v is None:
        return v
    
    if not isinstance(v, dict):
        raise ValueError("Engagement metrics must be a dictionary")
    
    # Use helper functions to reduce complexity
    _validate_engagement_score(v)
    _validate_attention_metrics(v)
    
    return v

def validate_progress_markers(cls, v):
    """Validate progress marker achievements"""
    if v is None:
        return v
    
    if not isinstance(v, list):
        raise ValueError("Progress markers must be a list")
    
    # Validate marker format
    valid_prefixes = ['skill_', 'behavior_', 'social_', 'emotional_', 'cognitive_']
    for marker in v:
        if not isinstance(marker, str):
            raise ValueError("Progress markers must be strings")
        if not any(marker.startswith(prefix) for prefix in valid_prefixes):
            raise ValueError(f"Invalid progress marker format: {marker}")
    
    return v

def validate_ai_analysis(cls, v):
    """Validate AI analysis data structure"""
    if v is None:
        return v
    
    if not isinstance(v, dict):
        raise ValueError("AI analysis must be a dictionary")
    
    # Check for required analysis components
    required_components = ['insights', 'recommendations', 'confidence_score']
    for component in required_components:
        if component not in v:
            raise ValueError(f"Missing required AI analysis component: {component}")
    
    # Validate confidence score
    confidence = v.get('confidence_score')
    if not isinstance(confidence, (int, float)) or confidence < 0 or confidence > 1:
        raise ValueError("AI confidence score must be between 0 and 1")
    
    return v

# =============================================================================
# SPECIALIZED SCHEMAS FOR ASD FEATURES
# =============================================================================

class SensoryProfileData(BaseModel):
    """Schema for sensory profile tracking in sessions"""
    visual_sensitivity: Optional[int] = Field(None, ge=1, le=5, description="Visual sensitivity level (1-5)")
    auditory_sensitivity: Optional[int] = Field(None, ge=1, le=5, description="Auditory sensitivity level (1-5)")
    tactile_sensitivity: Optional[int] = Field(None, ge=1, le=5, description="Tactile sensitivity level (1-5)")
    vestibular_preferences: Optional[List[str]] = Field(None, description="Vestibular activity preferences")
    proprioceptive_needs: Optional[List[str]] = Field(None, description="Proprioceptive input needs")
    environmental_modifications: Optional[List[str]] = Field(None, description="Environmental accommodations made")

class CommunicationData(BaseModel):
    """Schema for communication patterns in sessions"""
    verbal_communication: bool = Field(True, description="Whether child used verbal communication")
    communication_methods: List[str] = Field(default_factory=list, description="Methods used for communication")
    communication_effectiveness: Optional[int] = Field(None, ge=1, le=5, description="Communication effectiveness (1-5)")
    social_interaction_attempts: Optional[int] = Field(None, ge=0, description="Number of social interaction attempts")
    nonverbal_cues_observed: Optional[List[str]] = Field(None, description="Nonverbal communication observed")
    communication_support_needed: Optional[bool] = Field(None, description="Whether communication support was needed")

class BehavioralRegulationData(BaseModel):
    """Schema for behavioral regulation tracking"""
    self_regulation_strategies: Optional[List[str]] = Field(None, description="Self-regulation strategies used")
    emotional_regulation_level: Optional[int] = Field(None, ge=1, le=5, description="Emotional regulation effectiveness (1-5)")
    transition_handling: Optional[int] = Field(None, ge=1, le=5, description="How well transitions were handled (1-5)")
    frustration_tolerance: Optional[int] = Field(None, ge=1, le=5, description="Frustration tolerance level (1-5)")
    coping_mechanisms_used: Optional[List[str]] = Field(None, description="Coping mechanisms observed")
    support_strategies_effective: Optional[List[str]] = Field(None, description="Support strategies that were effective")

# =============================================================================
# ENHANCED ANALYTICS SCHEMAS
# =============================================================================

class DetailedSessionAnalytics(GameSessionAnalytics):
    """Extended analytics with ASD-specific insights"""
    sensory_profile_analysis: Optional[Dict[str, Any]] = Field(None, description="Sensory processing analysis")
    communication_analysis: Optional[Dict[str, Any]] = Field(None, description="Communication patterns analysis")
    regulation_analysis: Optional[Dict[str, Any]] = Field(None, description="Self-regulation analysis")
    environmental_factors: Optional[Dict[str, Any]] = Field(None, description="Environmental factor impacts")
    accommodation_effectiveness: Optional[Dict[str, Any]] = Field(None, description="Accommodation strategy effectiveness")

class LongitudinalProgressMetrics(BaseModel):
    """Schema for tracking progress over extended periods"""
    child_id: int
    baseline_period: Dict[str, Any] = Field(..., description="Baseline measurement period")
    current_period: Dict[str, Any] = Field(..., description="Current measurement period")
    improvement_areas: List[str] = Field(..., description="Areas showing improvement")
    concern_areas: List[str] = Field(..., description="Areas of concern")
    skill_acquisition_rate: Dict[str, float] = Field(..., description="Rate of skill acquisition by domain")
    intervention_effectiveness: Dict[str, Any] = Field(..., description="Effectiveness of different interventions")
    family_feedback_trends: Dict[str, Any] = Field(..., description="Family feedback over time")
    clinical_recommendations: List[str] = Field(..., description="Clinical recommendations based on trends")

# =============================================================================
# TASK 24: REPORTS & ANALYTICS SCHEMAS
# =============================================================================

class ProgressReport(BaseModel):
    """Schema for progress reports"""
    child_id: int
    report_period: Dict[str, Any] = Field(..., description="Report period information")
    progress_summary: Dict[str, Any] = Field(..., description="Overall progress summary")
    session_metrics: Dict[str, Any] = Field(..., description="Game session performance metrics")
    behavioral_insights: Dict[str, Any] = Field(..., description="Behavioral insights analysis")
    emotional_development: Dict[str, Any] = Field(..., description="Emotional development tracking")
    skill_progression: Dict[str, Any] = Field(..., description="Skill development analysis")
    recommendations: List[str] = Field(..., description="Professional recommendations")
    next_goals: List[str] = Field(..., description="Next therapeutic goals")
    parent_feedback: Optional[Dict[str, Any]] = Field(None, description="Parent observations and feedback")
    generated_at: datetime = Field(..., description="Report generation timestamp")

class SummaryReport(BaseModel):
    """Schema for summary reports"""
    child_id: int
    child_name: str
    report_metadata: Dict[str, Any] = Field(..., description="Report metadata and overview")
    key_highlights: Dict[str, Any] = Field(..., description="Key achievements and highlights")
    performance_snapshot: Dict[str, Any] = Field(..., description="Current performance snapshot")
    behavioral_summary: Dict[str, Any] = Field(..., description="Behavioral patterns summary")
    overall_trajectory: str = Field(..., description="Overall development trajectory")
    areas_of_strength: List[str] = Field(..., description="Child's areas of strength")
    areas_for_growth: List[str] = Field(..., description="Areas needing development")
    family_involvement: Optional[Dict[str, Any]] = Field(None, description="Family engagement summary")
    generated_at: datetime = Field(..., description="Report generation timestamp")

class AnalyticsData(BaseModel):
    """Schema for analytics data response"""
    child_id: int
    analysis_period: Dict[str, Any] = Field(..., description="Analysis period details")
    engagement_analytics: Dict[str, Any] = Field(..., description="Engagement analysis results")
    progress_trends: Dict[str, Any] = Field(..., description="Progress trend analysis")
    behavioral_patterns: Dict[str, Any] = Field(..., description="Behavioral pattern insights")
    emotional_patterns: Dict[str, Any] = Field(..., description="Emotional pattern analysis")
    predictive_insights: Optional[Dict[str, Any]] = Field(None, description="Predictive analytics insights")
    comparative_analysis: Optional[Dict[str, Any]] = Field(None, description="Comparative analysis data")
    recommendations: List[str] = Field(..., description="Data-driven recommendations")
    confidence_scores: Dict[str, float] = Field(..., description="Analysis confidence scores")
    generated_at: datetime = Field(..., description="Analytics generation timestamp")

class ReportGenerationRequest(BaseModel):
    """Schema for report generation requests"""
    report_type: str = Field(..., pattern="^(progress|summary|comprehensive|clinical)$", description="Type of report to generate")
    period_days: int = Field(30, ge=7, le=365, description="Report period in days")
    include_recommendations: bool = Field(True, description="Include AI recommendations")
    include_analytics: bool = Field(True, description="Include detailed analytics")
    include_charts: bool = Field(False, description="Include visual charts and graphs")
    custom_parameters: Optional[Dict[str, Any]] = Field(None, description="Custom report parameters")

# Apply validators to existing schemas
GameSessionUpdate.model_validate = validate_engagement_metrics
GameSessionUpdate.model_validate = validate_progress_markers  
GameSessionUpdate.model_validate = validate_ai_analysis
