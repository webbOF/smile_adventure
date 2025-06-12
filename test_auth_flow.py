#!/usr/bin/env python3
"""
Test Authentication Flow with Real Login
"""

import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

def test_complete_auth_flow():
    """Test complete authentication flow with real login"""
    print("🔐 TESTING COMPLETE AUTHENTICATION FLOW")
    print("=" * 50)
    
    # Setup Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1200,800")
    
    driver = None
    try:
        driver = webdriver.Chrome(options=chrome_options)
        wait = WebDriverWait(driver, 10)
        
        # Step 1: Go to registration page
        print("📝 Step 1: Testing Registration")
        driver.get("http://localhost:3000/register")
        time.sleep(2)
        
        # Generate unique email
        test_email = f"test.auth.{int(time.time())}@example.com"
        test_password = "TestPassword123!"
        
        # Fill registration form
        try:
            email_field = wait.until(EC.presence_of_element_located((By.NAME, "email")))
            email_field.send_keys(test_email)
            
            driver.find_element(By.NAME, "password").send_keys(test_password)
            driver.find_element(By.NAME, "confirmPassword").send_keys(test_password)
            driver.find_element(By.NAME, "firstName").send_keys("Test")
            driver.find_element(By.NAME, "lastName").send_keys("User")
            driver.find_element(By.NAME, "phone").send_keys("1234567890")
            
            # Submit registration
            submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            submit_button.click()
            
            print(f"   ✅ Registration form submitted for: {test_email}")
            time.sleep(3)
            
        except Exception as e:
            print(f"   ❌ Registration failed: {e}")
            return False
        
        # Step 2: Go to login page
        print("🔑 Step 2: Testing Login")
        driver.get("http://localhost:3000/login")
        time.sleep(2)
        
        # Fill login form
        try:
            email_field = wait.until(EC.presence_of_element_located((By.NAME, "email")))
            email_field.send_keys(test_email)
            
            password_field = driver.find_element(By.NAME, "password")
            password_field.send_keys(test_password)
            
            # Submit login
            submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            submit_button.click()
            
            print("   ✅ Login form submitted")
            time.sleep(5)  # Wait for potential redirect
            
        except Exception as e:
            print(f"   ❌ Login failed: {e}")
            return False
        
        # Step 3: Check if redirected and authenticated
        print("🏠 Step 3: Testing Post-Login State")
        current_url = driver.current_url
        print(f"   Current URL: {current_url}")
        
        # Look for navigation elements that indicate successful login
        try:
            # Check for user name in header (indicating successful login)
            user_elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'Test') and contains(text(), 'User')]")
            if user_elements:
                print("   ✅ User name found in header - Login successful!")
                
            # Check for logout button
            logout_elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'Esci') or contains(text(), 'Logout')]")
            if logout_elements:
                print("   ✅ Logout button found - Authentication confirmed!")
                
            # Check for Home link in navigation
            home_links = driver.find_elements(By.XPATH, "//a[contains(text(), 'Home')]")
            if home_links:
                print("   ✅ Home link found in navigation!")
                # Test clicking home link
                home_links[0].click()
                time.sleep(2)
                print(f"   ✅ Home link clickable, current URL: {driver.current_url}")
            else:
                print("   ❌ Home link not found in navigation")
                
            # Check for Dashboard link
            dashboard_links = driver.find_elements(By.XPATH, "//a[contains(text(), 'Dashboard')]")
            if dashboard_links:
                print("   ✅ Dashboard link found!")
                
        except Exception as e:
            print(f"   ❌ Post-login state check failed: {e}")
            
        # Step 4: Test navigation menu
        print("🧭 Step 4: Testing Navigation Menu")
        try:
            # Check if mobile menu button exists
            mobile_menu_buttons = driver.find_elements(By.CSS_SELECTOR, "button svg")
            if mobile_menu_buttons:
                print("   ✅ Mobile menu button found")
                
            # Get all navigation links
            nav_links = driver.find_elements(By.CSS_SELECTOR, "nav a, header a")
            print(f"   📋 Found {len(nav_links)} navigation links:")
            for i, link in enumerate(nav_links[:10]):  # Limit to first 10
                try:
                    link_text = link.text.strip()
                    if link_text:
                        print(f"      {i+1}. {link_text}")
                except:
                    pass
                    
        except Exception as e:
            print(f"   ❌ Navigation menu test failed: {e}")
        
        # Step 5: Take screenshots for verification
        print("📸 Step 5: Taking Screenshots")
        try:
            driver.save_screenshot("auth_flow_final_state.png")
            print("   ✅ Screenshot saved: auth_flow_final_state.png")
        except Exception as e:
            print(f"   ❌ Screenshot failed: {e}")
            
        print("\n🎉 AUTHENTICATION FLOW TEST COMPLETED")
        return True
        
    except Exception as e:
        print(f"❌ AUTHENTICATION FLOW TEST FAILED: {e}")
        return False
        
    finally:
        if driver:
            time.sleep(2)
            driver.quit()

if __name__ == "__main__":
    test_complete_auth_flow()
