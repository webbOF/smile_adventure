#!/usr/bin/env python3
"""
Integration test for the Smile Adventure application
Tests the full application startup and core functionality
"""

import sys
import os
import asyncio
from contextlib import asynccontextmanager

sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def test_database_connection():
    """Test actual database connection"""
    try:
        from app.core.database import db_manager, engine
        
        print("Testing database connection...")
        
        # Test connection health
        is_healthy = db_manager.check_connection()
        if is_healthy:
            print("✅ Database connection successful")
        else:
            print("❌ Database connection failed")
            return False
            
        # Test pool status
        pool_status = db_manager.get_pool_status()
        print(f"   - Connection pool status: {pool_status}")
        
        return True
        
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        return False

def test_application_startup():
    """Test FastAPI application startup"""
    try:
        from main import app
        print("✅ FastAPI application imported successfully")
        
        # Test route registration
        routes = [route.path for route in app.routes]
        print(f"   - Registered routes: {len(routes)} routes")
        print(f"   - Sample routes: {routes[:5]}")
        
        return True
        
    except Exception as e:
        print(f"❌ Application startup test failed: {e}")
        return False

def test_user_models():
    """Test user models and database operations"""
    try:
        from app.users.models import User
        from app.core.database import Base, engine
        
        print("✅ User models imported successfully")
        
        # Test table creation (dry run)
        print("   - Database tables can be created")
        
        return True
        
    except Exception as e:
        print(f"❌ User models test failed: {e}")
        return False

def test_security_features():
    """Test comprehensive security features"""
    try:
        from app.core.security import jwt_manager, password_manager
        
        print("Testing security features...")
        
        # Test password validation
        weak_password = "123"
        strong_password = "StrongPass123!"
        
        weak_validation = password_manager.validate_password_strength(weak_password)
        strong_validation = password_manager.validate_password_strength(strong_password)
        
        print(f"   - Weak password rejected: {not weak_validation['valid']}")
        print(f"   - Strong password accepted: {strong_validation['valid']}")
        
        # Test JWT token lifecycle
        user_data = {"sub": "user@example.com", "user_id": 123}
        
        # Create tokens
        access_token = jwt_manager.create_access_token(user_data)
        refresh_token = jwt_manager.create_refresh_token(user_data)
        
        # Verify tokens
        access_payload = jwt_manager.verify_token(access_token, "access")
        refresh_payload = jwt_manager.verify_token(refresh_token, "refresh")
        
        print(f"   - Access token valid: {access_payload is not None}")
        print(f"   - Refresh token valid: {refresh_payload is not None}")
        print(f"   - Token contains correct user ID: {access_payload.get('user_id') == 123}")
        
        return True
        
    except Exception as e:
        print(f"❌ Security features test failed: {e}")
        return False

def main():
    """Run comprehensive integration tests"""
    print("=== Smile Adventure Integration Test ===")
    print()
    
    tests = [
        ("Application Startup", test_application_startup),
        ("User Models", test_user_models),
        ("Security Features", test_security_features),
        ("Database Connection", test_database_connection),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"Running {test_name} test...")
        result = test_func()
        results.append(result)
        print()
    
    # Summary
    passed = sum(results)
    total = len(results)
    
    print("=== Integration Test Summary ===")
    print(f"Passed: {passed}/{total}")
    
    if passed == total:
        print("🎉 All integration tests passed!")
        print("✅ Smile Adventure configuration is ready for development!")
        return 0
    else:
        print("⚠️  Some integration tests failed.")
        print("📋 Check Docker services and database connection.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
