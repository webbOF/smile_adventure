#!/usr/bin/env python3
"""
VERIFICA FINALE COMPLETA - TASK 17 API GATEWAY
Verifica completa che tutte le task siano state implementate correttamente
e che il tutto sia connesso effettivamente al backend usando le API presenti nel file api.py
"""

import sys
import os
import json
import requests
import time
from datetime import datetime

# Aggiungi il path del backend
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

BACKEND_URL = "http://localhost:8000"

def verify_task17_implementation():
    """Verifica completa dell'implementazione del Task 17"""
    
    print("🎯 VERIFICA COMPLETA TASK 17 - API GATEWAY SETUP")
    print("=" * 80)
    
    results = {
        "timestamp": datetime.now().isoformat(),
        "task17_status": {},
        "api_gateway_features": {},
        "versioned_endpoints": {},
        "global_exception_handling": {},
        "frontend_integration": {},
        "overall_score": 0
    }
    
    # 1. Verifica che il file api.py esista e sia implementato
    print("\n📁 1. VERIFICA FILE API.PY (TASK 17)")
    api_file_path = os.path.join("backend", "app", "api", "v1", "api.py")
    
    if os.path.exists(api_file_path):
        print("✅ File api.py esiste")
        
        # Verifica contenuto del file
        with open(api_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # Controlla componenti chiave del Task 17
            task17_components = {
                "api_v1_router": "api_v1_router" in content,
                "global_exception_handlers": "global_http_exception_handler" in content,
                "auth_router_integration": "auth_router" in content,
                "users_router_integration": "users_router" in content,
                "reports_router_integration": "reports_router" in content,
                "professional_router_integration": "professional_router" in content,
                "api_info_endpoint": '@api_v1_router.get("/", tags=["api-info"' in content,
                "health_endpoint": '@api_v1_router.get("/health"' in content,
                "endpoints_discovery": '@api_v1_router.get("/endpoints"' in content
            }
            
            for component, found in task17_components.items():
                status = "✅" if found else "❌"
                print(f"  {status} {component.replace('_', ' ').title()}: {found}")
            
            results["task17_status"] = task17_components
    else:
        print("❌ File api.py NON TROVATO")
        results["task17_status"]["file_exists"] = False
    
    # 2. Verifica API Gateway Features
    print("\n🔗 2. VERIFICA API GATEWAY FEATURES")
    
    gateway_tests = {
        "versioned_api": ("/api/v1/", "API v1 info endpoint"),
        "health_check": ("/api/v1/health", "Health check endpoint"),
        "endpoints_discovery": ("/api/v1/endpoints", "Endpoints discovery"),
        "global_error_handling": ("/api/v1/nonexistent", "Global error handling (404)")
    }
    
    for test_name, (endpoint, description) in gateway_tests.items():
        try:
            response = requests.get(f"{BACKEND_URL}{endpoint}", timeout=5)
            
            if test_name == "global_error_handling":
                # Per questo test, ci aspettiamo un 404 con formato di errore strutturato
                if response.status_code == 404:
                    error_data = response.json()
                    if "error" in error_data and "type" in error_data["error"]:
                        print(f"✅ {description}: Structured error response")
                        results["api_gateway_features"][test_name] = True
                    else:
                        print(f"❌ {description}: Error not structured")
                        results["api_gateway_features"][test_name] = False
                else:
                    print(f"❌ {description}: Expected 404, got {response.status_code}")
                    results["api_gateway_features"][test_name] = False
            else:
                # Per gli altri test, ci aspettiamo successo (200)
                if response.status_code == 200:
                    print(f"✅ {description}: Working")
                    results["api_gateway_features"][test_name] = True
                else:
                    print(f"❌ {description}: Status {response.status_code}")
                    results["api_gateway_features"][test_name] = False
                    
        except Exception as e:
            print(f"❌ {description}: Error - {e}")
            results["api_gateway_features"][test_name] = False
    
    # 3. Verifica Versioned Endpoints
    print("\n📋 3. VERIFICA VERSIONED ENDPOINTS")
    
    versioned_endpoints = {
        # Auth endpoints via v1 router
        "auth_register": ("/api/v1/auth/register", "POST"),
        "auth_login": ("/api/v1/auth/login", "POST"),
        "auth_me": ("/api/v1/auth/me", "GET"),
        
        # Users endpoints via v1 router
        "users_dashboard": ("/api/v1/users/dashboard", "GET"),
        "users_profile": ("/api/v1/users/profile", "GET"),
        "users_children": ("/api/v1/users/children", "GET"),
        
        # Reports endpoints via v1 router
        "reports_dashboard": ("/api/v1/reports/dashboard", "GET"),
        
        # Professional endpoints via v1 router
        "professional_profile": ("/api/v1/professional/professional-profile", "GET")
    }
    
    for endpoint_name, (url, method) in versioned_endpoints.items():
        try:
            if method == "POST":
                response = requests.post(f"{BACKEND_URL}{url}", json={}, timeout=5)
                expected_status = [422, 400]  # Validation error
            else:
                response = requests.get(f"{BACKEND_URL}{url}", timeout=5)
                expected_status = [401, 200]  # Auth required or success
            
            if response.status_code in expected_status:
                print(f"✅ {endpoint_name}: {method} {url}")
                results["versioned_endpoints"][endpoint_name] = True
            else:
                print(f"❌ {endpoint_name}: {method} {url} - Status: {response.status_code}")
                results["versioned_endpoints"][endpoint_name] = False
                
        except Exception as e:
            print(f"❌ {endpoint_name}: Error - {e}")
            results["versioned_endpoints"][endpoint_name] = False
    
    # 4. Verifica Global Exception Handling
    print("\n🛡️ 4. VERIFICA GLOBAL EXCEPTION HANDLING")
    
    exception_tests = {
        "404_handler": ("/api/v1/nonexistent-endpoint", "NotFoundError"),
        "422_validation": ("/api/v1/auth/register", "ValidationError"),
        "401_auth": ("/api/v1/users/profile", "AuthenticationError")
    }
    
    for test_name, (endpoint, expected_error_type) in exception_tests.items():
        try:
            if "validation" in test_name:
                response = requests.post(f"{BACKEND_URL}{endpoint}", json={}, timeout=5)
            else:
                response = requests.get(f"{BACKEND_URL}{endpoint}", timeout=5)
            
            # Verifica che la risposta di errore sia strutturata secondo Task 17
            if response.status_code >= 400:
                error_data = response.json()
                
                required_fields = ["error", "type", "status_code", "message", "path", "method", "timestamp"]
                has_structure = all(field in error_data.get("error", {}) for field in ["type", "status_code", "message"])
                
                if has_structure and error_data["error"]["type"] == expected_error_type:
                    print(f"✅ {test_name}: Structured {expected_error_type}")
                    results["global_exception_handling"][test_name] = True
                else:
                    print(f"❌ {test_name}: Invalid error structure")
                    results["global_exception_handling"][test_name] = False
            else:
                print(f"❌ {test_name}: Expected error, got {response.status_code}")
                results["global_exception_handling"][test_name] = False
                
        except Exception as e:
            print(f"❌ {test_name}: Error - {e}")
            results["global_exception_handling"][test_name] = False
    
    # 5. Verifica Frontend Integration
    print("\n🌐 5. VERIFICA FRONTEND INTEGRATION")
    
    frontend_checks = {}
    
    # Verifica file di configurazione frontend
    frontend_files = {
        "api_service": "frontend/src/services/api.js",
        "auth_service": "frontend/src/services/authService.js", 
        "user_service": "frontend/src/services/userService.js",
        "api_endpoints": "frontend/src/types/api.js"
    }
    
    for file_type, file_path in frontend_files.items():
        if os.path.exists(file_path):
            print(f"✅ {file_type}: File exists")
            frontend_checks[file_type] = True
            
            # Verifica configurazione API
            if file_type == "api_service":
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if 'baseURL: process.env.REACT_APP_API_URL || \'http://localhost:8000/api/v1\'' in content:
                        print("  ✅ BaseURL correctly configured for v1 API")
                        frontend_checks["base_url_v1"] = True
                    else:
                        print("  ❌ BaseURL not configured for v1 API")
                        frontend_checks["base_url_v1"] = False
        else:
            print(f"❌ {file_type}: File missing")
            frontend_checks[file_type] = False
    
    results["frontend_integration"] = frontend_checks
    
    # 6. Calcola Overall Score
    print("\n📊 6. CALCOLO SCORE COMPLESSIVO")
    
    all_results = [
        results["task17_status"],
        results["api_gateway_features"], 
        results["versioned_endpoints"],
        results["global_exception_handling"],
        results["frontend_integration"]
    ]
    
    total_tests = sum(len(category) for category in all_results)
    passed_tests = sum(sum(category.values()) for category in all_results)
    
    overall_score = (passed_tests / total_tests * 100) if total_tests > 0 else 0
    results["overall_score"] = overall_score
    
    print(f"Test totali: {total_tests}")
    print(f"Test superati: {passed_tests}")
    print(f"Score complessivo: {overall_score:.1f}%")
    
    # 7. Valutazione Finale
    print("\n" + "=" * 80)
    print("🏆 VALUTAZIONE FINALE TASK 17")
    print("=" * 80)
    
    if overall_score >= 95:
        status = "🟢 COMPLETAMENTE IMPLEMENTATO"
        print("✅ Il Task 17 è stato implementato completamente e correttamente!")
        print("✅ Tutte le API sono connesse e funzionanti")
        print("✅ Global exception handling attivo") 
        print("✅ Frontend integrato correttamente")
    elif overall_score >= 80:
        status = "🟡 PRINCIPALMENTE IMPLEMENTATO"
        print("⚠️  Il Task 17 è principalmente implementato con alcuni problemi minori")
    else:
        status = "🔴 RICHIEDE ATTENZIONE"
        print("❌ Il Task 17 richiede ulteriore lavoro per essere completato")
    
    print(f"\n🎯 STATUS FINALE: {status}")
    print(f"📊 SCORE: {overall_score:.1f}%")
    
    # Salva report dettagliato
    with open('task17_final_verification_report.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\n📄 Report dettagliato salvato: task17_final_verification_report.json")
    
    return results

def verify_api_routing_structure():
    """Verifica la struttura del routing API"""
    print("\n🔄 VERIFICA STRUTTURA ROUTING API")
    
    try:
        from app.api.v1.api import api_v1_router
        from app.api.main import api_router
        
        print("✅ Importazione router riuscita")
        
        # Conta le route nel v1 router
        v1_routes = len([route for route in api_v1_router.routes if hasattr(route, 'path')])
        main_routes = len([route for route in api_router.routes if hasattr(route, 'path')])
        
        print(f"✅ V1 Router routes: {v1_routes}")
        print(f"✅ Main API Router routes: {main_routes}")
        
        return True
        
    except ImportError as e:
        print(f"❌ Errore importazione router: {e}")
        return False

def main():
    print("🚀 AVVIO VERIFICA FINALE COMPLETA")
    print("Verifica implementazione Task 17 e connessione API del file api.py")
    print("=" * 80)
    
    # Cambia nella directory del progetto
    project_root = os.path.dirname(os.path.abspath(__file__))
    os.chdir(project_root)
    
    # Verifica che il backend sia in esecuzione
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend in esecuzione")
        else:
            print(f"❌ Backend non raggiungibile (Status: {response.status_code})")
            return
    except:
        print("❌ Backend non in esecuzione. Avvia il backend:")
        print("cd backend && python -m uvicorn main:app --reload")
        return
    
    # Esegui verifiche
    results = verify_task17_implementation()
    verify_api_routing_structure()
    
    return results

if __name__ == "__main__":
    main()
