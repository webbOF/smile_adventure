"""
Test Authentication Services - Comprehensive testing for auth services
Tests all authentication functionality including user CRUD, JWT, sessions
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timedelta, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from pydantic import ValidationError

# Import auth components
from backend.app.auth.services import AuthService, get_auth_service
from backend.app.auth.models import User, UserRole, UserStatus, Base
from backend.app.auth.schemas import UserRegister, UserLogin, PasswordChange, PasswordResetConfirm
from backend.app.core.config import Settings

def test_auth_services():
    """Comprehensive test suite for authentication services"""
    
    print("🚀 Starting Auth Services Test Suite")
    print("=" * 60)
    
    # Setup test database
    engine = create_engine("sqlite:///./test_auth_services.db", echo=False)
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    try:
        # Test 1: Service Initialization
        print("📋 Test 1: Service Initialization")
        db = SessionLocal()
        auth_service = get_auth_service(db)
        assert isinstance(auth_service, AuthService)
        print("  ✅ AuthService initialized successfully")
        
        # Test 2: User Creation
        print("\n📋 Test 2: User Creation")
        user_data = UserRegister(
            email="test@example.com",
            first_name="Test",
            last_name="User",
            password="TestPassword123!",
            password_confirm="TestPassword123!",
            role="parent",
            phone="1234567890"
        )
        
        user = auth_service.create_user(user_data)
        assert user.email == "test@example.com"
        assert user.first_name == "Test"
        assert user.role == UserRole.PARENT
        assert user.status == UserStatus.PENDING
        assert not user.is_active  # Should be inactive until verified
        print(f"  ✅ User created: {user.email}")
        
        # Test 3: Professional User Creation
        print("\n📋 Test 3: Professional User Creation")
        prof_data = UserRegister(
            email="dr.smith@clinic.com",
            first_name="Dr.",
            last_name="Smith",
            password="DoctorPassword123!",
            password_confirm="DoctorPassword123!",
            role="professional",
            license_number="MD123456",
            specialization="Pediatrics",
            clinic_name="Kids Clinic"
        )
        
        prof_user = auth_service.create_user(prof_data)
        assert prof_user.role == UserRole.PROFESSIONAL
        assert prof_user.license_number == "MD123456"
        print(f"  ✅ Professional user created: {prof_user.email}")
        
        # Test 4: Get User by Email
        print("\n📋 Test 4: Get User by Email")
        found_user = auth_service.get_user_by_email("test@example.com")
        assert found_user is not None
        assert found_user.email == "test@example.com"
        print(f"  ✅ User found by email: {found_user.email}")
        
        # Test 5: Get User by ID
        print("\n📋 Test 5: Get User by ID")
        found_by_id = auth_service.get_user_by_id(user.id)
        assert found_by_id is not None
        assert found_by_id.id == user.id
        print(f"  ✅ User found by ID: {found_by_id.id}")
          # Test 6: Authentication (Should fail - user not verified)
        print("\n📋 Test 6: Authentication (Unverified User)")
        auth_result = auth_service.authenticate_user("test@example.com", "TestPassword123!")
        assert auth_result is None  # Should fail because user is not active
        print("  ✅ Authentication correctly failed for unverified user")
        
        # Test 7: Email Verification
        print("\n📋 Test 7: Email Verification")
        verify_result = auth_service.verify_email(user.id)
        assert verify_result is True
        
        # Refresh user from database
        verified_user = auth_service.get_user_by_id(user.id)
        assert verified_user.is_verified is True
        assert verified_user.is_active is True
        assert verified_user.status == UserStatus.ACTIVE
        print("  ✅ Email verification successful")
        
        # Test 8: Successful Authentication
        print("\n📋 Test 8: Successful Authentication")
        auth_user = auth_service.authenticate_user("test@example.com", "TestPassword123!")
        assert auth_user is not None
        assert auth_user.email == "test@example.com"
        print(f"  ✅ User authenticated successfully: {auth_user.email}")
        
        # Test 9: Failed Authentication (Wrong Password)
        print("\n📋 Test 9: Failed Authentication (Wrong Password)")
        auth_fail = auth_service.authenticate_user("test@example.com", "WrongPassword")
        assert auth_fail is None
        print("  ✅ Authentication correctly failed with wrong password")
        
        # Test 10: JWT Token Creation
        print("\n📋 Test 10: JWT Token Creation")
        access_token = auth_service.create_access_token(auth_user)
        assert access_token is not None
        assert isinstance(access_token, str)
        print("  ✅ Access token created successfully")
        
        # Test 11: JWT Token Verification
        print("\n📋 Test 11: JWT Token Verification")
        token_data = auth_service.verify_access_token(access_token)
        assert token_data is not None
        assert token_data.user_id == auth_user.id
        assert token_data.email == auth_user.email
        print("  ✅ Access token verified successfully")
        
        # Test 12: Refresh Token
        print("\n📋 Test 12: Refresh Token")
        refresh_token = auth_service.create_refresh_token(auth_user)
        assert refresh_token is not None
        new_access_token = auth_service.refresh_access_token(refresh_token)
        assert new_access_token is not None
        print("  ✅ Refresh token created and used successfully")
        
        # Test 13: Password Change
        print("\n📋 Test 13: Password Change")
        password_change = PasswordChange(
            current_password="TestPassword123!",
            new_password="NewTestPassword456!",
            new_password_confirm="NewTestPassword456!"
        )
        
        change_result = auth_service.change_password(auth_user.id, password_change)
        assert change_result is True
        
        # Test authentication with new password
        auth_new_pwd = auth_service.authenticate_user("test@example.com", "NewTestPassword456!")
        assert auth_new_pwd is not None
        print("  ✅ Password changed successfully")
        
        # Test 14: Password Reset Token
        print("\n📋 Test 14: Password Reset Token")
        reset_token = auth_service.create_password_reset_token("test@example.com")
        assert reset_token is not None
        assert isinstance(reset_token, str)
        print("  ✅ Password reset token created")
        
        # Test 15: Password Reset
        print("\n📋 Test 15: Password Reset")
        reset_data = PasswordResetConfirm(
            token=reset_token,
            new_password="ResetPassword789!",
            new_password_confirm="ResetPassword789!"
        )
        
        reset_result = auth_service.reset_password(reset_data)
        assert reset_result is True
        
        # Test authentication with reset password
        auth_reset_pwd = auth_service.authenticate_user("test@example.com", "ResetPassword789!")
        assert auth_reset_pwd is not None
        print("  ✅ Password reset successfully")
        
        # Test 16: User Update
        print("\n📋 Test 16: User Update")
        update_data = {
            "first_name": "Updated",
            "last_name": "Name",
            "phone": "9876543210"
        }
        
        updated_user = auth_service.update_user(auth_user.id, update_data)
        assert updated_user is not None
        assert updated_user.first_name == "Updated"
        assert updated_user.phone == "9876543210"
        print("  ✅ User updated successfully")
        
        # Test 17: User Session Management
        print("\n📋 Test 17: User Session Management")
        session_data = {
            "ip_address": "127.0.0.1",
            "user_agent": "Test Agent"
        }
        
        session = auth_service.create_user_session(auth_user, session_data)
        assert session is not None
        assert session.user_id == auth_user.id
        print("  ✅ User session created successfully")
        
        # Test 18: Session Invalidation
        print("\n📋 Test 18: Session Invalidation")
        invalidate_result = auth_service.invalidate_user_sessions(auth_user.id)
        assert invalidate_result is True
        print("  ✅ User sessions invalidated successfully")
        
        # Test 19: User Statistics
        print("\n📋 Test 19: User Statistics")
        stats = auth_service.get_user_stats()
        assert isinstance(stats, dict)
        assert "total_users" in stats
        assert stats["total_users"] >= 2  # We created 2 users
        print(f"  ✅ User statistics retrieved: {stats}")
        
        # Test 20: Users List
        print("\n📋 Test 20: Users List")
        users_list = auth_service.get_users_list(limit=10)
        assert isinstance(users_list, list)
        assert len(users_list) >= 2
        print(f"  ✅ Users list retrieved: {len(users_list)} users")
        
        # Test 21: Account Deactivation
        print("\n📋 Test 21: Account Deactivation")
        deactivate_result = auth_service.deactivate_user(prof_user.id)
        assert deactivate_result is True
        
        deactivated_user = auth_service.get_user_by_id(prof_user.id)
        assert not deactivated_user.is_active
        assert deactivated_user.status == UserStatus.INACTIVE
        print("  ✅ User account deactivated successfully")
        
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print("✅ All 21 Auth Service tests PASSED!")
        print("🎉 Authentication Services are working correctly!")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
        
    finally:
        db.close()
        # Clean up test database
        if os.path.exists("./test_auth_services.db"):
            os.remove("./test_auth_services.db")

if __name__ == "__main__":
    success = test_auth_services()
    if not success:
        sys.exit(1)
