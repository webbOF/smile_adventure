#!/usr/bin/env python3
"""
Simple login test to debug the issue
"""

import aiohttp
import asyncio

async def test_login():
    async with aiohttp.ClientSession() as session:
        # First register a user
        registration_data = {
            "email": "test@example.com",
            "password": "TestPassword123!",
            "password_confirm": "TestPassword123!",
            "first_name": "Test",
            "last_name": "User",
            "phone": "5555551234",
            "role": "parent"
        }
        
        print("1. Registering user...")
        async with session.post("http://localhost:8000/api/v1/auth/register", json=registration_data) as response:
            print(f"   Status: {response.status}")
            if response.status == 201:
                result = await response.json()
                user_id = result["user"]["id"]
                print(f"   User ID: {user_id}")
                
                # Verify email
                print("2. Verifying email...")
                async with session.post(f"http://localhost:8000/api/v1/auth/verify-email/{user_id}") as verify_response:
                    print(f"   Status: {verify_response.status}")
                    
                    if verify_response.status == 200:
                        # Try login with FormData
                        print("3. Testing login with FormData...")
                        data = aiohttp.FormData()
                        data.add_field('username', 'test@example.com')
                        data.add_field('password', 'TestPassword123!')
                        
                        try:
                            async with session.post("http://localhost:8000/api/v1/auth/login", data=data) as login_response:
                                print(f"   Status: {login_response.status}")
                                if login_response.status == 200:
                                    result = await login_response.json()
                                    print(f"   ✅ Login successful!")
                                    print(f"   Token: {result['token']['access_token'][:20]}...")
                                else:
                                    error_text = await login_response.text()
                                    print(f"   ❌ Login failed: {error_text}")
                        except Exception as e:
                            print(f"   ❌ Exception during login: {e}")

if __name__ == "__main__":
    asyncio.run(test_login())
