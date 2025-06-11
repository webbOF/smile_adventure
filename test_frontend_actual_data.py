#!/usr/bin/env python3
"""
Test per verificare esattamente cosa invia il frontend durante la registrazione
"""
import time
import requests
import json

def test_frontend_data_format():
    """Test what the frontend actually sends to backend"""
    print("🧪 TESTANDO FORMATO DATI FRONTEND")
    print("=" * 50)
    
    # Create unique email
    timestamp = int(time.time())
    test_data_frontend_format = {
        "email": f"frontend.test.{timestamp}@test.com",
        "password": "TestPassword123!",
        "first_name": "Mario",
        "last_name": "Rossi", 
        "role": "parent",
        "phone": "5555551234"
        # Note: missing password_confirm to simulate what test showed
    }
    
    test_data_correct_format = {
        "email": f"correct.test.{timestamp}@test.com",
        "password": "TestPassword123!",
        "password_confirm": "TestPassword123!",  # This is what backend needs
        "first_name": "Mario",
        "last_name": "Rossi",
        "role": "parent", 
        "phone": "5555551234"
    }
    
    print("❌ Test 1: Formato che il test dice che il frontend invia (senza password_confirm)")
    print(f"   Dati: {json.dumps(test_data_frontend_format, indent=2)}")
    
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/auth/register",
            json=test_data_frontend_format,
            timeout=10
        )
        print(f"   Status: {response.status_code}")
        if response.status_code != 201:
            print(f"   ❌ ERRORE: {response.text}")
        else:
            print(f"   ✅ SUCCESSO: {response.text}")
    except Exception as e:
        print(f"   ❌ ERRORE RICHIESTA: {e}")
    
    print("\n✅ Test 2: Formato corretto (con password_confirm)")
    print(f"   Dati: {json.dumps(test_data_correct_format, indent=2)}")
    
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/auth/register",
            json=test_data_correct_format,
            timeout=10
        )
        print(f"   Status: {response.status_code}")
        if response.status_code != 201:
            print(f"   ❌ ERRORE: {response.text}")
        else:
            print(f"   ✅ SUCCESSO: {response.text}")
    except Exception as e:
        print(f"   ❌ ERRORE RICHIESTA: {e}")

if __name__ == "__main__":
    test_frontend_data_format()
