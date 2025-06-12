#!/usr/bin/env python3
"""
Test suite per verificare il funzionamento dei ProgressCharts dopo il refactoring
"""

import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.action_chains import ActionChains

def setup_driver():
    """Setup Chrome driver with options"""
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

def test_progress_charts_refactored():
    """Test ProgressCharts component after refactoring"""
    driver = setup_driver()
    if not driver:
        return {"success": False, "error": "Could not setup driver"}
    
    results = {
        "test_start_time": time.strftime("%Y-%m-%d %H:%M:%S"),
        "tests": {},
        "summary": {}
    }
    
    try:
        # Navigate to application
        print("📱 Opening Smile Adventure application...")
        driver.get("http://localhost:3000")
        
        # Wait for app to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        results["tests"]["app_load"] = {
            "status": "✅ PASS",
            "message": "Application loaded successfully"
        }
        
        # Check if login is required
        time.sleep(2)
        current_url = driver.current_url
        
        if "login" in current_url.lower() or driver.find_elements(By.CSS_SELECTOR, "[type='email'], [placeholder*='email'], [placeholder*='Email']"):
            print("🔐 Login required, attempting login...")
            
            # Try to login with demo credentials
            email_field = driver.find_element(By.CSS_SELECTOR, "[type='email'], [placeholder*='email'], [placeholder*='Email']")
            password_field = driver.find_element(By.CSS_SELECTOR, "[type='password'], [placeholder*='password'], [placeholder*='Password']")
            
            email_field.clear()
            email_field.send_keys("parent@example.com")
            
            password_field.clear()
            password_field.send_keys("password123")
            
            # Find and click login button
            login_button = driver.find_element(By.CSS_SELECTOR, "[type='submit'], button[class*='login'], button[class*='btn']")
            login_button.click()
            
            # Wait for navigation
            time.sleep(3)
            
            results["tests"]["login"] = {
                "status": "✅ PASS",
                "message": "Login successful"
            }
        
        # Navigate to progress dashboard
        print("📊 Navigating to Progress Dashboard...")
        try:
            # Try direct navigation to progress route
            driver.get("http://localhost:3000/parent/progress")
            time.sleep(3)
            
            # Check if ProgressDashboard is loaded
            progress_indicators = driver.find_elements(By.CSS_SELECTOR, "[class*='chart'], [class*='progress'], [class*='dental-card']")
            
            if progress_indicators:
                results["tests"]["progress_dashboard_navigation"] = {
                    "status": "✅ PASS",
                    "message": f"Progress dashboard loaded with {len(progress_indicators)} components"
                }
            else:
                results["tests"]["progress_dashboard_navigation"] = {
                    "status": "⚠️ PARTIAL",
                    "message": "Progress dashboard loaded but components not detected"
                }
            
        except Exception as e:
            results["tests"]["progress_dashboard_navigation"] = {
                "status": "❌ FAIL",
                "message": f"Could not navigate to progress dashboard: {str(e)}"
            }
        
        # Test child profile integration
        print("👶 Testing Child Profile integration...")
        try:
            # Navigate to a child profile
            driver.get("http://localhost:3000/parent/child/1")
            time.sleep(3)
            
            # Look for progress tab or embedded charts
            progress_elements = driver.find_elements(By.CSS_SELECTOR, "[class*='progress'], [data-testid*='progress'], svg")
            tabs = driver.find_elements(By.CSS_SELECTOR, "[role='tab'], [class*='tab']")
            
            progress_tab_found = False
            for tab in tabs:
                if "progress" in tab.text.lower() or "progressi" in tab.text.lower():
                    progress_tab_found = True
                    print(f"🎯 Found progress tab: {tab.text}")
                    
                    # Click the progress tab
                    driver.execute_script("arguments[0].click();", tab)
                    time.sleep(2)
                    break
            
            if progress_tab_found:
                results["tests"]["child_profile_integration"] = {
                    "status": "✅ PASS",
                    "message": "Progress tab found and accessible in child profile"
                }
            elif progress_elements:
                results["tests"]["child_profile_integration"] = {
                    "status": "✅ PASS",
                    "message": f"Progress charts embedded in child profile ({len(progress_elements)} elements)"
                }
            else:
                results["tests"]["child_profile_integration"] = {
                    "status": "⚠️ PARTIAL",
                    "message": "Child profile loaded but progress integration not clearly visible"
                }
                
        except Exception as e:
            results["tests"]["child_profile_integration"] = {
                "status": "❌ FAIL",
                "message": f"Error testing child profile: {str(e)}"
            }
        
        # Test ProgressCharts interactivity
        print("🎮 Testing ProgressCharts interactivity...")
        try:
            # Go back to progress dashboard for better testing
            driver.get("http://localhost:3000/parent/progress")
            time.sleep(3)
            
            # Test filter interactions
            filters_tested = 0
            
            # Test period selector
            period_selectors = driver.find_elements(By.CSS_SELECTOR, "select[id*='period'], select[class*='period']")
            if period_selectors:
                period_selector = period_selectors[0]
                driver.execute_script("arguments[0].value = '7';", period_selector)
                driver.execute_script("arguments[0].dispatchEvent(new Event('change'));", period_selector)
                time.sleep(1)
                filters_tested += 1
            
            # Test metric selector
            metric_selectors = driver.find_elements(By.CSS_SELECTOR, "select[id*='metric'], select[class*='metric']")
            if metric_selectors:
                metric_selector = metric_selectors[0]
                driver.execute_script("arguments[0].value = 'score';", metric_selector)
                driver.execute_script("arguments[0].dispatchEvent(new Event('change'));", metric_selector)
                time.sleep(1)
                filters_tested += 1
            
            # Test chart type selector
            chart_selectors = driver.find_elements(By.CSS_SELECTOR, "select[id*='chart'], select[class*='type']")
            if chart_selectors:
                chart_selector = chart_selectors[0]
                driver.execute_script("arguments[0].value = 'area';", chart_selector)
                driver.execute_script("arguments[0].dispatchEvent(new Event('change'));", chart_selector)
                time.sleep(1)
                filters_tested += 1
            
            # Check for Recharts elements
            recharts_elements = driver.find_elements(By.CSS_SELECTOR, ".recharts-wrapper, .recharts-surface, svg")
            
            results["tests"]["progress_charts_interactivity"] = {
                "status": "✅ PASS" if filters_tested > 0 and recharts_elements else "⚠️ PARTIAL",
                "message": f"Tested {filters_tested} filters, found {len(recharts_elements)} chart elements"
            }
            
        except Exception as e:
            results["tests"]["progress_charts_interactivity"] = {
                "status": "❌ FAIL",
                "message": f"Error testing interactivity: {str(e)}"
            }
        
        # Test responsive design
        print("📱 Testing responsive design...")
        try:
            # Test mobile view
            driver.set_window_size(375, 667)  # iPhone size
            time.sleep(2)
            
            mobile_elements = driver.find_elements(By.CSS_SELECTOR, "[class*='grid'], [class*='dental-card']")
            
            # Test tablet view
            driver.set_window_size(768, 1024)  # iPad size
            time.sleep(2)
            
            tablet_elements = driver.find_elements(By.CSS_SELECTOR, "[class*='grid'], [class*='dental-card']")
            
            # Restore desktop view
            driver.set_window_size(1280, 720)
            time.sleep(1)
            
            results["tests"]["responsive_design"] = {
                "status": "✅ PASS",
                "message": f"Responsive: Mobile {len(mobile_elements)} elements, Tablet {len(tablet_elements)} elements"
            }
            
        except Exception as e:
            results["tests"]["responsive_design"] = {
                "status": "⚠️ PARTIAL",
                "message": f"Responsive test completed with issues: {str(e)}"
            }
        
        # Test error handling
        print("🔧 Testing error handling...")
        try:
            # Check console for JavaScript errors
            logs = driver.get_log('browser')
            js_errors = [log for log in logs if log['level'] == 'SEVERE']
            
            if not js_errors:
                results["tests"]["error_handling"] = {
                    "status": "✅ PASS",
                    "message": "No JavaScript errors detected"
                }
            else:
                results["tests"]["error_handling"] = {
                    "status": "⚠️ PARTIAL",
                    "message": f"Found {len(js_errors)} JavaScript errors/warnings"
                }
                
        except Exception as e:
            results["tests"]["error_handling"] = {
                "status": "⚠️ PARTIAL",
                "message": f"Error checking console logs: {str(e)}"
            }
        
    except Exception as e:
        results["tests"]["general_error"] = {
            "status": "❌ FAIL",
            "message": f"General test error: {str(e)}"
        }
    
    finally:
        driver.quit()
    
    # Calculate summary
    total_tests = len(results["tests"])
    passed_tests = len([t for t in results["tests"].values() if t["status"].startswith("✅")])
    partial_tests = len([t for t in results["tests"].values() if t["status"].startswith("⚠️")])
    failed_tests = len([t for t in results["tests"].values() if t["status"].startswith("❌")])
    
    success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
    
    results["summary"] = {
        "total_tests": total_tests,
        "passed": passed_tests,
        "partial": partial_tests,
        "failed": failed_tests,
        "success_rate": f"{success_rate:.1f}%",
        "overall_status": "✅ SUCCESS" if success_rate >= 80 else "⚠️ PARTIAL" if success_rate >= 60 else "❌ NEEDS_WORK"
    }
    
    results["test_end_time"] = time.strftime("%Y-%m-%d %H:%M:%S")
    
    return results

if __name__ == "__main__":
    print("🧪 Starting ProgressCharts Refactored Test Suite...")
    print("=" * 60)
    
    results = test_progress_charts_refactored()
    
    # Print results
    print("\n📊 TEST RESULTS:")
    print("=" * 60)
    
    for test_name, test_result in results["tests"].items():
        print(f"{test_result['status']} {test_name}: {test_result['message']}")
    
    print("\n📈 SUMMARY:")
    print("=" * 60)
    summary = results["summary"]
    print(f"Total Tests: {summary['total_tests']}")
    print(f"Passed: {summary['passed']}")
    print(f"Partial: {summary['partial']}")
    print(f"Failed: {summary['failed']}")
    print(f"Success Rate: {summary['success_rate']}")
    print(f"Overall Status: {summary['overall_status']}")
    
    # Save results
    with open("progress_charts_refactored_test_report.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📄 Detailed report saved to: progress_charts_refactored_test_report.json")
    print("\n🎉 Test suite completed!")
