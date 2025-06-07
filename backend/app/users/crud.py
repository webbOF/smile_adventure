"""
CRUD operations for users and children - FIXED VERSION
Eliminati import problematici e dipendenze non risolte
"""

from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from sqlalchemy.exc import IntegrityError

# Import corretti usando auth models
from app.auth.models import User
from app.users.models import Child, Activity, GameSession
from app.auth.utils import get_password_hash, verify_password

# =============================================================================
# USER CRUD OPERATIONS (usando auth.models.User)
# =============================================================================

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user by email address"""
    try:
        return db.query(User).filter(User.email == email.lower()).first()
    except Exception:
        return None

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Get user by ID"""
    try:
        return db.query(User).filter(User.id == user_id).first()
    except Exception:
        return None

def get_active_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    """Get list of active users"""
    try:
        return db.query(User).filter(
            User.is_active == True
        ).offset(skip).limit(limit).all()
    except Exception:
        return []

def update_user_profile(
    db: Session, 
    user_id: int, 
    update_data: Dict[str, Any]
) -> Optional[User]:
    """Update user profile information"""
    try:
        user = get_user_by_id(db, user_id)
        if not user:
            return None
        
        # Allowed fields for update
        allowed_fields = [
            'first_name', 'last_name', 'phone', 'timezone', 'language',
            'license_number', 'specialization', 'clinic_name', 'clinic_address',
            'bio', 'avatar_url'
        ]
        
        for field, value in update_data.items():
            if field in allowed_fields and hasattr(user, field):
                setattr(user, field, value)
        
        # Update full_name if first_name or last_name changed
        if 'first_name' in update_data or 'last_name' in update_data:
            user.full_name = f"{user.first_name} {user.last_name}"
        
        user.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(user)
        return user
        
    except Exception:
        db.rollback()
        return None

# =============================================================================
# CHILD CRUD OPERATIONS
# =============================================================================

def get_children_by_parent(db: Session, parent_id: int) -> List[Child]:
    """Get all active children for a parent"""
    try:
        return db.query(Child).filter(
            and_(
                Child.parent_id == parent_id,
                Child.is_active == True
            )
        ).order_by(Child.created_at.desc()).all()
    except Exception:
        return []

def get_child_by_id(db: Session, child_id: int) -> Optional[Child]:
    """Get child by ID"""
    try:
        return db.query(Child).filter(Child.id == child_id).first()
    except Exception:
        return None

