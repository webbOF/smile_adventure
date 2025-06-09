#!/usr/bin/env python3
"""
Quick database check script
"""
import os

# Set the correct database URL
os.environ['DATABASE_URL'] = 'postgresql://smileadventureuser:smileadventurepass@localhost:5433/smileadventure'

from sqlalchemy import create_engine, text
from app.core.config import settings

print(f"Using database URL: {settings.DATABASE_URL}")

try:
    engine = create_engine(settings.DATABASE_URL)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"))
        tables = [row[0] for row in result.fetchall()]
        
        print(f"Found {len(tables)} tables:")
        for table in tables:
            print(f"  - {table}")
            
        print()
        print("Checking specific tables:")
        if 'users' in tables:
            print('✅ users table exists')
        else:
            print('❌ users table missing')
            
        if 'auth_users' in tables:
            print('✅ auth_users table exists')
        else:
            print('❌ auth_users table missing')
            
        if 'reports' in tables:
            print('✅ reports table exists')
        else:
            print('❌ reports table missing (this might be expected)')
            
        if 'game_sessions' in tables:
            print('✅ game_sessions table exists')
        else:
            print('❌ game_sessions table missing')

except Exception as e:
    print(f"Error connecting to database: {e}")
