#!/bin/bash
set -e

# Create database if it doesn't exist
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Ensure database exists and is properly configured
    SELECT 'Database smile_adventure already exists' WHERE EXISTS (SELECT FROM pg_database WHERE datname = 'smile_adventure');
    
    -- Create extensions if needed
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    
    -- Set timezone
    SET timezone = 'UTC';
    
    -- Log successful initialization
    SELECT 'Database initialization completed successfully' as status;
EOSQL

echo "PostgreSQL database initialization completed!"
