#!/usr/bin/env python3
"""
Test Selenium per Login con Credenziali Demo - Smile Adventure
Test specifico per verificare il login con utenti demo esistenti
"""

import time
import requests
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException, NoSuchElementException, ElementClickInterceptedException
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service

class DemoLoginTest:
    def __init__(self):
        self.driver = None
        self.wait = None
        self.results = {
            'tests_run': 0,
            'tests_passed': 0,
            'tests_failed': 0,
            'failed_tests': [],
            'screenshots': []
        }
        # Usa credenziali demo esistenti
        self.demo_users = {
            'parent': {
                'email': 'parent@demo.com',
                'password': 'TestParent123!',
                'role': 'Genitore'
            },
            'dentist': {
                'email': 'dentist@demo.com', 
                'password': 'TestDentist123!',
                'role': 'Dentista'
            }
        }

    def setup_driver(self):
        """Configura il driver Chrome"""
        print("🚀 Configurazione del driver Chrome...")
        
        chrome_options = Options()
        chrome_options.add_argument("--start-maximized")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_argument("--disable-extensions")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        try:
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            self.wait = WebDriverWait(self.driver, 10)
            print("✅ Driver Chrome inizializzato con successo")
            return True
        except Exception as e:
            print(f"❌ Errore nell'inizializzazione del driver: {e}")
            return False

    def dismiss_webpack_overlay(self):
        """Chiude l'overlay di webpack se presente"""
        try:
            overlay = self.driver.find_element(By.ID, "webpack-dev-server-client-overlay")
            if overlay.is_displayed():
                print("🔧 Overlay webpack rilevato, lo chiudo...")
                self.driver.execute_script("arguments[0].style.display = 'none';", overlay)
                time.sleep(1)
                return True
        except (NoSuchElementException, Exception):
            pass
        return False

    def safe_click(self, element):
        """Click sicuro che gestisce overlay e interferenze"""
        try:
            element.click()
            return True
        except ElementClickInterceptedException:
            print("⚠️ Click intercettato, provo soluzioni alternative...")
            
            # Chiudi overlay webpack
            self.dismiss_webpack_overlay()
            
            # Prova con JavaScript click
            try:
                self.driver.execute_script("arguments[0].click();", element)
                print("✅ Click tramite JavaScript riuscito")
                return True
            except Exception:
                pass
            
            # Prova con ActionChains
            try:
                ActionChains(self.driver).move_to_element(element).click().perform()
                print("✅ Click tramite ActionChains riuscito")
                return True
            except Exception:
                pass
            
            # Prova scrollando all'elemento
            try:
                self.driver.execute_script("arguments[0].scrollIntoView(true);", element)
                time.sleep(1)
                element.click()
                print("✅ Click dopo scroll riuscito")
                return True
            except Exception:
                pass
            
            print("❌ Tutti i tentativi di click falliti")
            return False
        except Exception as e:
            print(f"❌ Errore nel click: {e}")
            return False

    def find_and_click_element(self, xpath_expressions, description="elemento"):
        """Trova un elemento usando multiple espressioni XPath e lo clicca in modo sicuro"""
        if isinstance(xpath_expressions, str):
            xpath_expressions = [xpath_expressions]
        
        for xpath in xpath_expressions:
            try:
                elements = self.driver.find_elements(By.XPATH, xpath)
                if elements:
                    element = elements[0]
                    if self.safe_click(element):
                        print(f"✅ {description} cliccato con successo")
                        return True
            except Exception:
                continue
        
        print(f"❌ Impossibile trovare e cliccare {description}")
        return False

    def take_screenshot(self, name):
        """Cattura uno screenshot con timestamp"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"demo_test_{timestamp}_{name}.png"
        try:
            self.driver.save_screenshot(filename)
            self.results['screenshots'].append(filename)
            print(f"📸 Screenshot salvato: {filename}")
        except Exception as e:
            print(f"❌ Errore nel salvare screenshot: {e}")

    def test_login_with_demo_user(self, user_type='parent'):
        """Test di login con utente demo"""
        print(f"\n🧪 TEST: Login utente demo - {user_type}")
        print("=" * 50)
        
        try:
            user_creds = self.demo_users[user_type]
            
            # Naviga alla homepage
            self.driver.get("http://localhost:3000")
            time.sleep(3)
            self.dismiss_webpack_overlay()
            
            self.take_screenshot(f"homepage_{user_type}")
            
            # Trova e clicca il pulsante di login
            login_xpath_options = [
                "//*[contains(text(), 'Login') or contains(text(), 'Accedi') or contains(text(), 'Sign in')]",
                "//a[contains(@href, 'login')]",
                "//button[contains(text(), 'Login')]"
            ]
            
            clicked = self.find_and_click_element(login_xpath_options, "pulsante login")
            
            if not clicked:
                # Naviga direttamente alla pagina di login
                self.driver.get("http://localhost:3000/login")
                print("📍 Navigazione diretta alla pagina di login")
            
            time.sleep(3)
            self.dismiss_webpack_overlay()
            self.take_screenshot(f"login_form_{user_type}")
            
            # Compila il form di login
            try:
                email_field = self.wait.until(EC.presence_of_element_located(
                    (By.XPATH, "//input[@type='email' or contains(@name, 'email') or contains(@placeholder, 'email')]")
                ))
                email_field.clear()
                email_field.send_keys(user_creds['email'])
                print(f"✅ Email inserita: {user_creds['email']}")
            except TimeoutException:
                print("❌ Campo email non trovato")
                return False
            
            try:
                password_field = self.driver.find_element(By.XPATH, "//input[@type='password']")
                password_field.clear()
                password_field.send_keys(user_creds['password'])
                print("✅ Password inserita")
            except NoSuchElementException:
                print("❌ Campo password non trovato")
                return False
            
            # Invia il form
            submit_xpath_options = [
                "//button[@type='submit']",
                "//button[contains(text(), 'Login') or contains(text(), 'Accedi')]",
                "//input[@type='submit']"
            ]
            
            submit_clicked = self.find_and_click_element(submit_xpath_options, "pulsante invio login")
            
            if not submit_clicked:
                password_field.send_keys(Keys.RETURN)
                print("✅ Form login inviato con Enter")
            
            # Attendi il risultato del login
            time.sleep(5)
            self.take_screenshot(f"login_result_{user_type}")
            
            # Verifica il successo del login
            current_url = self.driver.current_url
            page_source = self.driver.page_source.lower()
            
            print(f"🌐 URL corrente: {current_url}")
            
            # Indicatori di login riuscito
            success_indicators = [
                'dashboard', 'welcome', 'home', 'profile', 'logout', 
                'children', 'bambini', 'patients', 'pazienti'
            ]
            
            # Verifica URL
            url_success = any(indicator in current_url.lower() for indicator in success_indicators)
            
            # Verifica contenuto pagina
            content_success = any(indicator in page_source for indicator in success_indicators)
            
            # Verifica presenza di elementi tipici dell'area autenticata
            auth_elements = []
            try:
                # Cerca elementi che indicano autenticazione
                auth_selectors = [
                    "//a[contains(text(), 'Logout') or contains(text(), 'Esci')]",
                    "//*[contains(@class, 'user-menu') or contains(@class, 'profile')]",
                    "//*[contains(text(), 'Welcome') or contains(text(), 'Benvenuto')]"
                ]
                
                for selector in auth_selectors:
                    elements = self.driver.find_elements(By.XPATH, selector)
                    if elements:
                        auth_elements.extend(elements)
                        
            except Exception:
                pass
            
            elements_success = len(auth_elements) > 0
            
            if url_success or content_success or elements_success:
                print(f"✅ Login {user_type} completato con successo!")
                print(f"   📊 URL: {'✅' if url_success else '❌'}")
                print(f"   📊 Contenuto: {'✅' if content_success else '❌'}")
                print(f"   📊 Elementi auth: {'✅' if elements_success else '❌'} ({len(auth_elements)} trovati)")
                return True
            else:
                print(f"❌ Login {user_type} fallito")
                print(f"   📊 URL: {'✅' if url_success else '❌'}")
                print(f"   📊 Contenuto: {'✅' if content_success else '❌'}")
                print(f"   📊 Elementi auth: {'✅' if elements_success else '❌'}")
                return False
                
        except Exception as e:
            print(f"❌ Errore nel test login {user_type}: {e}")
            self.take_screenshot(f"error_login_{user_type}")
            return False

    def test_api_health(self):
        """Test veloce dell'API"""
        print("\n🧪 TEST: Verifica API")
        print("=" * 30)
        
        try:
            response = requests.get("http://localhost:8000/health", timeout=10)
            if response.status_code == 200:
                health_data = response.json()
                print(f"✅ API Health: OK")
                print(f"   📊 App: {health_data.get('app_name', 'N/A')}")
                print(f"   📊 Status: {health_data.get('status', 'N/A')}")
                return True
            else:
                print(f"❌ API Health: Status {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Errore API: {e}")
            return False

    def run_all_tests(self):
        """Esegue tutti i test di login demo"""
        print("🚀 Test Login Demo - Smile Adventure")
        print(f"📅 Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("🎯 TEST LOGIN CON CREDENZIALI DEMO")
        print("=" * 50)
        
        # Verifica API
        api_ok = self.test_api_health()
        if not api_ok:
            print("❌ API non raggiungibile. Interrompo i test.")
            return False
        
        # Setup driver
        if not self.setup_driver():
            print("❌ Impossibile inizializzare il driver.")
            return False
        
        try:
            # Test login utenti demo
            results = []
            
            # Test parent
            parent_result = self.test_login_with_demo_user('parent')
            results.append(('Parent Login', parent_result))
            
            # Logout se necessario
            try:
                self.driver.get("http://localhost:3000")
                time.sleep(2)
            except:
                pass
            
            # Test dentist  
            dentist_result = self.test_login_with_demo_user('dentist')
            results.append(('Dentist Login', dentist_result))
            
            # Stampa risultati
            print("\n" + "=" * 50)
            print("📊 RISULTATI TEST LOGIN DEMO")
            print("=" * 50)
            
            passed = sum(1 for _, result in results if result)
            total = len(results)
            
            for test_name, result in results:
                status = "✅ PASSATO" if result else "❌ FALLITO"
                print(f"{test_name}: {status}")
            
            print(f"\n🎯 Risultato: {passed}/{total} test passati")
            
            if len(self.results['screenshots']) > 0:
                print(f"\n📸 Screenshot catturati:")
                for screenshot in self.results['screenshots']:
                    print(f"   - {screenshot}")
            
            success_rate = (passed / total) * 100 if total > 0 else 0
            print(f"\n🎯 Tasso di successo: {success_rate:.1f}%")
            
            if success_rate == 100:
                print("🎉 PERFETTO! Tutti i test di login sono passati!")
            elif success_rate >= 50:
                print("👍 BUONO! La maggior parte dei test è passata.")
            else:
                print("⚠️ ATTENZIONE! Molti test sono falliti.")
            
            return passed == total
            
        finally:
            if self.driver:
                self.driver.quit()
                print("\n🧹 Driver chiuso")

def main():
    """Funzione principale"""
    test_suite = DemoLoginTest()
    success = test_suite.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    exit(main())
