#!/usr/bin/env python3
"""
Debug specifico per il processo di login
"""
import time
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

class LoginDebugTest:
    def __init__(self):
        self.driver = None
        self.wait = None
        self.test_email = f"login.debug.{int(time.time())}@example.com"
        self.test_password = "TestPassword123!"
        
    def setup_driver(self):
        """Setup Chrome driver"""
        options = Options()
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--window-size=1920,1080")
        
        try:
            self.driver = webdriver.Chrome(options=options)
            self.wait = WebDriverWait(self.driver, 20)
            print("✅ Chrome driver initialized")
            return True
        except Exception as e:
            print(f"❌ Errore inizializzazione driver: {e}")
            return False
    
    def test_direct_api_registration_and_login(self):
        """Test diretto delle API di registrazione e login"""
        print("\n🧪 TEST DIRETTO API REGISTRAZIONE E LOGIN")
        print("=" * 60)
        
        # Test registrazione diretta
        registration_data = {
            "email": self.test_email,
            "password": self.test_password,
            "confirmPassword": self.test_password,
            "firstName": "Login",
            "lastName": "Debug",
            "role": "parent"
        }
        
        try:
            reg_response = requests.post(
                "http://localhost:8000/api/v1/auth/register",
                json=registration_data,
                timeout=10
            )
            
            if reg_response.status_code == 201:
                print("✅ Registrazione API riuscita")
                reg_data = reg_response.json()
                
                if "token" in reg_data:
                    print("✅ Token ricevuto dalla registrazione")
                    token = reg_data["token"]["access_token"]
                    
                    # Test del token
                    auth_test = requests.get(
                        "http://localhost:8000/api/v1/auth/me",
                        headers={"Authorization": f"Bearer {token}"},
                        timeout=5
                    )
                    
                    if auth_test.status_code == 200:
                        print("✅ Token valido per auth/me")
                        print(f"👤 User data: {auth_test.json()}")
                    else:
                        print(f"❌ Token non valido: {auth_test.status_code}")
                        
            else:
                print(f"❌ Registrazione API fallita: {reg_response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Errore durante registrazione API: {e}")
            return False
        
        # Test login API
        try:
            login_data = {
                "username": self.test_email,
                "password": self.test_password
            }
            
            login_response = requests.post(
                "http://localhost:8000/api/v1/auth/login",
                data=login_data,  # Form data per login
                timeout=10
            )
            
            if login_response.status_code == 200:
                print("✅ Login API riuscito")
                login_data = login_response.json()
                print(f"📄 Login response: {login_data}")
                return True
            else:
                print(f"❌ Login API fallito: {login_response.status_code}")
                print(f"❌ Response: {login_response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Errore durante login API: {e}")
            return False
    
    def test_browser_login_flow(self):
        """Test completo del flusso di login nel browser"""
        print("\n🧪 TEST FLUSSO LOGIN NEL BROWSER")
        print("=" * 60)
        
        try:
            # Naviga alla pagina di login
            self.driver.get("http://localhost:3000/login")
            self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "form")))
            
            print(f"📍 URL login: {self.driver.current_url}")
            
            # Compila i campi
            email_field = self.driver.find_element(By.ID, "email")
            email_field.clear()
            email_field.send_keys(self.test_email)
            
            password_field = self.driver.find_element(By.ID, "password")
            password_field.clear()
            password_field.send_keys(self.test_password)
            
            print(f"📧 Email: {self.test_email}")
            print("🔑 Password inserita")
            
            # Screenshot prima del submit
            self.driver.save_screenshot("debug_login_before_submit.png")
            
            # Submit del form
            submit_btn = self.driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
            submit_btn.click()
            
            print("✅ Form login inviato")
            time.sleep(5)  # Attende per il reindirizzamento
            
            # Screenshot dopo submit
            self.driver.save_screenshot("debug_login_after_submit.png")
            
            # Controlla risultato
            current_url = self.driver.current_url
            print(f"📍 URL dopo login: {current_url}")
            
            # Controlla localStorage per token
            token = self.driver.execute_script("return localStorage.getItem('access_token') || localStorage.getItem('token');")
            user_data = self.driver.execute_script("return localStorage.getItem('user') || localStorage.getItem('userData');")
            
            if token:
                print("✅ Token trovato in localStorage")
                print(f"🔑 Token: {token[:50]}...")
            else:
                print("❌ Nessun token in localStorage")
            
            if user_data:
                print("✅ Dati utente trovati in localStorage")
                print(f"👤 User: {user_data}")
            else:
                print("❌ Nessun dato utente in localStorage")
            
            # Controlla cookie
            cookies = self.driver.get_cookies()
            auth_cookies = [cookie for cookie in cookies if 'token' in cookie['name'].lower() or 'auth' in cookie['name'].lower()]
            
            if auth_cookies:
                print(f"✅ Cookie di autenticazione trovati: {len(auth_cookies)}")
                for cookie in auth_cookies:
                    print(f"🍪 {cookie['name']}: {cookie['value'][:30]}...")
            else:
                print("❌ Nessun cookie di autenticazione")
            
            # Analizza il risultato
            if "/parent" in current_url or "/professional" in current_url or "/dashboard" in current_url:
                print("✅ Login riuscito - reindirizzato alla dashboard")
                return True
            elif current_url == "http://localhost:3000/":
                print("⚠️ Reindirizzato alla homepage invece della dashboard")
                return False
            elif "/login" in current_url:
                print("❌ Rimasto sulla pagina di login - credenziali non valide?")
                return False
            else:
                print(f"🔍 URL inaspettato: {current_url}")
                return False
                
        except Exception as e:
            print(f"❌ Errore durante test browser: {e}")
            return False
    
    def run_debug(self):
        """Esegue tutti i test di debug"""
        print("🔍 LOGIN DEBUG COMPLETO")
        print("=" * 50)
        
        # Test API
        if not self.test_direct_api_registration_and_login():
            print("❌ Test API fallito")
            return False
        
        # Test browser
        if not self.setup_driver():
            return False
            
        try:
            return self.test_browser_login_flow()
        finally:
            if self.driver:
                input("🔍 Premi INVIO per chiudere il browser...")
                self.driver.quit()

if __name__ == "__main__":
    debug_test = LoginDebugTest()
    debug_test.run_debug()
