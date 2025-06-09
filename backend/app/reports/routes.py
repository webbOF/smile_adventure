"""
Reports and analytics routes
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Any
from app.core.database import get_db
from app.auth.routes import get_current_user
from app.auth.dependencies import require_professional
from app.users.models import User, Child, Activity
from app.users import crud
from app.core.config import settings
from app.reports.clinical_analytics import ClinicalAnalyticsService
from app.reports.crud import GameSessionService, ReportService
from app.reports.schemas import (
    # Game Session schemas
    GameSessionCreate, GameSessionUpdate, GameSessionComplete, GameSessionResponse,
    GameSessionAnalytics, GameSessionFilters,
    # Report schemas
    ReportCreate, ReportUpdate, ReportStatusUpdate, ReportResponse,
    ReportSummary, ReportPermissions, ReportFilters,
    # Analytics schemas
    ChildProgressAnalytics, ProgramEffectivenessReport,
    # Utility schemas
    PaginationParams, ExportRequest, ShareRequest, ValidationResult
)
from app.users.schemas import (
    ClinicalInsightResponse, PopulationAnalyticsRequest, 
    CohortComparisonRequest, ClinicalMetricsResponse
)
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Constants for error messages
CHILD_NOT_FOUND = "Child not found"
SESSION_NOT_FOUND = "Game session not found"
REPORT_NOT_FOUND = "Report not found"
ACCESS_DENIED = "Access denied"
START_DATE_DESC = "Start date for analysis"
END_DATE_DESC = "End date for analysis"
ANALYSIS_PERIOD_DESC = "Analysis period in days"

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

@router.get("/analytics/population", response_model=Dict[str, Any])
async def get_population_analytics(
    date_from: Optional[datetime] = Query(None, description="Start date for analysis"),
    date_to: Optional[datetime] = Query(None, description="End date for analysis"),
    age_min: Optional[int] = Query(None, ge=0, le=25, description="Minimum age filter"),
    age_max: Optional[int] = Query(None, ge=0, le=25, description="Maximum age filter"),
    support_level: Optional[int] = Query(None, ge=1, le=3, description="Support level filter"),
    current_user: User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive population analytics for professional's patients
    
    **Backend-only endpoint** - Returns JSON data for future frontend consumption
    
    Example response:
    ```json
    {
        "population_overview": {
            "total_patients": 24,
            "active_patients": 22,
            "date_range": {"start": "2024-01-01", "end": "2024-03-31"}
        },
        "demographics": {
            "age_statistics": {"mean": 8.4, "median": 7.0},
            "support_level_distribution": {"level_1": 8, "level_2": 12, "level_3": 4}
        },
        "clinical_outcomes": {
            "activity_metrics": {"total_activities": 892, "verification_rate": 78.5},
            "session_metrics": {"total_sessions": 456, "completion_rate": 84.2}
        }
    }
    ```
    """
    try:
        # Validate date range
        if date_from and date_to and date_to < date_from:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="End date must be after start date"
            )
        
        # Set default date range if not provided
        if not date_to:
            date_to = datetime.now(timezone.utc)
        if not date_from:
            date_from = date_to - timedelta(days=90)  # Default 90 days
        
        # Build filters
        filters = {}
        if age_min is not None:
            filters["age_min"] = age_min
        if age_max is not None:
            filters["age_max"] = age_max
        if support_level is not None:
            filters["support_level"] = support_level
        
        # Get analytics
        analytics_service = ClinicalAnalyticsService(db)
        population_data = analytics_service.get_patient_population_overview(
            professional_id=current_user.id,
            date_range=(date_from, date_to),
            filters=filters
        )
        
        return population_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in population analytics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate population analytics"
        )

@router.post("/analytics/cohort-comparison", response_model=Dict[str, Any])
async def compare_patient_cohorts(
    cohort_data: Dict[str, Any],
    current_user: User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """
    Compare multiple patient cohorts based on specified criteria
    
    **Backend-only endpoint** - Returns comprehensive cohort analysis
    
    Request body example:
    ```json
    {
        "cohorts": [
            {
                "name": "Young Children",
                "criteria": {"age_range": [3, 6], "support_level": 2}
            },
            {
                "name": "Verbal Communicators", 
                "criteria": {"communication_style": "verbal"}
            }
        ],
        "metrics": ["engagement", "progress", "completion_rate"]
    }
    ```
    """
    try:
        cohorts = cohort_data.get("cohorts", [])
        metrics = cohort_data.get("metrics", ["engagement", "progress", "completion_rate"])
        
        if len(cohorts) < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least 2 cohorts required for comparison"
            )
        
        if len(cohorts) > 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum 5 cohorts allowed for comparison"
            )
        
        # Extract criteria for each cohort
        cohort_criteria = [cohort.get("criteria", {}) for cohort in cohorts]
        
        # Perform comparison
        analytics_service = ClinicalAnalyticsService(db)
        comparison_results = analytics_service.compare_patient_cohorts(
            cohort_criteria=cohort_criteria,
            professional_id=current_user.id,
            metrics=metrics
        )
        
        # Add cohort names to results
        for i, cohort in enumerate(comparison_results.get("cohorts", [])):
            if i < len(cohorts):
                cohort["name"] = cohorts[i].get("name", f"Cohort {i+1}")
        
        return comparison_results
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in cohort comparison: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate cohort comparison"
        )

