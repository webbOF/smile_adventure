# 🎮 Smile Adventure - Healthcare Gamification Platform

A comprehensive healthcare gamification platform designed to make medical care engaging and fun for children, while providing parents and healthcare providers with powerful tracking and analytics tools.

## 🌟 Features

### For Parents
- **Child Profile Management**: Create and manage multiple child profiles
- **Activity Tracking**: Track dental care, medication, exercises, and more
- **Progress Analytics**: Detailed reports and progress visualization
- **Gamification**: Points, levels, and achievement system
- **Secure Authentication**: JWT-based secure login system

### For Children
- **Interactive Dashboard**: Kid-friendly interface with avatars and rewards
- **Point System**: Earn points for completing healthcare activities
- **Level Progression**: Advance through levels as they complete activities
- **Achievement Badges**: Unlock special rewards and recognition

### For Healthcare Providers (Future)
- **Patient Monitoring**: Track patient compliance and progress
- **Custom Treatment Plans**: Create personalized healthcare routines
- **Analytics Dashboard**: Professional reporting and insights

## 🏗️ Project Structure

```
smile_adventure/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── auth/              # JWT Authentication
│   │   ├── users/             # User & Child Management
│   │   ├── reports/           # Analytics & Reports
│   │   ├── core/              # Database & Config
│   │   └── api/               # API Routing
│   ├── tests/                 # Test Suite
│   ├── alembic/               # Database Migrations
│   └── requirements.txt       # Python Dependencies
├── frontend/                  # React Frontend (Future)
└── docker-compose.yml         # Docker Configuration
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- PostgreSQL 15+
- Docker & Docker Compose (optional)

### Option 1: Docker Setup (Recommended)

1. **Clone and Navigate**
   ```bash
   cd smile_adventure
   ```

2. **Start Services**
   ```bash
   docker-compose up -d
   ```

3. **Run Database Migrations**
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

4. **Access Applications**
   - API: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - pgAdmin: http://localhost:8080

### Option 2: Local Development Setup

1. **Setup Python Environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Setup Database**
   ```bash
   # Install PostgreSQL and create database
   createdb smile_adventure
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Run Migrations**
   ```bash
   alembic upgrade head
   ```

5. **Start Development Server**
   ```bash
   uvicorn main:app --reload
   ```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user

### User Management
- `POST /api/v1/users/register` - Register new user
- `GET /api/v1/users/me` - Get user profile with children
- `POST /api/v1/users/children` - Create child profile
- `GET /api/v1/users/children` - Get all children
- `GET /api/v1/users/children/{id}` - Get child details

### Activity Tracking
- `POST /api/v1/users/activities` - Create new activity
- `GET /api/v1/users/children/{id}/activities` - Get child activities

### Reports & Analytics
- `GET /api/v1/reports/dashboard` - Dashboard statistics
- `GET /api/v1/reports/child/{id}/progress` - Child progress report

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_auth.py
```

## 🔧 Development Tools

### Database Migrations
```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Code Quality
```bash
# Format code
black .

# Check linting
flake8 .
```

## 🌐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `SECRET_KEY` | JWT secret key | Required |
| `DEBUG` | Enable debug mode | `False` |
| `ALLOWED_HOSTS` | CORS allowed origins | `localhost:3000,localhost:8000` |

## 📊 Database Schema

### Users Table
- User authentication and profile information
- Parent/guardian accounts

### Children Table
- Child profiles linked to parent accounts
- Points, levels, and gamification data

### Activities Table
- Healthcare activity tracking
- Points earned and verification status

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password hashing
- **CORS Protection**: Configurable cross-origin resource sharing
- **Input Validation**: Pydantic schema validation
- **SQL Injection Protection**: SQLAlchemy ORM protection

## 🔄 Deployment

### Production Checklist
- [ ] Update `SECRET_KEY` in production
- [ ] Configure production database
- [ ] Set `DEBUG=False`
- [ ] Configure CORS origins
- [ ] Set up SSL/TLS certificates
- [ ] Configure logging and monitoring

### Docker Production
```bash
# Build production image
docker build -t smile-adventure-backend ./backend

# Run with production environment
docker run -d -p 8000:8000 --env-file .env.prod smile-adventure-backend
```

## 🧪 Testing

The project includes extensive testing for both frontend and backend components with cross-platform compatibility:

### Backend Tests
- Unit tests for models, schemas, and utilities
- Integration tests for APIs and workflows
- Performance tests for database operations

### Frontend Tests
- Component tests
- Integration tests with mock API
- End-to-end tests using Selenium

### Cross-Platform Testing
- Platform-independent test infrastructure
- Automatic detection of environment differences
- Compatible with Windows, macOS, and Linux
- Unified test runner script

### Running Tests
```bash
# Set up the testing environment
python setup_test_environment.py

# Run all tests
python run_all_tests.py

# Run specific test categories
python run_all_tests.py --category frontend
python run_all_tests.py --category integration

# Run specific tests
python run_all_tests.py --test selenium_complete_test_suite.py
```

See [CROSS_PLATFORM_TESTING.md](CROSS_PLATFORM_TESTING.md) for detailed information about the cross-platform testing infrastructure.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@smileadventure.com
- Documentation: [docs.smileadventure.com](https://docs.smileadventure.com)

---

**Made with ❤️ for children's healthcare**
