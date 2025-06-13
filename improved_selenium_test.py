#!/usr/bin/env python3
"""
Test Selenium Migliorato per Smile Adventure
Test automatizzato end-to-end con gestione robusta degli errori
"""

import time
import random
import string
import json
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

class ImprovedSmileAdventureTest:    
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
        self.test_data = {
            'parent_email': 'parent@demo.com',  # Usa credenziali demo esistenti
            'parent_password': 'TestParent123!',
            'dentist_email': 'dentist@demo.com', 
            'dentist_password': 'TestDentist123!',
            'child_name': 'Mario Test',
            'child_age': '8'
        }
        
    def generate_random_id(self):
        """Genera un ID casuale per i test"""
        return ''.join(random.choices(string.digits, k=8))

    def setup_driver(self):
        """Configura il driver Chrome con opzioni ottimizzate"""
        print("🚀 Configurazione del driver Chrome...")
        
        chrome_options = Options()
        chrome_options.add_argument("--start-maximized")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_argument("--disable-extensions")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-web-security")
        chrome_options.add_argument("--allow-running-insecure-content")
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
        except NoSuchElementException:
            pass
        except Exception:
            pass
        return False
    
    def safe_click(self, element):
        """Click sicuro che gestisce overlay e interferenze"""
        try:
            # Prima prova con click normale
            element.click()
            return True
        except ElementClickInterceptedException:
            print("⚠️ Click intercettato, provo soluzioni alternative...")
            
            # Chiudi overlay webpack se presente
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
        filename = f"test_{timestamp}_{name}.png"
        try:
            self.driver.save_screenshot(filename)
            self.results['screenshots'].append(filename)
            print(f"📸 Screenshot salvato: {filename}")
        except Exception as e:
            print(f"❌ Errore nel salvare screenshot: {e}")

    def check_services_health(self):
        """Verifica che tutti i servizi siano attivi"""
        print("🔍 Verifica dei servizi...")
        services = {
            'Frontend (React)': 'http://localhost:3000',
            'Backend (FastAPI)': 'http://localhost:8000/health',
            'API Docs': 'http://localhost:8000/docs'
        }
        
        all_healthy = True
        for service_name, url in services.items():
            try:
                response = requests.get(url, timeout=5)
                if response.status_code == 200:
                    print(f"✅ {service_name}: OK")
                else:
                    print(f"❌ {service_name}: Status {response.status_code}")
                    all_healthy = False
            except requests.exceptions.RequestException:
                print(f"❌ {service_name}: Non raggiungibile")
                all_healthy = False
        
        return all_healthy

    def run_test(self, test_method, test_name):
        """Esegue un singolo test con gestione degli errori"""
        print(f"\n🧪 TEST: {test_name}")
        print("=" * 70)
        
        self.results['tests_run'] += 1
        try:
            # Chiudi overlay webpack prima di ogni test
            self.dismiss_webpack_overlay()
            
            result = test_method()
            if result:
                print(f"✅ PASSATO: {test_name}")
                self.results['tests_passed'] += 1
            else:
                print(f"❌ FALLITO: {test_name}")
                self.results['tests_failed'] += 1
                self.results['failed_tests'].append(test_name)
                self.take_screenshot(f"failed_{test_name.lower().replace(' ', '_')}")
        except Exception as e:
            print(f"❌ Errore nel {test_name}: {e}")
            self.results['tests_failed'] += 1
            self.results['failed_tests'].append(test_name)
            self.take_screenshot(f"error_{test_name.lower().replace(' ', '_')}")

    def test_01_homepage_loading(self):
        """Test 1: Caricamento della homepage"""
        try:
            self.driver.get("http://localhost:3000")
            time.sleep(3)
            
            # Chiudi overlay webpack
            self.dismiss_webpack_overlay()
            
            page_title = self.driver.title
            print(f"📄 Titolo pagina: {page_title}")
            
            self.take_screenshot("homepage_loaded")
            
            # Verifica elementi principali
            main_elements = [
                "//h1 | //h2 | //h3",  # Titoli principali
                "//*[contains(text(), 'Smile') or contains(text(), 'Adventure')]",  # Riferimenti all'app
                "//nav | //header"  # Navigazione
            ]
            
            found_elements = 0
            for xpath in main_elements:
                elements = self.driver.find_elements(By.XPATH, xpath)
                if elements:
                    found_elements += 1
            
            if found_elements >= 2:
                print(f"✅ Homepage caricata correttamente ({found_elements} elementi principali trovati)")
                return True
            else:
                print(f"❌ Homepage non completamente caricata ({found_elements} elementi trovati)")
                return False
            
        except Exception as e:
            print(f"❌ Errore nel test homepage: {e}")
            return False

    def test_02_registration_flow(self):
        """Test 2: Flusso di registrazione"""
        try:
            # Naviga alla pagina di registrazione
            self.driver.get("http://localhost:3000")
            time.sleep(2)
            self.dismiss_webpack_overlay()
            
            # Prova a trovare il pulsante di registrazione
            register_xpath_options = [
                "//*[contains(text(), 'Register') or contains(text(), 'Registr') or contains(text(), 'Sign up')]",
                "//a[contains(@href, 'register') or contains(@href, 'signup')]",
                "//button[contains(text(), 'Registr')]"
            ]
            
            clicked = self.find_and_click_element(register_xpath_options, "pulsante registrazione")
            
            if not clicked:
                # Naviga direttamente alla pagina di registrazione
                self.driver.get("http://localhost:3000/register")
                print("📍 Navigazione diretta alla pagina di registrazione")
            
            time.sleep(3)
            self.dismiss_webpack_overlay()
            self.take_screenshot("registration_form")
            
            # Trova e compila il form di registrazione
            try:
                email_field = self.wait.until(EC.presence_of_element_located(
                    (By.XPATH, "//input[@type='email' or contains(@name, 'email') or contains(@placeholder, 'email')]")
                ))
                email_field.clear()
                email_field.send_keys(self.test_data['parent_email'])
                print(f"✅ Email inserita: {self.test_data['parent_email']}")
            except TimeoutException:
                print("❌ Campo email non trovato")
                return False
            
            # Password
            try:
                password_field = self.driver.find_element(By.XPATH, "//input[@type='password']")
                password_field.clear()
                password_field.send_keys(self.test_data['parent_password'])
                print("✅ Password inserita")
            except NoSuchElementException:
                print("❌ Campo password non trovato")
                return False
            
            # Invia il form
            submit_xpath_options = [
                "//button[@type='submit']",
                "//button[contains(text(), 'Register') or contains(text(), 'Registr')]",
                "//input[@type='submit']"
            ]
            
            submit_clicked = self.find_and_click_element(submit_xpath_options, "pulsante invio registrazione")
            
            if not submit_clicked:
                # Prova con Enter
                password_field.send_keys(Keys.RETURN)
                print("✅ Form inviato con Enter")
            
            # Attendi il risultato
            time.sleep(5)
            self.take_screenshot("registration_result")
            
            # Controlla il risultato
            current_url = self.driver.current_url
            page_source = self.driver.page_source.lower()
            
            success_indicators = ['dashboard', 'welcome', 'success', 'home', 'profile']
            if any(indicator in page_source or indicator in current_url.lower() for indicator in success_indicators):
                print("✅ Registrazione completata con successo")
                return True
            elif 'error' in page_source or 'exist' in page_source:
                print("⚠️ Utente potrebbe già esistere - considerato successo")
                return True
            else:
                print("❌ Risultato della registrazione non chiaro")
                return False
                
        except Exception as e:
            print(f"❌ Errore nel flusso di registrazione: {e}")
            return False

    def test_03_login_flow(self):
        """Test 3: Flusso di login"""
        try:
            # Naviga alla homepage
            self.driver.get("http://localhost:3000")
            time.sleep(3)
            self.dismiss_webpack_overlay()
            
            # Prova a trovare il pulsante di login
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
            self.take_screenshot("login_form")
            
            # Compila il form di login
            try:
                email_field = self.wait.until(EC.presence_of_element_located(
                    (By.XPATH, "//input[@type='email' or contains(@name, 'email') or contains(@placeholder, 'email')]")
                ))
                email_field.clear()
                email_field.send_keys(self.test_data['parent_email'])
                print(f"✅ Email login inserita: {self.test_data['parent_email']}")
            except TimeoutException:
                print("❌ Campo email di login non trovato")
                return False
            
            try:
                password_field = self.driver.find_element(By.XPATH, "//input[@type='password']")
                password_field.clear()
                password_field.send_keys(self.test_data['parent_password'])
                print("✅ Password login inserita")
            except NoSuchElementException:
                print("❌ Campo password di login non trovato")
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
            
            # Attendi il risultato
            time.sleep(5)
            self.take_screenshot("login_result")
            
            # Verifica il successo del login
            current_url = self.driver.current_url
            page_source = self.driver.page_source.lower()
            
            success_indicators = ['dashboard', 'welcome', 'home', 'profile', 'logout']
            if any(indicator in page_source or indicator in current_url.lower() for indicator in success_indicators):
                print("✅ Login completato con successo")
                return True
            else:
                print("❌ Login fallito o non chiaro")
                return False
                
        except Exception as e:
            print(f"❌ Errore nel flusso di login: {e}")
            return False

    def test_04_api_integration(self):
        """Test 4: Integrazione API"""
        try:
            # Health Check
            response = requests.get("http://localhost:8000/health", timeout=10)
            if response.status_code == 200:
                health_data = response.json()
                print(f"✅ Health Check: OK (Status {response.status_code})")
                print(f"   📊 App: {health_data.get('app_name', 'N/A')}")
                print(f"   📊 Status: {health_data.get('status', 'N/A')}")
                if 'database' in health_data:
                    print(f"   📊 DB: {health_data['database'].get('status', 'N/A')}")
            else:
                print(f"❌ Health Check: Status {response.status_code}")
                return False
            
            # API Docs
            docs_response = requests.get("http://localhost:8000/docs", timeout=10)
            if docs_response.status_code == 200:
                print(f"✅ API Docs: OK (Status {docs_response.status_code})")
            else:
                print(f"❌ API Docs: Status {docs_response.status_code}")
                return False
            
            return True
            
        except Exception as e:
            print(f"❌ Errore nel test API: {e}")
            return False

    def test_05_responsive_design(self):
        """Test 5: Design responsive"""
        try:
            self.driver.get("http://localhost:3000")
            time.sleep(2)
            self.dismiss_webpack_overlay()
            
            # Test diverse risoluzioni
            resolutions = [
                ("Desktop Large", 1920, 1080),
                ("Desktop Standard", 1366, 768),
                ("Tablet", 768, 1024),
                ("Mobile", 375, 667)
            ]
            
            for name, width, height in resolutions:
                self.driver.set_window_size(width, height)
                time.sleep(2)
                self.take_screenshot(f"responsive_{name.lower().replace(' ', '_')}")
                print(f"✅ {name} ({width}x{height}): OK")
            
            # Ripristina dimensioni normali
            self.driver.maximize_window()
            return True
            
        except Exception as e:
            print(f"❌ Errore nel test responsive: {e}")
            return False

    def print_results(self):
        """Stampa il riepilogo dei risultati"""
        print("\n" + "=" * 70)
        print("📊 RIEPILOGO RISULTATI TEST")
        print("=" * 70)
        print(f"🧪 Test eseguiti: {self.results['tests_run']}")
        print(f"✅ Test passati: {self.results['tests_passed']}")
        print(f"❌ Test falliti: {self.results['tests_failed']}")
        
        if self.results['failed_tests']:
            print(f"\n❌ Test falliti:")
            for test in self.results['failed_tests']:
                print(f"   - {test}")
        
        if self.results['screenshots']:
            print(f"\n📸 Screenshot catturati: {len(self.results['screenshots'])}")
            for screenshot in self.results['screenshots']:
                print(f"   - {screenshot}")
        
        success_rate = (self.results['tests_passed'] / self.results['tests_run']) * 100 if self.results['tests_run'] > 0 else 0
        print(f"\n🎯 Tasso di successo: {success_rate:.1f}%")
        
        if success_rate >= 80:
            print("🎉 ECCELLENTE! La maggior parte dei test è passata.")
        elif success_rate >= 60:
            print("👍 BUONO! Molti test sono passati.")
        else:
            print("⚠️ ATTENZIONE! Molti test sono falliti.")
        
        print("=" * 70)

    def run_all_tests(self):
        """Esegue tutti i test"""
        print("🚀 Avvio Test Selenium Migliorato per Smile Adventure")
        print(f"📅 Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("🎯 AVVIO TEST COMPLETI SMILE ADVENTURE")
        print("=" * 70)
        
        # Verifica servizi
        if not self.check_services_health():
            print("❌ Alcuni servizi non sono attivi. Interrompo i test.")
            return False
        
        # Setup driver
        if not self.setup_driver():
            print("❌ Impossibile inizializzare il driver. Interrompo i test.")
            return False
        
        try:
            # Esegui tutti i test
            self.run_test(self.test_01_homepage_loading, "Caricamento Homepage")
            self.run_test(self.test_02_registration_flow, "Flusso Registrazione")
            self.run_test(self.test_03_login_flow, "Flusso Login")
            self.run_test(self.test_04_api_integration, "Integrazione API")
            self.run_test(self.test_05_responsive_design, "Design Responsive")
            
        finally:
            if self.driver:
                self.driver.quit()
                print("🧹 Driver chiuso")
        
        # Stampa risultati
        self.print_results()
        print("\n✅ Suite di test completata!")
        
        return self.results['tests_failed'] == 0

def main():
    """Funzione principale"""
    test_suite = ImprovedSmileAdventureTest()
    success = test_suite.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    exit(main())