@router.get("/analytics/insights", response_model=Dict[str, Any])
async def get_clinical_insights(
    analysis_period: int = Query(default=90, ge=7, le=365, description=ANALYSIS_PERIOD_DESC),
    focus_areas: Optional[str] = Query(None, description="Comma-separated focus areas"),
    current_user: User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """
    Generate AI-powered clinical insights for professional's patient population
    
    **Backend-only endpoint** - Returns prioritized insights with recommendations
    
    Query parameters:
    - analysis_period: Number of days to analyze (7-365)
    - focus_areas: Optional comma-separated list (engagement,progress,risk,treatment)
    
    Example response:
    ```json
    {
        "insights": [
            {
                "type": "engagement",
                "title": "Low Engagement Alert",
                "description": "5 patients show low engagement patterns",
                "priority": "high",
                "confidence_score": 0.85,
                "recommendations": ["Review engagement strategies", "..."]
            }
        ],
        "total_insights": 3,
        "high_priority_count": 1
    }
    ```
    """
    try:
        # Parse focus areas
        focus_list = None
        if focus_areas:
            focus_list = [area.strip() for area in focus_areas.split(",")]
            valid_areas = ["engagement", "progress", "risk", "treatment"]
            focus_list = [area for area in focus_list if area in valid_areas]
        
        # Generate insights
        analytics_service = ClinicalAnalyticsService(db)
        insights = analytics_service.generate_clinical_insights(
            professional_id=current_user.id,
            analysis_period=analysis_period,
            focus_areas=focus_list
        )
        
        # Convert insights to dict format
        insights_data = []
        for insight in insights:
            insights_data.append({
                "type": insight.insight_type,
                "title": insight.title,
                "description": insight.description,
                "confidence_score": insight.confidence_score,
                "supporting_data": insight.supporting_data,
                "recommendations": insight.recommendations,
                "priority": insight.priority
            })
        
        return {
            "insights": insights_data,
            "analysis_period_days": analysis_period,
            "focus_areas": focus_list,
            "total_insights": len(insights_data),
            "high_priority_count": len([i for i in insights_data if i["priority"] == "high"]),
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating clinical insights: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate clinical insights"
        )

@router.get("/analytics/treatment-effectiveness", response_model=Dict[str, Any])
async def analyze_treatment_effectiveness(
    therapy_type: Optional[str] = Query(None, description="Specific therapy type to analyze"),
    date_from: Optional[datetime] = Query(None, description="Start date for analysis"),
    date_to: Optional[datetime] = Query(None, description="End date for analysis"),
    current_user: User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """
    Analyze treatment effectiveness across patient population
    
    **Backend-only endpoint** - Returns effectiveness metrics for therapies
    
    Example response:
    ```json
    {
        "treatment_analysis": {
            "therapy_effectiveness": {
                "ABA": {
                    "patient_count": 12,
                    "avg_activities_per_patient": 8.5,
                    "effectiveness_score": 85.0
                },
                "Speech Therapy": {
                    "patient_count": 8,
                    "effectiveness_score": 72.3
                }
            },
            "most_effective_therapy": "ABA"
        }
    }
    ```
    """
    try:
        # Set default date range
        if not date_to:
            date_to = datetime.now(timezone.utc)
        if not date_from:
            date_from = date_to - timedelta(days=180)  # Default 6 months
        
        # Get patients
        analytics_service = ClinicalAnalyticsService(db)
        patients = analytics_service._get_assigned_patients(current_user.id)
        
        # Analyze treatment effectiveness
        effectiveness_data = analytics_service._analyze_treatment_effectiveness(
            patients, (date_from, date_to)
        )
        
        # Filter by therapy type if specified
        if therapy_type:
            therapy_effectiveness = effectiveness_data.get("therapy_effectiveness", {})
            filtered_effectiveness = {
                k: v for k, v in therapy_effectiveness.items()
                if therapy_type.lower() in k.lower()
            }
            effectiveness_data["therapy_effectiveness"] = filtered_effectiveness
        
        return {
            "treatment_analysis": effectiveness_data,
            "analysis_period": {
                "start": date_from.isoformat(),
                "end": date_to.isoformat(),
                "days": (date_to - date_from).days
            },
            "therapy_filter": therapy_type,
            "patient_count": len(patients),
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in treatment effectiveness analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze treatment effectiveness"
        )

@router.get("/analytics/export", response_model=Any)
async def export_clinical_analytics(
    format: str = Query(default="json", regex="^(json|csv)$"),    include_patient_details: bool = Query(default=False, description="Include patient details"),
    analysis_period: int = Query(default=90, ge=7, le=365, description=ANALYSIS_PERIOD_DESC),
    current_user: User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """
    Export comprehensive clinical analytics data
    
    **Backend-only endpoint** - Returns data for download/external analysis
    
    Supported formats:
    - json: Complete structured data
    - csv: Tabular format for spreadsheet analysis
    
    Security note: Patient details only included if explicitly requested and authorized
    """
    try:
        # Generate comprehensive analytics
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=analysis_period)
        
        analytics_service = ClinicalAnalyticsService(db)
        
        # Get population overview
        population_data = analytics_service.get_patient_population_overview(
            professional_id=current_user.id,
            date_range=(start_date, end_date)
        )
        
        # Get insights
        insights = analytics_service.generate_clinical_insights(
            professional_id=current_user.id,
            analysis_period=analysis_period
        )
        
        # Prepare export data
        export_data = {
            "export_metadata": {
                "generated_by": f"{current_user.first_name} {current_user.last_name}",
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "analysis_period_days": analysis_period,
                "format": format,
                "includes_patient_details": include_patient_details,
                "professional_id": current_user.id
            },
            "population_analytics": population_data,
            "clinical_insights": [
                {
                    "type": insight.insight_type,
                    "title": insight.title,
                    "description": insight.description,
                    "priority": insight.priority,
                    "confidence_score": insight.confidence_score,
                    "recommendations": insight.recommendations
                }
                for insight in insights
            ]
        }
        
        # Handle different export formats
        if format == "json":
            from fastapi.responses import JSONResponse
            return JSONResponse(
                content=export_data,
                headers={
                    "Content-Disposition": f"attachment; filename=clinical_analytics_{current_user.id}_{analysis_period}d.json"
                }
            )
        
        elif format == "csv":
            # Generate CSV for key metrics
            import csv
            import io
            
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Write headers
            writer.writerow([
                "Metric_Category", "Metric_Name", "Value", "Unit", "Date_Range"
            ])
            
            # Write population metrics
            pop_overview = population_data.get("population_overview", {})
            writer.writerow([
                "Demographics", "Total Patients", pop_overview.get("total_patients", 0), 
                "count", f"{analysis_period} days"
            ])
            
            writer.writerow([
                "Demographics", "Active Patients", pop_overview.get("active_patients", 0), 
                "count", f"{analysis_period} days"
            ])
            
            # Write clinical outcomes
            outcomes = population_data.get("clinical_outcomes", {})
            activity_metrics = outcomes.get("activity_metrics", {})
            
            writer.writerow([
                "Outcomes", "Total Activities", activity_metrics.get("total_activities", 0),
                "count", f"{analysis_period} days"
            ])
            
            writer.writerow([
                "Outcomes", "Verification Rate", f"{activity_metrics.get('verification_rate', 0):.1f}",
                "percentage", f"{analysis_period} days"
            ])
            
            session_metrics = outcomes.get("session_metrics", {})
            writer.writerow([
                "Outcomes", "Session Completion Rate", f"{session_metrics.get('completion_rate', 0):.1f}",
                "percentage", f"{analysis_period} days"
            ])
            
            # Write insights summary
            priority_counts = {"high": 0, "medium": 0, "low": 0}
            for insight in insights:
                priority_counts[insight.priority] += 1
            
            for priority, count in priority_counts.items():
                writer.writerow([
                    "Insights", f"{priority.title()} Priority Insights", count,
                    "count", f"{analysis_period} days"
                ])
            
            from fastapi.responses import Response
            return Response(
                content=output.getvalue(),
                media_type="text/csv",
                headers={
                    "Content-Disposition": f"attachment; filename=clinical_metrics_{current_user.id}_{analysis_period}d.csv"
                }
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting clinical data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to export clinical data"
        )

# =============================================================================
# TASK 16 CLINICAL ANALYTICS ROUTE ALIASES
# =============================================================================

# Task 16 expects routes at /clinical-analytics/ instead of /analytics/
# These are aliases to the existing analytics endpoints

@router.get("/clinical-analytics/population", response_model=Dict[str, Any])
async def clinical_analytics_population(
    date_from: Optional[datetime] = Query(None, description="Start date for analysis"),
    date_to: Optional[datetime] = Query(None, description="End date for analysis"),
    age_min: Optional[int] = Query(None, ge=0, le=25, description="Minimum age filter"),
    age_max: Optional[int] = Query(None, ge=0, le=25, description="Maximum age filter"),
    support_level: Optional[int] = Query(None, ge=1, le=3, description="Support level filter"),
    current_user: User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """
    Task 16 Clinical Analytics - Population Overview
    Alias for existing /analytics/population endpoint
    """
    # Call the existing population analytics function
    return await get_population_analytics(
        date_from=date_from,
        date_to=date_to,
        age_min=age_min,
        age_max=age_max,
        support_level=support_level,
        current_user=current_user,
        db=db
    )

@router.get("/clinical-analytics/insights", response_model=Dict[str, Any])
async def clinical_analytics_insights(
    analysis_period: int = Query(default=90, ge=7, le=365, description=ANALYSIS_PERIOD_DESC),
    focus_areas: Optional[str] = Query(None, description="Comma-separated focus areas"),
    current_user: User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """
    Task 16 Clinical Analytics - Insights Overview
    Alias for existing /analytics/insights endpoint
    """
    # Call the existing insights analytics function
    return await get_clinical_insights(
        analysis_period=analysis_period,
        focus_areas=focus_areas,
        current_user=current_user,
        db=db
    )

# =============================================================================
# ENDPOINT DI TESTING E SVILUPPO
# =============================================================================

@router.get("/analytics/test-data", response_model=Dict[str, Any])
async def generate_test_analytics_data(
    current_user: User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """
    **DEVELOPMENT ONLY** - Generate test analytics data
    
    Questo endpoint genera dati di test per verificare il funzionamento
    del sistema analytics senza bisogno di dati reali.
    
    DA RIMUOVERE IN PRODUZIONE!
    """
    if not settings.DEBUG:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Endpoint not available in production"
        )
    
    # Genera dati di test
    mock_data = {
        "population_overview": {
            "total_patients": 15,
            "active_patients": 14,
            "test_data": True
        },
        "demographics": {
            "age_statistics": {
                "mean": 7.8,
                "median": 8.0,
                "distribution": {
                    "0-3": 2,
                    "4-6": 5,
                    "7-12": 6,
                    "13-18": 2
                }
            },
            "support_level_distribution": {
                "level_1": 6,
                "level_2": 7,
                "level_3": 2
            }
        },
        "clinical_outcomes": {
            "activity_metrics": {
                "total_activities": 450,
                "verification_rate": 82.3,
                "average_per_patient": 30.0
            },
            "session_metrics": {
                "total_sessions": 210,
                "completion_rate": 87.1,
                "average_per_patient": 14.0
            }
        },
        "test_insights": [
            {
                "type": "engagement",
                "title": "Test Insight - High Engagement",
                "description": "Test data shows excellent engagement patterns",
                "priority": "low",
                "confidence_score": 0.95
            }
        ],
        "note": "This is test data for development purposes"
    }
    
    return mock_data

# =============================================================================
# GAME SESSION ENDPOINTS
# =============================================================================

@router.post("/sessions", response_model=GameSessionResponse)
async def create_game_session(
    session_data: GameSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new game session for a child.
    
    This endpoint starts a new game session tracking for the specified child
    and scenario type. The session will be created with initial timing data
    and can be updated with progress as the child plays.
    """
    try:        # Verify that the child belongs to the current user or professional
        child = crud.get_child_by_id(db, child_id=session_data.child_id)
        if not child:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=CHILD_NOT_FOUND
            )
        
        # Check permissions
        if current_user.role == "parent" and child.parent_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Child does not belong to current user"
            )
        elif current_user.role == "professional":
            # Check if professional has access to this child
            professional_children = crud.get_assigned_children(db, professional_id=current_user.id)
            if child.id not in [c.id for c in professional_children]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: Child not assigned to current professional"
                )
        
        # Create the session
        session_service = GameSessionService(db)
        session = session_service.create_session(session_data)
        
        return GameSessionResponse.model_validate(session)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating game session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create game session"
        )

@router.get("/sessions/{session_id}", response_model=GameSessionResponse)
async def get_game_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get details of a specific game session.
    
    Returns comprehensive session data including game metrics, timing,
    emotional tracking, and parent feedback.
    """
    try:
        session_service = GameSessionService(db)
        session = session_service.get_session_by_id(session_id)
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Game session not found"
            )
        
        # Check permissions
        child = crud.get_child_by_id(db, child_id=session.child_id)
        if current_user.role == "parent" and child.parent_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        elif current_user.role == "professional":
            professional_children = crud.get_assigned_children(db, professional_id=current_user.id)
            if child.id not in [c.id for c in professional_children]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied"
                )
        
        return GameSessionResponse.model_validate(session)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving game session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve game session"
        )

@router.put("/sessions/{session_id}", response_model=GameSessionResponse)
async def update_game_session(
    session_id: int,
    session_update: GameSessionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update game session progress and metrics.
    
    This endpoint allows updating session progress as the child plays,
    including game metrics, emotional states, and behavioral observations.
    """
    try:
        session_service = GameSessionService(db)
        session = session_service.get_session_by_id(session_id)
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Game session not found"
            )
        
        # Check permissions
        child = crud.get_child_by_id(db, child_id=session.child_id)
        if current_user.role == "parent" and child.parent_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        elif current_user.role == "professional":
            professional_children = crud.get_assigned_children(db, professional_id=current_user.id)
            if child.id not in [c.id for c in professional_children]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied"
                )
        
        # Check if session is still active
        if session.completion_status == "completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot update completed session"
            )
        
        # Update the session
        updated_session = session_service.update_session_progress(session_id, session_update)
        return GameSessionResponse.model_validate(updated_session)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating game session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update game session"
        )

@router.post("/sessions/{session_id}/complete", response_model=GameSessionResponse)
async def complete_game_session(
    session_id: int,
    completion_data: GameSessionComplete,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark a game session as completed.
    
    This endpoint finalizes the session, calculates final metrics,
    and triggers any post-session analytics or recommendations.
    """
    try:
        session_service = GameSessionService(db)
        session = session_service.get_session_by_id(session_id)
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Game session not found"
            )
        
        # Check permissions
        child = crud.get_child_by_id(db, child_id=session.child_id)
        if current_user.role == "parent" and child.parent_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        elif current_user.role == "professional":
            professional_children = crud.get_assigned_children(db, professional_id=current_user.id)
            if child.id not in [c.id for c in professional_children]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied"
                )
        
        # Check if session is already completed
        if session.completion_status == "completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Session is already completed"
            )
        
        # Complete the session
        completed_session = session_service.complete_session(session_id, completion_data)
        return GameSessionResponse.model_validate(completed_session)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error completing game session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to complete game session"
        )

