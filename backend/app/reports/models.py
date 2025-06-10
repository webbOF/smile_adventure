"""
Reports Models - Clinical Reports and Report Management
Enhanced models for comprehensive ASD support with professional reporting capabilities
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
# ENUMS FOR REPORTS AND SESSIONS
# =============================================================================

class SessionType(enum.Enum):
    """Types of game sessions"""
    DENTAL_VISIT = "dental_visit"
    THERAPY_SESSION = "therapy_session"
    SOCIAL_SCENARIO = "social_scenario"
    SENSORY_EXPLORATION = "sensory_exploration"
    DAILY_ROUTINE = "daily_routine"
    EMERGENCY_PREPARATION = "emergency_preparation"

class EmotionalState(enum.Enum):
    """Emotional states for tracking during sessions"""
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

class ReportType(enum.Enum):
    """Types of clinical reports"""
    PROGRESS = "progress"
    ASSESSMENT = "assessment"
    SUMMARY = "summary"
    INCIDENT = "incident"
    RECOMMENDATION = "recommendation"
    DISCHARGE = "discharge"

class ReportStatus(enum.Enum):
    """Report status for workflow management"""
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    PUBLISHED = "published"
    ARCHIVED = "archived"

# =============================================================================
# GAME SESSION MODEL
# =============================================================================

class GameSession(Base):
    """
    Enhanced Game Session model for comprehensive ASD tracking and analytics
    Supports detailed behavioral observation and progress monitoring
    """
    __tablename__ = "game_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"), nullable=False, index=True)
    
    # Session identification and type
    session_type = Column(Enum(SessionType), nullable=False, index=True)
    scenario_name = Column(String(200), nullable=False)
    scenario_id = Column(String(100), nullable=True, index=True)
    scenario_version = Column(String(20), nullable=True)
    
    # Timing information
    started_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    pause_count = Column(Integer, default=0, nullable=False)
    total_pause_duration = Column(Integer, default=0, nullable=False)
    
    # Game progress and performance metrics
    levels_completed = Column(Integer, default=0, nullable=False)
    max_level_reached = Column(Integer, default=0, nullable=False)
    score = Column(Integer, default=0, nullable=False)
    interactions_count = Column(Integer, default=0, nullable=False)
    correct_responses = Column(Integer, default=0, nullable=False)
    incorrect_responses = Column(Integer, default=0, nullable=False)
    help_requests = Column(Integer, default=0, nullable=False)
    hint_usage_count = Column(Integer, default=0, nullable=False)
    
    # ASD-specific emotional and behavioral tracking
    emotional_data = Column(JSON, nullable=True)
    interaction_patterns = Column(JSON, nullable=True)
    
    # Completion and outcome tracking
    completion_status = Column(String(20), default='in_progress', nullable=False, index=True)
    exit_reason = Column(String(100), nullable=True)
    achievements_unlocked = Column(JSON, default=list, nullable=False)
    progress_markers_hit = Column(JSON, default=list, nullable=False)
    
    # Parent/caregiver observations and input
    parent_notes = Column(Text, nullable=True)
    parent_rating = Column(Integer, nullable=True)
    parent_observed_behavior = Column(JSON, nullable=True)
    
    # Technical and environmental context
    device_type = Column(String(50), nullable=True)
    device_model = Column(String(100), nullable=True)
    app_version = Column(String(20), nullable=True)
    environment_type = Column(String(50), nullable=True)
    support_person_present = Column(Boolean, default=False, nullable=False)
    session_data_quality = Column(String(20), default='good', nullable=False)
    
    # AI analysis and insights
    ai_analysis = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
      # Relationships
    child = relationship("Child", back_populates="game_sessions")
    
    # =========================================================================
    # CALCULATED PROPERTIES AND METHODS
    # =========================================================================
    
    @hybrid_property
    def success_rate(self) -> float:
        """Calculate success rate based on correct vs total responses"""
        total_responses = self.correct_responses + self.incorrect_responses
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
        achievement_bonus = min(len(self.achievements_unlocked or []) * 5, 20)
        
        return round(min(base_score + completion_bonus + achievement_bonus, 100), 2)
    
    def calculate_engagement_score(self) -> float:
        """Legacy method for backward compatibility"""
        return self.engagement_score
    
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

# =============================================================================
# CLINICAL REPORTS MODEL
# =============================================================================

class Report(Base):
    """
    Clinical Reports for comprehensive ASD progress tracking and professional communication
    Supports multiple report types with flexible content structure
    """
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"), nullable=False, index=True)
    professional_id = Column(Integer, ForeignKey("auth_users.id"), nullable=True, index=True)
    
    # Report identification and metadata
    report_type = Column(Enum(ReportType), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    report_version = Column(String(10), default="1.0", nullable=False)
    template_used = Column(String(100), nullable=True)  # For standardized report templates
    
    # Content and structure
    content = Column(JSON, nullable=False, doc="""
    Flexible report content structure based on report type:
    
    PROGRESS REPORT:
    {
        "period": {
            "start_date": "2024-01-01",
            "end_date": "2024-01-31",
            "total_sessions": 12
        },
        "executive_summary": "Child showed significant improvement...",
        "goals_progress": [
            {
                "goal": "Reduce dental anxiety",
                "baseline": "High anxiety, avoidance behaviors",
                "current_status": "Moderate anxiety, willingness to engage",
                "progress_percentage": 65,
                "evidence": ["Completed 8/10 dental scenarios", "Parent reports improved cooperation"]
            }
        ],
        "key_achievements": [
            "First successful virtual dental cleaning",
            "Reduced help requests by 40%"
        ],
        "areas_for_focus": [
            "Sensory accommodation during procedures",
            "Generalization to real-world settings"
        ],
        "session_analytics": {
            "total_time_engaged": 240,
            "average_session_length": 8.5,
            "completion_rate": 0.85,
            "skill_progression": "steady_improvement"
        }
    }
    
    ASSESSMENT REPORT:
    {
        "assessment_type": "comprehensive_baseline",
        "assessment_tools": ["CARS-2", "ADOS-2", "Vineland-3"],
        "assessment_date": "2024-01-15",
        "domains_assessed": {
            "communication": {
                "receptive_language": {
                    "score": 85,
                    "percentile": 16,
                    "clinical_significance": "below_average"
                },
                "expressive_language": {
                    "score": 78,
                    "percentile": 7,
                    "clinical_significance": "significantly_below_average"
                }
            },
            "social_interaction": {
                "peer_relationships": "emerging_skills",
                "adult_interaction": "strength_area",
                "nonverbal_communication": "needs_support"
            },
            "sensory_processing": {
                "auditory": "hypersensitive",
                "visual": "typical",
                "tactile": "hyposensitive",
                "vestibular": "seeking_behaviors"
            }
        },
        "recommendations": [
            {
                "domain": "communication",
                "intervention": "speech_therapy",
                "frequency": "2x_weekly",
                "duration": "45_minutes",
                "priority": "high"
            }
        ]
    }
    """)
    
    # Metrics and quantitative data
    metrics = Column(JSON, nullable=True, doc="""
    Quantitative metrics and data analysis:
    {
        "game_session_metrics": {
            "total_sessions": 25,
            "total_engagement_time": 450,
            "average_completion_rate": 0.88,
            "progress_trajectory": "positive",
            "skill_mastery_levels": {
                "dental_preparation": 4,
                "anxiety_management": 3,
                "following_instructions": 5
            }
        },
        "behavioral_metrics": {
            "emotional_regulation_improvement": 0.35,
            "help_seeking_behavior": "appropriate_increase",
            "attention_span_progression": "15_to_22_minutes",
            "frustration_tolerance": "moderate_improvement"
        },
        "parent_feedback_trends": {
            "satisfaction_average": 4.2,
            "perceived_benefit": 4.8,
            "home_generalization": 3.1,
            "engagement_enthusiasm": 4.6
        },
        "clinical_significance": {
            "statistical_improvement": true,
            "clinical_improvement": true,
            "effect_size": 0.75,
            "confidence_interval": "0.45-1.05"
        }
    }
    """)
    
    # Time period and scope
    period_start = Column(DateTime(timezone=True), nullable=True, index=True)
    period_end = Column(DateTime(timezone=True), nullable=True, index=True)
    sessions_included = Column(JSON, default=list, nullable=False)  # List of session IDs
    activities_included = Column(JSON, default=list, nullable=False)  # List of activity IDs
    
    # Workflow and approval
    status = Column(Enum(ReportStatus), default=ReportStatus.DRAFT, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    
    # Sharing and permissions
    sharing_permissions = Column(JSON, nullable=True, doc="""
    Control who can access this report:
    {
        "parent_access": true,
        "school_access": false,
        "external_professionals": [
            {
                "professional_id": 123,
                "access_level": "full",
                "expiry_date": "2024-06-01"
            }
        ],
        "anonymized_research": false,
        "export_allowed": true,
        "print_allowed": true
    }
    """)
    
    # Document attachments and supporting materials
    attachments = Column(JSON, default=list, nullable=False, doc="""
    References to supporting documents:
    [
        {
            "type": "video_snippet",
            "session_id": 456,
            "timestamp": "00:03:45",
            "description": "Example of successful self-regulation"
        },
        {
            "type": "external_document",
            "filename": "school_report_jan_2024.pdf",
            "uploaded_at": "2024-01-20T10:30:00Z"
        }
    ]
    """)
    
    # Quality and validation
    auto_generated = Column(Boolean, default=False, nullable=False)
    validation_notes = Column(Text, nullable=True)
    peer_reviewed = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    child = relationship("Child", back_populates="reports")
    professional = relationship("User", foreign_keys=[professional_id])
    
    # Report generation and management methods
    def generate_summary(self) -> Dict[str, Any]:
        """Generate an executive summary of the report"""
        if self.report_type == ReportType.PROGRESS:
            return self._generate_progress_summary()
        elif self.report_type == ReportType.ASSESSMENT:
            return self._generate_assessment_summary()
        else:
            return self._generate_generic_summary()
    
    def _generate_progress_summary(self) -> Dict[str, Any]:
        """Generate summary for progress reports"""
        content = self.content or {}
        metrics = self.metrics or {}
        
        return {
            "report_period": f"{self.period_start.strftime('%B %Y') if self.period_start else 'Unknown'} - {self.period_end.strftime('%B %Y') if self.period_end else 'Ongoing'}",
            "total_sessions": content.get("period", {}).get("total_sessions", 0),
            "key_improvements": content.get("key_achievements", [])[:3],
            "focus_areas": content.get("areas_for_focus", [])[:2],
            "overall_progress": self._calculate_overall_progress_score(),
            "next_steps": self._extract_next_steps()
        }
    
    def _generate_assessment_summary(self) -> Dict[str, Any]:
        """Generate summary for assessment reports"""
        content = self.content or {}
        
        return {
            "assessment_date": content.get("assessment_date"),
            "assessment_type": content.get("assessment_type"),
            "domains_assessed": list(content.get("domains_assessed", {}).keys()),
            "key_findings": self._extract_key_findings(),
            "recommendations_count": len(content.get("recommendations", [])),
            "priority_interventions": self._extract_priority_interventions()
        }
    
    def _generate_generic_summary(self) -> Dict[str, Any]:
        """Generate summary for other report types"""
        return {
            "report_type": self.report_type.value,
            "title": self.title,
            "created_date": self.created_at.strftime('%Y-%m-%d'),
            "status": self.status.value,
            "has_metrics": bool(self.metrics),
            "content_sections": len(self.content) if self.content else 0
        }
    
    def _calculate_overall_progress_score(self) -> float:
        """Calculate an overall progress score from 0-100"""
        metrics = self.metrics or {}
        game_metrics = metrics.get("game_session_metrics", {})
        behavioral_metrics = metrics.get("behavioral_metrics", {})
        
        # Weight different metrics
        completion_rate = game_metrics.get("average_completion_rate", 0) * 30
        engagement_score = min(game_metrics.get("total_engagement_time", 0) / 600, 1) * 25  # Max 10 hours
        improvement_score = behavioral_metrics.get("emotional_regulation_improvement", 0) * 100 * 25
        parent_satisfaction = metrics.get("parent_feedback_trends", {}).get("satisfaction_average", 0) * 20
        
        return min(100, completion_rate + engagement_score + improvement_score + parent_satisfaction)
    
    def _extract_next_steps(self) -> List[str]:
        """Extract actionable next steps from report content"""
        content = self.content or {}
        next_steps = []
        
        # From areas for focus
        focus_areas = content.get("areas_for_focus", [])
        for area in focus_areas[:2]:
            next_steps.append(f"Continue focus on {area}")
        
        # From goal progress
        goals = content.get("goals_progress", [])
        for goal in goals:
            if goal.get("progress_percentage", 0) < 50:
                next_steps.append(f"Intensify work on: {goal.get('goal')}")
        
        return next_steps[:3]  # Limit to top 3
    
    def _extract_key_findings(self) -> List[str]:
        """Extract key findings from assessment content"""
        content = self.content or {}
        findings = []
        
        domains = content.get("domains_assessed", {})
        for domain, results in domains.items():
            if isinstance(results, dict):
                for subdomain, data in results.items():
                    if isinstance(data, dict) and data.get("clinical_significance"):
                        findings.append(f"{domain.title()} - {subdomain}: {data['clinical_significance']}")
        
        return findings[:5]  # Limit to top 5 findings
    
    def _extract_priority_interventions(self) -> List[str]:
        """Extract high priority intervention recommendations"""
        content = self.content or {}
        recommendations = content.get("recommendations", [])
        
        priority_interventions = []
        for rec in recommendations:
            if rec.get("priority") == "high":
                priority_interventions.append(f"{rec.get('intervention')} ({rec.get('frequency', 'frequency TBD')})")
        
        return priority_interventions
    
    def mark_reviewed(self, reviewer_notes: Optional[str] = None) -> None:
        """Mark report as reviewed with optional notes"""
        self.status = ReportStatus.PENDING_REVIEW
        self.reviewed_at = datetime.now(timezone.utc)
        if reviewer_notes:
            self.validation_notes = reviewer_notes
    
    def approve_report(self) -> None:
        """Approve report for publication"""
        self.status = ReportStatus.APPROVED
        self.approved_at = datetime.now(timezone.utc)
    
    def publish_report(self) -> None:
        """Publish approved report"""
        if self.status == ReportStatus.APPROVED:
            self.status = ReportStatus.PUBLISHED
    
    def archive_report(self) -> None:
        """Archive old or obsolete report"""
        self.status = ReportStatus.ARCHIVED
    
    def can_be_shared_with(self, user_id: int, user_role: str) -> bool:
        """Check if report can be shared with specific user"""
        permissions = self.sharing_permissions or {}
        
        # Child's parent always has access
        if user_role == "parent" and permissions.get("parent_access", True):
            return True
        
        # Check external professional access
        external_access = permissions.get("external_professionals", [])
        for access in external_access:
            if access.get("professional_id") == user_id:
                expiry = access.get("expiry_date")
                if not expiry or datetime.fromisoformat(expiry) > datetime.now():
                    return True
        
        # Report creator always has access
        if self.professional_id == user_id:
            return True
        
        return False
    
    def __repr__(self):
        return f"<Report {self.title} for child {self.child_id}>"

# =============================================================================
# EXTEND EXISTING MODELS WITH RELATIONSHIPS
# =============================================================================

# Note: These relationships will be added to existing models through imports
# Child.game_sessions = relationship("GameSession", back_populates="child", lazy="dynamic")
# Child.reports = relationship("Report", back_populates="child", lazy="dynamic")
