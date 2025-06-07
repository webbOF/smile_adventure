# 🚀 Quick Start Guide - Smile Adventure

## ⚡ Fast Setup (Docker - Recommended)

```bash
# 1. Start all services
docker-compose up -d

# 2. Run database migrations
docker-compose exec backend alembic upgrade head

# 3. Access the application
# API: http://localhost:8000
# API Docs: http://localhost:8000/docs
# Database Admin: http://localhost:8080
```

## 🛠️ Manual Setup

```bash
# 1. Setup Python environment
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# 2. Setup environment
copy .env.example .env
# Edit .env with your database settings

# 3. Run migrations
alembic upgrade head

# 4. Start development server
uvicorn main:app --reload
```

## 🧪 Test the API

### 1. Register a User
```bash
curl -X POST "http://localhost:8000/api/v1/users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "parent@example.com",
    "password": "securepassword123",
    "full_name": "John Doe",
    "phone": "+1234567890"
  }'
```

### 2. Login
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=parent@example.com&password=securepassword123"
```

### 3. Create a Child Profile
```bash
curl -X POST "http://localhost:8000/api/v1/users/children" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Emma",
    "age": 8,
    "avatar_url": "https://example.com/avatar.jpg"
  }'
```

### 4. Log an Activity
```bash
curl -X POST "http://localhost:8000/api/v1/users/activities" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "child_id": 1,
    "activity_type": "dental_care",
    "description": "Brushed teeth for 2 minutes",
    "points_earned": 10
  }'
```

## 📊 Default Activity Types

- `dental_care` - Tooth brushing, flossing, dental visits
- `medication` - Taking prescribed medications
- `exercise` - Physical activities and exercises
- `healthy_eating` - Eating fruits, vegetables, healthy meals
- `sleep` - Getting adequate sleep
- `checkup` - Medical checkups and appointments

## 🎯 Key Features to Test

1. **User Registration & Authentication**
2. **Child Profile Management**
3. **Activity Tracking with Points**
4. **Dashboard Analytics**
5. **Progress Reports**

## 🔍 Useful Endpoints

- `GET /` - Health check
- `GET /docs` - Interactive API documentation
- `GET /api/v1/users/me` - Get current user profile
- `GET /api/v1/reports/dashboard` - Dashboard statistics
- `GET /api/v1/reports/child/{id}/progress` - Child progress report

## 🎉 What's Next?

After setting up the basic infrastructure:

1. **Frontend Development** - React/Next.js interface
2. **Mobile App** - React Native application
3. **Advanced Gamification** - Badges, achievements, challenges
4. **Healthcare Integration** - Connect with medical providers
5. **AI Features** - Personalized recommendations
6. **Analytics Dashboard** - Advanced reporting tools

---

**Happy coding! 🎮✨**
