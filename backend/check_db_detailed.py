import os
import psycopg2
from sqlalchemy import create_engine, text

# Connect directly with psycopg2
try:
    conn = psycopg2.connect(
        host="localhost",
        port=5434,
        database="smile_adventure",
        user="smileuser",
        password="smilepass123"
    )
    cursor = conn.cursor()
    
    print("Connected to database successfully!")
    
    # Check current database
    cursor.execute("SELECT current_database();")
    db_name = cursor.fetchone()[0]
    print(f"Current database: {db_name}")
    
    # Check tables
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public';
    """)
    tables = cursor.fetchall()
    print(f"Tables in database: {[table[0] for table in tables]}")
    
    # Check if alembic_version table exists and what's in it
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'alembic_version';
    """)
    alembic_table = cursor.fetchall()
    if alembic_table:
        print("Alembic version table exists")
        cursor.execute("SELECT version_num FROM alembic_version;")
        version = cursor.fetchall()
        print(f"Current migration version: {version}")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"Error: {e}")
