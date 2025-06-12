#!/usr/bin/env python3
"""
Debug authentication issues found in functional testing
"""
import requests
import json
import time

def test_registration_api():
    """Test registration API directly"""
    print("🧪 TESTING REGISTRATION API DIRECTLY")
    print("=" * 50)
    
    test_data = {
        "email": f"debug.test.{int(time.time())}@test.com",
        "password": "TestPassword123!",
        "password_confirm": "TestPassword123!",
        "first_name": "Debug",
        "last_name": "Test",
        "role": "parent",
        "phone": "1234567890"
    }
    
    print(f"📧 Test email: {test_data['email']}")
    
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/auth/register",
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📋 Response Headers: {dict(response.headers)}")
        print(f"📄 Response Content: {response.text}")
        
        if response.status_code == 201:
            print("✅ Registration API works correctly")
            return True, test_data
        else:
            print("❌ Registration API failed")
            return False, test_data
            
    except Exception as e:
        print(f"❌ Error testing registration API: {e}")
        return False, test_data

def test_login_api(test_data):
    """Test login API directly"""
    print("\n🧪 TESTING LOGIN API DIRECTLY")
    print("=" * 50)
    
    # Test with form data (as expected by FastAPI OAuth2)
    form_data = {
        "username": test_data["email"],
        "password": test_data["password"]
    }
    
    print(f"📧 Login email: {form_data['username']}")
    
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/auth/login",
            data=form_data,  # Use form data, not JSON
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            timeout=10
        )
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📋 Response Headers: {dict(response.headers)}")
        print(f"📄 Response Content: {response.text}")
        
        if response.status_code == 200:
            print("✅ Login API works correctly")
            return True
        else:
            print("❌ Login API failed")
            return False
            
    except Exception as e:
        print(f"❌ Error testing login API: {e}")
        return False

def check_frontend_auth_service():
    """Check frontend auth service implementation"""
    print("\n🧪 CHECKING FRONTEND AUTH SERVICE")
    print("=" * 50)
    
    auth_service_file = "frontend/src/services/authService.js"
    
    try:
        with open(auth_service_file, 'r') as f:
            content = f.read()
            
        # Check for correct API endpoints
        issues = []
        
        if 'application/x-www-form-urlencoded' not in content:
            issues.append("Missing form-urlencoded content type for login")
            
        if 'FormData' not in content and 'URLSearchParams' not in content:
            issues.append("Login might not be using form data")
            
        if '/api/v1/' not in content:
            issues.append("API endpoint version mismatch")
            
        if issues:
            print("❌ Frontend Auth Service Issues Found:")
            for issue in issues:
                print(f"   - {issue}")
            return False
        else:
            print("✅ Frontend Auth Service looks correct")
            return True
            
    except Exception as e:
        print(f"❌ Error checking frontend auth service: {e}")
        return False

def check_cors_settings():
    """Check CORS settings in backend"""
    print("\n🧪 CHECKING CORS SETTINGS")
    print("=" * 50)
    
    try:
        # Test preflight request
        response = requests.options(
            "http://localhost:8000/api/v1/auth/register",
            headers={
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            },
            timeout=5
        )
        
        print(f"📊 Preflight Status: {response.status_code}")
        cors_headers = {k: v for k, v in response.headers.items() if 'access-control' in k.lower()}
        print(f"📋 CORS Headers: {cors_headers}")
        
        if response.status_code == 200 and 'access-control-allow-origin' in cors_headers:
            print("✅ CORS configured correctly")
            return True
        else:
            print("❌ CORS issues detected")
            return False
            
    except Exception as e:
        print(f"❌ Error checking CORS: {e}")
        return False

def main():
    print("🔍 AUTHENTICATION DEBUG SUITE")
    print("=" * 60)
    
    # Test backend APIs directly
    reg_success, test_data = test_registration_api()
    
    if reg_success:
        login_success = test_login_api(test_data)
    else:
        login_success = False
    
    # Check frontend implementation
    frontend_ok = check_frontend_auth_service()
    
    # Check CORS
    cors_ok = check_cors_settings()
    
    print("\n🎯 AUTHENTICATION DEBUG SUMMARY")
    print("=" * 60)
    print(f"Registration API: {'✅' if reg_success else '❌'}")
    print(f"Login API: {'✅' if login_success else '❌'}")
    print(f"Frontend Auth Service: {'✅' if frontend_ok else '❌'}")
    print(f"CORS Configuration: {'✅' if cors_ok else '❌'}")
    
    if all([reg_success, login_success, frontend_ok, cors_ok]):
        print("\n🎉 All authentication components working correctly!")
        print("The issue might be in the frontend form handling or validation")
    else:
        print("\n⚠️ Authentication issues found - see details above")
    
if __name__ == "__main__":
    main()
