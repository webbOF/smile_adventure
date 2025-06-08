"""
CRUD operations for users and children with comprehensive ASD support
Enhanced with performance optimization and data integrity
"""

from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import and_, or_, desc, asc, func, text
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.auth.models import User, UserRole
from app.users.models import Child, Activity, GameSession, Assessment, ProfessionalProfile
from app.users.schemas import (
    ChildCreate, ChildUpdate, ActivityCreate, GameSessionCreate, 
    GameSessionUpdate, AssessmentCreate, ProfessionalProfileCreate
)

import logging

logger = logging.getLogger(__name__)

# =============================================================================
# CHILD CRUD OPERATIONS
# =============================================================================

class ChildService:
    """Comprehensive child management service with ASD focus"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_child(self, parent_id: int, child_data: ChildCreate) -> Optional[Child]:
        """
        Create new child profile with comprehensive ASD data
        
        Args:
            parent_id: ID of parent user
            child_data: Child creation data
            
        Returns:
            Created Child object or None if failed
        """
        try:
            # Verify parent exists and is active
            parent = self.db.query(User).filter(
                and_(
                    User.id == parent_id,
                    User.role == UserRole.PARENT,
                    User.is_active == True
                )
            ).first()
            
            if not parent:
                logger.warning(f"Parent not found or inactive: {parent_id}")
                return None
            
            # Create child with comprehensive data
            child = Child(
                name=child_data.name,
                age=child_data.age,
                date_of_birth=child_data.date_of_birth,
                avatar_url=child_data.avatar_url,
                parent_id=parent_id,
                
                # Clinical information
                diagnosis=child_data.diagnosis,
                support_level=child_data.support_level.value if child_data.support_level else None,
                diagnosis_date=child_data.diagnosis_date,
                diagnosing_professional=child_data.diagnosing_professional,
                
                # Communication
                communication_style=child_data.communication_style.value if child_data.communication_style else None,
                communication_notes=child_data.communication_notes,
                
                # Complex JSON data
                sensory_profile=child_data.sensory_profile.model_dump() if child_data.sensory_profile else None,
                behavioral_notes=child_data.behavioral_notes,
                current_therapies=[therapy.model_dump() for therapy in child_data.current_therapies],
                emergency_contacts=child_data.emergency_contacts,
                safety_protocols=child_data.safety_protocols.model_dump() if child_data.safety_protocols else {},
                
                # Initialize defaults
                points=0,
                level=1,
                achievements=[],
                progress_notes=[],
                is_active=True,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
            
            self.db.add(child)
            self.db.commit()
            self.db.refresh(child)
            
            logger.info(f"Child created successfully: {child.name} (ID: {child.id}) for parent {parent_id}")
            return child
            
        except IntegrityError as e:
            self.db.rollback()
            logger.error(f"Integrity error creating child: {str(e)}")
            return None
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating child: {str(e)}")
            return None
    
    def get_children_by_parent(self, parent_id: int, include_inactive: bool = False) -> List[Child]:
        """
        Get all children for a parent with optimized loading
        
        Args:
            parent_id: Parent user ID
            include_inactive: Whether to include inactive children
            
        Returns:
            List of Child objects
        """
        try:
            query = self.db.query(Child).filter(Child.parent_id == parent_id)
            
            if not include_inactive:
                query = query.filter(Child.is_active == True)
            
            # Optimize with eager loading for related data
            children = query.options(
                selectinload(Child.activities),
                selectinload(Child.game_sessions)
            ).order_by(desc(Child.created_at)).all()
            
            return children
            
        except Exception as e:
            logger.error(f"Error getting children for parent {parent_id}: {str(e)}")
            return []
    
    def get_child_by_id(self, child_id: int, include_relationships: bool = True) -> Optional[Child]:
        """
        Get child by ID with optional relationship loading
        
        Args:
            child_id: Child ID
            include_relationships: Whether to load activities and sessions
            
        Returns:
            Child object or None
        """
        try:
            query = self.db.query(Child).filter(Child.id == child_id)
            
            if include_relationships:
                query = query.options(
                    selectinload(Child.activities),
                    selectinload(Child.game_sessions),
                    selectinload(Child.assessments)
                )
            
            return query.first()
            
        except Exception as e:
            logger.error(f"Error getting child {child_id}: {str(e)}")
            return None
    
    def update_child(self, child_id: int, update_data: ChildUpdate, user_id: int) -> Optional[Child]:
        """
        Update child information with permission checking
        
        Args:
            child_id: Child ID
            update_data: Update data
            user_id: User requesting update (for permission check)
            
        Returns:
            Updated Child object or None
        """
        try:
            # Get child with parent info for permission check
            child = self.db.query(Child).filter(Child.id == child_id).first()
            
            if not child:
                logger.warning(f"Child not found: {child_id}")
                return None
            
            # Permission check: only parent or admin can update
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user or (child.parent_id != user_id and user.role != UserRole.ADMIN):
                logger.warning(f"Unauthorized update attempt for child {child_id} by user {user_id}")
                return None
            
            # Update fields if provided
            update_fields = update_data.model_dump(exclude_unset=True)
            
            for field, value in update_fields.items():
                if hasattr(child, field):
                    if field == 'support_level' and value is not None:
                        setattr(child, field, value.value)
                    elif field == 'communication_style' and value is not None:
                        setattr(child, field, value.value)
                    elif field == 'sensory_profile' and value is not None:
                        setattr(child, field, value.model_dump())
                    elif field == 'current_therapies' and value is not None:
                        setattr(child, field, [therapy.model_dump() for therapy in value])
                    elif field == 'safety_protocols' and value is not None:
                        setattr(child, field, value.model_dump())
                    else:
                        setattr(child, field, value)
            
            child.updated_at = datetime.now(timezone.utc)
            
            self.db.commit()
            self.db.refresh(child)
            
            logger.info(f"Child updated successfully: {child_id}")
            return child
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating child {child_id}: {str(e)}")
            return None
    
    def add_points(self, child_id: int, points: int, activity_type: str = None) -> Optional[Dict[str, Any]]:
        """
        Add points to child and handle level progression
        
        Args:
            child_id: Child ID
            points: Points to add
            activity_type: Type of activity for achievement checking
            
        Returns:
            Dictionary with point/level update information
        """
        try:
            child = self.get_child_by_id(child_id, include_relationships=False)
            if not child:
                return None
            
            result = child.add_points(points, activity_type)
            
            self.db.commit()
            self.db.refresh(child)
            
            logger.info(f"Points added to child {child_id}: {points} points, level {result['new_level']}")
            return result
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error adding points to child {child_id}: {str(e)}")
            return None
    
    def get_child_statistics(self, child_id: int, days: int = 30) -> Dict[str, Any]:
        """
        Get comprehensive statistics for a child
        
        Args:
            child_id: Child ID
            days: Number of days to include in statistics
            
        Returns:
            Dictionary with child statistics
        """
        try:
            start_date = datetime.now(timezone.utc) - timedelta(days=days)
            
            # Get basic child info
            child = self.get_child_by_id(child_id, include_relationships=False)
            if not child:
                return {}
            
            # Activity statistics
            activity_stats = self.db.query(
                func.count(Activity.id).label('total_activities'),
                func.sum(Activity.points_earned).label('total_points'),
                func.count(Activity.id).filter(Activity.verified_by_parent == True).label('verified_activities')
            ).filter(
                and_(
                    Activity.child_id == child_id,
                    Activity.completed_at >= start_date
                )
            ).first()
            
            # Game session statistics
            session_stats = self.db.query(
                func.count(GameSession.id).label('total_sessions'),
                func.count(GameSession.id).filter(GameSession.completion_status == "completed").label('completed_sessions'),
                func.avg(GameSession.score).label('average_score')
            ).filter(
                and_(
                    GameSession.child_id == child_id,
                    GameSession.started_at >= start_date
                )
            ).first()
            
            # Activity type breakdown
            activity_types = self.db.query(
                Activity.activity_type,
                func.count(Activity.id).label('count'),
                func.sum(Activity.points_earned).label('points')
            ).filter(
                and_(
                    Activity.child_id == child_id,
                    Activity.completed_at >= start_date
                )
            ).group_by(Activity.activity_type).all()
            
            return {
                'child_id': child_id,
                'period_days': days,
                'activities': {
                    'total': activity_stats.total_activities or 0,
                    'total_points': activity_stats.total_points or 0,
                    'verified': activity_stats.verified_activities or 0
                },
                'sessions': {
                    'total': session_stats.total_sessions or 0,
                    'completed': session_stats.completed_sessions or 0,
                    'average_score': float(session_stats.average_score or 0)
                },
                'activity_types': {
                    activity_type: {'count': count, 'points': points}
                    for activity_type, count, points in activity_types
                },
                'child_info': {
                    'current_level': child.level,
                    'total_points': child.points,
                    'achievements': child.achievements
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting child statistics {child_id}: {str(e)}")
            return {}

# =============================================================================
# ACTIVITY CRUD OPERATIONS
# =============================================================================

class ActivityService:
    """Activity tracking service with ASD-specific features"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_activity(self, activity_data: ActivityCreate) -> Optional[Activity]:
        """
        Create new activity with comprehensive ASD tracking
        
        Args:
            activity_data: Activity creation data
            
        Returns:
            Created Activity object or None if failed
        """
        try:
            # Verify child exists
            child = self.db.query(Child).filter(Child.id == activity_data.child_id).first()
            if not child:
                logger.warning(f"Child not found: {activity_data.child_id}")
                return None
            
            activity = Activity(
                child_id=activity_data.child_id,
                activity_type=activity_data.activity_type.value,
                activity_name=activity_data.activity_name,
                description=activity_data.description,
                category=activity_data.category,
                points_earned=activity_data.points_earned,
                difficulty_level=activity_data.difficulty_level,
                
                # Timing
                started_at=activity_data.started_at,
                duration_minutes=activity_data.duration_minutes,
                
                # ASD-specific tracking
                emotional_state_before=activity_data.emotional_state_before.value if activity_data.emotional_state_before else None,
                emotional_state_after=activity_data.emotional_state_after.value if activity_data.emotional_state_after else None,
                anxiety_level_before=activity_data.anxiety_level_before,
                anxiety_level_after=activity_data.anxiety_level_after,
                
                # Support and environment
                support_level_needed=activity_data.support_level_needed,
                support_provided_by=activity_data.support_provided_by,
                assistive_technology_used=activity_data.assistive_technology_used,
                environment_type=activity_data.environment_type,
                environmental_modifications=activity_data.environmental_modifications,
                sensory_accommodations=activity_data.sensory_accommodations,
                
                # Outcome
                success_rating=activity_data.success_rating,
                challenges_encountered=activity_data.challenges_encountered,
                strategies_used=activity_data.strategies_used,
                notes=activity_data.notes,
                
                # Defaults
                completion_status="completed",
                verified_by_parent=False,
                verified_by_professional=False,
                data_source="manual",
                created_at=datetime.now(timezone.utc)
            )
            
            self.db.add(activity)
            self.db.commit()
            self.db.refresh(activity)
            
            # Add points to child if earned
            if activity_data.points_earned > 0:
                child_service = ChildService(self.db)
                child_service.add_points(
                    activity_data.child_id, 
                    activity_data.points_earned,
                    activity_data.activity_type.value
                )
            
            logger.info(f"Activity created: {activity.activity_name} for child {activity_data.child_id}")
            return activity
            
        except IntegrityError as e:
            self.db.rollback()
            logger.error(f"Integrity error creating activity: {str(e)}")
            return None
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating activity: {str(e)}")
            return None
    
    def get_activities_by_child(self, child_id: int, limit: int = 50, 
                              activity_type: Optional[str] = None) -> List[Activity]:
        """
        Get activities for a child with optional filtering
        
        Args:
            child_id: Child ID
            limit: Maximum number of activities to return
            activity_type: Optional activity type filter
            
        Returns:
            List of Activity objects
        """
        try:
            query = self.db.query(Activity).filter(Activity.child_id == child_id)
            
            if activity_type:
                query = query.filter(Activity.activity_type == activity_type)
            
            activities = query.order_by(desc(Activity.completed_at)).limit(limit).all()
            return activities
            
        except Exception as e:
            logger.error(f"Error getting activities for child {child_id}: {str(e)}")
            return []
    
    def verify_activity(self, activity_id: int, verified: bool = True, 
                       user_role: str = "parent") -> Optional[Activity]:
        """
        Verify activity by parent or professional
        
        Args:
            activity_id: Activity ID
            verified: Verification status
            user_role: Role of user verifying (parent/professional)
            
        Returns:
            Updated Activity object or None
        """
        try:
            activity = self.db.query(Activity).filter(Activity.id == activity_id).first()
            if not activity:
                return None
            
            if user_role == "parent":
                activity.verified_by_parent = verified
            elif user_role == "professional":
                activity.verified_by_professional = verified
            
            self.db.commit()
            self.db.refresh(activity)
            
            logger.info(f"Activity {activity_id} verified by {user_role}: {verified}")
            return activity
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error verifying activity {activity_id}: {str(e)}")
            return None

