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
from app.users.schemas import (
    ClinicalInsightResponse, PopulationAnalyticsRequest, 
    CohortComparisonRequest, ClinicalMetricsResponse
)
import logging

logger = logging.getLogger(__name__)
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
    analysis_period: int = Query(default=90, ge=7, le=365, description="Analysis period in days"),
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
    format: str = Query(default="json", regex="^(json|csv)$"),
    include_patient_details: bool = Query(default=False, description="Include patient details"),
    analysis_period: int = Query(default=90, ge=7, le=365, description="Analysis period in days"),
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
    analysis_period: int = Query(default=90, ge=7, le=365, description="Analysis period in days"),
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