#!/usr/bin/env python3
"""
Script per verificare tutte le API routes implementate nel file api.py
"""

import sys
import os

# Aggiungi il path del backend
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

try:
    from app.api.v1.api import api_v1_router
    from fastapi.routing import APIRoute
    
    print('=== VERIFICA API ROUTES DAL FILE api.py ===\n')
    
    # Conta tutte le route
    total_routes = 0
    routes_by_prefix = {}
    
    def extract_routes(router, prefix=''):
        global total_routes
        for route in router.routes:
            if hasattr(route, 'path'):
                total_routes += 1
                full_path = prefix + route.path
                methods = list(route.methods) if hasattr(route, 'methods') and route.methods else ['GET']
                
                # Raggruppa per prefisso
                route_prefix = full_path.split('/')[1] if full_path.startswith('/') and len(full_path.split('/')) > 1 else 'root'
                if route_prefix not in routes_by_prefix:
                    routes_by_prefix[route_prefix] = []
                
                for method in methods:
                    if method != 'HEAD':  # Escludi HEAD automatico
                        routes_by_prefix[route_prefix].append(f'{method} {full_path}')
            
            # Se ha sub-routers, analizzali ricorsivamente
            if hasattr(route, 'router'):
                sub_prefix = route.path if hasattr(route, 'path') else ''
                extract_routes(route.router, prefix + sub_prefix)
    
    extract_routes(api_v1_router)
    
    print(f'TOTALE ROUTES TROVATE: {total_routes}\n')
    
    for prefix, routes in sorted(routes_by_prefix.items()):
        print(f'📁 {prefix.upper()}:')
        for route in sorted(routes):
            print(f'  ✅ {route}')
        print()
    
    # Verifica implementazione specifica delle route dal file api.py
    print('=== VERIFICA ROUTE SPECIFICHE DAL FILE api.py ===\n')
    
    # Route che dovrebbero essere implementate secondo il file api.py
    expected_routes = {
        'Auth Routes (/auth)': [
            'POST /auth/register',
            'POST /auth/login', 
            'POST /auth/logout',
            'POST /auth/refresh',
            'GET /auth/me',
            'PUT /auth/me',
            'POST /auth/change-password',
            'POST /auth/forgot-password',
            'POST /auth/reset-password'
        ],
        'Users Routes (/users)': [
            'GET /users/dashboard',
            'GET /users/profile',
            'PUT /users/profile',
            'POST /users/profile/avatar',
            'GET /users/preferences',
            'PUT /users/preferences',
            'GET /users/children',
            'POST /users/children',
            'GET /users/children/{id}',
            'PUT /users/children/{id}',
            'DELETE /users/children/{id}'
        ],
        'Reports Routes (/reports)': [
            'GET /reports/dashboard',
            'GET /reports/child/{id}/progress',
            'GET /reports/analytics',
            'GET /reports/clinical'
        ],
        'Professional Routes (/professional)': [
            'GET /professional/profile',
            'POST /professional/profile', 
            'PUT /professional/profile',
            'GET /professional/search'
        ],
        'API Info Routes': [
            'GET /',
            'GET /health',
            'GET /endpoints'
        ]
    }
    
    # Confronta con le route effettivamente trovate
    all_found_routes = []
    for routes in routes_by_prefix.values():
        all_found_routes.extend(routes)
    
    for category, expected in expected_routes.items():
        print(f'📋 {category}:')
        for expected_route in expected:
            # Rimuovi il prefisso per il confronto
            route_to_check = expected_route
            if any(route_to_check in found for found in all_found_routes):
                print(f'  ✅ {expected_route} - IMPLEMENTATA')
            else:
                print(f'  ❌ {expected_route} - MANCANTE')
        print()

except ImportError as e:
    print(f'❌ Errore di import: {e}')
    print('Verifico se il modulo api.py esiste...')
    
    api_file = os.path.join(os.path.dirname(__file__), 'backend', 'app', 'api', 'v1', 'api.py')
    if os.path.exists(api_file):
        print(f'✅ File {api_file} esiste')
        # Leggi il contenuto per vedere cosa c'è
        with open(api_file, 'r', encoding='utf-8') as f:
            content = f.read()
            if 'api_v1_router' in content:
                print('✅ api_v1_router trovato nel file')
            else:
                print('❌ api_v1_router NON trovato nel file')
    else:
        print(f'❌ File {api_file} NON esiste')

except Exception as e:
    print(f'❌ Errore durante la verifica: {e}')
    import traceback
    traceback.print_exc()