def create_child(
    db: Session, 
    name: str, 
    age: int, 
    parent_id: int,
    avatar_url: Optional[str] = None,
    diagnosis: Optional[str] = None,
    support_level: Optional[int] = None,
    sensory_profile: Optional[Dict] = None,
    behavioral_notes: Optional[str] = None
) -> Optional[Child]:
    """Create new child profile"""
    try:
        # Verify parent exists
        parent = get_user_by_id(db, parent_id)
        if not parent:
            return None
        
        child = Child(
            name=name,
            age=age,
            parent_id=parent_id,
            avatar_url=avatar_url,
            diagnosis=diagnosis,
            support_level=support_level,
            sensory_profile=sensory_profile,
            behavioral_notes=behavioral_notes,
            points=0,
            level=1,
            is_active=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        db.add(child)
        db.commit()
        db.refresh(child)
        return child
        
    except IntegrityError:
        db.rollback()
        return None
    except Exception:
        db.rollback()
        return None

def update_child(
    db: Session, 
    child_id: int, 
    update_data: Dict[str, Any]
) -> Optional[Child]:
    """Update child information"""
    try:
        child = get_child_by_id(db, child_id)
        if not child:
            return None
        
        # Allowed fields for update
        allowed_fields = [
            'name', 'age', 'avatar_url', 'diagnosis', 'support_level',
            'sensory_profile', 'behavioral_notes'
        ]
        
        for field, value in update_data.items():
            if field in allowed_fields and hasattr(child, field):
                setattr(child, field, value)
        
        child.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(child)
        return child
        
    except Exception:
        db.rollback()
        return None

def update_child_points(
    db: Session, 
    child_id: int, 
    points_to_add: int
) -> Optional[Child]:
    """Update child's points and recalculate level"""
    try:
        child = get_child_by_id(db, child_id)
        if not child:
            return None
        
        child.add_points(points_to_add)
        child.updated_at = datetime.now(timezone.utc)
        
        db.commit()
        db.refresh(child)
        return child
        
    except Exception:
        db.rollback()
        return None

def deactivate_child(db: Session, child_id: int) -> bool:
    """Deactivate child (soft delete)"""
    try:
        child = get_child_by_id(db, child_id)
        if not child:
            return False
        
        child.is_active = False
        child.updated_at = datetime.now(timezone.utc)
        
        db.commit()
        return True
        
    except Exception:
        db.rollback()
        return False

# =============================================================================
# ACTIVITY CRUD OPERATIONS
# =============================================================================

def create_activity(
    db: Session,
    child_id: int,
    activity_type: str,
    activity_name: str,
    description: Optional[str] = None,
    points_earned: int = 0,
    emotional_state_before: Optional[str] = None,
    emotional_state_after: Optional[str] = None,
    difficulty_level: Optional[int] = None,
    support_needed: Optional[str] = None
) -> Optional[Activity]:
    """Create new activity record"""
    try:
        # Verify child exists
        child = get_child_by_id(db, child_id)
        if not child:
            return None
        
        activity = Activity(
            child_id=child_id,
            activity_type=activity_type,
            activity_name=activity_name,
            description=description,
            points_earned=points_earned,
            emotional_state_before=emotional_state_before,
            emotional_state_after=emotional_state_after,
            difficulty_level=difficulty_level,
            support_needed=support_needed,
            completed_at=datetime.now(timezone.utc),
            verified_by_parent=False
        )
        
        db.add(activity)
        db.commit()
        db.refresh(activity)
        
        # Update child's points if points were earned
        if points_earned > 0:
            update_child_points(db, child_id, points_earned)
        
        return activity
        
    except IntegrityError:
        db.rollback()
        return None
    except Exception:
        db.rollback()
        return None

def get_activities_by_child(
    db: Session, 
    child_id: int, 
    limit: int = 50,
    activity_type: Optional[str] = None
) -> List[Activity]:
    """Get recent activities for a child"""
    try:
        query = db.query(Activity).filter(Activity.child_id == child_id)
        
        if activity_type:
            query = query.filter(Activity.activity_type == activity_type)
        
        return query.order_by(desc(Activity.completed_at)).limit(limit).all()
        
    except Exception:
        return []

def get_activity_by_id(db: Session, activity_id: int) -> Optional[Activity]:
    """Get activity by ID"""
    try:
        return db.query(Activity).filter(Activity.id == activity_id).first()
    except Exception:
        return None

def verify_activity(db: Session, activity_id: int, verified: bool = True) -> Optional[Activity]:
    """Mark activity as verified by parent"""
    try:
        activity = get_activity_by_id(db, activity_id)
        if not activity:
            return None
        
        activity.verified_by_parent = verified
        db.commit()
        db.refresh(activity)
        return activity
        
    except Exception:
        db.rollback()
        return None

def get_child_activity_stats(
    db: Session, 
    child_id: int, 
    days: int = 30
) -> Dict[str, Any]:
    """Get activity statistics for a child over specified days"""
    try:
        from datetime import timedelta
        start_date = datetime.now(timezone.utc) - timedelta(days=days)
        
        activities = db.query(Activity).filter(
            and_(
                Activity.child_id == child_id,
                Activity.completed_at >= start_date
            )
        ).all()
        
        # Calculate statistics
        total_activities = len(activities)
        total_points = sum(activity.points_earned for activity in activities)
        
        # Group by activity type
        activity_types = {}
        for activity in activities:
            activity_type = activity.activity_type
            if activity_type not in activity_types:
                activity_types[activity_type] = {
                    'count': 0,
                    'total_points': 0,
                    'avg_difficulty': 0
                }
            activity_types[activity_type]['count'] += 1
            activity_types[activity_type]['total_points'] += activity.points_earned
            if activity.difficulty_level:
                activity_types[activity_type]['avg_difficulty'] += activity.difficulty_level
        
        # Calculate averages
        for activity_type in activity_types:
            count = activity_types[activity_type]['count']
            if count > 0:
                activity_types[activity_type]['avg_difficulty'] /= count
        
        return {
            'period_days': days,
            'total_activities': total_activities,
            'total_points': total_points,
            'activity_types': activity_types,
            'verified_activities': len([a for a in activities if a.verified_by_parent])
        }
        
    except Exception:
        return {}

# =============================================================================
# GAME SESSION CRUD OPERATIONS
# =============================================================================

def create_game_session(
    db: Session,
    child_id: int,
    session_type: str,
    scenario_name: str
) -> Optional[GameSession]:
    """Create new game session"""
    try:
        # Verify child exists
        child = get_child_by_id(db, child_id)
        if not child:
            return None
        
        session = GameSession(
            child_id=child_id,
            session_type=session_type,
            scenario_name=scenario_name,
            started_at=datetime.now(timezone.utc),
            levels_completed=0,
            score=0,
            interactions_count=0,
            completion_status="in_progress"
        )
        
        db.add(session)
        db.commit()
        db.refresh(session)
        return session
        
    except IntegrityError:
        db.rollback()
        return None
    except Exception:
        db.rollback()
        return None

def get_game_session_by_id(db: Session, session_id: int) -> Optional[GameSession]:
    """Get game session by ID"""
    try:
        return db.query(GameSession).filter(GameSession.id == session_id).first()
    except Exception:
        return None

def update_game_session(
    db: Session,
    session_id: int,
    update_data: Dict[str, Any]
) -> Optional[GameSession]:
    """Update game session data"""
    try:
        session = get_game_session_by_id(db, session_id)
        if not session:
            return None
        
        # Allowed fields for update
        allowed_fields = [
            'levels_completed', 'score', 'interactions_count',
            'emotional_data', 'interaction_data', 'parent_notes', 'parent_rating'
        ]
        
        for field, value in update_data.items():
            if field in allowed_fields and hasattr(session, field):
                setattr(session, field, value)
        
        db.commit()
        db.refresh(session)
        return session
        
    except Exception:
        db.rollback()
        return None

def complete_game_session(
    db: Session,
    session_id: int,
    final_score: Optional[int] = None,
    emotional_data: Optional[Dict] = None,
    interaction_data: Optional[Dict] = None
) -> Optional[GameSession]:
    """Mark game session as completed"""
    try:
        session = get_game_session_by_id(db, session_id)
        if not session:
            return None
        
        # Update session data
        if final_score is not None:
            session.score = final_score
        if emotional_data:
            session.emotional_data = emotional_data
        if interaction_data:
            session.interaction_data = interaction_data
        
        # Mark as completed
        session.mark_completed()
        
        db.commit()
        db.refresh(session)
        return session
        
    except Exception:
        db.rollback()
        return None

def get_game_sessions_by_child(
    db: Session,
    child_id: int,
    limit: int = 20,
    session_type: Optional[str] = None
) -> List[GameSession]:
    """Get game sessions for a child"""
    try:
        query = db.query(GameSession).filter(GameSession.child_id == child_id)
        
        if session_type:
            query = query.filter(GameSession.session_type == session_type)
        
        return query.order_by(desc(GameSession.started_at)).limit(limit).all()
        
    except Exception:
        return []

def get_child_game_stats(
    db: Session,
    child_id: int,
    days: int = 30
) -> Dict[str, Any]:
    """Get game session statistics for a child"""
    try:
        from datetime import timedelta
        start_date = datetime.now(timezone.utc) - timedelta(days=days)
        
        sessions = db.query(GameSession).filter(
            and_(
                GameSession.child_id == child_id,
                GameSession.started_at >= start_date
            )
        ).all()
        
        # Calculate statistics
        total_sessions = len(sessions)
        completed_sessions = len([s for s in sessions if s.completion_status == "completed"])
        total_score = sum(s.score for s in sessions if s.score)
        total_duration = sum(s.duration_seconds or 0 for s in sessions)
        
        # Average calculations
        avg_score = total_score / completed_sessions if completed_sessions > 0 else 0
        avg_duration = total_duration / completed_sessions if completed_sessions > 0 else 0
        completion_rate = (completed_sessions / total_sessions * 100) if total_sessions > 0 else 0
        
        return {
            'period_days': days,
            'total_sessions': total_sessions,
            'completed_sessions': completed_sessions,
            'completion_rate': round(completion_rate, 2),
            'total_score': total_score,
            'average_score': round(avg_score, 2),
            'total_duration_minutes': round(total_duration / 60, 2),
            'average_duration_minutes': round(avg_duration / 60, 2)
        }
        
    except Exception:
        return {}

# =============================================================================
# SEARCH AND FILTER UTILITIES
# =============================================================================

def search_children(
    db: Session,
    parent_id: int,
    search_term: Optional[str] = None,
    age_min: Optional[int] = None,
    age_max: Optional[int] = None,
    support_level: Optional[int] = None
) -> List[Child]:
    """Search children with filters"""
    try:
        query = db.query(Child).filter(
            and_(
                Child.parent_id == parent_id,
                Child.is_active == True
            )
        )
        
        if search_term:
            query = query.filter(Child.name.ilike(f"%{search_term}%"))
        
        if age_min is not None:
            query = query.filter(Child.age >= age_min)
        
        if age_max is not None:
            query = query.filter(Child.age <= age_max)
        
        if support_level is not None:
            query = query.filter(Child.support_level == support_level)
        
        return query.order_by(Child.name).all()
        
    except Exception:
        return []

def get_child_progress_summary(
    db: Session,
    child_id: int
) -> Dict[str, Any]:
    """Get comprehensive progress summary for a child"""
    try:
        child = get_child_by_id(db, child_id)
        if not child:
            return {}
        
        # Get activity stats (last 30 days)
        activity_stats = get_child_activity_stats(db, child_id, days=30)
        
        # Get game stats (last 30 days)
        game_stats = get_child_game_stats(db, child_id, days=30)
        
        # Recent activities (last 10)
        recent_activities = get_activities_by_child(db, child_id, limit=10)
        
        # Recent game sessions (last 5)
        recent_sessions = get_game_sessions_by_child(db, child_id, limit=5)
        
        return {
            'child': {
                'id': child.id,
                'name': child.name,
                'age': child.age,
                'current_level': child.level,
                'total_points': child.points,
                'support_level': child.support_level,
                'diagnosis': child.diagnosis
            },
            'activity_stats': activity_stats,
            'game_stats': game_stats,
            'recent_activities': len(recent_activities),
            'recent_sessions': len(recent_sessions),
            'last_activity': recent_activities[0].completed_at.isoformat() if recent_activities else None,
            'last_session': recent_sessions[0].started_at.isoformat() if recent_sessions else None
        }
        
    except Exception:
        return {}

# =============================================================================
# BULK OPERATIONS
# =============================================================================

def bulk_verify_activities(
    db: Session,
    activity_ids: List[int],
    verified: bool = True
) -> int:
    """Bulk verify multiple activities"""
    try:
        updated_count = db.query(Activity).filter(
            Activity.id.in_(activity_ids)
        ).update(
            {Activity.verified_by_parent: verified},
            synchronize_session=False
        )
        
        db.commit()
        return updated_count
        
    except Exception:
        db.rollback()
        return 0

def get_family_stats(db: Session, parent_id: int) -> Dict[str, Any]:
    """Get comprehensive statistics for a family (all children)"""
    try:
        children = get_children_by_parent(db, parent_id)
        
        if not children:
            return {
                'total_children': 0,
                'total_points': 0,
                'total_activities': 0,
                'total_sessions': 0
            }
        
        child_ids = [child.id for child in children]
        
        # Get total activities across all children
        total_activities = db.query(Activity).filter(
            Activity.child_id.in_(child_ids)
        ).count()
        
        # Get total game sessions across all children
        total_sessions = db.query(GameSession).filter(
            GameSession.child_id.in_(child_ids)
        ).count()
        
        # Sum all points
        total_points = sum(child.points for child in children)
        
        # Get children summaries
        children_summaries = []
        for child in children:
            child_summary = {
                'id': child.id,
                'name': child.name,
                'age': child.age,
                'level': child.level,
                'points': child.points,
                'activities_count': db.query(Activity).filter(Activity.child_id == child.id).count(),
                'sessions_count': db.query(GameSession).filter(GameSession.child_id == child.id).count()
            }
            children_summaries.append(child_summary)
        
        return {
            'total_children': len(children),
            'total_points': total_points,
            'total_activities': total_activities,
            'total_sessions': total_sessions,
            'children': children_summaries
        }
        
    except Exception:
        return {}