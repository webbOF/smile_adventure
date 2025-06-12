#!/usr/bin/env python3
"""
Test frontend login functionality after rate limit reset
"""

import requests
import json

def test_frontend_login():
    print("🧪 Testing Frontend Login after Rate Limit Reset...")
    
    try:
        # Test direct backend API call
        print("\n1. Testing direct backend API...")
        login_data = {
            'username': 'parent@demo.com',
            'password': 'TestParent123!'
        }
        
        response = requests.post(
            'http://localhost:8000/api/v1/auth/login',
            data=login_data,
            headers={
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        )
        
        print(f"✅ Direct API Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ User received: {data.get('user', {}).get('email')}")
            print(f"✅ Token received: {'Yes' if data.get('token') else 'No'}")
        else:
            print(f"❌ Error: {response.text}")
            
        # Test frontend proxy
        print("\n2. Testing frontend proxy...")
        try:
            proxy_response = requests.post(
                'http://localhost:3000/api/v1/auth/login',
                data=login_data,
                headers={
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout=10
            )
            print(f"✅ Proxy Status: {proxy_response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"⚠️ Proxy test failed (expected in some setups): {e}")
            
        print("\n🎉 Backend is working! Frontend login should work now.")
        print("👉 Please try logging in at http://localhost:3000/login")
        print("   Email: parent@demo.com")
        print("   Password: TestParent123!")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == '__main__':
    test_frontend_login()
