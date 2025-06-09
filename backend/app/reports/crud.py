"""
Reports CRUD Services - Game Session & Clinical Report Management
Comprehensive ASD-focused data management with analytics and professional workflows
"""

import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import and_, or_, desc, asc, func, text
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.auth.models import User, UserRole
from app.users.models import Child
from app.reports.models import GameSession, Report, SessionType, ReportType, ReportStatus
from app.reports.schemas import (
    GameSessionCreate, GameSessionUpdate, GameSessionComplete, ReportCreate, ReportUpdate,
    GameSessionFilters, ReportFilters, PaginationParams
)

logger = logging.getLogger(__name__)

# =============================================================================
# GAME SESSION CRUD OPERATIONS
# =============================================================================

class GameSessionService:
    """Enhanced Game Session management service with comprehensive ASD analytics"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_session(self, session_data: GameSessionCreate) -> Optional[GameSession]:
        """
        Create new game session with comprehensive tracking
        
        Args:
            session_data: Session creation data
            
        Returns:
            Created GameSession object or None if failed
        """
        try:
            # Verify child exists and is active
            child = self.db.query(Child).filter(
                and_(Child.id == session_data.child_id, Child.is_active == True)
            ).first()
            
            if not child:
                logger.warning(f"Child not found or inactive: {session_data.child_id}")
                return None
            
            session = GameSession(
                child_id=session_data.child_id,
                session_type=session_data.session_type,
                scenario_name=session_data.scenario_name,
                scenario_id=session_data.scenario_id,
                scenario_version=session_data.scenario_version,
                device_type=session_data.device_type,
                device_model=session_data.device_model,
                app_version=session_data.app_version,
                environment_type=session_data.environment_type,
                support_person_present=session_data.support_person_present,
                
                # Initialize defaults
                levels_completed=0,
                max_level_reached=0,
                score=0,
                interactions_count=0,
                correct_responses=0,
                incorrect_responses=0,
                help_requests=0,
                hint_usage_count=0,
                pause_count=0,
                total_pause_duration=0,
                achievements_unlocked=[],
                progress_markers_hit=[],
                completion_status="in_progress",
                session_data_quality="good",
                started_at=datetime.now(timezone.utc)
            )
            
            self.db.add(session)
            self.db.commit()
            self.db.refresh(session)
            
            logger.info(f"Game session created: {session.scenario_name} (ID: {session.id}) for child {session_data.child_id}")
            return session
            
        except IntegrityError as e:
            self.db.rollback()
            logger.error(f"Integrity error creating session: {str(e)}")
            return None
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating session: {str(e)}")
            return None
    
    def get_session_by_id(self, session_id: int) -> Optional[GameSession]:
        """
        Get session by ID with child information
        
        Args:
            session_id: Session ID
            
        Returns:
            GameSession object or None
        """
        try:
            session = self.db.query(GameSession).filter(GameSession.id == session_id).first()
            return session
        except Exception as e:
            logger.error(f"Error getting session {session_id}: {str(e)}")
            return None
    
    def update_session(self, session_id: int, update_data: GameSessionUpdate) -> Optional[GameSession]:
        """
        Update game session with progress and analytics data
        
        Args:
            session_id: Session ID
            update_data: Update data
            
        Returns:
            Updated GameSession object or None
        """
        try:
            session = self.db.query(GameSession).filter(GameSession.id == session_id).first()
            if not session:
                logger.warning(f"Session not found: {session_id}")
                return None
            
            # Update fields if provided
            update_fields = update_data.model_dump(exclude_unset=True)
            
            for field, value in update_fields.items():
                if hasattr(session, field) and value is not None:
                    setattr(session, field, value)
            
            self.db.commit()
            self.db.refresh(session)
            
            logger.info(f"Session updated successfully: {session_id}")
            return session
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating session {session_id}: {str(e)}")
            return None
    
    def complete_session(self, session_id: int, completion_data: GameSessionComplete) -> Optional[GameSession]:
        """
        Mark session as completed with final analytics
        
        Args:
            session_id: Session ID
            completion_data: Completion data
            
        Returns:
            Completed GameSession object or None
        """
        try:
            session = self.db.query(GameSession).filter(GameSession.id == session_id).first()
            if not session:
                return None
            
            # Mark as completed using model method
            session.mark_completed(completion_data.exit_reason)
            
            # Update final emotional state if provided
            if completion_data.final_emotional_state:
                emotional_data = session.emotional_data or {}
                emotional_data["final_state"] = completion_data.final_emotional_state.value
                session.emotional_data = emotional_data
            
            # Add session summary notes
            if completion_data.session_summary_notes:
                session.parent_notes = completion_data.session_summary_notes
            
            self.db.commit()
            self.db.refresh(session)
            
            logger.info(f"Session completed: {session_id} with reason: {completion_data.exit_reason}")
            return session
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error completing session {session_id}: {str(e)}")
            return None
    
    def get_sessions_by_child(self, child_id: int, filters: Optional[GameSessionFilters] = None, 
                            pagination: Optional[PaginationParams] = None) -> Tuple[List[GameSession], int]:
        """
        Get game sessions for a child with filtering and pagination
        
        Args:
            child_id: Child ID
            filters: Optional filters
            pagination: Optional pagination parameters
            
        Returns:
            Tuple of (sessions list, total count)
        """
        try:
            query = self.db.query(GameSession).filter(GameSession.child_id == child_id)
            
            # Apply filters
            if filters:
                if filters.session_type:
                    query = query.filter(GameSession.session_type == filters.session_type)
                if filters.scenario_name:
                    query = query.filter(GameSession.scenario_name.ilike(f"%{filters.scenario_name}%"))
                if filters.date_from:
                    query = query.filter(GameSession.started_at >= filters.date_from)
                if filters.date_to:
                    query = query.filter(GameSession.started_at <= filters.date_to)
                if filters.completion_status:
                    query = query.filter(GameSession.completion_status == filters.completion_status)
                if filters.min_duration:
                    query = query.filter(GameSession.duration_seconds >= filters.min_duration)
                if filters.max_duration:
                    query = query.filter(GameSession.duration_seconds <= filters.max_duration)
                if filters.min_score:
                    query = query.filter(GameSession.score >= filters.min_score)
                if filters.parent_rating:
                    query = query.filter(GameSession.parent_rating == filters.parent_rating)
            
            # Get total count
            total_count = query.count()
            
            # Apply pagination and sorting
            if pagination:
                if pagination.sort_by:
                    sort_column = getattr(GameSession, pagination.sort_by, None)
                    if sort_column:
                        if pagination.sort_order == "asc":
                            query = query.order_by(asc(sort_column))
                        else:
                            query = query.order_by(desc(sort_column))
                else:
                    query = query.order_by(desc(GameSession.started_at))
                
                offset = (pagination.page - 1) * pagination.page_size
                query = query.offset(offset).limit(pagination.page_size)
            else:
                query = query.order_by(desc(GameSession.started_at))
            
            sessions = query.all()
            return sessions, total_count
            
        except Exception as e:
            logger.error(f"Error getting sessions for child {child_id}: {str(e)}")
            return [], 0
    
    def get_session_analytics(self, session_id: int) -> Optional[Dict[str, Any]]:
        """
        Generate comprehensive analytics for a session
        
        Args:
            session_id: Session ID
            
        Returns:
            Analytics dictionary or None
        """
        try:
            session = self.get_session_by_id(session_id)
            if not session:
                return None
            
            return session.get_session_summary()
            
        except Exception as e:
            logger.error(f"Error generating analytics for session {session_id}: {str(e)}")
            return None
    
    def get_child_session_trends(self, child_id: int, days: int = 30) -> Dict[str, Any]:
        """
        Get session trends and progress for a child
        
        Args:
            child_id: Child ID
            days: Number of days to analyze
            
        Returns:
            Trends analysis dictionary
        """
        try:
            start_date = datetime.now(timezone.utc) - timedelta(days=days)
            
            sessions = self.db.query(GameSession).filter(
                and_(
                    GameSession.child_id == child_id,
                    GameSession.started_at >= start_date
                )
            ).order_by(GameSession.started_at).all()
            
            if not sessions:
                return {"error": "No sessions found in date range"}
            
            # Calculate trends
            total_sessions = len(sessions)
            completed_sessions = len([s for s in sessions if s.completion_status == "completed"])
            
            # Score progression
            scores = [s.score for s in sessions if s.score is not None]
            avg_score = sum(scores) / len(scores) if scores else 0
            
            # Engagement metrics
            engagement_scores = [s.calculate_engagement_score() for s in sessions]
            avg_engagement = sum(engagement_scores) / len(engagement_scores) if engagement_scores else 0
            
            # Duration trends
            durations = [s.duration_seconds for s in sessions if s.duration_seconds is not None]
            avg_duration = sum(durations) / len(durations) if durations else 0
            
            # Session type distribution
            session_types = {}
            for session in sessions:
                session_type = session.session_type.value if hasattr(session.session_type, 'value') else str(session.session_type)
                session_types[session_type] = session_types.get(session_type, 0) + 1
            
            # Weekly progress
            weekly_progress = self._calculate_weekly_progress(sessions)
            
            return {
                "period_days": days,
                "total_sessions": total_sessions,
                "completion_rate": completed_sessions / total_sessions if total_sessions > 0 else 0,
                "average_score": round(avg_score, 1),
                "average_engagement": round(avg_engagement, 2),
                "average_duration_minutes": round(avg_duration / 60, 1) if avg_duration else 0,
                "session_type_distribution": session_types,
                "weekly_progress": weekly_progress,
                "trend_analysis": {
                    "score_trend": self._calculate_trend([s.score for s in sessions[-5:] if s.score]),
                    "engagement_trend": self._calculate_trend([s.calculate_engagement_score() for s in sessions[-5:]]),
                    "duration_trend": self._calculate_trend([s.duration_seconds for s in sessions[-5:] if s.duration_seconds])
                }
            }
            
        except Exception as e:
            logger.error(f"Error calculating session trends for child {child_id}: {str(e)}")
            return {"error": str(e)}
    
    def _calculate_weekly_progress(self, sessions: List[GameSession]) -> List[Dict[str, Any]]:
        """Calculate weekly progress metrics"""
        weekly_data = {}
        
        for session in sessions:
            week_start = session.started_at.replace(hour=0, minute=0, second=0, microsecond=0)
            week_start = week_start - timedelta(days=week_start.weekday())
            week_key = week_start.strftime("%Y-W%U")
            
            if week_key not in weekly_data:
                weekly_data[week_key] = {
                    "week_start": week_start,
                    "sessions": 0,
                    "total_score": 0,
                    "total_duration": 0,
                    "completed": 0
                }
            
            weekly_data[week_key]["sessions"] += 1
            weekly_data[week_key]["total_score"] += session.score or 0
            weekly_data[week_key]["total_duration"] += session.duration_seconds or 0
            if session.completion_status == "completed":
                weekly_data[week_key]["completed"] += 1
        
        # Convert to list and calculate averages
        weekly_progress = []
        for week_key, data in sorted(weekly_data.items()):
            weekly_progress.append({
                "week": week_key,
                "week_start": data["week_start"].isoformat(),
                "sessions": data["sessions"],
                "avg_score": round(data["total_score"] / data["sessions"], 1) if data["sessions"] > 0 else 0,
                "avg_duration": round(data["total_duration"] / data["sessions"] / 60, 1) if data["sessions"] > 0 else 0,
                "completion_rate": round(data["completed"] / data["sessions"], 2) if data["sessions"] > 0 else 0
            })
        
        return weekly_progress
    
    def _calculate_trend(self, values: List[float]) -> str:
        """Calculate trend direction from a list of values"""
        if len(values) < 2:
            return "insufficient_data"
        
        # Simple linear regression slope
        n = len(values)
        x_values = list(range(n))
        
        sum_x = sum(x_values)
        sum_y = sum(values)
        sum_xy = sum(x * y for x, y in zip(x_values, values))
        sum_x2 = sum(x * x for x in x_values)
        
        slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x * sum_x)
        
        if slope > 0.1:
            return "improving"
        elif slope < -0.1:
            return "declining"
        else:
            return "stable"

# =============================================================================
# CLINICAL REPORTS CRUD OPERATIONS  
# =============================================================================

class ReportService:
    """Clinical Reports management service with professional workflows"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_report(self, report_data: ReportCreate, creator_id: int) -> Optional[Report]:
        """
        Create new clinical report
        
        Args:
            report_data: Report creation data
            creator_id: ID of user creating the report
            
        Returns:
            Created Report object or None if failed
        """
        try:
            # Verify child exists
            child = self.db.query(Child).filter(
                and_(Child.id == report_data.child_id, Child.is_active == True)
            ).first()
            
            if not child:
                logger.warning(f"Child not found or inactive: {report_data.child_id}")
                return None
            
            # Verify professional if specified
            if report_data.professional_id:
                professional = self.db.query(User).filter(
                    and_(
                        User.id == report_data.professional_id,
                        User.role == UserRole.PROFESSIONAL,
                        User.is_active == True
                    )
                ).first()
                
                if not professional:
                    logger.warning(f"Professional not found: {report_data.professional_id}")
                    return None
            
            report = Report(
                child_id=report_data.child_id,
                professional_id=report_data.professional_id or creator_id,
                report_type=report_data.report_type,
                title=report_data.title,
                report_version=report_data.report_version,
                template_used=report_data.template_used,
                content=report_data.content,
                metrics=report_data.metrics,
                period_start=report_data.period_start,
                period_end=report_data.period_end,
                sessions_included=report_data.sessions_included,
                activities_included=report_data.activities_included,
                sharing_permissions=report_data.sharing_permissions,
                attachments=report_data.attachments,
                auto_generated=report_data.auto_generated,
                status=ReportStatus.DRAFT,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
            
            self.db.add(report)
            self.db.commit()
            self.db.refresh(report)
            
            logger.info(f"Report created: {report.title} (ID: {report.id}) for child {report_data.child_id}")
            return report
            
        except IntegrityError as e:
            self.db.rollback()
            logger.error(f"Integrity error creating report: {str(e)}")
            return None
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating report: {str(e)}")
            return None
    
    def get_report_by_id(self, report_id: int, user_id: int, user_role: str) -> Optional[Report]:
        """
        Get report by ID with permission checking
        
        Args:
            report_id: Report ID
            user_id: User requesting access
            user_role: Role of requesting user
            
        Returns:
            Report object or None if not found/no permission
        """
        try:
            report = self.db.query(Report).filter(Report.id == report_id).first()
            
            if not report:
                return None
            
            # Check permissions
            if not self._check_report_access(report, user_id, user_role):
                logger.warning(f"Access denied to report {report_id} for user {user_id}")
                return None
            
            return report
            
        except Exception as e:
            logger.error(f"Error getting report {report_id}: {str(e)}")
            return None
    
    def update_report(self, report_id: int, update_data: ReportUpdate, 
                     user_id: int) -> Optional[Report]:
        """
        Update report with permission checking
        
        Args:
            report_id: Report ID
            update_data: Update data
            user_id: User making the update
            
        Returns:
            Updated Report object or None
        """
        try:
            report = self.db.query(Report).filter(Report.id == report_id).first()
            
            if not report:
                logger.warning(f"Report not found: {report_id}")
                return None
            
            # Check if user can edit (creator or admin)
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user or (report.professional_id != user_id and user.role != UserRole.ADMIN):
                logger.warning(f"Unauthorized update attempt for report {report_id} by user {user_id}")
                return None
            
            # Update fields if provided
            update_fields = update_data.model_dump(exclude_unset=True)
            
            for field, value in update_fields.items():
                if hasattr(report, field) and value is not None:
                    setattr(report, field, value)
            
            report.updated_at = datetime.now(timezone.utc)
            
            self.db.commit()
            self.db.refresh(report)
            
            logger.info(f"Report updated successfully: {report_id}")
            return report
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating report {report_id}: {str(e)}")
            return None
    
    def get_reports_by_child(self, child_id: int, filters: Optional[ReportFilters] = None,
                           pagination: Optional[PaginationParams] = None,
                           user_id: int = None, user_role: str = None) -> Tuple[List[Report], int]:
        """
        Get reports for a child with filtering and pagination
        
        Args:
            child_id: Child ID
            filters: Optional filters
            pagination: Optional pagination parameters
            user_id: User requesting reports (for permission checking)
            user_role: Role of requesting user
            
        Returns:
            Tuple of (reports list, total count)
        """
        try:
            query = self.db.query(Report).filter(Report.child_id == child_id)
            
            # Apply filters
            if filters:
                if filters.professional_id:
                    query = query.filter(Report.professional_id == filters.professional_id)
                if filters.report_type:
                    query = query.filter(Report.report_type == filters.report_type)
                if filters.status:
                    query = query.filter(Report.status == filters.status)
                if filters.date_from:
                    query = query.filter(Report.created_at >= filters.date_from)
                if filters.date_to:
                    query = query.filter(Report.created_at <= filters.date_to)
                if filters.auto_generated is not None:
                    query = query.filter(Report.auto_generated == filters.auto_generated)
                if filters.peer_reviewed is not None:
                    query = query.filter(Report.peer_reviewed == filters.peer_reviewed)
                if filters.has_metrics is not None:
                    if filters.has_metrics:
                        query = query.filter(Report.metrics.isnot(None))
                    else:
                        query = query.filter(Report.metrics.is_(None))
            
            # Filter by permissions if user specified
            if user_id and user_role:
                # For parents, only show reports they have access to
                if user_role == "parent":
                    # Add permission filtering logic here
                    pass
            
            # Get total count
            total_count = query.count()
            
            # Apply pagination and sorting
            if pagination:
                if pagination.sort_by:
                    sort_column = getattr(Report, pagination.sort_by, None)
                    if sort_column:
                        if pagination.sort_order == "asc":
                            query = query.order_by(asc(sort_column))
                        else:
                            query = query.order_by(desc(sort_column))
                else:
                    query = query.order_by(desc(Report.created_at))
                
                offset = (pagination.page - 1) * pagination.page_size
                query = query.offset(offset).limit(pagination.page_size)
            else:
                query = query.order_by(desc(Report.created_at))
            
            reports = query.all()
            
            # Filter results by permission if needed
            if user_id and user_role:
                accessible_reports = []
                for report in reports:
                    if self._check_report_access(report, user_id, user_role):
                        accessible_reports.append(report)
                reports = accessible_reports
            
            return reports, total_count
            
        except Exception as e:
            logger.error(f"Error getting reports for child {child_id}: {str(e)}")
            return [], 0
    
    def _check_report_access(self, report: Report, user_id: int, user_role: str) -> bool:
        """Check if user has access to report"""
        # Creator always has access
        if report.professional_id == user_id:
            return True
        
        # Admin always has access
        if user_role == "admin":
            return True
        
        # Check parent access for child's parent
        if user_role == "parent":
            child = self.db.query(Child).filter(Child.id == report.child_id).first()
            if child and child.parent_id == user_id:
                permissions = report.sharing_permissions or {}
                return permissions.get("parent_access", True)
        
        # Check external professional access
        permissions = report.sharing_permissions or {}
        external_access = permissions.get("external_professionals", [])
        for access in external_access:
            if access.get("professional_id") == user_id:
                expiry = access.get("expiry_date")
                if not expiry or datetime.fromisoformat(expiry) > datetime.now():
                    return True
        
        return False
    
    def generate_progress_report(self, child_id: int, period_days: int = 30,
                               creator_id: int = None) -> Optional[Report]:
        """
        Auto-generate a progress report for a child
        
        Args:
            child_id: Child ID
            period_days: Period to analyze in days
            creator_id: ID of user generating report
            
        Returns:
            Generated Report object or None
        """
        try:
            # Get session service for analytics
            session_service = GameSessionService(self.db)
            
            # Get child info
            child = self.db.query(Child).filter(Child.id == child_id).first()
            if not child:
                return None
            
            # Get session trends
            trends = session_service.get_child_session_trends(child_id, period_days)
            
            if "error" in trends:
                logger.warning(f"Cannot generate report - no session data: {trends['error']}")
                return None
            
            # Get recent sessions for detailed analysis
            end_date = datetime.now(timezone.utc)
            start_date = end_date - timedelta(days=period_days)
            
            sessions, _ = session_service.get_sessions_by_child(
                child_id,
                filters=GameSessionFilters(date_from=start_date, date_to=end_date)
            )
            
            # Generate report content
            content = self._generate_progress_content(child, sessions, trends, period_days)
            metrics = self._generate_progress_metrics(sessions, trends)
            
            # Create report
            report_data = ReportCreate(
                child_id=child_id,
                professional_id=creator_id,
                report_type=ReportType.PROGRESS,
                title=f"Progress Report - {child.name} ({start_date.strftime('%B %Y')})",
                content=content,
                metrics=metrics,
                period_start=start_date,
                period_end=end_date,
                sessions_included=[s.id for s in sessions],
                activities_included=[],
                auto_generated=True
            )
            
            return self.create_report(report_data, creator_id or 1)  # Default to system user
            
        except Exception as e:
            logger.error(f"Error generating progress report for child {child_id}: {str(e)}")
            return None
    
    def _generate_progress_content(self, child: Child, sessions: List[GameSession], 
                                 trends: Dict[str, Any], period_days: int) -> Dict[str, Any]:
        """Generate progress report content structure"""
        
        # Calculate key achievements
        key_achievements = []
        if trends["completion_rate"] > 0.8:
            key_achievements.append("High session completion rate")
        if trends["average_engagement"] > 0.7:
            key_achievements.append("Strong engagement levels")
        
        completed_scenarios = set()
        for session in sessions:
            if session.completion_status == "completed":
                completed_scenarios.add(session.scenario_name)
        
        if len(completed_scenarios) > 1:
            key_achievements.append(f"Successfully completed {len(completed_scenarios)} different scenarios")
        
        # Identify areas for focus
        areas_for_focus = []
        if trends["completion_rate"] < 0.6:
            areas_for_focus.append("Improving session completion rates")
        if trends["average_engagement"] < 0.5:
            areas_for_focus.append("Enhancing engagement strategies")
        
        return {
            "period": {
                "start_date": (datetime.now() - timedelta(days=period_days)).strftime("%Y-%m-%d"),
                "end_date": datetime.now().strftime("%Y-%m-%d"),
                "total_sessions": trends["total_sessions"]
            },
            "executive_summary": f"During the {period_days}-day period, {child.name} participated in {trends['total_sessions']} game sessions with an average engagement score of {trends['average_engagement']:.2f}.",
            "goals_progress": [
                {
                    "goal": "Maintain engagement in therapeutic gaming",
                    "baseline": "Establishing baseline engagement",
                    "current_status": f"Average engagement: {trends['average_engagement']:.2f}",
                    "progress_percentage": min(100, int(trends["average_engagement"] * 100)),
                    "evidence": [f"Completed {trends['total_sessions']} sessions", f"Average score: {trends['average_score']}"]
                }
            ],
            "key_achievements": key_achievements,
            "areas_for_focus": areas_for_focus,
            "session_analytics": {
                "total_time_engaged": sum(s.duration_seconds or 0 for s in sessions) // 60,
                "average_session_length": trends["average_duration_minutes"],
                "completion_rate": trends["completion_rate"],
                "skill_progression": trends["trend_analysis"]["score_trend"]
            }
        }
    
    def _generate_progress_metrics(self, sessions: List[GameSession], 
                                 trends: Dict[str, Any]) -> Dict[str, Any]:
        """Generate quantitative metrics for progress report"""
        
        return {
            "game_session_metrics": {
                "total_sessions": len(sessions),
                "total_engagement_time": sum(s.duration_seconds or 0 for s in sessions) // 60,
                "average_completion_rate": trends["completion_rate"],
                "progress_trajectory": trends["trend_analysis"]["score_trend"],
                "skill_mastery_levels": {
                    "overall_performance": min(5, max(1, int(trends["average_score"] / 20))),
                    "engagement_consistency": min(5, max(1, int(trends["average_engagement"] * 5))),
                }
            },
            "behavioral_metrics": {
                "session_completion_trend": trends["trend_analysis"]["engagement_trend"],
                "duration_tolerance": trends["trend_analysis"]["duration_trend"],
                "help_seeking_pattern": "appropriate" if any(s.help_requests < 5 for s in sessions) else "high_frequency"
            },
            "parent_feedback_trends": {
                "satisfaction_average": sum(s.parent_rating or 3 for s in sessions if s.parent_rating) / max(1, len([s for s in sessions if s.parent_rating])),
                "engagement_enthusiasm": trends["average_engagement"] * 5,
            }
        }
