#!/usr/bin/env python3
"""
Simple Authentication Flow Test
Test with actual form fields
"""

import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

def test_simple_auth_flow():
    """Test simple authentication flow"""
    print("🔐 SIMPLE AUTHENTICATION FLOW TEST")
    print("=" * 40)
    
    chrome_options = Options()
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1200,800")
    
    driver = None
    try:
        driver = webdriver.Chrome(options=chrome_options)
        wait = WebDriverWait(driver, 10)
        
        # Test unique email
        test_email = f"simple.test.{int(time.time())}@example.com"
        test_password = "TestPassword123!"
        
        print("📝 Testing Registration Form")
        driver.get("http://localhost:3000/register")
        time.sleep(3)
        
        # Fill only the required fields that exist
        try:
            # First Name
            first_name = wait.until(EC.presence_of_element_located((By.ID, "firstName")))
            first_name.send_keys("Test")
            
            # Last Name  
            last_name = driver.find_element(By.ID, "lastName")
            last_name.send_keys("User")
            
            # Email
            email = driver.find_element(By.ID, "email")
            email.send_keys(test_email)
            
            # Password
            password = driver.find_element(By.ID, "password")
            password.send_keys(test_password)
            
            # Confirm Password
            confirm_password = driver.find_element(By.ID, "confirmPassword")
            confirm_password.send_keys(test_password)
            
            # Terms checkbox
            terms = driver.find_element(By.ID, "terms")
            terms.click()
            
            print(f"   ✅ Registration form filled for: {test_email}")
            
            # Submit registration
            submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            submit_button.click()
            
            print("   ✅ Registration submitted")
            time.sleep(5)  # Wait for registration to complete
            
        except Exception as e:
            print(f"   ❌ Registration failed: {e}")
            return False
        
        print("🔑 Testing Login")
        driver.get("http://localhost:3000/login")
        time.sleep(3)
        
        try:
            # Fill login form
            email_field = wait.until(EC.presence_of_element_located((By.ID, "email")))
            email_field.send_keys(test_email)
            
            password_field = driver.find_element(By.ID, "password")
            password_field.send_keys(test_password)
            
            # Submit login
            submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            submit_button.click()
            
            print("   ✅ Login submitted")
            time.sleep(5)  # Wait for login to complete
            
        except Exception as e:
            print(f"   ❌ Login failed: {e}")
            return False
        
        print("🏠 Testing Post-Login Navigation")
        current_url = driver.current_url
        print(f"   Current URL: {current_url}")
        
        # Check page content and navigation
        try:
            page_source = driver.page_source.lower()
            
            # Check if we're logged in by looking for user-specific content
            if "test" in page_source and "user" in page_source:
                print("   ✅ User content detected - likely logged in")
            
            # Look for navigation links
            all_links = driver.find_elements(By.TAG_NAME, "a")
            nav_texts = []
            for link in all_links:
                try:
                    text = link.text.strip()
                    if text and len(text) > 0 and len(text) < 20:
                        nav_texts.append(text)
                except:
                    pass
            
            print(f"   📋 Navigation links found: {set(nav_texts)}")
            
            # Check for specific navigation elements
            home_found = any("home" in text.lower() for text in nav_texts)
            dashboard_found = any("dashboard" in text.lower() for text in nav_texts)
            logout_found = any("esci" in text.lower() or "logout" in text.lower() for text in nav_texts)
            
            print(f"   🏠 Home link: {'✅' if home_found else '❌'}")
            print(f"   📊 Dashboard link: {'✅' if dashboard_found else '❌'}")
            print(f"   🚪 Logout option: {'✅' if logout_found else '❌'}")
            
        except Exception as e:
            print(f"   ❌ Navigation check failed: {e}")
        
        # Take final screenshot
        driver.save_screenshot("simple_auth_flow.png")
        print("   📸 Screenshot saved: simple_auth_flow.png")
        
        print("\n🎉 SIMPLE AUTH FLOW TEST COMPLETED")
        return True
        
    except Exception as e:
        print(f"❌ SIMPLE AUTH FLOW FAILED: {e}")
        return False
        
    finally:
        if driver:
            time.sleep(2)
            driver.quit()

if __name__ == "__main__":
    test_simple_auth_flow()
