#!/usr/bin/env python3
"""
Simple database table checker for Task 21
"""
import os
import sys

# Set the environment variable
os.environ['DATABASE_URL'] = 'postgresql://smileadventureuser:smileadventurepass@localhost:5433/smileadventure'

from sqlalchemy import create_engine, text
from app.core.config import settings

def check_tables():
    """Check what tables exist in the database."""
    try:
        engine = create_engine(settings.DATABASE_URL)
        with engine.connect() as conn:
            # Fix the SQL query with proper quoting
            result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"))
            tables = [row[0] for row in result.fetchall()]
            
            print("Current tables:")
            for table in tables:
                print(f"  - {table}")
            print()
            
            # Check for key tables
            required_tables = ['users', 'auth_users', 'children', 'game_sessions', 'sensory_profiles']
            print("Checking required tables:")
            for table in required_tables:
                if table in tables:
                    print(f"  ✓ {table} exists")
                else:
                    print(f"  ✗ {table} missing")
            
            return True
            
    except Exception as e:
        print(f"Error checking database: {e}")
        return False

if __name__ == "__main__":
    check_tables()
