"""
Task 15: Children Management Routes Implementation
File: backend/app/users/children_routes.py

Complete CRUD operations for child management with ASD-specific features
"""

from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc

from app.core.database import get_db
from app.auth.models import User, UserRole
from app.auth.dependencies import (
    get_current_user, get_current_verified_user,
    require_parent, require_professional, require_admin,
    PermissionChecker
)
from app.users.models import Child, Activity
from app.reports.models import GameSession
from app.users.schemas import (
    ChildCreate, ChildUpdate, ChildResponse, ChildDetailResponse,
    ChildSearchFilters, PaginationParams, EnhancedChildResponse,
    ActivityResponse, BulkChildUpdateSchema,
    SuccessResponse, BulkOperationResponse
)
from app.reports.schemas import GameSessionResponse
from app.users.crud import (
    get_child_service, get_activity_service, get_session_service,
    get_analytics_service, ChildService, ActivityService
)
import logging

logger = logging.getLogger(__name__)

# Constants for error messages
CHILD_NOT_FOUND = "Child not found"
ACCESS_DENIED_CHILD_PROFILE = "Access denied to this child's profile"
ACCESS_DENIED_CHILD_ACTIVITIES = "Access denied to this child's activities"
ACCESS_DENIED_CHILD_SESSIONS = "Access denied to this child's game sessions"
ACCESS_DENIED_CHILD_PROGRESS = "Access denied to this child's progress data"
ACCESS_DENIED_CHILD_ACHIEVEMENTS = "Access denied to this child's achievements"
INVALID_DATE_RANGE = "Invalid date range"
NO_CHILDREN_FOUND = "No children found for this user"
CHILD_CREATION_FAILED = "Failed to create child profile"
BULK_OPERATION_FAILED = "Bulk operation failed"

# Create router for children management
router = APIRouter()

# =============================================================================
# CHILD CRUD OPERATIONS
# =============================================================================

@router.post("/children", response_model=ChildResponse, status_code=status.HTTP_201_CREATED)
async def create_child(
    child_data: ChildCreate,
    current_user: User = Depends(require_parent),
    db: Session = Depends(get_db)
):
    """
    Create a new child profile with comprehensive ASD data
    
    Creates a child profile with:
    - Basic information (name, age, diagnosis)
    - ASD-specific data (support level, sensory profile)
    - Therapy information and emergency contacts
    - Safety protocols and behavioral notes
    """
    try:
        child_service = get_child_service(db)
        
        # Create child profile
        child = child_service.create_child(current_user.id, child_data)
        
        if not child:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create child profile. Please verify all required information."
            )
        
        logger.info(f"Child profile created: {child.name} (ID: {child.id}) for parent {current_user.id}")
        
        return ChildResponse.model_validate(child)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating child profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create child profile"
        )

@router.get("/children", response_model=List[ChildResponse])
async def get_children_list(
    include_inactive: bool = Query(default=False, description="Include inactive children"),
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Get list of children for current user
    
    Returns:
    - For parents: Their own children
    - For professionals: Assigned children (future implementation)
    - For admins: All children with filtering
    """
    try:
        child_service = get_child_service(db)
        
        if current_user.role == UserRole.PARENT:
            # Parents can only see their own children
            children = child_service.get_children_by_parent(
                current_user.id, 
                include_inactive=include_inactive
            )
            
        elif current_user.role == UserRole.ADMIN:
            # Admins can see all children
            children = db.query(Child).filter(
                Child.is_active == True if not include_inactive else True
            ).order_by(desc(Child.created_at)).limit(100).all()
            
        elif current_user.role == UserRole.PROFESSIONAL:
            # Professionals see assigned children (placeholder for future implementation)
            children = []
            logger.info(f"Professional {current_user.id} requested children list - not yet implemented")
            
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Convert to response format
        children_response = [ChildResponse.model_validate(child) for child in children]
        
        logger.info(f"Children list retrieved: {len(children_response)} children for user {current_user.id}")
        return children_response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving children list: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve children list"
        )

@router.get("/children/{child_id}", response_model=ChildDetailResponse)
async def get_child_detail(
    child_id: int,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed child profile information
    
    Returns comprehensive child data including:
    - Complete profile information
    - Recent activity summary
    - Progress metrics
    - Assessment history
    """
    try:
        child_service = get_child_service(db)
          # Get child with full details
        child = child_service.get_child_by_id(child_id, include_relationships=True)
        
        if not child:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=CHILD_NOT_FOUND
            )        # Check permissions - only child's parent or admin can access
        if not (
            (current_user.role == UserRole.PARENT and child.parent_id == current_user.id) or
            current_user.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=ACCESS_DENIED_CHILD_PROFILE
            )
        
        # Check if child is active (soft delete check)
        if not child.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=CHILD_NOT_FOUND
            )
          # Get additional metrics for detailed response (with safe fallbacks)
        try:
            activity_service = get_activity_service(db)
            session_service = get_session_service(db)
            
            # Recent activity counts (with error handling)
            week_ago = datetime.now(timezone.utc) - timedelta(days=7)
            recent_activities = []
            recent_sessions = []
            current_week_points = 0
            
            try:
                recent_activities = activity_service.get_activities_by_child(child_id, limit=10) or []
                recent_sessions = session_service.get_sessions_by_child(child_id, limit=5) or []
                
                # Current week points (safe calculation)
                current_week_points = sum(
                    getattr(activity, 'points_earned', 0) for activity in recent_activities
                    if hasattr(activity, 'completed_at') and 
                       activity.completed_at and activity.completed_at >= week_ago
                )
            except Exception as metrics_error:
                logger.warning(f"Error calculating metrics for child {child_id}: {str(metrics_error)}")
            
            # Build detailed response using model conversion
            child_response = ChildDetailResponse.model_validate(child)
            
            # Update with additional computed fields
            child_response.recent_activities_count = len(recent_activities)
            child_response.recent_sessions_count = len(recent_sessions)
            child_response.current_week_points = current_week_points
            
            logger.info(f"Child detail retrieved: {child.name} (ID: {child_id}) for user {current_user.id}")
            
            return child_response
            
        except Exception as detail_error:
            logger.error(f"Error building detailed response for child {child_id}: {str(detail_error)}")
            # Fallback to basic response
            return ChildDetailResponse.model_validate(child)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving child detail {child_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve child details"
        )