@router.get("/sessions", response_model=List[GameSessionResponse])
async def list_game_sessions(
    child_id: Optional[int] = Query(None, description="Filter by child ID"),
    session_type: Optional[str] = Query(None, description="Filter by session type"),
    date_from: Optional[datetime] = Query(None, description="Start date filter"),
    date_to: Optional[datetime] = Query(None, description="End date filter"),
    completion_status: Optional[str] = Query(None, description="Filter by completion status"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List game sessions with filtering and pagination.
    
    Returns a list of game sessions based on the provided filters.
    Results are paginated and include basic session information.
    """
    try:
        # Build filters
        filters = GameSessionFilters(
            child_id=child_id,
            session_type=session_type,
            date_from=date_from,
            date_to=date_to,
            completion_status=completion_status
        )
        
        pagination = PaginationParams(
            page=page,
            page_size=page_size
        )
        
        # Get accessible children for the user
        if current_user.role == "parent":
            accessible_children = crud.get_children_by_parent(db, parent_id=current_user.id)
        elif current_user.role == "professional":
            accessible_children = crud.get_assigned_children(db, professional_id=current_user.id)
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        accessible_child_ids = [child.id for child in accessible_children]
        
        # Apply child access filter
        if filters.child_id and filters.child_id not in accessible_child_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to specified child"
            )
        
        # Get sessions
        session_service = GameSessionService(db)
        sessions = session_service.list_sessions(
            filters=filters,
            pagination=pagination,
            accessible_child_ids=accessible_child_ids
        )
        
        return [GameSessionResponse.model_validate(session) for session in sessions]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing game sessions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list game sessions"
        )

@router.get("/sessions/{session_id}/analytics", response_model=GameSessionAnalytics)
async def get_session_analytics(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive analytics for a specific game session.
    
    Returns detailed behavioral insights, learning indicators,
    emotional journey analysis, and recommendations.
    """
    try:
        session_service = GameSessionService(db)
        session = session_service.get_session_by_id(session_id)
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Game session not found"
            )
        
        # Check permissions
        child = crud.get_child_by_id(db, child_id=session.child_id)
        if current_user.role == "parent" and child.parent_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        elif current_user.role == "professional":
            professional_children = crud.get_assigned_children(db, professional_id=current_user.id)
            if child.id not in [c.id for c in professional_children]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied"
                )
        
        # Generate analytics
        analytics = session_service.generate_session_analytics(session_id)
        return analytics
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating session analytics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate session analytics"
        )

