"""
Reports and analytics routes - FIXED VERSION
Eliminati import problematici e dipendenze non risolte
"""

from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Any, Tuple
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc

from app.core.database import get_db
from app.auth.models import User, UserRole
from app.auth.dependencies import (
    get_current_user, get_current_verified_user,
    require_parent, require_professional, require_admin
)
from app.users.models import Child, Activity, GameSession
from app.users import crud

# Import profile router and children router
from app.users.profile_routes import router as profile_router
from app.users.children_routes import router as children_router

# Constants
WEEK_FORMAT = "%Y-W%U"

# Create router
router = APIRouter()

# Include profile routes without additional prefix since they already define their paths
router.include_router(
    profile_router,
    tags=["profile"]
)

# Include children routes
router.include_router(
    children_router,
    prefix="",  # No additional prefix - children routes already have /children
    tags=["children"]
)

# =============================================================================
# DASHBOARD ENDPOINTS
# =============================================================================

@router.get("/dashboard")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Get dashboard statistics for current user
    
    Returns different dashboard data based on user role:
    - Parents: Statistics for their children
    - Professionals: Statistics for assigned children
    - Admins: Platform-wide statistics    """
    try:
        if current_user.role == UserRole.PARENT:
            return await _get_parent_dashboard(current_user.id, db)
        elif current_user.role == UserRole.PROFESSIONAL:
            return await _get_professional_dashboard(current_user.id, db)
        elif current_user.role == UserRole.ADMIN:
            return await _get_admin_dashboard(current_user.id, db)
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Dashboard access not available for this user role"
            )
            
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve dashboard statistics"
        )

async def _get_parent_dashboard(parent_id: int, db: Session) -> Dict[str, Any]:
    """Get dashboard statistics for parent users"""
    # Get user's children
    children = crud.get_children_by_parent(db, parent_id=parent_id)
    
    if not children:
        return {
            "user_type": "parent",
            "total_children": 0,
            "total_activities": 0,
            "total_points": 0,
            "total_sessions": 0,
            "children_stats": [],
            "recent_activities": [],
            "weekly_progress": {}
        }
    
    child_ids = [child.id for child in children]
    
    # Calculate time periods
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)
    
    # Total activities this week
    weekly_activities = db.query(Activity).filter(
        and_(
            Activity.child_id.in_(child_ids),
            Activity.completed_at >= week_ago
        )
    ).count()
    
    # Total activities this month
    monthly_activities = db.query(Activity).filter(
        and_(
            Activity.child_id.in_(child_ids),
            Activity.completed_at >= month_ago
        )
    ).count()
    
    # Total game sessions this week
    weekly_sessions = db.query(GameSession).filter(
        and_(
            GameSession.child_id.in_(child_ids),
            GameSession.started_at >= week_ago
        )
    ).count()
    
    # Total points across all children
    total_points = sum(child.points for child in children)
    
    # Individual child statistics
    children_stats = []
    for child in children:
        child_weekly_activities = db.query(Activity).filter(
            and_(
                Activity.child_id == child.id,
                Activity.completed_at >= week_ago
            )
        ).count()
        
        child_weekly_sessions = db.query(GameSession).filter(
            and_(
                GameSession.child_id == child.id,
                GameSession.started_at >= week_ago
            )
        ).count()
        
        # Recent activity
        last_activity = db.query(Activity).filter(
            Activity.child_id == child.id
        ).order_by(desc(Activity.completed_at)).first()
        
        children_stats.append({
            "child_id": child.id,
            "name": child.name,
            "age": child.age,
            "points": child.points,
            "level": child.level,
            "support_level": child.support_level,
            "activities_this_week": child_weekly_activities,
            "sessions_this_week": child_weekly_sessions,
            "last_activity": last_activity.completed_at.isoformat() if last_activity else None
        })
    
    # Get recent activities across all children (last 10)
    recent_activities = db.query(Activity).filter(
        Activity.child_id.in_(child_ids)
    ).order_by(desc(Activity.completed_at)).limit(10).all()
    
    recent_activities_data = [
        {
            "id": activity.id,
            "child_name": next((c.name for c in children if c.id == activity.child_id), "Unknown"),
            "activity_type": activity.activity_type,
            "activity_name": activity.activity_name,
            "points_earned": activity.points_earned,
            "completed_at": activity.completed_at.isoformat(),
            "verified": activity.verified_by_parent
        }
        for activity in recent_activities
    ]
    
    # Weekly progress (points earned each day for the last 7 days)
    weekly_progress = {}
    for i in range(7):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        
        day_points = db.query(func.sum(Activity.points_earned)).filter(
            and_(
                Activity.child_id.in_(child_ids),
                Activity.completed_at >= day_start,
                Activity.completed_at < day_end
            )
        ).scalar() or 0
        
        weekly_progress[day.strftime("%Y-%m-%d")] = day_points
    
    return {
        "user_type": "parent",
        "total_children": len(children),
        "total_activities_week": weekly_activities,
        "total_activities_month": monthly_activities,
        "total_points": total_points,
        "total_sessions_week": weekly_sessions,
        "children_stats": children_stats,
        "recent_activities": recent_activities_data,
        "weekly_progress": weekly_progress,
        "generated_at": now.isoformat()
    }

async def _get_professional_dashboard(_: int, db: Session) -> Dict[str, Any]:
    """Get dashboard statistics for professional users"""
    # For now, return placeholder data
    # This would be implemented when professional-child assignment system is added
    _ = db  # Placeholder to avoid unused parameter warning
    return {
        "user_type": "professional",
        "assigned_children": 0,
        "total_sessions_observed": 0,
        "recommendations_given": 0,
        "average_improvement": 0.0,
        "recent_assessments": [],
        "monthly_stats": {},
        "message": "Professional dashboard features will be available when child assignment system is implemented",
        "generated_at": datetime.now(timezone.utc).isoformat()
    }

async def _get_admin_dashboard(_: int, db: Session) -> Dict[str, Any]:
    """Get dashboard statistics for admin users"""
    now = datetime.now(timezone.utc)
    month_ago = now - timedelta(days=30)
    week_ago = now - timedelta(days=7)
    
    # Platform-wide statistics
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    parent_users = db.query(User).filter(User.role == UserRole.PARENT).count()
    professional_users = db.query(User).filter(User.role == UserRole.PROFESSIONAL).count()
    
    total_children = db.query(Child).filter(Child.is_active == True).count()
    total_activities = db.query(Activity).count()
    total_sessions = db.query(GameSession).count()
    
    # Monthly growth
    new_users_month = db.query(User).filter(User.created_at >= month_ago).count()
    new_children_month = db.query(Child).filter(Child.created_at >= month_ago).count()
    
    # Weekly activity
    activities_week = db.query(Activity).filter(Activity.completed_at >= week_ago).count()
    sessions_week = db.query(GameSession).filter(GameSession.started_at >= week_ago).count()
    
    # Most active children (by points)
    top_children = db.query(Child).filter(
        Child.is_active == True
    ).order_by(desc(Child.points)).limit(5).all()
    
    top_children_data = [
        {
            "id": child.id,
            "name": child.name,
            "points": child.points,
            "level": child.level,
            "activities_count": db.query(Activity).filter(Activity.child_id == child.id).count()
        }
        for child in top_children
    ]
    
    return {
        "user_type": "admin",
        "platform_stats": {
            "total_users": total_users,
            "active_users": active_users,
            "parent_users": parent_users,
            "professional_users": professional_users,
            "total_children": total_children,
            "total_activities": total_activities,
            "total_sessions": total_sessions
        },
        "growth_stats": {
            "new_users_month": new_users_month,
            "new_children_month": new_children_month,
            "activities_week": activities_week,
            "sessions_week": sessions_week
        },
        "top_performers": top_children_data,
        "generated_at": now.isoformat()
    }

# =============================================================================
# CHILD PROGRESS REPORTS
# =============================================================================

@router.get("/child/{child_id}/progress")
async def get_child_progress_report(
    child_id: int,
    days: int = Query(default=30, ge=1, le=365, description="Number of days to include in report"),
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive progress report for a specific child
    
    Returns detailed analytics including activities, game sessions,
    emotional tracking, and progress trends over the specified period.
    """
    try:
        # Verify child exists and user has access
        child = crud.get_child_by_id(db, child_id=child_id)
        if not child:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Child not found"
            )
        
        # Check permissions
        if current_user.role == UserRole.PARENT and child.parent_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this child's progress data"
            )
        
        # Calculate date range
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=days)
        
        # Get activities for the period
        activities = db.query(Activity).filter(
            and_(
                Activity.child_id == child_id,
                Activity.completed_at >= start_date,
                Activity.completed_at <= end_date
            )
        ).order_by(Activity.completed_at.desc()).all()
        
        # Get game sessions for the period
        sessions = db.query(GameSession).filter(
            and_(
                GameSession.child_id == child_id,
                GameSession.started_at >= start_date,
                GameSession.started_at <= end_date
            )
        ).order_by(GameSession.started_at.desc()).all()
        
        # Activity analytics
        activity_analytics = _analyze_activities(activities)
        
        # Game session analytics
        session_analytics = _analyze_sessions(sessions)
        
        # Emotional progress tracking
        emotional_progress = _analyze_emotional_progress(activities)
        
        # Daily progress (points earned each day)
        daily_progress = _calculate_daily_progress(activities, start_date, end_date)
        
        # Weekly trends
        weekly_trends = _calculate_weekly_trends(activities, sessions, start_date, end_date)
        
        return {
            "child": {
                "id": child.id,
                "name": child.name,
                "age": child.age,
                "current_level": child.level,
                "total_points": child.points,
                "support_level": child.support_level,
                "diagnosis": child.diagnosis
            },
            "report_period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "days": days
            },
            "activity_analytics": activity_analytics,            "session_analytics": session_analytics,
            "emotional_progress": emotional_progress,
            "daily_progress": daily_progress,
            "weekly_trends": weekly_trends,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
        
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate progress report"
        )

