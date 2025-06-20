"""
Database configuration and session management
Enhanced SQLAlchemy setup with PostgreSQL, connection pooling, and session management
"""

import logging
from typing import Generator
from sqlalchemy import create_engine, event, MetaData, text
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
from sqlalchemy.engine import Engine
from app.core.config import settings

# Setup logging for database operations
logger = logging.getLogger(__name__)

# =============================================================================
# DATABASE ENGINE CONFIGURATION
# =============================================================================

# Create SQLAlchemy engine with advanced configuration optimized for Task 27
engine = create_engine(
    settings.DATABASE_URL,
    # Connection pooling configuration - Enhanced for Performance
    poolclass=QueuePool,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    pool_timeout=settings.DATABASE_POOL_TIMEOUT,
    pool_recycle=settings.DATABASE_POOL_RECYCLE,
    pool_pre_ping=settings.DATABASE_POOL_PRE_PING,  # Validate connections before use
    
    # Performance and debugging
    echo=settings.DATABASE_ECHO,  # Control SQL logging separately
    echo_pool=settings.DEBUG,  # Log pool events in debug mode
    
    # Performance optimizations
    isolation_level="READ_COMMITTED",  # Optimal isolation level for most operations    # Connection arguments for PostgreSQL - Performance Optimized
    connect_args={
        "application_name": f"{settings.APP_NAME}_v{settings.APP_VERSION}",
        "options": "-c timezone=UTC -c statement_timeout=30s -c idle_in_transaction_session_timeout=60s -c jit=off -c lock_timeout=10s",
        "connect_timeout": 10,  # Connection timeout
        # "command_timeout" removed because not supported by psycopg2
        # server_settings moved to options string above for compatibility
    },
    
    # Additional engine options
    future=True,  # Use SQLAlchemy 2.0 style
    query_cache_size=1200,  # Increase query cache for better performance
)

# =============================================================================
# SESSION CONFIGURATION
# =============================================================================

# Create SessionLocal class with specific configuration
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,  # Keep objects accessible after commit
)

# =============================================================================
# METADATA AND BASE MODEL
# =============================================================================

# Define naming convention for constraints
naming_convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}

# Create metadata with naming convention
metadata = MetaData(naming_convention=naming_convention)

# Create Base class for models
Base = declarative_base(metadata=metadata)

# =============================================================================
# DATABASE EVENT LISTENERS
# =============================================================================

@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    """Set SQLite pragmas for better performance (if using SQLite in tests)"""
    if 'sqlite' in str(dbapi_connection):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

@event.listens_for(Engine, "first_connect")
def receive_first_connect(dbapi_connection, connection_record):
    """Log first database connection"""
    logger.info(f"First database connection established to: {settings.DATABASE_URL.split('@')[-1]}")

@event.listens_for(SessionLocal, "before_commit")
def receive_before_commit(session):
    """Log session commits in debug mode"""
    if settings.DEBUG:
        logger.debug("Database session committing changes")

# =============================================================================
# DATABASE DEPENDENCIES
# =============================================================================

