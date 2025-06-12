#!/usr/bin/env python3
"""
Debug script per testare il login e il reindirizzamento alla dashboard
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time

def test_login_redirect():
    """Test login and dashboard redirect"""
    # Setup Chrome driver
    chrome_options = Options()
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1280,720")
    
    driver = webdriver.Chrome(options=chrome_options)
    wait = WebDriverWait(driver, 10)
    
    try:
        print("🔍 TESTING LOGIN AND DASHBOARD REDIRECT")
        print("=" * 50)
        
        # Step 1: Go to login page
        print("📍 Step 1: Navigating to login page")
        driver.get("http://localhost:3000/login")
        time.sleep(2)
        
        # Check if login page loaded
        try:
            wait.until(EC.presence_of_element_located((By.NAME, "email")))
            print("   ✅ Login page loaded successfully")
        except:
            print("   ❌ Login page failed to load")
            return False
        
        # Step 2: Fill login form
        print("📝 Step 2: Filling login form")
        try:
            email_field = driver.find_element(By.NAME, "email")
            password_field = driver.find_element(By.NAME, "password")
            
            email_field.clear()
            email_field.send_keys("parent@demo.com")
            
            password_field.clear()
            password_field.send_keys("TestParent123!")
            
            print("   ✅ Login form filled")
        except Exception as e:
            print(f"   ❌ Failed to fill form: {e}")
            return False
        
        # Step 3: Submit form
        print("🚀 Step 3: Submitting login form")
        try:
            submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            submit_button.click()
            print("   ✅ Login form submitted")
        except Exception as e:
            print(f"   ❌ Failed to submit form: {e}")
            return False
        
        # Step 4: Wait for redirect and check URL
        print("⏳ Step 4: Waiting for redirect...")
        time.sleep(3)
        
        current_url = driver.current_url
        print(f"   📍 Current URL after login: {current_url}")
        
        # Check if redirected to parent dashboard
        if "/parent" in current_url:
            print("   ✅ SUCCESS: Redirected to parent dashboard!")
        elif "/login" in current_url:
            print("   ⚠️  WARNING: Still on login page - checking for errors")
            
            # Check for error messages
            try:
                error_elements = driver.find_elements(By.CSS_SELECTOR, ".text-red-500, .text-red-600, .error")
                if error_elements:
                    for error in error_elements:
                        if error.text:
                            print(f"   ❌ Error message: {error.text}")
                else:
                    print("   ❓ No error messages found")
            except:
                pass
                
            # Check browser console logs
            print("   🔍 Checking browser console logs:")
            try:
                logs = driver.get_log('browser')
                for log in logs:
                    if log['level'] in ['SEVERE', 'WARNING']:
                        print(f"   📝 {log['level']}: {log['message']}")
            except:
                print("   ❓ Could not retrieve console logs")
                
        else:
            print(f"   ❓ Unexpected redirect to: {current_url}")
        
        # Step 5: Check if user is authenticated
        print("🔐 Step 5: Checking authentication state")
        try:
            # Check localStorage for auth data
            auth_data = driver.execute_script("return localStorage.getItem('smile-adventure-auth');")
            if auth_data:
                print("   ✅ Auth data found in localStorage")
                # Parse and check user data
                import json
                try:
                    auth_obj = json.loads(auth_data)
                    if 'state' in auth_obj and 'user' in auth_obj['state']:
                        user = auth_obj['state']['user']
                        print(f"   👤 User: {user.get('first_name', 'Unknown')} {user.get('last_name', '')}")
                        print(f"   🎭 Role: {user.get('role', 'Unknown')}")
                        print(f"   ✅ Authenticated: {auth_obj['state'].get('isAuthenticated', False)}")
                    else:
                        print("   ❌ Invalid auth data structure")
                except:
                    print("   ❌ Could not parse auth data")
            else:
                print("   ❌ No auth data found in localStorage")
        except Exception as e:
            print(f"   ❌ Error checking auth state: {e}")
        
        # Step 6: Try manual navigation to parent dashboard
        print("🧭 Step 6: Manual navigation test")
        try:
            driver.get("http://localhost:3000/parent")
            time.sleep(2)
            final_url = driver.current_url
            print(f"   📍 URL after manual navigation: {final_url}")
            
            if "/parent" in final_url:
                print("   ✅ Manual navigation to dashboard successful!")
                
                # Check if dashboard content is visible
                try:
                    wait.until(EC.presence_of_element_located((By.TEXT, "Benvenuto")))
                    print("   ✅ Dashboard content loaded!")
                except:
                    print("   ⚠️  Dashboard page loaded but content may not be visible")
            else:
                print("   ❌ Manual navigation failed")
        except Exception as e:
            print(f"   ❌ Error in manual navigation: {e}")
        
        return True
        
    except Exception as e:
        print(f"💥 Test failed with error: {e}")
        return False
    
    finally:
        driver.quit()

if __name__ == "__main__":
    test_login_redirect()
