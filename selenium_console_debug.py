#!/usr/bin/env python3
"""
Debug con monitoraggio console browser
"""
import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

class BrowserConsoleDebug:
    def __init__(self):
        self.driver = None
        self.wait = None
    def setup_driver_with_logging(self):
        """Setup Chrome driver con logging del console"""
        options = Options()
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--window-size=1920,1080")
        options.add_argument("--enable-logging")
        options.add_argument("--v=1")
        
        # Enable logging in options
        options.set_capability("goog:loggingPrefs", {"browser": "ALL"})
        
        try:
            self.driver = webdriver.Chrome(options=options)
            self.wait = WebDriverWait(self.driver, 20)
            print("✅ Chrome driver with logging initialized")
            return True
        except Exception as e:
            print(f"❌ Errore inizializzazione driver: {e}")
            return False
    
    def get_console_logs(self):
        """Ottiene i log del console browser"""
        try:
            logs = self.driver.get_log('browser')
            return logs
        except Exception as e:
            print(f"⚠️ Impossibile ottenere log console: {e}")
            return []
    
    def print_console_logs(self, prefix=""):
        """Stampa i log del console"""
        logs = self.get_console_logs()
        if logs:
            print(f"\n📋 CONSOLE LOGS {prefix}:")
            for log in logs:
                level = log['level']
                message = log['message']
                timestamp = log['timestamp']
                
                emoji = "🔍" if level == "INFO" else "⚠️" if level == "WARNING" else "❌" if level == "SEVERE" else "📝"
                print(f"   {emoji} [{level}] {message}")
        else:
            print(f"\n📋 Nessun log console {prefix}")
    
    def test_registration_with_logging(self):
        """Test registrazione con monitoraggio completo"""
        try:
            print("\n🔍 TEST REGISTRAZIONE CON MONITORAGGIO CONSOLE")
            print("=" * 60)
            
            # Naviga alla pagina di registrazione
            self.driver.get("http://localhost:3000/register")
            time.sleep(3)
            
            self.print_console_logs("dopo caricamento pagina")
            
            # Compila form
            test_data = {
                'firstName': 'Console',
                'lastName': 'Test',
                'email': f'console.test.{int(time.time())}@example.com',
                'password': 'TestPassword123!',
                'confirmPassword': 'TestPassword123!'
            }
            
            print(f"\n📧 Email di test: {test_data['email']}")
            
            # Compila i campi
            for field_id, value in test_data.items():
                field = self.driver.find_element(By.ID, field_id)
                field.clear()
                field.send_keys(value)
                time.sleep(0.5)
            
            # Checkbox termini
            terms_checkbox = self.driver.find_element(By.ID, "terms")
            terms_checkbox.click()
            time.sleep(1)
            
            self.print_console_logs("dopo compilazione form")
              # Aggiungi listener per network requests (JavaScript injection)
            script = """
                window.registrationAttempts = [];
                
                // Override fetch to monitor requests
                const originalFetch = window.fetch;
                window.fetch = function(...args) {
                    console.log('FETCH REQUEST:', args[0], args[1]);
                    window.registrationAttempts.push({
                        url: args[0],
                        options: args[1],
                        timestamp: new Date().toISOString()
                    });
                    
                    return originalFetch.apply(this, args)
                        .then(response => {
                            console.log('FETCH RESPONSE:', response.status, response.statusText);
                            return response;
                        })
                        .catch(error => {
                            console.error('FETCH ERROR:', error);
                            throw error;
                        });
                };
                
                // Override XMLHttpRequest
                const originalXHR = window.XMLHttpRequest;
                window.XMLHttpRequest = function() {
                    const xhr = new originalXHR();
                    const originalSend = xhr.send;
                    
                    xhr.send = function(data) {
                        console.log('XHR REQUEST:', xhr.method || 'GET', xhr.url || 'unknown', data);
                        return originalSend.apply(this, arguments);
                    };
                    
                    return xhr;
                };
                
                console.log('Network monitoring setup completed');
            """
            
            self.driver.execute_script(script)
            time.sleep(1)
            
            self.print_console_logs("dopo setup network monitoring")
            
            # Submit form
            submit_btn = self.driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
            submit_btn.click()
            
            print("✅ Form inviato, attendendo risposta...")
            time.sleep(5)  # Attende più a lungo per la risposta
            
            self.print_console_logs("dopo submit form")
            
            # Controlla network attempts
            attempts = self.driver.execute_script("return window.registrationAttempts || [];")
            if attempts:
                print("\n🌐 NETWORK REQUESTS RILEVATE:")
                for attempt in attempts:
                    print(f"   📡 {attempt['url']}")
                    if 'options' in attempt and attempt['options']:
                        print(f"      Method: {attempt['options'].get('method', 'GET')}")
                        print(f"      Headers: {attempt['options'].get('headers', {})}")
            else:
                print("\n⚠️ NESSUNA NETWORK REQUEST RILEVATA!")
            
            # Controlla URL finale
            final_url = self.driver.current_url
            print(f"\n📍 URL finale: {final_url}")
            
            if "dashboard" in final_url or "parent" in final_url:
                print("✅ Reindirizzamento alla dashboard riuscito!")
                return True
            elif "login" in final_url:
                print("✅ Reindirizzamento al login riuscito!")
                return True
            else:
                print("❌ Nessun reindirizzamento rilevato")
                return False
                
        except Exception as e:
            print(f"❌ Errore durante test: {e}")
            self.print_console_logs("dopo errore")
            return False
    
    def test_login_with_logging(self):
        """Test login con monitoraggio completo"""
        try:
            print("\n🔍 TEST LOGIN CON MONITORAGGIO CONSOLE")
            print("=" * 60)
            
            # Naviga alla pagina di login
            self.driver.get("http://localhost:3000/login")
            time.sleep(3)
            
            self.print_console_logs("dopo caricamento pagina login")
            
            # Credenziali di test (usa un utente che dovrebbe già esistere)
            login_data = {
                'email': 'console.test.1749685372@example.com',  # Email dal test precedente
                'password': 'TestPassword123!'
            }
            
            print(f"\n📧 Email di login: {login_data['email']}")
            
            # Setup network monitoring
            script = """
                window.loginAttempts = [];
                
                // Override fetch to monitor requests
                const originalFetch = window.fetch;
                window.fetch = function(...args) {
                    console.log('LOGIN FETCH REQUEST:', args[0], args[1]);
                    window.loginAttempts.push({
                        url: args[0],
                        options: args[1],
                        timestamp: new Date().toISOString()
                    });
                    
                    return originalFetch.apply(this, args)
                        .then(response => {
                            console.log('LOGIN FETCH RESPONSE:', response.status, response.statusText);
                            return response;
                        })
                        .catch(error => {
                            console.error('LOGIN FETCH ERROR:', error);
                            throw error;
                        });
                };
                
                // Monitor localStorage changes
                const originalSetItem = localStorage.setItem;
                localStorage.setItem = function(key, value) {
                    console.log('LOCALSTORAGE SET:', key, value ? value.substring(0, 50) + '...' : value);
                    return originalSetItem.apply(this, arguments);
                };
                
                console.log('Login monitoring setup completed');
            """
            
            self.driver.execute_script(script)
            time.sleep(1)
            
            # Compila i campi di login
            try:
                email_field = self.driver.find_element(By.ID, "email")
                password_field = self.driver.find_element(By.ID, "password")
                
                email_field.clear()
                email_field.send_keys(login_data['email'])
                time.sleep(0.5)
                
                password_field.clear()
                password_field.send_keys(login_data['password'])
                time.sleep(0.5)
                
                print("✅ Campi di login compilati")
            except Exception as e:
                print(f"❌ Errore compilazione campi: {e}")
                return False
            
            self.print_console_logs("dopo compilazione campi login")
            
            # Submit form
            try:
                submit_btn = self.driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
                submit_btn.click()
                print("✅ Form login inviato")
            except Exception as e:
                print(f"❌ Errore submit login: {e}")
                return False
            
            # Attendi risposta
            time.sleep(5)
            
            self.print_console_logs("dopo submit login")
            
            # Controlla network attempts
            attempts = self.driver.execute_script("return window.loginAttempts || [];")
            if attempts:
                print("\n🌐 LOGIN NETWORK REQUESTS:")
                for attempt in attempts:
                    print(f"   📡 {attempt['url']}")
                    if 'options' in attempt and attempt['options']:
                        method = attempt['options'].get('method', 'GET')
                        headers = attempt['options'].get('headers', {})
                        print(f"      Method: {method}")
                        print(f"      Headers: {headers}")
                        if 'body' in attempt['options']:
                            print(f"      Body: {attempt['options']['body'][:100]}...")
            else:
                print("\n⚠️ NESSUNA LOGIN REQUEST RILEVATA!")
            
            # Controlla localStorage per token
            token_info = self.driver.execute_script("""
                return {
                    token: localStorage.getItem('token'),
                    user: localStorage.getItem('user'),
                    keys: Object.keys(localStorage)
                };
            """)
            
            print(f"\n🔐 LOCALSTORAGE INFO:")
            print(f"   Keys: {token_info['keys']}")
            if token_info['token']:
                print(f"   Token: {token_info['token'][:50]}...")
            else:
                print("   Token: NON TROVATO")
            if token_info['user']:
                print(f"   User: {token_info['user'][:100]}...")
            else:
                print("   User: NON TROVATO")
            
            # Controlla URL finale
            final_url = self.driver.current_url
            print(f"\n📍 URL finale: {final_url}")
            
            if "dashboard" in final_url or "parent" in final_url:
                print("✅ Login riuscito - reindirizzato alla dashboard!")
                return True
            elif "login" in final_url:
                print("❌ Login fallito - ancora sulla pagina di login")
                return False
            elif final_url == "http://localhost:3000/" or final_url == "http://localhost:3000":
                print("⚠️ Reindirizzato alla homepage - possibile problema di autenticazione")
                return False
            else:
                print(f"🔍 URL inaspettato: {final_url}")
                return False
                
        except Exception as e:
            print(f"❌ Errore durante test login: {e}")
            self.print_console_logs("dopo errore login")
            return False

    def test_full_flow_with_logging(self):
        """Test del flusso completo: registrazione + login"""
        try:
            print("\n🔍 TEST FLUSSO COMPLETO: REGISTRAZIONE + LOGIN")
            print("=" * 60)
            
            # Test registrazione
            print("\n🟡 FASE 1: REGISTRAZIONE")
            reg_success = self.test_registration_with_logging()
            
            if not reg_success:
                print("❌ Registrazione fallita, interrompo il test")
                return False
            
            print("\n🟡 FASE 2: LOGIN")
            # Attendiamo un momento prima del login
            time.sleep(2)
            
            login_success = self.test_login_with_logging()
            
            if login_success:
                print("\n✅ FLUSSO COMPLETO RIUSCITO!")
                return True
            else:
                print("\n❌ LOGIN FALLITO NEL FLUSSO COMPLETO")
                return False
                
        except Exception as e:
            print(f"❌ Errore durante flusso completo: {e}")
            return False    
    def run_debug(self):
        """Esegue il debug completo"""
        print("🔍 BROWSER CONSOLE DEBUG")
        print("=" * 50)
        
        if not self.setup_driver_with_logging():
            return False
            
        try:
            return self.test_full_flow_with_logging()
        finally:
            if self.driver:
                input("🔍 Premi INVIO per chiudere il browser...")
                self.driver.quit()

if __name__ == "__main__":
    debug = BrowserConsoleDebug()
    debug.run_debug()
