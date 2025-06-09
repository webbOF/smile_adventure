"""
Reports Models - Game Session Tracking & Clinical Reports
Enhanced models for comprehensive ASD support with game analytics and professional reporting
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
    Enhanced Game Session tracking for Smile Adventure interactions
    Comprehensive ASD-focused analytics and emotional state monitoring
    """
    __tablename__ = "game_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"), nullable=False, index=True)
    
    # Session identification and type
    session_type = Column(Enum(SessionType), nullable=False, index=True)
    scenario_name = Column(String(200), nullable=False)
    scenario_id = Column(String(100), nullable=True, index=True)
    scenario_version = Column(String(20), nullable=True)  # For tracking different versions
    
    # Timing information
    started_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    pause_count = Column(Integer, default=0, nullable=False)  # Number of pauses
    total_pause_duration = Column(Integer, default=0, nullable=False)  # Seconds paused
    
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
    emotional_data = Column(JSON, nullable=True, doc="""
    Comprehensive emotional state tracking throughout session:
    {
        "initial_state": "anxious",
        "final_state": "calm", 
        "transitions": [
            {
                "timestamp": "00:02:30",
                "from_state": "anxious",
                "to_state": "neutral",
                "trigger": "visual_cue_presented",
                "intensity": 3
            }
        ],
        "stress_indicators": [
            {
                "timestamp": "00:01:15",
                "indicator": "fidgeting",
                "intensity": 4,
                "duration_seconds": 30
            }
        ],
        "positive_indicators": [
            {
                "timestamp": "00:03:45", 
                "indicator": "spontaneous_smile",
                "context": "character_interaction"
            }
        ],
        "regulation_strategies_used": [
            {
                "timestamp": "00:04:10",
                "strategy": "deep_breathing_cue",
                "effectiveness": 4,
                "child_initiated": false
            }
        ]
    }
    """)
    
    # Detailed interaction patterns and learning analytics
    interaction_patterns = Column(JSON, nullable=True, doc="""
    Detailed behavioral and interaction analytics:
    {
        "response_times": {
            "average_ms": 1850,
            "median_ms": 1200,
            "variance": 0.45,
            "trend": "improving"
        },
        "error_patterns": [
            {
                "error_type": "impulsivity",
                "frequency": 3,
                "contexts": ["choice_selection", "instruction_following"]
            }
        ],
        "success_patterns": [
            {
                "pattern": "visual_cues_helpful",
                "effectiveness_score": 4.2,
                "contexts": ["navigation", "task_completion"]
            }
        ],
        "attention_metrics": {
            "focus_duration_avg_seconds": 45,
            "distraction_events": 2,
            "re_engagement_success_rate": 0.85
        },
        "communication_attempts": {
            "verbal": 5,
            "gestural": 8,
            "augmentative": 2,
            "spontaneous": 3
        },
        "self_regulation_instances": [
            {
                "timestamp": "00:05:20",
                "method": "self_initiated_break",
                "duration_seconds": 15,
                "successful": true
            }
        ],
        "sensory_responses": {
            "auditory_sensitivity": 2,
            "visual_preference": "high_contrast",
            "tactile_feedback_response": "positive"
        }
    }
    """)
    
    # Completion and outcome tracking
    completion_status = Column(String(20), default="in_progress", nullable=False)
    exit_reason = Column(String(100), nullable=True)  # completed, overwhelmed, technical, voluntary
    achievements_unlocked = Column(JSON, default=list, nullable=False)
    progress_markers_hit = Column(JSON, default=list, nullable=False)
    
    # Parent/caregiver observations and input
    parent_notes = Column(Text, nullable=True)
    parent_rating = Column(Integer, nullable=True)  # 1-5 scale overall experience
    parent_observed_behavior = Column(JSON, nullable=True, doc="""
    Parent observations during or after session:
    {
        "engagement_level": 4,
        "mood_before": "anxious",
        "mood_after": "calm",
        "notable_behaviors": [
            {
                "behavior": "initiated_conversation_about_session",
                "timestamp": "post_session",
                "context": "dinner_time"
            }
        ],
        "carry_over_behaviors": [
            {
                "behavior": "used_deep_breathing",
                "context": "bedtime_routine",
                "hours_after_session": 3
            }
        ],
        "concerns": [],
        "positive_outcomes": [
            "asked_to_play_again",
            "explained_scenario_to_sibling"
        ]
    }
    """)
    
    # Technical and environmental context
    device_type = Column(String(50), nullable=True)  # tablet, desktop, mobile, vr
    device_model = Column(String(100), nullable=True)
    app_version = Column(String(20), nullable=True)
    environment_type = Column(String(50), nullable=True)  # home, clinic, school, therapy_center
    support_person_present = Column(Boolean, default=False, nullable=False)
    session_data_quality = Column(String(20), default="good", nullable=False)
    
    # AI analysis and insights (future enhancement)
    ai_analysis = Column(JSON, nullable=True, doc="""
    AI-generated insights and recommendations:
    {
        "behavioral_insights": {
            "engagement_pattern": "peaks_at_5_minute_intervals",
            "optimal_session_length": "12_minutes",
            "preferred_interaction_style": "visual_with_audio_cues"
        },
        "learning_recommendations": [
            {
                "area": "attention_span",
                "recommendation": "introduce_micro_breaks_every_3_minutes",
                "confidence": 0.85
            }
        ],
        "next_session_suggestions": {
            "difficulty_adjustment": "maintain_current",
            "scenario_type": "similar_with_new_characters",
            "duration_recommendation": "10-15_minutes"
        },
        "therapeutic_goals_progress": {
            "anxiety_management": "improving",
            "social_communication": "stable",
            "sensory_regulation": "needs_attention"
        }
    }
    """)
    
    # Relationships
    child = relationship("Child", back_populates="game_sessions")
    
    # Methods for session management and analytics
    def mark_completed(self, exit_reason: str = "completed") -> None:
        """Mark session as completed and calculate duration"""
        self.ended_at = datetime.now(timezone.utc)
        self.exit_reason = exit_reason
        
        if self.started_at:
            delta = self.ended_at - self.started_at
            self.duration_seconds = int(delta.total_seconds())
        
        self.completion_status = "completed"
    
    def calculate_engagement_score(self) -> float:
        """Calculate engagement score based on interaction patterns and duration"""
        if not self.duration_seconds or not self.interactions_count:
            return 0.0
        
        # Base engagement on interactions per minute
        interactions_per_minute = (self.interactions_count / self.duration_seconds) * 60
        base_score = min(interactions_per_minute / 5.0, 1.0)
        
        # Adjust for completion and success patterns
        completion_bonus = 0.2 if self.completion_status == "completed" else 0.0
        
        # Factor in help requests (too many might indicate frustration)
        help_penalty = max(0, (self.help_requests - 3) * 0.05)
        
        return max(0.0, min(1.0, base_score + completion_bonus - help_penalty))
    
    def calculate_success_rate(self) -> float:
        """Calculate overall success rate for the session"""
        total_attempts = self.correct_responses + self.incorrect_responses
        if total_attempts == 0:
            return 0.0
        return self.correct_responses / total_attempts
    
    def get_session_summary(self) -> Dict[str, Any]:
        """Generate a comprehensive session summary"""
        return {
            "basic_metrics": {
                "duration_minutes": round(self.duration_seconds / 60, 1) if self.duration_seconds else 0,
                "levels_completed": self.levels_completed,
                "final_score": self.score,
                "engagement_score": round(self.calculate_engagement_score(), 2),
                "success_rate": round(self.calculate_success_rate(), 2)
            },
            "behavioral_highlights": {
                "help_requests": self.help_requests,
                "achievements_earned": len(self.achievements_unlocked),
                "completion_status": self.completion_status
            },
            "emotional_journey": self._extract_emotional_summary(),
            "next_session_readiness": self._assess_next_session_readiness()
        }
    
    def _extract_emotional_summary(self) -> Dict[str, Any]:
        """Extract key emotional state information from session"""
        if not self.emotional_data:
            return {}
        
        return {
            "initial_state": self.emotional_data.get("initial_state"),
            "final_state": self.emotional_data.get("final_state"),
            "stress_events": len(self.emotional_data.get("stress_indicators", [])),
            "positive_moments": len(self.emotional_data.get("positive_indicators", []))
        }
    
    def _assess_next_session_readiness(self) -> str:
        """Assess child's readiness for next session based on this session's data"""
        if self.exit_reason == "overwhelmed":
            return "needs_break"
        elif self.completion_status == "completed" and self.parent_rating and self.parent_rating >= 4:
            return "ready_for_progression"
        elif self.help_requests > 5:
            return "needs_support_adjustment"
        else:
            return "ready_for_similar"
    
    def __repr__(self):
        return f"<GameSession {self.scenario_name} for child {self.child_id}>"

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