@router.get("/children/{child_id}/sessions/trends", response_model=Dict[str, Any])
async def get_child_session_trends(
    child_id: int,
    days: int = Query(30, ge=7, le=365, description="Number of days to analyze"),
    session_type: Optional[str] = Query(None, description="Filter by session type"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get session trends and progress analysis for a specific child.
    
    Returns trend analysis showing progress over time, pattern recognition,
    and recommendations for future sessions.
    """
    try:
        # Check permissions
        child = crud.get_child_by_id(db, child_id=child_id)
        if not child:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Child not found"
            )
        
        if current_user.role == "parent" and child.parent_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        elif current_user.role == "professional":
            professional_children = crud.get_assigned_children(db, professional_id=current_user.id)
            if child.id not in [c.id for c in professional_children]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied"
                )
        
        # Generate trends
        session_service = GameSessionService(db)
        trends = session_service.analyze_child_session_trends(
            child_id=child_id,
            days=days,
            session_type=session_type
        )
        
        return trends
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing session trends: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze session trends"
        )

@router.delete("/sessions/{session_id}")
async def delete_game_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a game session.
    
    Note: This is typically only allowed for incomplete sessions
    or by administrators for data cleanup purposes.
    """
    try:
        session_service = GameSessionService(db)
        session = session_service.get_session_by_id(session_id)
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Game session not found"
            )
        
        # Check permissions - only parents/professionals can delete their sessions
        child = crud.get_child_by_id(db, child_id=session.child_id)
        if current_user.role == "parent" and child.parent_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        elif current_user.role == "professional":
            professional_children = crud.get_assigned_children(db, professional_id=current_user.id)
            if child.id not in [c.id for c in professional_children]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied"
                )
        
        # Additional restrictions
        if session.completion_status == "completed" and current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete completed sessions"
            )
        
        # Delete the session
        session_service.delete_session(session_id)
        
        return {"message": "Game session deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting game session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete game session"
        )

