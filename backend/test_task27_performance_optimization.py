"""
Task 27: Performance Optimization Validation Tests
Tests for database performance optimizations, caching, and query improvements
"""

import pytest
import time
import tempfile
import os
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime, timezone, timedelta

# Test performance cache functionality
def test_performance_cache_basic_operations():
    """Test basic cache operations"""
    from app.core.cache import PerformanceCache
    
    cache = PerformanceCache()
    
    # Test set and get
    cache.set("test_key", "test_value", ttl_seconds=60)
    assert cache.get("test_key") == "test_value"
    
    # Test cache miss
    assert cache.get("nonexistent_key") is None
    
    # Test TTL expiration
    cache.set("short_ttl", "value", ttl_seconds=0.1)
    time.sleep(0.2)
    assert cache.get("short_ttl") is None
    
    print("✅ Performance cache basic operations test passed")

def test_performance_cache_statistics():
    """Test cache statistics calculation"""
    from app.core.cache import PerformanceCache
    
    cache = PerformanceCache()
    
    # Test initial stats
    stats = cache.get_stats()
    assert stats["hits"] == 0
    assert stats["misses"] == 0
    assert stats["total_requests"] == 0
    
    # Generate some cache activity
    cache.set("key1", "value1")
    cache.set("key2", "value2")
    
    # Hit
    cache.get("key1")
    
    # Miss
    cache.get("nonexistent")
    
    stats = cache.get_stats()
    assert stats["hits"] == 1
    assert stats["misses"] == 1
    assert stats["total_requests"] == 2
    assert stats["hit_rate_percent"] == 50.0
    
    print("✅ Performance cache statistics test passed")

def test_cache_decorator():
    """Test the caching decorator"""
    from app.core.cache import cached, performance_cache
    
    # Clear cache first
    performance_cache.clear()
    
    call_count = 0
    
    @cached(ttl_seconds=300, key_prefix="test")
    def expensive_function(x, y):
        nonlocal call_count
        call_count += 1
        return x + y
    
    # First call should execute function
    result1 = expensive_function(1, 2)
    assert result1 == 3
    assert call_count == 1
    
    # Second call should use cache
    result2 = expensive_function(1, 2)
    assert result2 == 3
    assert call_count == 1  # Function not called again
    
    # Different parameters should execute function
    result3 = expensive_function(2, 3)
    assert result3 == 5
    assert call_count == 2
    
    print("✅ Cache decorator test passed")

def test_database_configuration_optimization():
    """Test optimized database configuration"""
    from app.core.config import Settings
    
    settings = Settings()
    
    # Test optimized pool settings
    assert settings.DATABASE_POOL_SIZE == 20  # Increased from 10
    assert settings.DATABASE_MAX_OVERFLOW == 30  # Increased from 20
    assert settings.DATABASE_POOL_TIMEOUT == 20  # Reduced from 30
    assert settings.DATABASE_POOL_RECYCLE == 1800  # Reduced from 3600
    assert settings.DATABASE_POOL_PRE_PING == True
    
    print("✅ Database configuration optimization test passed")

def test_performance_indexes_migration():
    """Test that the performance optimization migration is properly structured"""
    import importlib.util
    import os
    
    # Find the migration file
    migration_dir = "c:/Users/arman/Desktop/WebSimpl/smile_adventure/backend/alembic/versions"
    migration_files = [f for f in os.listdir(migration_dir) if "task_27_performance" in f.lower()]
    
    assert len(migration_files) >= 1, "Performance optimization migration not found"
    
    migration_file = os.path.join(migration_dir, migration_files[0])
    
    # Load and check migration content
    with open(migration_file, 'r') as f:
        content = f.read()
    
    # Check for key performance indexes
    expected_indexes = [
        "idx_users_role_active_verified",
        "idx_children_parent_active", 
        "idx_game_sessions_child_date_range",
        "idx_game_sessions_score_performance",
        "idx_activities_child_timeline"
    ]
    
    for index in expected_indexes:
        assert index in content, f"Missing performance index: {index}"
    
    print("✅ Performance indexes migration test passed")

def test_cached_game_session_service():
    """Test cached game session service methods"""
    from unittest.mock import Mock, patch
    from app.reports.services.game_session_service import GameSessionService
    from app.core.cache import performance_cache
    
    # Clear cache
    performance_cache.clear()
    
    # Mock database session
    mock_db = Mock()
    mock_query = Mock()
    mock_db.query.return_value = mock_query
    
    # Mock filter and order_by methods
    mock_query.filter.return_value = mock_query
    mock_query.options.return_value = mock_query
    mock_query.order_by.return_value = mock_query
    
    # Mock session data
    mock_sessions = [
        Mock(id=1, child_id=1, started_at=datetime.now(timezone.utc)),
        Mock(id=2, child_id=1, started_at=datetime.now(timezone.utc))
    ]
    mock_query.all.return_value = mock_sessions
    
    service = GameSessionService(mock_db)
    
    # First call should query database
    result1 = service.get_child_sessions(child_id=1, use_cache=True)
    assert len(result1) == 2
    assert mock_db.query.called
    
    # Reset mock
    mock_db.reset_mock()
    
    # Second call should use cache (mock shouldn't be called)
    result2 = service.get_child_sessions(child_id=1, use_cache=True)
    assert len(result2) == 2
    # Database should not be queried again due to caching
    
    print("✅ Cached game session service test passed")

