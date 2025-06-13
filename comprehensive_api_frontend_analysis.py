#!/usr/bin/env python3
"""
Test completo di tutte le 103 route API e verifica implementazione frontend
Analizza ogni singola route disponibile e controlla se è utilizzata nel frontend
"""

import sys
import os
import json
import requests
import re
from datetime import datetime
from typing import Dict, List, Set

# Aggiungi il path del backend
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

BACKEND_URL = "http://localhost:8000"
FRONTEND_PATH = "frontend/src"

def get_all_api_routes():
    """Estrae tutte le route dal router API"""
    try:
        from app.api.v1.api import api_v1_router
        
        routes = []
        
        def extract_routes_recursive(router, prefix=''):
            for route in router.routes:
                if hasattr(route, 'path') and hasattr(route, 'methods'):
                    full_path = prefix + route.path
                    methods = list(route.methods)
                    
                    for method in methods:
                        if method != 'HEAD':  # Escludi HEAD automatico
                            routes.append({
                                'method': method,
                                'path': full_path,
                                'name': getattr(route, 'name', 'unknown'),
                                'tags': getattr(route, 'tags', [])
                            })
                
                # Ricorsione per sub-router
                if hasattr(route, 'router'):
                    sub_prefix = route.path if hasattr(route, 'path') else ''
                    extract_routes_recursive(route.router, prefix + sub_prefix)
        
        extract_routes_recursive(api_v1_router)
        return routes
        
    except ImportError as e:
        print(f"❌ Errore importazione router: {e}")
        return []

def test_all_routes():
    """Testa tutte le route disponibili"""
    print("🔍 TESTING ALL API ROUTES")
    print("=" * 60)
    
    routes = get_all_api_routes()
    if not routes:
        print("❌ Nessuna route trovata")
        return {}
    
    print(f"📊 Totale route da testare: {len(routes)}")
    print()
    
    results = {}
    success_count = 0
    
    # Raggruppa per categoria
    categories = {}
    for route in routes:
        path_parts = route['path'].strip('/').split('/')
        category = path_parts[0] if path_parts else 'root'
        
        if category not in categories:
            categories[category] = []
        categories[category].append(route)
    
    for category, category_routes in sorted(categories.items()):
        print(f"📁 {category.upper()} ({len(category_routes)} routes)")
        results[category] = {}
        
        for route in category_routes:
            method = route['method']
            path = route['path']
            full_url = f"{BACKEND_URL}/api/v1{path}"
            
            try:
                # Test della route
                if method == 'GET':
                    response = requests.get(full_url, timeout=5)
                elif method == 'POST':
                    response = requests.post(full_url, json={}, timeout=5)
                elif method == 'PUT':
                    response = requests.put(full_url, json={}, timeout=5)
                elif method == 'DELETE':
                    response = requests.delete(full_url, timeout=5)
                else:
                    response = requests.request(method, full_url, timeout=5)
                
                # Considera successo: 200, 401 (auth required), 422 (validation error)
                is_success = response.status_code in [200, 201, 401, 422, 403]
                
                if is_success:
                    print(f"  ✅ {method} {path} (Status: {response.status_code})")
                    success_count += 1
                else:
                    print(f"  ❌ {method} {path} (Status: {response.status_code})")
                
                results[category][f"{method} {path}"] = {
                    'status_code': response.status_code,
                    'success': is_success,
                    'name': route['name'],
                    'tags': route['tags']
                }
                
            except requests.exceptions.RequestException as e:
                print(f"  💥 {method} {path} (Error: {str(e)[:50]}...)")
                results[category][f"{method} {path}"] = {
                    'status_code': None,
                    'success': False,
                    'error': str(e),
                    'name': route['name'],
                    'tags': route['tags']
                }
        
        print()
    
    total_routes = len(routes)
    success_rate = (success_count / total_routes * 100) if total_routes > 0 else 0
    
    print("=" * 60)
    print(f"📊 RISULTATI TEST ROUTES")
    print(f"Totale route testate: {total_routes}")
    print(f"Route funzionanti: {success_count}")
    print(f"Tasso di successo: {success_rate:.1f}%")
    
    return {
        'routes': results,
        'summary': {
            'total_routes': total_routes,
            'success_count': success_count,
            'success_rate': success_rate
        }
    }

