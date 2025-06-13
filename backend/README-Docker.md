# Docker Compose Commands for Smile Adventure

## Quick Start

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the .env file and update passwords:**
   - Change `POSTGRES_PASSWORD`
   - Change `SECRET_KEY`
   - Update `DATABASE_URL` with the new password

3. **Start all services:**
   ```bash
   docker-compose up -d
   ```

4. **View logs:**
   ```bash
   docker-compose logs -f
   ```

## Individual Service Commands

### Start services
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d postgres
docker-compose up -d app
```

### Stop services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (DANGER: deletes data)
docker-compose down -v
```

### Database Management

#### Access PostgreSQL container
```bash
docker-compose exec postgres psql -U smile_user -d smile_adventure
```

#### Run database migrations manually
```bash
docker-compose exec app alembic upgrade head
```

#### Create new migration
```bash
docker-compose exec app alembic revision --autogenerate -m "migration_name"
```

#### Database backup
```bash
docker-compose exec postgres pg_dump -U smile_user smile_adventure > backup.sql
```

#### Database restore
```bash
docker-compose exec -T postgres psql -U smile_user -d smile_adventure < backup.sql
```

### Application Management

#### View application logs
```bash
docker-compose logs -f app
```

#### Restart application only
```bash
docker-compose restart app
```

#### Execute commands in app container
```bash
docker-compose exec app bash
```

### Development Mode

For development with hot reload:
```bash
# Edit docker-compose.yml and add to app service:
# volumes:
#   - ./app:/app/app
# command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Health Checks

### Check service status
```bash
docker-compose ps
```

### Check application health
```bash
curl http://localhost:8000/health
```

### Check database connection
```bash
docker-compose exec app python -c "from app.core.database import engine; print('DB Connected:', engine.dialect.name)"
```

## Troubleshooting

### Reset everything (DANGER: deletes all data)
```bash
docker-compose down -v
docker-compose up -d
```

### View detailed logs
```bash
docker-compose logs --details
```

### Check disk usage
```bash
docker system df
```

### Clean up unused resources
```bash
docker system prune -f
```

## Production Deployment

1. **Set secure passwords in .env**
2. **Use HTTPS proxy (nginx/traefik)**
3. **Enable SSL/TLS**
4. **Configure proper backups**
5. **Monitor logs and metrics**
6. **Use docker-compose.prod.yml for production-specific settings**