# =============================================================================
# REPORT ENDPOINTS
# =============================================================================

@router.post("/reports", response_model=ReportResponse)
async def create_report(
    report_data: ReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new clinical report for a child.
    
    This endpoint creates a comprehensive report with flexible content structure,
    metrics tracking, and workflow management capabilities.
    """
    try:
        # Verify that the child exists and user has access
        child = crud.get_child_by_id(db, child_id=report_data.child_id)
        if not child:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=CHILD_NOT_FOUND
            )
        
        # Check permissions
        if current_user.role == "parent" and child.parent_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=ACCESS_DENIED
            )
        elif current_user.role == "professional":
            professional_children = crud.get_assigned_children(db, professional_id=current_user.id)
            if child.id not in [c.id for c in professional_children]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=ACCESS_DENIED
                )
        
        # Set professional_id if not provided and user is professional
        if not report_data.professional_id and current_user.role == "professional":
            report_data.professional_id = current_user.id        # Create the report
        report_service = ReportService(db)
        report = report_service.create_report(report_data, current_user.id)
        
        return ReportResponse.model_validate(report)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating report: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create report"
        )

@router.get("/reports/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get details of a specific report.
    
    Returns comprehensive report data including content, metrics,
    and workflow information based on user permissions.
    """
    try:
        report_service = ReportService(db)
        report = report_service.get_report_by_id(report_id, current_user.id, current_user.role)
        
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=REPORT_NOT_FOUND
            )
        
        # Check permissions
        child = crud.get_child_by_id(db, child_id=report.child_id)
        if current_user.role == "parent" and child.parent_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=ACCESS_DENIED
            )
        elif current_user.role == "professional":
            professional_children = crud.get_assigned_children(db, professional_id=current_user.id)
            if child.id not in [c.id for c in professional_children]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=ACCESS_DENIED
                )
        
        # Apply content filtering based on permissions and sharing settings
        filtered_report = report_service.apply_permission_filters(report, current_user)
        
        return ReportResponse.model_validate(filtered_report)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving report: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve report"
        )