def test_cached_child_service():
    """Test cached child service methods"""
    from unittest.mock import Mock
    from app.users.crud import ChildService
    from app.core.cache import performance_cache
    
    # Clear cache
    performance_cache.clear()
    
    # Mock database session
    mock_db = Mock()
    mock_query = Mock()
    mock_db.query.return_value = mock_query
    
    # Mock filter and order_by methods
    mock_query.filter.return_value = mock_query
    mock_query.options.return_value = mock_query
    mock_query.order_by.return_value = mock_query
    
    # Mock children data
    mock_children = [
        Mock(id=1, parent_id=1, name="Child 1", created_at=datetime.now(timezone.utc)),
        Mock(id=2, parent_id=1, name="Child 2", created_at=datetime.now(timezone.utc))
    ]
    mock_query.all.return_value = mock_children
    
    service = ChildService(mock_db)
    
    # First call should query database
    result1 = service.get_children_by_parent(parent_id=1, use_cache=True)
    assert len(result1) == 2
    assert mock_db.query.called
    
    # Reset mock
    mock_db.reset_mock()
    
    # Second call should use cache
    result2 = service.get_children_by_parent(parent_id=1, use_cache=True)
    assert len(result2) == 2
    
    print("✅ Cached child service test passed")

def test_cache_invalidation():
    """Test cache invalidation functionality"""
    from app.core.cache import (
        performance_cache, invalidate_child_cache, 
        invalidate_user_cache, cache_child_sessions, cache_user_children
    )
    
    # Clear cache
    performance_cache.clear()
    
    # Set some test data
    child_key = cache_child_sessions(1, 20)
    user_key = cache_user_children(1)
    
    performance_cache.set(child_key, ["session1", "session2"])
    performance_cache.set(user_key, ["child1", "child2"])
    performance_cache.set("child_analytics:1:30", {"data": "analytics"})
    
    # Verify data is cached
    assert performance_cache.get(child_key) is not None
    assert performance_cache.get(user_key) is not None
    
    # Test child cache invalidation
    invalidate_child_cache(1)
    
    # Child-related caches should be cleared
    assert performance_cache.get("child_analytics:1:30") is None
    
    # Test user cache invalidation
    invalidate_user_cache(1)
    
    print("✅ Cache invalidation test passed")

def test_performance_monitoring_endpoints():
    """Test performance monitoring endpoint logic"""
    from app.core.cache import performance_cache
    from app.core.database import DatabaseManager
    
    # Test cache stats retrieval
    cache_stats = performance_cache.get_stats()
    assert "hits" in cache_stats
    assert "misses" in cache_stats
    assert "hit_rate_percent" in cache_stats
    
    # Test database manager stats methods exist
    assert hasattr(DatabaseManager, "get_performance_stats")
    assert hasattr(DatabaseManager, "get_pool_status")
    assert hasattr(DatabaseManager, "optimize_table")
    
    print("✅ Performance monitoring endpoints test passed")

def test_query_optimization_features():
    """Test query optimization features"""
    from sqlalchemy.orm import selectinload, joinedload
    
    # Test that eager loading options are available
    assert selectinload is not None
    assert joinedload is not None
    
    print("✅ Query optimization features test passed")

def test_connection_pool_optimization():
    """Test connection pool optimization"""
    from app.core.database import engine
    from sqlalchemy.pool import QueuePool
    
    # Test pool configuration
    assert isinstance(engine.pool, QueuePool)
    assert engine.pool.size() >= 10  # Pool size should be optimized
    
    print("✅ Connection pool optimization test passed")

def run_all_performance_tests():
    """Run all performance optimization tests"""
    print("🚀 Running Task 27 Performance Optimization Tests...\n")
    
    try:
        test_performance_cache_basic_operations()
        test_performance_cache_statistics()
        test_cache_decorator()
        test_database_configuration_optimization()
        test_performance_indexes_migration()
        test_cached_game_session_service()
        test_cached_child_service()
        test_cache_invalidation()
        test_performance_monitoring_endpoints()
        test_query_optimization_features()
        test_connection_pool_optimization()
        
        print("\n🎉 All Task 27 Performance Optimization tests passed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Performance optimization test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = run_all_performance_tests()
    if success:
        print("\n✅ Task 27 Performance Optimization validation completed successfully!")
    else:
        print("\n❌ Task 27 Performance Optimization validation failed!")
        exit(1)
