"""
App Main Module - FastAPI application instance
This module provides the app instance for tests and other modules that need to import it
"""

# Import the main app from the root main.py
import sys
import os

# Add the parent directory to the path to import from root main.py
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app

# Export the app instance
__all__ = ["app"]
