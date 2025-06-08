"""Initial migration - Authentication Tables

Revision ID: 001
Revises: 
Create Date: 2024-06-01 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create auth_users table
    op.create_table('auth_users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('first_name', sa.String(length=100), nullable=False),
        sa.Column('last_name', sa.String(length=100), nullable=False),
        sa.Column('full_name', sa.String(length=200), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('role', sa.Enum('PARENT', 'PROFESSIONAL', 'ADMIN', 'SUPER_ADMIN', name='userrole'), nullable=False),
        sa.Column('status', sa.Enum('PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED', name='userstatus'), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('is_verified', sa.Boolean(), nullable=False),
        sa.Column('email_verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_login_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('failed_login_attempts', sa.Integer(), nullable=False),
        sa.Column('locked_until', sa.DateTime(timezone=True), nullable=True),
        sa.Column('license_number', sa.String(length=100), nullable=True),
        sa.Column('specialization', sa.String(length=200), nullable=True),
        sa.Column('clinic_name', sa.String(length=200), nullable=True),
        sa.Column('clinic_address', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('last_modified_by', sa.Integer(), nullable=True),
        sa.Column('timezone', sa.String(length=50), nullable=False),
        sa.Column('language', sa.String(length=10), nullable=False),
        sa.Column('avatar_url', sa.String(length=500), nullable=True),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for auth_users table
    op.create_index(op.f('ix_auth_users_email'), 'auth_users', ['email'], unique=True)
    op.create_index(op.f('ix_auth_users_id'), 'auth_users', ['id'], unique=False)
    op.create_index(op.f('ix_auth_users_is_active'), 'auth_users', ['is_active'], unique=False)
    op.create_index(op.f('ix_auth_users_license_number'), 'auth_users', ['license_number'], unique=False)
    op.create_index(op.f('ix_auth_users_role'), 'auth_users', ['role'], unique=False)
    op.create_index(op.f('ix_auth_users_status'), 'auth_users', ['status'], unique=False)
    
    # Performance indexes
    op.create_index('idx_user_email_status', 'auth_users', ['email', 'status'], unique=False)
    op.create_index('idx_user_role_active', 'auth_users', ['role', 'is_active'], unique=False)
    op.create_index('idx_user_created_at', 'auth_users', ['created_at'], unique=False)
    op.create_index('idx_user_last_login', 'auth_users', ['last_login_at'], unique=False)

    # Create auth_user_sessions table
    op.create_table('auth_user_sessions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('session_token', sa.String(length=255), nullable=False),
        sa.Column('refresh_token', sa.String(length=255), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('device_info', sa.Text(), nullable=True),
        sa.Column('location', sa.String(length=200), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('last_accessed_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('revoked_by', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['auth_users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for sessions table
    op.create_index(op.f('ix_auth_user_sessions_id'), 'auth_user_sessions', ['id'], unique=False)
    op.create_index(op.f('ix_auth_user_sessions_refresh_token'), 'auth_user_sessions', ['refresh_token'], unique=True)
    op.create_index(op.f('ix_auth_user_sessions_session_token'), 'auth_user_sessions', ['session_token'], unique=True)
    op.create_index(op.f('ix_auth_user_sessions_user_id'), 'auth_user_sessions', ['user_id'], unique=False)
    
    # Performance indexes for sessions
    op.create_index('idx_session_user_active', 'auth_user_sessions', ['user_id', 'is_active'], unique=False)
    op.create_index('idx_session_token', 'auth_user_sessions', ['session_token'], unique=False)
    op.create_index('idx_session_expires', 'auth_user_sessions', ['expires_at'], unique=False)

    # Create password_reset_tokens table
    op.create_table('password_reset_tokens',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('token', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('used_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['auth_users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for password reset tokens
    op.create_index(op.f('ix_password_reset_tokens_id'), 'password_reset_tokens', ['id'], unique=False)
    op.create_index(op.f('ix_password_reset_tokens_token'), 'password_reset_tokens', ['token'], unique=True)
    op.create_index(op.f('ix_password_reset_tokens_user_id'), 'password_reset_tokens', ['user_id'], unique=False)
    op.create_index('idx_password_reset_expires', 'password_reset_tokens', ['expires_at'], unique=False)
    op.create_index('idx_password_reset_active', 'password_reset_tokens', ['is_active'], unique=False)

def downgrade() -> None:
    # Drop password reset tokens table
    op.drop_index('idx_password_reset_active', table_name='password_reset_tokens')
    op.drop_index('idx_password_reset_expires', table_name='password_reset_tokens')
    op.drop_index(op.f('ix_password_reset_tokens_user_id'), table_name='password_reset_tokens')
    op.drop_index(op.f('ix_password_reset_tokens_token'), table_name='password_reset_tokens')
    op.drop_index(op.f('ix_password_reset_tokens_id'), table_name='password_reset_tokens')
    op.drop_table('password_reset_tokens')
    
    # Drop user sessions table
    op.drop_index('idx_session_expires', table_name='auth_user_sessions')
    op.drop_index('idx_session_token', table_name='auth_user_sessions')
    op.drop_index('idx_session_user_active', table_name='auth_user_sessions')
    op.drop_index(op.f('ix_auth_user_sessions_user_id'), table_name='auth_user_sessions')
    op.drop_index(op.f('ix_auth_user_sessions_session_token'), table_name='auth_user_sessions')
    op.drop_index(op.f('ix_auth_user_sessions_refresh_token'), table_name='auth_user_sessions')
    op.drop_index(op.f('ix_auth_user_sessions_id'), table_name='auth_user_sessions')
    op.drop_table('auth_user_sessions')
    
    # Drop auth users table
    op.drop_index('idx_user_last_login', table_name='auth_users')
    op.drop_index('idx_user_created_at', table_name='auth_users')
    op.drop_index('idx_user_role_active', table_name='auth_users')
    op.drop_index('idx_user_email_status', table_name='auth_users')
    op.drop_index(op.f('ix_auth_users_status'), table_name='auth_users')
    op.drop_index(op.f('ix_auth_users_role'), table_name='auth_users')
    op.drop_index(op.f('ix_auth_users_license_number'), table_name='auth_users')
    op.drop_index(op.f('ix_auth_users_is_active'), table_name='auth_users')
    op.drop_index(op.f('ix_auth_users_id'), table_name='auth_users')
    op.drop_index(op.f('ix_auth_users_email'), table_name='auth_users')
    op.drop_table('auth_users')
    
    # Drop enums
    op.execute('DROP TYPE IF EXISTS userstatus')
    op.execute('DROP TYPE IF EXISTS userrole')