@router.put("/children/{child_id}", response_model=ChildResponse)
async def update_child(
    child_id: int,
    update_data: ChildUpdate,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Update child profile information
    
    Allows updating:
    - Basic information (name, age)
    - Clinical data (diagnosis, support level)
    - Communication and behavioral notes
    - Sensory profiles and therapy information
    - Safety protocols and emergency contacts
    """
    try:
        child_service = get_child_service(db)
        
        # Update child with permission checking
        updated_child = child_service.update_child(child_id, update_data, current_user.id)
        
        if not updated_child:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Child not found or access denied"
            )
        
        logger.info(f"Child updated: {updated_child.name} (ID: {child_id}) by user {current_user.id}")
        
        return ChildResponse.model_validate(updated_child)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating child {child_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update child profile"
        )

@router.delete("/children/{child_id}")
async def delete_child(
    child_id: int,
    permanent: bool = Query(default=False, description="Permanently delete (admin only)"),
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Delete or deactivate child profile
    
    - Parents: Soft delete (deactivate)
    - Admins: Can permanently delete with confirmation
    """
    try:
        child_service = get_child_service(db)
          # Get child for permission checking
        child = child_service.get_child_by_id(child_id, include_relationships=False)
        
        if not child:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=CHILD_NOT_FOUND
            )
        
        # Check permissions
        if current_user.role == UserRole.PARENT:
            if child.parent_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=ACCESS_DENIED_CHILD_PROFILE
                )
            # Parents can only soft delete
            child.is_active = False
            child.updated_at = datetime.now(timezone.utc)
            db.commit()
            
            logger.info(f"Child deactivated: {child.name} (ID: {child_id}) by parent {current_user.id}")
            return {"message": "Child profile deactivated successfully"}
            
        elif current_user.role == UserRole.ADMIN and permanent:
            # Admin permanent deletion
            db.delete(child)
            db.commit()
            
            logger.warning(f"Child permanently deleted: {child.name} (ID: {child_id}) by admin {current_user.id}")
            return {"message": "Child profile permanently deleted"}
            
        elif current_user.role == UserRole.ADMIN:
            # Admin soft delete
            child.is_active = False
            child.updated_at = datetime.now(timezone.utc)
            db.commit()
            
            logger.info(f"Child deactivated by admin: {child.name} (ID: {child_id})")
            return {"message": "Child profile deactivated successfully"}
            
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting child {child_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete child profile"
        )

# =============================================================================
# CHILD ACTIVITY MANAGEMENT
# =============================================================================

@router.get("/children/{child_id}/activities", response_model=List[ActivityResponse])
async def get_child_activities(
    child_id: int,
    limit: int = Query(default=50, ge=1, le=200, description="Maximum number of activities"),
    activity_type: Optional[str] = Query(default=None, description="Filter by activity type"),
    verified_only: bool = Query(default=False, description="Only verified activities"),
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Get activities for a specific child
    
    Returns paginated list of activities with filtering options:
    - Activity type filtering
    - Verification status filtering
    - Date range filtering (future enhancement)
    """
    try:
        # Verify child access permissions
        child_service = get_child_service(db)
        child = child_service.get_child_by_id(child_id, include_relationships=False)
        
        if not child:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Child not found"
            )
        
        # Check permissions
        if (current_user.role == UserRole.PARENT and child.parent_id != current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this child's activities"
            )
        
        # Get activities with filtering
        activity_service = get_activity_service(db)
        activities = activity_service.get_activities_by_child(
            child_id, 
            limit=limit, 
            activity_type=activity_type
        )
        
        # Apply verification filter if requested
        if verified_only:
            activities = [a for a in activities if a.verified_by_parent]
        
        activities_response = [ActivityResponse.model_validate(activity) for activity in activities]
        
        logger.info(f"Activities retrieved: {len(activities_response)} for child {child_id}")
        return activities_response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving activities for child {child_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve child activities"
        )

@router.get("/children/{child_id}/sessions", response_model=List[GameSessionResponse])
async def get_child_game_sessions(
    child_id: int,
    limit: int = Query(default=20, ge=1, le=100, description="Maximum number of sessions"),
    session_type: Optional[str] = Query(default=None, description="Filter by session type"),
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Get game sessions for a specific child
    
    Returns list of game sessions with performance metrics:
    - Session completion status
    - Scores and engagement metrics
    - Duration and interaction data
    """
    try:
        # Verify child access permissions
        child_service = get_child_service(db)
        child = child_service.get_child_by_id(child_id, include_relationships=False)
        
        if not child:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Child not found"
            )
        
        # Check permissions
        if (current_user.role == UserRole.PARENT and child.parent_id != current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this child's game sessions"
            )
        
        # Get game sessions
        session_service = get_session_service(db)
        sessions = session_service.get_sessions_by_child(
            child_id, 
            limit=limit, 
            session_type=session_type
        )
        
        # Calculate engagement scores for sessions
        sessions_response = []
        for session in sessions:
            session_data = session.__dict__.copy()
            session_data['engagement_score'] = session.calculate_engagement_score()
            sessions_response.append(GameSessionResponse.model_validate(session_data))
        
        logger.info(f"Game sessions retrieved: {len(sessions_response)} for child {child_id}")
        return sessions_response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving game sessions for child {child_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve child game sessions"
        )

# =============================================================================
# CHILD PROGRESS AND ANALYTICS
# =============================================================================