@router.put("/reports/{report_id}", response_model=ReportResponse)
async def update_report(
    report_id: int,
    report_update: ReportUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing report.
    
    This endpoint allows updating report content, metrics, and metadata.
    Workflow rules are enforced based on report status.
    """
    try:
        report_service = ReportService(db)
        report = report_service.get_report_by_id(report_id, current_user.id, current_user.role)
        
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=REPORT_NOT_FOUND
            )
        
        # Check edit permissions
        if not report_service.can_edit_report(report, current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot edit report: insufficient permissions or report status"
            )
          # Update the report
        updated_report = report_service.update_report(report_id, report_update, current_user.id)
        return ReportResponse.model_validate(updated_report)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating report: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update report"
        )

@router.patch("/reports/{report_id}/status", response_model=ReportResponse)
async def update_report_status(
    report_id: int,
    status_update: ReportStatusUpdate,
    current_user: User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """
    Update report status (workflow management).
    
    This endpoint manages the report workflow: draft → review → approved → published.
    Only professionals can update report status.
    """
    try:
        report_service = ReportService(db)
        report = report_service.get_report_by_id(report_id, current_user.id, current_user.role)
        
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=REPORT_NOT_FOUND
            )
        
        # Check if professional has access to this report
        child = crud.get_child_by_id(db, child_id=report.child_id)
        professional_children = crud.get_assigned_children(db, professional_id=current_user.id)
        if child.id not in [c.id for c in professional_children]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=ACCESS_DENIED
            )
        
        # Update status with workflow validation
        updated_report = report_service.update_report_status(
            report_id, 
            status_update.status, 
            current_user.id,
            status_update.reviewer_notes
        )
        
        return ReportResponse.model_validate(updated_report)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating report status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update report status"
        )

@router.get("/reports", response_model=List[ReportSummary])
async def list_reports(
    child_id: Optional[int] = Query(None, description="Filter by child ID"),
    report_type: Optional[str] = Query(None, description="Filter by report type"),
    status: Optional[str] = Query(None, description="Filter by status"),
    date_from: Optional[datetime] = Query(None, description=START_DATE_DESC),
    date_to: Optional[datetime] = Query(None, description=END_DATE_DESC),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List reports with filtering and pagination.
    
    Returns a list of report summaries based on the provided filters.
    Results are filtered by user access permissions.
    """
    try:
        # Build filters
        filters = ReportFilters(
            child_id=child_id,
            report_type=report_type,
            status=status,
            date_from=date_from,
            date_to=date_to
        )
        
        if current_user.role == "professional":
            filters.professional_id = current_user.id
        
        pagination = PaginationParams(
            page=page,
            page_size=page_size
        )
        
        # Get accessible children for the user
        if current_user.role == "parent":
            accessible_children = crud.get_children_by_parent(db, parent_id=current_user.id)
        elif current_user.role == "professional":
            accessible_children = crud.get_assigned_children(db, professional_id=current_user.id)
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=ACCESS_DENIED
            )
        
        accessible_child_ids = [child.id for child in accessible_children]
        
        # Apply child access filter
        if filters.child_id and filters.child_id not in accessible_child_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to specified child"
            )
        
        # Get reports
        report_service = ReportService(db)
        reports = report_service.list_reports(
            filters=filters,
            pagination=pagination,
            accessible_child_ids=accessible_child_ids
        )
        
        return [ReportSummary.model_validate(report) for report in reports]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing reports: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list reports"
        )