def get_db() -> Generator[Session, None, None]:
    """
    Database session dependency for FastAPI
    
    Yields:
        Session: SQLAlchemy database session
        
    Usage:
        @app.get("/")
        def read_items(db: Session = Depends(get_db)):
            return db.query(Item).all()    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database session error: {type(e).__name__}: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        db.rollback()
        raise
    finally:
        db.close()

def get_db_sync() -> Session:
    """
    Get database session for synchronous operations
    
    Returns:
        Session: SQLAlchemy database session
        
    Note:
        Remember to close the session manually when done
    """
    return SessionLocal()

# =============================================================================
# DATABASE UTILITIES
# =============================================================================

class DatabaseManager:
    """Database management utilities"""
    
    @staticmethod
    def create_all_tables():
        """Create all database tables"""
        try:
            Base.metadata.create_all(bind=engine)
            logger.info("All database tables created successfully")
        except Exception as e:
            logger.error(f"Error creating database tables: {e}")
            raise
    
    @staticmethod
    def drop_all_tables():
        """Drop all database tables (use with caution!)"""
        try:
            Base.metadata.drop_all(bind=engine)
            logger.warning("All database tables dropped")
        except Exception as e:
            logger.error(f"Error dropping database tables: {e}")
            raise
    
    @staticmethod
    def check_connection() -> bool:
        """
        Check database connection health
        
        Returns:
            bool: True if connection is healthy, False otherwise
        """        
        try:
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            logger.info("Database connection is healthy")
            return True
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            return False
    
    @staticmethod
    def get_pool_status() -> dict:
        """
        Get connection pool status information
        
        Returns:
            dict: Pool status information
        """
        pool = engine.pool
        return {
            "pool_size": pool.size(),
            "checked_in": pool.checkedin(),
            "checked_out": pool.checkedout(),
            "overflow": pool.overflow(),
            "total_connections": pool.checkedin() + pool.checkedout(),
            "utilization_percent": round(((pool.checkedin() + pool.checkedout()) / (pool.size() + pool.overflow())) * 100, 2)
        }
    
    @staticmethod
    def get_performance_stats() -> dict:
        """
        Get database performance statistics
        
        Returns:
            dict: Performance metrics
        """
        try:
            from sqlalchemy import text
            with engine.connect() as connection:
                # Get database size
                size_result = connection.execute(text("""
                    SELECT pg_size_pretty(pg_database_size(current_database())) as db_size
                """))
                db_size = size_result.fetchone()[0] if size_result.rowcount > 0 else "Unknown"
                
                # Get connection stats
                conn_stats = connection.execute(text("""
                    SELECT 
                        count(*) as total_connections,
                        count(*) FILTER (WHERE state = 'active') as active_connections,
                        count(*) FILTER (WHERE state = 'idle') as idle_connections
                    FROM pg_stat_activity 
                    WHERE datname = current_database()
                """))
                conn_data = conn_stats.fetchone()
                
                # Get table sizes
                table_stats = connection.execute(text("""
                    SELECT 
                        schemaname,
                        tablename,
                        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
                        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
                    FROM pg_tables 
                    WHERE schemaname = 'public'
                    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
                    LIMIT 10
                """))
                
                return {
                    "database_size": db_size,
                    "connections": {
                        "total": conn_data[0] if conn_data else 0,
                        "active": conn_data[1] if conn_data else 0,
                        "idle": conn_data[2] if conn_data else 0
                    },
                    "pool_status": DatabaseManager.get_pool_status(),
                    "largest_tables": [
                        {
                            "schema": row[0],
                            "table": row[1], 
                            "size": row[2],
                            "size_bytes": row[3]
                        } for row in table_stats.fetchall()
                    ]
                }
        except Exception as e:
            logger.error(f"Error getting performance stats: {e}")
            return {"error": str(e)}
    
    @staticmethod
    def optimize_table(table_name: str) -> bool:
        """
        Run VACUUM ANALYZE on a specific table for performance optimization
        
        Args:
            table_name: Name of the table to optimize
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            from sqlalchemy import text
            with engine.connect() as connection:
                # Use autocommit for VACUUM
                connection.connection.autocommit = True
                connection.execute(text(f"VACUUM ANALYZE {table_name}"))
                logger.info(f"Table {table_name} optimized successfully")
                return True
        except Exception as e:
            logger.error(f"Error optimizing table {table_name}: {e}")
            return False

# =============================================================================
# DATABASE CONTEXT MANAGERS
# =============================================================================

class DatabaseSession:
    """Context manager for database sessions"""
    
    def __init__(self):
        self.db = None
    
    def __enter__(self) -> Session:
        self.db = SessionLocal()
        return self.db
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            self.db.rollback()
            logger.error(f"Database session rolled back due to: {exc_val}")
        else:
            self.db.commit()
        self.db.close()

# =============================================================================
# INITIALIZATION
# =============================================================================

# Create database manager instance
db_manager = DatabaseManager()

# Log database configuration on module import
logger.info(f"Database engine configured for: {settings.DATABASE_URL.split('@')[-1]}")
logger.info(f"Pool configuration: size={settings.DATABASE_POOL_SIZE}, overflow={settings.DATABASE_MAX_OVERFLOW}")

# Export commonly used objects
__all__ = [
    "engine",
    "SessionLocal", 
    "Base",
    "get_db",
    "get_db_sync",
    "DatabaseManager",
    "DatabaseSession",
    "db_manager"
]
