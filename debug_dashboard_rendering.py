#!/usr/bin/env python3
"""
Debug script per verificare cosa viene effettivamente renderizzato sulla pagina ProgressDashboard
"""

import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

def setup_driver():
    chrome_options = Options()
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1280,720")
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        return driver
    except Exception as e:
        print(f"Error setting up Chrome driver: {e}")
        return None

def debug_progress_dashboard():
    """Debug what's actually being rendered"""
    driver = setup_driver()
    if not driver:
        return
    
    try:
        print("🔍 Debugging Progress Dashboard Rendering...")
        
        # Navigate to progress dashboard
        driver.get("http://localhost:3000/parent/progress")
        time.sleep(5)
        
        print(f"📄 Current URL: {driver.current_url}")
        print(f"📄 Page Title: {driver.title}")
        
        # Get page source and check what's being rendered
        page_source = driver.page_source
        
        # Check for key indicators
        print("\n🔍 Checking page content...")
        
        if "ProgressDashboard" in page_source:
            print("✅ ProgressDashboard component detected in page source")
        else:
            print("❌ ProgressDashboard component NOT detected in page source")
            
        if "ProgressCharts" in page_source:
            print("✅ ProgressCharts component detected in page source")
        else:
            print("❌ ProgressCharts component NOT detected in page source")
            
        if "data-testid" in page_source:
            print("✅ data-testid attributes detected in page source")
        else:
            print("❌ data-testid attributes NOT detected in page source")
        
        # Check for specific elements
        print("\n🔍 DOM Structure Analysis...")
        
        # Main containers
        body_content = driver.find_element(By.TAG_NAME, "body").get_attribute("innerHTML")
        
        if "Loading" in body_content or "loading" in body_content:
            print("⏳ Loading state detected")
            
        if "Error" in body_content or "error" in body_content:
            print("❌ Error state detected")
            
        # Check for common class names
        common_classes = [
            "dental-card", "progress", "chart", "recharts", 
            "grid", "flex", "space-y", "p-6", "bg-white"
        ]
        
        found_classes = []
        for class_name in common_classes:
            elements = driver.find_elements(By.CSS_SELECTOR, f"[class*='{class_name}']")
            if elements:
                found_classes.append(f"{class_name}: {len(elements)}")
        
        if found_classes:
            print(f"📊 Found CSS classes: {', '.join(found_classes)}")
        else:
            print("❌ No expected CSS classes found")
        
        # Check React components
        print("\n⚛️ React Component Analysis...")
        
        react_detected = driver.execute_script("return typeof React !== 'undefined'")
        print(f"React loaded: {react_detected}")
        
        # Check for routing
        print("\n🛤️ Routing Analysis...")
        
        current_path = driver.execute_script("return window.location.pathname")
        print(f"Current path: {current_path}")
        
        # Check if we're on the right route
        if current_path == "/parent/progress":
            print("✅ Correct route detected")
        else:
            print(f"❌ Wrong route - expected '/parent/progress', got '{current_path}'")
            
        # Try to find any content at all
        print("\n📄 General Content Analysis...")
        
        all_divs = driver.find_elements(By.TAG_NAME, "div")
        print(f"Total div elements: {len(all_divs)}")
        
        all_text = driver.find_element(By.TAG_NAME, "body").text
        print(f"Total text content length: {len(all_text)} characters")
        
        if len(all_text) > 100:
            print(f"Sample text content: {all_text[:200]}...")
        else:
            print(f"All text content: {all_text}")
        
        # Check console errors
        print("\n🚨 Console Error Analysis...")
        try:
            logs = driver.get_log('browser')
            severe_errors = [log for log in logs if log['level'] == 'SEVERE']
            
            if severe_errors:
                print(f"Found {len(severe_errors)} severe errors:")
                for error in severe_errors[:3]:  # Show first 3
                    print(f"  - {error['message'][:100]}...")
            else:
                print("✅ No severe console errors")
                
        except Exception as e:
            print(f"Could not check console logs: {e}")
        
        # Save screenshot for debugging
        try:
            driver.save_screenshot("progress_dashboard_debug.png")
            print("📸 Screenshot saved as progress_dashboard_debug.png")
        except Exception as e:
            print(f"Could not save screenshot: {e}")
            
    except Exception as e:
        print(f"❌ Debug error: {e}")
        
    finally:
        driver.quit()

if __name__ == "__main__":
    debug_progress_dashboard()
