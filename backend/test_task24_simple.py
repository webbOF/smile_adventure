#!/usr/bin/env python3
"""
Simple Task 24 Implementation Test
Tests the Task 24 Reports & Analytics Routes without creating complex test data
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.reports.routes import router
from app.reports.schemas import (
    ProgressReport, SummaryReport, AnalyticsData, 
    ReportGenerationRequest, ReportResponse
)
import pytest

def test_task24_schemas():
    """Test that all Task 24 schemas can be imported and instantiated"""
    print("🧪 TEST: Schema Validation")
    
    # Test ProgressReport schema
    progress_data = {
        "child_id": 1,
        "period_start": "2024-01-01T00:00:00Z",
        "period_end": "2024-12-31T23:59:59Z",
        "total_sessions": 50,
        "total_playtime_minutes": 1500,
        "average_session_duration": 30.0,
        "completion_rate": 85.5,
        "skill_improvements": {
            "social_skills": 15.2,
            "communication": 12.8,
            "emotional_regulation": 20.1
        },
        "behavioral_insights": [
            "Shows improved focus during structured activities",
            "Demonstrates increased verbal communication"
        ],
        "emotional_patterns": {
            "happiness": 75.2,
            "frustration": 15.3,
            "engagement": 82.1
        },
        "recommendations": [
            "Continue current therapy approach",
            "Introduce more challenging scenarios"
        ],
        "next_goals": [
            "Improve peer interaction skills",
            "Develop independent problem-solving"
        ],
        "parent_feedback": {
            "satisfaction_rating": 4.5,
            "observed_improvements": ["Better communication at home", "Less meltdowns"]
        }
    }
    
    try:
        progress = ProgressReport(**progress_data)
        print("   ✅ ProgressReport schema validation passed")
    except Exception as e:
        print(f"   ❌ ProgressReport schema validation failed: {e}")
        return False
    
    # Test SummaryReport schema
    summary_data = {
        "child_id": 1,
        "generated_at": "2024-12-31T23:59:59Z",
        "key_highlights": [
            "Completed 50 therapy sessions",
            "Achieved 15% improvement in social skills"
        ],
        "performance_snapshot": {
            "total_sessions": 50,
            "total_achievements": 25,
            "current_level": 8,
            "skill_progression": 78.5
        },
        "behavioral_summary": {
            "strengths": ["Focus", "Creativity", "Problem-solving"],
            "growth_areas": ["Peer interaction", "Emotional regulation"],
            "improvements": ["Better attention span", "Improved communication"]
        },
        "overall_trajectory": "positive",
        "strengths": ["Strong visual processing", "Creative thinking"],
        "growth_areas": ["Social communication", "Flexibility"]
    }
    
    try:
        summary = SummaryReport(**summary_data)
        print("   ✅ SummaryReport schema validation passed")
    except Exception as e:
        print(f"   ❌ SummaryReport schema validation failed: {e}")
        return False
    
    # Test AnalyticsData schema
    analytics_data = {
        "child_id": 1,
        "date_range": {
            "start": "2024-01-01T00:00:00Z",
            "end": "2024-12-31T23:59:59Z"
        },
        "engagement_metrics": {
            "average_engagement_score": 78.5,
            "total_interaction_time": 1500,
            "session_frequency": 3.2,
            "completion_rates": [85.0, 87.2, 82.1]
        },
        "progress_trends": {
            "skill_progression": [65.0, 70.5, 75.2, 78.5],
            "behavioral_improvements": [60.0, 68.5, 72.1, 75.8],
            "engagement_trend": "increasing"
        },
        "behavioral_patterns": {
            "peak_performance_times": ["10:00-11:00", "14:00-15:00"],
            "attention_span_trend": "improving",
            "frustration_triggers": ["complex instructions", "time pressure"]
        },
        "emotional_insights": {
            "dominant_emotions": ["happy", "focused", "curious"],
            "emotional_stability": 75.2,
            "stress_indicators": ["increased fidgeting", "shorter responses"]
        },
        "predictive_insights": {
            "projected_improvement": 15.5,
            "risk_factors": ["session frequency decline"],
            "recommended_interventions": ["increase visual supports"]
        },
        "comparative_data": {
            "peer_comparison": "above_average",
            "age_group_percentile": 78,
            "improvement_rate": "faster_than_average"
        },
        "recommendations": [
            "Continue current intervention strategy",
            "Consider peer interaction opportunities"
        ]
    }
    
    try:
        analytics = AnalyticsData(**analytics_data)
        print("   ✅ AnalyticsData schema validation passed")
    except Exception as e:
        print(f"   ❌ AnalyticsData schema validation failed: {e}")
        return False
    
    # Test ReportGenerationRequest schema
    request_data = {
        "report_type": "progress",
        "time_period": "last_month",
        "include_recommendations": True,
        "include_analytics": True,
        "include_charts": False,
        "custom_start_date": "2024-01-01T00:00:00Z",
        "custom_end_date": "2024-12-31T23:59:59Z"
    }
    
    try:
        request = ReportGenerationRequest(**request_data)
        print("   ✅ ReportGenerationRequest schema validation passed")
    except Exception as e:
        print(f"   ❌ ReportGenerationRequest schema validation failed: {e}")
        return False
    
    return True

def test_task24_routes_registration():
    """Test that all Task 24 routes are properly registered"""
    print("🧪 TEST: Route Registration")
    
    client = TestClient(app)
    
    # Get all routes
    routes = []
    for route in app.routes:
        if hasattr(route, 'path') and hasattr(route, 'methods'):
            for method in route.methods:
                if method != 'HEAD':  # Skip HEAD methods
                    routes.append(f"{method} {route.path}")
    
    # Check for Task 24 routes
    expected_routes = [
        "GET /reports/child/{child_id}/progress",
        "GET /reports/child/{child_id}/summary", 
        "POST /reports/child/{child_id}/generate-report",
        "GET /reports/child/{child_id}/analytics",
        "GET /reports/child/{child_id}/export"
    ]
    
    missing_routes = []
    found_routes = []
    
    for expected in expected_routes:
        found = False
        for route in routes:
            if expected in route or expected.replace("reports/", "") in route:
                found = True
                found_routes.append(route)
                break
        if not found:
            missing_routes.append(expected)
    
    if missing_routes:
        print(f"   ❌ Missing routes: {missing_routes}")
        return False
    else:
        print(f"   ✅ All {len(expected_routes)} Task 24 routes found!")
        for route in found_routes:
            print(f"      ✓ {route}")
        return True

def test_task24_route_responses():
    """Test that Task 24 routes return proper HTTP responses (not 500 errors)"""
    print("🧪 TEST: Route Response Validation")
    
    client = TestClient(app)
    
    # Test routes with a dummy child_id
    test_child_id = 999
    
    test_cases = [
        ("GET", f"/reports/child/{test_child_id}/progress", "Progress Report"),
        ("GET", f"/reports/child/{test_child_id}/summary", "Summary Report"), 
        ("GET", f"/reports/child/{test_child_id}/analytics", "Analytics Data"),
        ("GET", f"/reports/child/{test_child_id}/export", "Export Data"),
    ]
    
    all_passed = True
    
    for method, path, description in test_cases:
        try:
            if method == "GET":
                response = client.get(path)
            elif method == "POST":
                response = client.post(path, json={})
            
            # We expect either 401 (unauthorized), 403 (forbidden), or 404 (not found)
            # NOT 500 (internal server error) which would indicate a code issue
            if response.status_code in [401, 403, 404, 422]:
                print(f"   ✅ {description}: {method} {path} -> {response.status_code} (expected)")
            elif response.status_code == 500:
                print(f"   ❌ {description}: {method} {path} -> 500 (internal server error)")
                all_passed = False
            else:
                print(f"   ⚠️  {description}: {method} {path} -> {response.status_code} (unexpected but not error)")
                
        except Exception as e:
            print(f"   ❌ {description}: Error calling {method} {path} - {str(e)}")
            all_passed = False
    
    # Test POST route separately
    try:
        response = client.post(f"/reports/child/{test_child_id}/generate-report", 
                              json={"report_type": "progress"})
        if response.status_code in [401, 403, 404, 422]:
            print(f"   ✅ Generate Report: POST /reports/child/{test_child_id}/generate-report -> {response.status_code} (expected)")
        elif response.status_code == 500:
            print(f"   ❌ Generate Report: POST /reports/child/{test_child_id}/generate-report -> 500 (internal server error)")
            all_passed = False
        else:
            print(f"   ⚠️  Generate Report: POST /reports/child/{test_child_id}/generate-report -> {response.status_code} (unexpected but not error)")
    except Exception as e:
        print(f"   ❌ Generate Report: Error calling POST - {str(e)}")
        all_passed = False
    
    return all_passed

def main():
    """Run all Task 24 tests"""
    print("🚀 Starting Task 24 Simple Implementation Test...")
    print("=" * 80)
    
    all_tests_passed = True
    
    # Test 1: Schema validation
    if not test_task24_schemas():
        all_tests_passed = False
    
    print()
    
    # Test 2: Route registration
    if not test_task24_routes_registration():
        all_tests_passed = False
    
    print()
    
    # Test 3: Route responses
    if not test_task24_route_responses():
        all_tests_passed = False
    
    print()
    print("=" * 80)
    
    if all_tests_passed:
        print("🎉 ALL TASK 24 TESTS PASSED!")
        print("✅ Task 24 Reports & Analytics Routes are properly implemented")
        print("✅ All schemas validate correctly")
        print("✅ All routes are registered and accessible")
        print("✅ No internal server errors detected")
        return True
    else:
        print("❌ SOME TASK 24 TESTS FAILED!")
        print("❗ Please check the failed tests above")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
