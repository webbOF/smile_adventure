"""
Test Authentication Services - Simple validation test
Tests core authentication functionality
"""

import os
import sys
import tempfile
from datetime import datetime, timezone

# Add the parent directory to sys.path to enable imports
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, 'backend')
sys.path.insert(0, backend_dir)

def test_auth_services():
    """Simple test for authentication services"""
    
    print("🚀 Starting Simple Auth Services Test")
    print("=" * 50)
    
    try:
        # Test 1: Import Services
        print("📋 Test 1: Import Authentication Services")
        
        # Try importing the services module
        try:
            from app.auth.services import AuthService
            print("  ✅ AuthService imported successfully")
        except ImportError as e:
            print(f"  ❌ Failed to import AuthService: {e}")
            return False
        
        # Test 2: Import Models and Schemas
        print("\n📋 Test 2: Import Models and Schemas")
        
        try:
            from app.auth.models import User, UserRole, UserStatus
            from app.auth.schemas import UserRegister, UserLogin
            print("  ✅ Models and schemas imported successfully")
        except ImportError as e:
            print(f"  ❌ Failed to import models/schemas: {e}")
            return False
        
        # Test 3: Check Service Class Structure
        print("\n📋 Test 3: Check Service Class Structure")
        
        # Check if required methods exist
        required_methods = [
            'authenticate_user',
            'create_user', 
            'get_user_by_email',
            'get_user_by_id',
            'create_access_token',
            'verify_access_token',
            'change_password',
            'create_password_reset_token',
            'reset_password'
        ]
        
        for method in required_methods:
            if hasattr(AuthService, method):
                print(f"  ✅ Method '{method}' exists")
            else:
                print(f"  ❌ Method '{method}' missing")
                return False
        
        # Test 4: Validate Schema Creation
        print("\n📋 Test 4: Validate Schema Creation")
        
        try:
            # Test UserRegister schema
            user_reg = UserRegister(
                email="test@example.com",
                first_name="Test",
                last_name="User", 
                password="TestPassword123!",
                password_confirm="TestPassword123!",
                role="parent"
            )
            print("  ✅ UserRegister schema validation successful")
            
            # Test UserLogin schema
            user_login = UserLogin(
                email="test@example.com",
                password="TestPassword123!"
            )
            print("  ✅ UserLogin schema validation successful")
            
        except Exception as e:
            print(f"  ❌ Schema validation failed: {e}")
            return False
        
        # Test 5: Check JWT Utilities
        print("\n📋 Test 5: Check JWT Utilities")
        
        try:
            from app.auth.utils import verify_password, get_password_hash, create_access_token
            
            # Test password hashing
            password = "TestPassword123!"
            hashed = get_password_hash(password)
            print("  ✅ Password hashing works")
            
            # Test password verification
            is_valid = verify_password(password, hashed)
            assert is_valid == True
            print("  ✅ Password verification works")
            
            # Test token creation
            token_data = {"sub": "1", "user_id": 1, "email": "test@example.com"}
            token = create_access_token(token_data)
            assert isinstance(token, str)
            print("  ✅ JWT token creation works")
            
        except Exception as e:
            print(f"  ❌ JWT utilities test failed: {e}")
            return False
        
        print("\n" + "=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        print("✅ All 5 Auth Service validation tests PASSED!")
        print("🎉 Authentication Services structure is correct!")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_auth_services()
    if not success:
        sys.exit(1)
