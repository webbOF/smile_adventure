#!/usr/bin/env python3
"""
Test completo di login con Docker
"""
import requests
import json

print("🐳 TESTING DOCKER ENVIRONMENT")
print("=" * 50)

# Test che il backend sia raggiungibile
try:
    health_response = requests.get('http://localhost:8000/api/v1/health', timeout=5)
    print(f"✅ Backend health: {health_response.status_code}")
    print(f"   Response: {health_response.json()}")
except Exception as e:
    print(f"❌ Backend non raggiungibile: {e}")
    exit(1)

# Test login con utenti esistenti
test_users = [
    {
        'email': 'parent@demo.com',
        'password': 'TestParent123!',
        'role': 'parent'
    },
    {
        'email': 'dentist@demo.com',
        'password': 'TestDentist123!', 
        'role': 'professional'
    }
]

print(f"\n🔐 TESTING LOGIN")
print("=" * 30)

working_users = []

for user in test_users:
    try:
        print(f"📝 Testing login: {user['email']}")
        
        # Test login
        login_data = {
            'username': user['email'],
            'password': user['password']
        }
        
        login_response = requests.post(
            'http://localhost:8000/api/v1/auth/login',
            data=login_data,
            timeout=10
        )
        
        if login_response.status_code == 200:
            result = login_response.json()
            print(f"✅ Login successful: {user['email']}")
            print(f"   Token received: {result.get('access_token', 'No token')[:20]}...")
            print(f"   User role: {result.get('user', {}).get('role', 'Unknown')}")
            working_users.append(user)
        else:
            print(f"❌ Login failed: {login_response.status_code}")
            print(f"   Error: {login_response.text}")
            
    except Exception as e:
        print(f"💥 Error: {e}")

print(f"\n🎯 RISULTATI FINALI")
print("=" * 30)

if working_users:
    print(f"✅ {len(working_users)} utenti funzionanti:")
    for user in working_users:
        print(f"   • {user['email']} ({user['role']})")
    
    print(f"\n🌐 ACCESSO ALLA DASHBOARD:")
    print("=" * 35)
    print("1. 🚀 Apri browser: http://localhost:3000")
    print("2. 🔐 Clicca 'Accedi'")
    print("3. 📝 Usa le credenziali:")
    print(f"     📧 Email: {working_users[0]['email']}")
    print(f"     🔑 Password: {working_users[0]['password']}")
    print("4. 🎉 Dovresti vedere la dashboard!")
    
else:
    print("❌ Nessun utente funzionante trovato")

print(f"\n🐳 Docker Services Status:")
print("🔸 Frontend: http://localhost:3000")
print("🔸 Backend: http://localhost:8000") 
print("🔸 PgAdmin: http://localhost:5050")
print("🔸 Database: localhost:5432")
