#!/usr/bin/env python3
"""
Debug specifico per localStorage durante login
"""
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

def debug_login_localStorage():
    """Debug specifico del localStorage durante login"""
    
    options = Options()
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")
    options.set_capability("goog:loggingPrefs", {"browser": "ALL"})
    
    driver = webdriver.Chrome(options=options)
    wait = WebDriverWait(driver, 20)
    
    try:
        print("🔍 DEBUG LOCALSTORAGE LOGIN")
        print("=" * 50)
        
        # Registra un nuovo utente prima
        email = f'localStorage.test.{int(time.time())}@example.com'
        password = 'TestPassword123!'
        
        # Registrazione
        driver.get("http://localhost:3000/register")
        time.sleep(3)
        
        test_data = {
            'firstName': 'LocalStorage',
            'lastName': 'Test',
            'email': email,
            'password': password,
            'confirmPassword': password
        }
        
        for field_id, value in test_data.items():
            field = driver.find_element(By.ID, field_id)
            field.clear()
            field.send_keys(value)
            time.sleep(0.5)
        
        terms_checkbox = driver.find_element(By.ID, "terms")
        terms_checkbox.click()
        time.sleep(1)
        
        submit_btn = driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
        submit_btn.click()
        time.sleep(5)
        
        print(f"✅ Utente registrato: {email}")
        
        # Ora testa il login con monitoraggio localStorage
        if "login" not in driver.current_url:
            driver.get("http://localhost:3000/login")
            time.sleep(3)
        
        # Setup monitoraggio localStorage dettagliato
        monitor_script = """
            window.localStorageChanges = [];
            window.loginEvents = [];
            
            // Override localStorage.setItem
            const originalSetItem = localStorage.setItem;
            localStorage.setItem = function(key, value) {
                console.log('🔧 LOCALSTORAGE SET:', key, '=', value ? value.substring(0, 100) + '...' : value);
                window.localStorageChanges.push({
                    action: 'set',
                    key: key,
                    value: value,
                    timestamp: new Date().toISOString(),
                    stackTrace: new Error().stack
                });
                return originalSetItem.apply(this, arguments);
            };
            
            // Override fetch per monitorare login
            const originalFetch = window.fetch;
            window.fetch = function(...args) {
                if (args[0] && args[0].includes('/auth/login')) {
                    console.log('🔐 LOGIN REQUEST DETECTED:', args[0]);
                    window.loginEvents.push({
                        type: 'request',
                        url: args[0],
                        timestamp: new Date().toISOString()
                    });
                }
                
                return originalFetch.apply(this, args)
                    .then(response => {
                        if (args[0] && args[0].includes('/auth/login')) {
                            console.log('🔐 LOGIN RESPONSE:', response.status, response.statusText);
                            window.loginEvents.push({
                                type: 'response',
                                status: response.status,
                                statusText: response.statusText,
                                timestamp: new Date().toISOString()
                            });
                            
                            // Clone response per leggere il body
                            response.clone().text().then(text => {
                                console.log('🔐 LOGIN RESPONSE BODY:', text);
                                window.loginEvents.push({
                                    type: 'responseBody',
                                    body: text,
                                    timestamp: new Date().toISOString()
                                });
                            });
                        }
                        return response;
                    })
                    .catch(error => {
                        if (args[0] && args[0].includes('/auth/login')) {
                            console.error('🔐 LOGIN ERROR:', error);
                            window.loginEvents.push({
                                type: 'error',
                                error: error.message,
                                timestamp: new Date().toISOString()
                            });
                        }
                        throw error;
                    });
            };
            
            console.log('🔧 LocalStorage and Login monitoring setup completed');
        """
        
        driver.execute_script(monitor_script)
        time.sleep(1)
        
        # Controlla localStorage prima del login
        before_storage = driver.execute_script("""
            return {
                smile_adventure_token: localStorage.getItem('smile_adventure_token'),
                smile_adventure_user: localStorage.getItem('smile_adventure_user'),
                token: localStorage.getItem('token'),
                user: localStorage.getItem('user'),
                allKeys: Object.keys(localStorage),
                length: localStorage.length
            };
        """)
        
        print(f"\n📋 LOCALSTORAGE PRIMA DEL LOGIN:")
        print(f"   Keys totali: {before_storage['length']}")
        print(f"   Keys: {before_storage['allKeys']}")
        for key in ['smile_adventure_token', 'smile_adventure_user', 'token', 'user']:
            value = before_storage.get(key)
            print(f"   {key}: {'PRESENTE' if value else 'ASSENTE'}")
        
        # Esegui login
        email_field = driver.find_element(By.ID, "email")
        password_field = driver.find_element(By.ID, "password")
        
        email_field.clear()
        email_field.send_keys(email)
        time.sleep(0.5)
        
        password_field.clear()
        password_field.send_keys(password)
        time.sleep(0.5)
        
        print(f"\n🔐 ESECUZIONE LOGIN CON: {email}")
        
        submit_btn = driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
        submit_btn.click()
        
        # Monitora i cambiamenti per 10 secondi
        for i in range(10):
            time.sleep(1)
            current_url = driver.current_url
            print(f"   [{i+1}/10] URL: {current_url}")
            
            # Controlla se ci sono stati cambiamenti in localStorage
            storage_changes = driver.execute_script("return window.localStorageChanges || [];")
            if storage_changes and len(storage_changes) > 0:
                print(f"   📝 Cambiamenti localStorage rilevati: {len(storage_changes)}")
                break
        
        # Analisi finale
        print(f"\n📊 ANALISI FINALE:")
        print(f"   📍 URL finale: {driver.current_url}")
        
        # Controlla localStorage dopo il login
        after_storage = driver.execute_script("""
            return {
                smile_adventure_token: localStorage.getItem('smile_adventure_token'),
                smile_adventure_user: localStorage.getItem('smile_adventure_user'),
                token: localStorage.getItem('token'),
                user: localStorage.getItem('user'),
                allKeys: Object.keys(localStorage),
                length: localStorage.length
            };
        """)
        
        print(f"\n📋 LOCALSTORAGE DOPO IL LOGIN:")
        print(f"   Keys totali: {after_storage['length']}")
        print(f"   Keys: {after_storage['allKeys']}")
        for key in ['smile_adventure_token', 'smile_adventure_user', 'token', 'user']:
            value = after_storage.get(key)
            if value:
                print(f"   ✅ {key}: {value[:50]}...")
            else:
                print(f"   ❌ {key}: ASSENTE")
        
        # Analizza i cambiamenti in localStorage
        storage_changes = driver.execute_script("return window.localStorageChanges || [];")
        if storage_changes:
            print(f"\n📝 CAMBIAMENTI LOCALSTORAGE ({len(storage_changes)}):")
            for change in storage_changes:
                print(f"   - {change['action'].upper()} {change['key']}: {change['value'][:50] if change['value'] else 'null'}...")
                print(f"     Timestamp: {change['timestamp']}")
        else:
            print(f"\n⚠️ NESSUN CAMBIAMENTO IN LOCALSTORAGE RILEVATO")
        
        # Analizza gli eventi di login
        login_events = driver.execute_script("return window.loginEvents || [];")
        if login_events:
            print(f"\n🔐 EVENTI LOGIN ({len(login_events)}):")
            for event in login_events:
                if event['type'] == 'request':
                    print(f"   📤 REQUEST: {event['url']}")
                elif event['type'] == 'response':
                    print(f"   📥 RESPONSE: {event['status']} {event['statusText']}")
                elif event['type'] == 'responseBody':
                    print(f"   📄 BODY: {event['body'][:100]}...")
                elif event['type'] == 'error':
                    print(f"   ❌ ERROR: {event['error']}")
        else:
            print(f"\n⚠️ NESSUN EVENTO LOGIN RILEVATO")
        
        # Determina risultato
        if after_storage.get('smile_adventure_token'):
            print(f"\n✅ TOKEN SALVATO CORRETTAMENTE")
            if "dashboard" in driver.current_url or "parent" in driver.current_url:
                print(f"✅ LOGIN COMPLETAMENTE RIUSCITO")
                return True
            else:
                print(f"⚠️ Token salvato ma routing problematico")
                return False
        else:
            print(f"\n❌ TOKEN NON SALVATO - LOGIN FALLITO")
            return False
            
    except Exception as e:
        print(f"❌ Errore durante debug: {e}")
        return False
    finally:
        input("🔍 Premi INVIO per chiudere il browser...")
        driver.quit()

if __name__ == "__main__":
    debug_login_localStorage()
