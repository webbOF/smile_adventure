#!/usr/bin/env python3
"""
Test di Debug per Flusso di Autenticazione - Smile Adventure
Diagnostica i problemi di registrazione, login e reindirizzamento
"""

import time
import json
import requests
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service

class AuthFlowDebugger:
    def __init__(self):
        self.driver = None
        self.wait = None
        self.test_user = {
            'email': f'debug_user_{int(time.time())}@test.com',
            'password': 'DebugTest123!',
            'first_name': 'Debug',
            'last_name': 'User'
        }
        
    def setup_driver(self):
        """Configura il driver Chrome"""
        print("🚀 Configurazione del driver Chrome...")
        
        chrome_options = Options()
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        self.wait = WebDriverWait(self.driver, 15)
        
        print("✅ Driver Chrome inizializzato")
        return True
    
    def take_screenshot(self, name):
        """Cattura screenshot"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"debug_{timestamp}_{name}.png"
        self.driver.save_screenshot(filename)
        print(f"📸 Screenshot salvato: {filename}")
        return filename
    
    def debug_registration(self):
        """Debug dettagliato della registrazione"""
        print("\n🔍 DEBUG: Registrazione")
        print("=" * 50)
        
        try:
            # Naviga alla pagina di registrazione
            self.driver.get("http://localhost:3000/register")
            time.sleep(3)
            
            print(f"📍 URL corrente: {self.driver.current_url}")
            print(f"📄 Titolo pagina: {self.driver.title}")
            
            self.take_screenshot("registration_page")
            
            # Analizza tutti gli input presenti
            inputs = self.driver.find_elements(By.TAG_NAME, "input")
            print(f"🔢 Numero di input trovati: {len(inputs)}")
            
            for i, input_elem in enumerate(inputs):
                input_type = input_elem.get_attribute("type") or "text"
                input_name = input_elem.get_attribute("name") or "unknown"
                input_placeholder = input_elem.get_attribute("placeholder") or "none"
                print(f"  Input {i+1}: type='{input_type}', name='{input_name}', placeholder='{input_placeholder}'")
            
            # Compila i campi di registrazione
            print("\n📝 Compilazione form registrazione:")
            
            # Email
            email_field = self.wait.until(EC.presence_of_element_located((By.XPATH, "//input[@type='email']")))
            email_field.clear()
            email_field.send_keys(self.test_user['email'])
            print(f"✅ Email: {self.test_user['email']}")
            
            # Password
            password_field = self.driver.find_element(By.XPATH, "//input[@type='password']")
            password_field.clear()
            password_field.send_keys(self.test_user['password'])
            print("✅ Password inserita")
            
            # Nome
            try:
                first_name_field = self.driver.find_element(By.XPATH, "//input[contains(@name, 'first') or contains(@placeholder, 'Nome') or contains(@name, 'name')]")
                first_name_field.clear()
                first_name_field.send_keys(self.test_user['first_name'])
                print(f"✅ Nome: {self.test_user['first_name']}")
            except NoSuchElementException:
                print("⚠️ Campo nome non trovato")
            
            # Cognome
            try:
                last_name_field = self.driver.find_element(By.XPATH, "//input[contains(@name, 'last') or contains(@placeholder, 'Cognome') or contains(@name, 'surname')]")
                last_name_field.clear()
                last_name_field.send_keys(self.test_user['last_name'])
                print(f"✅ Cognome: {self.test_user['last_name']}")
            except NoSuchElementException:
                print("⚠️ Campo cognome non trovato")
            
            self.take_screenshot("registration_form_filled")
            
            # Invia il form
            submit_button = self.driver.find_element(By.XPATH, "//button[@type='submit']")
            print(f"🔘 Pulsante submit trovato: {submit_button.text}")
            
            submit_button.click()
            print("📤 Form di registrazione inviato")
            
            # Monitora la risposta
            print("\n⏳ Monitoraggio della risposta...")
            for i in range(10):
                current_url = self.driver.current_url
                print(f"  Tentativo {i+1}: URL = {current_url}")
                
                # Controlla se ci sono messaggi di errore
                try:
                    error_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'error') or contains(text(), 'Error') or contains(text(), 'errore')]")
                    if error_elements:
                        for error in error_elements:
                            if error.is_displayed():
                                print(f"❌ Errore trovato: {error.text}")
                except:
                    pass
                
                # Controlla se ci sono messaggi di successo
                try:
                    success_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'success') or contains(text(), 'Success') or contains(text(), 'welcome') or contains(text(), 'Welcome')]")
                    if success_elements:
                        for success in success_elements:
                            if success.is_displayed():
                                print(f"✅ Messaggio di successo: {success.text}")
                except:
                    pass
                
                if current_url != "http://localhost:3000/register":
                    print(f"🔄 Reindirizzamento rilevato: {current_url}")
                    break
                    
                time.sleep(2)
            
            self.take_screenshot("registration_result")
            
            # Controlla lo stato finale
            final_url = self.driver.current_url
            print(f"\n📍 URL finale: {final_url}")
            
            # Controlla il localStorage per token
            try:
                token = self.driver.execute_script("return localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('access_token');")
                if token:
                    print(f"🔑 Token trovato in localStorage: {token[:50]}...")
                else:
                    print("⚠️ Nessun token trovato in localStorage")
            except:
                print("❌ Errore nell'accesso al localStorage")
            
            # Controlla i cookies
            cookies = self.driver.get_cookies()
            auth_cookies = [c for c in cookies if 'token' in c['name'].lower() or 'auth' in c['name'].lower()]
            if auth_cookies:
                print(f"🍪 Cookie di autenticazione trovati: {len(auth_cookies)}")
                for cookie in auth_cookies:
                    print(f"  - {cookie['name']}")
            else:
                print("⚠️ Nessun cookie di autenticazione trovato")
                
        except Exception as e:
            print(f"❌ Errore durante debug registrazione: {e}")
            self.take_screenshot("registration_error")
    
    def debug_login(self):
        """Debug dettagliato del login"""
        print("\n🔍 DEBUG: Login")
        print("=" * 50)
        
        try:
            # Naviga alla pagina di login
            self.driver.get("http://localhost:3000/login")
            time.sleep(3)
            
            print(f"📍 URL corrente: {self.driver.current_url}")
            self.take_screenshot("login_page")
            
            # Compila i campi di login
            email_field = self.wait.until(EC.presence_of_element_located((By.XPATH, "//input[@type='email']")))
            email_field.clear()
            email_field.send_keys(self.test_user['email'])
            print(f"✅ Email login: {self.test_user['email']}")
            
            password_field = self.driver.find_element(By.XPATH, "//input[@type='password']")
            password_field.clear()
            password_field.send_keys(self.test_user['password'])
            print("✅ Password login inserita")
            
            self.take_screenshot("login_form_filled")
            
            # Invia il form di login
            submit_button = self.driver.find_element(By.XPATH, "//button[@type='submit']")
            submit_button.click()
            print("📤 Form di login inviato")
            
            # Monitora la risposta del login
            print("\n⏳ Monitoraggio risposta login...")
            for i in range(10):
                current_url = self.driver.current_url
                print(f"  Tentativo {i+1}: URL = {current_url}")
                
                # Controlla errori di login
                try:
                    error_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Invalid') or contains(text(), 'incorrect') or contains(text(), 'failed')]")
                    if error_elements:
                        for error in error_elements:
                            if error.is_displayed():
                                print(f"❌ Errore login: {error.text}")
                except:
                    pass
                
                if current_url != "http://localhost:3000/login":
                    print(f"🔄 Reindirizzamento login rilevato: {current_url}")
                    break
                    
                time.sleep(2)
            
            self.take_screenshot("login_result")
            
            # Controlla se siamo loggati
            try:
                token = self.driver.execute_script("return localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('access_token');")
                if token:
                    print(f"🔑 Token dopo login: {token[:50]}...")
                else:
                    print("⚠️ Nessun token dopo login")
            except:
                print("❌ Errore nell'accesso al localStorage dopo login")
                
        except Exception as e:
            print(f"❌ Errore durante debug login: {e}")
            self.take_screenshot("login_error")
    
    def debug_api_calls(self):
        """Debug delle chiamate API"""
        print("\n🔍 DEBUG: API Calls")
        print("=" * 50)
        
        try:
            # Test registrazione via API diretta
            print("📡 Test registrazione API diretta...")
            registration_data = {
                "email": self.test_user['email'],
                "password": self.test_user['password'],
                "first_name": self.test_user['first_name'],
                "last_name": self.test_user['last_name'],
                "role": "parent"
            }
            
            try:
                response = requests.post(
                    "http://localhost:8000/api/v1/auth/register",
                    json=registration_data,
                    timeout=10
                )
                print(f"📊 Status registrazione API: {response.status_code}")
                print(f"📄 Risposta registrazione: {response.text[:200]}...")
                
                if response.status_code == 201:
                    print("✅ Registrazione API riuscita")
                elif response.status_code == 400:
                    print("⚠️ Utente potrebbe già esistere")
                else:
                    print(f"❌ Registrazione API fallita: {response.status_code}")
                    
            except requests.exceptions.RequestException as e:
                print(f"❌ Errore chiamata API registrazione: {e}")
            
            # Test login via API diretta
            print("\n📡 Test login API diretta...")
            login_data = {
                "username": self.test_user['email'],  # Spesso il backend usa 'username' invece di 'email'
                "password": self.test_user['password']
            }
            
            try:
                response = requests.post(
                    "http://localhost:8000/api/v1/auth/login",
                    data=login_data,  # Spesso il login usa form-data
                    timeout=10
                )
                print(f"📊 Status login API: {response.status_code}")
                print(f"📄 Risposta login: {response.text[:200]}...")
                
                if response.status_code == 200:
                    try:
                        token_data = response.json()
                        print(f"🔑 Token ricevuto: {str(token_data)[:100]}...")
                    except:
                        print("⚠️ Risposta login non è JSON valido")
                else:
                    print(f"❌ Login API fallito: {response.status_code}")
                    
            except requests.exceptions.RequestException as e:
                print(f"❌ Errore chiamata API login: {e}")
                
        except Exception as e:
            print(f"❌ Errore durante debug API: {e}")
    
    def run_debug(self):
        """Esegue tutti i test di debug"""
        try:
            print("🔍 AVVIO DEBUG COMPLETO AUTENTICAZIONE")
            print("=" * 60)
            
            if not self.setup_driver():
                return False
            
            # Debug registrazione
            self.debug_registration()
            
            # Debug login
            self.debug_login()
            
            # Debug API
            self.debug_api_calls()
            
            print("\n" + "=" * 60)
            print("🏁 DEBUG COMPLETATO")
            
        except Exception as e:
            print(f"❌ Errore generale durante debug: {e}")
        finally:
            if self.driver:
                self.driver.quit()
                print("🧹 Driver chiuso")

if __name__ == "__main__":
    debugger = AuthFlowDebugger()
    debugger.run_debug()
