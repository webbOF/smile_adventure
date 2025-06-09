"""
Task 16: Clinical Analytics Implementation
File: backend/app/reports/clinical_analytics.py

Comprehensive clinical analytics service for healthcare professionals
"""

from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc
from dataclasses import dataclass
import statistics
import logging

from app.users.models import Child, Activity, Assessment, ProfessionalProfile
from app.reports.models import GameSession
from app.auth.models import User, UserRole
from app.users.crud import get_analytics_service

logger = logging.getLogger(__name__)

# =============================================================================
# DATA CLASSES FOR CLINICAL ANALYTICS
# =============================================================================

@dataclass
class ClinicalMetrics:
    """Clinical metrics data structure"""
    patient_count: int
    total_sessions: int
    average_engagement: float
    improvement_rate: float
    completion_rate: float
    assessment_scores: Dict[str, float]
    behavioral_trends: Dict[str, Any]

@dataclass
class PatientCohort:
    """Patient cohort analysis structure"""
    cohort_id: str
    criteria: Dict[str, Any]
    patient_count: int
    demographics: Dict[str, Any]
    outcomes: Dict[str, float]
    recommendations: List[str]

@dataclass
class ClinicalInsight:
    """Clinical insight structure"""
    insight_type: str
    title: str
    description: str
    confidence_score: float
    supporting_data: Dict[str, Any]
    recommendations: List[str]
    priority: str  # high, medium, low

# =============================================================================
# CLINICAL ANALYTICS SERVICE
# =============================================================================

