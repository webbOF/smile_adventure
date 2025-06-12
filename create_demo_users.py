#!/usr/bin/env python3
"""
Script per creare utenti demo per testare la dashboard
"""
import requests
import json

# Create test users with valid domains
test_users = [
    {
        'email': 'parent@demo.com',
        'password': 'TestParent123!',
        'password_confirm': 'TestParent123!',
        'first_name': 'Demo',
        'last_name': 'Parent',
        'role': 'parent'
    },    {
        'email': 'dentist@demo.com', 
        'password': 'TestDentist123!',
        'password_confirm': 'TestDentist123!',
        'first_name': 'Demo',
        'last_name': 'Dentist',
        'role': 'professional',
        'license_number': 'DT123456',
        'specialization': 'Pediatric Dentistry',
        'clinic_name': 'Demo Dental Clinic'
    }
]

print('🔧 CREAZIONE UTENTI DEMO')
print('=' * 50)

created_users = []

for user_data in test_users:
    try:
        print(f'📝 Creando utente: {user_data["email"]}')
        
        response = requests.post(
            'http://localhost:8000/api/v1/auth/register',
            json=user_data,
            timeout=10
        )
        
        if response.status_code == 201:
            result = response.json()
            print(f'✅ Utente creato: {user_data["email"]}')
            
            # Test immediate login (if auto-verified)
            login_data = {
                'username': user_data['email'],
                'password': user_data['password']
            }
            
            login_response = requests.post(
                'http://localhost:8000/api/v1/auth/login',
                data=login_data,
                timeout=10
            )
            
            if login_response.status_code == 200:
                print(f'🔐 Login funziona per: {user_data["email"]}')
                created_users.append(user_data)
            else:
                print(f'📧 Login richiede verifica email per: {user_data["email"]}')
                created_users.append({**user_data, 'needs_verification': True})
        else:
            print(f'❌ Errore creazione: {response.status_code} - {response.text}')
            
    except Exception as e:
        print(f'💥 Errore: {e}')

print(f'\n🎯 CREDENZIALI DEMO DISPONIBILI:')
print('=' * 50)

if created_users:
    for user in created_users:
        print(f'**{user["role"].upper()}:**')
        print(f'  📧 Email: {user["email"]}')
        print(f'  🔑 Password: {user["password"]}')
        if user.get('needs_verification'):
            print(f'  ⚠️  Status: Richiede verifica email')
        else:
            print(f'  ✅ Status: Pronto per login')
        print()
    
    print('🌐 ACCESSO ALLA DASHBOARD:')
    print('=' * 30)
    print('1. Vai su: http://localhost:3000')
    print('2. Clicca su "Accedi"')
    print('3. Usa le credenziali sopra')
    print('4. Se richiede verifica email, controlla i log del backend')
else:
    print('❌ Nessun utente creato con successo')
    print('💡 Verifica che il backend sia in esecuzione su localhost:8000')
