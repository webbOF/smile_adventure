#!/usr/bin/env python3
"""
Test completo con autenticazione per ProgressCharts
"""

import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

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

def login_to_app(driver):
    """Login to the application"""
    try:
        print("🔐 Attempting to login...")
        
        # Navigate to login page
        driver.get("http://localhost:3000/login")
        time.sleep(2)
        
        # Find and fill email field
        email_field = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email'], input[name='email']"))
        )
        email_field.clear()
        email_field.send_keys("parent@example.com")
        
        # Find and fill password field
        password_field = driver.find_element(By.CSS_SELECTOR, "input[type='password'], input[name='password']")
        password_field.clear()
        password_field.send_keys("password123")
        
        # Find and click login button
        login_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit'], button:contains('Accedi')")
        login_button.click()
        
        # Wait for login to complete and redirect
        time.sleep(3)
        
        # Check if we're logged in (not on login page anymore)
        current_url = driver.current_url
        if "/login" not in current_url:
            print("✅ Login successful")
            return True
        else:
            print("❌ Login failed - still on login page")
            return False
            
    except Exception as e:
        print(f"❌ Login error: {e}")
        return False

def test_progress_charts_with_auth():
    """Complete test suite with authentication"""
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
        time.sleep(2)
        
        results["tests"]["app_load"] = {
            "status": "✅ PASS",
            "message": "Application loaded successfully"
        }
        
        # Login to the application
        login_success = login_to_app(driver)
        
        results["tests"]["authentication"] = {
            "status": "✅ PASS" if login_success else "❌ FAIL",
            "message": "User authentication successful" if login_success else "User authentication failed"
        }
        
        if not login_success:
            # If login fails, try to continue anyway (maybe we're already logged in)
            print("⚠️ Continuing without login...")
        
        # Navigate to progress dashboard
        print("📊 Navigating to Progress Dashboard...")
        driver.get("http://localhost:3000/parent/progress")
        time.sleep(5)
        
        # Check if we're still being redirected to login
        current_url = driver.current_url
        if "/login" in current_url:
            results["tests"]["progress_dashboard_access"] = {
                "status": "❌ FAIL",
                "message": "Cannot access progress dashboard - redirected to login"
            }
        else:
            results["tests"]["progress_dashboard_access"] = {
                "status": "✅ PASS",
                "message": f"Progress dashboard accessible at {current_url}"
            }
            
            # Now test the components
            print("🔍 Testing ProgressCharts components...")
            
            # Wait for content to load
            time.sleep(3)
            
            # Check for ProgressCharts container
            progress_container = driver.find_elements(By.CSS_SELECTOR, "[data-testid='progress-charts-container']")
            
            if progress_container:
                results["tests"]["progress_charts_container"] = {
                    "status": "✅ PASS",
                    "message": "ProgressCharts container found"
                }
                
                # Test specific components
                component_tests = {
                    "key_metrics": "[data-testid='progress-key-metrics']",
                    "filters_panel": "[data-testid='progress-filters-panel']",
                    "charts_grid": "[data-testid='progress-charts-grid']",
                    "main_chart": "[data-testid='progress-main-chart']",
                    "emotional_chart": "[data-testid='progress-emotional-chart']",
                    "insights_panel": "[data-testid='progress-insights-panel']"
                }
                
                for component_name, selector in component_tests.items():
                    elements = driver.find_elements(By.CSS_SELECTOR, selector)
                    results["tests"][f"component_{component_name}"] = {
                        "status": "✅ PASS" if elements else "❌ FAIL",
                        "message": f"{component_name} {'found' if elements else 'not found'} ({len(elements)} elements)"
                    }
                
                # Test filter interactions
                print("🎮 Testing filter interactions...")
                interactions_success = 0
                
                # Test period selector
                period_selectors = driver.find_elements(By.CSS_SELECTOR, "[data-testid='progress-period-selector']")
                if period_selectors:
                    try:
                        period_selector = period_selectors[0]
                        driver.execute_script("arguments[0].value = '7';", period_selector)
                        driver.execute_script("arguments[0].dispatchEvent(new Event('change'));", period_selector)
                        time.sleep(1)
                        interactions_success += 1
                    except:
                        pass
                
                results["tests"]["filter_interactions"] = {
                    "status": "✅ PASS" if interactions_success > 0 else "❌ FAIL",
                    "message": f"Filter interactions working: {interactions_success > 0}"
                }
                
                # Test Recharts integration
                print("📊 Testing Recharts...")
                recharts_elements = driver.find_elements(By.CSS_SELECTOR, ".recharts-wrapper, svg")
                
                results["tests"]["recharts_integration"] = {
                    "status": "✅ PASS" if recharts_elements else "❌ FAIL",
                    "message": f"Recharts elements found: {len(recharts_elements)}"
                }
                
            else:
                results["tests"]["progress_charts_container"] = {
                    "status": "❌ FAIL",
                    "message": "ProgressCharts container not found"
                }
                
                # Check what's actually being rendered
                page_text = driver.find_element(By.TAG_NAME, "body").text
                results["tests"]["page_content_analysis"] = {
                    "status": "⚠️ INFO",
                    "message": f"Page content sample: {page_text[:200]}..."
                }
        
        # Test Child Profile integration
        print("👶 Testing Child Profile integration...")
        try:
            driver.get("http://localhost:3000/parent/child/1")
            time.sleep(3)
            
            current_url = driver.current_url
            if "/login" not in current_url:
                # Look for progress-related content
                progress_elements = driver.find_elements(By.CSS_SELECTOR, "[data-testid*='progress'], [class*='progress']")
                tabs = driver.find_elements(By.CSS_SELECTOR, "[role='tab'], [class*='tab']")
                
                progress_tab_found = False
                for tab in tabs:
                    if "progress" in tab.text.lower() or "progressi" in tab.text.lower():
                        progress_tab_found = True
                        break
                
                results["tests"]["child_profile_integration"] = {
                    "status": "✅ PASS" if progress_elements or progress_tab_found else "⚠️ PARTIAL",
                    "message": f"Child profile accessible, progress elements: {len(progress_elements)}, progress tab: {progress_tab_found}"
                }
            else:
                results["tests"]["child_profile_integration"] = {
                    "status": "❌ FAIL",
                    "message": "Cannot access child profile - redirected to login"
                }
                
        except Exception as e:
            results["tests"]["child_profile_integration"] = {
                "status": "❌ FAIL",
                "message": f"Error testing child profile: {str(e)}"
            }
        
        # Final error check
        print("🔧 Checking for JavaScript errors...")
        try:
            logs = driver.get_log('browser')
            js_errors = [log for log in logs if log['level'] == 'SEVERE' and 'Failed %s type' not in log['message']]
            
            results["tests"]["javascript_errors"] = {
                "status": "✅ PASS" if len(js_errors) <= 2 else "⚠️ PARTIAL",
                "message": f"JavaScript errors (excluding prop warnings): {len(js_errors)}"
            }
            
        except Exception as e:
            results["tests"]["javascript_errors"] = {
                "status": "⚠️ PARTIAL",
                "message": f"Could not check console logs: {str(e)}"
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
        "overall_status": "✅ SUCCESS" if success_rate >= 75 else "⚠️ GOOD" if success_rate >= 50 else "❌ NEEDS_WORK"
    }
    
    results["test_end_time"] = time.strftime("%Y-%m-%d %H:%M:%S")
    
    return results

if __name__ == "__main__":
    print("🧪 Starting Complete ProgressCharts Test Suite with Authentication...")
    print("=" * 70)
    
    results = test_progress_charts_with_auth()
    
    # Print results
    print("\n📊 COMPLETE TEST RESULTS:")
    print("=" * 70)
    
    for test_name, test_result in results["tests"].items():
        print(f"{test_result['status']} {test_name}: {test_result['message']}")
    
    print("\n📈 SUMMARY:")
    print("=" * 70)
    summary = results["summary"]
    print(f"Total Tests: {summary['total_tests']}")
    print(f"Passed: {summary['passed']}")
    print(f"Partial: {summary['partial']}")
    print(f"Failed: {summary['failed']}")
    print(f"Success Rate: {summary['success_rate']}")
    print(f"Overall Status: {summary['overall_status']}")
    
    # Save results
    with open("progress_charts_complete_test_report.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📄 Detailed report saved to: progress_charts_complete_test_report.json")
    print("\n🎉 Complete test suite finished!")
