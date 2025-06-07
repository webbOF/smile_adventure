#!/usr/bin/env python3
"""
Test database connection from the backend container
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.sql import text

def test_database_connection():
    # Get environment variables
    postgres_user = os.getenv("POSTGRES_USER", "smileuser")
    postgres_password = os.getenv("POSTGRES_PASSWORD", "smilepass123") 
    postgres_host = os.getenv("POSTGRES_HOST", "db")
    postgres_port = os.getenv("POSTGRES_PORT", "5432")
    postgres_db = os.getenv("POSTGRES_DB", "smile_adventure")
    
    # Build DATABASE_URL
    DATABASE_URL = f'postgresql://{postgres_user}:{postgres_password}@{postgres_host}:{postgres_port}/{postgres_db}'
    
    # Print connection info (mask password)
    safe_url = DATABASE_URL.replace(postgres_password, "***")
    print(f'Connecting to: {safe_url}')
    
    try:
        # Create engine and test connection
        engine = create_engine(DATABASE_URL)
        
        with engine.connect() as connection:
            # Test basic connectivity
            result = connection.execute(text('SELECT version()'))
            version = result.fetchone()[0]
            print('✅ Database connection successful!')
            print(f'PostgreSQL version: {version[:50]}...')
            
            # Get current database name
            result = connection.execute(text('SELECT current_database()'))
            db_name = result.fetchone()[0]
            print(f'Connected to database: {db_name}')
            
            # Test table creation capability
            result = connection.execute(text('SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = \'public\''))
            table_count = result.fetchone()[0]
            print(f'Public tables in database: {table_count}')
            
            # Test write capability
            connection.execute(text('CREATE TABLE IF NOT EXISTS test_connection (id SERIAL PRIMARY KEY, test_timestamp TIMESTAMP DEFAULT NOW())'))
            connection.execute(text('INSERT INTO test_connection DEFAULT VALUES'))
            result = connection.execute(text('SELECT COUNT(*) FROM test_connection'))
            test_count = result.fetchone()[0]
            print(f'Test table records: {test_count}')
            
            # Cleanup test table
            connection.execute(text('DROP TABLE IF EXISTS test_connection'))
            connection.commit()
            
            print('✅ All database tests passed!')
            
    except Exception as e:
        print(f'❌ Database connection failed: {e}')
        return False
        
    return True

if __name__ == "__main__":
    test_database_connection()
