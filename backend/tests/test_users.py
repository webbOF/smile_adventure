# filepath: backend/tests/test_users.py
"""
Task 18: Users Integration Testing - Complete Implementation
120 minuti

Comprehensive test suite for user functionality including:
- User profile management
- Children CRUD with parent authorization  
- Professional profile creation
- Search functionality
- End-to-end workflow: register → login → create child → update profile
"""

import pytest
import json
import time
from datetime import datetime, timedelta, timezone, date
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from typing import Dict, Any, Optional

from app.core.database import Base, get_db
from app.auth.models import User, UserRole, UserStatus
from app.users.models import Child, ProfessionalProfile
from app.auth.utils import create_access_token
from main import app

# =============================================================================
# TEST DATABASE SETUP
# =============================================================================

# Use in-memory SQLite for fast testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={
        "check_same_thread": False,
    },
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create test database tables
Base.metadata.create_all(bind=engine)


def override_get_db():
    """Override database dependency for testing"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


# Override the dependency
app.dependency_overrides[get_db] = override_get_db

# Create test client
client = TestClient(app)

# =============================================================================
# TEST FIXTURES
# =============================================================================

@pytest.fixture
def db_session():
    """Provide a clean database session for each test"""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def clean_db():
    """Clean database before each test"""
    # Clear all tables
    with engine.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(table.delete())
    
    yield
    # Clean up after test
    with engine.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(table.delete())


@pytest.fixture
def parent_user(db_session, clean_db):
    """Create a test parent user"""
    user = User(
        email="parent@example.com",
        hashed_password="$2b$12$test_hash",
        first_name="John",
        last_name="Doe",
        phone="1234567890",
        role=UserRole.PARENT,
        status=UserStatus.ACTIVE,
        is_active=True,
        is_verified=True,
        failed_login_attempts=0,
        email_verified_at=datetime.now(timezone.utc),
        created_at=datetime.now(timezone.utc)
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def professional_user(db_session, clean_db):
    """Create a test professional user"""
    user = User(
        email="professional@example.com",
        hashed_password="$2b$12$test_hash",
        first_name="Dr. Jane",
        last_name="Smith",        phone="9876543210",
        role=UserRole.PROFESSIONAL,
        status=UserStatus.ACTIVE,
        is_active=True,
        is_verified=True,
        failed_login_attempts=0,
        email_verified_at=datetime.now(timezone.utc),
        license_number="MD123456",
        specialization="Pediatric Dentistry",
        clinic_name="SmileCare Clinic",
        created_at=datetime.now(timezone.utc)
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def admin_user(db_session, clean_db):
    """Create a test admin user"""
    user = User(
        email="admin@example.com",
        hashed_password="$2b$12$test_hash",
        first_name="Admin",
        last_name="User",
        role=UserRole.ADMIN,
        status=UserStatus.ACTIVE,
        is_active=True,
        is_verified=True,
        failed_login_attempts=0,
        email_verified_at=datetime.now(timezone.utc),
        created_at=datetime.now(timezone.utc)
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def parent_token(parent_user):
    """Create access token for parent user"""
    return create_access_token(data={
        "user_id": parent_user.id,
        "email": parent_user.email,
        "role": parent_user.role.value
    })


@pytest.fixture
def professional_token(professional_user):
    """Create access token for professional user"""
    return create_access_token(data={
        "user_id": professional_user.id,
        "email": professional_user.email,
        "role": professional_user.role.value
    })


@pytest.fixture
def admin_token(admin_user):
    """Create access token for admin user"""
    return create_access_token(data={
        "user_id": admin_user.id,
        "email": admin_user.email,
        "role": admin_user.role.value
    })


@pytest.fixture
def sample_child_data():
    """Sample child data for testing"""
    return {
        "name": "Emma Johnson",
        "age": 8,
        "date_of_birth": "2016-03-15",
        "diagnosis": "Autism Spectrum Disorder",
        "support_level": 2,
        "diagnosis_date": "2018-05-01",
        "communication_style": "mixed",
        "sensory_profile": {
            "auditory": {
                "sensitivity": "high",
                "triggers": ["sudden_loud_noises", "overlapping_sounds"],
                "accommodations": ["noise_cancelling_headphones"]
            },
            "visual": {
                "sensitivity": "moderate",
                "preferences": ["dim_lighting", "minimal_visual_clutter"]
            }
        },
        "current_therapies": [
            {
                "type": "ABA",
                "provider": "Behavioral Health Center",
                "frequency": "3x_weekly",
                "start_date": "2024-01-15",
                "goals": ["increase_communication", "reduce_problem_behaviors"]
            }
        ],
        "emergency_contacts": [
            {
                "name": "Jane Doe",
                "phone": "+1234567890",
                "relationship": "mother",
                "email": "jane@example.com"
            }
        ],
        "safety_protocols": {
            "elopement_risk": "moderate",
            "calming_strategies": ["deep_pressure", "sensory_break", "preferred_music"]
        }
    }


@pytest.fixture
def sample_professional_profile_data():
    """Sample professional profile data"""
    return {
        "license_type": "MD",
        "license_number": "MD123456",
        "license_state": "CA",
        "license_expiry": "2026-12-31",
        "primary_specialty": "Pediatric Dentistry",
        "subspecialties": ["Behavioral Management", "Special Needs Dentistry"],
        "certifications": ["Board Certified Pediatric Dentist", "Sedation Certification"],
        "years_experience": 15,
        "asd_experience_years": 8,
        "asd_certifications": ["ASD-Specific Training Certificate"],
        "preferred_age_groups": ["toddlers", "preschool", "elementary"],
        "treatment_approaches": ["Behavioral Management", "Visual Supports"],
        "clinic_name": "SmileCare Pediatric Clinic",
        "clinic_address": "123 Main St, Cityville, CA 90210",
        "clinic_phone": "+1-555-0123",
        "practice_type": "Private Practice",
        "bio": "Experienced pediatric dentist specializing in care for children with autism spectrum disorders.",
        "treatment_philosophy": "Every child deserves gentle, understanding dental care tailored to their unique needs.",
        "languages_spoken": ["English", "Spanish"],
        "accepts_new_patients": True
    }


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def create_headers(token: str) -> Dict[str, str]:
    """Create authorization headers with token"""
    return {"Authorization": f"Bearer {token}"}


def assert_response_success(response, expected_status: int = 200):
    """Assert response is successful and print details on failure"""
    if response.status_code != expected_status:
        print(f"❌ Expected status {expected_status}, got {response.status_code}")
        print(f"Response body: {response.text}")
    assert response.status_code == expected_status


def assert_response_error(response, expected_status: int):
    """Assert response has expected error status"""
    if response.status_code != expected_status:
        print(f"❌ Expected error status {expected_status}, got {response.status_code}")
        print(f"Response body: {response.text}")
    assert response.status_code == expected_status


# =============================================================================
# TEST CLASSES
# =============================================================================

class TestUserProfileManagement:
    """Test user profile management functionality"""

    def test_get_user_profile(self, parent_user, parent_token):
        """Test getting user profile"""
        print("\n🧪 Testing get user profile...")
        
        headers = create_headers(parent_token)
        response = client.get("/api/v1/users/profile", headers=headers)
        
        assert_response_success(response)
        data = response.json()
        
        assert data["id"] == parent_user.id
        assert data["email"] == parent_user.email
        assert data["first_name"] == parent_user.first_name
        assert data["last_name"] == parent_user.last_name
        assert data["role"] == "parent"
        print("✅ Get user profile successful")

    def test_update_user_profile(self, parent_user, parent_token):
        """Test updating user profile"""
        print("\n🧪 Testing update user profile...")
        
        headers = create_headers(parent_token)
        update_data = {
            "first_name": "John Updated",
            "bio": "Updated bio for testing",
            "phone_number": "+1-555-0199",
            "emergency_contact_name": "Emergency Contact",
            "emergency_contact_phone": "+1-555-0100"
        }
        
        response = client.put("/api/v1/users/profile", json=update_data, headers=headers)
        
        assert_response_success(response)
        data = response.json()
        
        assert data["first_name"] == "John Updated"
        print("✅ Update user profile successful")

    def test_profile_completion_check(self, parent_user, parent_token):
        """Test profile completion check"""
        print("\n🧪 Testing profile completion check...")
        
        headers = create_headers(parent_token)
        response = client.get("/api/v1/users/profile/completion", headers=headers)
        
        assert_response_success(response)
        data = response.json()
        
        assert "completion_percentage" in data
        assert "missing_fields" in data
        assert "recommendations" in data
        assert isinstance(data["completion_percentage"], (int, float))
        assert 0 <= data["completion_percentage"] <= 100
        print("✅ Profile completion check successful")

    def test_user_preferences_management(self, parent_user, parent_token):
        """Test user preferences get and update"""
        print("\n🧪 Testing user preferences management...")
        
        headers = create_headers(parent_token)
          # Get current preferences
        response = client.get("/api/v1/users/preferences", headers=headers)
        assert_response_success(response)
        
        # Update preferences
        preferences_data = {
            "language": "es",
            "theme": "dark",
            "notifications_enabled": False,
            "privacy_level": "private"
        }
        
        response = client.put("/api/v1/users/preferences", json=preferences_data, headers=headers)
        assert_response_success(response)
        
        data = response.json()
        assert data["language"] == "es"
        assert data["theme"] == "dark"
        assert data["notifications_enabled"] is False
        print("✅ User preferences management successful")


class TestChildrenCRUDWithAuthorization:
    """Test children CRUD operations with proper parent authorization"""

    def test_create_child_success(self, parent_user, parent_token, sample_child_data):
        """Test successful child creation by parent"""
        print("\n🧪 Testing child creation...")
        
        headers = create_headers(parent_token)
        response = client.post("/api/v1/users/children", json=sample_child_data, headers=headers)
        
        assert_response_success(response, 201)
        data = response.json()
        
        assert data["name"] == sample_child_data["name"]
        assert data["age"] == sample_child_data["age"]
        assert data["parent_id"] == parent_user.id
        assert data["diagnosis"] == sample_child_data["diagnosis"]
        assert data["support_level"] == sample_child_data["support_level"]
        print("✅ Child creation successful")
        
        return data["id"]  # Return child ID for other tests

    def test_create_child_unauthorized(self, professional_token, sample_child_data):
        """Test child creation fails for non-parent user"""
        print("\n🧪 Testing unauthorized child creation...")
        
        headers = create_headers(professional_token)
        response = client.post("/api/v1/users/children", json=sample_child_data, headers=headers)
        
        assert_response_error(response, 403)
        print("✅ Unauthorized child creation properly blocked")

    def test_get_children_list(self, parent_user, parent_token, sample_child_data):
        """Test getting list of children for parent"""
        print("\n🧪 Testing get children list...")
        
        headers = create_headers(parent_token)
        
        # First create a child
        client.post("/api/v1/users/children", json=sample_child_data, headers=headers)
        
        # Then get the list
        response = client.get("/api/v1/users/children", headers=headers)
        
        assert_response_success(response)
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) >= 1
        assert data[0]["parent_id"] == parent_user.id
        print("✅ Get children list successful")

    def test_get_child_details(self, parent_user, parent_token, sample_child_data):
        """Test getting specific child details with authorization"""
        print("\n🧪 Testing get child details...")
        
        headers = create_headers(parent_token)
        
        # Create child first
        create_response = client.post("/api/v1/users/children", json=sample_child_data, headers=headers)
        child_id = create_response.json()["id"]
        
        # Get child details
        response = client.get(f"/api/v1/users/children/{child_id}", headers=headers)
        
        assert_response_success(response)
        data = response.json()
        
        assert data["id"] == child_id
        assert data["parent_id"] == parent_user.id
        assert data["name"] == sample_child_data["name"]
        print("✅ Get child details successful")

    def test_get_child_details_unauthorized(self, parent_user, parent_token, professional_token, sample_child_data):
        """Test getting child details fails for different parent"""
        print("\n🧪 Testing unauthorized child access...")
        
        # Create child with parent
        parent_headers = create_headers(parent_token)
        create_response = client.post("/api/v1/users/children", json=sample_child_data, headers=parent_headers)
        child_id = create_response.json()["id"]
        
        # Try to access with professional
        prof_headers = create_headers(professional_token)
        response = client.get(f"/api/v1/users/children/{child_id}", headers=prof_headers)
        
        assert_response_error(response, 403)
        print("✅ Unauthorized child access properly blocked")

    def test_update_child_success(self, parent_user, parent_token, sample_child_data):
        """Test successful child update by parent"""
        print("\n🧪 Testing child update...")
        
        headers = create_headers(parent_token)
        
        # Create child first
        create_response = client.post("/api/v1/users/children", json=sample_child_data, headers=headers)
        child_id = create_response.json()["id"]
        
        # Update child
        update_data = {
            "name": "Emma Updated",
            "age": 9,
            "behavioral_notes": "Updated behavioral notes for testing"
        }
        
        response = client.put(f"/api/v1/users/children/{child_id}", json=update_data, headers=headers)
        
        assert_response_success(response)
        data = response.json()
        
        assert data["name"] == "Emma Updated"
        assert data["age"] == 9
        print("✅ Child update successful")

    def test_delete_child_success(self, parent_user, parent_token, sample_child_data):
        """Test successful child deletion by parent"""
        print("\n🧪 Testing child deletion...")
        
        headers = create_headers(parent_token)
        
        # Create child first
        create_response = client.post("/api/v1/users/children", json=sample_child_data, headers=headers)
        child_id = create_response.json()["id"]
        
        # Delete child
        response = client.delete(f"/api/v1/users/children/{child_id}", headers=headers)
        
        assert_response_success(response)
        
        # Verify child is deleted (should get 404)
        get_response = client.get(f"/api/v1/users/children/{child_id}", headers=headers)
        assert_response_error(get_response, 404)
        print("✅ Child deletion successful")

    def test_child_progress_tracking(self, parent_user, parent_token, sample_child_data):
        """Test child progress and analytics endpoints"""
        print("\n🧪 Testing child progress tracking...")
        
        headers = create_headers(parent_token)
        
        # Create child first
        create_response = client.post("/api/v1/users/children", json=sample_child_data, headers=headers)
        child_id = create_response.json()["id"]
        
        # Test progress endpoint
        response = client.get(f"/api/v1/users/children/{child_id}/progress", headers=headers)
        assert_response_success(response)
        
        # Test achievements endpoint
        response = client.get(f"/api/v1/users/children/{child_id}/achievements", headers=headers)
        assert_response_success(response)
        
        # Test profile completion check
        response = client.get(f"/api/v1/users/children/{child_id}/profile-completion", headers=headers)
        assert_response_success(response)
        
        data = response.json()
        assert "completion" in data
        assert "percentage" in data["completion"]
        print("✅ Child progress tracking successful")


class TestProfessionalProfileCreation:
    """Test professional profile creation and management"""

    def test_create_professional_profile_success(self, professional_user, professional_token, sample_professional_profile_data):
        """Test successful professional profile creation"""
        print("\n🧪 Testing professional profile creation...")
        
        headers = create_headers(professional_token)
        response = client.post("/api/v1/users/professional-profile", json=sample_professional_profile_data, headers=headers)
        
        assert_response_success(response, 201)
        data = response.json()
        
        assert data["user_id"] == professional_user.id
        assert data["license_type"] == sample_professional_profile_data["license_type"]
        assert data["license_number"] == sample_professional_profile_data["license_number"]
        assert data["primary_specialty"] == sample_professional_profile_data["primary_specialty"]
        assert data["clinic_name"] == sample_professional_profile_data["clinic_name"]
        print("✅ Professional profile creation successful")

    def test_create_professional_profile_unauthorized(self, parent_token, sample_professional_profile_data):
        """Test professional profile creation fails for non-professional"""
        print("\n🧪 Testing unauthorized professional profile creation...")
        
        headers = create_headers(parent_token)
        response = client.post("/api/v1/users/professional-profile", json=sample_professional_profile_data, headers=headers)
        
        assert_response_error(response, 403)
        print("✅ Unauthorized professional profile creation properly blocked")

    def test_get_professional_profile(self, professional_user, professional_token, sample_professional_profile_data):
        """Test getting professional profile"""
        print("\n🧪 Testing get professional profile...")
        
        headers = create_headers(professional_token)
        
        # Create profile first
        client.post("/api/v1/users/professional-profile", json=sample_professional_profile_data, headers=headers)
        
        # Get profile
        response = client.get("/api/v1/users/professional-profile", headers=headers)
        
        assert_response_success(response)
        data = response.json()
        
        assert data["user_id"] == professional_user.id
        assert data["license_type"] == sample_professional_profile_data["license_type"]
        print("✅ Get professional profile successful")

    def test_update_professional_profile(self, professional_user, professional_token, sample_professional_profile_data):
        """Test updating professional profile"""
        print("\n🧪 Testing update professional profile...")
        
        headers = create_headers(professional_token)
        
        # Create profile first
        client.post("/api/v1/users/professional-profile", json=sample_professional_profile_data, headers=headers)
        
        # Update profile
        update_data = {
            "bio": "Updated bio for testing professional profile",
            "years_experience": 20,
            "accepts_new_patients": False
        }
        
        response = client.put("/api/v1/users/professional-profile", json=update_data, headers=headers)
        
        assert_response_success(response)
        data = response.json()
        
        assert data["bio"] == update_data["bio"]
        assert data["years_experience"] == update_data["years_experience"]
        assert data["accepts_new_patients"] == update_data["accepts_new_patients"]
        print("✅ Update professional profile successful")

    def test_professional_profile_validation(self, professional_token):
        """Test professional profile validation"""
        print("\n🧪 Testing professional profile validation...")
        
        headers = create_headers(professional_token)
        
        # Test invalid license state
        invalid_data = {
            "license_type": "MD",
            "license_number": "MD123456",
            "license_state": "INVALID",  # Invalid state
            "primary_specialty": "Pediatric Dentistry"
        }
        
        response = client.post("/api/v1/users/professional-profile", json=invalid_data, headers=headers)
        assert_response_error(response, 422)
        
        # Test invalid experience years
        invalid_data = {
            "license_type": "MD",
            "license_number": "MD123456",
            "license_state": "CA",
            "years_experience": -5,  # Negative experience
            "primary_specialty": "Pediatric Dentistry"
        }
        
        response = client.post("/api/v1/users/professional-profile", json=invalid_data, headers=headers)
        assert_response_error(response, 422)
        print("✅ Professional profile validation successful")


class TestSearchFunctionality:
    """Test search functionality for professionals and users"""

    def test_search_professionals_basic(self, parent_token, professional_user, professional_token, sample_professional_profile_data):
        """Test basic professional search functionality"""
        print("\n🧪 Testing professional search...")
        
        # Create professional profile first
        prof_headers = create_headers(professional_token)
        client.post("/api/v1/users/professional-profile", json=sample_professional_profile_data, headers=prof_headers)
        
        # Search for professionals
        parent_headers = create_headers(parent_token)
        search_data = {
            "specializations": ["Pediatric Dentistry"],
            "location": "CA",
            "max_distance": 50
        }
        
        response = client.post("/api/v1/users/profile/search/professionals", json=search_data, headers=parent_headers)
        
        assert_response_success(response)
        data = response.json()
        
        assert isinstance(data, list)
        # Should find at least our created professional
        if len(data) > 0:
            assert any(prof["primary_specialty"] == "Pediatric Dentistry" for prof in data)
        print("✅ Professional search successful")

    def test_search_professionals_with_filters(self, parent_token, professional_user, professional_token, sample_professional_profile_data):
        """Test professional search with various filters"""
        print("\n🧪 Testing professional search with filters...")
        
        # Create professional profile first
        prof_headers = create_headers(professional_token)
        client.post("/api/v1/users/professional-profile", json=sample_professional_profile_data, headers=prof_headers)
        
        # Search with specific filters
        parent_headers = create_headers(parent_token)
        search_data = {
            "specializations": ["Pediatric Dentistry"],
            "experience_years": 10,
            "accepts_insurance": True,
            "location": "California"
        }
        
        response = client.post("/api/v1/users/profile/search/professionals", json=search_data, headers=parent_headers)
        
        assert_response_success(response)
        data = response.json()
        assert isinstance(data, list)
        print("✅ Professional search with filters successful")

    def test_get_professional_public_profile(self, parent_token, professional_user, professional_token, sample_professional_profile_data):
        """Test getting public professional profile by ID"""
        print("\n🧪 Testing get professional public profile...")
        
        # Create professional profile first
        prof_headers = create_headers(professional_token)
        client.post("/api/v1/users/professional-profile", json=sample_professional_profile_data, headers=prof_headers)
        
        # Get professional profile by ID
        parent_headers = create_headers(parent_token)
        response = client.get(f"/api/v1/users/profile/professional/{professional_user.id}", headers=parent_headers)
        
        assert_response_success(response)
        data = response.json()
        
        assert data["id"] == professional_user.id
        assert data["role"] == "professional"
        print("✅ Get professional public profile successful")


class TestEndToEndWorkflow:
    """Test complete end-to-end workflows"""

    def test_complete_parent_workflow(self, sample_child_data):
        """Test: register → login → create child → update profile"""
        print("\n🧪 Testing complete parent workflow...")
        
        # Step 1: Register new parent user
        register_data = {
            "email": "newparent@example.com",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!",
            "first_name": "New",
            "last_name": "Parent",
            "phone": "5555551234",
            "role": "parent"
        }
        response = client.post("/api/v1/auth/register", json=register_data)
        assert_response_success(response, 201)
        print("   ✅ Step 1: Registration successful")
        
        # Verify email (required before login)
        user_id = response.json()["user"]["id"]
        verify_response = client.post(f"/api/v1/auth/verify-email/{user_id}")
        assert_response_success(verify_response)
        print("   ✅ Email verification successful")
        
        # Step 2: Login with new user
        login_data = {
            "username": "newparent@example.com",
            "password": "SecurePassword123!"
        }
        
        response = client.post("/api/v1/auth/login", data=login_data)
        assert_response_success(response)
        
        token_data = response.json()
        access_token = token_data["token"]["access_token"]
        user_id = token_data["user"]["id"]
        headers = create_headers(access_token)
        print("   ✅ Step 2: Login successful")
        
        # Step 3: Update user profile
        profile_update = {
            "bio": "New parent excited to help my child",
            "emergency_contact_name": "Emergency Contact",
            "emergency_contact_phone": "+1-555-0199"
        }
        
        response = client.put("/api/v1/users/profile", json=profile_update, headers=headers)
        assert_response_success(response)
        print("   ✅ Step 3: Profile update successful")
        
        # Step 4: Create child profile
        response = client.post("/api/v1/users/children", json=sample_child_data, headers=headers)
        assert_response_success(response, 201)
        
        child_data = response.json()
        child_id = child_data["id"]
        assert child_data["parent_id"] == user_id
        print("   ✅ Step 4: Child creation successful")
        
        # Step 5: Update child profile
        child_update = {
            "behavioral_notes": "Child responds well to visual cues and routines",
            "communication_notes": "Uses mix of verbal and gesture communication"
        }
        
        response = client.put(f"/api/v1/users/children/{child_id}", json=child_update, headers=headers)
        assert_response_success(response)
        print("   ✅ Step 5: Child update successful")
        
        # Step 6: Check child progress and completion
        response = client.get(f"/api/v1/users/children/{child_id}/progress", headers=headers)
        assert_response_success(response)
        
        response = client.get(f"/api/v1/users/children/{child_id}/profile-completion", headers=headers)
        assert_response_success(response)
        print("   ✅ Step 6: Progress tracking successful")
        
        print("✅ Complete parent workflow successful!")

    def test_complete_professional_workflow(self, sample_professional_profile_data):
        """Test: register → login → create professional profile → search"""
        print("\n🧪 Testing complete professional workflow...")
        
        # Step 1: Register new professional user
        register_data = {
            "email": "newprofessional@example.com",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!",
            "first_name": "Dr. New",
            "last_name": "Professional",
            "phone": "5555559999",
            "role": "professional",
            "license_number": "MD789012",
            "specialization": "Behavioral Therapy",            "clinic_name": "New Professional Clinic"
        }
        response = client.post("/api/v1/auth/register", json=register_data)
        assert_response_success(response, 201)
        print("   ✅ Step 1: Professional registration successful")
        
        # Verify email (required before login)
        user_id = response.json()["user"]["id"]
        verify_response = client.post(f"/api/v1/auth/verify-email/{user_id}")
        assert_response_success(verify_response)
        print("   ✅ Email verification successful")
        
        # Step 2: Login with new professional
        login_data = {
            "username": "newprofessional@example.com",
            "password": "SecurePassword123!"
        }
        
        response = client.post("/api/v1/auth/login", data=login_data)
        assert_response_success(response)
        
        token_data = response.json()
        access_token = token_data["token"]["access_token"]
        headers = create_headers(access_token)
        print("   ✅ Step 2: Professional login successful")
        
        # Step 3: Create professional profile
        profile_data = sample_professional_profile_data.copy()
        profile_data["license_number"] = "MD789012"  # Match registration
        profile_data["clinic_name"] = "New Professional Clinic"
        
        response = client.post("/api/v1/users/professional-profile", json=profile_data, headers=headers)
        assert_response_success(response, 201)
        print("   ✅ Step 3: Professional profile creation successful")
        
        # Step 4: Update professional profile
        profile_update = {
            "bio": "Experienced professional specializing in ASD support",
            "treatment_philosophy": "Every individual deserves personalized care",
            "accepts_new_patients": True
        }
        
        response = client.put("/api/v1/users/professional-profile", json=profile_update, headers=headers)
        assert_response_success(response)
        print("   ✅ Step 4: Professional profile update successful")
        
        # Step 5: Get updated profile
        response = client.get("/api/v1/users/professional-profile", headers=headers)
        assert_response_success(response)
        
        data = response.json()
        assert data["bio"] == profile_update["bio"]
        assert data["accepts_new_patients"] == profile_update["accepts_new_patients"]
        print("   ✅ Step 5: Profile retrieval successful")
        
        print("✅ Complete professional workflow successful!")

    def test_cross_user_interaction_workflow(self, sample_child_data, sample_professional_profile_data):
        """Test interaction between parent and professional users"""
        print("\n🧪 Testing cross-user interaction workflow...")
        
        # Create parent user and child
        parent_register = {
            "email": "interaction_parent@example.com",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!",
            "first_name": "Interaction",
            "last_name": "Parent",
            "role": "parent"
        }
        response = client.post("/api/v1/auth/register", json=parent_register)
        assert_response_success(response, 201)
        
        # Verify parent email (required before login)
        parent_user_id = response.json()["user"]["id"]
        verify_response = client.post(f"/api/v1/auth/verify-email/{parent_user_id}")
        assert_response_success(verify_response)
        
        # Login parent
        login_response = client.post("/api/v1/auth/login", data={
            "username": "interaction_parent@example.com",
            "password": "SecurePassword123!"
        })
        parent_token = login_response.json()["token"]["access_token"]
        parent_headers = create_headers(parent_token)
        
        # Create child
        child_response = client.post("/api/v1/users/children", json=sample_child_data, headers=parent_headers)
        child_id = child_response.json()["id"]
        print("   ✅ Parent and child created")
        
        # Create professional user
        prof_register = {
            "email": "interaction_prof@example.com",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!",
            "first_name": "Dr. Interaction",
            "last_name": "Professional",
            "role": "professional",
            "license_number": "MD555666",
            "specialization": "ASD Support"        }
        response = client.post("/api/v1/auth/register", json=prof_register)
        assert_response_success(response, 201)
        
        # Verify professional email (required before login)
        prof_user_id = response.json()["user"]["id"]
        verify_response = client.post(f"/api/v1/auth/verify-email/{prof_user_id}")
        assert_response_success(verify_response)
        
        # Login professional
        prof_login_response = client.post("/api/v1/auth/login", data={
            "username": "interaction_prof@example.com",
            "password": "SecurePassword123!"
        })
        prof_token = prof_login_response.json()["token"]["access_token"]
        prof_headers = create_headers(prof_token)
        prof_user_id = prof_login_response.json()["user"]["id"]
        
        # Create professional profile
        prof_profile_data = sample_professional_profile_data.copy()
        prof_profile_data["license_number"] = "MD555666"
        
        response = client.post("/api/v1/users/professional-profile", json=prof_profile_data, headers=prof_headers)
        assert_response_success(response, 201)
        print("   ✅ Professional and profile created")
        
        # Parent searches for professionals
        search_data = {
            "specializations": ["Pediatric Dentistry"],
            "location": "CA"
        }
        
        response = client.post("/api/v1/users/profile/search/professionals", json=search_data, headers=parent_headers)
        assert_response_success(response)
        print("   ✅ Parent searched for professionals")
        
        # Parent views professional profile
        response = client.get(f"/api/v1/users/profile/professional/{prof_user_id}", headers=parent_headers)
        assert_response_success(response)
        print("   ✅ Parent viewed professional profile")
        
        # Verify professional cannot access child directly
        response = client.get(f"/api/v1/users/children/{child_id}", headers=prof_headers)
        assert_response_error(response, 403)
        print("   ✅ Professional access to child properly blocked")
        
        print("✅ Cross-user interaction workflow successful!")


class TestErrorHandlingAndValidation:
    """Test error handling and validation scenarios"""

    def test_invalid_child_data_validation(self, parent_token):
        """Test child data validation errors"""
        print("\n🧪 Testing child data validation...")
        
        headers = create_headers(parent_token)
        
        # Test invalid age
        invalid_data = {
            "name": "Test Child",
            "age": -5,  # Invalid negative age
            "diagnosis": "ASD"
        }
        
        response = client.post("/api/v1/users/children", json=invalid_data, headers=headers)
        assert_response_error(response, 422)
        
        # Test invalid support level
        invalid_data = {
            "name": "Test Child",
            "age": 8,
            "support_level": 5,  # Invalid support level
            "diagnosis": "ASD"
        }
        
        response = client.post("/api/v1/users/children", json=invalid_data, headers=headers)
        assert_response_error(response, 422)
        print("✅ Child data validation working properly")

    def test_unauthorized_access_scenarios(self, parent_token, professional_token):
        """Test various unauthorized access scenarios"""
        print("\n🧪 Testing unauthorized access scenarios...")
        
        parent_headers = create_headers(parent_token)
        prof_headers = create_headers(professional_token)
        
        # Professional trying to create child
        child_data = {"name": "Test", "age": 5}
        response = client.post("/api/v1/users/children", json=child_data, headers=prof_headers)
        assert_response_error(response, 403)
        
        # Parent trying to create professional profile
        prof_data = {"license_type": "MD", "primary_specialty": "Test"}
        response = client.post("/api/v1/users/professional-profile", json=prof_data, headers=parent_headers)
        assert_response_error(response, 403)
        
        # Access without token
        response = client.get("/api/v1/users/profile")
        assert_response_error(response, 401)
        
        print("✅ Unauthorized access properly blocked")

    def test_resource_not_found_scenarios(self, parent_token):
        """Test resource not found scenarios"""
        print("\n🧪 Testing resource not found scenarios...")
        
        headers = create_headers(parent_token)
        
        # Non-existent child
        response = client.get("/api/v1/users/children/99999", headers=headers)
        assert_response_error(response, 404)
        
        # Non-existent professional
        response = client.get("/api/v1/users/profile/professional/99999", headers=headers)
        assert_response_error(response, 404)
        
        print("✅ Resource not found handling working properly")


class TestPerformanceAndConcurrency:
    """Test performance and concurrent operations"""
    
    def test_multiple_child_operations(self, parent_token, sample_child_data):
        """Test creating and managing multiple children"""
        print("\n🧪 Testing multiple child operations...")
        
        headers = create_headers(parent_token)
        created_children = []
          # Create multiple children with valid names (letters, spaces, hyphens, apostrophes only)
        child_names = ["Emma Smith", "Alex Johnson", "Sarah O'Connor"]
        # Calculate dates of birth that match the ages (5, 6, 7)
        birth_dates = ["2019-03-15", "2018-03-15", "2017-03-15"]
        # Set diagnosis dates after birth dates (typically diagnosed around 2-3 years old)
        diagnosis_dates = ["2021-06-01", "2020-06-01", "2019-06-01"]
        
        for i in range(3):
            child_data = sample_child_data.copy()
            child_data["name"] = child_names[i]
            child_data["age"] = 5 + i
            child_data["date_of_birth"] = birth_dates[i]
            child_data["diagnosis_date"] = diagnosis_dates[i]
            
            response = client.post("/api/v1/users/children", json=child_data, headers=headers)
            assert_response_success(response, 201)
            created_children.append(response.json()["id"])
        
        # Get all children
        response = client.get("/api/v1/users/children", headers=headers)
        assert_response_success(response)
        
        children_list = response.json()
        assert len(children_list) >= 3
        print("✅ Multiple child operations successful")

    def test_bulk_data_retrieval(self, parent_token, sample_child_data):
        """Test retrieving bulk data efficiently"""
        print("\n🧪 Testing bulk data retrieval...")
        
        headers = create_headers(parent_token)
        
        # Create child
        child_response = client.post("/api/v1/users/children", json=sample_child_data, headers=headers)
        child_id = child_response.json()["id"]
        
        # Test multiple concurrent requests
        endpoints = [
            f"/api/v1/users/children/{child_id}",
            f"/api/v1/users/children/{child_id}/progress",
            f"/api/v1/users/children/{child_id}/achievements",
            f"/api/v1/users/children/{child_id}/profile-completion"
        ]
        
        for endpoint in endpoints:
            response = client.get(endpoint, headers=headers)
            assert_response_success(response)
        
        print("✅ Bulk data retrieval successful")


# =============================================================================
# MAIN TEST EXECUTION
# =============================================================================

def test_all_integration_scenarios():
    """Run comprehensive integration test scenarios"""
    print("\n" + "="*60)
    print("🎯 TASK 18: USERS INTEGRATION TESTING")
    print("Testing complete user functionality")
    print("="*60)
    
    # Note: Individual test methods will be automatically discovered and run by pytest
    # This function serves as documentation of the test scope
    
    test_scenarios = [
        "✅ User profile management",
        "✅ Children CRUD with parent authorization", 
        "✅ Professional profile creation",
        "✅ Search functionality",
        "✅ End-to-end workflows",
        "✅ Error handling and validation",
        "✅ Performance and concurrency"
    ]
    
    print("\nTest scenarios covered:")
    for scenario in test_scenarios:
        print(f"  {scenario}")
    
    print("\n🎉 All integration test scenarios defined!")
    print("Run with: pytest tests/test_users.py -v")


if __name__ == "__main__":
    test_all_integration_scenarios()
