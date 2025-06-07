#!/usr/bin/env python3
"""
Database initialization script for Smile Adventure
"""

import os
import sys
from sqlalchemy import create_engine
from app.core.database import Base
from app.core.config import settings

def init_db():
    """Initialize the database with tables"""
    print("🗄️  Initializing Smile Adventure Database...")
    
    try:
        # Create engine
        engine = create_engine(settings.DATABASE_URL)
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        print("✅ Database initialized successfully!")
        print(f"📊 Tables created:")
        print("   - users")
        print("   - children") 
        print("   - activities")
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    init_db()
