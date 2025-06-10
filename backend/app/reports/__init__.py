# Analytics and reports module
"""
Reports module for Smile Adventure - Game Session Tracking & Clinical Reports
Provides comprehensive ASD-focused analytics and professional reporting capabilities
"""

from .models import GameSession, Report, SessionType, EmotionalState, ReportType, ReportStatus
from .schemas import (
    # Game Session schemas
    GameSessionCreate, GameSessionUpdate, GameSessionComplete, GameSessionResponse,
    GameSessionAnalytics, GameSessionFilters,
    
    # Report schemas  
    ReportCreate, ReportUpdate, ReportResponse, ReportSummary,
    ReportStatusUpdate, ReportPermissions,
    
    # Analytics schemas
    ChildProgressAnalytics, ProgramEffectivenessReport,
    
    # Task 24 schemas
    ProgressReport, SummaryReport, AnalyticsData, ReportGenerationRequest,
    
    # Utility schemas
    PaginationParams, ExportRequest, ShareRequest, ValidationResult
)
from .services import GameSessionService, AnalyticsService, ReportService

__all__ = [
    # Models
    "GameSession", "Report", "SessionType", "EmotionalState", "ReportType", "ReportStatus",
    
    # Game Session schemas
    "GameSessionCreate", "GameSessionUpdate", "GameSessionComplete", "GameSessionResponse",
    "GameSessionAnalytics", "GameSessionFilters",
    
    # Report schemas
    "ReportCreate", "ReportUpdate", "ReportResponse", "ReportSummary", 
    "ReportStatusUpdate", "ReportPermissions",
      # Analytics schemas
    "ChildProgressAnalytics", "ProgramEffectivenessReport",
    
    # Task 24 schemas
    "ProgressReport", "SummaryReport", "AnalyticsData", "ReportGenerationRequest",
    
    # Utility schemas
    "PaginationParams", "ExportRequest", "ShareRequest", "ValidationResult",
    
    # Services
    "GameSessionService", "AnalyticsService", "ReportService"
]
