#!/usr/bin/env python3
"""
Task 31 Verification Suite - App Routing Setup
Verifica automatica dell'implementazione del sistema di routing avanzato
"""

import os
import json
import time
from datetime import datetime
from pathlib import Path

def check_file_exists(file_path, description):
    """Verifica l'esistenza di un file"""
    if os.path.exists(file_path):
        print(f"✅ {description}: {file_path}")
        return True
    else:
        print(f"❌ {description}: {file_path}")
        return False

def check_file_content(file_path, keywords, description):
    """Verifica che un file contenga determinate keywords"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        missing_keywords = []
        for keyword in keywords:
            if keyword not in content:
                missing_keywords.append(keyword)
        
        if not missing_keywords:
            print(f"✅ {description}: Tutte le keywords trovate")
            return True
        else:
            print(f"❌ {description}: Keywords mancanti: {missing_keywords}")
            return False
    except Exception as e:
        print(f"❌ {description}: Errore lettura file - {str(e)}")
        return False

def verify_task31_implementation():
    """Verifica completa del Task 31"""
    
    print("=" * 80)
    print("🔍 TASK 31 VERIFICATION SUITE - APP ROUTING SETUP")
    print("=" * 80)
    print(f"📅 Data verifica: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    base_path = "c:/Users/arman/Desktop/smileADV_simpl/smile_adventure/frontend"
    results = []
    
    # 1. Verifica Enhanced App.js
    print("📋 1. ENHANCED APP.JS")
    print("-" * 40)
    
    app_js_path = os.path.join(base_path, "src/App.js")
    app_js_keywords = [
        "Suspense", "lazy", "ErrorBoundary", "LoadingSpinner", 
        "RoleGuard", "ProtectedRoute", "NotFoundPage", "SmartRedirect"
    ]
    
    results.append(check_file_exists(app_js_path, "App.js exists"))
    results.append(check_file_content(app_js_path, app_js_keywords, "App.js advanced features"))
    print()
    
    # 2. Verifica Error Boundary
    print("📋 2. ERROR BOUNDARY SYSTEM")
    print("-" * 40)
    
    error_boundary_path = os.path.join(base_path, "src/components/common/ErrorBoundary.jsx")
    error_boundary_keywords = [
        "getDerivedStateFromError", "componentDidCatch", "hasError", 
        "ExclamationTriangleIcon", "ArrowPathIcon"
    ]
    
    results.append(check_file_exists(error_boundary_path, "ErrorBoundary.jsx exists"))
    results.append(check_file_content(error_boundary_path, error_boundary_keywords, "ErrorBoundary features"))
    print()
    
    # 3. Verifica Loading System
    print("📋 3. ADVANCED LOADING SYSTEM")
    print("-" * 40)
    
    loading_path = os.path.join(base_path, "src/components/common/Loading.jsx")
    loading_keywords = [
        "LoadingSpinner", "PageLoading", "RouteLoading", 
        "ComponentLoading", "ButtonLoading", "framer-motion"
    ]
    
    results.append(check_file_exists(loading_path, "Loading.jsx exists"))
    results.append(check_file_content(loading_path, loading_keywords, "Loading system features"))
    print()
    
    # 4. Verifica Role Guard
    print("📋 4. ROLE-BASED ACCESS CONTROL")
    print("-" * 40)
    
    role_guard_path = os.path.join(base_path, "src/components/common/RoleGuard.jsx")
    role_guard_keywords = [
        "RoleGuard", "UnauthorizedAccess", "SmartRedirect", 
        "allowedRoles", "requiredRole"
    ]
    
    results.append(check_file_exists(role_guard_path, "RoleGuard.jsx exists"))
    results.append(check_file_content(role_guard_path, role_guard_keywords, "RoleGuard features"))
    print()
    
    # 5. Verifica 404 Page
    print("📋 5. 404 NOT FOUND PAGE")
    print("-" * 40)
    
    not_found_path = os.path.join(base_path, "src/components/common/NotFoundPage.jsx")
    not_found_keywords = [
        "404", "Pagina Non Trovata", "HomeIcon", "ArrowLeftIcon", 
        "Torna Indietro"
    ]
    
    results.append(check_file_exists(not_found_path, "NotFoundPage.jsx exists"))
    results.append(check_file_content(not_found_path, not_found_keywords, "NotFoundPage features"))
    print()
    
    # 6. Verifica Routing Hook
    print("📋 6. CUSTOM ROUTING HOOKS")
    print("-" * 40)
    
    router_hook_path = os.path.join(base_path, "src/hooks/useAppRouter.js")
    router_hook_keywords = [
        "useAppRouter", "goToDashboard", "navigateWithAuth", 
        "getUserRoutes", "getBreadcrumb", "canAccessRoute"
    ]
    
    results.append(check_file_exists(router_hook_path, "useAppRouter.js exists"))
    results.append(check_file_content(router_hook_path, router_hook_keywords, "useAppRouter features"))
    print()
    
    # 7. Verifica Breadcrumb
    print("📋 7. BREADCRUMB NAVIGATION")
    print("-" * 40)
    
    breadcrumb_path = os.path.join(base_path, "src/components/common/Breadcrumb.jsx")
    breadcrumb_keywords = [
        "Breadcrumb", "ChevronRightIcon", "HomeIcon", 
        "getBreadcrumb", "breadcrumbItems"
    ]
    
    results.append(check_file_exists(breadcrumb_path, "Breadcrumb.jsx exists"))
    results.append(check_file_content(breadcrumb_path, breadcrumb_keywords, "Breadcrumb features"))
    print()
    
    # 8. Verifica Enhanced Layout
    print("📋 8. ENHANCED LAYOUT")
    print("-" * 40)
    
    layout_path = os.path.join(base_path, "src/components/common/Layout.js")
    layout_keywords = [
        "showBreadcrumb", "isPublicPage", "shouldShowBreadcrumb", 
        "PropTypes", "Breadcrumb"
    ]
    
    results.append(check_file_exists(layout_path, "Enhanced Layout.js exists"))
    results.append(check_file_content(layout_path, layout_keywords, "Enhanced Layout features"))
    print()
    
    # Calcolo risultati
    total_checks = len(results)
    passed_checks = sum(results)
    success_rate = (passed_checks / total_checks) * 100
    
    print("=" * 80)
    print("📊 RISULTATI VERIFICA")
    print("=" * 80)
    print(f"✅ Test superati: {passed_checks}/{total_checks}")
    print(f"📈 Tasso di successo: {success_rate:.1f}%")
    
    if success_rate >= 90:
        print("🎉 TASK 31 COMPLETATO CON SUCCESSO!")
        status = "COMPLETED"
    elif success_rate >= 70:
        print("⚠️  TASK 31 PARZIALMENTE COMPLETATO")
        status = "PARTIAL"
    else:
        print("❌ TASK 31 NECESSITA IMPLEMENTAZIONI")
        status = "INCOMPLETE"
    
    # Salva risultati
    report = {
        "task": "Task 31 - App Routing Setup",
        "verification_date": datetime.now().isoformat(),
        "total_checks": total_checks,
        "passed_checks": passed_checks,
        "success_rate": success_rate,
        "status": status,
        "details": {
            "enhanced_app_js": results[0] and results[1],
            "error_boundary": results[2] and results[3],
            "loading_system": results[4] and results[5],
            "role_guard": results[6] and results[7],
            "not_found_page": results[8] and results[9],
            "routing_hooks": results[10] and results[11],
            "breadcrumb": results[12] and results[13],
            "enhanced_layout": results[14] and results[15]
        }
    }
    
    with open("task31_verification_report.json", "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"\n📋 Report salvato in: task31_verification_report.json")
    print("=" * 80)

if __name__ == "__main__":
    verify_task31_implementation()
