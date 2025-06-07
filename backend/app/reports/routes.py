"""
Reports and analytics routes
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from typing import Dict, List
from app.core.database import get_db
from app.auth.routes import get_current_user
from app.users.models import User, Child, Activity
from app.users import crud

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get dashboard statistics for current user
    """
    # Get user's children
    children = crud.get_children_by_parent(db, parent_id=current_user.id)
    
    if not children:
        return {
            "total_children": 0,
            "total_activities": 0,
            "total_points": 0,
            "children_stats": []
        }
    
    # Calculate statistics
    child_ids = [child.id for child in children]
      # Total activities this week
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    total_activities = db.query(Activity).filter(
        Activity.child_id.in_(child_ids),
        Activity.completed_at >= week_ago
    ).count()
    
    # Total points across all children
    total_points = sum(child.points for child in children)
    
    # Individual child statistics
    children_stats = []
    for child in children:
        recent_activities = db.query(Activity).filter(
            Activity.child_id == child.id,
            Activity.completed_at >= week_ago
        ).count()
        
        children_stats.append({
            "child_id": child.id,
            "name": child.name,
            "points": child.points,
            "level": child.level,
            "activities_this_week": recent_activities
        })
    
    return {
        "total_children": len(children),
        "total_activities": total_activities,
        "total_points": total_points,
        "children_stats": children_stats
    }

@router.get("/child/{child_id}/progress")
async def get_child_progress(
    child_id: int,
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get progress report for a specific child
    """
    # Verify child belongs to current user
    child = crud.get_child_by_id(db, child_id=child_id)
    if not child or child.parent_id != current_user.id:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child not found"
        )
      # Get activities for the specified period
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    activities = db.query(Activity).filter(
        Activity.child_id == child_id,
        Activity.completed_at >= start_date
    ).order_by(Activity.completed_at.desc()).all()
    
    # Group activities by type
    activity_types = {}
    daily_points = {}
    
    for activity in activities:
        # Count by type
        if activity.activity_type not in activity_types:
            activity_types[activity.activity_type] = 0
        activity_types[activity.activity_type] += 1
        
        # Points by day
        day_key = activity.completed_at.date().isoformat()
        if day_key not in daily_points:
            daily_points[day_key] = 0
        daily_points[day_key] += activity.points_earned
    
    return {
        "child": {
            "id": child.id,
            "name": child.name,
            "current_points": child.points,
            "current_level": child.level
        },
        "period_days": days,
        "total_activities": len(activities),
        "activity_types": activity_types,
        "daily_points": daily_points,
        "recent_activities": [
            {
                "id": activity.id,
                "type": activity.activity_type,
                "description": activity.description,
                "points": activity.points_earned,
                "completed_at": activity.completed_at.isoformat()
            }
            for activity in activities[:10]  # Last 10 activities
        ]
    }
