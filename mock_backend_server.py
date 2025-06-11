#!/usr/bin/env python3
"""
Minimal Backend Server for Frontend Integration Testing
This creates a simple mock backend that responds to frontend API calls
"""

from fastapi import FastAPI, HTTPException, Depends, status, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import time
import jwt
from datetime import datetime, timedelta
import uuid

# Mock data storage
mock_users = {}
mock_children = {}
mock_sessions = {}
mock_tokens = set()

# JWT configuration
SECRET_KEY = "test-secret-key-for-integration"
ALGORITHM = "HS256"

app = FastAPI(
    title="Smile Adventure API - Test Mode",
    description="Mock backend for frontend integration testing",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Pydantic models
class UserRegister(BaseModel):
    email: str
    password: str
    password_confirm: str
    first_name: str
    last_name: str
    phone: str
    role: str = "parent"

class UserLogin(BaseModel):
    username: str
    password: str

class ChildCreate(BaseModel):
    name: str
    date_of_birth: str
    gender: Optional[str] = None
    diagnosis: Optional[str] = None
    diagnosis_date: Optional[str] = None
    support_level: Optional[str] = None
    current_therapies: Optional[List[str]] = []
    emergency_contacts: Optional[List[Dict]] = []
    safety_protocols: Optional[Dict] = {}

class GameSessionCreate(BaseModel):
    child_id: int
    session_type: str
    scenario_name: str
    scenario_id: str
    scenario_version: str
    device_type: str
    device_model: str
    app_version: str
    environment_type: str
    support_person_present: bool

class GameSessionComplete(BaseModel):
    score: int
    levels_completed: int
    interactions_count: int
    correct_responses: int
    incorrect_responses: int
    hints_used: int
    time_spent_seconds: int
    engagement_level: str
    difficulty_progression: str
    areas_of_strength: List[str]
    areas_for_improvement: List[str]
    session_notes: str

# Helper functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# API Routes

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "mode": "integration_testing"
    }

@app.get("/api/v1/health")
async def api_health_check():
    return {
        "status": "healthy",
        "api_version": "v1",
        "services": {
            "api": "healthy",
            "authentication": "healthy"
        }
    }

@app.get("/api/v1/")
async def api_info():
    return {
        "api_version": "v1",
        "title": "Smile Adventure API v1",
        "description": "Healthcare gamification platform API - Test Mode",
        "status": "active",
        "mode": "integration_testing"
    }

@app.post("/api/v1/auth/register", status_code=201)
async def register_user(user_data: UserRegister):
    # Check if user already exists
    if user_data.email in [u["email"] for u in mock_users.values()]:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = len(mock_users) + 1
    user = {
        "id": user_id,
        "email": user_data.email,
        "first_name": user_data.first_name,
        "last_name": user_data.last_name,
        "phone": user_data.phone,
        "role": user_data.role,
        "is_verified": False,
        "created_at": datetime.now().isoformat()
    }
    
    mock_users[user_id] = user
    
    return {
        "message": "User registered successfully",
        "user": user
    }

@app.post("/api/v1/auth/verify-email/{user_id}")
async def verify_email(user_id: int):
    if user_id not in mock_users:
        raise HTTPException(status_code=404, detail="User not found")
    
    mock_users[user_id]["is_verified"] = True
    return {"message": "Email verified successfully"}

@app.post("/api/v1/auth/login")
async def login_user(username: str = Form(...), password: str = Form(...)):
    # Find user by email
    user = None
    for u in mock_users.values():
        if u["email"] == username:
            user = u
            break
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user["is_verified"]:
        raise HTTPException(status_code=401, detail="Email not verified")
    
    # Create token
    token_data = {"sub": user["id"]}
    access_token = create_access_token(token_data)
    mock_tokens.add(access_token)
    
    return {
        "token": {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_at": (datetime.now() + timedelta(hours=24)).isoformat()
        },
        "user": user
    }

@app.get("/api/v1/auth/me")
async def get_current_user(user_id: int = Depends(verify_token)):
    if user_id not in mock_users:
        raise HTTPException(status_code=404, detail="User not found")
    
    return mock_users[user_id]

@app.post("/api/v1/auth/logout")
async def logout_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    mock_tokens.discard(credentials.credentials)
    return {"message": "Logout successful"}

@app.post("/api/v1/users/children", status_code=201)
async def create_child(child_data: ChildCreate, user_id: int = Depends(verify_token)):
    child_id = len(mock_children) + 1
    
    # Calculate age from date_of_birth
    from datetime import date
    birth_date = datetime.strptime(child_data.date_of_birth, "%Y-%m-%d").date()
    today = date.today()
    age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
    
    child = {
        "id": child_id,
        "parent_id": user_id,
        "name": child_data.name,
        "date_of_birth": child_data.date_of_birth,
        "age": age,
        "gender": child_data.gender,
        "diagnosis": child_data.diagnosis,
        "diagnosis_date": child_data.diagnosis_date,
        "support_level": child_data.support_level,
        "current_therapies": child_data.current_therapies,
        "emergency_contacts": child_data.emergency_contacts,
        "safety_protocols": child_data.safety_protocols,
        "created_at": datetime.now().isoformat()
    }
    
    mock_children[child_id] = child
    return child

