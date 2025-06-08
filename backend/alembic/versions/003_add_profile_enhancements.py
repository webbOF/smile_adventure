# filepath: alembic/versions/003_add_profile_enhancements.py
"""Add profile enhancements for Task 14

Revision ID: 003_add_profile_enhancements
Revises: 002_initial_schema
Create Date: 2024-01-15 10:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '003_add_profile_enhancements'
down_revision = '002_initial_schema'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add profile enhancement columns and tables"""
    
    # Add new columns to users table for enhanced profile management
    op.add_column('users', sa.Column('bio', sa.Text(), nullable=True))
    op.add_column('users', sa.Column('location', sa.String(100), nullable=True))
    op.add_column('users', sa.Column('avatar_url', sa.String(500), nullable=True))
    op.add_column('users', sa.Column('emergency_contact_name', sa.String(100), nullable=True))
    op.add_column('users', sa.Column('emergency_contact_phone', sa.String(20), nullable=True))
    op.add_column('users', sa.Column('preferred_communication', sa.String(50), nullable=True))
    op.add_column('users', sa.Column('last_profile_update', sa.DateTime(timezone=True), nullable=True))
    
    # Create user_preferences table
    op.create_table(
        'user_preferences',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('language', sa.String(10), nullable=False, default='en'),
        sa.Column('timezone', sa.String(50), nullable=False, default='UTC'),
        sa.Column('notifications_enabled', sa.Boolean(), nullable=False, default=True),
        sa.Column('privacy_level', sa.String(20), nullable=False, default='standard'),
        sa.Column('theme', sa.String(20), nullable=False, default='light'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_user_preferences_user_id'), 'user_preferences', ['user_id'], unique=True)
    
    # Create professional_profiles table for enhanced professional management
    op.create_table(
        'professional_profiles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('specializations', postgresql.ARRAY(sa.String(50)), nullable=True),
        sa.Column('experience_years', sa.Integer(), nullable=True),
        sa.Column('education', sa.Text(), nullable=True),
        sa.Column('certifications', postgresql.ARRAY(sa.String(100)), nullable=True),
        sa.Column('availability', sa.String(50), nullable=True),
        sa.Column('accepts_insurance', sa.Boolean(), nullable=False, default=False),
        sa.Column('consultation_fee', sa.Numeric(10, 2), nullable=True),
        sa.Column('office_address', sa.Text(), nullable=True),
        sa.Column('online_consultation', sa.Boolean(), nullable=False, default=False),
        sa.Column('rating', sa.Numeric(3, 2), nullable=True),
        sa.Column('total_reviews', sa.Integer(), nullable=False, default=0),
        sa.Column('is_verified', sa.Boolean(), nullable=False, default=False),
        sa.Column('verification_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_professional_profiles_user_id'), 'professional_profiles', ['user_id'], unique=True)
    op.create_index(op.f('ix_professional_profiles_specializations'), 'professional_profiles', ['specializations'], unique=False)
    op.create_index(op.f('ix_professional_profiles_rating'), 'professional_profiles', ['rating'], unique=False)
    
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
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
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
        sa.Column('is_anonymous', sa.Boolean(), nullable=False, default=False),
        sa.Column('is_verified', sa.Boolean(), nullable=False, default=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['professional_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['reviewer_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint('rating >= 1 AND rating <= 5', name='valid_rating_range')
    )
    op.create_index(op.f('ix_professional_reviews_professional_id'), 'professional_reviews', ['professional_id'], unique=False)
    op.create_index(op.f('ix_professional_reviews_reviewer_id'), 'professional_reviews', ['reviewer_id'], unique=False)
    op.create_index(op.f('ix_professional_reviews_rating'), 'professional_reviews', ['rating'], unique=False)
    
    # Add indexes for better query performance on existing columns
    op.create_index(op.f('ix_users_role'), 'users', ['role'], unique=False)
    op.create_index(op.f('ix_users_is_active'), 'users', ['is_active'], unique=False)
    op.create_index(op.f('ix_users_is_verified'), 'users', ['is_verified'], unique=False)
    op.create_index(op.f('ix_users_created_at'), 'users', ['created_at'], unique=False)
    op.create_index(op.f('ix_users_last_login'), 'users', ['last_login'], unique=False)


def downgrade() -> None:
    """Remove profile enhancement columns and tables"""
    
    # Drop indexes
    op.drop_index(op.f('ix_users_last_login'), table_name='users')
    op.drop_index(op.f('ix_users_created_at'), table_name='users')
    op.drop_index(op.f('ix_users_is_verified'), table_name='users')
    op.drop_index(op.f('ix_users_is_active'), table_name='users')
    op.drop_index(op.f('ix_users_role'), table_name='users')
    
    # Drop tables in reverse order
    op.drop_index(op.f('ix_professional_reviews_rating'), table_name='professional_reviews')
    op.drop_index(op.f('ix_professional_reviews_reviewer_id'), table_name='professional_reviews')
    op.drop_index(op.f('ix_professional_reviews_professional_id'), table_name='professional_reviews')
    op.drop_table('professional_reviews')
    
    op.drop_index(op.f('ix_user_activity_logs_timestamp'), table_name='user_activity_logs')
    op.drop_index(op.f('ix_user_activity_logs_activity_type'), table_name='user_activity_logs')
    op.drop_index(op.f('ix_user_activity_logs_user_id'), table_name='user_activity_logs')
    op.drop_table('user_activity_logs')
    
    op.drop_index(op.f('ix_professional_profiles_rating'), table_name='professional_profiles')
    op.drop_index(op.f('ix_professional_profiles_specializations'), table_name='professional_profiles')
    op.drop_index(op.f('ix_professional_profiles_user_id'), table_name='professional_profiles')
    op.drop_table('professional_profiles')
    
    op.drop_index(op.f('ix_user_preferences_user_id'), table_name='user_preferences')
    op.drop_table('user_preferences')
    
    # Remove columns from users table
    op.drop_column('users', 'last_profile_update')
    op.drop_column('users', 'preferred_communication')
    op.drop_column('users', 'emergency_contact_phone')
    op.drop_column('users', 'emergency_contact_name')
    op.drop_column('users', 'avatar_url')
    op.drop_column('users', 'location')
    op.drop_column('users', 'bio')
