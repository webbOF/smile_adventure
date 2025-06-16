"""
AUTH-API-001: Backend Authentication Endpoints Test

Test completi degli endpoint API di autenticazione del backend FastAPI.
Verifica registrazione, login, refresh token, RBAC e sicurezza.
"""

import pytest
import json
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.database import get_db, Base
from app.core.security import create_access_token
from app.users.models import User

# Database di test in memoria
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override del database per i test
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Client di test
client = TestClient(app)

class TestAuthenticationAPI:
    """Suite test per Authentication API endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup_database(self):
        """Setup del database per ogni test"""
        Base.metadata.create_all(bind=engine)
        yield
        Base.metadata.drop_all(bind=engine)

    def test_register_parent_success(self):
        """Test registrazione parent con successo"""
        parent_data = {
            "email": "parent.test@example.com",
            "password": "Test123!",
            "first_name": "Mario",
            "last_name": "Rossi",
            "role": "parent"
        }
        
        response = client.post("/api/v1/auth/register", json=parent_data)
        
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "parent.test@example.com"
        assert data["user"]["role"] == "parent"
        assert data["user"]["is_active"] is True

    def test_register_professional_success(self):
        """Test registrazione professional con successo"""
        professional_data = {
            "email": "dr.smith@clinic.com",
            "password": "SecureProf123!",
            "first_name": "Dr. John",
            "last_name": "Smith",
            "role": "professional",
            "license_number": "ALBO123456",
            "specialization": "Neuropsichiatria Infantile",
            "phone": "+39 123 456 7890"
        }
        
        response = client.post("/api/v1/auth/register", json=professional_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["user"]["role"] == "professional"
        assert data["user"]["license_number"] == "ALBO123456"

    def test_register_duplicate_email(self):
        """Test errore registrazione con email esistente"""
        user_data = {
            "email": "duplicate@example.com",
            "password": "Test123!",
            "first_name": "Test",
            "last_name": "User",
            "role": "parent"
        }
        
        # Prima registrazione
        response1 = client.post("/api/v1/auth/register", json=user_data)
        assert response1.status_code == 201
        
        # Seconda registrazione con stessa email
        response2 = client.post("/api/v1/auth/register", json=user_data)
        assert response2.status_code == 400
        assert "già registrata" in response2.json()["detail"]

    def test_register_invalid_email(self):
        """Test validazione formato email"""
        invalid_data = {
            "email": "email-non-valida",
            "password": "Test123!",
            "first_name": "Test",
            "last_name": "User",
            "role": "parent"
        }
        
        response = client.post("/api/v1/auth/register", json=invalid_data)
        assert response.status_code == 422

    def test_register_weak_password(self):
        """Test validazione password debole"""
        weak_password_data = {
            "email": "test@example.com",
            "password": "123",
            "first_name": "Test",
            "last_name": "User",
            "role": "parent"
        }
        
        response = client.post("/api/v1/auth/register", json=weak_password_data)
        assert response.status_code == 422

    def test_login_parent_success(self):
        """Test login parent con successo"""
        # Prima registra un parent
        register_data = {
            "email": "parent.login@example.com",
            "password": "Test123!",
            "first_name": "Mario",
            "last_name": "Rossi",
            "role": "parent"
        }
        client.post("/api/v1/auth/register", json=register_data)
        
        # Poi effettua login
        login_data = {
            "username": "parent.login@example.com",
            "password": "Test123!"
        }
        
        response = client.post("/api/v1/auth/login", data=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_professional_success(self):
        """Test login professional con successo"""
        register_data = {
            "email": "dr.login@clinic.com",
            "password": "SecureProf123!",
            "first_name": "Dr. Jane",
            "last_name": "Doe",
            "role": "professional",
            "license_number": "ALBO789123",
            "specialization": "Psicologia",
            "phone": "+39 987 654 3210"
        }
        client.post("/api/v1/auth/register", json=register_data)
        
        login_data = {
            "username": "dr.login@clinic.com",
            "password": "SecureProf123!"
        }
        
        response = client.post("/api/v1/auth/login", data=login_data)
        assert response.status_code == 200

    def test_login_invalid_credentials(self):
        """Test login con credenziali non valide"""
        login_data = {
            "username": "nonexistent@example.com",
            "password": "WrongPassword"
        }
        
        response = client.post("/api/v1/auth/login", data=login_data)
        assert response.status_code == 401
        assert "Credenziali non valide" in response.json()["detail"]

    def test_get_current_user(self):
        """Test recupero utente corrente con token valido"""
        # Registra e login
        register_data = {
            "email": "current.user@example.com",
            "password": "Test123!",
            "first_name": "Current",
            "last_name": "User",
            "role": "parent"
        }
        client.post("/api/v1/auth/register", json=register_data)
        
        login_response = client.post("/api/v1/auth/login", data={
            "username": "current.user@example.com",
            "password": "Test123!"
        })
        token = login_response.json()["access_token"]
        
        # Test endpoint protetto
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/v1/auth/me", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "current.user@example.com"
        assert data["role"] == "parent"

    def test_protected_endpoint_without_token(self):
        """Test accesso endpoint protetto senza token"""
        response = client.get("/api/v1/auth/me")
        assert response.status_code == 401

    def test_protected_endpoint_invalid_token(self):
        """Test accesso endpoint protetto con token non valido"""
        headers = {"Authorization": "Bearer invalid-token"}
        response = client.get("/api/v1/auth/me", headers=headers)
        assert response.status_code == 401

    def test_refresh_token_success(self):
        """Test refresh token con successo"""
        # Registra e login
        register_data = {
            "email": "refresh.test@example.com",
            "password": "Test123!",
            "first_name": "Refresh",
            "last_name": "Test",
            "role": "parent"
        }
        client.post("/api/v1/auth/register", json=register_data)
        
        login_response = client.post("/api/v1/auth/login", data={
            "username": "refresh.test@example.com",
            "password": "Test123!"
        })
        token = login_response.json()["access_token"]
        
        # Test refresh
        headers = {"Authorization": f"Bearer {token}"}
        response = client.post("/api/v1/auth/refresh", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_parent_only_endpoint_access(self):
        """Test accesso endpoint riservato ai parent"""
        # Registra parent
        register_data = {
            "email": "parent.rbac@example.com",
            "password": "Test123!",
            "first_name": "Parent",
            "last_name": "RBAC",
            "role": "parent"
        }
        client.post("/api/v1/auth/register", json=register_data)
        
        login_response = client.post("/api/v1/auth/login", data={
            "username": "parent.rbac@example.com",
            "password": "Test123!"
        })
        token = login_response.json()["access_token"]
        
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/v1/auth/parent-only", headers=headers)
        
        assert response.status_code == 200

    def test_professional_only_endpoint_access(self):
        """Test accesso endpoint riservato ai professional"""
        register_data = {
            "email": "prof.rbac@clinic.com",
            "password": "SecureProf123!",
            "first_name": "Prof",
            "last_name": "RBAC",
            "role": "professional",
            "license_number": "RBAC123456",
            "specialization": "Test",
            "phone": "+39 123 456 7890"
        }
        client.post("/api/v1/auth/register", json=register_data)
        
        login_response = client.post("/api/v1/auth/login", data={
            "username": "prof.rbac@clinic.com",
            "password": "SecureProf123!"
        })
        token = login_response.json()["access_token"]
        
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/v1/auth/professional-only", headers=headers)
        
        assert response.status_code == 200

    def test_cross_role_access_denied(self):
        """Test negazione accesso cross-role"""
        # Parent tenta accesso endpoint professional
        register_data = {
            "email": "parent.cross@example.com",
            "password": "Test123!",
            "first_name": "Parent",
            "last_name": "Cross",
            "role": "parent"
        }
        client.post("/api/v1/auth/register", json=register_data)
        
        login_response = client.post("/api/v1/auth/login", data={
            "username": "parent.cross@example.com",
            "password": "Test123!"
        })
        token = login_response.json()["access_token"]
        
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/v1/auth/professional-only", headers=headers)
        
        assert response.status_code == 403

    def test_password_reset_request(self):
        """Test richiesta reset password"""
        # Prima registra un utente
        register_data = {
            "email": "reset.test@example.com",
            "password": "Test123!",
            "first_name": "Reset",
            "last_name": "Test",
            "role": "parent"
        }
        client.post("/api/v1/auth/register", json=register_data)
        
        # Richiedi reset
        reset_data = {"email": "reset.test@example.com"}
        response = client.post("/api/v1/auth/forgot-password", json=reset_data)
        
        assert response.status_code == 200
        assert "inviata" in response.json()["message"]

    def test_password_reset_invalid_email(self):
        """Test reset password con email non esistente"""
        reset_data = {"email": "nonexistent@example.com"}
        response = client.post("/api/v1/auth/forgot-password", json=reset_data)
        
        assert response.status_code == 404

    def test_logout_success(self):
        """Test logout con successo"""
        # Login
        register_data = {
            "email": "logout.test@example.com",
            "password": "Test123!",
            "first_name": "Logout",
            "last_name": "Test",
            "role": "parent"
        }
        client.post("/api/v1/auth/register", json=register_data)
        
        login_response = client.post("/api/v1/auth/login", data={
            "username": "logout.test@example.com",
            "password": "Test123!"
        })
        token = login_response.json()["access_token"]
        
        # Logout
        headers = {"Authorization": f"Bearer {token}"}
        response = client.post("/api/v1/auth/logout", headers=headers)
        
        assert response.status_code == 200

    def test_rate_limiting_login_attempts(self):
        """Test rate limiting sui tentativi di login"""
        # Registra utente
        register_data = {
            "email": "rate.limit@example.com",
            "password": "Test123!",
            "first_name": "Rate",
            "last_name": "Limit",
            "role": "parent"
        }
        client.post("/api/v1/auth/register", json=register_data)
        
        # Multipli tentativi di login falliti
        for _ in range(6):  # Supera il limite di 5
            response = client.post("/api/v1/auth/login", data={
                "username": "rate.limit@example.com",
                "password": "WrongPassword"
            })
        
        # Il 6° tentativo dovrebbe essere bloccato
        assert response.status_code == 429

    def test_account_activation_required(self):
        """Test che l'attivazione account sia richiesta"""
        # Questo test verificherebbe che un account non attivato non possa fare login
        # (se implementato nel sistema)
        pass

    def test_concurrent_sessions_limit(self):
        """Test limite sessioni concorrenti"""
        # Test per verificare il limite di sessioni simultanee per utente
        # (se implementato nel sistema)
        pass


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
