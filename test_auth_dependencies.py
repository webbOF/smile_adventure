"""
Test Auth Dependencies - Validation test for authentication dependencies
Simple test to verify all dependencies can be imported and have correct structure
"""

import sys
import os

# Add backend to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

def test_auth_dependencies():
    """Test authentication dependencies import and structure"""
    
    print("🚀 Starting Auth Dependencies Test")
    print("=" * 50)
    
    try:
        # Test 1: Import dependencies
        print("📋 Test 1: Import Authentication Dependencies")
        
        from app.auth.dependencies import (
            get_current_user,
            get_current_active_user,
            get_current_verified_user,
            require_role,
            require_parent,
            require_professional,
            require_admin,
            require_professional_or_admin,
            require_any_role,
            get_current_user_optional,
            PermissionChecker,
            require_user_access,
            rate_limiter,
            check_login_rate_limit
        )
        
        print("  ✅ All dependencies imported successfully")
        
        # Test 2: Check security scheme
        print("📋 Test 2: Check Security Scheme")
        
        from app.auth.dependencies import security
        from fastapi.security import HTTPBearer
        
        assert isinstance(security, HTTPBearer), "Security scheme should be HTTPBearer"
        print("  ✅ HTTPBearer security scheme configured")
        
        # Test 3: Check role requirements
        print("📋 Test 3: Check Role Requirements")
        
        from app.auth.models import UserRole
        
        # Verify role dependencies are callable
        assert callable(require_parent), "require_parent should be callable"
        assert callable(require_professional), "require_professional should be callable" 
        assert callable(require_admin), "require_admin should be callable"
        assert callable(require_professional_or_admin), "require_professional_or_admin should be callable"
        assert callable(require_any_role), "require_any_role should be callable"
        
        print("  ✅ All role dependencies are callable")
        
        # Test 4: Check permission checker methods
        print("📋 Test 4: Check Permission Checker")
        
        assert hasattr(PermissionChecker, 'can_manage_user'), "PermissionChecker should have can_manage_user"
        assert hasattr(PermissionChecker, 'can_view_user_data'), "PermissionChecker should have can_view_user_data"
        assert hasattr(PermissionChecker, 'can_create_report'), "PermissionChecker should have can_create_report"
        
        print("  ✅ PermissionChecker has all required methods")
        
        # Test 5: Check rate limiter
        print("📋 Test 5: Check Rate Limiter")
        
        from app.auth.dependencies import RateLimitChecker
        
        assert hasattr(rate_limiter, 'check_rate_limit'), "Rate limiter should have check_rate_limit method"
        
        # Test rate limiter functionality
        test_result = rate_limiter.check_rate_limit("test_ip", max_attempts=3, window_minutes=1)
        assert test_result == True, "Rate limiter should allow first attempt"
        
        print("  ✅ Rate limiter works correctly")
        
        print("=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        print("✅ All 5 Auth Dependencies validation tests PASSED!")
        print("🎉 Authentication Dependencies structure is correct!")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_auth_dependencies()
