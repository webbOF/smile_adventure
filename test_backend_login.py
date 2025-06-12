#!/usr/bin/env python3
"""
Test backend login API directly
"""
import requests
import json

def test_backend_login():
    print('🔍 Testing Backend Login API')
    print('=' * 50)
    
    login_data = {
        'username': 'parent@demo.com',
        'password': 'TestParent123!'
    }
    
    try:
        response = requests.post(
            'http://localhost:8000/api/v1/auth/login',
            data=login_data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            timeout=10
        )
        
        print(f'Status Code: {response.status_code}')
        print(f'Response Headers: {dict(response.headers)}')
        
        if response.status_code == 200:
            data = response.json()
            print('✅ Login successful!')
            print(f'User ID: {data.get("user", {}).get("id", "Unknown")}')
            print(f'User Role: {data.get("user", {}).get("role", "Unknown")}')
            print(f'Token Structure Type: {type(data.get("token", {}))}')
            
            token_data = data.get("token", {})
            if isinstance(token_data, dict):
                print(f'Token Keys: {list(token_data.keys())}')
                print(f'Access Token Present: {"access_token" in token_data}')
                print(f'Refresh Token Present: {"refresh_token" in token_data}')
            else:
                print(f'Token Value: {str(token_data)[:50]}...')
                
        else:
            print(f'❌ Login failed: {response.text}')
            
    except Exception as e:
        print(f'💥 Error: {e}')

if __name__ == "__main__":
    test_backend_login()