class ClinicalAnalyticsService:
    """
    Advanced clinical analytics service for healthcare professionals
    Provides comprehensive analysis tools for patient populations
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    # =========================================================================
    # PATIENT POPULATION ANALYTICS
    # =========================================================================
    
    def get_patient_population_overview(
        self, 
        professional_id: int,
        date_range: Optional[Tuple[datetime, datetime]] = None,
        filters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Get comprehensive overview of patient population
        
        Args:
            professional_id: ID of the professional
            date_range: Optional date range for analysis
            filters: Optional filters (age, support_level, etc.)
            
        Returns:
            Comprehensive population analytics
        """
        try:
            # Get assigned patients (placeholder - would need assignment system)
            patients = self._get_assigned_patients(professional_id, filters)
            
            if not patients:
                return {
                    "message": "No patients assigned",
                    "patient_count": 0,
                    "analytics": {}
                }
            
            # Demographics analysis
            demographics = self._analyze_patient_demographics(patients)
            
            # Clinical outcomes analysis
            outcomes = self._analyze_clinical_outcomes(patients, date_range)
            
            # Progress trends
            trends = self._analyze_population_trends(patients, date_range)
            
            # Risk assessment
            risk_analysis = self._assess_population_risk(patients)
            
            # Treatment effectiveness
            treatment_effectiveness = self._analyze_treatment_effectiveness(patients, date_range)
            
            return {
                "population_overview": {
                    "total_patients": len(patients),
                    "active_patients": len([p for p in patients if p.is_active]),
                    "date_range": {
                        "start": date_range[0].isoformat() if date_range else None,
                        "end": date_range[1].isoformat() if date_range else None
                    }
                },
                "demographics": demographics,
                "clinical_outcomes": outcomes,
                "progress_trends": trends,
                "risk_analysis": risk_analysis,
                "treatment_effectiveness": treatment_effectiveness,
                "generated_at": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in patient population analysis: {str(e)}")
            return {"error": "Failed to generate population analytics"}
    
    def _get_assigned_patients(
        self, 
        professional_id: int, 
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Child]:
        """Get patients assigned to professional (placeholder implementation)"""
        # In a real implementation, this would query patient-professional assignments
        # For now, return a sample of children for demonstration
        query = self.db.query(Child).filter(Child.is_active == True)
        
        if filters:
            if 'age_min' in filters:
                query = query.filter(Child.age >= filters['age_min'])
            if 'age_max' in filters:
                query = query.filter(Child.age <= filters['age_max'])
            if 'support_level' in filters:
                query = query.filter(Child.support_level == filters['support_level'])
        
        return query.limit(20).all()  # Limit for demo
    
    def _analyze_patient_demographics(self, patients: List[Child]) -> Dict[str, Any]:
        """Analyze patient demographics"""
        if not patients:
            return {}
        
        ages = [p.age for p in patients]
        support_levels = [p.support_level for p in patients if p.support_level]
        
        # Age distribution
        age_groups = {
            "0-3": len([p for p in patients if 0 <= p.age <= 3]),
            "4-6": len([p for p in patients if 4 <= p.age <= 6]),
            "7-12": len([p for p in patients if 7 <= p.age <= 12]),
            "13-18": len([p for p in patients if 13 <= p.age <= 18]),
            "19+": len([p for p in patients if p.age >= 19])
        }
        
        # Support level distribution
        support_distribution = {
            "level_1": len([p for p in patients if p.support_level == 1]),
            "level_2": len([p for p in patients if p.support_level == 2]),
            "level_3": len([p for p in patients if p.support_level == 3]),
            "unspecified": len([p for p in patients if not p.support_level])
        }
        
        # Communication styles
        comm_styles = {}
        for patient in patients:
            style = patient.communication_style or "unspecified"
            comm_styles[style] = comm_styles.get(style, 0) + 1
        
        return {
            "total_patients": len(patients),
            "age_statistics": {
                "mean": round(statistics.mean(ages), 1),
                "median": round(statistics.median(ages), 1),
                "range": [min(ages), max(ages)],
                "distribution": age_groups
            },
            "support_level_distribution": support_distribution,
            "communication_styles": comm_styles,
            "gender_distribution": {
                "male": 0,  # Would need gender field
                "female": 0,
                "not_specified": len(patients)
            }
        }
    
    def _analyze_clinical_outcomes(
        self, 
        patients: List[Child], 
        date_range: Optional[Tuple[datetime, datetime]]
    ) -> Dict[str, Any]:
        """Analyze clinical outcomes across patient population"""
        if not patients:
            return {}
        
        patient_ids = [p.id for p in patients]
        
        # Activity completion rates
        activity_query = self.db.query(Activity).filter(Activity.child_id.in_(patient_ids))
        if date_range:
            activity_query = activity_query.filter(
                and_(
                    Activity.completed_at >= date_range[0],
                    Activity.completed_at <= date_range[1]
                )
            )
        
        activities = activity_query.all()
        
        # Game session completion rates
        session_query = self.db.query(GameSession).filter(GameSession.child_id.in_(patient_ids))
        if date_range:
            session_query = session_query.filter(
                and_(
                    GameSession.started_at >= date_range[0],
                    GameSession.started_at <= date_range[1]
                )
            )
        
        sessions = session_query.all()
        
        # Calculate outcomes
        total_activities = len(activities)
        verified_activities = len([a for a in activities if a.verified_by_parent])
        total_sessions = len(sessions)
        completed_sessions = len([s for s in sessions if s.completion_status == "completed"])
        
        # Emotional improvement analysis
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
        
        return {
            "activity_metrics": {
                "total_activities": total_activities,
                "verified_activities": verified_activities,
                "verification_rate": (verified_activities / total_activities * 100) if total_activities > 0 else 0,
                "average_per_patient": round(total_activities / len(patients), 1)
            },
            "session_metrics": {
                "total_sessions": total_sessions,
                "completed_sessions": completed_sessions,
                "completion_rate": (completed_sessions / total_sessions * 100) if total_sessions > 0 else 0,
                "average_per_patient": round(total_sessions / len(patients), 1)
            },
            "emotional_outcomes": {
                "tracked_activities": len(emotional_activities),
                "improvements": emotional_improvements,
                "improvement_rate": (emotional_improvements / len(emotional_activities) * 100) if emotional_activities else 0
            },
            "engagement_metrics": self._calculate_engagement_metrics(sessions)
        }
    
    def _analyze_population_trends(
        self, 
        patients: List[Child], 
        date_range: Optional[Tuple[datetime, datetime]]
    ) -> Dict[str, Any]:
        """Analyze trends across patient population"""
        if not patients or not date_range:
            return {}
        
        patient_ids = [p.id for p in patients]
        
        # Weekly activity trends
        weekly_data = {}
        current_date = date_range[0]
        
        while current_date <= date_range[1]:
            week_start = current_date
            week_end = current_date + timedelta(days=7)
            
            week_activities = self.db.query(Activity).filter(
                and_(
                    Activity.child_id.in_(patient_ids),
                    Activity.completed_at >= week_start,
                    Activity.completed_at < week_end
                )
            ).count()
            
            week_sessions = self.db.query(GameSession).filter(
                and_(
                    GameSession.child_id.in_(patient_ids),
                    GameSession.started_at >= week_start,
                    GameSession.started_at < week_end
                )
            ).count()
            
            week_key = week_start.strftime("%Y-W%W")
            weekly_data[week_key] = {
                "activities": week_activities,
                "sessions": week_sessions,
                "week_start": week_start.isoformat()
            }
            
            current_date = week_end
        
        # Calculate trends
        activity_values = [data["activities"] for data in weekly_data.values()]
        session_values = [data["sessions"] for data in weekly_data.values()]
        
        return {
            "weekly_breakdown": weekly_data,
            "trend_analysis": {
                "activity_trend": self._calculate_trend(activity_values),
                "session_trend": self._calculate_trend(session_values),
                "weeks_analyzed": len(weekly_data)
            },
            "peak_performance": {
                "best_activity_week": max(weekly_data.items(), key=lambda x: x[1]["activities"])[0] if weekly_data else None,
                "best_session_week": max(weekly_data.items(), key=lambda x: x[1]["sessions"])[0] if weekly_data else None
            }
        }
    
    def _assess_population_risk(self, patients: List[Child]) -> Dict[str, Any]:
        """Assess risk factors across patient population"""
        if not patients:
            return {}
        
        # Risk factor analysis
        high_risk_patients = []
        medium_risk_patients = []
        low_risk_patients = []
        
        for patient in patients:
            risk_score = 0
            risk_factors = []
            
            # Age-related risk
            if patient.age < 3:
                risk_score += 2
                risk_factors.append("early_intervention_critical")
            elif patient.age > 18:
                risk_score += 1
                risk_factors.append("transition_to_adult_services")
            
            # Support level risk
            if patient.support_level == 3:
                risk_score += 3
                risk_factors.append("high_support_needs")
            elif patient.support_level == 2:
                risk_score += 2
                risk_factors.append("substantial_support_needs")
            
            # Safety protocol risk
            if patient.safety_protocols:
                elopement_risk = patient.safety_protocols.get("elopement_risk", "none")
                if elopement_risk == "high":
                    risk_score += 3
                    risk_factors.append("high_elopement_risk")
                elif elopement_risk == "moderate":
                    risk_score += 1
                    risk_factors.append("moderate_elopement_risk")
            
            # Activity level risk (low engagement)
            recent_activities = self.db.query(Activity).filter(
                and_(
                    Activity.child_id == patient.id,
                    Activity.completed_at >= datetime.now(timezone.utc) - timedelta(days=30)
                )
            ).count()
            
            if recent_activities < 5:
                risk_score += 2
                risk_factors.append("low_engagement")
            
            # Categorize risk
            patient_risk = {
                "patient_id": patient.id,
                "name": patient.name,
                "risk_score": risk_score,
                "risk_factors": risk_factors
            }
            
            if risk_score >= 5:
                high_risk_patients.append(patient_risk)
            elif risk_score >= 3:
                medium_risk_patients.append(patient_risk)
            else:
                low_risk_patients.append(patient_risk)
        
        return {
            "risk_distribution": {
                "high_risk": len(high_risk_patients),
                "medium_risk": len(medium_risk_patients),
                "low_risk": len(low_risk_patients)
            },
            "high_risk_patients": high_risk_patients,
            "medium_risk_patients": medium_risk_patients[:5],  # Top 5 for display
            "risk_factors_summary": self._summarize_risk_factors(
                high_risk_patients + medium_risk_patients + low_risk_patients
            ),
            "recommendations": self._generate_risk_recommendations(high_risk_patients, medium_risk_patients)
        }
    
    def _analyze_treatment_effectiveness(
        self, 
        patients: List[Child], 
        date_range: Optional[Tuple[datetime, datetime]]
    ) -> Dict[str, Any]:
        """Analyze treatment effectiveness across population"""
        if not patients:
            return {}
        
        # Therapy type effectiveness
        therapy_effectiveness = {}
        
        for patient in patients:
            if not patient.current_therapies:
                continue
                
            for therapy in patient.current_therapies:
                therapy_type = therapy.get("type", "unknown")
                
                if therapy_type not in therapy_effectiveness:
                    therapy_effectiveness[therapy_type] = {
                        "patient_count": 0,
                        "total_activities": 0,
                        "avg_progress": 0,
                        "outcomes": []
                    }
                
                therapy_effectiveness[therapy_type]["patient_count"] += 1
                
                # Get activities related to this therapy type
                therapy_activities = self.db.query(Activity).filter(
                    and_(
                        Activity.child_id == patient.id,
                        Activity.activity_type.like(f"%{therapy_type.lower()}%")
                    )
                ).count()
                
                therapy_effectiveness[therapy_type]["total_activities"] += therapy_activities
        
        # Calculate effectiveness scores
        for therapy_type, data in therapy_effectiveness.items():
            if data["patient_count"] > 0:
                data["avg_activities_per_patient"] = round(
                    data["total_activities"] / data["patient_count"], 1
                )
                data["effectiveness_score"] = min(
                    data["avg_activities_per_patient"] / 10 * 100, 100
                )  # Normalize to 0-100 scale
        
        return {
            "therapy_effectiveness": therapy_effectiveness,
            "most_effective_therapy": max(
                therapy_effectiveness.items(),
                key=lambda x: x[1].get("effectiveness_score", 0)
            )[0] if therapy_effectiveness else None,
            "recommendations": self._generate_therapy_recommendations(therapy_effectiveness)
        }
    
    # =========================================================================
    # PATIENT COMPARISON ANALYTICS
    # =========================================================================
    
    def compare_patient_cohorts(
        self,
        cohort_criteria: List[Dict[str, Any]],
        professional_id: int,
        metrics: List[str] = None
    ) -> Dict[str, Any]:
        """
        Compare different patient cohorts based on specified criteria
        
        Args:
            cohort_criteria: List of criteria for each cohort
            professional_id: Professional requesting comparison
            metrics: Specific metrics to compare
            
        Returns:
            Cohort comparison analysis
        """
        try:
            cohorts = []
            
            for i, criteria in enumerate(cohort_criteria):
                cohort_id = f"cohort_{i+1}"
                patients = self._get_patients_by_criteria(professional_id, criteria)
                
                if patients:
                    cohort_analysis = self._analyze_cohort(cohort_id, criteria, patients, metrics)
                    cohorts.append(cohort_analysis)
            
            # Generate comparison insights
            comparison_insights = self._generate_cohort_insights(cohorts)
            
            return {
                "cohorts": cohorts,
                "comparison_summary": {
                    "total_cohorts": len(cohorts),
                    "total_patients": sum(c["patient_count"] for c in cohorts),
                    "metrics_compared": metrics or ["engagement", "progress", "completion_rate"]
                },
                "insights": comparison_insights,
                "generated_at": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in cohort comparison: {str(e)}")
            return {"error": "Failed to generate cohort comparison"}
    
    def _get_patients_by_criteria(
        self, 
        professional_id: int, 
        criteria: Dict[str, Any]
    ) -> List[Child]:
        """Get patients matching specific criteria"""
        # Start with assigned patients
        patients = self._get_assigned_patients(professional_id)
        
        # Apply criteria filters
        filtered_patients = []
        
        for patient in patients:
            matches_criteria = True
            
            # Age criteria
            if "age_range" in criteria:
                age_min, age_max = criteria["age_range"]
                if not (age_min <= patient.age <= age_max):
                    matches_criteria = False
            
            # Support level criteria
            if "support_level" in criteria:
                if patient.support_level != criteria["support_level"]:
                    matches_criteria = False
            
            # Communication style criteria
            if "communication_style" in criteria:
                if patient.communication_style != criteria["communication_style"]:
                    matches_criteria = False
            
            # Therapy criteria
            if "has_therapy" in criteria:
                therapy_type = criteria["has_therapy"]
                has_therapy = any(
                    therapy.get("type", "").lower() == therapy_type.lower()
                    for therapy in (patient.current_therapies or [])
                )
                if not has_therapy:
                    matches_criteria = False
            
            if matches_criteria:
                filtered_patients.append(patient)
        
        return filtered_patients
    
    def _analyze_cohort(
        self,
        cohort_id: str,
        criteria: Dict[str, Any],
        patients: List[Child],
        metrics: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Analyze a specific patient cohort"""
        if not patients:
            return {
                "cohort_id": cohort_id,
                "criteria": criteria,
                "patient_count": 0,
                "error": "No patients match criteria"
            }
        
        # Demographics
        demographics = self._analyze_patient_demographics(patients)
        
        # Outcomes for last 90 days
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=90)
        outcomes = self._analyze_clinical_outcomes(patients, (start_date, end_date))
        
        # Calculate cohort-specific metrics
        cohort_metrics = {}
        
        if not metrics:
            metrics = ["engagement", "progress", "completion_rate", "emotional_improvement"]
        
        for metric in metrics:
            if metric == "engagement":
                cohort_metrics[metric] = outcomes.get("session_metrics", {}).get("completion_rate", 0)
            elif metric == "progress":
                cohort_metrics[metric] = outcomes.get("activity_metrics", {}).get("average_per_patient", 0)
            elif metric == "completion_rate":
                cohort_metrics[metric] = outcomes.get("activity_metrics", {}).get("verification_rate", 0)
            elif metric == "emotional_improvement":
                cohort_metrics[metric] = outcomes.get("emotional_outcomes", {}).get("improvement_rate", 0)
        
        return {
            "cohort_id": cohort_id,
            "criteria": criteria,
            "patient_count": len(patients),
            "demographics": demographics,
            "outcomes": outcomes,
            "metrics": cohort_metrics,
            "top_performers": [
                {"id": p.id, "name": p.name, "points": p.points}
                for p in sorted(patients, key=lambda x: x.points, reverse=True)[:3]
            ]
        }
    
    # =========================================================================
    # CLINICAL INSIGHTS GENERATION
    # =========================================================================
    
    def generate_clinical_insights(
        self,
        professional_id: int,
        analysis_period: int = 90,
        focus_areas: Optional[List[str]] = None
    ) -> List[ClinicalInsight]:
        """
        Generate AI-powered clinical insights
        
        Args:
            professional_id: Professional requesting insights
            analysis_period: Period in days for analysis
            focus_areas: Specific areas to focus on
            
        Returns:
            List of clinical insights with recommendations
        """
        try:
            patients = self._get_assigned_patients(professional_id)
            
            if not patients:
                return []
            
            insights = []
            
            # Engagement insights
            if not focus_areas or "engagement" in focus_areas:
                engagement_insights = self._generate_engagement_insights(patients, analysis_period)
                insights.extend(engagement_insights)
            
            # Progress insights
            if not focus_areas or "progress" in focus_areas:
                progress_insights = self._generate_progress_insights(patients, analysis_period)
                insights.extend(progress_insights)
            
            # Risk insights
            if not focus_areas or "risk" in focus_areas:
                risk_insights = self._generate_risk_insights(patients)
                insights.extend(risk_insights)
            
            # Treatment insights
            if not focus_areas or "treatment" in focus_areas:
                treatment_insights = self._generate_treatment_insights(patients, analysis_period)
                insights.extend(treatment_insights)
            
            # Sort by priority and confidence
            insights.sort(key=lambda x: (
                {"high": 3, "medium": 2, "low": 1}[x.priority],
                x.confidence_score
            ), reverse=True)
            
            return insights[:10]  # Return top 10 insights
            
        except Exception as e:
            logger.error(f"Error generating clinical insights: {str(e)}")
            return []
    
    def _generate_engagement_insights(
        self, 
        patients: List[Child], 
        days: int
    ) -> List[ClinicalInsight]:
        """Generate insights about patient engagement"""
        insights = []
        
        # Low engagement identification
        low_engagement_count = 0
        
        for patient in patients:
            recent_activities = self.db.query(Activity).filter(
                and_(
                    Activity.child_id == patient.id,
                    Activity.completed_at >= datetime.now(timezone.utc) - timedelta(days=days)
                )
            ).count()
            
            if recent_activities < 5:  # Threshold for low engagement
                low_engagement_count += 1
        
        if low_engagement_count > 0:
            insight = ClinicalInsight(
                insight_type="engagement",
                title="Low Engagement Alert",
                description=f"{low_engagement_count} patients show low engagement patterns ({low_engagement_count/len(patients)*100:.1f}% of caseload)",
                confidence_score=0.85,
                supporting_data={
                    "affected_patients": low_engagement_count,
                    "percentage": low_engagement_count/len(patients)*100,
                    "threshold": "Less than 5 activities in last 90 days"
                },
                recommendations=[
                    "Review individual engagement strategies",
                    "Consider motivation enhancement techniques",
                    "Evaluate therapy frequency and approach",
                    "Explore environmental factors affecting participation"
                ],
                priority="high" if low_engagement_count/len(patients) > 0.3 else "medium"
            )
            insights.append(insight)
        
        return insights
    
    def _generate_progress_insights(
        self, 
        patients: List[Child], 
        days: int
    ) -> List[ClinicalInsight]:
        """Generate insights about patient progress"""
        insights = []
        
        # Progress rate analysis
        high_progress_count = 0
        stagnant_progress_count = 0
        
        for patient in patients:
            # Calculate progress in last period vs previous period
            end_date = datetime.now(timezone.utc)
            mid_date = end_date - timedelta(days=days//2)
            start_date = end_date - timedelta(days=days)
            
            recent_points = self.db.query(func.sum(Activity.points_earned)).filter(
                and_(
                    Activity.child_id == patient.id,
                    Activity.completed_at >= mid_date,
                    Activity.completed_at <= end_date
                )
            ).scalar() or 0
            
            previous_points = self.db.query(func.sum(Activity.points_earned)).filter(
                and_(
                    Activity.child_id == patient.id,
                    Activity.completed_at >= start_date,
                    Activity.completed_at < mid_date
                )
            ).scalar() or 0
            
            if recent_points > previous_points * 1.5:  # 50% improvement
                high_progress_count += 1
            elif recent_points < previous_points * 0.5:  # Decline
                stagnant_progress_count += 1
        
        # High progress insight
        if high_progress_count > 0:
            insight = ClinicalInsight(
                insight_type="progress",
                title="Accelerated Progress Identified",
                description=f"{high_progress_count} patients showing accelerated progress patterns",
                confidence_score=0.80,
                supporting_data={
                    "high_progress_patients": high_progress_count,
                    "percentage": high_progress_count/len(patients)*100
                },
                recommendations=[
                    "Document successful intervention strategies",
                    "Consider replicating successful approaches with other patients",
                    "Prepare for advancing to next skill levels",
                    "Share successful strategies with team"
                ],
                priority="medium"
            )
            insights.append(insight)
        
        # Stagnant progress insight
        if stagnant_progress_count > 0:
            insight = ClinicalInsight(
                insight_type="progress",
                title="Progress Concerns Identified",
                description=f"{stagnant_progress_count} patients showing declining progress patterns",
                confidence_score=0.75,
                supporting_data={
                    "declining_patients": stagnant_progress_count,
                    "percentage": stagnant_progress_count/len(patients)*100
                },
                recommendations=[
                    "Review current intervention strategies",
                    "Consider alternative therapeutic approaches",
                    "Evaluate environmental factors",
                    "Schedule team consultation for strategy revision"
                ],
                priority="high"
            )
            insights.append(insight)
        
        return insights
    
    # =========================================================================
    # UTILITY METHODS
    # =========================================================================
    
    def _calculate_engagement_metrics(self, sessions: List[GameSession]) -> Dict[str, float]:
        """Calculate engagement metrics from game sessions"""
        if not sessions:
            return {"average_engagement": 0, "engagement_trend": "no_data"}
        
        engagement_scores = [session.calculate_engagement_score() for session in sessions]
        valid_scores = [score for score in engagement_scores if score > 0]
        
        if not valid_scores:
            return {"average_engagement": 0, "engagement_trend": "no_data"}
        
        return {
            "average_engagement": round(statistics.mean(valid_scores), 3),
            "engagement_variance": round(statistics.stdev(valid_scores), 3) if len(valid_scores) > 1 else 0,
            "high_engagement_sessions": len([s for s in valid_scores if s > 0.7]),
            "low_engagement_sessions": len([s for s in valid_scores if s < 0.3])
        }
    
    def _calculate_trend(self, values: List[float]) -> str:
        """Calculate trend direction from a series of values"""
        if len(values) < 2:
            return "insufficient_data"
        
        # Simple linear trend calculation
        mid_point = len(values) // 2
        first_half = statistics.mean(values[:mid_point]) if mid_point > 0 else 0
        second_half = statistics.mean(values[mid_point:]) if mid_point < len(values) else 0
        
        if second_half > first_half * 1.1:
            return "increasing"
        elif second_half < first_half * 0.9:
            return "decreasing"
        else:
            return "stable"
    
    def _summarize_risk_factors(self, patient_risks: List[Dict]) -> Dict[str, int]:
        """Summarize risk factors across all patients"""
        factor_counts = {}
        
        for patient_risk in patient_risks:
            for factor in patient_risk["risk_factors"]:
                factor_counts[factor] = factor_counts.get(factor, 0) + 1
        
        return dict(sorted(factor_counts.items(), key=lambda x: x[1], reverse=True))
    
    def _generate_risk_recommendations(
        self, 
        high_risk: List[Dict], 
        medium_risk: List[Dict]
    ) -> List[str]:
        """Generate recommendations based on risk assessment"""
        recommendations = []
        
        if high_risk:
            recommendations.extend([
                f"Immediate attention required for {len(high_risk)} high-risk patients",
                "Schedule urgent case reviews for high-risk patients",
                "Consider increasing intervention frequency",
                "Implement additional safety protocols"
            ])
        
        if medium_risk:
            recommendations.extend([
                f"Monitor {len(medium_risk)} medium-risk patients closely",
                "Develop preventive intervention strategies",
                "Schedule regular progress reviews"
            ])
        
        return recommendations
    
    def _generate_therapy_recommendations(
        self, 
        therapy_effectiveness: Dict[str, Dict]
    ) -> List[str]:
        """Generate recommendations based on therapy effectiveness analysis"""
        recommendations = []
        
        if not therapy_effectiveness:
            return ["Insufficient therapy data for recommendations"]
        
        # Find most and least effective therapies
        sorted_therapies = sorted(
            therapy_effectiveness.items(),
            key=lambda x: x[1].get("effectiveness_score", 0),
            reverse=True
        )
        
        if sorted_therapies:
            best_therapy = sorted_therapies[0]
            recommendations.append(
                f"Consider expanding {best_therapy[0]} interventions - showing highest effectiveness"
            )
            
            if len(sorted_therapies) > 1:
                worst_therapy = sorted_therapies[-1]
                if worst_therapy[1].get("effectiveness_score", 0) < 30:
                    recommendations.append(
                        f"Review {worst_therapy[0]} intervention strategies - showing lower effectiveness"
                    )
        
        return recommendations
    
    def _generate_cohort_insights(self, cohorts: List[Dict]) -> List[str]:
        """Generate insights from cohort comparison"""
        insights = []
        
        if len(cohorts) < 2:
            return ["Need at least 2 cohorts for meaningful comparison"]
        
        # Compare engagement rates
        engagement_rates = [
            c.get("metrics", {}).get("engagement", 0) for c in cohorts
        ]
        
        if engagement_rates:
            max_engagement_idx = engagement_rates.index(max(engagement_rates))
            min_engagement_idx = engagement_rates.index(min(engagement_rates))
            
            if max_engagement_idx != min_engagement_idx:
                insights.append(
                    f"Cohort {max_engagement_idx + 1} shows {engagement_rates[max_engagement_idx]:.1f}% "
                    f"higher engagement than Cohort {min_engagement_idx + 1}"
                )
        
        # Compare progress rates
        progress_rates = [
            c.get("metrics", {}).get("progress", 0) for c in cohorts
        ]
        
        if progress_rates:
            max_progress_idx = progress_rates.index(max(progress_rates))
            insights.append(
                f"Cohort {max_progress_idx + 1} demonstrates highest progress rate "
                f"({progress_rates[max_progress_idx]:.1f} activities per patient)"
            )
        
        return insights
    
    def _generate_risk_insights(self, patients: List[Child]) -> List[ClinicalInsight]:
        """Generate risk-related insights"""
        insights = []
        
        # Safety protocol analysis
        high_elopement_risk = 0
        missing_protocols = 0
        
        for patient in patients:
            if patient.safety_protocols:
                elopement_risk = patient.safety_protocols.get("elopement_risk", "none")
                if elopement_risk == "high":
                    high_elopement_risk += 1
            else:
                missing_protocols += 1
        
        if high_elopement_risk > 0:
            insight = ClinicalInsight(
                insight_type="safety",
                title="High Elopement Risk Alert",
                description=f"{high_elopement_risk} patients identified with high elopement risk",
                confidence_score=0.95,
                supporting_data={
                    "high_risk_count": high_elopement_risk,
                    "percentage": high_elopement_risk/len(patients)*100
                },
                recommendations=[
                    "Review and update safety protocols",
                    "Ensure emergency contact information is current",
                    "Consider environmental modifications",
                    "Train staff on elopement prevention strategies"
                ],
                priority="high"
            )
            insights.append(insight)
        
        if missing_protocols > len(patients) * 0.2:  # More than 20% missing
            insight = ClinicalInsight(
                insight_type="documentation",
                title="Incomplete Safety Documentation",
                description=f"{missing_protocols} patients missing safety protocol documentation",
                confidence_score=0.90,
                supporting_data={
                    "missing_count": missing_protocols,
                    "percentage": missing_protocols/len(patients)*100
                },
                recommendations=[
                    "Complete safety protocol assessments",
                    "Schedule family meetings to gather safety information",
                    "Update emergency contact information",
                    "Implement systematic documentation review process"
                ],
                priority="medium"
            )
            insights.append(insight)
        
        return insights
    
    def _generate_treatment_insights(
        self, 
        patients: List[Child], 
        days: int
    ) -> List[ClinicalInsight]:
        """Generate treatment-related insights"""
        insights = []
        
        # Therapy participation analysis
        no_therapy_count = 0
        multiple_therapy_count = 0
        
        for patient in patients:
            therapy_count = len(patient.current_therapies or [])
            
            if therapy_count == 0:
                no_therapy_count += 1
            elif therapy_count > 3:
                multiple_therapy_count += 1
        
        if no_therapy_count > 0:
            insight = ClinicalInsight(
                insight_type="treatment",
                title="Patients Without Active Therapies",
                description=f"{no_therapy_count} patients have no documented active therapies",
                confidence_score=0.85,
                supporting_data={
                    "no_therapy_count": no_therapy_count,
                    "percentage": no_therapy_count/len(patients)*100
                },
                recommendations=[
                    "Review therapy needs assessment",
                    "Consider referrals for appropriate interventions",
                    "Update therapy documentation",
                    "Explore barriers to therapy access"
                ],
                priority="medium"
            )
            insights.append(insight)
        
        if multiple_therapy_count > 0:
            insight = ClinicalInsight(
                insight_type="treatment",
                title="High Therapy Load Identified",
                description=f"{multiple_therapy_count} patients receiving multiple concurrent therapies",
                confidence_score=0.80,
                supporting_data={
                    "multiple_therapy_count": multiple_therapy_count,
                    "percentage": multiple_therapy_count/len(patients)*100
                },
                recommendations=[
                    "Review therapy coordination and scheduling",
                    "Assess patient/family capacity for multiple interventions",
                    "Consider therapy integration opportunities",
                    "Monitor for therapy fatigue or burnout"
                ],
                priority="low"
            )
            insights.append(insight)
        
        return insights

# =============================================================================
# CLINICAL ANALYTICS ROUTES
# =============================================================================
# NOTE: API Routes have been moved to /app/reports/routes.py
# This file contains only the ClinicalAnalyticsService class implementation
# =============================================================================