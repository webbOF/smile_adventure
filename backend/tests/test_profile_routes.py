# filepath: backend/tests/test_profile_routes.py
"""
Test cases for Task 14 Profile Enhancement Routes
Comprehensive testing for profile management functionality
"""

import pytest
import os
import tempfile
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from unittest.mock import patch, MagicMock

from app.main import app
from app.core.database import get_db, Base
from app.users.models import User
from app.auth.utils import create_access_token


# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    """Override database dependency for testing"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


# Test fixtures
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
def test_user(db_session, clean_db):
    """Create a test parent user"""
    user = User(
        email="test@example.com",
        hashed_password="$2b$12$test_hash",
        first_name="Test",
        last_name="User",
        role="parent",
        is_active=True,
        is_verified=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_professional(db_session, clean_db):
    """Create a test professional user"""
    user = User(
        email="professional@example.com",
        hashed_password="$2b$12$test_hash",
        first_name="Dr. Test",
        last_name="Professional",
        role="professional",
        is_active=True,
        is_verified=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_admin(db_session, clean_db):
    """Create a test admin user"""
    user = User(
        email="admin@example.com",
        hashed_password="$2b$12$test_hash",
        first_name="Admin",
        last_name="User",
        role="admin",
        is_active=True,
        is_verified=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def user_token(test_user):
    """Create access token for test user"""
    return create_access_token(data={"sub": str(test_user.id)})


@pytest.fixture
def professional_token(test_professional):
    """Create access token for test professional"""
    return create_access_token(data={"sub": str(test_professional.id)})


@pytest.fixture
def admin_token(test_admin):
    """Create access token for test admin"""
    return create_access_token(data={"sub": str(test_admin.id)})


class TestProfileRoutes:
    """Test class for profile enhancement routes"""
      def test_get_profile_completion(self, user_token):
        """Test profile completion endpoint"""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = client.get("/api/v1/users/profile/completion", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "completion_percentage" in data
        assert "missing_fields" in data
        assert "recommendations" in data
        assert isinstance(data["completion_percentage"], int)
        assert 0 <= data["completion_percentage"] <= 100    def test_update_profile(self, user_token):
        """Test profile update endpoint"""
        headers = {"Authorization": f"Bearer {user_token}"}
        update_data = {
            "bio": "Updated bio",
            "location": "New Location",
            "phone_number": "+1234567890"
        }
        
        response = client.put("/api/v1/users/profile/update", json=update_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["bio"] == "Updated bio"
        assert data["location"] == "New Location"
        assert data["phone_number"] == "+1234567890"

    def test_update_profile_invalid_phone(self, user_token):
        """Test profile update with invalid phone number"""
        headers = {"Authorization": f"Bearer {user_token}"}
        update_data = {
            "phone_number": "invalid_phone"
        }
        
        response = client.put("/users/profile/update", json=update_data, headers=headers)
        
        assert response.status_code == 422

    def test_avatar_upload_no_file(self, user_token):
        """Test avatar upload without file"""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = client.post("/users/profile/avatar", headers=headers)
        
        assert response.status_code == 422

    @patch('app.users.profile_routes.save_uploaded_file')
    def test_avatar_upload_success(self, mock_save_file, user_token):
        """Test successful avatar upload"""
        mock_save_file.return_value = "/uploads/avatars/test_avatar.jpg"
        
        headers = {"Authorization": f"Bearer {user_token}"}
        
        # Create a temporary test image file
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp_file:
            tmp_file.write(b"fake_image_data")
            tmp_file_path = tmp_file.name
        
        try:
            with open(tmp_file_path, "rb") as f:
                files = {"file": ("test_avatar.jpg", f, "image/jpeg")}
                response = client.post("/users/profile/avatar", files=files, headers=headers)
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert "avatar_url" in data
            
        finally:
            os.unlink(tmp_file_path)

    def test_get_user_preferences(self, user_token):
        """Test get user preferences endpoint"""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = client.get("/users/profile/preferences", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "language" in data
        assert "timezone" in data
        assert "notifications_enabled" in data
        assert "privacy_level" in data
        assert "theme" in data

    def test_update_user_preferences(self, user_token):
        """Test update user preferences endpoint"""
        headers = {"Authorization": f"Bearer {user_token}"}
        preferences_data = {
            "language": "es",
            "theme": "dark",
            "notifications_enabled": False
        }
        
        response = client.put("/users/profile/preferences", json=preferences_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["language"] == "es"
        assert data["theme"] == "dark"
        assert data["notifications_enabled"] is False

    def test_search_professionals(self, user_token):
        """Test professional search endpoint"""
        headers = {"Authorization": f"Bearer {user_token}"}
        search_data = {
            "specializations": ["behavioral_therapy"],
            "location": "New York",
            "max_distance": 25
        }
        
        response = client.post("/users/profile/search/professionals", json=search_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_professional_profile(self, user_token, test_professional):
        """Test get professional profile endpoint"""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = client.get(f"/users/profile/professional/{test_professional.id}", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_professional.id
        assert data["role"] == "professional"

    def test_admin_get_all_users_unauthorized(self, user_token):
        """Test admin endpoint with unauthorized user"""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = client.get("/users/profile/admin/users", headers=headers)
        
        assert response.status_code == 403

    def test_admin_get_all_users_authorized(self, admin_token):
        """Test admin endpoint with authorized admin"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = client.get("/users/profile/admin/users", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 3  # At least our test users

    def test_admin_update_user_status(self, admin_token, test_user):
        """Test admin user status update"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        update_data = {
            "is_active": False,
            "is_verified": False
        }
        
        response = client.put(
            f"/users/profile/admin/users/{test_user.id}/status",
            json=update_data,
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["is_active"] is False
        assert data["is_verified"] is False

    def test_admin_delete_user(self, admin_token, test_user):
        """Test admin user deletion"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        response = client.delete(f"/users/profile/admin/users/{test_user.id}", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "successfully deleted" in data["message"].lower()

    def test_unauthorized_access(self):
        """Test unauthorized access to protected endpoints"""
        # Test without token
        response = client.get("/users/profile/completion")
        assert response.status_code == 401
        
        # Test with invalid token
        headers = {"Authorization": "Bearer invalid_token"}
        response = client.get("/users/profile/completion", headers=headers)
        assert response.status_code == 401


class TestProfileValidation:
    """Test class for profile validation"""
    
    def test_invalid_preference_values(self):
        """Test validation of preference values"""
        from app.users.schemas import UserPreferences
        
        # Test invalid language
        with pytest.raises(ValueError):
            UserPreferences(language="invalid_lang")
        
        # Test invalid theme
        with pytest.raises(ValueError):
            UserPreferences(theme="invalid_theme")
        
        # Test invalid privacy level
        with pytest.raises(ValueError):
            UserPreferences(privacy_level="invalid_level")

    def test_valid_preference_values(self):
        """Test valid preference values"""
        from app.users.schemas import UserPreferences
        
        preferences = UserPreferences(
            language="en",
            theme="dark",
            privacy_level="private",
            notifications_enabled=False
        )
        
        assert preferences.language == "en"
        assert preferences.theme == "dark"
        assert preferences.privacy_level == "private"
        assert preferences.notifications_enabled is False

    def test_search_filters_validation(self):
        """Test professional search filters validation"""
        from app.users.schemas import ProfessionalSearchFilters
        
        # Test valid filters
        filters = ProfessionalSearchFilters(
            specializations=["behavioral_therapy", "occupational_therapy"],
            location="New York",
            experience_years=5,
            max_distance=25
        )
        
        assert len(filters.specializations) == 2
        assert filters.experience_years == 5
        assert filters.max_distance == 25
        
        # Test invalid specialization
        with pytest.raises(ValueError):
            ProfessionalSearchFilters(specializations=["invalid_specialization"])


if __name__ == "__main__":
    pytest.main([__file__])
