#!/usr/bin/env python3
"""
Test Backend API Endpoints for Task 40 Integration
Tests actual REST API endpoints to verify they work with the frontend
"""

import requests
import json
import time

# Test configuration
BASE_URL = "http://localhost:8000/api/v1"
TEST_CHILD_ID = 1

def test_backend_endpoints():
    """Test the actual backend endpoints that Task 40 frontend will use"""
    
    print("🚀 TESTING BACKEND API ENDPOINTS FOR TASK 40")
    print("=" * 60)
    
    # Test authentication first
    print("\n1. Testing Authentication...")
    auth_response = test_auth()
    if not auth_response:
        print("❌ Authentication failed - cannot proceed with protected endpoints")
        return False
    
    headers = {"Authorization": f"Bearer {auth_response['access_token']}"}
    
    # Test endpoints that Task 40 frontend uses
    endpoints_to_test = [
        {
            "name": "Generate Progress Report",
            "method": "POST",
            "url": f"{BASE_URL}/reports/child/{TEST_CHILD_ID}/generate-report",
            "data": {
                "report_type": "progress",
                "period_days": 30,
                "include_recommendations": True,
                "include_analytics": True
            }
        },
        {
            "name": "Generate Summary Report", 
            "method": "POST",
            "url": f"{BASE_URL}/reports/child/{TEST_CHILD_ID}/generate-report",
            "data": {
                "report_type": "summary",
                "period_days": 30,
                "include_recommendations": True,
                "include_analytics": True
            }
        },
        {
            "name": "Generate Professional Report",
            "method": "POST", 
            "url": f"{BASE_URL}/reports/child/{TEST_CHILD_ID}/generate-report",
            "data": {
                "report_type": "clinical",
                "period_days": 90,
                "include_recommendations": True,
                "include_analytics": True
            }
        },
        {
            "name": "Get Child Analytics",
            "method": "GET",
            "url": f"{BASE_URL}/reports/child/{TEST_CHILD_ID}/analytics",
            "params": {
                "period_days": 30,
                "include_predictive": False
            }
        },
        {
            "name": "Export Child Data (JSON)",
            "method": "GET",
            "url": f"{BASE_URL}/reports/child/{TEST_CHILD_ID}/export",
            "params": {
                "format": "json",
                "include_analytics": True,
                "include_reports": True
            }
        },
        {
            "name": "Export Child Data (CSV)",
            "method": "GET", 
            "url": f"{BASE_URL}/reports/child/{TEST_CHILD_ID}/export",
            "params": {
                "format": "csv",
                "include_analytics": True,
                "include_reports": True
            }
        },
        {
            "name": "Get Available Children",
            "method": "GET",
            "url": f"{BASE_URL}/users/children"
        },
        {
            "name": "Get Current User",
            "method": "GET",
            "url": f"{BASE_URL}/auth/me"
        }
    ]
    
    results = []
    
    for i, endpoint in enumerate(endpoints_to_test, 2):
        print(f"\n{i}. Testing {endpoint['name']}...")
        
        try:
            if endpoint["method"] == "POST":
                response = requests.post(
                    endpoint["url"], 
                    json=endpoint.get("data"),
                    headers=headers,
                    timeout=10
                )
            else:  # GET
                response = requests.get(
                    endpoint["url"],
                    params=endpoint.get("params"),
                    headers=headers,
                    timeout=10
                )
            
            status = "✅ PASS" if response.status_code in [200, 201] else "❌ FAIL"
            print(f"   {status} - Status: {response.status_code}")
            
            if response.status_code in [200, 201]:
                try:
                    data = response.json()
                    print(f"   📄 Response type: {type(data).__name__}")
                    if isinstance(data, dict):
                        print(f"   🗝️  Keys: {list(data.keys())[:5]}...")
                    elif isinstance(data, list):
                        print(f"   📊 Items: {len(data)}")
                except:
                    print(f"   📄 Response type: {response.headers.get('content-type', 'unknown')}")
            else:
                print(f"   ❌ Error: {response.text[:100]}...")
            
            results.append({
                "endpoint": endpoint["name"],
                "status_code": response.status_code,
                "success": response.status_code in [200, 201]
            })
            
        except requests.exceptions.RequestException as e:
            print(f"   ❌ FAIL - Connection Error: {str(e)}")
            results.append({
                "endpoint": endpoint["name"],
                "status_code": 0,
                "success": False,
                "error": str(e)
            })
        
        time.sleep(0.5)  # Rate limiting
    
    # Print summary
    print(f"\n{'='*60}")
    print("📊 ENDPOINT TEST SUMMARY")
    print(f"{'='*60}")
    
    total_tests = len(results)
    passed_tests = sum(1 for r in results if r["success"])
    
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {total_tests - passed_tests}")
    print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
    
    if passed_tests == total_tests:
        print("\n🎉 ALL ENDPOINTS WORKING! Task 40 frontend can communicate with backend!")
    else:
        print(f"\n⚠️  {total_tests - passed_tests} endpoints need attention")
        
        print("\n❌ Failed Endpoints:")
        for result in results:
            if not result["success"]:
                print(f"   - {result['endpoint']}: {result.get('error', f'Status {result['status_code']}')}")
    
    return passed_tests == total_tests

def test_auth():
    """Test authentication to get access token"""
    try:
        # Try to login with demo credentials
        response = requests.post(f"{BASE_URL}/auth/login", 
            json={
                "email": "professional@demo.com",
                "password": "demo123"
            },
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            print("   ✅ Authentication successful")
            return data
        else:
            print(f"   ❌ Authentication failed: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"   ❌ Authentication error: {str(e)}")
        return None

if __name__ == "__main__":
    success = test_backend_endpoints()
    exit(0 if success else 1)
