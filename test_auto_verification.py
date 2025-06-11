#!/usr/bin/env python3
"""
Test rapido per verificare la fix dell'auto-verifica email
"""
import time
import requests

def test_auto_verification():
    print("🧪 TESTANDO AUTO-VERIFICA EMAIL")
    print("=" * 40)
    
    timestamp = int(time.time())
    test_email = f"auto.verify.{timestamp}@test.com"
    password = "TestPassword123!"
    
    # 1. Register user
    print(f"1. Registrando utente: {test_email}")
    register_data = {
        "email": test_email,
        "password": password,
        "password_confirm": password,
        "first_name": "Auto",
        "last_name": "Verify",
        "role": "parent",
        "phone": "1234567890"
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/auth/register",
            json=register_data,
            timeout=10
        )
        
        if response.status_code == 201:
            user_data = response.json()
            is_verified = user_data.get("user", {}).get("is_verified", False)
            print(f"   ✅ Registrazione riuscita")
            print(f"   📧 is_verified: {is_verified}")
            
            if not is_verified:
                print("   ❌ Utente non auto-verificato!")
                return False
        else:
            print(f"   ❌ Registrazione fallita: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Errore registrazione: {e}")
        return False
    
    # 2. Test login immediately
    print("2. Testando login immediato...")
    login_data = {
        "username": test_email,
        "password": password
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/auth/login",
            data=login_data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            timeout=10
        )
        
        if response.status_code == 200:
            print("   ✅ Login riuscito subito dopo registrazione!")
            token_data = response.json()
            print(f"   🔑 Token ottenuto: {token_data.get('token', {}).get('access_token', '')[:20]}...")
            return True
        else:
            print(f"   ❌ Login fallito: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Errore login: {e}")
        return False

if __name__ == "__main__":
    success = test_auto_verification()
    if success:
        print("\n🎉 AUTO-VERIFICA FUNZIONA!")
    else:
        print("\n❌ AUTO-VERIFICA NON FUNZIONA!")
