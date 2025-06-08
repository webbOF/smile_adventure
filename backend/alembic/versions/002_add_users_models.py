"""Add users models - Children, Activities, GameSessions, Assessments, ProfessionalProfiles

Revision ID: 002
Revises: 001
Create Date: 2024-06-08 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create children table
    op.create_table('children',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('age', sa.Integer(), nullable=False),
        sa.Column('date_of_birth', sa.DateTime(timezone=True), nullable=True),
        sa.Column('avatar_url', sa.String(length=500), nullable=True),
        sa.Column('parent_id', sa.Integer(), nullable=False),
        sa.Column('points', sa.Integer(), nullable=False),
        sa.Column('level', sa.Integer(), nullable=False),
        sa.Column('achievements', sa.JSON(), nullable=False),
        sa.Column('diagnosis', sa.String(length=200), nullable=True),
        sa.Column('support_level', sa.Integer(), nullable=True),
        sa.Column('diagnosis_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('diagnosing_professional', sa.String(length=200), nullable=True),
        sa.Column('sensory_profile', sa.JSON(), nullable=True),
        sa.Column('behavioral_notes', sa.Text(), nullable=True),
        sa.Column('communication_style', sa.String(length=100), nullable=True),
        sa.Column('communication_notes', sa.Text(), nullable=True),
        sa.Column('current_therapies', sa.JSON(), nullable=False),
        sa.Column('emergency_contacts', sa.JSON(), nullable=False),
        sa.Column('safety_protocols', sa.JSON(), nullable=False),
        sa.Column('baseline_assessment', sa.JSON(), nullable=True),
        sa.Column('last_assessment_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('progress_notes', sa.JSON(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['parent_id'], ['auth_users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_children_id'), 'children', ['id'], unique=False)
    op.create_index(op.f('ix_children_is_active'), 'children', ['is_active'], unique=False)
    op.create_index(op.f('ix_children_name'), 'children', ['name'], unique=False)
    op.create_index(op.f('ix_children_parent_id'), 'children', ['parent_id'], unique=False)

    # Create activities table
    op.create_table('activities',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('child_id', sa.Integer(), nullable=False),
        sa.Column('activity_type', sa.String(length=50), nullable=False),
        sa.Column('activity_name', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(length=50), nullable=True),
        sa.Column('points_earned', sa.Integer(), nullable=False),
        sa.Column('difficulty_level', sa.Integer(), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('duration_minutes', sa.Integer(), nullable=True),
        sa.Column('emotional_state_before', sa.String(length=50), nullable=True),
        sa.Column('emotional_state_after', sa.String(length=50), nullable=True),
        sa.Column('anxiety_level_before', sa.Integer(), nullable=True),
        sa.Column('anxiety_level_after', sa.Integer(), nullable=True),
        sa.Column('support_level_needed', sa.String(length=50), nullable=True),
        sa.Column('support_provided_by', sa.String(length=100), nullable=True),
        sa.Column('assistive_technology_used', sa.JSON(), nullable=False),
        sa.Column('environment_type', sa.String(length=50), nullable=True),
        sa.Column('environmental_modifications', sa.JSON(), nullable=False),
        sa.Column('sensory_accommodations', sa.JSON(), nullable=False),
        sa.Column('completion_status', sa.String(length=50), nullable=False),
        sa.Column('success_rating', sa.Integer(), nullable=True),
        sa.Column('challenges_encountered', sa.JSON(), nullable=False),
        sa.Column('strategies_used', sa.JSON(), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('verified_by_parent', sa.Boolean(), nullable=False),
        sa.Column('verified_by_professional', sa.Boolean(), nullable=False),
        sa.Column('verification_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('data_source', sa.String(length=50), nullable=False),
        sa.ForeignKeyConstraint(['child_id'], ['children.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_activities_activity_type'), 'activities', ['activity_type'], unique=False)
    op.create_index(op.f('ix_activities_category'), 'activities', ['category'], unique=False)
    op.create_index(op.f('ix_activities_child_id'), 'activities', ['child_id'], unique=False)
    op.create_index(op.f('ix_activities_id'), 'activities', ['id'], unique=False)

    # Create game_sessions table
    op.create_table('game_sessions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('child_id', sa.Integer(), nullable=False),
        sa.Column('session_type', sa.String(length=50), nullable=False),
        sa.Column('scenario_name', sa.String(length=200), nullable=False),
        sa.Column('scenario_id', sa.String(length=100), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('ended_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('duration_seconds', sa.Integer(), nullable=True),
        sa.Column('levels_completed', sa.Integer(), nullable=False),
        sa.Column('max_level_reached', sa.Integer(), nullable=False),
        sa.Column('score', sa.Integer(), nullable=False),
        sa.Column('interactions_count', sa.Integer(), nullable=False),
        sa.Column('correct_responses', sa.Integer(), nullable=False),
        sa.Column('help_requests', sa.Integer(), nullable=False),
        sa.Column('emotional_data', sa.JSON(), nullable=True),
        sa.Column('interaction_patterns', sa.JSON(), nullable=True),
        sa.Column('completion_status', sa.String(length=20), nullable=False),
        sa.Column('exit_reason', sa.String(length=100), nullable=True),
        sa.Column('achievement_unlocked', sa.JSON(), nullable=False),
        sa.Column('parent_notes', sa.Text(), nullable=True),
        sa.Column('parent_rating', sa.Integer(), nullable=True),
        sa.Column('parent_observed_behavior', sa.JSON(), nullable=True),
        sa.Column('device_type', sa.String(length=50), nullable=True),
        sa.Column('app_version', sa.String(length=20), nullable=True),
        sa.Column('session_data_quality', sa.String(length=20), nullable=False),
        sa.ForeignKeyConstraint(['child_id'], ['children.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_game_sessions_child_id'), 'game_sessions', ['child_id'], unique=False)
    op.create_index(op.f('ix_game_sessions_id'), 'game_sessions', ['id'], unique=False)
    op.create_index(op.f('ix_game_sessions_scenario_id'), 'game_sessions', ['scenario_id'], unique=False)
    op.create_index(op.f('ix_game_sessions_session_type'), 'game_sessions', ['session_type'], unique=False)

    # Create assessments table
    op.create_table('assessments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('child_id', sa.Integer(), nullable=False),
        sa.Column('assessment_type', sa.String(length=100), nullable=False),
        sa.Column('assessment_name', sa.String(length=200), nullable=False),
        sa.Column('version', sa.String(length=50), nullable=True),
        sa.Column('administered_by', sa.String(length=200), nullable=False),
        sa.Column('administered_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('location', sa.String(length=200), nullable=True),
        sa.Column('raw_scores', sa.JSON(), nullable=True),
        sa.Column('standard_scores', sa.JSON(), nullable=True),
        sa.Column('percentiles', sa.JSON(), nullable=True),
        sa.Column('age_equivalents', sa.JSON(), nullable=True),
        sa.Column('interpretation', sa.Text(), nullable=True),
        sa.Column('recommendations', sa.JSON(), nullable=False),
        sa.Column('goals_identified', sa.JSON(), nullable=False),
        sa.Column('previous_assessment_id', sa.Integer(), nullable=True),
        sa.Column('progress_summary', sa.Text(), nullable=True),
        sa.Column('areas_of_growth', sa.JSON(), nullable=False),
        sa.Column('areas_of_concern', sa.JSON(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['child_id'], ['children.id'], ),
        sa.ForeignKeyConstraint(['previous_assessment_id'], ['assessments.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_assessments_assessment_type'), 'assessments', ['assessment_type'], unique=False)
    op.create_index(op.f('ix_assessments_child_id'), 'assessments', ['child_id'], unique=False)
    op.create_index(op.f('ix_assessments_id'), 'assessments', ['id'], unique=False)

    # Create professional_profiles table
    op.create_table('professional_profiles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('license_type', sa.String(length=100), nullable=True),
        sa.Column('license_number', sa.String(length=100), nullable=True),
        sa.Column('license_state', sa.String(length=50), nullable=True),
        sa.Column('license_expiry', sa.DateTime(timezone=True), nullable=True),
        sa.Column('primary_specialty', sa.String(length=200), nullable=True),
        sa.Column('subspecialties', sa.JSON(), nullable=False),
        sa.Column('certifications', sa.JSON(), nullable=False),
        sa.Column('years_experience', sa.Integer(), nullable=True),
        sa.Column('clinic_name', sa.String(length=200), nullable=True),
        sa.Column('clinic_address', sa.Text(), nullable=True),
        sa.Column('clinic_phone', sa.String(length=20), nullable=True),
        sa.Column('practice_type', sa.String(length=100), nullable=True),
        sa.Column('asd_experience_years', sa.Integer(), nullable=True),
        sa.Column('asd_certifications', sa.JSON(), nullable=False),
        sa.Column('preferred_age_groups', sa.JSON(), nullable=False),
        sa.Column('treatment_approaches', sa.JSON(), nullable=False),
        sa.Column('patient_count', sa.Integer(), nullable=False),
        sa.Column('average_rating', sa.Float(), nullable=True),
        sa.Column('total_sessions', sa.Integer(), nullable=False),
        sa.Column('available_days', sa.JSON(), nullable=False),
        sa.Column('available_hours', sa.JSON(), nullable=True),
        sa.Column('accepts_new_patients', sa.Boolean(), nullable=False),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('treatment_philosophy', sa.Text(), nullable=True),
        sa.Column('languages_spoken', sa.JSON(), nullable=False),
        sa.Column('is_verified', sa.Boolean(), nullable=False),
        sa.Column('verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('verified_by', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['auth_users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_professional_profiles_id'), 'professional_profiles', ['id'], unique=False)
    op.create_index(op.f('ix_professional_profiles_license_number'), 'professional_profiles', ['license_number'], unique=False)

    # Add additional indexes for performance
    op.create_index('ix_children_support_level', 'children', ['support_level'], unique=False)
    op.create_index('ix_children_age', 'children', ['age'], unique=False)
    op.create_index('ix_activities_completed_at', 'activities', ['completed_at'], unique=False)
    op.create_index('ix_activities_points_earned', 'activities', ['points_earned'], unique=False)
    op.create_index('ix_game_sessions_started_at', 'game_sessions', ['started_at'], unique=False)
    op.create_index('ix_game_sessions_completion_status', 'game_sessions', ['completion_status'], unique=False)
    op.create_index('ix_assessments_administered_date', 'assessments', ['administered_date'], unique=False)
    op.create_index('ix_professional_profiles_primary_specialty', 'professional_profiles', ['primary_specialty'], unique=False)
    op.create_index('ix_professional_profiles_accepts_patients', 'professional_profiles', ['accepts_new_patients'], unique=False)

def downgrade() -> None:
    # Drop additional indexes
    op.drop_index('ix_professional_profiles_accepts_patients', table_name='professional_profiles')
    op.drop_index('ix_professional_profiles_primary_specialty', table_name='professional_profiles')
    op.drop_index('ix_assessments_administered_date', table_name='assessments')
    op.drop_index('ix_game_sessions_completion_status', table_name='game_sessions')
    op.drop_index('ix_game_sessions_started_at', table_name='game_sessions')
    op.drop_index('ix_activities_points_earned', table_name='activities')
    op.drop_index('ix_activities_completed_at', table_name='activities')
    op.drop_index('ix_children_age', table_name='children')
    op.drop_index('ix_children_support_level', table_name='children')

    # Drop professional_profiles table
    op.drop_index(op.f('ix_professional_profiles_license_number'), table_name='professional_profiles')
    op.drop_index(op.f('ix_professional_profiles_id'), table_name='professional_profiles')
    op.drop_table('professional_profiles')
    
    # Drop assessments table
    op.drop_index(op.f('ix_assessments_id'), table_name='assessments')
    op.drop_index(op.f('ix_assessments_child_id'), table_name='assessments')
    op.drop_index(op.f('ix_assessments_assessment_type'), table_name='assessments')
    op.drop_table('assessments')
    
    # Drop game_sessions table
    op.drop_index(op.f('ix_game_sessions_session_type'), table_name='game_sessions')
    op.drop_index(op.f('ix_game_sessions_scenario_id'), table_name='game_sessions')
    op.drop_index(op.f('ix_game_sessions_id'), table_name='game_sessions')
    op.drop_index(op.f('ix_game_sessions_child_id'), table_name='game_sessions')
    op.drop_table('game_sessions')
    
    # Drop activities table
    op.drop_index(op.f('ix_activities_id'), table_name='activities')
    op.drop_index(op.f('ix_activities_child_id'), table_name='activities')
    op.drop_index(op.f('ix_activities_category'), table_name='activities')
    op.drop_index(op.f('ix_activities_activity_type'), table_name='activities')
    op.drop_table('activities')
    
    # Drop children table
    op.drop_index(op.f('ix_children_parent_id'), table_name='children')
    op.drop_index(op.f('ix_children_name'), table_name='children')
    op.drop_index(op.f('ix_children_is_active'), table_name='children')
    op.drop_index(op.f('ix_children_id'), table_name='children')
    op.drop_table('children')