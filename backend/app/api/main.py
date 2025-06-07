"""
Main API router that combines all module routers
"""

from fastapi import APIRouter
from app.auth.routes import router as auth_router
from app.users.routes import router as users_router
from app.reports.routes import router as reports_router

# Create main API router
api_router = APIRouter()

# Include all module routers
api_router.include_router(
    auth_router,
    prefix="/auth",
    tags=["authentication"]
)

api_router.include_router(
    users_router,
    prefix="/users",
    tags=["users"]
)

api_router.include_router(
    reports_router,
    prefix="/reports",
    tags=["reports"]
)
