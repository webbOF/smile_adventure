#!/usr/bin/env python3
"""
Test completo di verifica delle API del Task 17 (file api.py)
Verifica che tutte le route definite nel file api.py siano effettivamente connesse e funzionanti
"""

import requests
import json
import time
from datetime import datetime

BACKEND_URL = "http://localhost:8000"

def test_api_v1_endpoints():
    """Testa tutti gli endpoint definiti nel file api.py"""
    
    test_results = {
        "timestamp": datetime.now().isoformat(),
        "backend_url": BACKEND_URL,
        "endpoints_tested": {},
        "summary": {}
    }
    
    # Endpoint definiti nel file api.py (Task 17)
    api_v1_endpoints = {
        # Root API Info endpoints
        "api_info": {
            "endpoint": "/api/v1/",
            "method": "GET",
            "description": "API v1 information endpoint",
            "expected_status": 200
        },
        "health_check": {
            "endpoint": "/api/v1/health",
            "method": "GET", 
            "description": "API v1 health check endpoint",
            "expected_status": 200
        },
        "endpoints_list": {
            "endpoint": "/api/v1/endpoints",
            "method": "GET",
            "description": "List all available endpoints in v1 API",
            "expected_status": 200
        },
        
        # Auth endpoints (require v1 routing from api.py)
        "auth_register": {
            "endpoint": "/api/v1/auth/register",
            "method": "POST",
            "description": "Register new user account",
            "expected_status": 422,  # Validation error with empty data
            "test_data": {}
        },
        "auth_login": {
            "endpoint": "/api/v1/auth/login",
            "method": "POST", 
            "description": "User login with credentials",
            "expected_status": 422,  # Validation error with empty data
            "test_data": {}
        },
        "auth_me": {
            "endpoint": "/api/v1/auth/me",
            "method": "GET",
            "description": "Get current user profile",
            "expected_status": 401  # Unauthorized without token
        },
        
        # Users endpoints (require v1 routing from api.py)
        "users_dashboard": {
            "endpoint": "/api/v1/users/dashboard",
            "method": "GET",
            "description": "Get user dashboard",
            "expected_status": 401  # Unauthorized without token
        },
        "users_profile": {
            "endpoint": "/api/v1/users/profile",
            "method": "GET",
            "description": "Get detailed user profile", 
            "expected_status": 401  # Unauthorized without token
        },
        "users_children": {
            "endpoint": "/api/v1/users/children",
            "method": "GET",
            "description": "Get user's children list",
            "expected_status": 401  # Unauthorized without token
        },
        
        # Reports endpoints (require v1 routing from api.py)
        "reports_dashboard": {
            "endpoint": "/api/v1/reports/dashboard",
            "method": "GET",
            "description": "Get reports dashboard",
            "expected_status": 401  # Unauthorized without token
        },
        
        # Professional endpoints (require v1 routing from api.py)
        "professional_profile": {
            "endpoint": "/api/v1/professional/professional-profile",
            "method": "GET",
            "description": "Get professional profile",
            "expected_status": 401  # Unauthorized without token
        }
    }
    
    print("=== TESTING API V1 ENDPOINTS FROM api.py (TASK 17) ===")
    print(f"Testing {len(api_v1_endpoints)} endpoints...")
    print()
    
    successful_tests = 0
    failed_tests = 0
    
    for test_name, test_config in api_v1_endpoints.items():
        endpoint = test_config["endpoint"] 
        method = test_config["method"]
        description = test_config["description"]
        expected_status = test_config["expected_status"]
        test_data = test_config.get("test_data")
        
        try:
            url = f"{BACKEND_URL}{endpoint}"
            
            # Make request
            if method == "POST" and test_data is not None:
                response = requests.post(url, json=test_data, timeout=5)
            elif method == "GET":
                response = requests.get(url, timeout=5)
            else:
                response = requests.request(method, url, timeout=5)
            
            # Check status
            status_ok = response.status_code == expected_status
            
            if status_ok:
                print(f"✅ {test_name}: {method} {endpoint}")
                print(f"   📝 {description}")
                print(f"   📊 Status: {response.status_code} (Expected: {expected_status})")
                successful_tests += 1
                
                # For successful GET requests, show some response data
                if method == "GET" and response.status_code == 200:
                    try:
                        data = response.json()
                        if "api_version" in data:
                            print(f"   📄 API Version: {data.get('api_version')}")
                        if "status" in data:
                            print(f"   📄 Status: {data.get('status')}")
                    except:
                        pass
                        
            else:
                print(f"❌ {test_name}: {method} {endpoint}")
                print(f"   📝 {description}")
                print(f"   📊 Status: {response.status_code} (Expected: {expected_status})")
                failed_tests += 1
            
            # Store result
            test_results["endpoints_tested"][test_name] = {
                "endpoint": endpoint,
                "method": method,
                "description": description,
                "expected_status": expected_status,
                "actual_status": response.status_code,
                "success": status_ok,
                "response_time_ms": None  # Could add timing if needed
            }
                
        except requests.exceptions.RequestException as e:
            print(f"❌ {test_name}: {method} {endpoint}")
            print(f"   📝 {description}")
            print(f"   💥 Error: {e}")
            failed_tests += 1
            
            test_results["endpoints_tested"][test_name] = {
                "endpoint": endpoint,
                "method": method, 
                "description": description,
                "expected_status": expected_status,
                "actual_status": None,
                "success": False,
                "error": str(e)
            }
        
        print()
    
    # Summary
    total_tests = successful_tests + failed_tests
    success_rate = (successful_tests / total_tests) * 100 if total_tests > 0 else 0
    
    test_results["summary"] = {
        "total_tests": total_tests,
        "successful_tests": successful_tests,
        "failed_tests": failed_tests,
        "success_rate": success_rate
    }
    
    print("=" * 60)
    print("TASK 17 API VERIFICATION SUMMARY")
    print("=" * 60)
    print(f"Total endpoints tested: {total_tests}")
    print(f"Successful tests: {successful_tests}")
    print(f"Failed tests: {failed_tests}")
    print(f"Success rate: {success_rate:.1f}%")
    
    if success_rate >= 90:
        print("✅ TASK 17 STATUS: FULLY IMPLEMENTED")
    elif success_rate >= 70:
        print("⚠️  TASK 17 STATUS: MOSTLY IMPLEMENTED")
    else:
        print("❌ TASK 17 STATUS: NEEDS COMPLETION")
    
    # Save detailed report
    with open('task17_api_verification_report.json', 'w', encoding='utf-8') as f:
        json.dump(test_results, f, indent=2, ensure_ascii=False)
    
    print(f"\n📄 Detailed report saved to: task17_api_verification_report.json")
    
    return test_results