# =============================================================================
# GAME SESSION CRUD OPERATIONS
# =============================================================================

class GameSessionService:
    """Game session tracking service"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_session(self, session_data: GameSessionCreate) -> Optional[GameSession]:
        """
        Create new game session
        
        Args:
            session_data: Session creation data
            
        Returns:
            Created GameSession object or None if failed
        """
        try:
            # Verify child exists
            child = self.db.query(Child).filter(Child.id == session_data.child_id).first()
            if not child:
                logger.warning(f"Child not found: {session_data.child_id}")
                return None
            
            session = GameSession(
                child_id=session_data.child_id,
                session_type=session_data.session_type,
                scenario_name=session_data.scenario_name,
                scenario_id=session_data.scenario_id,
                device_type=session_data.device_type,
                
                # Initialize defaults
                levels_completed=0,
                max_level_reached=0,
                score=0,
                interactions_count=0,
                correct_responses=0,
                help_requests=0,
                achievement_unlocked=[],
                completion_status="in_progress",
                session_data_quality="good",
                started_at=datetime.now(timezone.utc)
            )
            
            self.db.add(session)
            self.db.commit()
            self.db.refresh(session)
            
            logger.info(f"Game session created: {session.scenario_name} for child {session_data.child_id}")
            return session
            
        except IntegrityError as e:
            self.db.rollback()
            logger.error(f"Integrity error creating session: {str(e)}")
            return None
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating session: {str(e)}")
            return None
    
    def update_session(self, session_id: int, update_data: GameSessionUpdate) -> Optional[GameSession]:
        """
        Update game session progress
        
        Args:
            session_id: Session ID
            update_data: Update data
            
        Returns:
            Updated GameSession object or None
        """
        try:
            session = self.db.query(GameSession).filter(GameSession.id == session_id).first()
            if not session:
                return None
            
            # Update fields if provided
            update_fields = update_data.model_dump(exclude_unset=True)
            
            for field, value in update_fields.items():
                if hasattr(session, field):
                    setattr(session, field, value)
            
            self.db.commit()
            self.db.refresh(session)
            
            logger.info(f"Game session updated: {session_id}")
            return session
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating session {session_id}: {str(e)}")
            return None
    
    def complete_session(self, session_id: int, exit_reason: str = "completed") -> Optional[GameSession]:
        """
        Mark session as completed
        
        Args:
            session_id: Session ID
            exit_reason: Reason for completion
            
        Returns:
            Completed GameSession object or None
        """
        try:
            session = self.db.query(GameSession).filter(GameSession.id == session_id).first()
            if not session:
                return None
            
            session.mark_completed(exit_reason)
            
            self.db.commit()
            self.db.refresh(session)
            
            logger.info(f"Game session completed: {session_id}")
            return session
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error completing session {session_id}: {str(e)}")
            return None
    
    def get_sessions_by_child(self, child_id: int, limit: int = 20, 
                            session_type: Optional[str] = None) -> List[GameSession]:
        """
        Get game sessions for a child
        
        Args:
            child_id: Child ID
            limit: Maximum number of sessions
            session_type: Optional session type filter
            
        Returns:
            List of GameSession objects
        """
        try:
            query = self.db.query(GameSession).filter(GameSession.child_id == child_id)
            
            if session_type:
                query = query.filter(GameSession.session_type == session_type)
            
            sessions = query.order_by(desc(GameSession.started_at)).limit(limit).all()
            return sessions
            
        except Exception as e:
            logger.error(f"Error getting sessions for child {child_id}: {str(e)}")
            return []

# =============================================================================
# PROFESSIONAL PROFILE CRUD OPERATIONS
# =============================================================================

class ProfessionalService:
    """Professional profile management service"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_profile(self, user_id: int, profile_data: ProfessionalProfileCreate) -> Optional[ProfessionalProfile]:
        """
        Create professional profile
        
        Args:
            user_id: User ID
            profile_data: Profile creation data
            
        Returns:
            Created ProfessionalProfile object or None
        """
        try:
            # Verify user exists and is professional
            user = self.db.query(User).filter(
                and_(
                    User.id == user_id,
                    User.role == UserRole.PROFESSIONAL,
                    User.is_active == True
                )
            ).first()
            
            if not user:
                logger.warning(f"Professional user not found: {user_id}")
                return None
            
            # Check if profile already exists
            existing = self.db.query(ProfessionalProfile).filter(
                ProfessionalProfile.user_id == user_id
            ).first()
            
            if existing:
                logger.warning(f"Professional profile already exists for user {user_id}")
                return None
            
            profile = ProfessionalProfile(
                user_id=user_id,
                license_type=profile_data.license_type,
                license_number=profile_data.license_number,
                license_state=profile_data.license_state,
                license_expiry=profile_data.license_expiry,
                
                primary_specialty=profile_data.primary_specialty,
                subspecialties=profile_data.subspecialties,
                certifications=profile_data.certifications,
                years_experience=profile_data.years_experience,
                
                clinic_name=profile_data.clinic_name,
                clinic_address=profile_data.clinic_address,
                clinic_phone=profile_data.clinic_phone,
                practice_type=profile_data.practice_type,
                
                asd_experience_years=profile_data.asd_experience_years,
                asd_certifications=profile_data.asd_certifications,
                preferred_age_groups=profile_data.preferred_age_groups,
                treatment_approaches=profile_data.treatment_approaches,
                
                bio=profile_data.bio,
                treatment_philosophy=profile_data.treatment_philosophy,
                languages_spoken=profile_data.languages_spoken,
                accepts_new_patients=profile_data.accepts_new_patients,
                
                # Initialize defaults
                patient_count=0,
                total_sessions=0,
                available_days=[],
                is_verified=False,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
            
            self.db.add(profile)
            self.db.commit()
            self.db.refresh(profile)
            
            logger.info(f"Professional profile created for user {user_id}")
            return profile
            
        except IntegrityError as e:
            self.db.rollback()
            logger.error(f"Integrity error creating professional profile: {str(e)}")
            return None
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating professional profile: {str(e)}")
            return None
    
    def get_profile_by_user(self, user_id: int) -> Optional[ProfessionalProfile]:
        """
        Get professional profile by user ID
        
        Args:
            user_id: User ID
            
        Returns:
            ProfessionalProfile object or None
        """
        try:
            return self.db.query(ProfessionalProfile).filter(
                ProfessionalProfile.user_id == user_id
            ).first()
            
        except Exception as e:
            logger.error(f"Error getting professional profile for user {user_id}: {str(e)}")
            return None
    
    def search_professionals(self, specialty: Optional[str] = None, 
                           location: Optional[str] = None,
                           accepts_new_patients: bool = True,
                           limit: int = 20) -> List[ProfessionalProfile]:
        """
        Search for professionals with filters
        
        Args:
            specialty: Primary specialty filter
            location: Location filter (state)
            accepts_new_patients: Whether professional accepts new patients
            limit: Maximum results
            
        Returns:
            List of ProfessionalProfile objects
        """
        try:
            query = self.db.query(ProfessionalProfile).filter(
                ProfessionalProfile.is_verified == True
            )
            
            if specialty:
                query = query.filter(
                    ProfessionalProfile.primary_specialty.ilike(f"%{specialty}%")
                )
            
            if location:
                query = query.filter(
                    ProfessionalProfile.license_state.ilike(f"%{location}%")
                )
            
            if accepts_new_patients:
                query = query.filter(
                    ProfessionalProfile.accepts_new_patients == True
                )
            
            profiles = query.order_by(
                desc(ProfessionalProfile.average_rating),
                desc(ProfessionalProfile.total_sessions)
            ).limit(limit).all()
            
            return profiles
            
        except Exception as e:
            logger.error(f"Error searching professionals: {str(e)}")
            return []

# =============================================================================
# ASSESSMENT CRUD OPERATIONS
# =============================================================================

class AssessmentService:
    """Assessment management service"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_assessment(self, assessment_data: AssessmentCreate) -> Optional[Assessment]:
        """
        Create new assessment
        
        Args:
            assessment_data: Assessment creation data
            
        Returns:
            Created Assessment object or None
        """
        try:
            # Verify child exists
            child = self.db.query(Child).filter(Child.id == assessment_data.child_id).first()
            if not child:
                logger.warning(f"Child not found: {assessment_data.child_id}")
                return None
            
            assessment = Assessment(
                child_id=assessment_data.child_id,
                assessment_type=assessment_data.assessment_type,
                assessment_name=assessment_data.assessment_name,
                version=assessment_data.version,
                administered_by=assessment_data.administered_by,
                administered_date=assessment_data.administered_date,
                location=assessment_data.location,
                
                raw_scores=assessment_data.raw_scores,
                standard_scores=assessment_data.standard_scores,
                percentiles=assessment_data.percentiles,
                age_equivalents=assessment_data.age_equivalents,
                
                interpretation=assessment_data.interpretation,
                recommendations=assessment_data.recommendations,
                goals_identified=assessment_data.goals_identified,
                
                # Initialize defaults
                areas_of_growth=[],
                areas_of_concern=[],
                status="completed",
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
            
            self.db.add(assessment)
            self.db.commit()
            self.db.refresh(assessment)
            
            # Update child's last assessment date
            child.last_assessment_date = assessment_data.administered_date
            self.db.commit()
            
            logger.info(f"Assessment created: {assessment.assessment_name} for child {assessment_data.child_id}")
            return assessment
            
        except IntegrityError as e:
            self.db.rollback()
            logger.error(f"Integrity error creating assessment: {str(e)}")
            return None
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating assessment: {str(e)}")
            return None
    
    def get_assessments_by_child(self, child_id: int, limit: int = 10) -> List[Assessment]:
        """
        Get assessments for a child
        
        Args:
            child_id: Child ID
            limit: Maximum number of assessments
            
        Returns:
            List of Assessment objects
        """
        try:
            assessments = self.db.query(Assessment).filter(
                Assessment.child_id == child_id
            ).order_by(desc(Assessment.administered_date)).limit(limit).all()
            
            return assessments
            
        except Exception as e:
            logger.error(f"Error getting assessments for child {child_id}: {str(e)}")
            return []

# =============================================================================
# ANALYTICS AND REPORTING
# =============================================================================

class AnalyticsService:
    """Analytics and reporting service"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_child_progress_summary(self, child_id: int, days: int = 30) -> Dict[str, Any]:
        """
        Get comprehensive progress summary for a child
        
        Args:
            child_id: Child ID
            days: Number of days to analyze
            
        Returns:
            Dictionary with progress summary
        """
        try:
            child_service = ChildService(self.db)
            activity_service = ActivityService(self.db)
            session_service = GameSessionService(self.db)
            
            # Get child info
            child = child_service.get_child_by_id(child_id, include_relationships=False)
            if not child:
                return {}
            
            # Get statistics
            stats = child_service.get_child_statistics(child_id, days)
            
            # Get recent activities and sessions
            recent_activities = activity_service.get_activities_by_child(child_id, limit=10)
            recent_sessions = session_service.get_sessions_by_child(child_id, limit=5)
            
            # Emotional progress analysis
            emotional_data = self._analyze_emotional_progress(recent_activities)
            
            # Engagement patterns
            engagement_data = self._analyze_engagement_patterns(recent_sessions)
            
            return {
                'child_id': child_id,
                'child_name': child.name,
                'current_level': child.level,
                'total_points': child.points,
                'period_days': days,
                'statistics': stats,
                'recent_activities_count': len(recent_activities),
                'recent_sessions_count': len(recent_sessions),
                'emotional_progress': emotional_data,
                'engagement_patterns': engagement_data,
                'last_activity': recent_activities[0].completed_at.isoformat() if recent_activities else None,
                'last_session': recent_sessions[0].started_at.isoformat() if recent_sessions else None,
                'generated_at': datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating progress summary for child {child_id}: {str(e)}")
            return {}
    
    def _analyze_emotional_progress(self, activities: List[Activity]) -> Dict[str, Any]:
        """Analyze emotional state progression from activities"""
        if not activities:
            return {'data_available': False}
        
        # Filter activities with emotional data
        emotional_activities = [
            a for a in activities 
            if a.emotional_state_before and a.emotional_state_after
        ]
        
        if not emotional_activities:
            return {'data_available': False}
        
        # Emotional state mapping (higher = better)
        emotion_scores = {
            "overwhelmed": 1, "frustrated": 2, "anxious": 3, "tired": 4,
            "calm": 5, "focused": 6, "happy": 7, "excited": 8
        }
        
        improvements = 0
        deteriorations = 0
        stable = 0
        
        for activity in emotional_activities:
            before_score = emotion_scores.get(activity.emotional_state_before, 5)
            after_score = emotion_scores.get(activity.emotional_state_after, 5)
            
            if after_score > before_score:
                improvements += 1
            elif after_score < before_score:
                deteriorations += 1
            else:
                stable += 1
        
        total = len(emotional_activities)
        
        return {
            'data_available': True,
            'tracked_activities': total,
            'improvements': improvements,
            'deteriorations': deteriorations,
            'stable': stable,
            'improvement_rate': round(improvements / total * 100, 1),
            'trend': 'positive' if improvements > deteriorations else 'stable' if improvements == deteriorations else 'needs_attention'
        }
    
    def _analyze_engagement_patterns(self, sessions: List[GameSession]) -> Dict[str, Any]:
        """Analyze engagement patterns from game sessions"""
        if not sessions:
            return {'data_available': False}
        
        completed_sessions = [s for s in sessions if s.completion_status == "completed"]
        
        if not completed_sessions:
            return {'data_available': False, 'completion_rate': 0}
        
        # Calculate engagement metrics
        total_sessions = len(sessions)
        completion_rate = len(completed_sessions) / total_sessions * 100
        
        avg_score = sum(s.score for s in completed_sessions) / len(completed_sessions)
        avg_duration = sum(s.duration_seconds or 0 for s in completed_sessions) / len(completed_sessions)
        avg_interactions = sum(s.interactions_count for s in completed_sessions) / len(completed_sessions)
        
        return {
            'data_available': True,
            'total_sessions': total_sessions,
            'completed_sessions': len(completed_sessions),
            'completion_rate': round(completion_rate, 1),
            'average_score': round(avg_score, 1),
            'average_duration_minutes': round(avg_duration / 60, 1),
            'average_interactions': round(avg_interactions, 1),
            'engagement_trend': 'high' if completion_rate > 80 else 'moderate' if completion_rate > 60 else 'low'
        }

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def get_child_service(db: Session) -> ChildService:
    """Get ChildService instance"""
    return ChildService(db)

def get_activity_service(db: Session) -> ActivityService:
    """Get ActivityService instance"""
    return ActivityService(db)

def get_session_service(db: Session) -> GameSessionService:
    """Get GameSessionService instance"""
    return GameSessionService(db)

def get_professional_service(db: Session) -> ProfessionalService:
    """Get ProfessionalService instance"""
    return ProfessionalService(db)

def get_assessment_service(db: Session) -> AssessmentService:
    """Get AssessmentService instance"""
    return AssessmentService(db)

def get_analytics_service(db: Session) -> AnalyticsService:
    """Get AnalyticsService instance"""
    return AnalyticsService(db)