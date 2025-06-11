#!/usr/bin/env python3
"""
Simple Backend Server for Integration Testing
Runs the Smile Adventure backend with minimal configuration for frontend integration testing
"""

import sys
import os
import uvicorn
from contextlib import asynccontextmanager

# Add the backend directory to Python path
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_dir)

# Set environment variables for testing
os.environ.setdefault('DATABASE_URL', 'sqlite:///./test_integration.db')
os.environ.setdefault('DEBUG', 'true')
os.environ.setdefault('ENVIRONMENT', 'development')

@asynccontextmanager
async def lifespan_override(app):
    """Override lifespan to skip database connection for testing"""
    print("🚀 Starting backend server for integration testing...")
    print("📝 Using SQLite database for testing (bypassing PostgreSQL)")
    yield
    print("🛑 Shutting down backend server...")

def create_app():
    """Create FastAPI app with overridden lifespan"""
    try:
        # Import FastAPI app
        from main import app
        
        # Override lifespan to skip database connection issues
        app.router.lifespan_context = lifespan_override
        
        print("✅ Backend app created successfully")
        return app
        
    except Exception as e:
        print(f"❌ Failed to create app: {e}")
        raise

def main():
    """Run the backend server"""
    try:
        print("="*60)
        print("🎯 SMILE ADVENTURE BACKEND - INTEGRATION TEST MODE")
        print("="*60)
        
        app = create_app()
        
        print("🌐 Starting server on http://localhost:8000")
        print("📋 Available endpoints:")
        print("   • Health: http://localhost:8000/health")
        print("   • API Docs: http://localhost:8000/docs")
        print("   • API v1: http://localhost:8000/api/v1/")
        print("\n🧪 Ready for frontend integration testing!")
        print("=" * 60)
        
        # Run server
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=8000,
            reload=False,  # Disable reload for testing
            log_level="info"
        )
        
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        return 0
    except Exception as e:
        print(f"\n💥 Server failed to start: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
