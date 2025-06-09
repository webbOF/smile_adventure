"""
Add reports models - Game Session tracking and Clinical Reports

Revision ID: 004_add_reports_models
Revises: 003_add_profile_enhancements
Create Date: 2025-06-09 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '004_add_reports_models'
down_revision = '003_add_profile_enhancements'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create enum types for reports module
    session_type_enum = postgresql.ENUM(
        'DENTAL_VISIT', 'THERAPY_SESSION', 'SOCIAL_SCENARIO', 
        'SENSORY_EXPLORATION', 'DAILY_ROUTINE', 'EMERGENCY_PREPARATION',
        name='sessiontype'
    )
    session_type_enum.create(op.get_bind())
    
    emotional_state_enum = postgresql.ENUM(
        'CALM', 'HAPPY', 'EXCITED', 'ANXIOUS', 'FRUSTRATED', 
        'OVERWHELMED', 'FOCUSED', 'TIRED', 'CONFUSED', 'CONFIDENT',
        name='emotionalstate'
    )
    emotional_state_enum.create(op.get_bind())
    
    report_type_enum = postgresql.ENUM(
        'PROGRESS', 'ASSESSMENT', 'SUMMARY', 'INCIDENT', 
        'RECOMMENDATION', 'DISCHARGE',
        name='reporttype'
    )
    report_type_enum.create(op.get_bind())
    
    report_status_enum = postgresql.ENUM(
        'DRAFT', 'PENDING_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED',
        name='reportstatus'
    )
    report_status_enum.create(op.get_bind())

    # Create enhanced game_sessions table (replacing existing basic one)
    # First drop existing table if it exists
    op.execute("DROP TABLE IF EXISTS game_sessions CASCADE")
    
    op.create_table('game_sessions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('child_id', sa.Integer(), nullable=False),
        
        # Session identification and type
        sa.Column('session_type', session_type_enum, nullable=False),
        sa.Column('scenario_name', sa.String(length=200), nullable=False),
        sa.Column('scenario_id', sa.String(length=100), nullable=True),
        sa.Column('scenario_version', sa.String(length=20), nullable=True),
        
        # Timing information
        sa.Column('started_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('ended_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('duration_seconds', sa.Integer(), nullable=True),
        sa.Column('pause_count', sa.Integer(), default=0, nullable=False),
        sa.Column('total_pause_duration', sa.Integer(), default=0, nullable=False),
        
        # Game progress and performance metrics
        sa.Column('levels_completed', sa.Integer(), default=0, nullable=False),
        sa.Column('max_level_reached', sa.Integer(), default=0, nullable=False),
        sa.Column('score', sa.Integer(), default=0, nullable=False),
        sa.Column('interactions_count', sa.Integer(), default=0, nullable=False),
        sa.Column('correct_responses', sa.Integer(), default=0, nullable=False),
        sa.Column('incorrect_responses', sa.Integer(), default=0, nullable=False),
        sa.Column('help_requests', sa.Integer(), default=0, nullable=False),
        sa.Column('hint_usage_count', sa.Integer(), default=0, nullable=False),
        
        # ASD-specific emotional and behavioral tracking
        sa.Column('emotional_data', sa.JSON(), nullable=True),
        sa.Column('interaction_patterns', sa.JSON(), nullable=True),
        
        # Completion and outcome tracking
        sa.Column('completion_status', sa.String(length=20), default='in_progress', nullable=False),
        sa.Column('exit_reason', sa.String(length=100), nullable=True),
        sa.Column('achievements_unlocked', sa.JSON(), default=[], nullable=False),
        sa.Column('progress_markers_hit', sa.JSON(), default=[], nullable=False),
        
        # Parent/caregiver observations and input
        sa.Column('parent_notes', sa.Text(), nullable=True),
        sa.Column('parent_rating', sa.Integer(), nullable=True),
        sa.Column('parent_observed_behavior', sa.JSON(), nullable=True),
        
        # Technical and environmental context
        sa.Column('device_type', sa.String(length=50), nullable=True),
        sa.Column('device_model', sa.String(length=100), nullable=True),
        sa.Column('app_version', sa.String(length=20), nullable=True),
        sa.Column('environment_type', sa.String(length=50), nullable=True),
        sa.Column('support_person_present', sa.Boolean(), default=False, nullable=False),
        sa.Column('session_data_quality', sa.String(length=20), default='good', nullable=False),
        
        # AI analysis and insights
        sa.Column('ai_analysis', sa.JSON(), nullable=True),
        
        # Foreign key constraints
        sa.ForeignKeyConstraint(['child_id'], ['children.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for game_sessions
    op.create_index(op.f('ix_game_sessions_id'), 'game_sessions', ['id'], unique=False)
    op.create_index(op.f('ix_game_sessions_child_id'), 'game_sessions', ['child_id'], unique=False)
    op.create_index(op.f('ix_game_sessions_session_type'), 'game_sessions', ['session_type'], unique=False)
    op.create_index(op.f('ix_game_sessions_scenario_id'), 'game_sessions', ['scenario_id'], unique=False)
    op.create_index(op.f('ix_game_sessions_started_at'), 'game_sessions', ['started_at'], unique=False)
    op.create_index(op.f('ix_game_sessions_completion_status'), 'game_sessions', ['completion_status'], unique=False)

    # Create reports table
    op.create_table('reports',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('child_id', sa.Integer(), nullable=False),
        sa.Column('professional_id', sa.Integer(), nullable=True),
        
        # Report identification and metadata
        sa.Column('report_type', report_type_enum, nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('report_version', sa.String(length=10), default='1.0', nullable=False),
        sa.Column('template_used', sa.String(length=100), nullable=True),
        
        # Content and structure
        sa.Column('content', sa.JSON(), nullable=False),
        sa.Column('metrics', sa.JSON(), nullable=True),
        
        # Time period and scope
        sa.Column('period_start', sa.DateTime(timezone=True), nullable=True),
        sa.Column('period_end', sa.DateTime(timezone=True), nullable=True),
        sa.Column('sessions_included', sa.JSON(), default=[], nullable=False),
        sa.Column('activities_included', sa.JSON(), default=[], nullable=False),
        
        # Workflow and approval
        sa.Column('status', report_status_enum, default='DRAFT', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.text('now()'), server_default=sa.text('now()'), nullable=False),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('approved_at', sa.DateTime(timezone=True), nullable=True),
        
        # Sharing and permissions
        sa.Column('sharing_permissions', sa.JSON(), nullable=True),
        sa.Column('attachments', sa.JSON(), default=[], nullable=False),
        
        # Quality and validation
        sa.Column('auto_generated', sa.Boolean(), default=False, nullable=False),
        sa.Column('validation_notes', sa.Text(), nullable=True),
        sa.Column('peer_reviewed', sa.Boolean(), default=False, nullable=False),
          # Foreign key constraints
        sa.ForeignKeyConstraint(['child_id'], ['children.id'], ),
        sa.ForeignKeyConstraint(['professional_id'], ['auth_users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for reports
    op.create_index(op.f('ix_reports_id'), 'reports', ['id'], unique=False)
    op.create_index(op.f('ix_reports_child_id'), 'reports', ['child_id'], unique=False)
    op.create_index(op.f('ix_reports_professional_id'), 'reports', ['professional_id'], unique=False)
    op.create_index(op.f('ix_reports_report_type'), 'reports', ['report_type'], unique=False)
    op.create_index(op.f('ix_reports_status'), 'reports', ['status'], unique=False)
    op.create_index(op.f('ix_reports_created_at'), 'reports', ['created_at'], unique=False)
    op.create_index(op.f('ix_reports_period_start'), 'reports', ['period_start'], unique=False)
    op.create_index(op.f('ix_reports_period_end'), 'reports', ['period_end'], unique=False)


def downgrade() -> None:
    # Drop tables
    op.drop_index(op.f('ix_reports_period_end'), table_name='reports')
    op.drop_index(op.f('ix_reports_period_start'), table_name='reports')
    op.drop_index(op.f('ix_reports_created_at'), table_name='reports')
    op.drop_index(op.f('ix_reports_status'), table_name='reports')
    op.drop_index(op.f('ix_reports_report_type'), table_name='reports')
    op.drop_index(op.f('ix_reports_professional_id'), table_name='reports')
    op.drop_index(op.f('ix_reports_child_id'), table_name='reports')
    op.drop_index(op.f('ix_reports_id'), table_name='reports')
    op.drop_table('reports')
    
    op.drop_index(op.f('ix_game_sessions_completion_status'), table_name='game_sessions')
    op.drop_index(op.f('ix_game_sessions_started_at'), table_name='game_sessions')
    op.drop_index(op.f('ix_game_sessions_scenario_id'), table_name='game_sessions')
    op.drop_index(op.f('ix_game_sessions_session_type'), table_name='game_sessions')
    op.drop_index(op.f('ix_game_sessions_child_id'), table_name='game_sessions')
    op.drop_index(op.f('ix_game_sessions_id'), table_name='game_sessions')
    op.drop_table('game_sessions')
    
    # Drop enum types
    op.execute("DROP TYPE IF EXISTS reportstatus")
    op.execute("DROP TYPE IF EXISTS reporttype")
    op.execute("DROP TYPE IF EXISTS emotionalstate")
    op.execute("DROP TYPE IF EXISTS sessiontype")
