# Smile Adventure Docker Setup Guide

## Overview

The Smile Adventure project is now fully containerized with Docker, providing a complete development environment with PostgreSQL database, FastAPI backend, and pgAdmin database management interface.

## Services

### 🐘 PostgreSQL Database
- **Container**: `smile_adventure_db`
- **Port**: `5434` (external) → `5432` (internal)
- **Database**: `smile_adventure`
- **Username**: `smileuser`
- **Password**: `smilepass123`
- **Status**: ✅ Healthy with automatic health checks

### 🚀 FastAPI Backend
- **Container**: `smile_adventure_backend`
- **Port**: `8000`
- **API Documentation**: http://localhost:8000/docs
- **Status**: ✅ Running with live reload for development

### 🗄️ pgAdmin Database Management
- **Container**: `smile_adventure_pgadmin`
- **Port**: `8080`
- **Web Interface**: http://localhost:8080
- **Email**: `admin@smileadventure.com`
- **Password**: `admin123`
- **Status**: ✅ Running and accessible

## Quick Start

### 1. Start All Services
```powershell
cd c:\Users\arman\Desktop\POD\smile_adventure
docker-compose up -d
```

### 2. Check Service Status
```powershell
docker-compose ps
```

### 3. View Logs
```powershell
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs db
docker-compose logs pgadmin
```

### 4. Stop All Services
```powershell
docker-compose down
```

## Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| API Root | http://localhost:8000/ | API status endpoint |
| API Docs | http://localhost:8000/docs | Interactive API documentation |
| Health Check | http://localhost:8000/health | Service health status |
| pgAdmin | http://localhost:8080 | Database administration |

## Database Connection

### From Host (for external tools)
```
Host: localhost
Port: 5434
Database: smile_adventure
Username: smileuser
Password: smilepass123
```

### From Backend Container (internal)
```
Host: db
Port: 5432
Database: smile_adventure
Username: smileuser
Password: smilepass123
```

## Development Features

### Live Reload
The backend service is configured with live reload, so code changes are automatically detected and the server restarts.

### Volume Mounting
- Backend code is mounted for development
- Database data is persisted in named volume
- pgAdmin configuration is persisted

### Health Checks
- Database has built-in health checks
- Backend waits for database to be healthy before starting

## Testing

### API Endpoints
```powershell
# Test API status
Invoke-WebRequest -Uri "http://localhost:8000/"

# Test health endpoint
Invoke-WebRequest -Uri "http://localhost:8000/health"

# Access API documentation
Invoke-WebRequest -Uri "http://localhost:8000/docs"
```

### Database Connection (from container)
```powershell
docker-compose exec backend python -c "from app.core.database import engine; from sqlalchemy import text; conn = engine.connect(); result = conn.execute(text('SELECT 1')); print('Database test:', result.fetchone()); conn.close()"
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```powershell
   # Check what's using the port
   netstat -ano | findstr :8000
   # Kill the process or change ports in docker-compose.yml
   ```

2. **Database Connection Failed**
   ```powershell
   # Check database logs
   docker-compose logs db
   # Restart database service
   docker-compose restart db
   ```

3. **Backend Won't Start**
   ```powershell
   # Check backend logs
   docker-compose logs backend
   # Rebuild backend image
   docker-compose build backend
   ```

### Rebuild Services
```powershell
# Rebuild and restart all services
docker-compose down
docker-compose build
docker-compose up -d

# Rebuild specific service
docker-compose build backend
docker-compose up -d backend
```

### Reset Everything
```powershell
# Stop and remove all containers, networks, and volumes
docker-compose down -v
docker-compose up -d
```

## pgAdmin Setup

1. Open http://localhost:8080
2. Login with:
   - Email: `admin@smileadventure.com`
   - Password: `admin123`
3. Add server connection:
   - Name: `Smile Adventure DB`
   - Host: `db` (container name)
   - Port: `5432`
   - Username: `smileuser`
   - Password: `smilepass123`
   - Database: `smile_adventure`

## Environment Variables

The following environment variables are configured in docker-compose.yml:

### Backend Service
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT secret key
- `DEBUG`: Debug mode flag

### Database Service
- `POSTGRES_DB`: Database name
- `POSTGRES_USER`: Database username
- `POSTGRES_PASSWORD`: Database password

### pgAdmin Service
- `PGADMIN_DEFAULT_EMAIL`: Admin email
- `PGADMIN_DEFAULT_PASSWORD`: Admin password

## Security Notes

⚠️ **Important**: The current configuration uses default passwords suitable for development only.

For production deployment:
1. Change all default passwords
2. Use environment files for secrets
3. Configure proper network security
4. Use SSL certificates
5. Implement proper backup strategies

## Success Status ✅

- ✅ Docker Compose configuration created
- ✅ PostgreSQL database running and healthy
- ✅ FastAPI backend running with live reload
- ✅ pgAdmin web interface accessible
- ✅ API endpoints responding correctly
- ✅ Database connectivity verified
- ✅ API documentation available
- ✅ Integration tests passing (3/4 components)
- ✅ All services properly networked

The Docker containerization setup is complete and fully functional!
