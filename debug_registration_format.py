#!/usr/bin/env python3
"""
Test per verificare cosa sta inviando il frontend vs cosa si aspetta il backend
"""
import requests
import json

def test_backend_expectations():
    """Test different data formats to see what backend expects"""
    
    print("🧪 TESTANDO FORMATO DATI BACKEND")
    print("=" * 50)
    
    # Test data as used by direct backend test (working)
    working_data = {
        "email": "test.working@test.com",
        "password": "TestPassword123!",
        "password_confirm": "TestPassword123!",
        "first_name": "Test",
        "last_name": "User",
        "role": "parent",
        "phone": "1234567890"
    }
    
    # Test data as sent by frontend (failing)
    frontend_data = {
        "email": "test.frontend@test.com",
        "password": "TestPassword123!",
        "first_name": "Mario",
        "last_name": "Rossi",
        "role": "parent",
        "phone": "5555551234"
        # Note: password_confirm is removed by authService
    }
    
    print("\n✅ Test 1: Formato che funziona (backend diretto)")
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/auth/register",
            json=working_data,
            timeout=10
        )
        print(f"   Status: {response.status_code}")
        if response.status_code == 201:
            print("   ✅ SUCCESSO")
        else:
            print(f"   ❌ ERRORE: {response.text}")
    except Exception as e:
        print(f"   ❌ ECCEZIONE: {e}")
    
    print("\n❌ Test 2: Formato frontend (senza password_confirm)")
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/auth/register",
            json=frontend_data,
            timeout=10
        )
        print(f"   Status: {response.status_code}")
        if response.status_code == 201:
            print("   ✅ SUCCESSO")
        else:
            print(f"   ❌ ERRORE: {response.text}")
    except Exception as e:
        print(f"   ❌ ECCEZIONE: {e}")
    
    print("\n🔍 Test 3: Verifica schema backend")
    try:
        response = requests.get("http://localhost:8000/docs", timeout=5)
        if response.status_code == 200:
            print("   ✅ API docs disponibili su http://localhost:8000/docs")
        else:
            print("   ❌ API docs non disponibili")
    except Exception as e:
        print(f"   ❌ ECCEZIONE: {e}")
    
    print("\n🔍 Test 4: Verifica endpoint health")
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        print(f"   Health Status: {response.status_code}")
        if response.status_code == 200:
            print(f"   Health Response: {response.text}")
    except Exception as e:
        print(f"   ❌ ECCEZIONE: {e}")

if __name__ == "__main__":
    test_backend_expectations()
