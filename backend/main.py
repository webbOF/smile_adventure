"""
Smile Adventure - Main Application Entry Point
Complete FastAPI application with all modules integrated
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import uvicorn

# Import core modules
from app.core.config import settings
from app.core.database import db_manager, DatabaseManager
from app.auth.middleware import setup_auth_middleware

# Import API routers
from app.api.main import api_router
from app.api.v1.api import (
    global_http_exception_handler,
    global_validation_exception_handler,
    global_generic_exception_handler
)
from app.professional.routes import router as professional_router
from app.reports.routes import router as reports_router

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format=settings.LOG_FORMAT,
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(settings.LOG_FILE) if settings.LOG_FILE else logging.NullHandler()
    ]
)

logger = logging.getLogger(__name__)

# =============================================================================
# APPLICATION LIFESPAN MANAGEMENT
# =============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan management
    Handles startup and shutdown procedures
    """
    # Startup procedures
    logger.info("🚀 Starting Smile Adventure application...")
    
    try:
        # Check database connection
        if not db_manager.check_connection():
            logger.error("❌ Database connection failed!")
            raise Exception("Database connection failed")
        
        logger.info("✅ Database connection verified")
        
        # Create database tables if they don't exist
        try:
            db_manager.create_all_tables()
            logger.info("✅ Database tables verified/created")
        except Exception as e:
            logger.warning(f"⚠️ Database table creation warning: {e}")
        
        # Log pool status
        pool_status = db_manager.get_pool_status()
        logger.info(f"📊 Database pool status: {pool_status}")
        
        # Application is ready
        logger.info("🎉 Smile Adventure application started successfully!")
        logger.info(f"🔧 Environment: {settings.ENVIRONMENT}")
        logger.info(f"🔒 Debug mode: {settings.DEBUG}")
        
        yield
        
    except Exception as e:
        logger.error(f"❌ Startup failed: {e}")
        raise
    
    # Shutdown procedures
    logger.info("🛑 Shutting down Smile Adventure application...")
    logger.info("✅ Shutdown completed successfully")

# =============================================================================
# FASTAPI APPLICATION SETUP
# =============================================================================

# Create FastAPI application with comprehensive configuration
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=settings.APP_DESCRIPTION,
    debug=settings.DEBUG,
    lifespan=lifespan,
    
    # OpenAPI configuration
    openapi_url="/openapi.json" if settings.DEBUG else None,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    
    # Response model configuration
    generate_unique_id_function=lambda route: f"{route.tags[0]}-{route.name}" if route.tags else route.name,
)

# =============================================================================
# MIDDLEWARE CONFIGURATION
# =============================================================================

# CORS Middleware - Must be added before other middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=settings.ALLOW_CREDENTIALS,
    allow_methods=settings.ALLOWED_METHODS,
    allow_headers=settings.ALLOWED_HEADERS,
    expose_headers=["Content-Range", "X-Total-Count"],
    max_age=86400,  # 24 hours
)

# Setup authentication middleware (includes rate limiting, logging, security headers)
setup_auth_middleware(app)

# =============================================================================
# GLOBAL EXCEPTION HANDLERS - TASK 17 API GATEWAY
# =============================================================================

# Add the new Task 17 global exception handlers
app.add_exception_handler(StarletteHTTPException, global_http_exception_handler)
app.add_exception_handler(HTTPException, global_http_exception_handler)
app.add_exception_handler(RequestValidationError, global_validation_exception_handler)
app.add_exception_handler(Exception, global_generic_exception_handler)

# =============================================================================
# HEALTH CHECK ENDPOINTS
# =============================================================================

@app.get("/health", tags=["health"])
async def health_check():
    """
    Basic health check endpoint
    Returns application status and basic information
    """
    try:
        # Check database connection
        db_healthy = db_manager.check_connection()
        
        # Get database pool status
        pool_status = db_manager.get_pool_status()
        
        return {
            "status": "healthy" if db_healthy else "unhealthy",
            "app_name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "environment": settings.ENVIRONMENT,
            "database": {
                "status": "connected" if db_healthy else "disconnected",
                "pool": pool_status
            },
            "timestamp": "2025-06-08T12:00:00Z"  # Would use datetime.now() in real app
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": "2025-06-08T12:00:00Z"
            }
        )

