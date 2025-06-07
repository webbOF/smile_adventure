#!/usr/bin/env python3
"""
Test script to verify the enhanced configuration setup
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def test_config_import():
    """Test configuration module import and basic functionality"""
    try:
        from app.core.config import settings
        print("✅ Configuration module imported successfully")
        
        # Test basic settings
        print(f"   - App Name: {settings.APP_NAME}")
        print(f"   - Environment: {settings.ENVIRONMENT}")
        print(f"   - Debug Mode: {settings.DEBUG}")
        print(f"   - Database Pool Size: {settings.DATABASE_POOL_SIZE}")
        
        # Test computed properties
        print(f"   - Is Development: {settings.is_development}")
        print(f"   - Database Config Keys: {list(settings.database_config.keys())}")
        
        return True
    except Exception as e:
        print(f"❌ Configuration import failed: {e}")
        return False

def test_database_import():
    """Test database module import"""
    try:
        from app.core.database import engine, SessionLocal, Base, db_manager
        print("✅ Database module imported successfully")
        
        # Test database manager
        pool_status = db_manager.get_pool_status()
        print(f"   - Pool Status: {pool_status}")
        
        return True
    except Exception as e:
        print(f"❌ Database import failed: {e}")
        return False

def test_security_import():
    """Test security module import"""
    try:
        from app.core.security import jwt_manager, password_manager
        print("✅ Security module imported successfully")
          # Test password hashing
        test_password = "TestPassword123!"
        hashed = password_manager.get_password_hash(test_password)
        verified = password_manager.verify_password(test_password, hashed)
        print(f"   - Password hashing works: {verified}")
        
        # Test JWT token creation
        test_data = {"sub": "test@example.com", "user_id": 1}
        token = jwt_manager.create_access_token(test_data)
        print(f"   - JWT token created: {len(token)} characters")
        
        # Test token verification
        payload = jwt_manager.verify_token(token, "access")
        print(f"   - JWT token verified: {payload is not None}")
        
        return True
    except Exception as e:
        print(f"❌ Security import failed: {e}")
        return False

def test_auth_routes_import():
    """Test auth routes import"""
    try:
        from app.auth.routes import router
        print("✅ Auth routes imported successfully")
        return True
    except Exception as e:
        print(f"❌ Auth routes import failed: {e}")
        return False

def main():
    """Run all configuration tests"""
    print("=== Smile Adventure Configuration Test ===")
    print()
    
    tests = [
        ("Configuration", test_config_import),
        ("Database", test_database_import),
        ("Security", test_security_import),
        ("Auth Routes", test_auth_routes_import),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"Testing {test_name}...")
        result = test_func()
        results.append(result)
        print()
    
    # Summary
    passed = sum(results)
    total = len(results)
    
    print("=== Test Summary ===")
    print(f"Passed: {passed}/{total}")
    
    if passed == total:
        print("🎉 All configuration tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed. Check the output above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
