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
            age=9,
            date_of_birth=datetime(2015, 1, 1),
            diagnosis="Autism Spectrum Disorder",
            diagnosis_date=datetime(2018, 6, 1),
            is_active=True,
            parent_id=1,  # Using existing parent from seed data
            points=0,
            level=1,
            achievements=[],
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
        assert completed_session.calculated_metrics is not None
        
        print("✅ Task 21 Requirement 2: GameSessionService.end_session - PASSED")
        return completed_session

    def test_task21_requirement_3_get_child_sessions(self, game_session_service, test_child):
        """
        Test GameSessionService.get_child_sessions functionality
        Verifies session retrieval with filtering and metadata
        """
        # Create a few sessions first
        for i in range(3):
            session_data = GameSessionCreate(
                child_id=test_child.id,
                session_type="therapy_session" if i % 2 == 0 else "dental_visit",
                scenario_name=f"Test Scenario {i+1}",
                scenario_id=f"test_{i+1:03d}"
            )
            game_session_service.create_session(test_child.id, session_data)
        
        # Test getting all sessions
        all_sessions = game_session_service.get_child_sessions(test_child.id)
        assert len(all_sessions) >= 3
        
        # Test filtering by session type
        therapy_sessions = game_session_service.get_child_sessions(
            test_child.id,
            session_type="therapy_session"
        )
        assert len(therapy_sessions) >= 2
          # Test date range filtering - use filters parameter with GameSessionFilters
        from app.reports.schemas import GameSessionFilters
        filters = GameSessionFilters(
            start_date=datetime.now() - timedelta(days=1)
        )
        recent_sessions = game_session_service.get_child_sessions(
            test_child.id,
            filters=filters
        )
        assert len(recent_sessions) >= 3
        
        print("✅ Task 21 Requirement 3: GameSessionService.get_child_sessions - PASSED")
        return all_sessions

    def test_task21_requirement_4_calculate_session_metrics(self, game_session_service, test_child):
        """
        Test GameSessionService.calculate_session_metrics functionality
        Verifies comprehensive behavioral and performance metrics calculation
        """
        # Create a session with detailed data
        session_data = GameSessionCreate(
            child_id=test_child.id,
            session_type="therapy_session",
            scenario_name="Advanced Social Skills",
            scenario_id="social_adv_001"
        )
        
        session = game_session_service.create_session(test_child.id, session_data)
        
        # Add performance data
        session.score = 92
        session.levels_completed = 5
        session.interactions_count = 25
        session.correct_responses = 20
        session.incorrect_responses = 5
        session.hints_used = 3
        session.time_on_task = 1800  # 30 minutes
        
        # Calculate metrics
        metrics = game_session_service.calculate_session_metrics(session)
        
        assert metrics is not None
        assert "success_rate" in metrics
        assert "engagement_score" in metrics
        assert "learning_indicators" in metrics
        assert abs(metrics["success_rate"] - 0.8) < 0.001  # 20/25
        assert metrics["engagement_score"] > 0
        
        print("✅ Task 21 Requirement 4: GameSessionService.calculate_session_metrics - PASSED")
        return metrics

    def test_task21_requirement_5_progress_trends(self, analytics_service, test_child):
        """
        Test AnalyticsService.calculate_progress_trends functionality
        Verifies progress trend analysis across multiple sessions
        """
        progress_trends = analytics_service.calculate_progress_trends(
            test_child.id,
            date_range_days=30
        )
        
        assert progress_trends is not None
        assert "overall_trend" in progress_trends
        assert "skill_progression" in progress_trends
        assert "engagement_trends" in progress_trends
        assert "predictive_insights" in progress_trends
        assert "therapeutic_goals_progress" in progress_trends
        
        print("✅ Task 21 Requirement 5: AnalyticsService.calculate_progress_trends - PASSED")
        return progress_trends

    def test_task21_requirement_6_emotional_patterns(self, analytics_service, test_child):
        """
        Test AnalyticsService.analyze_emotional_patterns functionality
        Verifies emotional state patterns and trigger analysis
        """
        emotional_patterns = analytics_service.analyze_emotional_patterns(
            test_child.id,
            date_range_days=30
        )
        
        assert emotional_patterns is not None
        assert "emotional_states_distribution" in emotional_patterns
        assert "trigger_analysis" in emotional_patterns
        assert "regulation_strategies_effectiveness" in emotional_patterns
        assert "pattern_insights" in emotional_patterns
        assert "recommendations" in emotional_patterns
        
        print("✅ Task 21 Requirement 6: AnalyticsService.analyze_emotional_patterns - PASSED")
        return emotional_patterns

    def test_task21_requirement_7_engagement_metrics(self, analytics_service, test_child):
        """
        Test AnalyticsService.generate_engagement_metrics functionality
        Verifies comprehensive engagement analysis
        """
        engagement_metrics = analytics_service.generate_engagement_metrics(
            test_child.id,
            date_range_days=30
        )
        
        assert engagement_metrics is not None
        assert "overall_engagement_score" in engagement_metrics
        assert "session_participation_rates" in engagement_metrics
        assert "attention_span_analysis" in engagement_metrics
        assert "interaction_quality_metrics" in engagement_metrics
        assert "motivation_indicators" in engagement_metrics
        
        print("✅ Task 21 Requirement 7: AnalyticsService.generate_engagement_metrics - PASSED")
        return engagement_metrics

    def test_task21_requirement_8_behavioral_patterns(self, analytics_service, test_child):
        """
        Test AnalyticsService.identify_behavioral_patterns functionality
        Verifies behavioral pattern identification for specific children
        """
        behavioral_patterns = analytics_service.identify_behavioral_patterns(
            test_child.id,
            date_range_days=30
        )
        
        assert behavioral_patterns is not None
        assert "behavioral_clusters" in behavioral_patterns
        assert "preference_patterns" in behavioral_patterns
        assert "learning_style_indicators" in behavioral_patterns
        assert "social_interaction_patterns" in behavioral_patterns
        assert "adaptive_behavior_insights" in behavioral_patterns
        
        print("✅ Task 21 Requirement 8: AnalyticsService.identify_behavioral_patterns - PASSED")
        return behavioral_patterns

    def test_task21_integration_workflow(self, game_session_service, analytics_service, test_child):
        """
        Test complete integration workflow for Task 21
        Verifies end-to-end functionality of game session services and analytics
        """
        print("\n🚀 Starting Task 21 Integration Workflow Test")
        
        # Step 1: Create multiple sessions for comprehensive analysis
        session_ids = []
        for i in range(5):
            session_data = GameSessionCreate(
                child_id=test_child.id,
                session_type="therapy_session" if i % 2 == 0 else "dental_visit",
                scenario_name=f"Integration Test Session {i+1}",
                scenario_id=f"integration_{i+1:03d}",
                device_type="tablet",
                environment_type="clinic" if i % 3 == 0 else "home"
            )
            
            session = game_session_service.create_session(test_child.id, session_data)
            session_ids.append(session.id)
            
            # Add performance data
            session.score = 70 + (i * 5)  # Progressive improvement
            session.levels_completed = i + 1
            session.interactions_count = 15 + (i * 3)
            session.correct_responses = int((15 + (i * 3)) * 0.8)
            session.incorrect_responses = int((15 + (i * 3)) * 0.2)
            
            # Complete the session
            completion_data = GameSessionComplete(
                exit_reason="completed",
                session_summary_notes=f"Integration test session {i+1} completed successfully"
            )
            
            game_session_service.end_session(session.id, completion_data)
        
        # Step 2: Verify session retrieval
        all_sessions = game_session_service.get_child_sessions(test_child.id)
        assert len(all_sessions) >= 5
        
        # Step 3: Run comprehensive analytics
        progress_trends = analytics_service.calculate_progress_trends(test_child.id, date_range_days=7)
        emotional_patterns = analytics_service.analyze_emotional_patterns(test_child.id, date_range_days=7)
        engagement_metrics = analytics_service.generate_engagement_metrics(test_child.id, date_range_days=7)
        behavioral_patterns = analytics_service.identify_behavioral_patterns(test_child.id, date_range_days=7)
        
        # Step 4: Verify analytics results
        assert progress_trends["overall_trend"] is not None
        assert emotional_patterns["emotional_states_distribution"] is not None
        assert engagement_metrics["overall_engagement_score"] >= 0
        assert behavioral_patterns["behavioral_clusters"] is not None
        
        print("✅ Task 21 Integration Workflow: Complete workflow - PASSED")
        print(f"✅ Created and analyzed {len(session_ids)} sessions successfully")
        print("✅ All analytics services functioning correctly")
        
        return {
            "sessions_created": len(session_ids),
            "progress_trends": progress_trends,
            "emotional_patterns": emotional_patterns,
            "engagement_metrics": engagement_metrics,
            "behavioral_patterns": behavioral_patterns
        }

if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v", "--tb=short"])
