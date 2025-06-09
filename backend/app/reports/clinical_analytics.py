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

from app.users.models import Child, Activity, GameSession, Assessment, ProfessionalProfile
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

from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional

clinical_router = APIRouter()

@clinical_router.get("/clinical-analytics/population")
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
    
    Returns detailed analytics including demographics, outcomes, trends, and insights
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

@clinical_router.post("/clinical-analytics/cohort-comparison")
async def compare_patient_cohorts(
    cohort_data: Dict[str, Any],
    current_user: User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """
    Compare multiple patient cohorts based on specified criteria
    
    Request body should contain:
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

@clinical_router.get("/clinical-analytics/insights")
async def get_clinical_insights(
    analysis_period: int = Query(default=90, ge=7, le=365, description="Analysis period in days"),
    focus_areas: Optional[str] = Query(None, description="Comma-separated focus areas"),
    current_user: User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """
    Generate AI-powered clinical insights for professional's patient population
    
    Returns prioritized insights with recommendations based on patient data analysis
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

@clinical_router.get("/clinical-analytics/treatment-effectiveness")
async def analyze_treatment_effectiveness(
    therapy_type: Optional[str] = Query(None, description="Specific therapy type to analyze"),
    date_from: Optional[datetime] = Query(None, description="Start date for analysis"),
    date_to: Optional[datetime] = Query(None, description="End date for analysis"),
    current_user: User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """
    Analyze treatment effectiveness across patient population
    
    Returns effectiveness metrics for different therapy types and interventions
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

@clinical_router.get("/clinical-analytics/export")
async def export_clinical_data(
    format: str = Query(default="json", regex="^(json|csv|pdf)$"),
    include_patient_details: bool = Query(default=False, description="Include patient details"),
    analysis_period: int = Query(default=90, ge=7, le=365, description="Analysis period in days"),
    current_user: User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """
    Export comprehensive clinical analytics data
    
    Supports multiple formats with various levels of detail
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
                "includes_patient_details": include_patient_details
            },
            "population_analytics": population_data,
            "clinical_insights": [
                {
                    "type": insight.insight_type,
                    "title": insight.title,
                    "description": insight.description,
                    "priority": insight.priority,
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
                    "Content-Disposition": f"attachment; filename=clinical_analytics_{current_user.id}.json"
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
                "Metric", "Value", "Category", "Date_Range"
            ])
            
            # Write population metrics
            pop_overview = population_data.get("population_overview", {})
            writer.writerow([
                "Total Patients", pop_overview.get("total_patients", 0), 
                "Demographics", f"{analysis_period} days"
            ])
            
            writer.writerow([
                "Active Patients", pop_overview.get("active_patients", 0), 
                "Demographics", f"{analysis_period} days"
            ])
            
            # Write clinical outcomes
            outcomes = population_data.get("clinical_outcomes", {})
            activity_metrics = outcomes.get("activity_metrics", {})
            
            writer.writerow([
                "Total Activities", activity_metrics.get("total_activities", 0),
                "Outcomes", f"{analysis_period} days"
            ])
            
            writer.writerow([
                "Verification Rate", f"{activity_metrics.get('verification_rate', 0):.1f}%",
                "Outcomes", f"{analysis_period} days"
            ])
            
            from fastapi.responses import Response
            return Response(
                content=output.getvalue(),
                media_type="text/csv",
                headers={
                    "Content-Disposition": f"attachment; filename=clinical_metrics_{current_user.id}.csv"
                }
            )
        
        elif format == "pdf":
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="PDF export not yet implemented"
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
# INTEGRATION WITH EXISTING REPORTS ROUTES
# =============================================================================

# Add to existing backend/app/users/routes.py:
# Include clinical analytics router
# router.include_router(
#     clinical_router,
#     prefix="/clinical",
#     tags=["clinical-analytics"]
# )