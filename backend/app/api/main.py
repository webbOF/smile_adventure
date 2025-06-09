"""
Main API router with versioning support
Task 17: API Gateway Setup with versioned endpoints
"""

from fastapi import APIRouter
from app.api.v1.api import api_v1_router

# Create main API router with versioning support
api_router = APIRouter()

# Include v1 API router under /v1 prefix
api_router.include_router(
    api_v1_router,
    prefix="/v1",
    tags=["v1"]
)

# Legacy routes for backward compatibility (will be deprecated)
# Import legacy routers
from app.auth.routes import router as auth_router
from app.users.routes import router as users_router
from app.reports.routes import router as reports_router
from app.professional.routes import router as professional_router

# Include legacy routes without version prefix (for backward compatibility)
api_router.include_router(
    auth_router,
    prefix="/auth",
    tags=["authentication", "legacy"]
)

api_router.include_router(
    users_router,
    prefix="/users", 
    tags=["users", "profile", "legacy"]
)

api_router.include_router(
    reports_router,
    prefix="/reports",
    tags=["reports", "legacy"]
)

# Task 16: Professional routes at root level (legacy)
api_router.include_router(
    professional_router,
    tags=["professional", "task16", "legacy"]
)
