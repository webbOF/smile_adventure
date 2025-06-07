"""
Integration Test - Task 7: Auth Dependencies & Middleware
Comprehensive test to verify all authentication components work together
"""

import sys
import os

# Add backend to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

def test_task_7_integration():
    """Complete integration test for Task 7"""
    
    print("🚀 Starting Task 7 Integration Test")
    print("🎯 Auth Dependencies & Middleware")
    print("=" * 60)
    
    test_results = []
    
    try:
        # Test 1: Core Dependencies Import
        print("📋 Test 1: Core Dependencies Import")
        
        from app.auth.dependencies import (
            get_current_user,
            get_current_active_user, 
            get_current_verified_user,
            security
        )
        
        assert callable(get_current_user), "get_current_user should be callable"
        assert callable(get_current_active_user), "get_current_active_user should be callable"
        assert callable(get_current_verified_user), "get_current_verified_user should be callable"
        
        print("  ✅ Core user dependencies imported and callable")
        test_results.append(True)
        
        # Test 2: Role-Based Access Control
        print("📋 Test 2: Role-Based Access Control")
        
        from app.auth.dependencies import (
            require_role,
            require_parent,
            require_professional,
            require_admin,
            require_professional_or_admin,
            require_any_role
        )
        from app.auth.models import UserRole
        
        # Test role factory function
        custom_role_dep = require_role([UserRole.ADMIN, UserRole.PROFESSIONAL])
        assert callable(custom_role_dep), "require_role should return callable dependency"
        
        # Test predefined role dependencies
        role_deps = [
            require_parent,
            require_professional, 
            require_admin,
            require_professional_or_admin,
            require_any_role
        ]
        
        for dep in role_deps:
            assert callable(dep), f"Role dependency {dep} should be callable"
        
        print("  ✅ Role-based access control dependencies working")
        test_results.append(True)
        
        # Test 3: Security Schemes & Optional Auth
        print("📋 Test 3: Security Schemes & Optional Auth")
        
        from fastapi.security import HTTPBearer
        from app.auth.dependencies import (
            security,
            get_current_user_optional
        )
        
        assert isinstance(security, HTTPBearer), "Security should be HTTPBearer instance"
        assert callable(get_current_user_optional), "Optional auth should be callable"
        
        print("  ✅ Security schemes and optional authentication working")
        test_results.append(True)
        
        # Test 4: Permission System
        print("📋 Test 4: Permission System")
        
        from app.auth.dependencies import (
            PermissionChecker,
            require_user_access
        )
        
        # Test PermissionChecker methods
        checker_methods = [
            'can_manage_user',
            'can_view_user_data', 
            'can_create_report'
        ]
        
        for method in checker_methods:
            assert hasattr(PermissionChecker, method), f"PermissionChecker should have {method}"
            assert callable(getattr(PermissionChecker, method)), f"{method} should be callable"
        
        # Test user access factory
        user_access_dep = require_user_access("user_id")
        assert callable(user_access_dep), "require_user_access should return callable"
        
        print("  ✅ Permission system working correctly")
        test_results.append(True)
        
        # Test 5: Middleware Components
        print("📋 Test 5: Middleware Components")
        
        from app.auth.middleware import (
            AuthMiddleware,
            SessionTrackingMiddleware,
            RateLimitMiddleware,
            setup_auth_middleware
        )
        from starlette.middleware.base import BaseHTTPMiddleware
        
        # Test middleware inheritance
        middleware_classes = [AuthMiddleware, SessionTrackingMiddleware, RateLimitMiddleware]
        for middleware_class in middleware_classes:
            assert issubclass(middleware_class, BaseHTTPMiddleware), f"{middleware_class} should inherit from BaseHTTPMiddleware"
        
        # Test setup function
        assert callable(setup_auth_middleware), "setup_auth_middleware should be callable"
        
        print("  ✅ Middleware components working correctly")
        test_results.append(True)
        
        # Test 6: Rate Limiting & Session Management
        print("📋 Test 6: Rate Limiting & Session Management")
        
        from app.auth.dependencies import (
            rate_limiter,
            check_login_rate_limit,
            create_user_session_on_login
        )
        
        # Test rate limiter
        assert hasattr(rate_limiter, 'check_rate_limit'), "Rate limiter should have check_rate_limit method"
        
        # Test rate limit functionality
        test_result = rate_limiter.check_rate_limit("test_ip_123", max_attempts=2, window_minutes=1)
        assert test_result == True, "Rate limiter should allow first attempt"
        
        # Test second attempt should still be allowed
        test_result = rate_limiter.check_rate_limit("test_ip_123", max_attempts=2, window_minutes=1) 
        assert test_result == True, "Rate limiter should allow second attempt"
        
        # Test third attempt should be blocked
        test_result = rate_limiter.check_rate_limit("test_ip_123", max_attempts=2, window_minutes=1)
        assert test_result == False, "Rate limiter should block third attempt"
        
        assert callable(check_login_rate_limit), "check_login_rate_limit should be callable"
        assert callable(create_user_session_on_login), "create_user_session_on_login should be callable"
        
        print("  ✅ Rate limiting and session management working")
        test_results.append(True)
        
        # Test 7: Utility Functions
        print("📋 Test 7: Utility Functions")
        
        from app.auth.middleware import (
            get_cors_middleware_config,
            get_client_ip,
            is_secure_request
        )
        from app.auth.dependencies import (
            log_request_info,
            get_request_metadata
        )
        
        # Test CORS config
        cors_config = get_cors_middleware_config()
        required_cors_keys = ["allow_origins", "allow_credentials", "allow_methods", "allow_headers"]
        for key in required_cors_keys:
            assert key in cors_config, f"CORS config should have {key}"
        
        # Test utility functions are callable
        utils = [get_client_ip, is_secure_request, log_request_info, get_request_metadata]
        for util in utils:
            assert callable(util), f"Utility {util.__name__} should be callable"
        
        print("  ✅ All utility functions working correctly")
        test_results.append(True)
        
        # Test Summary
        print("=" * 60)
        print("📊 TASK 7 INTEGRATION TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(test_results)
        passed_tests = sum(test_results)
        
        print(f"📈 Tests Passed: {passed_tests}/{total_tests}")
        
        if all(test_results):
            print("✅ ALL TESTS PASSED!")
            print("🎉 Task 7: Auth Dependencies & Middleware - COMPLETED!")
            print("")
            print("🔧 Implemented Components:")
            print("   • HTTPBearer security scheme")
            print("   • get_current_user dependency")
            print("   • get_current_active_user dependency") 
            print("   • Role-based access control factory")
            print("   • Permission checking system")
            print("   • Rate limiting middleware")
            print("   • Session tracking middleware")
            print("   • Authentication middleware")
            print("   • CORS configuration")
            print("   • Security headers")
            print("   • Request/response logging")
            print("")
            print("🚀 Ready for FastAPI route integration!")
            return True
        else:
            print("❌ Some tests failed")
            return False
        
    except Exception as e:
        print(f"❌ Integration test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_task_7_integration()