def _process_activity_types(activities: List[Activity]) -> Tuple[Dict[str, Any], float, int]:
    """Process activity types and calculate difficulty metrics"""
    activity_types = {}
    difficulty_sum = 0
    difficulty_count = 0
    
    for activity in activities:
        activity_type = activity.activity_type
        if activity_type not in activity_types:
            activity_types[activity_type] = {
                "count": 0,
                "total_points": 0,
                "avg_difficulty": 0,
                "difficulties": []
            }
        
        activity_types[activity_type]["count"] += 1
        activity_types[activity_type]["total_points"] += activity.points_earned
        
        if activity.difficulty_level:
            activity_types[activity_type]["difficulties"].append(activity.difficulty_level)
            difficulty_sum += activity.difficulty_level
            difficulty_count += 1
    
    # Calculate average difficulties
    for activity_type in activity_types:
        difficulties = activity_types[activity_type]["difficulties"]
        if difficulties:
            activity_types[activity_type]["avg_difficulty"] = sum(difficulties) / len(difficulties)
        del activity_types[activity_type]["difficulties"]  # Remove raw data
    
    return activity_types, difficulty_sum, difficulty_count

def _determine_completion_trend(activities: List[Activity]) -> str:
    """Determine completion trend based on activity points"""
    mid_point = len(activities) // 2
    if mid_point <= 0:
        return "stable"
        
    first_half_avg = sum(a.points_earned for a in activities[mid_point:]) / (len(activities) - mid_point)
    second_half_avg = sum(a.points_earned for a in activities[:mid_point]) / mid_point
    
    if second_half_avg > first_half_avg * 1.1:
        return "improving"
    elif second_half_avg < first_half_avg * 0.9:
        return "declining"
    else:
        return "stable"

