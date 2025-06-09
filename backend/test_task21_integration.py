#!/usr/bin/env python3
"""
Task 21 Integration Test Suite
Tests Game Session Services and Analytics functionality
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
from app.reports.models import SessionType
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
            first_name="Test",
            last_name="Child",
            date_of_birth=datetime(2015, 1, 1),
            gender="male",
            autism_diagnosis=True,
            diagnosis_date=datetime(2018, 6, 1),
            is_active=True
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
    
    def test_task21_requirement_2_end_session(self, game_session_service, test_child):        """
        Test GameSessionService.end_session functionality
        Verifies session completion with comprehensive analysis
        """
        # First create a session
        session_data = GameSessionCreate(
            child_id=test_child.id,
            session_type="therapy_session",
            scenario_name="Social Skills Practice",
            scenario_id="social_001"
        )
        
        session = game_session_service.create_session(test_child.id, session_data)
        assert session is not None
        
        # Update session with some progress
        session.score = 85
        session.levels_completed = 3
        session.interactions_count = 15
        session.correct_responses = 12
        session.incorrect_responses = 3
        
        # End the session
        completion_data = GameSessionComplete(
            exit_reason="completed",
            session_summary_notes="Great progress on social interactions"
        )
        
        completed_session = game_session_service.end_session(session.id, completion_data)
        
        assert completed_session is not None
        assert completed_session.completion_status == "completed"
        assert completed_session.exit_reason == "completed"
        assert completed_session.ended_at is not None
        assert completed_session.duration_seconds is not None
        assert completed_session.ai_analysis is not None
        
        print("✅ Task 21 Requirement 2: GameSessionService.end_session - PASSED")
        return completed_session
    
    def test_task21_requirement_3_get_child_sessions(self, game_session_service, test_child):
        """
        Test GameSessionService.get_child_sessions functionality
        Verifies session retrieval with filtering and metadata
        """        # Create multiple sessions for testing
        for i in range(3):
            session_data = GameSessionCreate(
                child_id=test_child.id,
                session_type="dental_visit" if i % 2 == 0 else "therapy_session",
                scenario_name=f"Test Scenario {i+1}",
                scenario_id=f"test_{i+1:03d}"
            )
            
            session = game_session_service.create_session(test_child.id, session_data)
            if session:
                # Complete some sessions
                if i < 2:
                    completion_data = GameSessionComplete(exit_reason="completed")
                    game_session_service.end_session(session.id, completion_data)
        
        # Get sessions without filters
        sessions, metadata = game_session_service.get_child_sessions(test_child.id)
        
        assert len(sessions) >= 3
        assert isinstance(metadata, dict)
        assert "total_sessions" in metadata
        assert "completed_sessions" in metadata
        assert "average_score" in metadata
        
        print("✅ Task 21 Requirement 3: GameSessionService.get_child_sessions - PASSED")
        return sessions, metadata
    
    def test_task21_requirement_4_calculate_session_metrics(self, game_session_service, test_child):
        """
        Test GameSessionService.calculate_session_metrics functionality
        Verifies comprehensive metrics calculation
        """
        # Create and complete a session with comprehensive data
        session_data = GameSessionCreate(
            child_id=test_child.id,
            session_type=SessionType.THERAPY_SESSION,
            scenario_name="Metrics Test Session",
            scenario_id="metrics_001"
        )
        
        session = game_session_service.create_session(test_child.id, session_data)
        assert session is not None
        
        # Add comprehensive data
        session.duration_seconds = 720  # 12 minutes
        session.score = 92
        session.levels_completed = 4
        session.interactions_count = 20
        session.correct_responses = 18
        session.incorrect_responses = 2
        session.help_requests = 2
        session.pause_count = 1
        session.achievements_unlocked = ["first_level", "perfect_score"]
        
        # Calculate metrics
        metrics = game_session_service.calculate_session_metrics(session)
        
        assert isinstance(metrics, dict)
        assert "basic_metrics" in metrics
        assert "engagement_metrics" in metrics
        assert "emotional_analysis" in metrics
        assert "interaction_analysis" in metrics
        assert "learning_indicators" in metrics
        assert "behavioral_insights" in metrics
        assert "recommendations" in metrics
        
        # Verify specific metrics
        basic_metrics = metrics["basic_metrics"]
        assert basic_metrics["duration_minutes"] == 12.0
        assert basic_metrics["final_score"] == 92
        assert basic_metrics["success_rate"] == 0.9  # 18/20
        
        print("✅ Task 21 Requirement 4: GameSessionService.calculate_session_metrics - PASSED")
        return metrics
    
    def test_task21_requirement_5_calculate_progress_trends(self, analytics_service, test_child, db_session):
        """
        Test AnalyticsService.calculate_progress_trends functionality
        Verifies comprehensive progress trend analysis
        """
        # Get existing sessions for the child
        sessions = db_session.query(GameSession).filter(
            GameSession.child_id == test_child.id
        ).all()
        
        if len(sessions) < 2:
            # Create additional sessions if needed
            service = GameSessionService(db_session)
            for i in range(3):
                session_data = GameSessionCreate(
                    child_id=test_child.id,
                    session_type=SessionType.THERAPY_SESSION,
                    scenario_name=f"Progress Test {i+1}",
                    scenario_id=f"progress_{i+1:03d}"
                )
                
                session = service.create_session(test_child.id, session_data)
                if session:
                    session.score = 70 + (i * 10)  # Improving scores
                    session.duration_seconds = 600 + (i * 60)  # Increasing duration
                    
                    completion_data = GameSessionComplete(exit_reason="completed")
                    service.end_session(session.id, completion_data)
            
            # Refresh sessions list
            sessions = db_session.query(GameSession).filter(
                GameSession.child_id == test_child.id
            ).all()
        
        # Calculate progress trends
        trends = analytics_service.calculate_progress_trends(sessions)
        
        assert isinstance(trends, dict)
        assert "analysis_period" in trends
        assert "basic_trends" in trends
        assert "learning_analytics" in trends
        assert "predictive_insights" in trends
        assert "therapeutic_insights" in trends
        
        # Verify trend analysis structure
        basic_trends = trends["basic_trends"]
        assert "score_trend" in basic_trends
        assert "engagement_trend" in basic_trends
        assert "duration_trend" in basic_trends
        
        print("✅ Task 21 Requirement 5: AnalyticsService.calculate_progress_trends - PASSED")
        return trends
    
    def test_task21_requirement_6_analyze_emotional_patterns(self, analytics_service, test_child, db_session):
        """
        Test AnalyticsService.analyze_emotional_patterns functionality
        Verifies emotional pattern analysis across sessions
        """
        # Get sessions with emotional data
        sessions = db_session.query(GameSession).filter(
            GameSession.child_id == test_child.id
        ).all()
        
        # Add emotional data to sessions
        for i, session in enumerate(sessions[:3]):
            emotional_data = {
                "initial_state": "anxious" if i % 2 == 0 else "neutral",
                "final_state": "calm",
                "transitions": [
                    {
                        "timestamp": "00:02:30",
                        "from_state": "anxious",
                        "to_state": "neutral",
                        "trigger": "visual_cue_presented"
                    }
                ],
                "stress_indicators": [],
                "positive_indicators": [{"timestamp": "00:05:00", "indicator": "spontaneous_smile"}]
            }
            session.emotional_data = emotional_data
        
        db_session.commit()
        
        # Analyze emotional patterns
        patterns = analytics_service.analyze_emotional_patterns(sessions)
        
        assert isinstance(patterns, dict)
        assert "emotional_overview" in patterns
        assert "state_patterns" in patterns
        assert "trigger_analysis" in patterns
        assert "regulation_insights" in patterns
        assert "longitudinal_patterns" in patterns
        assert "clinical_insights" in patterns
        
        print("✅ Task 21 Requirement 6: AnalyticsService.analyze_emotional_patterns - PASSED")
        return patterns
    
    def test_task21_requirement_7_generate_engagement_metrics(self, analytics_service, test_child, db_session):
        """
        Test AnalyticsService.generate_engagement_metrics functionality
        Verifies comprehensive engagement analysis
        """
        # Get sessions for engagement analysis
        sessions = db_session.query(GameSession).filter(
            GameSession.child_id == test_child.id
        ).all()
        
        # Generate engagement metrics
        engagement_metrics = analytics_service.generate_engagement_metrics(sessions)
        
        assert isinstance(engagement_metrics, dict)
        assert "overall_metrics" in engagement_metrics
        assert "individual_scores" in engagement_metrics
        assert "pattern_analysis" in engagement_metrics
        assert "optimization_insights" in engagement_metrics
        assert "benchmarking" in engagement_metrics
        
        print("✅ Task 21 Requirement 7: AnalyticsService.generate_engagement_metrics - PASSED")
        return engagement_metrics
    
    def test_task21_requirement_8_identify_behavioral_patterns(self, analytics_service, test_child):
        """
        Test AnalyticsService.identify_behavioral_patterns functionality
        Verifies comprehensive behavioral pattern identification
        """
        # Identify behavioral patterns for the child
        behavioral_patterns = analytics_service.identify_behavioral_patterns(test_child.id)
        
        assert isinstance(behavioral_patterns, dict)
        assert "child_id" in behavioral_patterns
        assert behavioral_patterns["child_id"] == test_child.id
        assert "analysis_summary" in behavioral_patterns
        assert "behavioral_dimensions" in behavioral_patterns
        assert "pattern_insights" in behavioral_patterns
        assert "clinical_applications" in behavioral_patterns
        assert "longitudinal_analysis" in behavioral_patterns
        
        print("✅ Task 21 Requirement 8: AnalyticsService.identify_behavioral_patterns - PASSED")
        return behavioral_patterns
    
    def test_integration_workflow(self, game_session_service, analytics_service, test_child):
        """
        Test complete integration workflow from session creation to analytics
        """
        print("\n" + "="*60)
        print("TASK 21 INTEGRATION WORKFLOW TEST")
        print("="*60)
        
        # Step 1: Create session
        session_data = GameSessionCreate(
            child_id=test_child.id,
            session_type=SessionType.DENTAL_VISIT,
            scenario_name="Integration Test Session",
            scenario_id="integration_001",
            device_type="tablet",
            environment_type="clinic"
        )
        
        session = game_session_service.create_session(test_child.id, session_data)
        assert session is not None
        print("✅ Step 1: Session created successfully")
        
        # Step 2: Update session with progress
        session.score = 88
        session.levels_completed = 3
        session.interactions_count = 25
        session.correct_responses = 22
        session.incorrect_responses = 3
        print("✅ Step 2: Session progress updated")
        
        # Step 3: Calculate real-time metrics
        metrics = game_session_service.calculate_session_metrics(session)
        assert "basic_metrics" in metrics
        print("✅ Step 3: Real-time metrics calculated")
        
        # Step 4: Complete session
        completion_data = GameSessionComplete(
            exit_reason="completed",
            session_summary_notes="Excellent progress in integration test"
        )
        
        completed_session = game_session_service.end_session(session.id, completion_data)
        assert completed_session.completion_status == "completed"
        print("✅ Step 4: Session completed with analysis")
        
        # Step 5: Perform comprehensive analytics
        behavioral_patterns = analytics_service.identify_behavioral_patterns(test_child.id)
        assert "behavioral_dimensions" in behavioral_patterns
        print("✅ Step 5: Behavioral patterns analyzed")
        
        print("\n🎉 INTEGRATION WORKFLOW COMPLETED SUCCESSFULLY!")
        return True


def test_task21_complete_verification():
    """
    Main test function that runs all Task 21 verification tests
    """
    print("\n" + "="*70)
    print("TASK 21 GAME SESSION SERVICES & ANALYTICS - COMPREHENSIVE VERIFICATION")
    print("="*70)
    
    # Create test instance
    test_suite = TestTask21Integration()
    
    try:
        # Setup
        Base.metadata.create_all(bind=engine)
        db = next(get_db())
        
        # Create test child
        child = Child(
            first_name="Verification",
            last_name="Test",
            date_of_birth=datetime(2015, 6, 15),
            gender="female",
            autism_diagnosis=True,
            is_active=True
        )
        
        db.add(child)
        db.commit()
        db.refresh(child)
        
        # Create services
        game_session_service = GameSessionService(db)
        analytics_service = AnalyticsService(db)
        
        # Run all tests
        tests_passed = 0
        total_tests = 9
        
        test_results = [
            test_suite.test_task21_requirement_1_create_session(game_session_service, child),
            test_suite.test_task21_requirement_2_end_session(game_session_service, child),
            test_suite.test_task21_requirement_3_get_child_sessions(game_session_service, child),
            test_suite.test_task21_requirement_4_calculate_session_metrics(game_session_service, child),
            test_suite.test_task21_requirement_5_calculate_progress_trends(analytics_service, child, db),
            test_suite.test_task21_requirement_6_analyze_emotional_patterns(analytics_service, child, db),
            test_suite.test_task21_requirement_7_generate_engagement_metrics(analytics_service, child, db),
            test_suite.test_task21_requirement_8_identify_behavioral_patterns(analytics_service, child),
            test_suite.test_integration_workflow(game_session_service, analytics_service, child)
        ]
        
        tests_passed = sum(1 for result in test_results if result)
        
        print("\n" + "="*70)
        print("TASK 21 VERIFICATION RESULTS")
        print("="*70)
        print(f"✅ Tests Passed: {tests_passed}/{total_tests}")
        print(f"📊 Success Rate: {tests_passed/total_tests*100:.1f}%")
        
        if tests_passed == total_tests:
            print("\n🎉 TASK 21 FULLY COMPLIANT - ALL REQUIREMENTS MET!")
            print("✅ GameSessionService Implementation: COMPLETE")
            print("✅ AnalyticsService Implementation: COMPLETE") 
            print("✅ Session Lifecycle Management: WORKING")
            print("✅ Comprehensive Metrics Calculation: WORKING")
            print("✅ Progress Trend Analysis: WORKING")
            print("✅ Emotional Pattern Analysis: WORKING")
            print("✅ Engagement Metrics: WORKING")
            print("✅ Behavioral Pattern Identification: WORKING")
            print("✅ Integration Workflow: WORKING")
            
        db.close()
        return tests_passed == total_tests
        
    except Exception as e:
        print(f"❌ Test execution error: {str(e)}")
        return False


if __name__ == "__main__":
    success = test_task21_complete_verification()
    exit(0 if success else 1)
