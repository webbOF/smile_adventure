#!/usr/bin/env python3
"""
Test script to verify password validation fix in registration form
"""
import time
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

def test_password_validation():
    """Test the password confirmation validation in the registration form"""
    print("🧪 Testing Password Validation Fix...")
    
    # Setup Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-web-security")
    chrome_options.add_argument("--disable-features=VizDisplayCompositor")
    
    try:
        # Check if frontend is running
        try:
            response = requests.get("http://localhost:3000", timeout=5)
            print("✅ Frontend server is running")
        except:
            print("❌ Frontend server is not running. Please start it first.")
            return False
        
        # Start browser
        driver = webdriver.Chrome(options=chrome_options)
        wait = WebDriverWait(driver, 10)
        
        print("🌐 Opening registration page...")
        driver.get("http://localhost:3000/register")
        
        # Wait for page to load
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "form")))
        print("✅ Registration page loaded")
        
        # Fill out the form
        print("📝 Filling out registration form...")
        
        # Fill first name
        first_name = driver.find_element(By.NAME, "firstName")
        first_name.send_keys("Test")
        
        # Fill last name
        last_name = driver.find_element(By.NAME, "lastName")
        last_name.send_keys("User")
        
        # Fill email
        email = driver.find_element(By.NAME, "email")
        email.send_keys("test@example.com")
        
        # Fill password
        password = driver.find_element(By.NAME, "password")
        password.send_keys("TestPassword123")
        
        # Fill confirm password (same password)
        confirm_password = driver.find_element(By.NAME, "confirmPassword")
        confirm_password.send_keys("TestPassword123")
        
        # Give time for validation
        time.sleep(2)
        
        # Check if validation error exists
        try:
            error_element = driver.find_element(By.XPATH, "//p[contains(text(), 'Le password non coincidono')]")
            print("❌ Password validation error still showing!")
            print(f"Error text: {error_element.text}")
            return False
        except:
            print("✅ No password validation error - passwords match correctly!")
        
        # Now test with mismatched passwords
        print("🔄 Testing with mismatched passwords...")
        confirm_password.clear()
        confirm_password.send_keys("DifferentPassword123")
        
        # Give time for validation
        time.sleep(2)
        
        # Check if validation error appears for mismatched passwords
        try:
            error_element = driver.find_element(By.XPATH, "//p[contains(text(), 'Le password non coincidono')]")
            print("✅ Validation correctly shows error for mismatched passwords!")
            print(f"Error text: {error_element.text}")
        except:
            print("❌ Validation should show error for mismatched passwords!")
            return False
        
        # Test with matching passwords again
        print("🔄 Testing with matching passwords again...")
        confirm_password.clear()
        confirm_password.send_keys("TestPassword123")
        
        # Give time for validation
        time.sleep(2)
        
        # Check if validation error disappears
        try:
            error_element = driver.find_element(By.XPATH, "//p[contains(text(), 'Le password non coincidono')]")
            print("❌ Password validation error should disappear for matching passwords!")
            return False
        except:
            print("✅ Validation correctly removes error for matching passwords!")
        
        print("🎉 Password validation is working correctly!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        return False
    finally:
        try:
            driver.quit()
        except:
            pass

if __name__ == "__main__":
    print("🔧 Password Validation Test Suite")
    print("=" * 50)
    
    success = test_password_validation()
    
    print("=" * 50)
    if success:
        print("✅ Password validation test PASSED!")
    else:
        print("❌ Password validation test FAILED!")
        print("💡 The validation logic has been updated - try the form manually to verify")