def _analyze_activities(activities: List[Activity]) -> Dict[str, Any]:
    """Analyze activity data for progress report"""
    if not activities:
        return {
            "total_activities": 0,
            "total_points": 0,
            "verified_activities": 0,
            "average_difficulty": 0,
            "activity_types": {},
            "completion_trend": "stable"
        }
    
    total_activities = len(activities)
    total_points = sum(a.points_earned for a in activities)
    verified_activities = len([a for a in activities if a.verified_by_parent])
    
    # Process activity types and difficulty metrics
    activity_types, difficulty_sum, difficulty_count = _process_activity_types(activities)
    
    # Calculate average difficulty
    average_difficulty = difficulty_sum / difficulty_count if difficulty_count > 0 else 0
    
    # Determine completion trend
    completion_trend = _determine_completion_trend(activities)
    
    return {
        "total_activities": total_activities,
        "total_points": total_points,
        "verified_activities": verified_activities,
        "verification_rate": (verified_activities / total_activities * 100) if total_activities > 0 else 0,
        "average_difficulty": round(average_difficulty, 2),
        "activity_types": activity_types,
        "completion_trend": completion_trend
    }

def _get_session_counts(sessions: List[GameSession]) -> Tuple[int, int, list]:
    """Helper function to count sessions and completed sessions"""
    total_sessions = len(sessions)
    completed_sessions = [s for s in sessions if s.completion_status == "completed"]
    return total_sessions, len(completed_sessions), completed_sessions

