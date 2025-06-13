#!/usr/bin/env python3
"""
Test di integrazione completo frontend-backend
Verifica che il frontend sia configurato correttamente per utilizzare le API del backend
"""

import os
import re
import json
import requests
from datetime import datetime

BACKEND_URL = "http://localhost:8000"
FRONTEND_PATH = "frontend/src"

def check_frontend_api_configuration():
    """Verifica la configurazione API del frontend"""
    print("=== CHECKING FRONTEND API CONFIGURATION ===")
    
    results = {
        "api_service": False,
        "base_url_correct": False,
        "endpoints_defined": False,
        "auth_service": False,
        "user_service": False,
        "endpoints_count": 0
    }
    
    # Controlla il servizio API base
    api_js_path = os.path.join(FRONTEND_PATH, "services", "api.js")
    if os.path.exists(api_js_path):
        print("✅ API service file exists")
        results["api_service"] = True
        
        with open(api_js_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # Verifica baseURL
            if 'baseURL: process.env.REACT_APP_API_URL || \'http://localhost:8000/api/v1\'' in content:
                print("✅ Base URL correctly configured: http://localhost:8000/api/v1")
                results["base_url_correct"] = True
            else:
                print("❌ Base URL not correctly configured")
    else:
        print(f"❌ API service file not found: {api_js_path}")
    
    # Controlla la definizione degli endpoint
    api_types_path = os.path.join(FRONTEND_PATH, "types", "api.js")
    if os.path.exists(api_types_path):
        print("✅ API endpoints definition file exists")
        results["endpoints_defined"] = True
        
        with open(api_types_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # Conta gli endpoint definiti
            auth_endpoints = content.count('AUTH:')
            users_endpoints = content.count('USERS:')
            children_endpoints = content.count('CHILDREN:')
            reports_endpoints = content.count('REPORTS:')
            
            total_endpoints = len(re.findall(r"'\/.+?'", content))
            results["endpoints_count"] = total_endpoints
            
            print(f"✅ Found {total_endpoints} endpoint definitions")
            print(f"   - AUTH endpoints section: {'✅' if auth_endpoints > 0 else '❌'}")
            print(f"   - USERS endpoints section: {'✅' if users_endpoints > 0 else '❌'}")
            print(f"   - CHILDREN endpoints section: {'✅' if children_endpoints > 0 else '❌'}")
            print(f"   - REPORTS endpoints section: {'✅' if reports_endpoints > 0 else '❌'}")
    else:
        print(f"❌ API endpoints definition file not found: {api_types_path}")
    
    # Controlla authService
    auth_service_path = os.path.join(FRONTEND_PATH, "services", "authService.js")
    if os.path.exists(auth_service_path):
        print("✅ AuthService file exists")
        results["auth_service"] = True
    else:
        print(f"❌ AuthService file not found: {auth_service_path}")
    
    # Controlla userService  
    user_service_path = os.path.join(FRONTEND_PATH, "services", "userService.js")
    if os.path.exists(user_service_path):
        print("✅ UserService file exists")
        results["user_service"] = True
    else:
        print(f"❌ UserService file not found: {user_service_path}")
    
    return results

def verify_endpoint_alignment():
    """Verifica che gli endpoint del frontend siano allineati con quelli del backend"""
    print("\n=== VERIFYING ENDPOINT ALIGNMENT ===")
    
    # Endpoint che il frontend dovrebbe usare (basati sul file api.py Task 17)
    expected_endpoints = {
        "auth": [
            "/auth/register",
            "/auth/login", 
            "/auth/logout",
            "/auth/me",
            "/auth/refresh",
            "/auth/change-password"
        ],
        "users": [
            "/users/dashboard",
            "/users/profile",
            "/users/preferences",
            "/users/children"
        ],
        "reports": [
            "/reports/dashboard"
        ]
    }
    
    # Verifica che gli endpoint siano definiti nel frontend
    api_types_path = os.path.join(FRONTEND_PATH, "types", "api.js")
    if os.path.exists(api_types_path):
        with open(api_types_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
            alignment_results = {}
            
            for category, endpoints in expected_endpoints.items():
                alignment_results[category] = {}
                print(f"\n📁 {category.upper()} ENDPOINTS:")
                
                for endpoint in endpoints:
                    # Cerca l'endpoint nel file (come stringa)
                    if f"'{endpoint}'" in content:
                        print(f"  ✅ {endpoint}")
                        alignment_results[category][endpoint] = True
                    else:
                        print(f"  ❌ {endpoint}")
                        alignment_results[category][endpoint] = False
            
            return alignment_results
    else:
        print("❌ Cannot verify endpoint alignment - api.js file not found")
        return {}

def test_frontend_backend_communication():
    """Testa la comunicazione tra frontend e backend"""
    print("\n=== TESTING FRONTEND-BACKEND COMMUNICATION ===")
    
    # Verifica che il backend sia raggiungibile dal frontend
    try:
        response = requests.get(f"{BACKEND_URL}/api/v1/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend API v1 reachable")
            print(f"   📄 API Version: {data.get('api_version')}")
            print(f"   📄 Title: {data.get('title')}")
            
            # Verifica CORS headers
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods')
            }
            
            if any(cors_headers.values()):
                print("✅ CORS headers present")
                for header, value in cors_headers.items():
                    if value:
                        print(f"   🔗 {header}: {value}")
            else:
                print("⚠️  CORS headers not found in response")
                
        else:
            print(f"❌ Backend not reachable (Status: {response.status_code})")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot reach backend: {e}")

def check_environment_configuration():
    """Verifica la configurazione dell'ambiente"""
    print("\n=== CHECKING ENVIRONMENT CONFIGURATION ===")
    
    # Controlla se esiste il file .env nel frontend
    frontend_env_path = os.path.join("frontend", ".env")
    if os.path.exists(frontend_env_path):
        print("✅ Frontend .env file exists")
        
        with open(frontend_env_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
            if 'REACT_APP_API_URL' in content:
                # Estrai il valore
                for line in content.split('\n'):
                    if line.startswith('REACT_APP_API_URL'):
                        api_url = line.split('=')[1].strip()
                        print(f"✅ REACT_APP_API_URL configured: {api_url}")
                        break
            else:
                print("⚠️  REACT_APP_API_URL not found in .env file")
    else:
        print("⚠️  Frontend .env file not found (using default configuration)")
    
    # Controlla package.json per le dipendenze
    package_json_path = os.path.join("frontend", "package.json")
    if os.path.exists(package_json_path):
        print("✅ Frontend package.json exists")
        
        with open(package_json_path, 'r', encoding='utf-8') as f:
            package_data = json.load(f)
            
            dependencies = package_data.get('dependencies', {})
            key_deps = ['axios', 'react', 'react-router-dom']
            
            for dep in key_deps:
                if dep in dependencies:
                    print(f"✅ {dep}: {dependencies[dep]}")
                else:
                    print(f"❌ {dep}: Not found")
    else:
        print("❌ Frontend package.json not found")

def generate_integration_report(frontend_config, endpoint_alignment):
    """Genera un report di integrazione completo"""
    
    # Calcola score complessivo
    config_score = sum(frontend_config.values()) / len(frontend_config) * 100
    
    alignment_score = 0
    total_endpoints = 0
    for category, endpoints in endpoint_alignment.items():
        for endpoint, aligned in endpoints.items():
            total_endpoints += 1
            if aligned:
                alignment_score += 1
    
    alignment_percentage = (alignment_score / total_endpoints * 100) if total_endpoints > 0 else 0
    
    overall_score = (config_score + alignment_percentage) / 2
    
    report = {
        "timestamp": datetime.now().isoformat(),
        "frontend_configuration": {
            "score": config_score,
            "details": frontend_config
        },
        "endpoint_alignment": {
            "score": alignment_percentage,
            "aligned_endpoints": alignment_score,
            "total_endpoints": total_endpoints,
            "details": endpoint_alignment
        },
        "overall_integration_score": overall_score,
        "status": "EXCELLENT" if overall_score >= 90 else "GOOD" if overall_score >= 70 else "NEEDS_IMPROVEMENT"
    }
    
    print("\n" + "="*60)
    print("FRONTEND-BACKEND INTEGRATION REPORT")
    print("="*60)
    print(f"Frontend Configuration Score: {config_score:.1f}%")
    print(f"Endpoint Alignment Score: {alignment_percentage:.1f}%")
    print(f"Overall Integration Score: {overall_score:.1f}%")
    print(f"Status: {report['status']}")
    
    # Salva il report
    with open('frontend_backend_integration_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"\n📄 Detailed report saved to: frontend_backend_integration_report.json")
    
    return report

def main():
    print("🚀 FRONTEND-BACKEND INTEGRATION VERIFICATION")
    print("Verifying Task 17 API integration with frontend")
    print("="*60)
    
    # Cambia nella directory del progetto
    project_root = os.path.dirname(os.path.abspath(__file__))
    os.chdir(project_root)
    
    # Esegui tutti i controlli
    frontend_config = check_frontend_api_configuration()
    endpoint_alignment = verify_endpoint_alignment()
    test_frontend_backend_communication()
    check_environment_configuration()
    
    # Genera report finale
    report = generate_integration_report(frontend_config, endpoint_alignment)
    
    return report

if __name__ == "__main__":
    main()
