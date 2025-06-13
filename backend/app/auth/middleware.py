"""
Authentication Middleware
Middleware for request logging, session management, and security headers
"""

import time
import logging
from typing import Callable
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.auth.dependencies import get_request_metadata

# Configure logging
logger = logging.getLogger(__name__)

# =============================================================================
# AUTHENTICATION MIDDLEWARE
# =============================================================================

class AuthMiddleware(BaseHTTPMiddleware):
    """
    Middleware for authentication, logging, and security
    """
    
    def __init__(self, app, exclude_paths: list = None):
        """
        Initialize middleware
        
        Args:
            app: FastAPI application
            exclude_paths: List of paths to exclude from middleware processing
        """
        super().__init__(app)
        self.exclude_paths = exclude_paths or [
            "/docs", "/redoc", "/openapi.json", "/health", "/favicon.ico"
        ]
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Process request through middleware pipeline
        
        Args:
            request: Incoming request
            call_next: Next middleware/endpoint in chain
            
        Returns:
            Response from downstream processing
        """
        start_time = time.time()
        
        # Skip middleware for excluded paths
        if any(request.url.path.startswith(path) for path in self.exclude_paths):
            return await call_next(request)
        
        # Log incoming request
        await self._log_request(request)
        
        # Add security headers to request context
        request.state.security_headers = self._get_security_headers()
        
        try:
            # Process request
            response = await call_next(request)
            
            # Add security headers to response
            self._add_security_headers(response)
            
            # Log response
            process_time = time.time() - start_time
            await self._log_response(request, response, process_time)
            
            return response
            
        except Exception as e:
            # Log error and return error response
            process_time = time.time() - start_time
            logger.error(
                f"Request failed: {request.method} {request.url.path} "
                f"from {request.client.host} - Error: {str(e)} "
                f"Duration: {process_time:.3f}s"
            )
            
            # Return JSON error response
            return JSONResponse(
                status_code=500,
                content={"detail": "Internal server error"}
            )
    
    async def _log_request(self, request: Request):
        """
        Log incoming request details
        
        Args:
            request: Incoming request
        """
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        method = request.method
        path = request.url.path
        query_params = str(request.query_params) if request.query_params else ""
        
        logger.info(
            f"Request: {method} {path}{f'?{query_params}' if query_params else ''} "
            f"from {client_ip} User-Agent: {user_agent[:100]}"
        )
        
        # Log authentication attempt if auth header present
        auth_header = request.headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            logger.debug(f"Authentication attempt from {client_ip} for {path}")
    
    async def _log_response(self, request: Request, response: Response, process_time: float):
        """
        Log response details
        
        Args:
            request: Original request
            response: Response being sent
            process_time: Time taken to process request
        """
        client_ip = request.client.host if request.client else "unknown"
        method = request.method
        path = request.url.path
        status_code = response.status_code
        
        # Determine log level based on status code
        if 200 <= status_code < 300:
            log_level = logging.INFO
        elif 300 <= status_code < 400:
            log_level = logging.INFO
        elif 400 <= status_code < 500:
            log_level = logging.WARNING
        else:
            log_level = logging.ERROR
        
        logger.log(
            log_level,
            f"Response: {method} {path} {status_code} "
            f"from {client_ip} Duration: {process_time:.3f}s"
        )
    
    def _get_security_headers(self) -> dict:
        """
        Get security headers to add to responses
        
        Returns:
            Dictionary of security headers
        """
        return {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
        }
    
    def _add_security_headers(self, response: Response):
        """
        Add security headers to response
        
        Args:
            response: Response to add headers to
        """
        security_headers = self._get_security_headers()
        
        for header_name, header_value in security_headers.items():
            response.headers[header_name] = header_value

# =============================================================================
# SESSION TRACKING MIDDLEWARE
# =============================================================================

class SessionTrackingMiddleware(BaseHTTPMiddleware):
    """
    Middleware for tracking user sessions and activity
    """
    
    def __init__(self, app):
        """
        Initialize session tracking middleware
        
        Args:
            app: FastAPI application
        """
        super().__init__(app)
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Track user session and activity
        
        Args:
            request: Incoming request
            call_next: Next middleware/endpoint in chain
            
        Returns:
            Response from downstream processing
        """
        # Extract session information
        auth_header = request.headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            # Store session metadata in request state
            request.state.session_metadata = get_request_metadata(request)
        
        # Process request
        response = await call_next(request)
        
        # Update session activity if user is authenticated
        # This would be handled by the authentication dependencies
        
        return response

# =============================================================================
# CORS MIDDLEWARE CONFIGURATION
# =============================================================================

def get_cors_middleware_config() -> dict:
    """
    Get CORS middleware configuration
    
    Returns:
        Dictionary with CORS configuration
    """
    return {
        "allow_origins": [
            "http://localhost:3000",  # React dev server
            "http://localhost:8080",  # Alternative frontend port
            "https://smileadventure.app",  # Production domain
        ],
        "allow_credentials": True,
        "allow_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        "allow_headers": [
            "Authorization",
            "Content-Type",
            "Accept",
            "Origin",
            "User-Agent",
            "DNT",
            "Cache-Control",
            "X-Mx-ReqToken",
            "Keep-Alive",
            "X-Requested-With",
            "If-Modified-Since",
        ],
        "expose_headers": [
            "Content-Length",
            "Content-Range",
            "X-Total-Count",
        ],
        "max_age": 86400,  # 24 hours
    }

# =============================================================================
# SESSION TRACKING MIDDLEWARE  
# =============================================================================

def setup_auth_middleware(app):
    """
    Setup all authentication-related middleware
    
    Args:
        app: FastAPI application instance
    """
    # Add session tracking middleware
    app.add_middleware(SessionTrackingMiddleware)
    
    # Add main auth middleware
    app.add_middleware(
        AuthMiddleware,
        exclude_paths=[
            "/docs", "/redoc", "/openapi.json", 
            "/health", "/favicon.ico", "/static"
        ]
    )
    
    logger.info("Authentication middleware setup completed")

# =============================================================================
# REQUEST CONTEXT UTILITIES
# =============================================================================

def get_client_ip(request: Request) -> str:
    """
    Extract client IP address from request
    
    Args:
        request: FastAPI request object
        
    Returns:
        Client IP address
    """
    # Check for forwarded headers first (for proxy/load balancer setups)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    # Fall back to direct client IP
    return request.client.host if request.client else "unknown"

def is_secure_request(request: Request) -> bool:
    """
    Check if request is made over HTTPS
    
    Args:
        request: FastAPI request object
        
    Returns:
        True if HTTPS, False otherwise
    """
    # Check scheme
    if request.url.scheme == "https":
        return True
    
    # Check forwarded protocol header
    forwarded_proto = request.headers.get("X-Forwarded-Proto")
    if forwarded_proto and forwarded_proto.lower() == "https":
        return True
    
    return False
