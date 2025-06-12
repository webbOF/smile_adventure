#!/usr/bin/env python3
"""
Test dettagliato della chiamata API di registrazione
"""
import requests
import json
import time

def test_registration_api():
    """Test diretto dell'API di registrazione"""
    print("🧪 TEST API REGISTRAZIONE DIRETTA")
    print("=" * 50)
    
    # Dati di test
    registration_data = {
        "email": f"test.api.{int(time.time())}@example.com",
        "password": "TestPassword123!",
        "confirmPassword": "TestPassword123!",
        "firstName": "Test",
        "lastName": "User",
        "role": "parent"
    }
    
    print(f"📧 Email di test: {registration_data['email']}")
    
    try:
        # Test chiamata diretta all'API
        response = requests.post(
            "http://localhost:8000/api/v1/auth/register",
            json=registration_data,
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            timeout=10
        )
        
        print(f"📍 Status Code: {response.status_code}")
        print(f"📋 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 201:
            response_data = response.json()
            print("✅ Registrazione API riuscita!")
            print(f"📄 Response: {json.dumps(response_data, indent=2)}")
            
            # Verifica presenza token
            if "token" in response_data and "access_token" in response_data["token"]:
                print("✅ Token presente nella risposta")
                
                # Test del token con una chiamata protetta
                token = response_data["token"]["access_token"]
                auth_response = requests.get(
                    "http://localhost:8000/api/v1/auth/me",
                    headers={"Authorization": f"Bearer {token}"},
                    timeout=5
                )
                
                if auth_response.status_code == 200:
                    print("✅ Token valido - autenticazione riuscita")
                    print(f"👤 User data: {json.dumps(auth_response.json(), indent=2)}")
                else:
                    print(f"❌ Token non valido: {auth_response.status_code}")
                    print(f"❌ Error: {auth_response.text}")
            else:
                print("❌ Token mancante nella risposta")
                
        else:
            print(f"❌ Registrazione fallita: {response.status_code}")
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Errore durante test: {e}")

def test_frontend_backend_communication():
    """Test della comunicazione frontend-backend"""
    print("\n🔗 TEST COMUNICAZIONE FRONTEND-BACKEND")
    print("=" * 50)
    
    try:
        # Test health check
        health_response = requests.get("http://localhost:8000/health", timeout=5)
        print(f"✅ Backend health: {health_response.status_code}")
        
        frontend_response = requests.get("http://localhost:3000", timeout=5)
        print(f"✅ Frontend health: {frontend_response.status_code}")
        
        # Test CORS headers
        cors_response = requests.options(
            "http://localhost:8000/api/v1/auth/register",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type"
            }
        )
        
        print(f"🔀 CORS preflight: {cors_response.status_code}")
        print(f"🔀 CORS headers: {dict(cors_response.headers)}")
        
    except Exception as e:
        print(f"❌ Errore comunicazione: {e}")

if __name__ == "__main__":
    test_registration_api()
    test_frontend_backend_communication()
