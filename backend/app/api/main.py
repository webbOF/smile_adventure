"""
Main API router with versioning support
Task 17: API Gateway Setup with versioned endpoints
"""

from fastapi import APIRouter
from app.api.v1.api import api_v1_router

# Create main API router with versioning support
api_router = APIRouter()

# Include v1 API router directly without additional prefix
# (since main.py already adds /api/v1 prefix)
# This router already includes all auth, users, reports, and professional routes
# with proper prefixes as defined in api.py (Task 17)
api_router.include_router(
    api_v1_router,
    tags=["v1"]
)

# Note: Legacy routes removed to avoid conflicts
# All routes are now properly versioned through api_v1_router
# which includes:
# - /auth/* endpoints (authentication)
# - /users/* endpoints (user management, profile, children)
# - /reports/* endpoints (analytics, reports)
# - /professional/* endpoints (professional profiles, clinical tools)
