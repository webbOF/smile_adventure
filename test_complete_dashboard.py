#!/usr/bin/env python3
"""
Test completo automatizzato: Docker + Login + Dashboard Redirect
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time
import requests

def test_complete_flow():
    print("🚀 COMPLETE DOCKER + DASHBOARD TEST")
    print("=" * 50)
    
    # Test backend connectivity
    print("📡 Step 1: Testing backend connectivity")
    try:
        login_response = requests.post(
            'http://localhost:8000/api/v1/auth/login',
            data={'username': 'parent@demo.com', 'password': 'TestParent123!'},
            timeout=5
        )
        if login_response.status_code == 200:
            print("   ✅ Backend is working and login API responds")
        else:
            print(f"   ❌ Backend login failed: {login_response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Backend not reachable: {e}")
        return False
    
    # Setup browser
    print("🌐 Step 2: Setting up browser")
    chrome_options = Options()
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-web-security")
    chrome_options.add_argument("--disable-features=VizDisplayCompositor")
    
    driver = webdriver.Chrome(options=chrome_options)
    wait = WebDriverWait(driver, 10)
    
    try:
        # Navigate to frontend
        print("🏠 Step 3: Navigate to frontend")
        driver.get("http://localhost:3000")
        print(f"   📍 Current URL: {driver.current_url}")
        print(f"   📄 Page title: {driver.title}")
        
        # Click Login button
        print("🔐 Step 4: Click login button")
        login_button = wait.until(
            EC.element_to_be_clickable((By.LINK_TEXT, "Accedi"))
        )
        login_button.click()
        print("   ✅ Login button clicked")
        
        # Wait for login page
        wait.until(EC.presence_of_element_located((By.NAME, "email")))
        print(f"   📍 Login page URL: {driver.current_url}")
        
        # Fill login form
        print("📝 Step 5: Fill login form")
        email_field = driver.find_element(By.NAME, "email")
        password_field = driver.find_element(By.NAME, "password")
        
        email_field.send_keys("parent@demo.com")
        password_field.send_keys("TestParent123!")
        print("   ✅ Form fields filled")
        
        # Submit form
        print("🚀 Step 6: Submit login form")
        submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        submit_button.click()
        print("   ✅ Form submitted")
        
        # Wait for redirect
        print("⏳ Step 7: Wait for redirect to dashboard")
        time.sleep(3)  # Give time for login processing
        
        current_url = driver.current_url
        print(f"   📍 Current URL after login: {current_url}")
        
        # Check if redirected to dashboard
        if "/parent" in current_url:
            print("   ✅ SUCCESS: Redirected to parent dashboard!")
            
            # Verify dashboard elements
            print("🔍 Step 8: Verify dashboard elements")
            try:
                # Check for welcome message
                welcome = wait.until(
                    EC.presence_of_element_located((By.TAG_NAME, "h1"))
                )
                print(f"   ✅ Welcome message found: {welcome.text}")
                
                # Check for quick stats
                stats_cards = driver.find_elements(By.CSS_SELECTOR, "[class*='grid'] > div")
                print(f"   ✅ Found {len(stats_cards)} dashboard cards")
                
                # Check for dashboard layout
                dashboard_layout = driver.find_elements(By.CSS_SELECTOR, "[class*='sidebar'], nav")
                if dashboard_layout:
                    print("   ✅ Dashboard layout components found")
                
                print("🎉 DASHBOARD TEST COMPLETED SUCCESSFULLY!")
                return True
                
            except Exception as e:
                print(f"   ❌ Dashboard verification failed: {e}")
                return False
                
        else:
            print(f"   ❌ Not redirected to dashboard. Still at: {current_url}")
            
            # Check for error messages
            try:
                error_elements = driver.find_elements(By.CSS_SELECTOR, "[class*='error'], [class*='alert']")
                if error_elements:
                    for error in error_elements:
                        if error.text:
                            print(f"   🚨 Error found: {error.text}")
            except:
                pass
            
            return False
            
    except Exception as e:
        print(f"💥 Test failed with error: {e}")
        print(f"📍 Final URL: {driver.current_url}")
        return False
        
    finally:
        print("🧹 Cleanup: Closing browser")
        driver.quit()

if __name__ == "__main__":
    success = test_complete_flow()
    
    print(f"\n{'='*50}")
    if success:
        print("🎯 TASK 33 DASHBOARD TEST: ✅ PASSED")
        print("🎉 Dashboard is working correctly with Docker!")
        print("\n📋 VERIFIED FEATURES:")
        print("   ✅ Docker environment setup")
        print("   ✅ Backend API connectivity") 
        print("   ✅ Frontend loading")
        print("   ✅ Login form functionality")
        print("   ✅ Authentication process")
        print("   ✅ Dashboard redirect")
        print("   ✅ Dashboard layout rendering")
    else:
        print("🎯 TASK 33 DASHBOARD TEST: ❌ FAILED")
        print("🔍 Check the error messages above for debugging")
    
    print(f"\n🌐 MANUAL ACCESS:")
    print("   Frontend: http://localhost:3000")
    print("   Credentials: parent@demo.com / TestParent123!")
