#!/usr/bin/env python3
"""
Debug per controllare errori JavaScript durante login
"""
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.chrome.options import Options

def debug_javascript_errors():
    """Debug specifico per errori JavaScript"""
    
    options = Options()
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")
    options.set_capability("goog:loggingPrefs", {"browser": "ALL"})
    
    driver = webdriver.Chrome(options=options)
    
    try:
        print("🔍 DEBUG ERRORI JAVASCRIPT LOGIN")
        print("=" * 50)
        
        # Vai direttamente al login con utente già registrato
        driver.get("http://localhost:3000/login")
        time.sleep(3)
        
        # Controlla errori iniziali
        logs = driver.get_log('browser')
        if logs:
            print(f"\n📋 ERRORI INIZIALI RILEVATI:")
            for log in logs:
                level = log['level']
                message = log['message']
                if level in ['SEVERE', 'ERROR']:
                    print(f"   ❌ [{level}] {message}")
                elif level == 'WARNING':
                    print(f"   ⚠️ [{level}] {message}")
        
        # Usa credenziali di un utente che sappiamo esistere
        email = 'localStorage.test.1749717270@example.com'  # Dal test precedente
        password = 'TestPassword123!'
        
        print(f"\n🔐 TENTATIVO LOGIN CON: {email}")
        
        # Compila form
        email_field = driver.find_element(By.ID, "email")
        password_field = driver.find_element(By.ID, "password")
        
        email_field.clear()
        email_field.send_keys(email)
        time.sleep(0.5)
        
        password_field.clear()
        password_field.send_keys(password)
        time.sleep(0.5)
        
        # Monitora errori durante la compilazione
        logs = driver.get_log('browser')
        compilation_errors = [log for log in logs if log['level'] in ['SEVERE', 'ERROR']]
        if compilation_errors:
            print(f"\n❌ ERRORI DURANTE COMPILAZIONE:")
            for log in compilation_errors:
                print(f"   {log['message']}")
        
        # Submit
        submit_btn = driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
        submit_btn.click()
        
        # Monitora per 5 secondi con controllo errori continuo
        for i in range(5):
            time.sleep(1)
            current_url = driver.current_url
            print(f"   [{i+1}/5] URL: {current_url}")
            
            # Controlla nuovi errori
            logs = driver.get_log('browser')
            new_errors = [log for log in logs if log['level'] in ['SEVERE', 'ERROR']]
            if new_errors:
                print(f"   ❌ NUOVI ERRORI:")
                for log in new_errors:
                    print(f"      {log['message']}")
        
        # Analisi finale degli errori
        final_logs = driver.get_log('browser')
        all_errors = [log for log in final_logs if log['level'] in ['SEVERE', 'ERROR']]
        all_warnings = [log for log in final_logs if log['level'] == 'WARNING']
        
        print(f"\n📊 ANALISI FINALE ERRORI:")
        print(f"   📍 URL finale: {driver.current_url}")
        print(f"   ❌ Errori totali: {len(all_errors)}")
        print(f"   ⚠️ Warning totali: {len(all_warnings)}")
        
        if all_errors:
            print(f"\n❌ ERRORI CRITICI:")
            for i, log in enumerate(all_errors[-5:], 1):  # Ultimi 5 errori
                print(f"   {i}. {log['message']}")
        
        if all_warnings:
            print(f"\n⚠️ WARNING RILEVANTI:")
            for i, log in enumerate(all_warnings[-3:], 1):  # Ultimi 3 warning
                print(f"   {i}. {log['message']}")
        
        # Controlla se il form è ancora visibile (indica che non è stato processato)
        try:
            submit_btn_still_there = driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
            if submit_btn_still_there.is_displayed():
                print(f"\n⚠️ FORM ANCORA VISIBILE - IL SUBMIT POTREBBE NON AVER FUNZIONATO")
        except:
            print(f"\n✅ FORM NON PIÙ VISIBILE - SUBMIT PROCESSATO")
        
        # Controlla se ci sono messaggi di errore nel form
        try:
            error_elements = driver.find_elements(By.CSS_SELECTOR, '.text-red-600, .text-red-500, .bg-red-50')
            if error_elements:
                print(f"\n❌ ERRORI VISIBILI NEL FORM:")
                for element in error_elements:
                    if element.text.strip():
                        print(f"   - {element.text}")
        except:
            pass
        
    except Exception as e:
        print(f"❌ Errore durante debug: {e}")
    finally:
        input("🔍 Premi INVIO per chiudere il browser...")
        driver.quit()

if __name__ == "__main__":
    debug_javascript_errors()