def _calculate_session_averages(completed_sessions: List[GameSession]) -> Tuple[float, float]:
    """Helper function to calculate average score and duration from completed sessions"""
    if not completed_sessions:
        return 0, 0
        
    total_score = sum(s.score for s in completed_sessions if s.score)
    total_duration = sum(s.duration_seconds for s in completed_sessions if s.duration_seconds)
    
    average_score = total_score / len(completed_sessions) if completed_sessions else 0
    average_duration = total_duration / len(completed_sessions) if completed_sessions else 0
    
    return average_score, average_duration

def _group_session_types(sessions: List[GameSession]) -> Dict[str, Dict[str, Any]]:
    """Helper function to group sessions by type and collect metrics"""
    session_types = {}
    
    for session in sessions:
        session_type = session.session_type
        if session_type not in session_types:
            session_types[session_type] = {
                "count": 0,
                "completed": 0,
                "scores": [],
                "durations": []
            }
        
        session_types[session_type]["count"] += 1
        if session.completion_status == "completed":
            session_types[session_type]["completed"] += 1
            if session.score:
                session_types[session_type]["scores"].append(session.score)
            if session.duration_seconds:
                session_types[session_type]["durations"].append(session.duration_seconds)
    
    return session_types

def _process_session_type_metrics(session_types: Dict[str, Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    """Helper function to calculate metrics for each session type"""
    for session_type, data in session_types.items():
        scores = data["scores"]
        durations = data["durations"]
        
        data["avg_score"] = sum(scores) / len(scores) if scores else 0
        data["avg_duration"] = sum(durations) / len(durations) if durations else 0
        data["completion_rate"] = (
            data["completed"] / data["count"] * 100
        ) if data["count"] > 0 else 0
        
        # Remove raw data
        del data["scores"]
        del data["durations"]
    
    return session_types

def _determine_performance_trend(completed_sessions: List[GameSession]) -> str:
    """Helper function to determine performance trend from completed sessions"""
    if len(completed_sessions) < 4:
        return "insufficient_data"
    
    mid_point = len(completed_sessions) // 2
    first_half_scores = [s.score for s in completed_sessions[mid_point:] if s.score]
    second_half_scores = [s.score for s in completed_sessions[:mid_point] if s.score]
    
    if not first_half_scores or not second_half_scores:
        return "stable"
        
    first_avg = sum(first_half_scores) / len(first_half_scores)
    second_avg = sum(second_half_scores) / len(second_half_scores)
    
    if second_avg > first_avg * 1.1:
        return "improving"
    elif second_avg < first_avg * 0.9:
        return "declining"
    else:
        return "stable"

def _analyze_sessions(sessions: List[GameSession]) -> Dict[str, Any]:
    """Analyze game session data for progress report"""
    if not sessions:
        return {
            "total_sessions": 0,
            "completed_sessions": 0,
            "completion_rate": 0,
            "average_score": 0,
            "average_duration": 0,
            "session_types": {},
            "performance_trend": "stable"
        }
    
    # Get basic session counts and completed sessions
    total_sessions, completed_count, completed_sessions = _get_session_counts(sessions)
    
    # Calculate session averages
    average_score, average_duration = _calculate_session_averages(completed_sessions)
    
    # Group and analyze by session type
    session_types = _group_session_types(sessions)
    session_types = _process_session_type_metrics(session_types)
    
    # Determine performance trend
    performance_trend = _determine_performance_trend(completed_sessions)
    
    return {
        "total_sessions": total_sessions,
        "completed_sessions": completed_count,
        "completion_rate": (completed_count / total_sessions * 100) if total_sessions > 0 else 0,
        "average_score": round(average_score, 2),
        "average_duration_minutes": round(average_duration / 60, 2) if average_duration else 0,
        "session_types": session_types,
        "performance_trend": performance_trend
    }

def _analyze_emotional_progress(activities: List[Activity]) -> Dict[str, Any]:
    """Analyze emotional state progression from activities"""
    if not activities:
        return {
            "emotional_data_available": False,
            "emotional_trends": {},
            "improvement_indicators": []
        }
    
    # Filter activities with emotional data
    emotional_activities = [
        a for a in activities 
        if a.emotional_state_before and a.emotional_state_after
    ]
    
    if not emotional_activities:
        return {
            "emotional_data_available": False,
            "tracked_activities": 0,
            "note": "No emotional state data recorded for this period"
        }
    
    # Emotional state mapping for analysis (higher = better)
    emotion_scores = {
        "overwhelmed": 1,
        "frustrated": 2,
        "anxious": 3,
        "tired": 4,
        "calm": 5,
        "focused": 6,
        "happy": 7,
        "excited": 8
    }
    
    improvements = 0
    deteriorations = 0
    stable = 0
    
    emotional_transitions = {}
    
    for activity in emotional_activities:
        before = activity.emotional_state_before
        after = activity.emotional_state_after
        
        before_score = emotion_scores.get(before, 5)
        after_score = emotion_scores.get(after, 5)
        
        transition = f"{before} → {after}"
        if transition not in emotional_transitions:
            emotional_transitions[transition] = 0
        emotional_transitions[transition] += 1
        
        if after_score > before_score:
            improvements += 1
        elif after_score < before_score:
            deteriorations += 1
        else:
            stable += 1
    
    # Calculate improvement indicators
    improvement_indicators = []
    total_emotional = len(emotional_activities)
    
    if improvements > deteriorations:
        improvement_indicators.append("Positive emotional progress observed")
    if improvements / total_emotional > 0.6:
        improvement_indicators.append("High rate of emotional improvement during activities")
    if stable / total_emotional > 0.4:
        improvement_indicators.append("Good emotional stability maintained")
    
    return {
        "emotional_data_available": True,
        "tracked_activities": total_emotional,
        "improvements": improvements,
        "deteriorations": deteriorations,
        "stable": stable,
        "improvement_rate": round(improvements / total_emotional * 100, 1),
        "emotional_transitions": emotional_transitions,
        "improvement_indicators": improvement_indicators
    }

def _calculate_daily_progress(activities: List[Activity], start_date: datetime, end_date: datetime) -> Dict[str, int]:
    """Calculate daily points earned over the period"""
    daily_progress = {}
    
    current_date = start_date.date()
    end_date_only = end_date.date()
    
    while current_date <= end_date_only:
        daily_progress[current_date.isoformat()] = 0
        current_date += timedelta(days=1)
    
    for activity in activities:
        activity_date = activity.completed_at.date().isoformat()
        if activity_date in daily_progress:
            daily_progress[activity_date] += activity.points_earned
    
    return daily_progress

def _initialize_weekly_data(start_date: datetime, end_date: datetime) -> Dict[str, Dict[str, Any]]:
    """Initialize weekly data structure from start to end date"""
    weekly_data = {}
    
    current_date = start_date
    while current_date <= end_date:
        week_start = current_date - timedelta(days=current_date.weekday())
        week_key = week_start.strftime(WEEK_FORMAT)
        
        if week_key not in weekly_data:
            weekly_data[week_key] = {
                "week_start": week_start.isoformat(),
                "activities": 0,
                "points": 0,
                "sessions": 0,
                "completed_sessions": 0
            }
        
        current_date += timedelta(days=7)
    
    return weekly_data

def _populate_activities_data(weekly_data: Dict[str, Dict[str, Any]], activities: List[Activity]) -> None:
    """Populate weekly data with activities information"""
    for activity in activities:
        activity_week = activity.completed_at - timedelta(days=activity.completed_at.weekday())
        week_key = activity_week.strftime(WEEK_FORMAT)
        
        if week_key in weekly_data:
            weekly_data[week_key]["activities"] += 1
            weekly_data[week_key]["points"] += activity.points_earned

def _populate_sessions_data(weekly_data: Dict[str, Dict[str, Any]], sessions: List[GameSession]) -> None:
    """Populate weekly data with game sessions information"""
    for session in sessions:
        session_week = session.started_at - timedelta(days=session.started_at.weekday())
        week_key = session_week.strftime(WEEK_FORMAT)
        
        if week_key in weekly_data:
            weekly_data[week_key]["sessions"] += 1
            if session.completion_status == "completed":
                weekly_data[week_key]["completed_sessions"] += 1

def _analyze_metric_trend(old_value: int, new_value: int) -> str:
    """Determine trend based on old and new metric values"""
    if old_value == 0:
        return "new_data" if new_value > 0 else "stable"
    
    change_percent = ((new_value - old_value) / old_value) * 100
    if change_percent > 10:
        return "increasing"
    elif change_percent < -10:
        return "decreasing"
    else:
        return "stable"

def _generate_trend_analysis(weekly_data: Dict[str, Dict[str, Any]], weeks: List[str]) -> Dict[str, Any]:
    """Generate trend analysis based on weekly data"""
    if len(weeks) < 2:
        return {"note": "Insufficient data for trend analysis"}
    
    recent_weeks = weeks[-2:]
    trend_analysis = {}
    
    for metric in ["activities", "points", "sessions"]:
        old_value = weekly_data[recent_weeks[0]][metric]
        new_value = weekly_data[recent_weeks[1]][metric]
        trend_analysis[metric] = _analyze_metric_trend(old_value, new_value)
    
    return trend_analysis

def _calculate_weekly_trends(
    activities: List[Activity], 
    sessions: List[GameSession], 
    start_date: datetime, 
    end_date: datetime
) -> Dict[str, Any]:
    """Calculate weekly trends and patterns"""
    # Initialize weekly data structure
    weekly_data = _initialize_weekly_data(start_date, end_date)
    
    # Populate with activities and sessions data
    _populate_activities_data(weekly_data, activities)
    _populate_sessions_data(weekly_data, sessions)
    
    # Analyze trends
    weeks = sorted(weekly_data.keys())
    trend_analysis = _generate_trend_analysis(weekly_data, weeks)
    
    return {
        "weekly_breakdown": weekly_data,
        "trend_analysis": trend_analysis,
        "weeks_analyzed": len(weeks)
    }

# =============================================================================
# ANALYTICS ENDPOINTS
# =============================================================================

@router.get("/analytics/platform")
async def get_platform_analytics(
    days: int = Query(default=30, ge=1, le=365),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get platform-wide analytics (Admin only)
    
    Returns comprehensive analytics across all users and children.
    """
    try:
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=days)
        
        # User growth analytics
        total_users = db.query(User).count()
        new_users = db.query(User).filter(User.created_at >= start_date).count()
        active_users = db.query(User).filter(
            and_(
                User.is_active == True,
                User.last_login_at >= start_date
            )
        ).count()
        
        # Children analytics
        total_children = db.query(Child).filter(Child.is_active == True).count()
        new_children = db.query(Child).filter(Child.created_at >= start_date).count()
        
        # Activity analytics
        total_activities = db.query(Activity).filter(
            Activity.completed_at >= start_date
        ).count()
        
        verified_activities = db.query(Activity).filter(
            and_(
                Activity.completed_at >= start_date,
                Activity.verified_by_parent == True
            )
        ).count()
        
        # Session analytics
        total_sessions = db.query(GameSession).filter(
            GameSession.started_at >= start_date
        ).count()
        
        completed_sessions = db.query(GameSession).filter(
            and_(
                GameSession.started_at >= start_date,
                GameSession.completion_status == "completed"
            )
        ).count()
        
        # Top performing children
        top_children = db.query(Child).filter(
            Child.is_active == True
        ).order_by(desc(Child.points)).limit(10).all()
        
        top_children_data = [
            {
                "id": child.id,
                "name": child.name,
                "age": child.age,
                "points": child.points,
                "level": child.level,
                "support_level": child.support_level
            }
            for child in top_children
        ]
        
        # Activity type distribution
        activity_distribution = db.query(
            Activity.activity_type,
            func.count(Activity.id).label('count')
        ).filter(
            Activity.completed_at >= start_date
        ).group_by(Activity.activity_type).all()
        
        activity_dist_dict = {
            activity_type: count 
            for activity_type, count in activity_distribution
        }
        
        return {
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "days": days
            },
            "user_analytics": {
                "total_users": total_users,
                "new_users": new_users,
                "active_users": active_users,
                "user_growth_rate": (new_users / total_users * 100) if total_users > 0 else 0
            },
            "children_analytics": {
                "total_children": total_children,
                "new_children": new_children,
                "avg_children_per_parent": round(total_children / max(1, db.query(User).filter(User.role == UserRole.PARENT).count()), 2)
            },
            "activity_analytics": {
                "total_activities": total_activities,
                "verified_activities": verified_activities,
                "verification_rate": (verified_activities / total_activities * 100) if total_activities > 0 else 0,
                "activity_distribution": activity_dist_dict            },
            "session_analytics": {
                "total_sessions": total_sessions,
                "completed_sessions": completed_sessions,
                "completion_rate": (completed_sessions / total_sessions * 100) if total_sessions > 0 else 0
            },
            "top_performers": top_children_data,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate platform analytics"
        )

# =============================================================================
# EXPORT ENDPOINTS
# =============================================================================

def _validate_child_access(child_id: int, current_user: User, db: Session):
    """Helper function to validate child access permissions"""
    child = crud.get_child_by_id(db, child_id=child_id)
    if not child:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child not found"
        )
    
    if current_user.role == UserRole.PARENT and child.parent_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this child's data"
        )
    
    return child

def _prepare_export_data(child: Child, activities: List[Activity], sessions: List[GameSession], 
                         current_user: User, format: str, include_sensitive: bool):
    """Helper function to prepare export data"""
    export_data = {
        "child_info": {
            "id": child.id,
            "name": child.name,
            "age": child.age,
            "points": child.points,
            "level": child.level,
            "created_at": child.created_at.isoformat()
        },
        "activities": [
            {
                "id": activity.id,
                "type": activity.activity_type,
                "name": activity.activity_name,
                "description": activity.description,
                "points_earned": activity.points_earned,
                "completed_at": activity.completed_at.isoformat(),
                "verified": activity.verified_by_parent
            }
            for activity in activities
        ],
        "game_sessions": [
            {
                "id": session.id,
                "type": session.session_type,
                "scenario": session.scenario_name,
                "started_at": session.started_at.isoformat(),
                "ended_at": session.ended_at.isoformat() if session.ended_at else None,
                "duration_minutes": round(session.duration_seconds / 60, 2) if session.duration_seconds else None,
                "score": session.score,
                "completed": session.completion_status == "completed"
            }
            for session in sessions
        ],
        "export_info": {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "generated_by": current_user.email,
            "format": format,
            "includes_sensitive_data": include_sensitive
        }
    }
    
    # Add sensitive data if applicable
    if include_sensitive and (current_user.role in [UserRole.PARENT, UserRole.PROFESSIONAL, UserRole.ADMIN]):
        export_data["child_info"].update({
            "diagnosis": child.diagnosis,
            "support_level": child.support_level,
            "sensory_profile": child.sensory_profile,
            "behavioral_notes": child.behavioral_notes
        })
        
        # Add emotional data to activities
        for i, activity in enumerate(activities):
            if activity.emotional_state_before or activity.emotional_state_after:
                export_data["activities"][i].update({
                    "emotional_state_before": activity.emotional_state_before,
                    "emotional_state_after": activity.emotional_state_after,
                    "difficulty_level": activity.difficulty_level,
                    "support_needed": activity.support_needed
                })
    
    return export_data

def _generate_json_response(export_data, child_id):
    """Helper function to generate JSON response"""
    from fastapi.responses import JSONResponse
    return JSONResponse(
        content=export_data,
        headers={
            "Content-Disposition": f"attachment; filename=child_{child_id}_data.json"
        }
    )

def _generate_csv_response(activities, child_id, include_sensitive):
    """Helper function to generate CSV response"""
    import csv
    import io
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write headers
    headers = ["Date", "Activity Type", "Activity Name", "Points", "Verified"]
    if include_sensitive:
        headers.extend(["Emotional Before", "Emotional After", "Difficulty", "Support Needed"])
    writer.writerow(headers)
    
    # Write activity data
    for activity in activities:
        row = [
            activity.completed_at.date().isoformat(),
            activity.activity_type,
            activity.activity_name,
            activity.points_earned,
            "Yes" if activity.verified_by_parent else "No"
        ]
        
        if include_sensitive:
            row.extend([
                activity.emotional_state_before or "",
                activity.emotional_state_after or "",
                activity.difficulty_level or "",
                activity.support_needed or ""
            ])
        
        writer.writerow(row)
    
    from fastapi.responses import Response
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=child_{child_id}_activities.csv"
        }
    )

@router.get("/export/child/{child_id}")
async def export_child_data(
    child_id: int,
    format: str = Query(default="json", regex="^(json|csv)$"),
    include_sensitive: bool = Query(default=False),
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Export child data in specified format
    
    Exports comprehensive child data including activities, sessions, and progress.
    Sensitive data (ASD-specific information) is only included if explicitly requested.
    """
    try:
        # Validate child access permissions
        child = _validate_child_access(child_id, current_user, db)
        
        # Get child data
        activities = crud.get_activities_by_child(db, child_id, limit=1000)
        sessions = crud.get_game_sessions_by_child(db, child_id, limit=1000)
        
        # Prepare export data
        export_data = _prepare_export_data(
            child, activities, sessions, current_user, format, include_sensitive
        )
          # Generate response in requested format
        if format == "json":
            return _generate_json_response(export_data, child_id)
        elif format == "csv":
            return _generate_csv_response(activities, child_id, include_sensitive)
        
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to export child data"
        )