"""Add profile enhancements for Task 14 - Fixed

Revision ID: 003_add_profile_enhancements_fixed
Revises: 002
Create Date: 2024-01-15 10:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add profile enhancement columns and tables - Fixed to work with existing schema"""
    
    # Add new columns to auth_users table for enhanced profile management
    # Note: bio and avatar_url already exist from migration 001
    op.add_column('auth_users', sa.Column('location', sa.String(100), nullable=True))
    op.add_column('auth_users', sa.Column('emergency_contact_name', sa.String(100), nullable=True))
    op.add_column('auth_users', sa.Column('emergency_contact_phone', sa.String(20), nullable=True))
    op.add_column('auth_users', sa.Column('preferred_communication', sa.String(50), nullable=True))
    op.add_column('auth_users', sa.Column('last_profile_update', sa.DateTime(timezone=True), nullable=True))
    
    # Create user_preferences table
    op.create_table(
        'user_preferences',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('language', sa.String(10), nullable=False, server_default='en'),
        sa.Column('timezone', sa.String(50), nullable=False, server_default='UTC'),
        sa.Column('notifications_enabled', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('privacy_level', sa.String(20), nullable=False, server_default='standard'),
        sa.Column('theme', sa.String(20), nullable=False, server_default='light'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['auth_users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_user_preferences_user_id'), 'user_preferences', ['user_id'], unique=True)
    
    # Enhance existing professional_profiles table (created in migration 002) with additional columns
    op.add_column('professional_profiles', sa.Column('education', sa.Text(), nullable=True))
    op.add_column('professional_profiles', sa.Column('availability', sa.String(50), nullable=True))
    op.add_column('professional_profiles', sa.Column('accepts_insurance', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('professional_profiles', sa.Column('consultation_fee', sa.Numeric(10, 2), nullable=True))
    op.add_column('professional_profiles', sa.Column('office_address', sa.Text(), nullable=True))
    op.add_column('professional_profiles', sa.Column('online_consultation', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('professional_profiles', sa.Column('verification_date', sa.DateTime(timezone=True), nullable=True))
    
    # Rename existing years_experience to experience_years for consistency with the models
    op.alter_column('professional_profiles', 'years_experience', new_column_name='experience_years')
    
    # Create user_activity_logs table for tracking profile activities
    op.create_table(
        'user_activity_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('activity_type', sa.String(50), nullable=False),
        sa.Column('activity_description', sa.Text(), nullable=True),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['auth_users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_activity_logs_user_id'), 'user_activity_logs', ['user_id'], unique=False)
    op.create_index(op.f('ix_user_activity_logs_activity_type'), 'user_activity_logs', ['activity_type'], unique=False)
    op.create_index(op.f('ix_user_activity_logs_timestamp'), 'user_activity_logs', ['timestamp'], unique=False)
    
    # Create professional_reviews table for review system
    op.create_table(
        'professional_reviews',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('professional_id', sa.Integer(), nullable=False),
        sa.Column('reviewer_id', sa.Integer(), nullable=False),
        sa.Column('rating', sa.Integer(), nullable=False),
        sa.Column('review_text', sa.Text(), nullable=True),
        sa.Column('is_anonymous', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['professional_id'], ['auth_users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['reviewer_id'], ['auth_users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint('rating >= 1 AND rating <= 5', name='valid_rating_range')
    )
    op.create_index(op.f('ix_professional_reviews_professional_id'), 'professional_reviews', ['professional_id'], unique=False)
    op.create_index(op.f('ix_professional_reviews_reviewer_id'), 'professional_reviews', ['reviewer_id'], unique=False)
    op.create_index(op.f('ix_professional_reviews_rating'), 'professional_reviews', ['rating'], unique=False)


def downgrade() -> None:
    """Remove profile enhancement columns and tables"""
    
    # Drop tables in reverse order
    op.drop_index(op.f('ix_professional_reviews_rating'), table_name='professional_reviews')
    op.drop_index(op.f('ix_professional_reviews_reviewer_id'), table_name='professional_reviews')
    op.drop_index(op.f('ix_professional_reviews_professional_id'), table_name='professional_reviews')
    op.drop_table('professional_reviews')
    
    op.drop_index(op.f('ix_user_activity_logs_timestamp'), table_name='user_activity_logs')
    op.drop_index(op.f('ix_user_activity_logs_activity_type'), table_name='user_activity_logs')
    op.drop_index(op.f('ix_user_activity_logs_user_id'), table_name='user_activity_logs')
    op.drop_table('user_activity_logs')
    
    # Remove columns added to professional_profiles table
    op.alter_column('professional_profiles', 'experience_years', new_column_name='years_experience')
    op.drop_column('professional_profiles', 'verification_date')
    op.drop_column('professional_profiles', 'online_consultation')
    op.drop_column('professional_profiles', 'office_address')
    op.drop_column('professional_profiles', 'consultation_fee')
    op.drop_column('professional_profiles', 'accepts_insurance')
    op.drop_column('professional_profiles', 'availability')
    op.drop_column('professional_profiles', 'education')
    
    op.drop_index(op.f('ix_user_preferences_user_id'), table_name='user_preferences')
    op.drop_table('user_preferences')
    
    # Remove columns from auth_users table
    op.drop_column('auth_users', 'last_profile_update')
    op.drop_column('auth_users', 'preferred_communication')
    op.drop_column('auth_users', 'emergency_contact_phone')
    op.drop_column('auth_users', 'emergency_contact_name')
    op.drop_column('auth_users', 'location')
