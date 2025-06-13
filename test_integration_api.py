#!/usr/bin/env python3
"""
Test di integrazione frontend-backend per verificare che le API siano correttamente connesse
"""

import sys
import os
import json
import requests
import time
from typing import Dict, Any

# Configurazione
BACKEND_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:3000"

def check_backend_health():
    """Verifica che il backend sia in esecuzione"""
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running")
            return True
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to backend: {e}")
        return False

def check_frontend_health():
    """Verifica che il frontend sia in esecuzione"""
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        if response.status_code == 200:
            print("✅ Frontend is running")
            return True
        else:
            print(f"❌ Frontend health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to frontend: {e}")
        return False

def test_api_endpoints():
    """Testa gli endpoint API principali"""
    test_results = {}
    
    # Test endpoints che non richiedono autenticazione
    public_endpoints = [
        ("/", "GET", "Root endpoint"),
        ("/health", "GET", "Health check"),
        ("/api/v1", "GET", "API v1 info"),
        ("/api/v1/health", "GET", "API v1 health"),
        ("/api/v1/endpoints", "GET", "API v1 endpoints list")
    ]
    
    print("\n=== TESTING PUBLIC API ENDPOINTS ===")
    
    for endpoint, method, description in public_endpoints:
        try:
            url = f"{BACKEND_URL}{endpoint}"
            response = requests.request(method, url, timeout=5)
            
            if response.status_code == 200:
                print(f"✅ {method} {endpoint} - {description}")
                test_results[endpoint] = {"status": "success", "code": response.status_code}
            else:
                print(f"❌ {method} {endpoint} - {description} (Status: {response.status_code})")
                test_results[endpoint] = {"status": "failed", "code": response.status_code}
                
        except requests.exceptions.RequestException as e:
            print(f"❌ {method} {endpoint} - {description} (Error: {e})")
            test_results[endpoint] = {"status": "error", "error": str(e)}
    
    return test_results

def test_auth_endpoints():
    """Testa gli endpoint di autenticazione"""
    print("\n=== TESTING AUTH ENDPOINTS ===")
    
    auth_endpoints = [
        ("/api/v1/auth/register", "POST", "User registration"),
        ("/api/v1/auth/login", "POST", "User login")
    ]
    
    test_results = {}
    
    for endpoint, method, description in auth_endpoints:
        try:
            url = f"{BACKEND_URL}{endpoint}"
            
            # Test con dati vuoti per vedere se l'endpoint risponde
            if method == "POST":
                response = requests.post(url, json={}, timeout=5)
            else:
                response = requests.request(method, url, timeout=5)
            
            # Dovremmo aspettarci un 422 (validation error) per dati vuoti
            if response.status_code in [422, 400]:
                print(f"✅ {method} {endpoint} - {description} (Validation working)")
                test_results[endpoint] = {"status": "success", "code": response.status_code}
            elif response.status_code == 200:
                print(f"✅ {method} {endpoint} - {description}")
                test_results[endpoint] = {"status": "success", "code": response.status_code}
            else:
                print(f"❌ {method} {endpoint} - {description} (Status: {response.status_code})")
                test_results[endpoint] = {"status": "failed", "code": response.status_code}
                
        except requests.exceptions.RequestException as e:
            print(f"❌ {method} {endpoint} - {description} (Error: {e})")
            test_results[endpoint] = {"status": "error", "error": str(e)}
    
    return test_results

def check_frontend_api_integration():
    """Verifica che il frontend sia configurato per usare le API corrette"""
    print("\n=== CHECKING FRONTEND API INTEGRATION ===")
    
    frontend_api_file = os.path.join(os.path.dirname(__file__), 'frontend', 'src', 'services', 'api.js')
    
    if os.path.exists(frontend_api_file):
        print("✅ Frontend API service file exists")
        
        with open(frontend_api_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # Verifica URL di base
            if 'localhost:8000' in content or 'http://localhost:8000' in content:
                print("✅ Frontend configured to use localhost:8000")
            else:
                print("❌ Frontend not configured for localhost:8000")
              # Verifica endpoint chiave
            endpoints_to_check = [
                '/auth/login',
                '/auth/register', 
                '/users/dashboard',
                '/users/profile'
            ]
            
            for endpoint in endpoints_to_check:
                if endpoint in content:
                    print(f"✅ Frontend has endpoint: {endpoint}")
                else:
                    print(f"❌ Frontend missing endpoint: {endpoint}")
    else:
        print(f"❌ Frontend API service file not found: {frontend_api_file}")

def generate_summary_report(public_tests, auth_tests):
    """Genera un report riassuntivo"""
    print("\n" + "="*60)
    print("INTEGRATION VERIFICATION SUMMARY")
    print("="*60)
    
    total_tests = len(public_tests) + len(auth_tests)
    successful_tests = 0
    
    for test_group in [public_tests, auth_tests]:
        for endpoint, result in test_group.items():
            if result['status'] == 'success':
                successful_tests += 1
    
    success_rate = (successful_tests / total_tests) * 100 if total_tests > 0 else 0
    
    print(f"Total endpoints tested: {total_tests}")
    print(f"Successful tests: {successful_tests}")
    print(f"Success rate: {success_rate:.1f}%")
    
    if success_rate >= 80:
        print("✅ INTEGRATION STATUS: GOOD")
    elif success_rate >= 60:
        print("⚠️  INTEGRATION STATUS: PARTIAL")
    else:
        print("❌ INTEGRATION STATUS: NEEDS ATTENTION")
    
    # Salva il report in JSON
    report = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "backend_url": BACKEND_URL,
        "frontend_url": FRONTEND_URL,
        "total_tests": total_tests,
        "successful_tests": successful_tests,
        "success_rate": success_rate,
        "public_endpoints": public_tests,
        "auth_endpoints": auth_tests
    }
    
    with open('api_integration_test_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"\n📄 Detailed report saved to: api_integration_test_report.json")

def main():
    print("🚀 STARTING FRONTEND-BACKEND INTEGRATION VERIFICATION")
    print("="*60)
    
    # Verifica servizi
    backend_ok = check_backend_health()
    frontend_ok = check_frontend_health()
    
    if not backend_ok:
        print("\n❌ Backend not available. Please start the backend first:")
        print("cd backend && python -m uvicorn main:app --reload")
        return
    
    if not frontend_ok:
        print("\n⚠️  Frontend not available. You may need to start it:")
        print("cd frontend && npm start")
    
    # Test API endpoints
    public_tests = test_api_endpoints()
    auth_tests = test_auth_endpoints()
    
    # Verifica integrazione frontend
    check_frontend_api_integration()
    
    # Genera report
    generate_summary_report(public_tests, auth_tests)

if __name__ == "__main__":
    main()