def analyze_frontend_implementation():
    """Analizza quali endpoint sono implementati nel frontend"""
    print("\n🌐 ANALIZING FRONTEND IMPLEMENTATION")
    print("=" * 60)
    
    frontend_usage = {
        'service_files': {},
        'endpoint_usage': {},
        'total_endpoints_used': 0,
        'unused_endpoints': []
    }
    
    # File da analizzare
    service_files = [
        'services/api.js',
        'services/authService.js', 
        'services/userService.js',
        'services/reportService.js',
        'types/api.js'
    ]
    
    # Pattern per trovare endpoint
    endpoint_patterns = [
        r"['\"]/(auth|users|reports|professional)/[^'\"]*['\"]",  # Endpoint paths
        r"API_ENDPOINTS\.[A-Z_]+\.[A-Z_]+",  # API_ENDPOINTS references
        r"/api/v1/[^'\"]*",  # Direct API calls
    ]
    
    all_endpoints_found = set()
    
    for service_file in service_files:
        file_path = os.path.join(FRONTEND_PATH, service_file)
        
        if os.path.exists(file_path):
            print(f"📄 Analyzing {service_file}")
            
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
                endpoints_in_file = set()
                
                # Cerca endpoint con tutti i pattern
                for pattern in endpoint_patterns:
                    matches = re.findall(pattern, content)
                    endpoints_in_file.update(matches)
                
                # Cerca endpoint specifici
                auth_endpoints = re.findall(r"['\"]/(auth/[^'\"]*)['\"]", content)
                users_endpoints = re.findall(r"['\"]/(users/[^'\"]*)['\"]", content)
                reports_endpoints = re.findall(r"['\"]/(reports/[^'\"]*)['\"]", content)
                professional_endpoints = re.findall(r"['\"]/(professional/[^'\"]*)['\"]", content)
                
                file_endpoints = set()
                file_endpoints.update([f"/{ep}" for ep in auth_endpoints])
                file_endpoints.update([f"/{ep}" for ep in users_endpoints])
                file_endpoints.update([f"/{ep}" for ep in reports_endpoints])
                file_endpoints.update([f"/{ep}" for ep in professional_endpoints])
                
                all_endpoints_found.update(file_endpoints)
                
                print(f"  📊 Found {len(file_endpoints)} endpoints")
                for endpoint in sorted(file_endpoints):
                    print(f"    - {endpoint}")
                
                frontend_usage['service_files'][service_file] = {
                    'endpoints_count': len(file_endpoints),
                    'endpoints': list(file_endpoints)
                }
        else:
            print(f"❌ {service_file} not found")
            frontend_usage['service_files'][service_file] = {
                'endpoints_count': 0,
                'endpoints': [],
                'error': 'File not found'
            }
    
    frontend_usage['total_endpoints_used'] = len(all_endpoints_found)
    frontend_usage['endpoint_usage'] = list(all_endpoints_found)
    
    print(f"\n📊 FRONTEND SUMMARY:")
    print(f"Total unique endpoints used: {len(all_endpoints_found)}")
    
    return frontend_usage

