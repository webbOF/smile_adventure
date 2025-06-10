"""Task_27_performance_optimization_indexes

Revision ID: df0a642c9e98
Revises: 07e76be4ad50
Create Date: 2025-06-10 14:18:37.109158+00:00

Task 27: Performance Optimization for Smile Adventure Backend
- Add comprehensive database indexes for performance-critical queries
- Optimize frequently accessed columns and joins
- Add composite indexes for complex filtering scenarios
- Improve query performance for analytics and reporting

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'df0a642c9e98'
down_revision = '07e76be4ad50'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # =============================================================================
    # PERFORMANCE INDEXES FOR AUTH_USERS TABLE
    # =============================================================================
    
    # Composite index for active users by role (very common query)
    op.create_index('idx_users_role_active_verified', 'auth_users', 
                   ['role', 'is_active', 'is_verified'], unique=False)
    
    # Index for user search and filtering
    op.create_index('idx_users_name_search', 'auth_users', 
                   ['first_name', 'last_name'], unique=False)
    
    # Login performance index
    op.create_index('idx_users_email_status_active', 'auth_users', 
                   ['email', 'status', 'is_active'], unique=False)
    
    # =============================================================================
    # PERFORMANCE INDEXES FOR CHILDREN TABLE  
    # =============================================================================
    
    # Parent-child relationship with status (most common query)
    op.create_index('idx_children_parent_active', 'children', 
                   ['parent_id', 'is_active'], unique=False)
    
    # Age-based filtering for analytics
    op.create_index('idx_children_age_diagnosis', 'children', 
                   ['age', 'support_level'], unique=False)
    
    # Timeline queries
    op.create_index('idx_children_created_updated', 'children', 
                   ['created_at', 'updated_at'], unique=False)
    
    # Support level analytics
    op.create_index('idx_children_support_level_active', 'children', 
                   ['support_level', 'is_active'], unique=False)
    
    # =============================================================================
    # PERFORMANCE INDEXES FOR GAME_SESSIONS TABLE
    # =============================================================================
    
    # Most common query: child sessions by date range
    op.create_index('idx_game_sessions_child_date_range', 'game_sessions', 
                   ['child_id', 'started_at', 'completion_status'], unique=False)
    
    # Session analytics by type and completion
    op.create_index('idx_game_sessions_type_completion', 'game_sessions', 
                   ['session_type', 'completion_status', 'started_at'], unique=False)
    
    # Performance analytics queries
    op.create_index('idx_game_sessions_score_performance', 'game_sessions', 
                   ['child_id', 'score', 'started_at'], unique=False)
    
    # Duration and engagement analysis
    op.create_index('idx_game_sessions_duration_engagement', 'game_sessions', 
                   ['duration_seconds', 'interactions_count'], unique=False)
    
    # Scenario performance tracking
    op.create_index('idx_game_sessions_scenario_performance', 'game_sessions', 
                   ['scenario_id', 'scenario_version', 'completion_status'], unique=False)
    
    # Parent rating and feedback queries
    op.create_index('idx_game_sessions_parent_rating', 'game_sessions', 
                   ['child_id', 'parent_rating', 'started_at'], unique=False)
    
    # Recent sessions query optimization
    op.create_index('idx_game_sessions_recent', 'game_sessions', 
                   ['started_at', 'child_id'], unique=False)
    
    # Device and environment analytics
    op.create_index('idx_game_sessions_device_env', 'game_sessions', 
                   ['device_type', 'environment_type'], unique=False)
    
    # =============================================================================
    # PERFORMANCE INDEXES FOR ACTIVITIES TABLE
    # =============================================================================
    
    # Child activities timeline
    op.create_index('idx_activities_child_timeline', 'activities', 
                   ['child_id', 'completed_at', 'activity_type'], unique=False)
    
    # Activity type and difficulty analysis
    op.create_index('idx_activities_type_difficulty', 'activities', 
                   ['activity_type', 'difficulty_level', 'points_earned'], unique=False)
    
    # Verification status queries
    op.create_index('idx_activities_verification', 'activities', 
                   ['verified_by_parent', 'verified_by_professional'], unique=False)
    
    # =============================================================================
    # PERFORMANCE INDEXES FOR REPORTS TABLE (if exists)
    # =============================================================================
    
    # Check if reports table exists before creating indexes
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    tables = inspector.get_table_names()
    
    if 'reports' in tables:
        # Professional reports by child and status
        op.create_index('idx_reports_child_professional', 'reports', 
                       ['child_id', 'professional_id', 'status'], unique=False)
        
        # Report timeline and type
        op.create_index('idx_reports_type_timeline', 'reports', 
                       ['report_type', 'created_at', 'status'], unique=False)
        
        # Period-based reports
        op.create_index('idx_reports_period', 'reports', 
                       ['period_start', 'period_end'], unique=False)
    
    # =============================================================================
    # PERFORMANCE INDEXES FOR AUTH_USER_SESSIONS TABLE
    # =============================================================================
    
    # Active sessions lookup
    op.create_index('idx_sessions_active_lookup', 'auth_user_sessions', 
                   ['user_id', 'is_active', 'expires_at'], unique=False)
    
    # Session cleanup queries
    op.create_index('idx_sessions_cleanup', 'auth_user_sessions', 
                   ['expires_at', 'is_active'], unique=False)
    
    # =============================================================================
    # PERFORMANCE INDEXES FOR PROFESSIONAL_PROFILES TABLE (if exists)
    # =============================================================================
    
    if 'professional_profiles' in tables:
        # Professional search and availability
        op.create_index('idx_professional_search', 'professional_profiles', 
                       ['primary_specialty', 'accepts_new_patients'], unique=False)
        
        # Location-based searches
        op.create_index('idx_professional_location', 'professional_profiles', 
                       ['location', 'accepts_new_patients'], unique=False)


def downgrade() -> None:
    # =============================================================================
    # REMOVE PERFORMANCE INDEXES IN REVERSE ORDER
    # =============================================================================
    
    # Check if tables exist before dropping indexes
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    tables = inspector.get_table_names()
    
    # Professional profiles indexes
    if 'professional_profiles' in tables:
        op.drop_index('idx_professional_location', table_name='professional_profiles')
        op.drop_index('idx_professional_search', table_name='professional_profiles')
    
    # Auth user sessions indexes
    op.drop_index('idx_sessions_cleanup', table_name='auth_user_sessions')
    op.drop_index('idx_sessions_active_lookup', table_name='auth_user_sessions')
    
    # Reports indexes
    if 'reports' in tables:
        op.drop_index('idx_reports_period', table_name='reports')
        op.drop_index('idx_reports_type_timeline', table_name='reports')
        op.drop_index('idx_reports_child_professional', table_name='reports')
    
    # Activities indexes
    op.drop_index('idx_activities_verification', table_name='activities')
    op.drop_index('idx_activities_type_difficulty', table_name='activities')
    op.drop_index('idx_activities_child_timeline', table_name='activities')
    
    # Game sessions indexes
    op.drop_index('idx_game_sessions_device_env', table_name='game_sessions')
    op.drop_index('idx_game_sessions_recent', table_name='game_sessions')
    op.drop_index('idx_game_sessions_parent_rating', table_name='game_sessions')
    op.drop_index('idx_game_sessions_scenario_performance', table_name='game_sessions')
    op.drop_index('idx_game_sessions_duration_engagement', table_name='game_sessions')
    op.drop_index('idx_game_sessions_score_performance', table_name='game_sessions')
    op.drop_index('idx_game_sessions_type_completion', table_name='game_sessions')
    op.drop_index('idx_game_sessions_child_date_range', table_name='game_sessions')
    
    # Children indexes
    op.drop_index('idx_children_support_level_active', table_name='children')
    op.drop_index('idx_children_created_updated', table_name='children')
    op.drop_index('idx_children_age_diagnosis', table_name='children')
    op.drop_index('idx_children_parent_active', table_name='children')
    
    # Auth users indexes
    op.drop_index('idx_users_email_status_active', table_name='auth_users')
    op.drop_index('idx_users_name_search', table_name='auth_users')
    op.drop_index('idx_users_role_active_verified', table_name='auth_users')