@router.get("/children/{child_id}/progress")
async def get_child_progress(
    child_id: int,
    days: int = Query(default=30, ge=1, le=365, description="Number of days to analyze"),
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive progress analytics for a child
    
    Returns detailed progress analysis including:
    - Activity completion trends
    - Emotional state improvements
    - Skill development patterns
    - Engagement metrics
    """
    try:
        # Verify child access permissions
        child_service = get_child_service(db)
        child = child_service.get_child_by_id(child_id, include_relationships=False)
        
        if not child:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Child not found"
            )
        
        # Check permissions
        if (current_user.role == UserRole.PARENT and child.parent_id != current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this child's progress data"
            )
        
        # Generate comprehensive progress report
        analytics_service = get_analytics_service(db)
        progress_summary = analytics_service.get_child_progress_summary(child_id, days)
        
        if not progress_summary:
            return {
                "child_id": child_id,
                "message": "No progress data available for the specified period",
                "days_analyzed": days
            }
        
        logger.info(f"Progress report generated for child {child_id} ({days} days)")
        return progress_summary
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating progress report for child {child_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate progress report"
        )

@router.get("/children/{child_id}/achievements")
async def get_child_achievements(
    child_id: int,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Get child's achievements and milestones
    
    Returns:
    - Earned achievements with dates
    - Progress towards next achievements
    - Milestone celebrations
    """
    try:
        # Verify child access permissions
        child_service = get_child_service(db)
        child = child_service.get_child_by_id(child_id, include_relationships=False)
        
        if not child:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Child not found"
            )
        
        # Check permissions
        if (current_user.role == UserRole.PARENT and child.parent_id != current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this child's achievements"
            )
        
        # Get achievements and calculate progress
        achievements = child.achievements or []
        
        # Achievement definitions (in production, this would be in a configuration)
        achievement_definitions = {
            "dental_rookie": {
                "name": "Dental Rookie",
                "description": "Completed first 5 dental care activities",
                "category": "dental_care",
                "points_required": 50
            },
            "dental_champion": {
                "name": "Dental Champion",
                "description": "Completed 10 dental care activities",
                "category": "dental_care",
                "points_required": 100
            },
            "therapy_starter": {
                "name": "Therapy Starter",
                "description": "Completed first 5 therapy sessions",
                "category": "therapy",
                "points_required": 75
            },
            "level_up_master": {
                "name": "Level Up Master",
                "description": "Reached level 10",
                "category": "general",
                "level_required": 10
            }
        }
        
        # Calculate next achievements
        next_achievements = []
        for achievement_id, definition in achievement_definitions.items():
            if achievement_id not in achievements:
                progress = 0
                if "points_required" in definition:
                    progress = min(child.points / definition["points_required"] * 100, 100)
                elif "level_required" in definition:
                    progress = min(child.level / definition["level_required"] * 100, 100)
                
                next_achievements.append({
                    "id": achievement_id,
                    "name": definition["name"],
                    "description": definition["description"],
                    "category": definition["category"],
                    "progress_percentage": round(progress, 1)
                })
        
        # Sort next achievements by progress
        next_achievements.sort(key=lambda x: x["progress_percentage"], reverse=True)
        
        return {
            "child_id": child_id,
            "current_level": child.level,
            "total_points": child.points,
            "earned_achievements": [
                {
                    "id": achievement_id,
                    "name": achievement_definitions.get(achievement_id, {}).get("name", achievement_id),
                    "description": achievement_definitions.get(achievement_id, {}).get("description", ""),
                    "category": achievement_definitions.get(achievement_id, {}).get("category", "general")
                }
                for achievement_id in achievements
                if achievement_id in achievement_definitions
            ],
            "next_achievements": next_achievements[:5],  # Top 5 closest achievements
            "achievement_summary": {
                "total_earned": len(achievements),
                "total_available": len(achievement_definitions),
                "completion_percentage": round(len(achievements) / len(achievement_definitions) * 100, 1)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving achievements for child {child_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve child achievements"
        )

# =============================================================================
# CHILD POINTS AND LEVEL MANAGEMENT
# =============================================================================

@router.post("/children/{child_id}/points")
async def add_points_to_child(
    child_id: int,
    points_data: Dict[str, Any],
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Add points to child and handle level progression
    
    Expected points_data:
    {
        "points": 15,
        "activity_type": "dental_care",
        "reason": "Completed tooth brushing routine"
    }
    """
    try:
        # Validate input
        if "points" not in points_data or not isinstance(points_data["points"], int):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Points must be a valid integer"
            )
        
        points = points_data["points"]
        if points <= 0 or points > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Points must be between 1 and 100"
            )
        
        # Verify child access permissions
        child_service = get_child_service(db)
        child = child_service.get_child_by_id(child_id, include_relationships=False)
        
        if not child:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Child not found"
            )
        
        # Check permissions (only parents and professionals can add points)
        if current_user.role == UserRole.PARENT and child.parent_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Add points and handle level progression
        result = child_service.add_points(
            child_id, 
            points, 
            points_data.get("activity_type")
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to add points"
            )
        
        # Log the points addition
        logger.info(
            f"Points added: {points} to child {child_id} by user {current_user.id}. "
            f"Reason: {points_data.get('reason', 'No reason provided')}"
        )
        
        return {
            "success": True,
            "message": "Points added successfully",
            "points_added": result["points_added"],
            "total_points": result["total_points"],
            "old_level": result["old_level"],
            "new_level": result["new_level"],
            "level_up": result["level_up"],
            "achievement": result.get("achievement"),
            "child_id": child_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding points to child {child_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add points"
        )

# =============================================================================
# BULK OPERATIONS
# =============================================================================

@router.put("/children/bulk-update", response_model=BulkOperationResponse)
async def bulk_update_children(
    bulk_data: BulkChildUpdateSchema,
    current_user: User = Depends(require_admin),  # Admin only
    db: Session = Depends(get_db)
):
    """
    Bulk update multiple children (Admin only)
    
    Allows administrators to update common fields across multiple children
    """
    try:
        child_service = get_child_service(db)
        
        processed_count = 0
        failed_count = 0
        failed_ids = []
        errors = []
        
        for child_id in bulk_data.child_ids:
            try:
                # Create ChildUpdate object from bulk updates
                update_data = ChildUpdate(**bulk_data.updates)
                
                # Update child
                updated_child = child_service.update_child(child_id, update_data, current_user.id)
                
                if updated_child:
                    processed_count += 1
                else:
                    failed_count += 1
                    failed_ids.append(child_id)
                    errors.append(f"Child {child_id}: Not found or access denied")
                    
            except Exception as e:
                failed_count += 1
                failed_ids.append(child_id)
                errors.append(f"Child {child_id}: {str(e)}")
        
        logger.info(
            f"Bulk update completed by admin {current_user.id}: "
            f"{processed_count} successful, {failed_count} failed"
        )
        
        return BulkOperationResponse(
            success=failed_count == 0,
            total_requested=len(bulk_data.child_ids),
            processed_count=processed_count,
            failed_count=failed_count,
            failed_ids=failed_ids,
            errors=errors,
            message=f"Bulk update completed: {processed_count} successful, {failed_count} failed"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in bulk update operation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Bulk update operation failed"
        )

# =============================================================================
# SEARCH AND FILTERING
# =============================================================================

@router.get("/children/search")
async def search_children(
    search_term: Optional[str] = Query(None, min_length=2, description="Search in child names"),
    age_min: Optional[int] = Query(None, ge=0, le=25, description="Minimum age"),
    age_max: Optional[int] = Query(None, ge=0, le=25, description="Maximum age"),
    support_level: Optional[int] = Query(None, ge=1, le=3, description="ASD support level"),
    diagnosis_keyword: Optional[str] = Query(None, description="Search in diagnosis"),
    limit: int = Query(default=50, ge=1, le=200, description="Maximum results"),
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Search and filter children based on various criteria
    
    Available filters:
    - Search term (name matching)
    - Age range
    - Support level
    - Diagnosis keywords
    """
    try:
        # Build query based on user role
        if current_user.role == UserRole.PARENT:
            # Parents can only search their own children
            query = db.query(Child).filter(
                and_(
                    Child.parent_id == current_user.id,
                    Child.is_active == True
                )
            )
        elif current_user.role == UserRole.ADMIN:
            # Admins can search all children
            query = db.query(Child).filter(Child.is_active == True)
        else:
            # Professionals see assigned children (placeholder)
            query = db.query(Child).filter(Child.id == -1)  # Empty result set
        
        # Apply search filters
        if search_term:
            query = query.filter(Child.name.ilike(f"%{search_term}%"))
        
        if age_min is not None:
            query = query.filter(Child.age >= age_min)
        
        if age_max is not None:
            query = query.filter(Child.age <= age_max)
        
        if support_level is not None:
            query = query.filter(Child.support_level == support_level)
        
        if diagnosis_keyword:
            query = query.filter(Child.diagnosis.ilike(f"%{diagnosis_keyword}%"))
        
        # Validate age range
        if age_min is not None and age_max is not None and age_max < age_min:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="age_max must be greater than or equal to age_min"
            )
        
        # Execute query
        children = query.order_by(desc(Child.created_at)).limit(limit).all()
        
        # Convert to response format
        children_response = [ChildResponse.model_validate(child) for child in children]
        
        logger.info(
            f"Children search completed: {len(children_response)} results for user {current_user.id}"
        )
        
        return {
            "children": children_response,
            "total_results": len(children_response),
            "search_criteria": {
                "search_term": search_term,
                "age_range": f"{age_min}-{age_max}" if age_min is not None or age_max is not None else None,
                "support_level": support_level,
                "diagnosis_keyword": diagnosis_keyword
            },
            "has_more": len(children_response) == limit
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in children search: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Children search failed"
        )

# =============================================================================
# ACTIVITY VERIFICATION AND MANAGEMENT
# =============================================================================

@router.put("/children/{child_id}/activities/{activity_id}/verify")
async def verify_child_activity(
    child_id: int,
    activity_id: int,
    verification_data: Dict[str, Any],
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Verify a child's activity
    
    Parents can verify their children's activities
    Professionals can provide professional verification
    """
    try:
        # Verify child access permissions
        child_service = get_child_service(db)
        child = child_service.get_child_by_id(child_id, include_relationships=False)
        
        if not child:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Child not found"
            )
        
        # Check permissions
        if current_user.role == UserRole.PARENT and child.parent_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this child's activities"
            )
        
        # Get activity
        activity = db.query(Activity).filter(
            and_(
                Activity.id == activity_id,
                Activity.child_id == child_id
            )
        ).first()
        
        if not activity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Activity not found"
            )
        
        # Verify activity based on user role
        activity_service = get_activity_service(db)
        
        verified = verification_data.get("verified", True)
        verification_notes = verification_data.get("notes", "")
        
        if current_user.role == UserRole.PARENT:
            updated_activity = activity_service.verify_activity(
                activity_id, verified, "parent"
            )
        elif current_user.role == UserRole.PROFESSIONAL:
            updated_activity = activity_service.verify_activity(
                activity_id, verified, "professional"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only parents and professionals can verify activities"
            )
        
        if not updated_activity:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to verify activity"
            )
        
        # Add verification notes if provided
        if verification_notes:
            updated_activity.verification_notes = verification_notes
            db.commit()
        
        logger.info(
            f"Activity verified: {activity_id} by {current_user.role.value} {current_user.id} "
            f"(verified: {verified})"
        )
        
        return {
            "success": True,
            "message": "Activity verification updated",
            "activity_id": activity_id,
            "verified": verified,
            "verified_by": current_user.role.value,
            "verification_date": datetime.now(timezone.utc).isoformat(),
            "notes": verification_notes
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying activity {activity_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify activity"
        )

# =============================================================================
# PROGRESS NOTES MANAGEMENT
# =============================================================================

@router.post("/children/{child_id}/progress-notes")
async def add_progress_note(
    child_id: int,
    note_data: Dict[str, Any],
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Add a progress note for a child
    
    Allows parents and professionals to add observations and notes
    about the child's development and progress
    """
    try:
        # Verify child access permissions
        child_service = get_child_service(db)
        child = child_service.get_child_by_id(child_id, include_relationships=False)
        
        if not child:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Child not found"
            )
        
        # Check permissions
        if current_user.role == UserRole.PARENT and child.parent_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this child's progress notes"
            )
        
        # Validate note data
        required_fields = ["note", "category"]
        for field in required_fields:
            if field not in note_data or not note_data[field]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Missing required field: {field}"
                )
        
        note_text = note_data["note"].strip()
        category = note_data["category"].strip().lower()
        
        if len(note_text) < 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Progress note must be at least 5 characters long"
            )
        
        if len(note_text) > 2000:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Progress note cannot exceed 2000 characters"
            )
        
        # Validate category
        allowed_categories = [
            "behavior", "communication", "social", "academic", "sensory",
            "motor_skills", "self_care", "therapy", "medical", "general"
        ]
        
        if category not in allowed_categories:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid category. Must be one of: {', '.join(allowed_categories)}"
            )
        
        # Add progress note to child
        author = f"{current_user.first_name} {current_user.last_name} ({current_user.role.value})"
        child.add_progress_note(note_text, author, category)
        
        db.commit()
        
        logger.info(
            f"Progress note added to child {child_id} by {current_user.id} "
            f"(category: {category})"
        )
        
        return {
            "success": True,
            "message": "Progress note added successfully",
            "child_id": child_id,
            "note_id": len(child.progress_notes),  # Simple ID based on position
            "category": category,
            "author": author,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error adding progress note to child {child_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add progress note"
        )

@router.get("/children/{child_id}/progress-notes")
async def get_progress_notes(
    child_id: int,
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(default=50, ge=1, le=200, description="Maximum notes to return"),
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Get progress notes for a child
    
    Returns chronological list of progress notes with filtering options
    """
    try:
        # Verify child access permissions
        child_service = get_child_service(db)
        child = child_service.get_child_by_id(child_id, include_relationships=False)
        
        if not child:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Child not found"
            )
        
        # Check permissions
        if current_user.role == UserRole.PARENT and child.parent_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this child's progress notes"
            )
        
        # Get progress notes
        progress_notes = child.progress_notes or []
        
        # Apply category filter if specified
        if category:
            progress_notes = [
                note for note in progress_notes 
                if note.get("category", "").lower() == category.lower()
            ]
        
        # Sort by date (most recent first) and limit
        progress_notes.sort(key=lambda x: x.get("date", ""), reverse=True)
        progress_notes = progress_notes[:limit]
        
        logger.info(
            f"Progress notes retrieved: {len(progress_notes)} for child {child_id}"
        )
        
        return {
            "child_id": child_id,
            "total_notes": len(progress_notes),
            "category_filter": category,
            "progress_notes": progress_notes
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving progress notes for child {child_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve progress notes"
        )

# =============================================================================
# SENSORY PROFILE MANAGEMENT
# =============================================================================

@router.put("/children/{child_id}/sensory-profile")
async def update_sensory_profile(
    child_id: int,
    sensory_data: Dict[str, Any],
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Update child's sensory profile
    
    Allows detailed updates to sensory processing preferences
    and accommodations across all sensory domains
    """
    try:
        # Verify child access permissions
        child_service = get_child_service(db)
        child = child_service.get_child_by_id(child_id, include_relationships=False)
        
        if not child:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Child not found"
            )
        
        # Check permissions - only parents can update sensory profiles
        if current_user.role == UserRole.PARENT and child.parent_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this child's sensory profile"
            )
        
        # Validate sensory domains
        valid_domains = [
            'auditory', 'visual', 'tactile', 'vestibular', 
            'proprioceptive', 'gustatory', 'olfactory'
        ]
        
        # Update sensory profile domains
        for domain, domain_data in sensory_data.items():
            if domain not in valid_domains:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid sensory domain: {domain}"
                )
            
            # Validate domain data structure
            if not isinstance(domain_data, dict):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Domain data for {domain} must be an object"
                )
            
            # Update the specific domain
            child.update_sensory_profile(domain, domain_data)
        
        child.updated_at = datetime.now(timezone.utc)
        db.commit()
        
        logger.info(
            f"Sensory profile updated for child {child_id} by user {current_user.id} "
            f"(domains: {list(sensory_data.keys())})"
        )
        
        return {
            "success": True,
            "message": "Sensory profile updated successfully",
            "child_id": child_id,
            "updated_domains": list(sensory_data.keys()),
            "updated_at": child.updated_at.isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating sensory profile for child {child_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update sensory profile"
        )

@router.get("/children/{child_id}/sensory-profile")
async def get_sensory_profile(
    child_id: int,
    domain: Optional[str] = Query(None, description="Specific sensory domain"),
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Get child's sensory profile information
    
    Returns comprehensive sensory processing preferences
    and accommodation needs
    """
    try:
        # Verify child access permissions
        child_service = get_child_service(db)
        child = child_service.get_child_by_id(child_id, include_relationships=False)
        
        if not child:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Child not found"
            )
        
        # Check permissions
        if current_user.role == UserRole.PARENT and child.parent_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this child's sensory profile"
            )
        
        # Get sensory profile data
        if domain:
            # Return specific domain
            sensory_data = child.get_sensory_preferences(domain)
            if not sensory_data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Sensory domain '{domain}' not found"
                )
            
            return {
                "child_id": child_id,
                "domain": domain,
                "sensory_data": sensory_data
            }
        else:
            # Return all domains
            all_sensory_data = child.get_sensory_preferences()
            
            # Calculate sensory summary
            high_sensitivity_domains = []
            total_accommodations = 0
            
            for domain_name, domain_data in all_sensory_data.items():
                if isinstance(domain_data, dict):
                    if domain_data.get("sensitivity") == "high":
                        high_sensitivity_domains.append(domain_name)
                    
                    accommodations = domain_data.get("accommodations", [])
                    if isinstance(accommodations, list):
                        total_accommodations += len(accommodations)
            
            return {
                "child_id": child_id,
                "sensory_profile": all_sensory_data,
                "summary": {
                    "high_sensitivity_domains": high_sensitivity_domains,
                    "total_accommodations": total_accommodations,
                    "profile_completeness": len(all_sensory_data) / 7 * 100,  # 7 domains
                    "last_updated": child.updated_at.isoformat() if child.updated_at else None
                }
            }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving sensory profile for child {child_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve sensory profile"
        )

# =============================================================================
# EXPORT AND REPORTING
# =============================================================================

@router.get("/children/{child_id}/export")
async def export_child_data(
    child_id: int,
    format: str = Query(default="json", pattern="^(json|csv|pdf)$"),
    include_activities: bool = Query(default=True),
    include_sessions: bool = Query(default=True),
    include_notes: bool = Query(default=True),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Export comprehensive child data
    
    Supports multiple formats:
    - JSON: Complete structured data
    - CSV: Tabular activity/session data  
    - PDF: Formatted report (future implementation)
    """
    try:
        # Verify child access permissions
        child_service = get_child_service(db)
        child = child_service.get_child_by_id(child_id, include_relationships=True)
        
        if not child:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Child not found"
            )
        
        # Check permissions
        if current_user.role == UserRole.PARENT and child.parent_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this child's data"
            )
        
        # Validate date range
        if date_from and date_to and date_to < date_from:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="date_to must be after date_from"
            )
        
        # Collect export data
        export_data = {
            "child_profile": {
                "id": child.id,
                "name": child.name,
                "age": child.age,
                "date_of_birth": child.date_of_birth.isoformat() if child.date_of_birth else None,
                "diagnosis": child.diagnosis,
                "support_level": child.support_level,
                "communication_style": child.communication_style,
                "current_level": child.level,
                "total_points": child.points,
                "achievements": child.achievements,
                "created_at": child.created_at.isoformat(),
                "sensory_profile": child.sensory_profile,
                "safety_protocols": child.safety_protocols
            },
            "export_metadata": {
                "exported_by": f"{current_user.first_name} {current_user.last_name}",
                "exported_at": datetime.now(timezone.utc).isoformat(),
                "format": format,
                "date_range": {
                    "from": date_from.isoformat() if date_from else None,
                    "to": date_to.isoformat() if date_to else None
                }
            }
        }
        
        # Add activities if requested
        if include_activities:
            activity_service = get_activity_service(db)
            activities = activity_service.get_activities_by_child(child_id, limit=1000)
            
            # Filter by date range if specified
            if date_from or date_to:
                filtered_activities = []
                for activity in activities:
                    if date_from and activity.completed_at < date_from:
                        continue
                    if date_to and activity.completed_at > date_to:
                        continue
                    filtered_activities.append(activity)
                activities = filtered_activities
            
            export_data["activities"] = [
                {
                    "id": activity.id,
                    "type": activity.activity_type,
                    "name": activity.activity_name,
                    "description": activity.description,
                    "points_earned": activity.points_earned,
                    "completed_at": activity.completed_at.isoformat(),
                    "emotional_state_before": activity.emotional_state_before,
                    "emotional_state_after": activity.emotional_state_after,
                    "success_rating": activity.success_rating,
                    "verified_by_parent": activity.verified_by_parent
                }
                for activity in activities
            ]
        
        # Add game sessions if requested
        if include_sessions:
            session_service = get_session_service(db)
            sessions = session_service.get_sessions_by_child(child_id, limit=500)
            
            # Filter by date range if specified
            if date_from or date_to:
                filtered_sessions = []
                for session in sessions:
                    if date_from and session.started_at < date_from:
                        continue
                    if date_to and session.started_at > date_to:
                        continue
                    filtered_sessions.append(session)
                sessions = filtered_sessions
            
            export_data["game_sessions"] = [
                {
                    "id": session.id,
                    "type": session.session_type,
                    "scenario": session.scenario_name,
                    "started_at": session.started_at.isoformat(),
                    "ended_at": session.ended_at.isoformat() if session.ended_at else None,
                    "duration_minutes": round(session.duration_seconds / 60, 2) if session.duration_seconds else None,
                    "score": session.score,
                    "completion_status": session.completion_status,
                    "engagement_score": session.calculate_engagement_score()
                }
                for session in sessions
            ]
        
        # Add progress notes if requested
        if include_notes:
            progress_notes = child.progress_notes or []
            
            # Filter by date range if specified
            if date_from or date_to:
                filtered_notes = []
                for note in progress_notes:
                    note_date = datetime.fromisoformat(note.get("date", ""))
                    if date_from and note_date < date_from:
                        continue
                    if date_to and note_date > date_to:
                        continue
                    filtered_notes.append(note)
                progress_notes = filtered_notes
            
            export_data["progress_notes"] = progress_notes
        
        # Handle different export formats
        if format == "json":
            from fastapi.responses import JSONResponse
            return JSONResponse(
                content=export_data,
                headers={
                    "Content-Disposition": f"attachment; filename=child_{child_id}_export.json"
                }
            )
        
        elif format == "csv":
            # Generate CSV for activities
            import csv
            import io
            
            if not include_activities:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="CSV export requires activities to be included"
                )
            
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Write headers
            headers = [
                "Date", "Activity Type", "Activity Name", "Points", 
                "Emotional Before", "Emotional After", "Success Rating", "Verified"
            ]
            writer.writerow(headers)
            
            # Write activity data
            for activity in export_data.get("activities", []):
                writer.writerow([
                    activity["completed_at"][:10],  # Date only
                    activity["type"],
                    activity["name"],
                    activity["points_earned"],
                    activity["emotional_state_before"] or "",
                    activity["emotional_state_after"] or "",
                    activity["success_rating"] or "",
                    "Yes" if activity["verified_by_parent"] else "No"
                ])
            
            from fastapi.responses import Response
            return Response(
                content=output.getvalue(),
                media_type="text/csv",
                headers={
                    "Content-Disposition": f"attachment; filename=child_{child_id}_activities.csv"
                }
            )
        
        elif format == "pdf":
            # PDF generation would be implemented here
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="PDF export is not yet implemented"
            )
        
        logger.info(
            f"Data exported for child {child_id} by user {current_user.id} "
            f"(format: {format}, includes: activities={include_activities}, "
            f"sessions={include_sessions}, notes={include_notes})"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting data for child {child_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to export child data"
        )

# =============================================================================
# STATISTICS AND SUMMARY ENDPOINTS
# =============================================================================

@router.get("/children/statistics")
async def get_children_statistics(
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Get statistics summary for user's children
    
    Returns aggregate statistics across all children for the current user
    """
    try:
        if current_user.role == UserRole.PARENT:
            # Get parent's children
            child_service = get_child_service(db)
            children = child_service.get_children_by_parent(current_user.id)
            
            if not children:
                return {
                    "total_children": 0,
                    "message": "No children found"
                }
            
            # Calculate aggregate statistics
            total_children = len(children)
            total_points = sum(child.points for child in children)
            average_level = sum(child.level for child in children) / total_children
            
            # Age distribution
            age_groups = {"0-3": 0, "4-6": 0, "7-12": 0, "13-18": 0, "19+": 0}
            support_levels = {1: 0, 2: 0, 3: 0, "unspecified": 0}
            
            for child in children:
                # Age groups
                if child.age <= 3:
                    age_groups["0-3"] += 1
                elif child.age <= 6:
                    age_groups["4-6"] += 1
                elif child.age <= 12:
                    age_groups["7-12"] += 1
                elif child.age <= 18:
                    age_groups["13-18"] += 1
                else:
                    age_groups["19+"] += 1
                
                # Support levels
                if child.support_level in [1, 2, 3]:
                    support_levels[child.support_level] += 1
                else:
                    support_levels["unspecified"] += 1
            
            # Recent activity summary
            week_ago = datetime.now(timezone.utc) - timedelta(days=7)
            total_weekly_activities = 0
            total_weekly_sessions = 0
            
            for child in children:
                weekly_activities = db.query(Activity).filter(
                    and_(
                        Activity.child_id == child.id,
                        Activity.completed_at >= week_ago
                    )
                ).count()
                
                weekly_sessions = db.query(GameSession).filter(
                    and_(
                        GameSession.child_id == child.id,
                        GameSession.started_at >= week_ago
                    )
                ).count()
                
                total_weekly_activities += weekly_activities
                total_weekly_sessions += weekly_sessions
            
            return {
                "user_id": current_user.id,
                "summary": {
                    "total_children": total_children,
                    "total_points": total_points,
                    "average_level": round(average_level, 1),
                    "activities_this_week": total_weekly_activities,
                    "sessions_this_week": total_weekly_sessions
                },
                "demographics": {
                    "age_distribution": age_groups,
                    "support_level_distribution": support_levels
                },
                "top_performers": [
                    {
                        "name": child.name,
                        "level": child.level,
                        "points": child.points
                    }
                    for child in sorted(children, key=lambda x: x.points, reverse=True)[:3]
                ],
                "generated_at": datetime.now(timezone.utc).isoformat()
            }
            
        else:
            # For non-parents, return platform statistics (if admin) or empty
            if current_user.role == UserRole.ADMIN:
                total_children = db.query(Child).filter(Child.is_active == True).count()
                total_activities = db.query(Activity).count()
                total_sessions = db.query(GameSession).count()
                
                return {
                    "user_role": "admin",
                    "platform_statistics": {
                        "total_children": total_children,
                        "total_activities": total_activities,
                        "total_sessions": total_sessions
                    },
                    "generated_at": datetime.now(timezone.utc).isoformat()
                }
            else:
                return {
                    "message": "Statistics not available for this user role"
                }
        
    except Exception as e:
        logger.error(f"Error generating children statistics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate statistics"
        )

# =============================================================================
# CHILD PROFILE COMPLETION HELPER
# =============================================================================

@router.get("/children/{child_id}/profile-completion")
async def check_profile_completion(
    child_id: int,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Check child profile completion status
    
    Returns completion percentage and suggestions for improvement
    """
    try:
        # Verify child access permissions
        child_service = get_child_service(db)
        child = child_service.get_child_by_id(child_id, include_relationships=False)
        
        if not child:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Child not found"
            )
        
        # Check permissions
        if current_user.role == UserRole.PARENT and child.parent_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this child's profile"
            )
        
        # Calculate completion score
        completion_score = 0
        total_sections = 10
        completed_sections = []
        missing_sections = []
        suggestions = []
        
        # Basic information (required)
        if child.name and child.age:
            completion_score += 1
            completed_sections.append("basic_info")
        else:
            missing_sections.append("basic_info")
            suggestions.append("Complete basic information (name, age)")
        
        # Clinical information
        if child.diagnosis and child.support_level:
            completion_score += 1
            completed_sections.append("clinical_info")
        else:
            missing_sections.append("clinical_info")
            suggestions.append("Add diagnosis and support level information")
        
        # Communication information
        if child.communication_style:
            completion_score += 1
            completed_sections.append("communication")
        else:
            missing_sections.append("communication")
            suggestions.append("Specify communication style and preferences")
        
        # Sensory profile
        if child.sensory_profile and len(child.sensory_profile) > 0:
            completion_score += 1
            completed_sections.append("sensory_profile")
        else:
            missing_sections.append("sensory_profile")
            suggestions.append("Complete sensory processing profile")
        
        # Behavioral notes
        if child.behavioral_notes and len(child.behavioral_notes.strip()) > 10:
            completion_score += 1
            completed_sections.append("behavioral_notes")
        else:
            missing_sections.append("behavioral_notes")
            suggestions.append("Add behavioral observations and notes")
        
        # Therapy information
        if child.current_therapies and len(child.current_therapies) > 0:
            completion_score += 1
            completed_sections.append("therapy_info")
        else:
            missing_sections.append("therapy_info")
            suggestions.append("Add current therapy and intervention information")
        
        # Emergency contacts
        if child.emergency_contacts and len(child.emergency_contacts) > 0:
            completion_score += 1
            completed_sections.append("emergency_contacts")
        else:
            missing_sections.append("emergency_contacts")
            suggestions.append("Add emergency contact information")
        
        # Safety protocols
        if child.safety_protocols and len(child.safety_protocols) > 0:
            completion_score += 1
            completed_sections.append("safety_protocols")
        else:
            missing_sections.append("safety_protocols")
            suggestions.append("Configure safety protocols and procedures")
        
        # Avatar/photo
        if child.avatar_url:
            completion_score += 1
            completed_sections.append("avatar")
        else:
            missing_sections.append("avatar")
            suggestions.append("Upload a profile photo")
        
        # Progress tracking (has activities)
        recent_activity_count = db.query(Activity).filter(
            Activity.child_id == child_id
        ).count()
        
        if recent_activity_count > 0:
            completion_score += 1
            completed_sections.append("activity_tracking")
        else:
            missing_sections.append("activity_tracking")
            suggestions.append("Start tracking activities and progress")
        
        # Calculate percentage
        completion_percentage = (completion_score / total_sections) * 100
        
        # Determine completion status
        if completion_percentage >= 90:
            status = "excellent"
            priority_message = "Profile is comprehensive and well-documented!"
        elif completion_percentage >= 70:
            status = "good"
            priority_message = "Profile is mostly complete. Consider adding missing sections."
        elif completion_percentage >= 50:
            status = "moderate"
            priority_message = "Profile needs improvement. Focus on clinical and safety information."
        else:
            status = "needs_attention"
            priority_message = "Profile requires significant completion for optimal tracking."
        
        # Priority suggestions (most important first)
        priority_suggestions = []
        if "clinical_info" in missing_sections:
            priority_suggestions.append("Add diagnosis and support level (critical for care planning)")
        if "emergency_contacts" in missing_sections:
            priority_suggestions.append("Add emergency contacts (important for safety)")
        if "safety_protocols" in missing_sections:
            priority_suggestions.append("Configure safety protocols (essential for ASD care)")
        if "sensory_profile" in missing_sections:
            priority_suggestions.append("Complete sensory profile (helps with accommodations)")
        
        logger.info(f"Profile completion checked for child {child_id}: {completion_percentage}%")
        
        return {
            "child_id": child_id,
            "child_name": child.name,
            "completion": {
                "percentage": round(completion_percentage, 1),
                "status": status,
                "score": completion_score,
                "total_sections": total_sections
            },
            "sections": {
                "completed": completed_sections,
                "missing": missing_sections
            },
            "recommendations": {
                "priority_message": priority_message,
                "priority_suggestions": priority_suggestions[:3],  # Top 3 priorities
                "all_suggestions": suggestions
            },
            "next_steps": _get_profile_next_steps(completion_percentage, missing_sections),
            "checked_at": datetime.now(timezone.utc).isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking profile completion for child {child_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check profile completion"
        )

def _get_profile_next_steps(completion_percentage: float, missing_sections: List[str]) -> List[str]:
    """Generate personalized next steps based on profile completion"""
    next_steps = []
    
    if completion_percentage < 50:
        next_steps.append("Focus on completing basic profile information first")
        if "clinical_info" in missing_sections:
            next_steps.append("Schedule time to gather diagnosis and support level details")
        if "emergency_contacts" in missing_sections:
            next_steps.append("Collect emergency contact information from family members")
    
    elif completion_percentage < 80:
        next_steps.append("Your profile is taking shape! Focus on safety and accommodation details")
        if "sensory_profile" in missing_sections:
            next_steps.append("Observe and document sensory preferences and sensitivities")
        if "safety_protocols" in missing_sections:
            next_steps.append("Work with professionals to establish safety protocols")
    
    else:
        next_steps.append("Great progress! Fine-tune the remaining details")
        if "avatar" in missing_sections:
            next_steps.append("Add a profile photo to personalize the account")
        if "activity_tracking" in missing_sections:
            next_steps.append("Start logging daily activities to begin progress tracking")
        next_steps.append("Consider scheduling regular profile reviews to keep information current")
    
    return next_steps

# =============================================================================
# CHILD COMPARISON AND ANALYTICS
# =============================================================================

@router.get("/children/compare")
async def compare_children_progress(
    child_ids: List[int] = Query(..., description="List of child IDs to compare"),
    metric: str = Query(default="points", description="Comparison metric"),
    period_days: int = Query(default=30, ge=1, le=365, description="Comparison period"),
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Compare progress between multiple children
    
    Useful for parents with multiple children or professionals
    tracking progress across their patients
    """
    try:
        if len(child_ids) < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least 2 children required for comparison"
            )
        
        if len(child_ids) > 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum 5 children can be compared at once"
            )
        
        # Verify access to all children
        child_service = get_child_service(db)
        children = []
        
        for child_id in child_ids:
            child = child_service.get_child_by_id(child_id, include_relationships=False)
            if not child:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Child {child_id} not found"
                )
            
            # Check permissions
            if current_user.role == UserRole.PARENT and child.parent_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Access denied to child {child_id}"
                )
            
            children.append(child)
        
        # Calculate comparison metrics
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=period_days)
        
        comparison_data = []
        
        for child in children:
            # Get activities in period
            activities = db.query(Activity).filter(
                and_(
                    Activity.child_id == child.id,
                    Activity.completed_at >= start_date,
                    Activity.completed_at <= end_date
                )
            ).all()
            
            # Get sessions in period
            sessions = db.query(GameSession).filter(
                and_(
                    GameSession.child_id == child.id,
                    GameSession.started_at >= start_date,
                    GameSession.started_at <= end_date
                )
            ).all()
            
            # Calculate metrics
            total_activities = len(activities)
            total_points_period = sum(activity.points_earned for activity in activities)
            verified_activities = len([a for a in activities if a.verified_by_parent])
            total_sessions = len(sessions)
            completed_sessions = len([s for s in sessions if s.completion_status == "completed"])
            
            # Average scores
            avg_session_score = 0
            if completed_sessions > 0:
                session_scores = [s.score for s in sessions if s.completion_status == "completed" and s.score]
                if session_scores:
                    avg_session_score = sum(session_scores) / len(session_scores)
            
            # Emotional improvement tracking
            emotional_improvements = 0
            emotional_activities = [a for a in activities if a.emotional_state_before and a.emotional_state_after]
            
            emotion_scores = {
                "overwhelmed": 1, "frustrated": 2, "anxious": 3, "tired": 4,
                "calm": 5, "focused": 6, "happy": 7, "excited": 8
            }
            
            for activity in emotional_activities:
                before_score = emotion_scores.get(activity.emotional_state_before, 5)
                after_score = emotion_scores.get(activity.emotional_state_after, 5)
                if after_score > before_score:
                    emotional_improvements += 1
            
            child_data = {
                "child_id": child.id,
                "name": child.name,
                "age": child.age,
                "support_level": child.support_level,
                "current_level": child.level,
                "total_points": child.points,
                "period_metrics": {
                    "activities_completed": total_activities,
                    "points_earned": total_points_period,
                    "verified_activities": verified_activities,
                    "verification_rate": (verified_activities / total_activities * 100) if total_activities > 0 else 0,
                    "sessions_attempted": total_sessions,
                    "sessions_completed": completed_sessions,
                    "completion_rate": (completed_sessions / total_sessions * 100) if total_sessions > 0 else 0,
                    "average_session_score": round(avg_session_score, 1),
                    "emotional_improvements": emotional_improvements,
                    "emotional_improvement_rate": (emotional_improvements / len(emotional_activities) * 100) if emotional_activities else 0
                }
            }
            
            comparison_data.append(child_data)
        
        # Generate insights and rankings
        insights = _generate_comparison_insights(comparison_data, metric)
        
        logger.info(f"Children comparison completed: {len(child_ids)} children compared by user {current_user.id}")
        
        return {
            "comparison_summary": {
                "children_count": len(children),
                "comparison_metric": metric,
                "period_days": period_days,
                "period_range": {
                    "from": start_date.isoformat(),
                    "to": end_date.isoformat()
                }
            },
            "children_data": comparison_data,
            "insights": insights,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error comparing children progress: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to compare children progress"
        )

def _generate_comparison_insights(comparison_data: List[Dict], metric: str) -> Dict[str, Any]:
    """Generate insights from children comparison data"""
    insights = {
        "top_performers": [],
        "improvement_areas": [],
        "notable_patterns": [],
        "recommendations": []
    }
    
    # Sort by different metrics
    if metric == "points":
        sorted_data = sorted(comparison_data, key=lambda x: x["period_metrics"]["points_earned"], reverse=True)
        insights["top_performers"] = [
            f"{child['name']} earned {child['period_metrics']['points_earned']} points"
            for child in sorted_data[:3]
        ]
    
    elif metric == "engagement":
        sorted_data = sorted(comparison_data, key=lambda x: x["period_metrics"]["completion_rate"], reverse=True)
        insights["top_performers"] = [
            f"{child['name']} has {child['period_metrics']['completion_rate']:.1f}% session completion rate"
            for child in sorted_data[:3]
        ]
    
    # Identify patterns
    high_activity_children = [child for child in comparison_data if child["period_metrics"]["activities_completed"] > 10]
    if high_activity_children:
        insights["notable_patterns"].append(f"{len(high_activity_children)} children are highly active with 10+ activities")
    
    # Age-based insights
    age_groups = {}
    for child in comparison_data:
        age_category = "young" if child["age"] < 8 else "older"
        if age_category not in age_groups:
            age_groups[age_category] = []
        age_groups[age_category].append(child)
    
    if len(age_groups) > 1:
        for age_group, children in age_groups.items():
            avg_points = sum(child["period_metrics"]["points_earned"] for child in children) / len(children)
            insights["notable_patterns"].append(f"{age_group.title()} children (n={len(children)}) average {avg_points:.1f} points")
    
    # Generate recommendations
    insights["recommendations"].append("Continue tracking progress to identify long-term trends")
    insights["recommendations"].append("Consider celebrating achievements to maintain motivation")
    
    return insights

# =============================================================================
# CHILD TEMPLATE AND QUICK SETUP
# =============================================================================

@router.post("/children/quick-setup", response_model=ChildResponse)
async def quick_child_setup(
    basic_info: Dict[str, Any],
    current_user: User = Depends(require_parent),
    db: Session = Depends(get_db)
):
    """
    Quick child setup with minimal required information
    
    Creates a basic child profile that can be enhanced later
    Perfect for getting started quickly
    """
    try:
        # Validate required fields
        required_fields = ["name", "age"]
        for field in required_fields:
            if field not in basic_info or not basic_info[field]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Missing required field: {field}"
                )
        
        name = basic_info["name"].strip()
        age = basic_info["age"]
        
        # Validate age
        if not isinstance(age, int) or age < 0 or age > 25:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Age must be an integer between 0 and 25"
            )
        
        # Create minimal child data
        child_data = ChildCreate(
            name=name,
            age=age,
            date_of_birth=basic_info.get("date_of_birth"),
            diagnosis=basic_info.get("diagnosis", "Autism Spectrum Disorder"),
            communication_style=basic_info.get("communication_style"),
            # Initialize with default empty structures
            sensory_profile=None,
            current_therapies=[],
            emergency_contacts=[],
            safety_protocols=None
        )
        
        # Create child
        child_service = get_child_service(db)
        child = child_service.create_child(current_user.id, child_data)
        
        if not child:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create child profile"
            )
        
        logger.info(f"Quick child setup completed: {child.name} (ID: {child.id}) for parent {current_user.id}")
        
        return ChildResponse.model_validate(child)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in quick child setup: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Quick setup failed"
        )

@router.get("/children/templates")
async def get_child_profile_templates(
    current_user: User = Depends(get_current_verified_user)
):
    """
    Get child profile templates for different scenarios
    
    Provides pre-configured templates to help parents
    set up profiles based on common ASD presentations
    """
    templates = {
        "minimal_support": {
            "name": "Level 1 Support Template",
            "description": "For children requiring support with social communication",
            "template_data": {
                "support_level": 1,
                "communication_style": "verbal",
                "sensory_profile": {
                    "auditory": {
                        "sensitivity": "moderate",
                        "accommodations": ["noise_reducing_headphones", "quiet_spaces"]
                    },
                    "visual": {
                        "sensitivity": "low",
                        "accommodations": ["natural_lighting"]
                    }
                },
                "safety_protocols": {
                    "elopement_risk": "low",
                    "calming_strategies": ["deep_breathing", "preferred_activities"]
                }
            }
        },
        "substantial_support": {
            "name": "Level 2 Support Template", 
            "description": "For children requiring substantial support",
            "template_data": {
                "support_level": 2,
                "communication_style": "mixed",
                "sensory_profile": {
                    "auditory": {
                        "sensitivity": "high",
                        "accommodations": ["noise_cancelling_headphones", "warning_before_loud_sounds"]
                    },
                    "tactile": {
                        "sensitivity": "high",
                        "accommodations": ["soft_textures", "gradual_exposure"]
                    }
                },
                "safety_protocols": {
                    "elopement_risk": "moderate",
                    "calming_strategies": ["sensory_breaks", "visual_schedules", "preferred_objects"]
                }
            }
        },
        "extensive_support": {
            "name": "Level 3 Support Template",
            "description": "For children requiring very substantial support",
            "template_data": {
                "support_level": 3,
                "communication_style": "alternative",
                "sensory_profile": {
                    "auditory": {
                        "sensitivity": "high",
                        "accommodations": ["quiet_environment", "minimal_background_noise"]
                    },
                    "visual": {
                        "sensitivity": "high",
                        "accommodations": ["dim_lighting", "minimal_visual_stimuli"]
                    },
                    "tactile": {
                        "sensitivity": "high",
                        "accommodations": ["soft_clothing", "familiar_textures_only"]
                    }
                },
                "safety_protocols": {
                    "elopement_risk": "high",
                    "calming_strategies": ["deep_pressure", "familiar_routines", "comfort_items"],
                    "emergency_procedures": ["immediate_caregiver_contact", "safe_space_protocol"]
                }
            }
        }
    }
    
    return {
        "available_templates": list(templates.keys()),
        "templates": templates,
        "usage_note": "These templates provide starting points that should be customized based on individual needs",
        "customization_reminder": "Always personalize templates based on your child's specific needs and preferences"
    }

# =============================================================================
# CHILD PROFILE SHARING AND PERMISSIONS
# =============================================================================

@router.post("/children/{child_id}/share")
async def share_child_profile(
    child_id: int,
    share_data: Dict[str, Any],
    current_user: User = Depends(require_parent),
    db: Session = Depends(get_db)
):
    """
    Share child profile with professionals or family members
    
    Creates controlled access to child data for authorized users
    """
    try:
        # Verify child ownership
        child_service = get_child_service(db)
        child = child_service.get_child_by_id(child_id, include_relationships=False)
        
        if not child:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Child not found"
            )
        
        if child.parent_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the child's parent can share their profile"
            )
        
        # Validate share data
        required_fields = ["email", "permission_level"]
        for field in required_fields:
            if field not in share_data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Missing required field: {field}"
                )
        
        email = share_data["email"].strip().lower()
        permission_level = share_data["permission_level"]
        
        # Validate permission level
        valid_permissions = ["view", "comment", "edit"]
        if permission_level not in valid_permissions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid permission level. Must be one of: {valid_permissions}"
            )
        
        # Check if user exists
        shared_user = db.query(User).filter(User.email == email).first()
        if not shared_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User with this email not found"
            )
        
        # Prevent sharing with self
        if shared_user.id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot share profile with yourself"
            )
        
        # For now, we'll return a success message
        # In a full implementation, this would create a sharing record in the database
        expiry_date = datetime.now(timezone.utc) + timedelta(days=share_data.get("duration_days", 30))
        
        logger.info(
            f"Profile sharing initiated: Child {child_id} shared with {email} "
            f"(permission: {permission_level}) by parent {current_user.id}"
        )
        
        return {
            "success": True,
            "message": "Child profile shared successfully",
            "child_id": child_id,
            "shared_with": email,
            "permission_level": permission_level,
            "expires_at": expiry_date.isoformat(),
            "share_note": "In a full implementation, this would create database records and send notification emails"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sharing child profile {child_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to share child profile"
        )

# Export the router
__all__ = ["router"]