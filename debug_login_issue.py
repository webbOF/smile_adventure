#!/usr/bin/env python3
"""
Test specifico per il problema di login
"""
import time
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

def test_login_issue():
    """Test login issue specifically"""
    print("🔍 ANALIZZANDO PROBLEMA LOGIN")
    print("=" * 50)
    
    # Test backend login directly first
    print("1. Test backend login diretto...")
    login_data = {
        "username": "selenium.test.1749650806@test.com",
        "password": "TestPassword123!"
    }
    
    try:
        # Use form data like frontend does
        response = requests.post(
            "http://localhost:8000/api/v1/auth/login",
            data=login_data,  # Use form data, not json
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            timeout=10
        )
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Backend login funziona")
        else:
            print("❌ Backend login fallisce")
            
    except Exception as e:
        print(f"❌ Errore backend login: {e}")
    
    print("\n2. Test frontend login con Selenium...")
    
    chrome_options = Options()
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    driver = webdriver.Chrome(options=chrome_options)
    wait = WebDriverWait(driver, 10)
    
    try:
        # Navigate to login
        driver.get("http://localhost:3000/login")
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "form")))
        
        # Fill form
        email_field = driver.find_element(By.NAME, "email")
        email_field.clear()
        email_field.send_keys("selenium.test.1749650806@test.com")
        
        password_field = driver.find_element(By.NAME, "password")
        password_field.clear()
        password_field.send_keys("TestPassword123!")
        
        # Take screenshot before submit
        driver.save_screenshot("login_debug_before.png")
        
        # Submit
        submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        submit_button.click()
        
        time.sleep(5)
        
        # Take screenshot after submit
        driver.save_screenshot("login_debug_after.png")
        
        # Check URL
        current_url = driver.current_url
        print(f"   URL dopo login: {current_url}")
        
        # Check for error messages
        errors = driver.find_elements(By.CSS_SELECTOR, ".text-red-600, .error, [class*='error']")
        for error in errors:
            if error.is_displayed() and error.text.strip():
                print(f"   Errore frontend: {error.text}")
        
        # Check console logs
        logs = driver.get_log('browser')
        for log in logs:
            if log['level'] in ['SEVERE', 'WARNING']:
                print(f"   Console {log['level']}: {log['message']}")
        
        if "/parent" in current_url or "/professional" in current_url:
            print("✅ Frontend login funziona")
        else:
            print("❌ Frontend login fallisce")
            
    finally:
        input("\nPremi INVIO per chiudere...")
        driver.quit()

if __name__ == "__main__":
    test_login_issue()
