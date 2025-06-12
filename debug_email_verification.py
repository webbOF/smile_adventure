#!/usr/bin/env python3
"""
Test email verification bypass for testing
"""
import requests
import json
import time

def test_with_auto_verified_user():
    """Test with a user that should be auto-verified for testing"""
    print("🧪 TESTING AUTO-VERIFIED USER")
    print("=" * 50)
    
    # Try to create a test user with admin privileges or auto-verification
    test_data = {
        "email": f"admin.test.{int(time.time())}@test.com",
        "password": "TestPassword123!",
        "password_confirm": "TestPassword123!",
        "first_name": "Admin",
        "last_name": "Test",
        "role": "parent",
        "phone": "1234567890"
    }
    
    print(f"📧 Test email: {test_data['email']}")
    
    try:
        # Register user
        reg_response = requests.post(
            "http://localhost:8000/api/v1/auth/register",
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print(f"📊 Registration Status: {reg_response.status_code}")
        if reg_response.status_code == 201:
            reg_data = reg_response.json()
            user_id = reg_data.get('user', {}).get('id')
            print(f"✅ User created with ID: {user_id}")
            
            # Try to manually activate the user via direct API if possible
            # This simulates email verification
            activate_data = {"user_id": user_id, "is_active": True}
            
            # For testing, let's try login immediately to see the exact error
            form_data = {
                "username": test_data["email"],
                "password": test_data["password"]
            }
            
            login_response = requests.post(
                "http://localhost:8000/api/v1/auth/login",
                data=form_data,
                headers={'Content-Type': 'application/x-www-form-urlencoded'},
                timeout=10
            )
            
            print(f"📊 Login Status: {login_response.status_code}")
            print(f"📄 Login Response: {login_response.text}")
            
            if login_response.status_code == 401:
                error_data = login_response.json()
                if "verification" in error_data.get('error', {}).get('message', '').lower():
                    print("❌ Email verification required - this is blocking login")
                    return False
                else:
                    print("❌ Other authentication error")
                    return False
            elif login_response.status_code == 200:
                print("✅ Login successful!")
                return True
                
        return False
        
    except Exception as e:
        print(f"❌ Error testing auto-verified user: {e}")
        return False

def check_backend_verification_settings():
    """Check if backend has verification requirements"""
    print("\n🧪 CHECKING BACKEND VERIFICATION SETTINGS")
    print("=" * 50)
    
    try:
        # Try to find configuration endpoint
        config_response = requests.get(
            "http://localhost:8000/api/v1/config",
            timeout=5
        )
        
        if config_response.status_code == 200:
            config = config_response.json()
            print(f"📋 Backend Config: {config}")
            
            verification_required = config.get('email_verification_required', True)
            print(f"📧 Email Verification Required: {verification_required}")
            
            return not verification_required
        else:
            print("⚠️ Config endpoint not available")
            return False
            
    except Exception as e:
        print(f"⚠️ Could not check verification settings: {e}")
        return False

def test_login_with_existing_verified_user():
    """Test login with a known verified user"""
    print("\n🧪 TESTING WITH DEVELOPMENT USER")
    print("=" * 50)
    
    # Try common development/test credentials
    test_credentials = [
        {"username": "admin@test.com", "password": "admin123"},
        {"username": "test@test.com", "password": "test123"},
        {"username": "parent@test.com", "password": "parent123"},
        {"username": "admin@admin.com", "password": "admin"},
    ]
    
    for creds in test_credentials:
        try:
            print(f"🔍 Trying: {creds['username']}")
            
            login_response = requests.post(
                "http://localhost:8000/api/v1/auth/login",
                data=creds,
                headers={'Content-Type': 'application/x-www-form-urlencoded'},
                timeout=10
            )
            
            if login_response.status_code == 200:
                print(f"✅ Login successful with {creds['username']}")
                return True, creds
            else:
                print(f"❌ Failed: {login_response.status_code}")
                
        except Exception as e:
            print(f"❌ Error with {creds['username']}: {e}")
    
    return False, None

def main():
    print("🔍 EMAIL VERIFICATION DEBUG SUITE")
    print("=" * 60)
    
    # Check backend settings
    verification_disabled = check_backend_verification_settings()
    
    # Test with new user
    auto_verified_success = test_with_auto_verified_user()
    
    # Test with existing users
    existing_user_success, working_creds = test_login_with_existing_verified_user()
    
    print("\n🎯 EMAIL VERIFICATION DEBUG SUMMARY")
    print("=" * 60)
    print(f"Verification Disabled in Backend: {'✅' if verification_disabled else '❌'}")
    print(f"Auto-verified User Login: {'✅' if auto_verified_success else '❌'}")
    print(f"Existing User Login: {'✅' if existing_user_success else '❌'}")
    
    if existing_user_success:
        print(f"🔑 Working credentials: {working_creds['username']}")
    
    if not any([verification_disabled, auto_verified_success, existing_user_success]):
        print("\n⚠️ EMAIL VERIFICATION IS BLOCKING LOGIN")
        print("Solutions:")
        print("1. Disable email verification in backend for development")
        print("2. Implement email verification bypass for testing")
        print("3. Use mock email service for development")
    else:
        print("\n✅ Login pathway available")

if __name__ == "__main__":
    main()
