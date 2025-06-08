# 🗄️ Database Configuration Guide

## 📋 Overview

This guide explains how to configure the database connection for the Smile Adventure project using Alembic migrations.

## 🔧 Setup Instructions

### 1. Configure Alembic

Copy the template configuration file:

```bash
cd backend
cp alembic.ini.template alembic.ini
```

### 2. Update Database URL

Edit `alembic.ini` and replace the placeholder with your database URL:

```ini
# For Docker PostgreSQL (recommended):
sqlalchemy.url = postgresql://smileuser:smilepass123@localhost:5434/smile_adventure

# For local PostgreSQL:
sqlalchemy.url = postgresql://username:password@localhost:5432/database_name

# For SQLite (development only):
sqlalchemy.url = sqlite:///./smile_adventure.db
```

### 3. Start Database (Docker)

```bash
# From project root
docker-compose up -d postgres redis
```

### 4. Run Migrations

```bash
# Check current migration status
alembic current

# Apply all migrations
alembic upgrade head

# View migration history
alembic history --verbose
```

### 5. Populate Test Data

```bash
# Create seed data
python seed_data.py
```

## 🗄️ Database Schema

The database includes the following tables:

- **`auth_users`** - User authentication and profiles
- **`children`** - Child profiles with ASD-specific data
- **`professional_profiles`** - Healthcare professional credentials
- **`activities`** - Activity tracking and analytics
- **`game_sessions`** - VR/game session data
- **`assessments`** - Clinical evaluations
- **`auth_user_sessions`** - Session management
- **`password_reset_tokens`** - Password recovery

## 🔒 Security Notes

### Important Files (Excluded from Git):

- **`alembic.ini`** - Contains database credentials
- **`.env`** - Environment variables

### Why `alembic.ini` is Gitignored:

1. **Database Credentials**: Contains sensitive connection strings
2. **Environment-Specific**: Different URLs for dev/staging/production
3. **Security Best Practice**: Credentials should never be in version control

## 🚀 Migration Commands

### Common Operations:

```bash
# Check current version
alembic current

# Upgrade to latest
alembic upgrade head

# Downgrade one revision
alembic downgrade -1

# View history
alembic history

# Create new migration
alembic revision --autogenerate -m "Description"
```

### Rollback Example:

```bash
# Rollback to specific revision
alembic downgrade 001

# Upgrade back to latest
alembic upgrade head
```

## 🐳 Docker Database

### Default Configuration:

- **Host**: localhost
- **Port**: 5434
- **Database**: smile_adventure
- **Username**: smileuser
- **Password**: smilepass123

### Connecting:

```bash
# Using psql
psql -h localhost -p 5434 -U smileuser -d smile_adventure

# Using Docker
docker exec -it smile_adventure_postgres_1 psql -U smileuser -d smile_adventure
```

## 🧪 Testing Database

### Reset Database:

```bash
# Drop all tables and recreate
alembic downgrade base
alembic upgrade head
python seed_data.py
```

### Verify Setup:

```bash
# Test connection
python -c "import psycopg2; conn = psycopg2.connect('postgresql://smileuser:smilepass123@localhost:5434/smile_adventure'); print('Connection successful!')"
```

## 📊 Seed Data

The seed data includes:

- **5 Users**: 2 parents, 2 professionals, 1 admin
- **2 Children**: Emma (ASD Level 1), Alex (ASD Level 2)  
- **2 Professional Profiles**: Dentist and Psychologist
- **Sample Activities**: Dental prep and communication training
- **Game Sessions**: VR tours and PECS training
- **Assessment Records**: Progress evaluations

## 🔧 Troubleshooting

### Common Issues:

1. **Connection Refused**:
   - Check Docker containers are running
   - Verify port 5434 is not in use
   - Check database URL in `alembic.ini`

2. **Migration Conflicts**:
   - Check `alembic history` for issues
   - Use `alembic stamp head` if needed
   - Verify migrations are in correct order

3. **Permission Denied**:
   - Check database user permissions
   - Verify credentials in connection string

### Getting Help:

```bash
# Check Alembic help
alembic --help

# View specific command help
alembic upgrade --help
```

## 📝 Development Workflow

1. **Start Development**:
   ```bash
   docker-compose up -d
   alembic upgrade head
   python seed_data.py
   ```

2. **Make Model Changes**:
   ```bash
   # Edit models in app/users/models.py or app/auth/models.py
   alembic revision --autogenerate -m "Add new field"
   alembic upgrade head
   ```

3. **Reset for Testing**:
   ```bash
   alembic downgrade base
   alembic upgrade head
   python seed_data.py
   ```

---

*This database is optimized for ASD (Autism Spectrum Disorder) support applications with specialized tracking and clinical data management.*
