"""
Test script for Auth Models and Schemas
Verifies that the new authentication models and schemas work correctly
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.auth.models import User, UserRole, UserStatus, UserSession, PasswordResetToken
from app.auth.schemas import UserRegister, UserLogin, Token, UserResponse, LoginResponse
from pydantic import ValidationError
import json

def test_auth_models():
    """Test Auth Models functionality"""
    print("🧪 Testing Auth Models...")
    
    # Test User model creation
    print("  Testing User model creation...")
    try:
        # This would normally be done through SQLAlchemy session, 
        # but we're just testing model instantiation
        user = User(
            email="test@example.com",
            first_name="John",
            last_name="Doe",
            role=UserRole.PARENT
        )
        user.set_password("TestPassword123!")
        
        assert user.email == "test@example.com"
        assert user.full_name == "John Doe"
        assert user.role == UserRole.PARENT
        assert user.verify_password("TestPassword123!")
        assert not user.verify_password("WrongPassword")
        print("  ✅ User model creation successful")
        
    except Exception as e:
        print(f"  ❌ User model creation failed: {e}")
        return False
    
    # Test password validation
    print("  Testing password validation...")
    try:
        user_weak = User(email="test2@example.com", first_name="Jane", last_name="Doe")
        try:
            user_weak.set_password("weak")  # Should fail
            print("  ❌ Weak password validation failed")
            return False
        except ValueError:
            print("  ✅ Weak password correctly rejected")
    except Exception as e:
        print(f"  ❌ Password validation test failed: {e}")
        return False
    
    return True

def test_auth_schemas():
    """Test Auth Schemas validation"""
    print("🧪 Testing Auth Schemas...")
    
    # Test UserRegister schema
    print("  Testing UserRegister schema...")
    try:
        # Valid registration data
        valid_data = {
            "email": "newuser@example.com",
            "first_name": "Alice",
            "last_name": "Smith",
            "phone": "1234567890",
            "password": "ValidPassword123!",
            "password_confirm": "ValidPassword123!",
            "role": "parent"
        }
        
        user_register = UserRegister(**valid_data)
        assert user_register.email == "newuser@example.com"
        assert user_register.first_name == "Alice"
        assert user_register.role.value == "parent"
        print("  ✅ UserRegister schema validation successful")
        
    except Exception as e:
        print(f"  ❌ UserRegister schema validation failed: {e}")
        return False
    
    # Test invalid password
    print("  Testing invalid password validation...")
    try:
        invalid_data = {
            "email": "test@example.com",
            "first_name": "Bob",
            "last_name": "Jones",
            "password": "weak",  # Too weak
            "password_confirm": "weak",
            "role": "parent"
        }
        
        try:
            UserRegister(**invalid_data)
            print("  ❌ Weak password validation should have failed")
            return False
        except ValidationError as e:
            print("  ✅ Weak password correctly rejected")
            
    except Exception as e:
        print(f"  ❌ Password validation test failed: {e}")
        return False
    
    # Test password mismatch
    print("  Testing password mismatch validation...")
    try:
        mismatch_data = {
            "email": "test@example.com",
            "first_name": "Charlie",
            "last_name": "Brown",
            "password": "ValidPassword123!",
            "password_confirm": "DifferentPassword123!",
            "role": "parent"
        }
        
        try:
            UserRegister(**mismatch_data)
            print("  ❌ Password mismatch validation should have failed")
            return False
        except ValidationError as e:
            print("  ✅ Password mismatch correctly rejected")
            
    except Exception as e:
        print(f"  ❌ Password mismatch test failed: {e}")
        return False
    
    # Test UserLogin schema
    print("  Testing UserLogin schema...")
    try:
        login_data = {
            "email": "user@example.com",
            "password": "password123",
            "remember_me": True
        }
        
        user_login = UserLogin(**login_data)
        assert user_login.email == "user@example.com"
        assert user_login.remember_me == True
        print("  ✅ UserLogin schema validation successful")
        
    except Exception as e:
        print(f"  ❌ UserLogin schema validation failed: {e}")
        return False
    
    # Test Token schema
    print("  Testing Token schema...")
    try:
        token_data = {
            "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test",
            "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh",
            "expires_in": 1800
        }
        
        token = Token(**token_data)
        assert token.token_type == "bearer"
        assert token.expires_in == 1800
        print("  ✅ Token schema validation successful")
        
    except Exception as e:
        print(f"  ❌ Token schema validation failed: {e}")
        return False
    
    return True

def test_professional_validation():
    """Test professional-specific validation"""
    print("🧪 Testing Professional User Validation...")
    
    # Test professional user with license number
    try:
        professional_data = {
            "email": "dr.smith@clinic.com",
            "first_name": "Dr. John",
            "last_name": "Smith",
            "password": "DoctorPassword123!",
            "password_confirm": "DoctorPassword123!",
            "role": "professional",
            "license_number": "MD123456",
            "specialization": "Pediatric Dentistry"
        }
        
        professional = UserRegister(**professional_data)
        assert professional.role.value == "professional"
        assert professional.license_number == "MD123456"
        print("  ✅ Professional user validation successful")
        
    except Exception as e:
        print(f"  ❌ Professional user validation failed: {e}")
        return False
    
    # Test professional without license (should fail)
    try:
        invalid_professional_data = {
            "email": "dr.invalid@clinic.com",
            "first_name": "Dr. Invalid",
            "last_name": "User",
            "password": "DoctorPassword123!",
            "password_confirm": "DoctorPassword123!",
            "role": "professional"
            # Missing license_number
        }
        
        try:
            UserRegister(**invalid_professional_data)
            print("  ❌ Professional without license should have failed")
            return False
        except ValidationError:
            print("  ✅ Professional without license correctly rejected")
            
    except Exception as e:
        print(f"  ❌ Professional license validation test failed: {e}")
        return False
    
    return True

def main():
    """Run all tests"""
    print("🚀 Starting Auth Models & Schemas Test Suite")
    print("=" * 60)
    
    tests = [
        ("Auth Models", test_auth_models),
        ("Auth Schemas", test_auth_schemas),
        ("Professional Validation", test_professional_validation)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n📋 Running {test_name} tests...")
        try:
            if test_func():
                print(f"✅ {test_name}: PASSED")
                passed += 1
            else:
                print(f"❌ {test_name}: FAILED")
        except Exception as e:
            print(f"❌ {test_name}: ERROR - {e}")
    
    print("\n" + "=" * 60)
    print(f"📊 TEST SUMMARY")
    print("=" * 60)
    print(f"Passed: {passed}/{total} tests")
    
    if passed == total:
        print("🎉 ALL TESTS PASSED! Auth Models & Schemas are working correctly!")
        return True
    else:
        print("❌ Some tests failed. Please check the implementation.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
