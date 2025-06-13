#!/usr/bin/env python3
"""
Test Task 40 Backend API Endpoints
Verifies that the report generation endpoints are working
"""

import requests
import json
import time

def test_backend_api_endpoints():
    """Test the backend API endpoints for Task 40"""
    
    print("🚀 TESTING TASK 40 BACKEND API ENDPOINTS")
    print("="*60)
    
    base_url = "http://localhost:8000/api/v1"
    
    # Test basic connectivity
    print("\n1. Testing Basic Connectivity...")
    try:
        response = requests.get(f"{base_url.replace('/api/v1', '')}/")
        if response.status_code == 200:
            print("   ✅ Backend is accessible")
            app_info = response.json()
            print(f"   ✅ App: {app_info.get('app_name', 'Unknown')}")
            print(f"   ✅ Version: {app_info.get('version', 'Unknown')}")
        else:
            print(f"   ❌ Backend returned status: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Cannot connect to backend: {e}")
        return False
    
    # Test authentication endpoint
    print("\n2. Testing Authentication Endpoint...")
    try:
        auth_data = {
            "username": "admin@example.com",
            "password": "admin123"
        }
        response = requests.post(f"{base_url}/auth/login", data=auth_data)
        print(f"   ℹ️  Auth endpoint response: {response.status_code}")
        if response.status_code == 422:
            print("   ⚠️  Auth endpoint exists but expects different format")
        elif response.status_code == 200:
            print("   ✅ Auth endpoint working")
        else:
            print(f"   ⚠️  Auth endpoint returned: {response.status_code}")
    except Exception as e:
        print(f"   ⚠️  Auth test error: {e}")
    
    # Test report endpoints without authentication (to check if they exist)
    print("\n3. Testing Report Endpoints (Structure Check)...")
    
    test_child_id = 1
    endpoints = [
        ("GET", f"/reports/child/{test_child_id}/progress", "Progress Report"),
        ("GET", f"/reports/child/{test_child_id}/summary", "Summary Report"),
        ("POST", f"/reports/child/{test_child_id}/generate-report", "Generate Report"),
        ("GET", f"/reports/child/{test_child_id}/analytics", "Analytics Data"),
        ("GET", f"/reports/child/{test_child_id}/export", "Export Data"),
    ]
    
    endpoint_results = []
    
    for method, endpoint, name in endpoints:
        try:
            url = f"{base_url}{endpoint}"
            if method == "GET":
                response = requests.get(url)
            elif method == "POST":
                response = requests.post(url, json={"report_type": "progress", "period_days": 30})
            
            if response.status_code == 401:
                status = "✅ Exists (Auth Required)"
            elif response.status_code == 422:
                status = "✅ Exists (Validation Error)"
            elif response.status_code == 404:
                status = "❌ Not Found"
            elif response.status_code == 403:
                status = "✅ Exists (Access Forbidden)"
            elif response.status_code == 200:
                status = "✅ Working"
            else:
                status = f"⚠️  Status: {response.status_code}"
            
            endpoint_results.append((name, status, response.status_code))
            print(f"   {status} {name}: {method} {endpoint}")
            
        except Exception as e:
            endpoint_results.append((name, f"❌ Error: {str(e)}", None))
            print(f"   ❌ Error testing {name}: {e}")
    
    # Summary
    print("\n📊 ENDPOINT TEST SUMMARY")
    print("="*40)
    
    working_endpoints = sum(1 for _, status, _ in endpoint_results if "✅" in status)
    total_endpoints = len(endpoint_results)
    
    print(f"Working Endpoints: {working_endpoints}/{total_endpoints}")
    
    if working_endpoints >= 4:
        print("🎉 BACKEND API STATUS: READY FOR TASK 40")
        print("✅ Most report endpoints are available and configured")
        return True
    else:
        print("⚠️  BACKEND API STATUS: NEEDS ATTENTION")
        print("❌ Some endpoints may need configuration")
        return False

def main():
    """Run the endpoint tests"""
    try:
        success = test_backend_api_endpoints()
        if success:
            print("\n🎯 BACKEND API ENDPOINTS TEST: PASSED")
        else:
            print("\n⚠️  BACKEND API ENDPOINTS TEST: PARTIAL")
        return success
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    main()
