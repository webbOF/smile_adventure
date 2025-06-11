#!/usr/bin/env python3
"""
Test automatico della registrazione utente con Selenium
"""
import time
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

def setup_driver():
    """Setup Chrome driver with options"""
    chrome_options = Options()
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-web-security")
    chrome_options.add_argument("--disable-features=VizDisplayCompositor")
    # chrome_options.add_argument("--headless")  # Uncomment for headless mode
    
    return webdriver.Chrome(options=chrome_options)

def check_servers():
    """Check if frontend and backend are running"""
    print("🔍 Verificando che i server siano attivi...")
    
    try:
        frontend_response = requests.get("http://localhost:3000", timeout=5)
        print("✅ Frontend server è attivo")
    except:
        print("❌ Frontend server non è raggiungibile su localhost:3000")
        return False
    
    try:
        backend_response = requests.get("http://localhost:8000/health", timeout=5)
        print("✅ Backend server è attivo")
    except:
        print("❌ Backend server non è raggiungibile su localhost:8000")
        return False
    
    return True

def test_registration_form():
    """Test the registration form step by step"""
    if not check_servers():
        return False
    
    driver = setup_driver()
    wait = WebDriverWait(driver, 10)
    
    try:
        print("\n🌐 Aprendo la pagina di registrazione...")
        driver.get("http://localhost:3000/register")
        
        # Wait for page to load
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "form")))
        print("✅ Pagina di registrazione caricata")
        
        # Take screenshot of initial page
        driver.save_screenshot("registration_step_1_loaded.png")
        print("📸 Screenshot salvato: registration_step_1_loaded.png")
        
        print("\n📝 Compilando il form di registrazione...")
        
        # Fill first name
        first_name = wait.until(EC.element_to_be_clickable((By.NAME, "firstName")))
        first_name.clear()
        first_name.send_keys("Mario")
        print("✅ Nome inserito: Mario")
        
        # Fill last name
        last_name = driver.find_element(By.NAME, "lastName")
        last_name.clear()
        last_name.send_keys("Rossi")
        print("✅ Cognome inserito: Rossi")
        
        # Fill email with timestamp to make it unique
        email_value = f"mario.rossi.{int(time.time())}@test.com"
        email = driver.find_element(By.NAME, "email")
        email.clear()
        email.send_keys(email_value)
        print(f"✅ Email inserita: {email_value}")
        
        # Fill password
        password = driver.find_element(By.NAME, "password")
        password.clear()
        password.send_keys("TestPassword123!")
        print("✅ Password inserita")
        
        # Fill confirm password
        confirm_password = driver.find_element(By.NAME, "confirmPassword")
        confirm_password.clear()
        confirm_password.send_keys("TestPassword123!")
        print("✅ Conferma password inserita")
        
        # Wait a moment for validation
        time.sleep(2)
        
        # Check for password validation errors
        try:
            password_error = driver.find_element(By.XPATH, "//p[contains(text(), 'Le password non coincidono')]")
            print(f"❌ Errore validazione password: {password_error.text}")
            driver.save_screenshot("registration_password_error.png")
            return False
        except NoSuchElementException:
            print("✅ Nessun errore di validazione password")
        
        # Accept terms and conditions
        try:
            terms_checkbox = wait.until(EC.element_to_be_clickable((By.NAME, "acceptTerms")))
            if not terms_checkbox.is_selected():
                driver.execute_script("arguments[0].click();", terms_checkbox)
                print("✅ Termini e condizioni accettati")
        except Exception as e:
            print(f"⚠️ Problema con checkbox termini: {e}")
        
        # Take screenshot before submission
        driver.save_screenshot("registration_step_2_filled.png")
        print("📸 Screenshot salvato: registration_step_2_filled.png")
        
        # Find and click submit button
        submit_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']")))
        print("🔄 Cliccando il pulsante di registrazione...")
        
        # Scroll to button and click
        driver.execute_script("arguments[0].scrollIntoView();", submit_button)
        time.sleep(1)
        driver.execute_script("arguments[0].click();", submit_button)
        
        # Wait for response (either success or error)
        print("⏳ Attendendo risposta del server...")
        time.sleep(5)
        
        # Check for success or error messages
        current_url = driver.current_url
        print(f"📍 URL corrente: {current_url}")
        
        # Check for error messages
        try:
            error_elements = driver.find_elements(By.CSS_SELECTOR, ".text-red-600, .bg-red-50, [class*='error']")
            if error_elements:
                for error in error_elements:
                    if error.text.strip():
                        print(f"❌ Errore trovato: {error.text}")
        except:
            pass
        
        # Check for success indicators
        if "/parent" in current_url or "/professional" in current_url:
            print("🎉 Registrazione completata con successo! Reindirizzato alla dashboard")
            driver.save_screenshot("registration_success.png")
            return True
        elif current_url == "http://localhost:3000/register":
            print("⚠️ Ancora sulla pagina di registrazione - possibile errore")
            driver.save_screenshot("registration_still_on_page.png")
        
        # Check browser console for errors
        logs = driver.get_log('browser')
        if logs:
            print("\n📋 Console del browser:")
            for log in logs:
                if log['level'] in ['SEVERE', 'WARNING']:
                    print(f"  {log['level']}: {log['message']}")
        
        # Check network tab for failed requests
        print("\n🌐 Verificando le chiamate di rete...")
        performance_logs = driver.get_log('performance')
        for log in performance_logs:
            message = log.get('message', '')
            if 'failed' in message.lower() or 'error' in message.lower():
                print(f"  ❌ Errore di rete: {message}")
        
        # Take final screenshot
        driver.save_screenshot("registration_final_state.png")
        print("📸 Screenshot finale salvato: registration_final_state.png")
        
        return False
        
    except TimeoutException as e:
        print(f"❌ Timeout durante il test: {e}")
        driver.save_screenshot("registration_timeout_error.png")
        return False
    except Exception as e:
        print(f"❌ Errore durante il test: {e}")
        driver.save_screenshot("registration_general_error.png")
        return False
    finally:
        # Keep browser open for manual inspection if needed
        input("\n🔍 Premi INVIO per chiudere il browser...")
        driver.quit()

def test_backend_registration_directly():
    """Test backend registration endpoint directly"""
    print("\n🧪 Testando registrazione diretta al backend...")
    
    test_data = {
        "email": f"direct.test.{int(time.time())}@test.com",
        "password": "TestPassword123!",
        "password_confirm": "TestPassword123!",
        "first_name": "Test",
        "last_name": "User",
        "role": "parent",
        "phone": "1234567890"
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/auth/register",
            json=test_data,
            timeout=10
        )
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📋 Response: {response.text}")
        
        if response.status_code == 201:
            print("✅ Registrazione backend funziona correttamente")
            return True
        else:
            print("❌ Registrazione backend ha problemi")
            return False
            
    except Exception as e:
        print(f"❌ Errore nella chiamata backend: {e}")
        return False

if __name__ == "__main__":
    print("🚀 SELENIUM TEST - REGISTRAZIONE UTENTE")
    print("=" * 60)
    
    # First test backend directly
    backend_works = test_backend_registration_directly()
    
    # Then test frontend
    if backend_works:
        print("\n" + "=" * 60)
        print("🌐 Testando registrazione tramite frontend...")
        frontend_works = test_registration_form()
        
        if frontend_works:
            print("🎉 Test completato con successo!")
        else:
            print("❌ Test frontend fallito - controlla gli screenshot")
    else:
        print("❌ Backend non funziona - risolvi prima i problemi del backend")
