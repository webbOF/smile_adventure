"""Add missing GameSession fields for enhanced tracking

Revision ID: 07e76be4ad50
Revises: 004
Create Date: 2025-06-10 11:31:14.577815+00:00

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '07e76be4ad50'
down_revision = '004'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add missing fields to game_sessions table for enhanced tracking
    
    # Scenario and version tracking
    op.add_column('game_sessions', sa.Column('scenario_version', sa.String(20), nullable=True))
    
    # Enhanced timing and interaction tracking - start with nullable then update
    op.add_column('game_sessions', sa.Column('pause_count', sa.Integer(), nullable=True))
    op.add_column('game_sessions', sa.Column('total_pause_duration', sa.Integer(), nullable=True))
    op.add_column('game_sessions', sa.Column('incorrect_responses', sa.Integer(), nullable=True))
    op.add_column('game_sessions', sa.Column('hint_usage_count', sa.Integer(), nullable=True))
    
    # Set default values for existing records
    op.execute("UPDATE game_sessions SET pause_count = 0 WHERE pause_count IS NULL")
    op.execute("UPDATE game_sessions SET total_pause_duration = 0 WHERE total_pause_duration IS NULL")
    op.execute("UPDATE game_sessions SET incorrect_responses = 0 WHERE incorrect_responses IS NULL")
    op.execute("UPDATE game_sessions SET hint_usage_count = 0 WHERE hint_usage_count IS NULL")
    
    # Now make them NOT NULL
    op.alter_column('game_sessions', 'pause_count', nullable=False)
    op.alter_column('game_sessions', 'total_pause_duration', nullable=False)
    op.alter_column('game_sessions', 'incorrect_responses', nullable=False)
    op.alter_column('game_sessions', 'hint_usage_count', nullable=False)
    
    # Progress and achievement tracking
    op.add_column('game_sessions', sa.Column('achievements_unlocked', sa.JSON(), nullable=True))
    op.add_column('game_sessions', sa.Column('progress_markers_hit', sa.JSON(), nullable=True))
    
    # Set default values for JSON fields
    op.execute("UPDATE game_sessions SET achievements_unlocked = '[]' WHERE achievements_unlocked IS NULL")
    op.execute("UPDATE game_sessions SET progress_markers_hit = '[]' WHERE progress_markers_hit IS NULL")
    
    # Make JSON fields NOT NULL
    op.alter_column('game_sessions', 'achievements_unlocked', nullable=False)
    op.alter_column('game_sessions', 'progress_markers_hit', nullable=False)
    
    # Technical and environmental context
    op.add_column('game_sessions', sa.Column('device_model', sa.String(100), nullable=True))
    op.add_column('game_sessions', sa.Column('environment_type', sa.String(50), nullable=True))
    op.add_column('game_sessions', sa.Column('support_person_present', sa.Boolean(), nullable=True))
    
    # Set default for boolean field
    op.execute("UPDATE game_sessions SET support_person_present = false WHERE support_person_present IS NULL")
    op.alter_column('game_sessions', 'support_person_present', nullable=False)
    
    # AI analysis and insights
    op.add_column('game_sessions', sa.Column('ai_analysis', sa.JSON(), nullable=True))
    
    # Timestamps for audit trail - add as nullable initially
    op.add_column('game_sessions', sa.Column('created_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('game_sessions', sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True))
    
    # Set default values for timestamps (use started_at as fallback for created_at)
    op.execute("UPDATE game_sessions SET created_at = started_at WHERE created_at IS NULL")
    op.execute("UPDATE game_sessions SET updated_at = COALESCE(ended_at, started_at) WHERE updated_at IS NULL")
    
    # Now make created_at NOT NULL
    op.alter_column('game_sessions', 'created_at', nullable=False)
    
    # Create indexes for better performance
    op.create_index('ix_game_sessions_scenario_version', 'game_sessions', ['scenario_version'])
    op.create_index('ix_game_sessions_environment_type', 'game_sessions', ['environment_type'])
    op.create_index('ix_game_sessions_created_at', 'game_sessions', ['created_at'])
    op.create_index('ix_game_sessions_updated_at', 'game_sessions', ['updated_at'])


def downgrade() -> None:
    # Remove the added columns (reverse migration)
    
    # Drop indexes first
    op.drop_index('ix_game_sessions_updated_at', 'game_sessions')
    op.drop_index('ix_game_sessions_created_at', 'game_sessions')
    op.drop_index('ix_game_sessions_environment_type', 'game_sessions')
    op.drop_index('ix_game_sessions_scenario_version', 'game_sessions')
    
    # Drop columns
    op.drop_column('game_sessions', 'updated_at')
    op.drop_column('game_sessions', 'created_at')
    op.drop_column('game_sessions', 'ai_analysis')
    op.drop_column('game_sessions', 'support_person_present')
    op.drop_column('game_sessions', 'environment_type')
    op.drop_column('game_sessions', 'device_model')
    op.drop_column('game_sessions', 'progress_markers_hit')
    op.drop_column('game_sessions', 'achievements_unlocked')
    op.drop_column('game_sessions', 'hint_usage_count')
    op.drop_column('game_sessions', 'incorrect_responses')
    op.drop_column('game_sessions', 'total_pause_duration')
    op.drop_column('game_sessions', 'pause_count')
    op.drop_column('game_sessions', 'scenario_version')
