"""
Task 22 Integration Tests: Report Generation Services
Comprehensive tests for ReportService functionality
"""

import pytest
import json
import csv
import io
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.auth.models import User, UserRole
from app.users.models import Child, GameSession
from app.reports.models import Report, ReportType, SessionType
from app.reports.services.report_service import ReportService

# Test database configuration
TEST_DATABASE_URL = "postgresql://smile_user:smile_password@localhost:5434/smile_adventure_test"

@pytest.fixture(scope="module")
def test_engine():
    """Create test database engine"""
    engine = create_engine(TEST_DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    return engine

@pytest.fixture(scope="function")
def db_session(test_engine):
    """Create test database session"""
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()

@pytest.fixture
def sample_user(db_session):
    """Create sample therapist user"""
    user = User(
        email="therapist@test.com",
        password_hash="hashed_password",
        role=UserRole.THERAPIST,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def sample_child(db_session, sample_user):
    """Create sample child"""
    child = Child(
        name="Test Child",
        age=8,
        parent_user_id=sample_user.id,
        diagnosis="ASD",
        created_at=datetime.now(timezone.utc)
    )
    db_session.add(child)
    db_session.commit()
    db_session.refresh(child)
    return child

@pytest.fixture
def sample_sessions(db_session, sample_child):
    """Create sample game sessions for testing"""
    sessions = []
    base_date = datetime.now(timezone.utc) - timedelta(days=30)
    
    for i in range(10):
        session = GameSession(
            child_id=sample_child.id,
            session_type=SessionType.DENTAL_VISIT if i % 2 == 0 else SessionType.THERAPY_SESSION,
            duration_minutes=15 + (i * 2),
            score=70 + (i * 3),
            levels_completed=2 + (i // 2),
            created_at=base_date + timedelta(days=i * 3),
            ended_at=base_date + timedelta(days=i * 3, minutes=15 + (i * 2)) if i < 8 else None,
            game_data={"test": f"session_{i}"}
        )
        sessions.append(session)
        db_session.add(session)
    
    db_session.commit()
    for session in sessions:
        db_session.refresh(session)
    return sessions

@pytest.fixture
def report_service(db_session):
    """Create ReportService instance"""
    return ReportService(db_session)

class TestReportService:
    """Test suite for ReportService functionality"""
    
    def test_generate_progress_report_valid_data(self, report_service, sample_child, sample_sessions):
        """Test 1: Generate progress report with valid data and standard period"""
        # Test with 30-day period
        report = report_service.generate_progress_report(sample_child.id, "30d")
        
        # Verify report structure
        assert report is not None
        assert "report_metadata" in report
        assert "executive_summary" in report
        assert "session_overview" in report
        assert "performance_analysis" in report
        assert "developmental_insights" in report
        assert "progress_indicators" in report
        assert "recommendations" in report
        assert "detailed_analytics" in report
        
        # Verify metadata
        metadata = report["report_metadata"]
        assert metadata["report_type"] == "progress_report"
        assert metadata["child_id"] == sample_child.id
        assert metadata["child_name"] == sample_child.name
        assert metadata["child_age"] == sample_child.age
        assert metadata["period"] == "30d"
        assert "total_sessions" in metadata
        assert metadata["total_sessions"] > 0
        
        # Verify session overview
        session_overview = report["session_overview"]
        assert "total_sessions" in session_overview
        assert "completed_sessions" in session_overview
        assert "completion_rate" in session_overview
        assert "average_duration" in session_overview
        assert "session_frequency" in session_overview
        
        print("✓ Test 1 passed: Progress report generated successfully with valid structure")
    
    def test_generate_progress_report_different_periods(self, report_service, sample_child, sample_sessions):
        """Test 2: Generate progress reports with different time periods"""
        periods = ["7d", "30d", "90d", "6m", "1y"]
        
        for period in periods:
            report = report_service.generate_progress_report(sample_child.id, period)
            
            assert report is not None
            assert report["report_metadata"]["period"] == period
            
            # Verify date range calculation
            date_range = report["report_metadata"]["date_range"]
            assert "start_date" in date_range
            assert "end_date" in date_range
            assert "days_covered" in date_range
            
        print("✓ Test 2 passed: Progress reports generated for all period types")
    
    def test_generate_progress_report_invalid_child(self, report_service):
        """Test 3: Generate progress report with invalid child ID"""
        with pytest.raises(ValueError, match="Child with ID 99999 not found"):
            report_service.generate_progress_report(99999, "30d")
        
        print("✓ Test 3 passed: Proper error handling for invalid child ID")
    
    def test_generate_progress_report_invalid_period(self, report_service, sample_child):
        """Test 4: Generate progress report with invalid period"""
        with pytest.raises(ValueError, match="Unsupported period"):
            report_service.generate_progress_report(sample_child.id, "invalid_period")
        
        print("✓ Test 4 passed: Proper error handling for invalid period")
    
    def test_generate_summary_report(self, report_service, sample_child, sample_sessions):
        """Test 5: Generate summary report with comprehensive data"""
        report = report_service.generate_summary_report(sample_child.id)
        
        # Verify report structure
        assert report is not None
        assert "report_metadata" in report
        assert "key_highlights" in report
        assert "performance_snapshot" in report
        assert "behavioral_summary" in report
        assert "next_steps" in report
        
        # Verify metadata
        metadata = report["report_metadata"]
        assert metadata["report_type"] == "summary_report"
        assert metadata["child_id"] == sample_child.id
        assert metadata["child_name"] == sample_child.name
        assert metadata["data_period"] == "all_time"
        
        # Verify key highlights
        highlights = report["key_highlights"]
        assert "total_sessions_completed" in highlights
        assert "overall_completion_rate" in highlights
        assert "current_performance_level" in highlights
        assert "primary_strengths" in highlights
        assert "growth_areas" in highlights
        assert "recent_achievements" in highlights
        
        # Verify performance snapshot
        snapshot = report["performance_snapshot"]
        assert "overall_progress" in snapshot
        assert "engagement_level" in snapshot
        assert "consistency_rating" in snapshot
        assert "improvement_trajectory" in snapshot
        
        print("✓ Test 5 passed: Summary report generated with correct structure")
    
    def test_generate_summary_report_no_sessions(self, report_service, db_session, sample_user):
        """Test 6: Generate summary report for child with no sessions"""
        # Create child without sessions
        child = Child(
            name="No Sessions Child",
            age=7,
            parent_user_id=sample_user.id,
            diagnosis="ASD"
        )
        db_session.add(child)
        db_session.commit()
        db_session.refresh(child)
        
        report = report_service.generate_summary_report(child.id)
        
        # Should return empty summary report
        assert report is not None
        assert report["report_metadata"]["child_id"] == child.id
        assert "message" in report["report_metadata"]
        
        print("✓ Test 6 passed: Summary report handles no sessions case")
    
    def test_create_professional_report_authorized(self, report_service, sample_child, sample_sessions, sample_user):
        """Test 7: Create professional report with authorized therapist"""
        report = report_service.create_professional_report(sample_child.id, sample_user.id)
        
        # Verify comprehensive professional report structure
        assert report is not None
        assert "report_metadata" in report
        assert "clinical_overview" in report
        assert "developmental_assessment" in report
        assert "quantitative_analysis" in report
        assert "behavioral_observations" in report
        assert "therapeutic_recommendations" in report
        assert "clinical_documentation" in report
        assert "appendices" in report
        
        # Verify metadata
        metadata = report["report_metadata"]
        assert metadata["report_type"] == "professional_report"
        assert metadata["child_id"] == sample_child.id
        assert metadata["professional_id"] == sample_user.id
        assert metadata["confidentiality_level"] == "clinical"
        assert "total_sessions_analyzed" in metadata
        
        # Verify clinical sections
        assert "assessment_period" in report["clinical_overview"]
        assert "intervention_type" in report["clinical_overview"]
        assert "baseline_assessment" in report["clinical_overview"]
        assert "current_status" in report["clinical_overview"]
        
        print("✓ Test 7 passed: Professional report created with comprehensive structure")
    
    def test_create_professional_report_unauthorized(self, report_service, sample_child, db_session):
        """Test 8: Create professional report with unauthorized user"""
        # Create non-therapist user
        regular_user = User(
            email="parent@test.com",
            password_hash="hashed_password",
            role=UserRole.PARENT,
            is_active=True
        )
        db_session.add(regular_user)
        db_session.commit()
        db_session.refresh(regular_user)
        
        with pytest.raises(ValueError, match="not authorized for clinical reports"):
            report_service.create_professional_report(sample_child.id, regular_user.id)
        
        print("✓ Test 8 passed: Professional report properly restricts unauthorized access")
    
    def test_export_data_json_format(self, report_service, sample_child, sample_sessions):
        """Test 9: Export data in JSON format"""
        # Test basic JSON export
        json_data = report_service.export_data(sample_child.id, "json", include_raw_data=False)
        
        assert isinstance(json_data, str)
        
        # Verify JSON is valid and has expected structure
        parsed_data = json.loads(json_data)
        assert "child_info" in parsed_data
        assert "session_summary" in parsed_data
        assert "sessions" in parsed_data
        
        # Verify child info
        child_info = parsed_data["child_info"]
        assert child_info["id"] == sample_child.id
        assert child_info["name"] == sample_child.name
        assert child_info["age"] == sample_child.age
        assert "export_date" in child_info
        
        # Verify sessions data
        sessions = parsed_data["sessions"]
        assert isinstance(sessions, list)
        assert len(sessions) > 0
        
        # Check session structure
        if sessions:
            session = sessions[0]
            assert "id" in session
            assert "date" in session
            assert "session_type" in session
            assert "duration_minutes" in session
            assert "final_score" in session
            assert "levels_completed" in session
            assert "completed" in session
        
        print("✓ Test 9 passed: JSON export works correctly")
    
    def test_export_data_json_with_raw_data(self, report_service, sample_child, sample_sessions):
        """Test 10: Export data in JSON format with raw analytics data"""
        json_data = report_service.export_data(sample_child.id, "json", include_raw_data=True)
        
        assert isinstance(json_data, str)
        
        parsed_data = json.loads(json_data)
        assert "analytics" in parsed_data
        
        # Verify analytics structure (even if placeholder)
        analytics = parsed_data["analytics"]
        assert isinstance(analytics, dict)
        
        # Check sessions have detailed metrics when raw data included
        sessions = parsed_data["sessions"]
        if sessions:
            session = sessions[0]
            assert "detailed_metrics" in session
        
        print("✓ Test 10 passed: JSON export with raw data includes analytics")
    
    def test_export_data_csv_format(self, report_service, sample_child, sample_sessions):
        """Test 11: Export data in CSV format"""
        csv_data = report_service.export_data(sample_child.id, "csv")
        
        assert isinstance(csv_data, str)
        assert len(csv_data) > 0
        
        # Verify CSV contains expected sections
        assert "Child Export Data" in csv_data
        assert "Session Summary" in csv_data
        assert "Sessions" in csv_data
        
        # Verify CSV is parseable
        lines = csv_data.strip().split('\n')
        assert len(lines) > 5  # Should have multiple sections
        
        # Check child info section
        reader = csv.reader(io.StringIO(csv_data))
        rows = list(reader)
        
        # Find child data row
        child_data_found = False
        for i, row in enumerate(rows):
            if len(row) >= 4 and str(sample_child.id) in str(row):
                child_data_found = True
                break
        
        assert child_data_found, "Child data not found in CSV export"
        
        print("✓ Test 11 passed: CSV export works correctly")
    
    def test_export_data_invalid_format(self, report_service, sample_child):
        """Test 12: Export data with invalid format"""
        with pytest.raises(ValueError, match="Unsupported export format"):
            report_service.export_data(sample_child.id, "xml")
        
        print("✓ Test 12 passed: Proper error handling for invalid export format")
    
    def test_export_data_invalid_child(self, report_service):
        """Test 13: Export data with invalid child ID"""
        with pytest.raises(ValueError, match="Child with ID 99999 not found"):
            report_service.export_data(99999, "json")
        
        print("✓ Test 13 passed: Proper error handling for invalid child in export")
    
    def test_report_storage_in_database(self, report_service, sample_child, sample_sessions, db_session):
        """Test 14: Verify reports are stored in database"""
        # Generate a progress report
        report = report_service.generate_progress_report(sample_child.id, "30d")
        
        # Check if report was stored in database
        stored_report = db_session.query(Report).filter(
            Report.child_id == sample_child.id,
            Report.report_type == ReportType.PROGRESS
        ).first()
        
        assert stored_report is not None
        assert stored_report.child_id == sample_child.id
        assert stored_report.report_type == ReportType.PROGRESS
        assert stored_report.content is not None
        assert stored_report.generated_at is not None
        
        print("✓ Test 14 passed: Reports are properly stored in database")
    
    def test_professional_report_storage_with_access_control(self, report_service, sample_child, sample_sessions, sample_user, db_session):
        """Test 15: Verify professional reports are stored with access control"""
        # Generate a professional report
        report = report_service.create_professional_report(sample_child.id, sample_user.id)
        
        # Check if professional report was stored with proper access control
        stored_report = db_session.query(Report).filter(
            Report.child_id == sample_child.id,
            Report.report_type == ReportType.PROFESSIONAL,
            Report.generated_by_id == sample_user.id
        ).first()
        
        assert stored_report is not None
        assert stored_report.child_id == sample_child.id
        assert stored_report.report_type == ReportType.PROFESSIONAL
        assert stored_report.generated_by_id == sample_user.id
        assert stored_report.content is not None
        
        print("✓ Test 15 passed: Professional reports stored with access control")

def run_integration_tests():
    """Run all integration tests"""
    print("="*60)
    print("TASK 22 INTEGRATION TESTS: REPORT GENERATION SERVICES")
    print("="*60)
    
    # Note: These tests require pytest to run properly
    # This function provides a summary of what would be tested
    
    tests = [
        "Generate progress report with valid data and standard period",
        "Generate progress reports with different time periods",
        "Generate progress report with invalid child ID", 
        "Generate progress report with invalid period",
        "Generate summary report with comprehensive data",
        "Generate summary report for child with no sessions",
        "Create professional report with authorized therapist",
        "Create professional report with unauthorized user",
        "Export data in JSON format",
        "Export data in JSON format with raw analytics data",
        "Export data in CSV format", 
        "Export data with invalid format",
        "Export data with invalid child ID",
        "Verify reports are stored in database",
        "Verify professional reports stored with access control"
    ]
    
    print(f"Total tests planned: {len(tests)}")
    print("\nTest descriptions:")
    for i, test_name in enumerate(tests, 1):
        print(f"{i:2d}. {test_name}")
    
    print("\n" + "="*60)
    print("To run these tests, execute:")
    print("pytest test_task22_integration.py -v")
    print("="*60)

if __name__ == "__main__":
    run_integration_tests()
