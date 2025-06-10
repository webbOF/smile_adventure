#!/usr/bin/env python3
"""
Check database tables
"""

from app.core.database import SessionLocal
from sqlalchemy import text

def check_tables():
    db = SessionLocal()
    try:
        result = db.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")).fetchall()
        print('Tables in database:')
        for row in result:
            print(f'  - {row[0]}')
        print(f'\nTotal tables: {len(result)}')
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_tables()
