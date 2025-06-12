#!/usr/bin/env python3
"""
Debug della risposta di login del backend
"""
import requests
import json

print("🔍 DEBUG LOGIN RESPONSE STRUCTURE")
print("=" * 50)

try:
    # Test login call
    login_data = {
        'username': 'parent@demo.com',
        'password': 'TestParent123!'
    }
    
    response = requests.post(
        'http://localhost:8000/api/v1/auth/login',
        data=login_data,
        timeout=10
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    print(f"Response Body:")
    print(json.dumps(response.json(), indent=2))
    
except Exception as e:
    print(f"Error: {e}")
