"""
Task 21: Game Session Services & Analytics Implementation  
Task 22: Report Generation Services Implementation
File: backend/app/reports/services.py

BACKWARD COMPATIBILITY MODULE - Imports from modular services
This file maintains backward compatibility while services are modularized for better maintainability.

Modular Structure:
- services/game_session_service.py - Game session lifecycle and tracking
- services/analytics_service.py - Progress analytics and insights  
- services/report_service.py - Professional report generation (Task 22)
"""

import logging
from sqlalchemy.orm import Session

# Import modular services for backward compatibility
from .services.game_session_service import GameSessionService
from .services.analytics_service import AnalyticsService  
from .services.report_service import ReportService

logger = logging.getLogger(__name__)

# Export the classes to maintain compatibility
__all__ = [
    "GameSessionService",
    "AnalyticsService", 
    "ReportService"
]