def verify_api_routing():
    """Verifica che il routing API sia configurato correttamente"""
    print("\n=== VERIFYING API ROUTING CONFIGURATION ===")
    
    # Test che non ci siano doppi prefissi
    endpoints_to_check = [
        ("/api/v1/", "Should work - correct v1 routing"),
        ("/api/v1/v1/", "Should NOT work - double prefix"),
        ("/api/v1/auth/login", "Should work - auth endpoint"),
        ("/api/v1/v1/auth/login", "Should NOT work - double prefix")
    ]
    
    for endpoint, description in endpoints_to_check:
        try:
            url = f"{BACKEND_URL}{endpoint}"
            response = requests.get(url, timeout=5)
            
            if "Should work" in description:
                if response.status_code in [200, 401, 422]:  # Valid responses
                    print(f"✅ {endpoint} - {description}")
                else:
                    print(f"❌ {endpoint} - {description} (Status: {response.status_code})")
            else:  # Should NOT work
                if response.status_code == 404:
                    print(f"✅ {endpoint} - {description} (Correctly returns 404)")
                else:
                    print(f"❌ {endpoint} - {description} (Should return 404, got: {response.status_code})")
                    
        except requests.exceptions.RequestException as e:
            if "Should NOT work" in description:
                print(f"✅ {endpoint} - {description} (Connection error as expected)")
            else:
                print(f"❌ {endpoint} - {description} (Error: {e})")

def main():
    print("🚀 STARTING TASK 17 API VERIFICATION")
    print("Verifying that all APIs from api.py are properly connected")
    print("=" * 60)
    
    # Check if backend is running
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running")
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to backend: {e}")
        print("Please start the backend first: cd backend && python -m uvicorn main:app --reload")
        return
    
    # Run tests
    test_results = test_api_v1_endpoints()
    verify_api_routing()
    
    return test_results

if __name__ == "__main__":
    main()
