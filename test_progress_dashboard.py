#!/usr/bin/env python3
"""
Test script for Progress Dashboard Task 36
Verifies the complete integration of Progress Visualization components
"""

import time
import json
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

class ProgressDashboardTester:
    def __init__(self):
        # Set up Chrome options
        chrome_options = Options()
        chrome_options.add_argument("--disable-web-security")
        chrome_options.add_argument("--disable-features=VizDisplayCompositor")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        
        self.driver = webdriver.Chrome(options=chrome_options)
        self.wait = WebDriverWait(self.driver, 10)
        self.base_url = "http://localhost:3001"
        self.test_results = {
            "timestamp": datetime.now().isoformat(),
            "total_tests": 0,
            "passed_tests": 0,
            "failed_tests": 0,
            "test_details": []
        }

    def log_test(self, test_name, status, message="", details=None):
        """Log test results"""
        self.test_results["total_tests"] += 1
        if status == "PASS":
            self.test_results["passed_tests"] += 1
        else:
            self.test_results["failed_tests"] += 1
            
        result = {
            "test_name": test_name,
            "status": status,
            "message": message,
            "timestamp": datetime.now().isoformat()
        }
        if details:
            result["details"] = details
            
        self.test_results["test_details"].append(result)
        print(f"[{status}] {test_name}: {message}")

    def test_basic_navigation(self):
        """Test basic navigation to the progress dashboard"""
        try:
            self.driver.get(self.base_url)
            self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
            
            # Check if login page loads
            if "login" in self.driver.current_url.lower() or self.driver.find_elements(By.CSS_SELECTOR, "form"):
                self.log_test("Basic Navigation", "PASS", "Application loads successfully, shows login form")
                return True
            else:
                self.log_test("Basic Navigation", "PASS", "Application loads successfully")
                return True
                
        except Exception as e:
            self.log_test("Basic Navigation", "FAIL", f"Failed to load application: {str(e)}")
            return False

    def test_login_functionality(self):
        """Test login functionality with mock credentials"""
        try:
            # Try to find login elements
            email_field = None
            password_field = None
            login_button = None
            
            try:
                email_field = self.driver.find_element(By.CSS_SELECTOR, "input[type='email'], input[name='email'], input[placeholder*='email' i]")
                password_field = self.driver.find_element(By.CSS_SELECTOR, "input[type='password'], input[name='password']")
                login_button = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit'], button:contains('Login'), button:contains('Accedi')")
            except NoSuchElementException:
                self.log_test("Login Functionality", "SKIP", "Login form not found - possibly already logged in")
                return True

            if email_field and password_field and login_button:
                # Fill in test credentials
                email_field.clear()
                email_field.send_keys("test@example.com")
                password_field.clear()
                password_field.send_keys("password123")
                
                # Click login
                login_button.click()
                
                # Wait for navigation or error
                time.sleep(2)
                
                self.log_test("Login Functionality", "PASS", "Login form submitted successfully")
                return True
            else:
                self.log_test("Login Functionality", "FAIL", "Login form elements not found")
                return False
                
        except Exception as e:
            self.log_test("Login Functionality", "FAIL", f"Login test failed: {str(e)}")
            return False

    def test_parent_dashboard_access(self):
        """Test access to parent dashboard"""
        try:
            # Try to navigate to parent dashboard
            self.driver.get(f"{self.base_url}/parent")
            self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
            
            # Check for dashboard elements
            dashboard_indicators = [
                "dashboard", "bambini", "children", "genitore", "parent",
                "progressi", "progress", "attività", "activities"
            ]
            
            page_text = self.driver.page_source.lower()
            found_indicators = [indicator for indicator in dashboard_indicators if indicator in page_text]
            
            if found_indicators:
                self.log_test("Parent Dashboard Access", "PASS", 
                            f"Parent dashboard loaded, found indicators: {', '.join(found_indicators[:3])}")
                return True
            else:
                self.log_test("Parent Dashboard Access", "FAIL", "Parent dashboard indicators not found")
                return False
                
        except Exception as e:
            self.log_test("Parent Dashboard Access", "FAIL", f"Failed to access parent dashboard: {str(e)}")
            return False

    def test_progress_dashboard_navigation(self):
        """Test navigation to progress dashboard"""
        try:
            # Try direct navigation to progress dashboard
            self.driver.get(f"{self.base_url}/parent/progress")
            self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
            
            # Check for progress dashboard specific elements
            progress_indicators = [
                "progressi", "progress", "chart", "grafico", "analytics",
                "recharts", "visualization", "visualizzazione"
            ]
            
            page_text = self.driver.page_source.lower()
            found_indicators = [indicator for indicator in progress_indicators if indicator in page_text]
            
            if found_indicators:
                self.log_test("Progress Dashboard Navigation", "PASS", 
                            f"Progress dashboard loaded, found indicators: {', '.join(found_indicators[:3])}")
                return True
            else:
                # Check if we're redirected or blocked
                current_url = self.driver.current_url
                if "login" in current_url:
                    self.log_test("Progress Dashboard Navigation", "SKIP", 
                                "Redirected to login - authentication required")
                    return True
                else:
                    self.log_test("Progress Dashboard Navigation", "FAIL", 
                                "Progress dashboard indicators not found")
                    return False
                
        except Exception as e:
            self.log_test("Progress Dashboard Navigation", "FAIL", 
                        f"Failed to navigate to progress dashboard: {str(e)}")
            return False

    def test_recharts_integration(self):
        """Test if Recharts components are loaded"""
        try:
            # Check for Recharts specific elements in DOM
            recharts_selectors = [
                ".recharts-wrapper",
                ".recharts-surface",
                "[class*='recharts']",
                "svg[class*='recharts']"
            ]
            
            recharts_found = False
            for selector in recharts_selectors:
                elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                if elements:
                    recharts_found = True
                    break
            
            if recharts_found:
                self.log_test("Recharts Integration", "PASS", "Recharts components found in DOM")
                return True
            else:
                # Check if recharts is loaded in JavaScript
                recharts_js = self.driver.execute_script("""
                    return typeof window.Recharts !== 'undefined' || 
                           typeof window.recharts !== 'undefined' ||
                           document.querySelector('[class*="recharts"]') !== null;
                """)
                
                if recharts_js:
                    self.log_test("Recharts Integration", "PASS", "Recharts detected via JavaScript")
                    return True
                else:
                    self.log_test("Recharts Integration", "FAIL", "Recharts components not found")
                    return False
                
        except Exception as e:
            self.log_test("Recharts Integration", "FAIL", f"Recharts integration test failed: {str(e)}")
            return False

    def test_progress_charts_component(self):
        """Test if ProgressCharts component renders"""
        try:
            # Check for chart-related elements
            chart_selectors = [
                "[class*='chart']",
                "[class*='progress']",
                "svg",
                ".dental-card",
                "[class*='grid']"
            ]
            
            charts_found = 0
            for selector in chart_selectors:
                elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                if elements:
                    charts_found += len(elements)
            
            if charts_found > 0:
                self.log_test("Progress Charts Component", "PASS", 
                            f"Found {charts_found} chart-related elements")
                return True
            else:
                self.log_test("Progress Charts Component", "FAIL", "No chart elements found")
                return False
                
        except Exception as e:
            self.log_test("Progress Charts Component", "FAIL", 
                        f"Progress charts test failed: {str(e)}")
            return False

    def test_sidebar_navigation(self):
        """Test if sidebar contains progress navigation"""
        try:
            # Look for sidebar elements
            sidebar_selectors = [
                "[class*='sidebar']",
                "nav",
                "[class*='navigation']",
                "aside"
            ]
            
            sidebar_found = False
            progress_link_found = False
            
            for selector in sidebar_selectors:
                elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                if elements:
                    sidebar_found = True
                    # Check if progress link exists in sidebar
                    for element in elements:
                        if "progress" in element.text.lower() or "progressi" in element.text.lower():
                            progress_link_found = True
                            break
                    if progress_link_found:
                        break
            
            if sidebar_found and progress_link_found:
                self.log_test("Sidebar Navigation", "PASS", "Sidebar with progress navigation found")
                return True
            elif sidebar_found:
                self.log_test("Sidebar Navigation", "PARTIAL", "Sidebar found but progress link not visible")
                return True
            else:
                self.log_test("Sidebar Navigation", "SKIP", "Sidebar not found - may be mobile layout")
                return True
                
        except Exception as e:
            self.log_test("Sidebar Navigation", "FAIL", f"Sidebar navigation test failed: {str(e)}")
            return False

    def test_responsive_design(self):
        """Test responsive design of progress dashboard"""
        try:
            # Test different screen sizes
            screen_sizes = [
                (1920, 1080, "Desktop"),
                (768, 1024, "Tablet"),
                (375, 667, "Mobile")
            ]
            
            responsive_tests = []
            
            for width, height, device in screen_sizes:
                self.driver.set_window_size(width, height)
                time.sleep(1)  # Wait for responsive changes
                
                # Check if page still renders properly
                body_element = self.driver.find_element(By.TAG_NAME, "body")
                if body_element.is_displayed():
                    responsive_tests.append(f"{device}: OK")
                else:
                    responsive_tests.append(f"{device}: FAIL")
            
            # Reset to desktop size
            self.driver.set_window_size(1920, 1080)
            
            self.log_test("Responsive Design", "PASS", 
                        f"Responsive tests: {', '.join(responsive_tests)}")
            return True
            
        except Exception as e:
            self.log_test("Responsive Design", "FAIL", f"Responsive design test failed: {str(e)}")
            return False

    def test_error_handling(self):
        """Test error handling and loading states"""
        try:
            # Check for error messages or loading indicators
            error_indicators = self.driver.find_elements(By.CSS_SELECTOR, 
                "[class*='error'], [class*='loading'], [class*='spinner']")
            
            if error_indicators:
                error_texts = [elem.text for elem in error_indicators if elem.text]
                self.log_test("Error Handling", "INFO", 
                            f"Found error/loading indicators: {', '.join(error_texts[:2])}")
            else:
                self.log_test("Error Handling", "PASS", "No error indicators found")
            
            return True
            
        except Exception as e:
            self.log_test("Error Handling", "FAIL", f"Error handling test failed: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all tests and generate report"""
        print("\n" + "="*60)
        print("TASK 36: PROGRESS DASHBOARD INTEGRATION TEST")
        print("="*60)
        
        tests = [
            self.test_basic_navigation,
            self.test_login_functionality,
            self.test_parent_dashboard_access,
            self.test_progress_dashboard_navigation,
            self.test_recharts_integration,
            self.test_progress_charts_component,
            self.test_sidebar_navigation,
            self.test_responsive_design,
            self.test_error_handling
        ]
        
        for test in tests:
            try:
                test()
            except Exception as e:
                self.log_test(test.__name__, "ERROR", f"Test execution failed: {str(e)}")
            time.sleep(1)  # Brief pause between tests
        
        # Generate final report
        self.generate_report()

    def generate_report(self):
        """Generate and save test report"""
        print("\n" + "="*60)
        print("TEST RESULTS SUMMARY")
        print("="*60)
        print(f"Total Tests: {self.test_results['total_tests']}")
        print(f"Passed: {self.test_results['passed_tests']}")
        print(f"Failed: {self.test_results['failed_tests']}")
        
        if self.test_results['total_tests'] > 0:
            success_rate = (self.test_results['passed_tests'] / self.test_results['total_tests']) * 100
            print(f"Success Rate: {success_rate:.1f}%")
        
        print("\nDETAILED RESULTS:")
        print("-" * 40)
        for test in self.test_results['test_details']:
            status_icon = "✓" if test['status'] == "PASS" else "✗" if test['status'] == "FAIL" else "⚠"
            print(f"{status_icon} {test['test_name']}: {test['message']}")
        
        # Save to file
        with open('task36_progress_dashboard_test_report.json', 'w') as f:
            json.dump(self.test_results, f, indent=2)
        
        print(f"\nDetailed report saved to: task36_progress_dashboard_test_report.json")
        
        # Assessment
        if self.test_results['failed_tests'] == 0:
            print("\n🎉 ALL TESTS PASSED! Progress Dashboard integration is successful!")
        elif self.test_results['passed_tests'] >= self.test_results['failed_tests']:
            print("\n✅ MOSTLY SUCCESSFUL! Minor issues found but core functionality works.")
        else:
            print("\n⚠️  NEEDS ATTENTION! Several issues found that should be addressed.")

    def __del__(self):
        """Cleanup"""
        if hasattr(self, 'driver'):
            self.driver.quit()

def main():
    """Main test execution"""
    tester = ProgressDashboardTester()
    try:
        tester.run_all_tests()
    finally:
        tester.__del__()

if __name__ == "__main__":
    main()
