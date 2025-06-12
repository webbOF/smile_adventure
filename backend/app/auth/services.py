"""
Authentication Services - Business logic for user authentication
Comprehensive service layer for user management, authentication, and JWT handling
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from pydantic import ValidationError
import secrets
import string
import logging

from app.auth.models import User, UserRole, UserStatus, UserSession, PasswordResetToken
from app.auth.schemas import (
    UserRegister, UserLogin, PasswordChange, 
    PasswordResetConfirm, TokenData
)
from app.auth.utils import verify_password, get_password_hash, create_access_token, verify_token
from app.core.config import settings

# Configure logging
logger = logging.getLogger(__name__)

# =============================================================================
# AUTHENTICATION SERVICE CLASS
# =============================================================================

class AuthService:
    """
    Comprehensive authentication service handling all user authentication operations
    Includes user CRUD, password management, session handling, and JWT operations
    """
    
    def __init__(self, db: Session):
        """Initialize auth service with database session"""
        self.db = db
    
    # =========================================================================
    # USER AUTHENTICATION METHODS
    # =========================================================================
    
    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """
        Authenticate user with email and password
        
        Args:
            email: User email address
            password: Plain text password
            
        Returns:
            User object if authentication successful, None otherwise
        """
        try:
            user = self.get_user_by_email(email)
            if not user:
                logger.warning(f"Authentication failed: User not found for email {email}")
                return None
            
            # Check if account is active
            if user.status != UserStatus.ACTIVE or not user.is_active:
                logger.warning(f"Authentication failed: Inactive account for {email}")
                return None
            
            # Check if account is locked
            if user.locked_until and user.locked_until > datetime.now(timezone.utc):
                logger.warning(f"Authentication failed: Account locked for {email}")
                return None
            
            # Verify password
            if not verify_password(password, user.hashed_password):
                # Increment failed login attempts
                user.failed_login_attempts += 1
                
                # Lock account after 5 failed attempts
                if user.failed_login_attempts >= 5:
                    user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=30)
                    logger.warning(f"Account locked due to failed attempts: {email}")
                
                user.last_failed_login = datetime.now(timezone.utc)
                self.db.commit()
                
                logger.warning(f"Authentication failed: Invalid password for {email}")
                return None
            
            # Reset failed login attempts on successful authentication
            user.failed_login_attempts = 0
            user.locked_until = None
            user.last_login_at = datetime.now(timezone.utc)
            self.db.commit()
            
            logger.info(f"User authenticated successfully: {email}")
            return user
            
        except Exception as e:
            logger.error(f"Authentication error for {email}: {str(e)}")
            self.db.rollback()
            return None
    
    def create_user(self, user_data: UserRegister) -> User:
        """
        Create new user account
        
        Args:
            user_data: User registration data
            
        Returns:
            Created User object
            
        Raises:
            HTTPException: If user creation fails
        """
        try:
            # Check if user already exists
            existing_user = self.get_user_by_email(user_data.email)
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User with this email already exists"
                )
            
            # Hash password
            hashed_password = get_password_hash(user_data.password)
              # Create user object with development auto-verification
            user = User(
                email=user_data.email,
                hashed_password=hashed_password,
                first_name=user_data.first_name,
                last_name=user_data.last_name,
                phone=user_data.phone,
                role=UserRole(user_data.role.value),
                status=UserStatus.ACTIVE if settings.AUTO_VERIFY_EMAIL else UserStatus.PENDING,
                timezone=user_data.timezone,
                language=user_data.language,
                license_number=user_data.license_number,
                specialization=user_data.specialization,
                clinic_name=user_data.clinic_name,
                clinic_address=user_data.clinic_address,
                is_active=True if settings.AUTO_VERIFY_EMAIL else False,
                is_verified=True if settings.AUTO_VERIFY_EMAIL else False,
                email_verified_at=datetime.now(timezone.utc) if settings.AUTO_VERIFY_EMAIL else None,
                failed_login_attempts=0,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)            )
            
            self.db.add(user)
            self.db.commit()
            self.db.refresh(user)
            
            logger.info(f"User created successfully: {user.email}")
            return user
            
        except HTTPException:
            # Re-raise HTTPExceptions (like duplicate email check)
            raise
        except IntegrityError as e:
            self.db.rollback()
            logger.error(f"Database integrity error creating user: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating user: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user account"
            )
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """
        Get user by email address
        
        Args:
            email: User email address
            
        Returns:
            User object if found, None otherwise
        """
        try:
            user = self.db.query(User).filter(User.email == email.lower()).first()
            return user
        except Exception as e:
            logger.error(f"Error getting user by email {email}: {str(e)}")
            return None
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """
        Get user by ID
        
        Args:
            user_id: User ID
            
        Returns:
            User object if found, None otherwise
        """
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            return user
        except Exception as e:
            logger.error(f"Error getting user by ID {user_id}: {str(e)}")
            return None
    
    def update_user(self, user_id: int, update_data: Dict[str, Any]) -> Optional[User]:
        """
        Update user information
        
        Args:
            user_id: User ID
            update_data: Dictionary of fields to update
            
        Returns:
            Updated User object if successful, None otherwise
        """
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                return None
            
            # Update allowed fields
            allowed_fields = [
                'first_name', 'last_name', 'phone', 'timezone', 'language',
                'license_number', 'specialization', 'clinic_name', 'clinic_address',
                'bio', 'avatar_url'
            ]
            
            for field, value in update_data.items():
                if field in allowed_fields and hasattr(user, field):
                    setattr(user, field, value)
            
            user.updated_at = datetime.now(timezone.utc)
            self.db.commit()
            self.db.refresh(user)
            
            logger.info(f"User updated successfully: {user.email}")
            return user
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating user {user_id}: {str(e)}")
            return None
    
    # =========================================================================
    # PASSWORD MANAGEMENT METHODS
    # =========================================================================
    
    def change_password(self, user_id: int, password_data: PasswordChange) -> bool:
        """
        Change user password
        
        Args:
            user_id: User ID
            password_data: Password change data
            
        Returns:
            True if password changed successfully, False otherwise
        """
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                return False
            
            # Verify current password
            if not verify_password(password_data.current_password, user.hashed_password):
                logger.warning(f"Password change failed: Invalid current password for user {user_id}")
                return False
              # Hash new password
            user.hashed_password = get_password_hash(password_data.new_password)
            user.updated_at = datetime.now(timezone.utc)
            
            self.db.commit()
            logger.info(f"Password changed successfully for user {user_id}")
            return True
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error changing password for user {user_id}: {str(e)}")
            return False
    
    def create_password_reset_token(self, email: str) -> Optional[str]:
        """
        Create password reset token
        
        Args:
            email: User email address
            
        Returns:
            Reset token if successful, None otherwise
        """
        try:
            user = self.get_user_by_email(email)
            if not user:
                # Don't reveal if email exists for security
                logger.warning(f"Password reset requested for non-existent email: {email}")
                return None
            
            # Generate secure token
            token = self._generate_secure_token()
            
            # Create password reset token record
            reset_token = PasswordResetToken(
                user_id=user.id,
                token=token,
                expires_at=datetime.now(timezone.utc) + timedelta(hours=1),  # 1 hour expiry
                is_used=False,
                created_at=datetime.now(timezone.utc)
            )
            
            self.db.add(reset_token)
            self.db.commit()
            
            logger.info(f"Password reset token created for user: {email}")
            return token
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating password reset token for {email}: {str(e)}")
            return None
    
    def reset_password(self, reset_data: PasswordResetConfirm) -> bool:
        """
        Reset password using token
        
        Args:
            reset_data: Password reset confirmation data
            
        Returns:
            True if password reset successfully, False otherwise
        """
        try:
            # Find valid reset token
            reset_token = self.db.query(PasswordResetToken).filter(
                PasswordResetToken.token == reset_data.token,
                PasswordResetToken.is_used == False,
                PasswordResetToken.expires_at > datetime.now(timezone.utc)
            ).first()
            
            if not reset_token:
                logger.warning("Invalid or expired password reset token")
                return False
            
            # Get user
            user = self.get_user_by_id(reset_token.user_id)
            if not user:
                return False
            
            # Update password
            user.hashed_password = get_password_hash(reset_data.new_password)
            user.updated_at = datetime.now(timezone.utc)
            
            # Mark token as used
            reset_token.is_used = True
            reset_token.used_at = datetime.now(timezone.utc)
            
            self.db.commit()
            logger.info(f"Password reset successfully for user {user.email}")
            return True
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error resetting password: {str(e)}")
            return False
    
    # =========================================================================
    # JWT TOKEN METHODS
    # =========================================================================
    
    def create_access_token(self, user: User, expires_delta: Optional[timedelta] = None) -> str:
        """
        Create JWT access token for user
        
        Args:
            user: User object
            expires_delta: Token expiration time
            
        Returns:
            JWT access token
        """
        token_data = {
            "sub": str(user.id),
            "user_id": user.id,
            "email": user.email,
            "role": user.role.value,
            "is_verified": user.is_verified
        }
        
        return create_access_token(data=token_data, expires_delta=expires_delta)
    
    def create_refresh_token(self, user: User) -> str:
        """
        Create JWT refresh token for user
        
        Args:
            user: User object
            
        Returns:
            JWT refresh token
        """
        token_data = {
            "sub": str(user.id),
            "user_id": user.id,
            "type": "refresh"
        }
        
        # Refresh tokens have longer expiry (7 days)
        expires_delta = timedelta(days=7)
        return create_access_token(data=token_data, expires_delta=expires_delta)
    
    def verify_access_token(self, token: str) -> Optional[TokenData]:
        """
        Verify and decode access token
        
        Args:
            token: JWT access token
            
        Returns:
            TokenData if valid, None otherwise
        """
        try:
            payload = verify_token(token)
            if not payload:
                return None
            
            user_id = payload.get("user_id")
            email = payload.get("email")
            role = payload.get("role")
            
            if not user_id or not email:
                return None
            
            token_data = TokenData(
                user_id=user_id,
                email=email,
                role=role
            )
            
            return token_data
            
        except Exception as e:
            logger.error(f"Error verifying access token: {str(e)}")
            return None
    
    def refresh_access_token(self, refresh_token: str) -> Optional[str]:
        """
        Create new access token from refresh token
        
        Args:
            refresh_token: JWT refresh token
            
        Returns:
            New access token if successful, None otherwise
        """
        try:
            payload = verify_token(refresh_token)
            if not payload or payload.get("type") != "refresh":
                return None
            
            user_id = payload.get("user_id")
            user = self.get_user_by_id(user_id)
            
            if not user or not user.is_active:
                return None
            
            # Create new access token
            return self.create_access_token(user)
            
        except Exception as e:
            logger.error(f"Error refreshing access token: {str(e)}")
            return None
    
    # =========================================================================
    # SESSION MANAGEMENT METHODS
    # =========================================================================
    def create_user_session(self, user: User, session_data: Dict[str, Any] = None) -> Optional[UserSession]:
        """
        Create user session
        
        Args:
            user: User object
            session_data: Additional session data
            
        Returns:
            UserSession object if created, None otherwise
        """
        try:
            # Generate tokens
            session_token = self._generate_secure_token()
            refresh_token = self._generate_secure_token()
            
            session = UserSession(
                user_id=user.id,
                session_token=session_token,
                refresh_token=refresh_token,
                ip_address=session_data.get("ip_address") if session_data else None,                user_agent=session_data.get("user_agent") if session_data else None,
                device_info=session_data.get("device_info") if session_data else None,
                location=session_data.get("location") if session_data else None,
                expires_at=datetime.now(timezone.utc) + timedelta(hours=24),  # 24 hour session
                is_active=True
            )
            
            self.db.add(session)
            self.db.commit()
            self.db.refresh(session)
            
            return session
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating user session: {str(e)}")
            return None
    
    def invalidate_user_sessions(self, user_id: int) -> bool:
        """
        Invalidate all user sessions (logout from all devices)
        
        Args:
            user_id: User ID
            
        Returns:
            True if sessions invalidated, False otherwise
        """
        try:
            self.db.query(UserSession).filter(
                UserSession.user_id == user_id,
                UserSession.is_active == True
            ).update({
                "is_active": False,
                "revoked_at": datetime.now(timezone.utc)
            })
            
            self.db.commit()
            logger.info(f"All sessions invalidated for user {user_id}")
            return True
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error invalidating sessions for user {user_id}: {str(e)}")
            return False
    
    # =========================================================================
    # ACCOUNT MANAGEMENT METHODS
    # =========================================================================
    
    def verify_email(self, user_id: int) -> bool:
        """
        Mark user email as verified
        
        Args:
            user_id: User ID
            
        Returns:
            True if email verified, False otherwise
        """
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                return False
            
            user.is_verified = True
            user.email_verified_at = datetime.now(timezone.utc)
            user.status = UserStatus.ACTIVE
            user.is_active = True
            user.updated_at = datetime.now(timezone.utc)
            
            self.db.commit()
            logger.info(f"Email verified for user: {user.email}")
            return True
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error verifying email for user {user_id}: {str(e)}")
            return False
    
    def deactivate_user(self, user_id: int) -> bool:
        """
        Deactivate user account
        
        Args:
            user_id: User ID
            
        Returns:
            True if user deactivated, False otherwise
        """
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                return False
            
            user.is_active = False
            user.status = UserStatus.INACTIVE
            user.updated_at = datetime.now(timezone.utc)
            
            # Invalidate all sessions
            self.invalidate_user_sessions(user_id)
            
            self.db.commit()
            logger.info(f"User deactivated: {user.email}")
            return True
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deactivating user {user_id}: {str(e)}")
            return False
    
    def get_users_list(self, skip: int = 0, limit: int = 100, role: Optional[UserRole] = None) -> List[User]:
        """
        Get list of users with pagination
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            role: Filter by user role
            
        Returns:
            List of User objects
        """
        try:
            query = self.db.query(User)
            
            if role:
                query = query.filter(User.role == role)
            
            users = query.offset(skip).limit(limit).all()
            return users
            
        except Exception as e:
            logger.error(f"Error getting users list: {str(e)}")
            return []
    
    # =========================================================================
    # UTILITY METHODS
    # =========================================================================
    
    def _generate_secure_token(self, length: int = 32) -> str:
        """
        Generate secure random token
        
        Args:
            length: Token length
            
        Returns:
            Secure random token
        """
        alphabet = string.ascii_letters + string.digits
        return ''.join(secrets.choice(alphabet) for _ in range(length))
    
    def get_user_stats(self) -> Dict[str, int]:
        """
        Get user statistics
        
        Returns:
            Dictionary with user statistics
        """
        try:
            total_users = self.db.query(User).count()
            active_users = self.db.query(User).filter(User.is_active == True).count()
            pending_users = self.db.query(User).filter(User.status == UserStatus.PENDING).count()
            professional_users = self.db.query(User).filter(User.role == UserRole.PROFESSIONAL).count()
            
            return {
                "total_users": total_users,
                "active_users": active_users,
                "pending_users": pending_users,
                "professional_users": professional_users
            }
            
        except Exception as e:
            logger.error(f"Error getting user stats: {str(e)}")
            return {}

# =============================================================================
# SERVICE FACTORY FUNCTION
# =============================================================================

def get_auth_service(db: Session) -> AuthService:
    """
    Factory function to get AuthService instance
    
    Args:
        db: Database session
        
    Returns:
        AuthService instance
    """
    return AuthService(db)
