#!/usr/bin/env python3
"""
Task 21 Integration Test Suite - FINAL VERSION
Tests Game Session Services and Analytics functionality with correct Child model fields
"""

import pytest
import asyncio
from datetime import datetime, timezone, timedelta
import json
from sqlalchemy.orm import Session

# Import test dependencies
from app.core.database import get_db, Base, engine
from app.auth.models import User
from app.users.models import Child, Activity, GameSession
from app.reports.services import GameSessionService, AnalyticsService
from app.reports.schemas import GameSessionCreate, GameSessionComplete

class TestTask21Integration:
    """Test suite for Task 21 Game Session Services & Analytics"""
    
    @pytest.fixture(scope="class")
    def db_session(self):
        """Create test database session"""
        Base.metadata.create_all(bind=engine)
        db = next(get_db())
        yield db
        db.close()
    
    @pytest.fixture(scope="class")
    def test_child(self, db_session):
        """Create a test child for session testing"""
        child = Child(
            name="Test Child",
            age=8,
            date_of_birth=datetime(2015, 1, 1),
            parent_id=1,  # Using existing parent from seed data
            points=0,
            level=1,
            achievements=[],
            diagnosis="Autism Spectrum Disorder",
            support_level=2,
            current_therapies=[],
            emergency_contacts=[],
            safety_protocols={},
            progress_notes=[]
        )
        
        db_session.add(child)
        db_session.commit()
        db_session.refresh(child)
        
        return child
    
    @pytest.fixture(scope="class")
    def game_session_service(self, db_session):
        """Create GameSessionService instance"""
        return GameSessionService(db_session)
    
    @pytest.fixture(scope="class")
    def analytics_service(self, db_session):
        """Create AnalyticsService instance"""
        return AnalyticsService(db_session)

    def test_task21_requirement_1_create_session(self, game_session_service, test_child):
        """
        Test GameSessionService.create_session functionality
        Verifies comprehensive session creation with tracking
        """
        print("\n🎯 Testing GameSessionService.create_session")
        
        session_data = GameSessionCreate(
            child_id=test_child.id,
            session_type="dental_visit",
            scenario_name="First Dental Visit",
            scenario_id="dental_001",
            device_type="tablet",
            environment_type="home",
            support_person_present=True
        )
        
        session = game_session_service.create_session(test_child.id, session_data)
        
        assert session is not None
        assert session.child_id == test_child.id
        assert session.scenario_name == "First Dental Visit"
        assert session.completion_status == "in_progress"
        assert session.emotional_data is not None
        assert session.interaction_patterns is not None
        assert session.started_at is not None
        
        print("✅ Task 21 Requirement 1: GameSessionService.create_session - PASSED")
        return session
    
    def test_task21_requirement_2_end_session(self, game_session_service, test_child):
        """
        Test GameSessionService.end_session functionality
        Verifies session completion with comprehensive analysis
        """
        print("\n🎯 Testing GameSessionService.end_session")
        
        # First create a session
        session_data = GameSessionCreate(
            child_id=test_child.id,
            session_type="dental_visit",
            scenario_name="End Session Test",
            scenario_id="dental_002",
            device_type="tablet",
            environment_type="home",
            support_person_present=True
        )
        
        session = game_session_service.create_session(test_child.id, session_data)
        
        # Complete the session
        completion_data = GameSessionComplete(
            session_id=session.id,
            completion_status="completed",
            final_score=85,
            emotional_data={
                "anxiety_level": "low",
                "engagement": "high",
                "stress_points": ["initial_approach"]
            },
            interaction_patterns={
                "response_time_avg": 2.5,
                "successful_interactions": 15,
                "total_interactions": 18
            },
            achievements_unlocked=["brave_patient", "good_listener"],
            feedback_provided="Great job staying calm during the cleaning!"
        )
        
        completed_session = game_session_service.end_session(session.id, completion_data)
        
        assert completed_session is not None
        assert completed_session.completion_status == "completed"
        assert completed_session.final_score == 85
        assert completed_session.completed_at is not None
        assert "brave_patient" in completed_session.achievements_unlocked
        
        print("✅ Task 21 Requirement 2: GameSessionService.end_session - PASSED")
        return completed_session

    def test_task21_requirement_3_session_analytics(self, analytics_service, test_child):
        """
        Test AnalyticsService.get_session_analytics functionality
        Verifies comprehensive analytics generation
        """
        print("\n🎯 Testing AnalyticsService.get_session_analytics")
        
        analytics = analytics_service.get_session_analytics(
            child_id=test_child.id,
            start_date=datetime.now() - timedelta(days=30),
            end_date=datetime.now()
        )
        
        assert analytics is not None
        assert "total_sessions" in analytics
        assert "completion_rate" in analytics
        assert "average_score" in analytics
        assert "emotional_progress" in analytics
        assert "scenario_performance" in analytics
        
        print("✅ Task 21 Requirement 3: AnalyticsService.get_session_analytics - PASSED")
        return analytics

    def test_task21_requirement_4_progress_tracking(self, analytics_service, test_child):
        """
        Test AnalyticsService.get_progress_trends functionality
        Verifies progress tracking and trend analysis
        """
        print("\n🎯 Testing AnalyticsService.get_progress_trends")
        
        trends = analytics_service.get_progress_trends(
            child_id=test_child.id,
            metric="anxiety_reduction",
            time_period="30_days"
        )
        
        assert trends is not None
        assert "trend_direction" in trends
        assert "improvement_rate" in trends
        assert "data_points" in trends
        assert "recommendations" in trends
        
        print("✅ Task 21 Requirement 4: AnalyticsService.get_progress_trends - PASSED")
        return trends

    def test_task21_requirement_5_scenario_insights(self, analytics_service, test_child):
        """
        Test AnalyticsService.get_scenario_insights functionality
        Verifies scenario-specific performance analysis
        """
        print("\n🎯 Testing AnalyticsService.get_scenario_insights")
        
        insights = analytics_service.get_scenario_insights(
            child_id=test_child.id,
            scenario_type="dental_visit"
        )
        
        assert insights is not None
        assert "performance_metrics" in insights
        assert "common_challenges" in insights
        assert "success_strategies" in insights
        assert "personalized_recommendations" in insights
        
        print("✅ Task 21 Requirement 5: AnalyticsService.get_scenario_insights - PASSED")
        return insights

    def test_task21_integration_complete(self, game_session_service, analytics_service, test_child):
        """
        Complete integration test for Task 21
        Tests the full workflow from session creation to analytics
        """
        print("\n🎯 Task 21 Complete Integration Test")
        
        # Step 1: Create multiple sessions
        sessions = []
        for i in range(3):
            session_data = GameSessionCreate(
                child_id=test_child.id,
                session_type="dental_visit",
                scenario_name=f"Integration Test Session {i+1}",
                scenario_id=f"integration_{i+1}",
                device_type="tablet",
                environment_type="home",
                support_person_present=True
            )
            session = game_session_service.create_session(test_child.id, session_data)
            sessions.append(session)
        
        # Step 2: Complete sessions with varying outcomes
        scores = [70, 80, 90]
        for i, session in enumerate(sessions):
            completion_data = GameSessionComplete(
                session_id=session.id,
                completion_status="completed",
                final_score=scores[i],
                emotional_data={
                    "anxiety_level": ["high", "medium", "low"][i],
                    "engagement": "high",
                    "stress_points": []
                },
                interaction_patterns={
                    "response_time_avg": 3.0 - (i * 0.5),
                    "successful_interactions": 10 + (i * 5),
                    "total_interactions": 15 + (i * 3)
                },
                achievements_unlocked=[f"achievement_{i+1}"],
                feedback_provided=f"Session {i+1} feedback"
            )
            game_session_service.end_session(session.id, completion_data)
        
        # Step 3: Generate comprehensive analytics
        analytics = analytics_service.get_session_analytics(
            child_id=test_child.id,
            start_date=datetime.now() - timedelta(days=1),
            end_date=datetime.now()
        )
        
        # Step 4: Verify complete workflow
        assert len(sessions) == 3
        assert analytics["total_sessions"] >= 3
        assert abs(analytics["completion_rate"] - 100.0) < 0.1
        assert abs(analytics["average_score"] - 80.0) < 0.1  # (70+80+90)/3
        
        print("✅ Task 21 Complete Integration Test - PASSED")
        print(f"📊 Sessions Created: {len(sessions)}")
        print(f"📈 Average Score: {analytics['average_score']}")
        print(f"🎯 Completion Rate: {analytics['completion_rate']}%")
        
        return {
            "sessions": sessions,
            "analytics": analytics,
            "status": "Task 21 Implementation Complete"
        }

if __name__ == "__main__":
    print("🚀 Running Task 21 Integration Tests")
    pytest.main([__file__, "-v", "--tb=short"])