@app.get("/api/v1/users/children")
async def get_children(user_id: int = Depends(verify_token)):
    user_children = [child for child in mock_children.values() if child["parent_id"] == user_id]
    return user_children

@app.post("/api/v1/reports/game-sessions", status_code=201)
async def create_game_session(session_data: GameSessionCreate, user_id: int = Depends(verify_token)):
    # Verify child belongs to user
    child = mock_children.get(session_data.child_id)
    if not child or child["parent_id"] != user_id:
        raise HTTPException(status_code=404, detail="Child not found")
    
    session_id = len(mock_sessions) + 1
    session = {
        "id": session_id,
        "child_id": session_data.child_id,
        "session_type": session_data.session_type,
        "scenario_name": session_data.scenario_name,
        "scenario_id": session_data.scenario_id,
        "scenario_version": session_data.scenario_version,
        "device_type": session_data.device_type,
        "device_model": session_data.device_model,
        "app_version": session_data.app_version,
        "environment_type": session_data.environment_type,
        "support_person_present": session_data.support_person_present,
        "started_at": datetime.now().isoformat(),
        "completion_status": "in_progress",
        "score": None
    }
    
    mock_sessions[session_id] = session
    return session

@app.put("/api/v1/reports/game-sessions/{session_id}/end")
async def complete_game_session(
    session_id: int, 
    completion_data: GameSessionComplete, 
    user_id: int = Depends(verify_token)
):
    session = mock_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Verify child belongs to user
    child = mock_children.get(session["child_id"])
    if not child or child["parent_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Update session with completion data
    session.update({
        "completion_status": "completed",
        "score": completion_data.score,
        "levels_completed": completion_data.levels_completed,
        "interactions_count": completion_data.interactions_count,
        "correct_responses": completion_data.correct_responses,
        "incorrect_responses": completion_data.incorrect_responses,
        "hints_used": completion_data.hints_used,
        "time_spent_seconds": completion_data.time_spent_seconds,
        "engagement_level": completion_data.engagement_level,
        "difficulty_progression": completion_data.difficulty_progression,
        "areas_of_strength": completion_data.areas_of_strength,
        "areas_for_improvement": completion_data.areas_for_improvement,
        "session_notes": completion_data.session_notes,
        "completed_at": datetime.now().isoformat(),
        "duration_minutes": round(completion_data.time_spent_seconds / 60, 1)
    })
    
    return session

@app.get("/api/v1/reports/child/{child_id}/progress")
async def get_child_progress(child_id: int, user_id: int = Depends(verify_token)):
    # Verify child belongs to user
    child = mock_children.get(child_id)
    if not child or child["parent_id"] != user_id:
        raise HTTPException(status_code=404, detail="Child not found")
    
    # Get child's sessions
    child_sessions = [s for s in mock_sessions.values() if s["child_id"] == child_id]
    completed_sessions = [s for s in child_sessions if s["completion_status"] == "completed"]
    
    if not completed_sessions:
        return {
            "child_id": child_id,
            "total_sessions": 0,
            "average_score": 0,
            "total_time_minutes": 0,
            "progress_trend": "no_data"
        }
    
    total_score = sum(s["score"] for s in completed_sessions if s["score"])
    average_score = total_score / len(completed_sessions) if completed_sessions else 0
    total_time = sum(s["time_spent_seconds"] for s in completed_sessions if s["time_spent_seconds"])
    
    return {
        "child_id": child_id,
        "total_sessions": len(completed_sessions),
        "average_score": round(average_score, 1),
        "total_time_minutes": round(total_time / 60, 1),
        "progress_trend": "improving" if len(completed_sessions) > 1 else "stable",
        "last_session_date": completed_sessions[-1]["completed_at"] if completed_sessions else None
    }

@app.get("/api/v1/reports/child/{child_id}/analytics")
async def get_child_analytics(child_id: int, user_id: int = Depends(verify_token)):
    # Verify child belongs to user
    child = mock_children.get(child_id)
    if not child or child["parent_id"] != user_id:
        raise HTTPException(status_code=404, detail="Child not found")
    
    # Get child's sessions
    child_sessions = [s for s in mock_sessions.values() if s["child_id"] == child_id]
    completed_sessions = [s for s in child_sessions if s["completion_status"] == "completed"]
    
    return {
        "child_id": child_id,
        "performance_metrics": {
            "sessions_completed": len(completed_sessions),
            "average_score": round(sum(s["score"] for s in completed_sessions if s["score"]) / len(completed_sessions), 1) if completed_sessions else 0,
            "engagement_levels": [s["engagement_level"] for s in completed_sessions if s.get("engagement_level")],
            "improvement_areas": [area for s in completed_sessions for area in s.get("areas_for_improvement", [])]
        },
        "skill_development": {
            "strengths": [area for s in completed_sessions for area in s.get("areas_of_strength", [])],
            "growth_areas": [area for s in completed_sessions for area in s.get("areas_for_improvement", [])]
        },
        "session_patterns": {
            "preferred_environments": [s["environment_type"] for s in completed_sessions],
            "device_usage": [s["device_type"] for s in completed_sessions]
        }
    }

if __name__ == "__main__":
    print("🚀 Starting Smile Adventure Test Backend...")
    print("📋 Available at: http://localhost:8000")
    print("📖 API Docs: http://localhost:8000/docs")
    print("🧪 Integration testing mode enabled")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
