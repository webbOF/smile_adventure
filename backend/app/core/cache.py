"""
Performance Caching Service for Task 27
Implements in-memory caching for frequently accessed data to improve response times
"""

import logging
import time
from typing import Any, Dict, Optional, Callable
from functools import wraps
from datetime import datetime, timedelta
import threading

logger = logging.getLogger(__name__)

class PerformanceCache:
    """
    Simple in-memory cache for performance optimization
    Thread-safe implementation with TTL support
    """
    
    def __init__(self):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._lock = threading.RLock()
        self._stats = {
            "hits": 0,
            "misses": 0,
            "sets": 0,
            "deletes": 0,
            "cleanups": 0
        }
    
    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None if not found/expired
        """
        with self._lock:
            if key not in self._cache:
                self._stats["misses"] += 1
                return None
            
            entry = self._cache[key]
            
            # Check if expired
            if entry["expires_at"] < time.time():
                del self._cache[key]
                self._stats["misses"] += 1
                return None
            
            # Update access time
            entry["last_accessed"] = time.time()
            self._stats["hits"] += 1
            return entry["value"]
    
    def set(self, key: str, value: Any, ttl_seconds: int = 300) -> None:
        """
        Set value in cache with TTL
        
        Args:
            key: Cache key
            value: Value to cache
            ttl_seconds: Time to live in seconds (default: 5 minutes)
        """
        with self._lock:
            expires_at = time.time() + ttl_seconds
            self._cache[key] = {
                "value": value,
                "expires_at": expires_at,
                "created_at": time.time(),
                "last_accessed": time.time()
            }
            self._stats["sets"] += 1
    
    def delete(self, key: str) -> bool:
        """
        Delete value from cache
        
        Args:
            key: Cache key
            
        Returns:
            True if key existed, False otherwise
        """
        with self._lock:
            if key in self._cache:
                del self._cache[key]
                self._stats["deletes"] += 1
                return True
            return False
    
    def clear(self) -> None:
        """Clear all cache entries"""
        with self._lock:
            self._cache.clear()
            logger.info("Cache cleared")
    
    def cleanup_expired(self) -> int:
        """
        Remove expired entries from cache
        
        Returns:
            Number of entries removed
        """
        with self._lock:
            current_time = time.time()
            expired_keys = [
                key for key, entry in self._cache.items()
                if entry["expires_at"] < current_time
            ]
            
            for key in expired_keys:
                del self._cache[key]
            
            if expired_keys:
                self._stats["cleanups"] += 1
                logger.debug(f"Cleaned up {len(expired_keys)} expired cache entries")
            
            return len(expired_keys)
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics
        
        Returns:
            Cache statistics dictionary
        """
        with self._lock:
            total_requests = self._stats["hits"] + self._stats["misses"]
            hit_rate = (self._stats["hits"] / total_requests * 100) if total_requests > 0 else 0
            
            return {
                **self._stats,
                "total_requests": total_requests,
                "hit_rate_percent": round(hit_rate, 2),
                "cache_size": len(self._cache),
                "memory_usage_estimate": self._estimate_memory_usage()
            }
    
    def _estimate_memory_usage(self) -> str:
        """Estimate memory usage of cache (rough approximation)"""
        import sys
        
        total_size = 0
        for key, entry in self._cache.items():
            total_size += sys.getsizeof(key)
            total_size += sys.getsizeof(entry["value"])
            total_size += sys.getsizeof(entry)
        
        # Convert to human readable format
        if total_size < 1024:
            return f"{total_size} B"
        elif total_size < 1024 * 1024:
            return f"{total_size / 1024:.1f} KB"
        else:
            return f"{total_size / (1024 * 1024):.1f} MB"

# Global cache instance
performance_cache = PerformanceCache()

def cached(ttl_seconds: int = 300, key_prefix: str = ""):
    """
    Decorator for caching function results
    
    Args:
        ttl_seconds: Time to live in seconds
        key_prefix: Prefix for cache key
    
    Usage:
        @cached(ttl_seconds=600, key_prefix="user_data")
        def get_user_profile(user_id: int):
            # expensive operation
            return data
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = f"{key_prefix}:{func.__name__}:{hash(str(args) + str(sorted(kwargs.items())))}"
            
            # Try to get from cache
            cached_result = performance_cache.get(cache_key)
            if cached_result is not None:
                logger.debug(f"Cache hit for {func.__name__}")
                return cached_result
            
            # Cache miss - execute function
            logger.debug(f"Cache miss for {func.__name__}")
            result = func(*args, **kwargs)
            
            # Store in cache
            performance_cache.set(cache_key, result, ttl_seconds)
            
            return result
        
        return wrapper
    return decorator

def cache_child_sessions(child_id: int, limit: int = 20) -> str:
    """Generate cache key for child sessions"""
    return f"child_sessions:{child_id}:{limit}"

def cache_child_analytics(child_id: int, days: int = 30) -> str:
    """Generate cache key for child analytics"""
    return f"child_analytics:{child_id}:{days}"

def cache_user_children(user_id: int) -> str:
    """Generate cache key for user's children"""
    return f"user_children:{user_id}"

def invalidate_child_cache(child_id: int) -> None:
    """Invalidate all cache entries related to a child"""
    patterns = [
        f"child_sessions:{child_id}:",
        f"child_analytics:{child_id}:",
        f"child_progress:{child_id}:"
    ]
    
    with performance_cache._lock:
        keys_to_delete = []
        for key in performance_cache._cache.keys():
            for pattern in patterns:
                if key.startswith(pattern):
                    keys_to_delete.append(key)
        
        for key in keys_to_delete:
            performance_cache.delete(key)
        
        if keys_to_delete:
            logger.info(f"Invalidated {len(keys_to_delete)} cache entries for child {child_id}")

def invalidate_user_cache(user_id: int) -> None:
    """Invalidate all cache entries related to a user"""
    pattern = f"user_children:{user_id}"
    performance_cache.delete(pattern)
    logger.info(f"Invalidated cache entries for user {user_id}")

# Performance monitoring function
def log_cache_performance():
    """Log cache performance statistics"""
    stats = performance_cache.get_stats()
    logger.info(f"Cache Stats - Hit Rate: {stats['hit_rate_percent']}%, "
                f"Size: {stats['cache_size']} entries, "
                f"Memory: {stats['memory_usage_estimate']}")

# Automatic cleanup task (should be called periodically)
def periodic_cache_cleanup():
    """Periodic cleanup of expired cache entries"""
    try:
        expired_count = performance_cache.cleanup_expired()
        if expired_count > 0:
            logger.info(f"Cache cleanup removed {expired_count} expired entries")
        
        # Log performance stats every cleanup
        log_cache_performance()
        
    except Exception as e:
        logger.error(f"Error during cache cleanup: {e}")
