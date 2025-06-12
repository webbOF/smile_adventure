#!/usr/bin/env python3
"""
Debug specifico per il processo di registrazione
"""
import time
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

class RegistrationDebugTest:
    def __init__(self):
        self.driver = None
        self.wait = None
        
    def setup_driver(self):
        """Setup Chrome driver con opzioni di debug"""
        options = Options()
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--window-size=1920,1080")
        # Non headless per debug visivo
        # options.add_argument("--headless")
        
        try:
            self.driver = webdriver.Chrome(options=options)
            self.wait = WebDriverWait(self.driver, 20)
            print("✅ Chrome driver initialized")
            return True
        except Exception as e:
            print(f"❌ Errore inizializzazione driver: {e}")
            return False
    
    def check_servers(self):
        """Verifica che i server siano attivi"""
        try:
            frontend = requests.get('http://localhost:3000', timeout=5)
            backend = requests.get('http://localhost:8000/health', timeout=5)
            print(f"✅ Frontend: {frontend.status_code}")
            print(f"✅ Backend: {backend.status_code}")
            return True
        except Exception as e:
            print(f"❌ Errore server: {e}")
            return False
    
    def debug_registration_page(self):
        """Debug dettagliato della pagina di registrazione"""
        try:
            print("\n🔍 NAVIGAZIONE A PAGINA REGISTRAZIONE")
            self.driver.get("http://localhost:3000/register")
            
            # Attendi caricamento pagina
            self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
            time.sleep(2)
            
            print(f"📍 URL corrente: {self.driver.current_url}")
            print(f"📄 Titolo pagina: {self.driver.title}")
            
            # Verifica presenza form
            try:
                form = self.driver.find_element(By.TAG_NAME, "form")
                print("✅ Form trovato")
                
                # Debug campi del form
                fields = {
                    'firstName': 'Nome',
                    'lastName': 'Cognome', 
                    'email': 'Email',
                    'password': 'Password',
                    'confirmPassword': 'Conferma Password',
                    'terms': 'Termini e Condizioni'
                }
                
                print("\n🔍 VERIFICA CAMPI FORM:")
                for field_id, field_name in fields.items():
                    try:
                        element = self.driver.find_element(By.ID, field_id)
                        print(f"✅ {field_name} (#{field_id}): trovato - tipo: {element.tag_name}")
                        print(f"   - Visibile: {element.is_displayed()}")
                        print(f"   - Abilitato: {element.is_enabled()}")
                    except NoSuchElementException:
                        print(f"❌ {field_name} (#{field_id}): NON TROVATO")
                
                # Verifica pulsante submit
                try:
                    submit_btn = self.driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
                    print(f"✅ Pulsante submit trovato: '{submit_btn.text}'")
                except NoSuchElementException:
                    print("❌ Pulsante submit NON TROVATO")
                
                return True
                
            except NoSuchElementException:
                print("❌ Form NON TROVATO")
                
                # Debug HTML della pagina
                print("\n📄 HTML BODY:")
                body = self.driver.find_element(By.TAG_NAME, "body")
                print(body.get_attribute('innerHTML')[:500] + "...")
                
                return False
                
        except Exception as e:
            print(f"❌ Errore debug registrazione: {e}")
            return False
    
    def test_registration_flow(self):
        """Test completo del flusso di registrazione"""
        try:
            print("\n🧪 TEST FLUSSO REGISTRAZIONE COMPLETO")
            
            # Compila i campi
            test_data = {
                'firstName': 'Test',
                'lastName': 'User',
                'email': f'test.{int(time.time())}@example.com',
                'password': 'TestPassword123!',
                'confirmPassword': 'TestPassword123!'
            }
            
            print(f"📧 Email di test: {test_data['email']}")
            
            for field_id, value in test_data.items():
                try:
                    field = self.driver.find_element(By.ID, field_id)
                    field.clear()
                    field.send_keys(value)
                    print(f"✅ Campo {field_id} compilato")
                    time.sleep(0.5)
                except Exception as e:
                    print(f"❌ Errore compilazione {field_id}: {e}")
                    return False
            
            # Checkbox termini
            try:
                terms_checkbox = self.driver.find_element(By.ID, "terms")
                if not terms_checkbox.is_selected():
                    terms_checkbox.click()
                    print("✅ Checkbox termini selezionato")
                time.sleep(1)
            except Exception as e:
                print(f"❌ Errore checkbox termini: {e}")
                return False
            
            # Screenshot prima del submit
            self.driver.save_screenshot("debug_before_submit.png")
            print("📸 Screenshot salvato: debug_before_submit.png")
            
            # Submit del form
            try:
                submit_btn = self.driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
                submit_btn.click()
                print("✅ Form inviato")
                time.sleep(3)
                
                # Verifica risultato
                current_url = self.driver.current_url
                print(f"📍 URL dopo submit: {current_url}")
                
                # Screenshot dopo submit
                self.driver.save_screenshot("debug_after_submit.png")
                print("📸 Screenshot salvato: debug_after_submit.png")
                
                # Controlla se siamo stati reindirizzati al login
                if "login" in current_url.lower():
                    print("✅ Registrazione completata - reindirizzato al login")
                    return True
                elif "register" in current_url.lower():
                    print("⚠️ Ancora sulla pagina di registrazione")
                    
                    # Cerca errori
                    try:
                        errors = self.driver.find_elements(By.CSS_SELECTOR, '.text-red-600, .text-red-500, .error')
                        if errors:
                            print("❌ Errori trovati:")
                            for error in errors:
                                if error.text.strip():
                                    print(f"   - {error.text}")
                        else:
                            print("🔍 Nessun errore visibile trovato")
                    except Exception:
                        print("🔍 Impossibile cercare errori")
                    
                    return False
                else:
                    print(f"🔍 URL inaspettato: {current_url}")
                    return False
                    
            except Exception as e:
                print(f"❌ Errore durante submit: {e}")
                return False
                
        except Exception as e:
            print(f"❌ Errore test registrazione: {e}")
            return False
    
    def run_debug(self):
        """Esegue tutti i test di debug"""
        print("🔍 SELENIUM REGISTRATION DEBUG")
        print("=" * 50)
        
        if not self.check_servers():
            return False
            
        if not self.setup_driver():
            return False
            
        try:
            # Debug pagina registrazione
            if not self.debug_registration_page():
                return False
                
            # Test flusso completo
            if not self.test_registration_flow():
                return False
                
            print("\n✅ Debug completato con successo!")
            return True
            
        except Exception as e:
            print(f"❌ Errore durante debug: {e}")
            return False
        finally:
            if self.driver:
                input("🔍 Premi INVIO per chiudere il browser...")
                self.driver.quit()

if __name__ == "__main__":
    debug_test = RegistrationDebugTest()
    debug_test.run_debug()