@app.get("/health/detailed", tags=["health"])
async def detailed_health_check():
    """
    Detailed health check with comprehensive system status
    """
    try:
        import psutil
        import sys
        from datetime import datetime, timezone
        
        # System information
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Database status
        db_healthy = db_manager.check_connection()
        pool_status = db_manager.get_pool_status()
        
        return {
            "status": "healthy" if db_healthy else "unhealthy",
            "application": {
                "name": settings.APP_NAME,
                "version": settings.APP_VERSION,
                "environment": settings.ENVIRONMENT,
                "debug_mode": settings.DEBUG,
                "python_version": sys.version
            },
            "database": {
                "status": "connected" if db_healthy else "disconnected",
                "url": settings.DATABASE_URL.split('@')[-1],  # Hide credentials
                "pool_status": pool_status
            },
            "system": {
                "memory_usage_percent": memory.percent,
                "memory_available_gb": round(memory.available / (1024**3), 2),
                "disk_usage_percent": disk.percent,
                "disk_free_gb": round(disk.free / (1024**3), 2)
            },
            "configuration": {
                "cors_origins": len(settings.ALLOWED_HOSTS),
                "jwt_algorithm": settings.ALGORITHM,
                "access_token_expire_minutes": settings.ACCESS_TOKEN_EXPIRE_MINUTES
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
    except ImportError:
        # psutil not available, return basic health check
        return await health_check()
    except Exception as e:
        logger.error(f"Detailed health check failed: {e}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": "2025-06-08T12:00:00Z"
            }
        )

@app.get("/health/database", tags=["health"])
async def database_health_check():
    """
    Database-specific health check
    Tests database connectivity and performance
    """
    try:
        from datetime import datetime, timezone
        import time
        
        # Test basic connection
        start_time = time.time()
        db_healthy = db_manager.check_connection()
        connection_time = time.time() - start_time
        
        if not db_healthy:
            return JSONResponse(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                content={
                    "status": "unhealthy",
                    "database": "disconnected",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
            )
        
        # Get detailed pool information
        pool_status = db_manager.get_pool_status()
        
        return {
            "status": "healthy",
            "database": {
                "status": "connected",
                "connection_time_ms": round(connection_time * 1000, 2),
                "pool_status": pool_status,
                "url": settings.DATABASE_URL.split('@')[-1]  # Hide credentials
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "database": "error",
                "error": str(e),
                "timestamp": "2025-06-08T12:00:00Z"
            }
        )

# =============================================================================
# API ROUTING
# =============================================================================

# Include Task 16 professional routes directly (without prefix)
app.include_router(
    professional_router,
    responses={
        404: {"description": "Not found"},
        422: {"description": "Validation Error"},
        500: {"description": "Internal Server Error"}
    }
)

# Include Task 16 clinical analytics routes directly (without prefix)
app.include_router(
    reports_router,
    prefix="/reports",
    responses={
        404: {"description": "Not found"},
        422: {"description": "Validation Error"},
        500: {"description": "Internal Server Error"}
    }
)

# Include all API routes under /api/v1 prefix
app.include_router(
    api_router,
    prefix=settings.API_V1_PREFIX,
    responses={
        404: {"description": "Not found"},
        422: {"description": "Validation Error"},
        500: {"description": "Internal Server Error"}
    }
)

# =============================================================================
# ROOT ENDPOINTS
# =============================================================================

@app.get("/", tags=["root"])
async def root():
    """
    Root endpoint with application information
    """
    return {
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "description": settings.APP_DESCRIPTION,
        "environment": settings.ENVIRONMENT,
        "api_version": "v1",
        "api_prefix": settings.API_V1_PREFIX,
        "documentation": "/docs" if settings.DEBUG else "Documentation disabled in production",
        "health_check": "/health",
        "status": "running"
    }

@app.get("/info", tags=["root"])
async def app_info():
    """
    Application information endpoint
    """
    return {
        "application": {
            "name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "description": settings.APP_DESCRIPTION,
            "environment": settings.ENVIRONMENT
        },
        "api": {
            "version": "v1",
            "prefix": settings.API_V1_PREFIX,
            "documentation": {
                "openapi": "/openapi.json" if settings.DEBUG else None,
                "swagger_ui": "/docs" if settings.DEBUG else None,
                "redoc": "/redoc" if settings.DEBUG else None
            }
        },
        "features": {
            "authentication": "JWT with role-based access control",
            "user_roles": ["parent", "professional", "admin"],
            "child_management": "ASD-focused child profiles and progress tracking",
            "activity_tracking": "Gamified activity completion with emotional state tracking",
            "game_sessions": "Interactive game session monitoring",
            "progress_reports": "Comprehensive analytics and progress reporting",
            "data_export": "JSON and CSV export capabilities"
        },
        "security": {
            "cors_enabled": True,
            "rate_limiting": True,
            "request_logging": True,
            "security_headers": True,
            "password_hashing": "bcrypt",
            "jwt_algorithm": settings.ALGORITHM
        }
    }

# =============================================================================
# REQUEST LOGGING MIDDLEWARE
# =============================================================================

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    Request logging middleware
    Logs all incoming requests with timing information
    """
    import time
    
    # Skip logging for health checks and static files
    skip_paths = ["/health", "/docs", "/redoc", "/openapi.json", "/favicon.ico"]
    if any(request.url.path.startswith(path) for path in skip_paths):
        return await call_next(request)
    
    # Log request start
    start_time = time.time()
    client_ip = request.client.host if request.client else "unknown"
    
    logger.info(
        f"📥 {request.method} {request.url.path} - "
        f"Client: {client_ip} - "
        f"User-Agent: {request.headers.get('user-agent', 'unknown')[:50]}..."
    )
    
    # Process request
    response = await call_next(request)
    
    # Log response
    process_time = time.time() - start_time
    log_level = logging.INFO
    
    if response.status_code >= 400:
        log_level = logging.WARNING if response.status_code < 500 else logging.ERROR
    
    logger.log(
        log_level,
        f"📤 {request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Duration: {process_time:.3f}s - "
        f"Client: {client_ip}"
    )
    
    # Add response headers
    response.headers["X-Process-Time"] = str(process_time)
    response.headers["X-API-Version"] = "v1"
    
    return response

# =============================================================================
# DEVELOPMENT UTILITIES
# =============================================================================

if settings.DEBUG:
    @app.get("/debug/routes", tags=["debug"])
    async def list_routes():
        """
        Debug endpoint to list all available routes
        Only available in debug mode
        """
        routes = []
        for route in app.routes:
            if hasattr(route, 'methods') and hasattr(route, 'path'):
                routes.append({
                    "path": route.path,
                    "methods": list(route.methods),
                    "name": route.name,
                    "tags": getattr(route, 'tags', [])
                })
        
        return {
            "total_routes": len(routes),
            "routes": sorted(routes, key=lambda x: x["path"])
        }
    
    @app.get("/debug/config", tags=["debug"])
    async def debug_config():
        """
        Debug endpoint to show application configuration
        Only available in debug mode - sensitive data is masked
        """
        return {
            "app_name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "environment": settings.ENVIRONMENT,
            "debug": settings.DEBUG,
            "database_url": settings.DATABASE_URL.split('@')[-1],  # Hide credentials
            "api_prefix": settings.API_V1_PREFIX,
            "allowed_hosts": settings.ALLOWED_HOSTS,
            "jwt_algorithm": settings.ALGORITHM,
            "access_token_expire": settings.ACCESS_TOKEN_EXPIRE_MINUTES,
            "database_config": {
                "pool_size": settings.DATABASE_POOL_SIZE,
                "max_overflow": settings.DATABASE_MAX_OVERFLOW,
                "pool_timeout": settings.DATABASE_POOL_TIMEOUT
            }
        }

# =============================================================================
# APPLICATION METADATA
# =============================================================================

# Add application metadata
app.state.version = settings.APP_VERSION
app.state.environment = settings.ENVIRONMENT
app.state.start_time = "2025-06-08T12:00:00Z"  # Would use datetime.now() in real app

# =============================================================================
# MAIN EXECUTION
# =============================================================================

if __name__ == "__main__":
    """
    Main execution block for running the application directly
    """
    logger.info("🎯 Starting Smile Adventure application directly...")
    
    # Development server configuration
    uvicorn_config = {
        "app": "main:app",
        "host": "0.0.0.0",
        "port": 8000,
        "reload": settings.DEBUG,
        "log_level": settings.LOG_LEVEL.lower(),
        "access_log": True,
        "loop": "asyncio"
    }
    
    if settings.DEBUG:
        logger.info("🔧 Running in development mode with auto-reload")
        uvicorn_config.update({
            "reload_dirs": ["app"],
            "reload_includes": ["*.py"],
        })
    
    try:
        uvicorn.run(**uvicorn_config)
    except KeyboardInterrupt:
        logger.info("🛑 Application stopped by user")
    except Exception as e:
        logger.error(f"❌ Application failed to start: {e}")
        raise

# =============================================================================
# EXPORT FOR DEPLOYMENT
# =============================================================================

# Export app instance for ASGI servers (Gunicorn, Uvicorn, etc.)
application = app

# Application factory function for advanced deployment scenarios
def create_app() -> FastAPI:
    """
    Application factory function
    
    Returns:
        FastAPI: Configured application instance
    """
    return app

# Version information
__version__ = settings.APP_VERSION
__app_name__ = settings.APP_NAME

# Deployment information
DEPLOYMENT_INFO = {
    "app_name": settings.APP_NAME,
    "version": settings.APP_VERSION,
    "environment": settings.ENVIRONMENT,
    "api_prefix": settings.API_V1_PREFIX,
    "requires_database": True,
    "requires_redis": False,  # Future feature
    "health_check_url": "/health",
    "metrics_url": "/health/detailed",
    "documentation_url": "/docs" if settings.DEBUG else None
}

logger.info(f"✅ {settings.APP_NAME} v{settings.APP_VERSION} module loaded successfully")
logger.info(f"🔧 Environment: {settings.ENVIRONMENT}")
logger.info(f"🔒 Debug mode: {settings.DEBUG}")
logger.info(f"📡 API prefix: {settings.API_V1_PREFIX}")
logger.info(f"🔗 Database: {settings.DATABASE_URL.split('@')[-1]}")

# Export commonly used objects for external access
__all__ = [
    "app",
    "application", 
    "create_app",
    "DEPLOYMENT_INFO",
    "__version__",
    "__app_name__"
]