def compare_backend_frontend():
    """Confronta endpoint backend vs frontend"""
    print("\n🔄 COMPARING BACKEND vs FRONTEND")
    print("=" * 60)
    
    # Get backend routes
    backend_routes = get_all_api_routes()
    backend_paths = set(route['path'] for route in backend_routes)
    
    # Get frontend endpoints  
    frontend_analysis = analyze_frontend_implementation()
    frontend_paths = set(frontend_analysis['endpoint_usage'])
    
    # Analisi
    used_in_frontend = backend_paths.intersection(frontend_paths)
    not_used_in_frontend = backend_paths - frontend_paths
    frontend_only = frontend_paths - backend_paths
    
    comparison = {
        'backend_total': len(backend_paths),
        'frontend_total': len(frontend_paths),
        'used_in_both': len(used_in_frontend),
        'backend_only': len(not_used_in_frontend),
        'frontend_only': len(frontend_only),
        'usage_rate': (len(used_in_frontend) / len(backend_paths) * 100) if backend_paths else 0,
        'details': {
            'used_endpoints': sorted(list(used_in_frontend)),
            'unused_endpoints': sorted(list(not_used_in_frontend)),
            'frontend_only_endpoints': sorted(list(frontend_only))
        }
    }
    
    print(f"📊 COMPARISON RESULTS:")
    print(f"Backend endpoints: {comparison['backend_total']}")
    print(f"Frontend endpoints: {comparison['frontend_total']}")
    print(f"Used in both: {comparison['used_in_both']}")
    print(f"Backend only: {comparison['backend_only']}")
    print(f"Frontend only: {comparison['frontend_only']}")    
    print(f"Usage rate: {comparison['usage_rate']:.1f}%")
    
    if comparison['details']['unused_endpoints']:
        print(f"\n❓ UNUSED BACKEND ENDPOINTS ({len(comparison['details']['unused_endpoints'])}):")
        for endpoint in comparison['details']['unused_endpoints'][:20]:  # Mostra primi 20
            print(f"  - {endpoint}")
        if len(comparison['details']['unused_endpoints']) > 20:
            print(f"  ... and {len(comparison['details']['unused_endpoints']) - 20} more")
    
    if comparison['details']['frontend_only_endpoints']:
        print(f"\n⚠️  FRONTEND-ONLY ENDPOINTS ({len(comparison['details']['frontend_only_endpoints'])}):")
        for endpoint in comparison['details']['frontend_only_endpoints']:
            print(f"  - {endpoint}")
    
    return comparison

def generate_comprehensive_report():
    """Genera un report comprensivo di tutto"""
    print("\n📋 GENERATING COMPREHENSIVE REPORT")
    print("=" * 60)
    
    # Test tutte le route
    route_results = test_all_routes()
    
    # Analizza frontend
    frontend_analysis = analyze_frontend_implementation()
    
    # Confronta backend vs frontend
    comparison = compare_backend_frontend()
    
    # Report finale
    report = {
        'timestamp': datetime.now().isoformat(),
        'backend_routes_test': route_results,
        'frontend_analysis': frontend_analysis,
        'backend_frontend_comparison': comparison,
        'summary': {
            'backend_routes_working': route_results['summary']['success_count'],
            'backend_routes_total': route_results['summary']['total_routes'],
            'backend_success_rate': route_results['summary']['success_rate'],
            'frontend_endpoints_implemented': frontend_analysis['total_endpoints_used'],
            'frontend_usage_rate': comparison['usage_rate'],
            'overall_integration_health': 'GOOD' if comparison['usage_rate'] > 50 and route_results['summary']['success_rate'] > 80 else 'NEEDS_IMPROVEMENT'
        }
    }
    
    # Salva report
    with open('complete_api_frontend_analysis.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"📄 Complete report saved: complete_api_frontend_analysis.json")
    
    # Summary finale
    print("\n" + "=" * 80)
    print("🏆 FINAL COMPREHENSIVE ANALYSIS")
    print("=" * 80)
    print(f"Backend API Status:")
    print(f"  ✅ Working routes: {report['summary']['backend_routes_working']}/{report['summary']['backend_routes_total']}")
    print(f"  📊 Success rate: {report['summary']['backend_success_rate']:.1f}%")
    print(f"Frontend Integration:")
    print(f"  🌐 Endpoints implemented: {report['summary']['frontend_endpoints_implemented']}")
    print(f"  📈 Usage rate: {report['summary']['frontend_usage_rate']:.1f}%")
    print(f"Overall Health: {report['summary']['overall_integration_health']}")
    
    return report

def main():
    print("🚀 COMPREHENSIVE API AND FRONTEND ANALYSIS")
    print("Testing ALL 103 routes and frontend implementation")
    print("=" * 80)
    
    # Verifica backend
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running")
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return
    except:
        print("❌ Backend not running. Start backend first:")
        print("cd backend && python -m uvicorn main:app --reload")
        return
    
    # Change to project directory
    project_root = os.path.dirname(os.path.abspath(__file__))
    os.chdir(project_root)
    
    # Run comprehensive analysis
    report = generate_comprehensive_report()
    
    return report

if __name__ == "__main__":
    main()