@router.post("/reports/{report_id}/generate", response_model=ReportResponse)
async def auto_generate_report_content(
    report_id: int,
    generation_params: Optional[Dict[str, Any]] = None,
    current_user: User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """
    Auto-generate report content based on child's session data.
    
    This endpoint uses AI analysis to generate comprehensive report content
    from the child's game sessions and activities.
    """
    try:
        report_service = ReportService(db)
        report = report_service.get_report_by_id(report_id, current_user.id, current_user.role)
        
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=REPORT_NOT_FOUND
            )
        
        # Check permissions
        child = crud.get_child_by_id(db, child_id=report.child_id)
        professional_children = crud.get_assigned_children(db, professional_id=current_user.id)
        if child.id not in [c.id for c in professional_children]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=ACCESS_DENIED
            )
        
        # Check if report can be auto-generated
        if report.status not in ["draft", "pending_review"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot auto-generate content for reports with current status"
            )
        
        # Generate content
        generated_report = report_service.auto_generate_content(
            report_id, 
            current_user.id,
            generation_params or {}
        )
        
        return ReportResponse.model_validate(generated_report)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error auto-generating report content: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to auto-generate report content"
        )

@router.get("/reports/{report_id}/export")
async def export_report(
    report_id: int,
    export_request: ExportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export report in various formats (PDF, Excel, CSV, JSON).
    
    This endpoint generates downloadable report exports with
    customizable content and formatting options.
    """
    try:
        report_service = ReportService(db)
        report = report_service.get_report_by_id(report_id, current_user.id, current_user.role)
        
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=REPORT_NOT_FOUND
            )
        
        # Check permissions
        child = crud.get_child_by_id(db, child_id=report.child_id)
        if current_user.role == "parent" and child.parent_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=ACCESS_DENIED
            )
        elif current_user.role == "professional":
            professional_children = crud.get_assigned_children(db, professional_id=current_user.id)
            if child.id not in [c.id for c in professional_children]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=ACCESS_DENIED
                )
        
        # Check export permissions
        if not report_service.can_export_report(report, current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Export not allowed for this report"
            )
        
        # Generate export
        export_result = report_service.export_report(report_id, export_request, current_user)
        
        return export_result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting report: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to export report"
        )

@router.post("/reports/{report_id}/share")
async def share_report(
    report_id: int,
    share_request: ShareRequest,
    current_user: User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """
    Share report with external parties.
    
    This endpoint manages secure report sharing with controlled access
    and expiration settings.
    """
    try:
        report_service = ReportService(db)
        report = report_service.get_report_by_id(report_id, current_user.id, current_user.role)
        
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=REPORT_NOT_FOUND
            )
        
        # Check permissions
        child = crud.get_child_by_id(db, child_id=report.child_id)
        professional_children = crud.get_assigned_children(db, professional_id=current_user.id)
        if child.id not in [c.id for c in professional_children]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=ACCESS_DENIED
            )
        
        # Check sharing permissions
        if not report_service.can_share_report(report, current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sharing not allowed for this report"
            )
        
        # Create share
        share_result = report_service.create_share_link(
            report_id, 
            share_request, 
            current_user.id
        )
        
        return share_result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sharing report: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to share report"
        )

@router.get("/reports/{report_id}/permissions", response_model=ReportPermissions)
async def get_report_permissions(
    report_id: int,
    current_user: User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """
    Get report sharing permissions and access settings.
    
    Returns current permission configuration for the report.
    """
    try:
        report_service = ReportService(db)
        report = report_service.get_report_by_id(report_id, current_user.id, current_user.role)
        
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=REPORT_NOT_FOUND
            )
        
        # Check permissions
        child = crud.get_child_by_id(db, child_id=report.child_id)
        professional_children = crud.get_assigned_children(db, professional_id=current_user.id)
        if child.id not in [c.id for c in professional_children]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=ACCESS_DENIED
            )
        
        # Get permissions
        permissions = report_service.get_report_permissions(report_id)
        return permissions
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving report permissions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve report permissions"
        )

@router.put("/reports/{report_id}/permissions", response_model=ReportPermissions)
async def update_report_permissions(
    report_id: int,
    permissions: ReportPermissions,
    current_user: User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """
    Update report sharing permissions.
    
    This endpoint manages access control for reports including
    parent access, school sharing, and external professional access.
    """
    try:
        report_service = ReportService(db)
        report = report_service.get_report_by_id(report_id, current_user.id, current_user.role)
        
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=REPORT_NOT_FOUND
            )
        
        # Check permissions
        child = crud.get_child_by_id(db, child_id=report.child_id)
        professional_children = crud.get_assigned_children(db, professional_id=current_user.id)
        if child.id not in [c.id for c in professional_children]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=ACCESS_DENIED
            )
        
        # Update permissions
        updated_permissions = report_service.update_report_permissions(
            report_id, 
            permissions, 
            current_user.id
        )
        
        return updated_permissions
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating report permissions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update report permissions"
        )

@router.delete("/reports/{report_id}")
async def delete_report(
    report_id: int,
    current_user: User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """
    Delete a report.
    
    Note: Only draft reports can typically be deleted.
    Published reports may be archived instead.
    """
    try:
        report_service = ReportService(db)
        report = report_service.get_report_by_id(report_id, current_user.id, current_user.role)
        
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=REPORT_NOT_FOUND
            )
        
        # Check permissions
        child = crud.get_child_by_id(db, child_id=report.child_id)
        professional_children = crud.get_assigned_children(db, professional_id=current_user.id)
        if child.id not in [c.id for c in professional_children]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=ACCESS_DENIED
            )
        
        # Check if report can be deleted
        if not report_service.can_delete_report(report, current_user):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete report: invalid status or insufficient permissions"
            )
        
        # Delete the report
        report_service.delete_report(report_id)
        
        return {"message": "Report deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting report: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete report"
        )

# =============================================================================
# ANALYTICS AND PROGRESS ENDPOINTS
# =============================================================================

@router.get("/children/{child_id}/progress", response_model=ChildProgressAnalytics)
async def get_child_progress_analytics(
    child_id: int,    period_days: int = Query(30, ge=7, le=365, description=ANALYSIS_PERIOD_DESC),
    include_recommendations: bool = Query(True, description="Include AI recommendations"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive progress analytics for a child.
    
    Returns detailed analysis of session performance, behavioral trends,
    skill development, and actionable recommendations.
    """
    try:
        # Check permissions
        child = crud.get_child_by_id(db, child_id=child_id)
        if not child:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=CHILD_NOT_FOUND
            )
        
        if current_user.role == "parent" and child.parent_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=ACCESS_DENIED
            )
        elif current_user.role == "professional":
            professional_children = crud.get_assigned_children(db, professional_id=current_user.id)
            if child.id not in [c.id for c in professional_children]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=ACCESS_DENIED
                )
        
        # Generate progress analytics
        session_service = GameSessionService(db)
        progress_analytics = session_service.generate_child_progress_analytics(
            child_id=child_id,
            period_days=period_days,
            include_recommendations=include_recommendations
        )
        
        return progress_analytics
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating progress analytics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate progress analytics"
        )

# ...existing analytics endpoints...