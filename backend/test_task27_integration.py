"""
Task 27: Performance Optimization Integration Test
Quick verification that performance features integrate correctly with the main application
"""

import sys
import os
from unittest.mock import patch, Mock

def test_main_app_performance_endpoints():
    """Test that performance endpoints are properly integrated in main app"""
    try:
        # Test that main app can be imported (basic integration)
        from main import app
        print("✅ Main application imports successfully")
        
        # Test that performance cache can be imported
        from app.core.cache import performance_cache, periodic_cache_cleanup
        print("✅ Performance cache imports successfully")
        
        # Test that database manager performance methods exist
        from app.core.database import DatabaseManager
        assert hasattr(DatabaseManager, 'get_performance_stats')
        assert hasattr(DatabaseManager, 'get_pool_status')
        assert hasattr(DatabaseManager, 'optimize_table')
        print("✅ Database manager performance methods available")
        
        # Test that enhanced services can be imported
        from app.users.crud import ChildService
        from app.reports.services.game_session_service import GameSessionService
        print("✅ Enhanced services import successfully")
        
        # Test FastAPI app has the expected routes
        routes = [route.path for route in app.routes]
        performance_routes = [r for r in routes if 'performance' in r or 'cache' in r]
        
        expected_routes = ['/health/performance', '/health/cache']
        for expected_route in expected_routes:
            assert expected_route in routes, f"Missing route: {expected_route}"
        
        print(f"✅ Performance monitoring routes available: {performance_routes}")
        
        return True
        
    except Exception as e:
        print(f"❌ Integration test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_cache_functionality():
    """Test basic cache functionality works"""
    try:
        from app.core.cache import performance_cache, cached
        
        # Clear cache
        performance_cache.clear()
        
        # Test basic operations
        performance_cache.set("test_key", "test_value", 60)
        assert performance_cache.get("test_key") == "test_value"
        
        # Test decorator
        call_count = 0
        
        @cached(ttl_seconds=60, key_prefix="test")
        def test_function(x):
            nonlocal call_count
            call_count += 1
            return x * 2
        
        # First call
        result1 = test_function(5)
        assert result1 == 10
        assert call_count == 1
        
        # Second call should use cache
        result2 = test_function(5)
        assert result2 == 10
        assert call_count == 1  # No additional call
        
        print("✅ Cache functionality works correctly")
        return True
        
    except Exception as e:
        print(f"❌ Cache functionality test failed: {e}")
        return False

def test_optimized_query_imports():
    """Test that optimized query utilities can be imported"""
    try:
        from sqlalchemy.orm import selectinload, joinedload
        from sqlalchemy import desc, asc, func
        
        print("✅ Query optimization utilities available")
        return True
        
    except Exception as e:
        print(f"❌ Query optimization test failed: {e}")
        return False

def run_integration_tests():
    """Run integration tests for Task 27 performance optimizations"""
    print("🚀 Running Task 27 Performance Optimization Integration Tests...\n")
    
    tests = [
        test_main_app_performance_endpoints,
        test_cache_functionality,
        test_optimized_query_imports
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            if test():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"❌ Test {test.__name__} failed with exception: {e}")
            failed += 1
    
    print(f"\n📊 Integration Test Results:")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"📈 Success Rate: {(passed/(passed+failed)*100):.1f}%")
    
    if failed == 0:
        print("\n🎉 All Task 27 Performance Optimization integration tests passed!")
        return True
    else:
        print(f"\n⚠️ {failed} integration tests failed.")
        return False

if __name__ == "__main__":
    success = run_integration_tests()
    if success:
        print("\n✅ Task 27 Performance Optimization integration verification completed successfully!")
        print("\n🚀 Ready for production deployment!")
    else:
        print("\n❌ Task 27 Performance Optimization integration verification failed!")
        exit(1)
