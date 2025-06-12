#!/usr/bin/env python3
"""
Functional testing of the complete Smile Adventure application
Tests actual user workflows and interactions
"""
import time
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

class SmileAdventureFunctionalTest:
    def __init__(self):
        self.driver = None
        self.wait = None
        self.test_email = f"test.user.{int(time.time())}@test.com"
        self.test_password = "TestPassword123!"
        self.results = []
        
    def setup_driver(self):
        """Setup Chrome driver for testing"""
        options = Options()
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--window-size=1920,1080")
        
        try:
            self.driver = webdriver.Chrome(options=options)
            self.wait = WebDriverWait(self.driver, 20)
            print("✅ Chrome driver initialized successfully")
            return True
        except Exception as e:
            print(f"❌ Error initializing Chrome driver: {e}")
            return False
            
    def test_server_connectivity(self):
        """Test 1: Server connectivity"""
        print("\n🧪 TEST 1: Server Connectivity")
        print("-" * 50)
        
        try:
            # Test frontend
            frontend_response = requests.get('http://localhost:3000', timeout=10)
            frontend_ok = frontend_response.status_code == 200
            print(f"   Frontend (React): {'✅' if frontend_ok else '❌'} Status {frontend_response.status_code}")
            
            # Test backend
            backend_response = requests.get('http://localhost:8000/health', timeout=10)
            backend_ok = backend_response.status_code == 200
            print(f"   Backend (FastAPI): {'✅' if backend_ok else '❌'} Status {backend_response.status_code}")
            
            # Test API docs
            docs_response = requests.get('http://localhost:8000/docs', timeout=10)
            docs_ok = docs_response.status_code == 200
            print(f"   API Documentation: {'✅' if docs_ok else '❌'} Status {docs_response.status_code}")
            
            success = frontend_ok and backend_ok and docs_ok
            self.results.append({
                'test': 'Server Connectivity',
                'passed': success,
                'details': f"Frontend: {frontend_ok}, Backend: {backend_ok}, Docs: {docs_ok}"
            })
            
            return success
            
        except Exception as e:
            print(f"❌ Server connectivity test failed: {e}")
            self.results.append({
                'test': 'Server Connectivity',
                'passed': False,
                'details': str(e)
            })
            return False
    
    def test_homepage_navigation(self):
        """Test 2: Homepage and navigation"""
        print("\n🧪 TEST 2: Homepage Navigation")
        print("-" * 50)
        
        try:
            # Navigate to homepage
            self.driver.get("http://localhost:3000")
            self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
            
            # Check page title
            page_title = self.driver.title
            title_ok = "Smile Adventure" in page_title
            print(f"   Page Title: {'✅' if title_ok else '❌'} '{page_title}'")
            
            # Check main navigation elements
            nav_elements = []
            try:
                login_link = self.driver.find_element(By.LINK_TEXT, "Accedi")
                nav_elements.append("Login")
            except NoSuchElementException:
                pass
                
            try:
                register_link = self.driver.find_element(By.LINK_TEXT, "Registrati")
                nav_elements.append("Register")
            except NoSuchElementException:
                pass
                
            nav_ok = len(nav_elements) >= 2
            print(f"   Navigation Links: {'✅' if nav_ok else '❌'} Found: {nav_elements}")
            
            # Check for key content sections
            content_sections = []
            if "gamification" in self.driver.page_source.lower():
                content_sections.append("Features")
            if "bambini" in self.driver.page_source.lower():
                content_sections.append("Kids content")
            if "genitore" in self.driver.page_source.lower() or "parent" in self.driver.page_source.lower():
                content_sections.append("Parent content")
                
            content_ok = len(content_sections) >= 2
            print(f"   Content Sections: {'✅' if content_ok else '❌'} Found: {content_sections}")
            
            # Take screenshot
            self.driver.save_screenshot("test_homepage.png")
            print("📸 Screenshot saved: test_homepage.png")
            
            success = title_ok and nav_ok and content_ok
            self.results.append({
                'test': 'Homepage Navigation',
                'passed': success,
                'details': f"Title: {title_ok}, Navigation: {nav_ok}, Content: {content_ok}"
            })
            
            return success
            
        except Exception as e:
            print(f"❌ Homepage navigation test failed: {e}")
            self.results.append({
                'test': 'Homepage Navigation',
                'passed': False,
                'details': str(e)
            })
            return False
    
    def test_user_registration(self):
        """Test 3: User registration flow"""
        print("\n🧪 TEST 3: User Registration Flow")
        print("-" * 50)
        
        try:
            # Navigate to registration page
            self.driver.get("http://localhost:3000/register")
            self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "form")))
            
            print(f"📧 Test email: {self.test_email}")
            
            # Fill registration form
            first_name = self.driver.find_element(By.NAME, "firstName")
            first_name.clear()
            first_name.send_keys("Test")
            
            last_name = self.driver.find_element(By.NAME, "lastName")
            last_name.clear()
            last_name.send_keys("User")
            
            email_field = self.driver.find_element(By.NAME, "email")
            email_field.clear()
            email_field.send_keys(self.test_email)
            
            password_field = self.driver.find_element(By.NAME, "password")
            password_field.clear()
            password_field.send_keys(self.test_password)
            
            confirm_password = self.driver.find_element(By.NAME, "confirmPassword")
            confirm_password.clear()
            confirm_password.send_keys(self.test_password)
            
            # Accept terms if present
            try:
                terms_checkbox = self.driver.find_element(By.NAME, "terms")
                if not terms_checkbox.is_selected():
                    terms_checkbox.click()
            except NoSuchElementException:
                print("   No terms checkbox found")
            
            print("✅ Registration form filled")
            
            # Screenshot before submit
            self.driver.save_screenshot("test_registration_before.png")
            
            # Submit form
            submit_button = self.driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
            submit_button.click()
            
            # Wait for response
            time.sleep(5)
            
            # Check result
            current_url = self.driver.current_url
            
            # Screenshot after submit
            self.driver.save_screenshot("test_registration_after.png")
            print("📸 Screenshots saved: test_registration_before.png, test_registration_after.png")
            
            # Check for success indicators
            success_indicators = [
                "/parent" in current_url,
                "/professional" in current_url,
                "/login" in current_url,  # Sometimes redirects to login after successful registration
                "benvenuto" in self.driver.page_source.lower(),
                "dashboard" in self.driver.page_source.lower()
            ]
            
            registration_success = any(success_indicators)
            
            # Check for error messages
            error_elements = self.driver.find_elements(By.CSS_SELECTOR, ".text-red-600, .error, [class*='error']")
            visible_errors = [elem.text for elem in error_elements if elem.is_displayed() and elem.text.strip()]
            
            if visible_errors:
                print(f"⚠️  Errors found: {visible_errors}")
            
            print(f"   Final URL: {current_url}")
            print(f"   Registration Success: {'✅' if registration_success else '❌'}")
            
            self.results.append({
                'test': 'User Registration',
                'passed': registration_success,
                'details': f"URL: {current_url}, Errors: {visible_errors}"
            })
            
            return registration_success
            
        except Exception as e:
            print(f"❌ User registration test failed: {e}")
            self.results.append({
                'test': 'User Registration',
                'passed': False,
                'details': str(e)
            })
            return False
    
    def test_user_login(self):
        """Test 4: User login flow"""
        print("\n🧪 TEST 4: User Login Flow")
        print("-" * 50)
        
        try:
            # Navigate to login page
            self.driver.get("http://localhost:3000/login")
            self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "form")))
            
            # Fill login form
            email_field = self.driver.find_element(By.NAME, "email")
            email_field.clear()
            email_field.send_keys(self.test_email)
            
            password_field = self.driver.find_element(By.NAME, "password")
            password_field.clear()
            password_field.send_keys(self.test_password)
            
            print(f"📧 Login with: {self.test_email}")
            
            # Screenshot before submit
            self.driver.save_screenshot("test_login_before.png")
            
            # Submit form
            submit_button = self.driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
            submit_button.click()
            
            # Wait for response
            time.sleep(5)
            
            # Check result
            current_url = self.driver.current_url
            
            # Screenshot after submit
            self.driver.save_screenshot("test_login_after.png")
            print("📸 Screenshots saved: test_login_before.png, test_login_after.png")
            
            # Check for success indicators
            success_indicators = [
                "/parent" in current_url,
                "/professional" in current_url,
                "/dashboard" in current_url,
                "dashboard" in self.driver.page_source.lower()
            ]
            
            login_success = any(success_indicators)
            
            # Check for error messages
            error_elements = self.driver.find_elements(By.CSS_SELECTOR, ".text-red-600, .error, [class*='error']")
            visible_errors = [elem.text for elem in error_elements if elem.is_displayed() and elem.text.strip()]
            
            if visible_errors:
                print(f"⚠️  Errors found: {visible_errors}")
            
            print(f"   Final URL: {current_url}")
            print(f"   Login Success: {'✅' if login_success else '❌'}")
            
            self.results.append({
                'test': 'User Login',
                'passed': login_success,
                'details': f"URL: {current_url}, Errors: {visible_errors}"
            })
            
            return login_success
            
        except Exception as e:
            print(f"❌ User login test failed: {e}")
            self.results.append({
                'test': 'User Login',
                'passed': False,
                'details': str(e)
            })
            return False
    
    def test_dashboard_functionality(self):
        """Test 5: Dashboard functionality"""
        print("\n🧪 TEST 5: Dashboard Functionality")
        print("-" * 50)
        
        try:
            current_url = self.driver.current_url
            
            if "/parent" in current_url:
                return self.test_parent_dashboard()
            elif "/professional" in current_url:
                return self.test_professional_dashboard()
            else:
                print("⚠️  No specific dashboard detected, testing general dashboard")
                return self.test_general_dashboard()
                
        except Exception as e:
            print(f"❌ Dashboard functionality test failed: {e}")
            self.results.append({
                'test': 'Dashboard Functionality',
                'passed': False,
                'details': str(e)
            })
            return False
    
    def test_parent_dashboard(self):
        """Test parent dashboard specific features"""
        print("   🎯 Testing Parent Dashboard...")
        
        # Check for parent-specific elements
        parent_elements = []
        
        # Look for children-related content
        if "bambino" in self.driver.page_source.lower() or "child" in self.driver.page_source.lower():
            parent_elements.append("Children content")
            
        # Look for activities/games
        if "attivit" in self.driver.page_source.lower() or "gioco" in self.driver.page_source.lower():
            parent_elements.append("Activities/Games")
            
        # Look for statistics/progress
        if "punti" in self.driver.page_source.lower() or "progresso" in self.driver.page_source.lower():
            parent_elements.append("Progress tracking")
            
        # Check for add child functionality
        try:
            add_child_button = self.driver.find_element(By.XPATH, "//*[contains(text(), 'Aggiungi') and contains(text(), 'bambino')]")
            parent_elements.append("Add child button")
        except NoSuchElementException:
            pass
        
        success = len(parent_elements) >= 2
        print(f"   Parent Features Found: {'✅' if success else '❌'} {parent_elements}")
        
        # Take screenshot
        self.driver.save_screenshot("test_parent_dashboard.png")
        
        self.results.append({
            'test': 'Parent Dashboard',
            'passed': success,
            'details': f"Features: {parent_elements}"
        })
        
        return success
    
    def test_professional_dashboard(self):
        """Test professional dashboard specific features"""
        print("   🎯 Testing Professional Dashboard...")
        
        # Check for professional-specific elements
        prof_elements = []
        
        # Look for patient-related content
        if "pazient" in self.driver.page_source.lower() or "patient" in self.driver.page_source.lower():
            prof_elements.append("Patient content")
            
        # Look for analytics/reports
        if "analisi" in self.driver.page_source.lower() or "report" in self.driver.page_source.lower():
            prof_elements.append("Analytics/Reports")
            
        # Look for statistics
        if "statistic" in self.driver.page_source.lower() or "sessioni" in self.driver.page_source.lower():
            prof_elements.append("Statistics")
            
        success = len(prof_elements) >= 2
        print(f"   Professional Features Found: {'✅' if success else '❌'} {prof_elements}")
        
        # Take screenshot
        self.driver.save_screenshot("test_professional_dashboard.png")
        
        self.results.append({
            'test': 'Professional Dashboard',
            'passed': success,
            'details': f"Features: {prof_elements}"
        })
        
        return success
    
    def test_general_dashboard(self):
        """Test general dashboard features"""
        print("   🎯 Testing General Dashboard...")
        
        # Check for basic dashboard elements
        dashboard_elements = []
        
        # Look for navigation
        nav_links = self.driver.find_elements(By.TAG_NAME, "a")
        if len(nav_links) > 0:
            dashboard_elements.append(f"Navigation links ({len(nav_links)})")
            
        # Look for content cards/sections
        cards = self.driver.find_elements(By.CSS_SELECTOR, ".card, .dashboard-card, [class*='card']")
        if len(cards) > 0:
            dashboard_elements.append(f"Content cards ({len(cards)})")
            
        # Look for user information
        if "welcome" in self.driver.page_source.lower() or "benvenuto" in self.driver.page_source.lower():
            dashboard_elements.append("Welcome message")
            
        success = len(dashboard_elements) >= 2
        print(f"   Dashboard Elements Found: {'✅' if success else '❌'} {dashboard_elements}")
        
        # Take screenshot
        self.driver.save_screenshot("test_general_dashboard.png")
        
        self.results.append({
            'test': 'General Dashboard',
            'passed': success,
            'details': f"Elements: {dashboard_elements}"
        })
        
        return success
    
    def test_responsive_design(self):
        """Test 6: Responsive design"""
        print("\n🧪 TEST 6: Responsive Design")
        print("-" * 50)
        
        try:
            # Test different screen sizes
            screen_sizes = [
                ("Desktop", 1920, 1080),
                ("Tablet", 768, 1024),
                ("Mobile", 375, 667)
            ]
            
            responsive_results = []
            
            for size_name, width, height in screen_sizes:
                self.driver.set_window_size(width, height)
                time.sleep(2)  # Allow layout to adjust
                
                # Check if page is still functional
                try:
                    self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
                    page_functional = True
                    
                    # Take screenshot
                    self.driver.save_screenshot(f"test_responsive_{size_name.lower()}.png")
                    
                except TimeoutException:
                    page_functional = False
                
                responsive_results.append((size_name, page_functional))
                print(f"   {size_name} ({width}x{height}): {'✅' if page_functional else '❌'}")
            
            # Reset to desktop size
            self.driver.set_window_size(1920, 1080)
            
            success = all(result[1] for result in responsive_results)
            self.results.append({
                'test': 'Responsive Design',
                'passed': success,
                'details': f"Results: {responsive_results}"
            })
            
            return success
            
        except Exception as e:
            print(f"❌ Responsive design test failed: {e}")
            self.results.append({
                'test': 'Responsive Design',
                'passed': False,
                'details': str(e)
            })
            return False
    
    def test_logout_functionality(self):
        """Test 7: Logout functionality"""
        print("\n🧪 TEST 7: Logout Functionality")
        print("-" * 50)
        
        try:
            # Look for logout button/link
            logout_found = False
            logout_method = ""
            
            try:
                # Try to find logout button with text
                logout_button = self.driver.find_element(By.XPATH, "//*[contains(text(), 'Esci') or contains(text(), 'Logout')]")
                logout_found = True
                logout_method = "text"
            except NoSuchElementException:
                try:
                    # Try to find logout by icon or class
                    logout_button = self.driver.find_element(By.CSS_SELECTOR, "[class*='logout'], [title*='logout'], [title*='esci']")
                    logout_found = True
                    logout_method = "class/title"
                except NoSuchElementException:
                    pass
            
            if logout_found:
                print(f"   Logout element found via: {logout_method}")
                
                # Click logout
                logout_button.click()
                time.sleep(3)
                
                # Check if redirected to login/home page
                current_url = self.driver.current_url
                logout_success = any([
                    current_url.endswith("/"),
                    "/login" in current_url,
                    "/register" in current_url
                ])
                
                print(f"   Logout Success: {'✅' if logout_success else '❌'}")
                print(f"   Final URL: {current_url}")
                
                # Take screenshot
                self.driver.save_screenshot("test_logout_result.png")
                
            else:
                print("   ⚠️  Logout button not found")
                logout_success = False
            
            self.results.append({
                'test': 'Logout Functionality',
                'passed': logout_success,
                'details': f"Found: {logout_found}, Method: {logout_method}"
            })
            
            return logout_success
            
        except Exception as e:
            print(f"❌ Logout functionality test failed: {e}")
            self.results.append({
                'test': 'Logout Functionality',
                'passed': False,
                'details': str(e)
            })
            return False
    
    def generate_test_report(self):
        """Generate comprehensive test report"""
        print("\n🎯 FUNCTIONAL TESTING SUMMARY")
        print("=" * 80)
        
        passed_tests = sum(1 for result in self.results if result['passed'])
        total_tests = len(self.results)
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        print(f"📊 OVERALL RESULTS: {passed_tests}/{total_tests} tests passed ({success_rate:.1f}%)")
        print()
        
        for result in self.results:
            status = "✅ PASSED" if result['passed'] else "❌ FAILED"
            print(f"{result['test']}: {status}")
            if not result['passed']:
                print(f"   📋 Details: {result['details']}")
        
        if success_rate >= 85:
            print("\n🎉 APPLICATION IS FUNCTIONAL AND READY FOR USE!")
        elif success_rate >= 70:
            print("\n⚠️  APPLICATION IS MOSTLY FUNCTIONAL - MINOR ISSUES TO ADDRESS")
        else:
            print("\n❌ APPLICATION NEEDS SIGNIFICANT IMPROVEMENTS")
        
        # Save detailed report
        import json
        report_file = "functional_test_report.json"
        with open(report_file, 'w') as f:
            json.dump({
                'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
                'summary': {
                    'total_tests': total_tests,
                    'passed_tests': passed_tests,
                    'success_rate': success_rate
                },
                'detailed_results': self.results
            }, f, indent=2)
        
        print(f"\n📄 Detailed report saved: {report_file}")
        
        return success_rate >= 85
    
    def run_all_tests(self):
        """Run all functional tests"""
        print("🚀 SMILE ADVENTURE - FUNCTIONAL TESTING SUITE")
        print("=" * 80)
        
        if not self.setup_driver():
            return False
        
        try:
            # Run all tests in sequence
            self.test_server_connectivity()
            self.test_homepage_navigation()
            self.test_user_registration()
            self.test_user_login()
            self.test_dashboard_functionality()
            self.test_responsive_design()
            self.test_logout_functionality()
            
            # Generate final report
            success = self.generate_test_report()
            
            return success
            
        except Exception as e:
            print(f"❌ Testing suite failed: {e}")
            return False
        finally:
            if self.driver:
                input("\n⏸️  Press ENTER to close browser and finish testing...")
                self.driver.quit()

def main():
    tester = SmileAdventureFunctionalTest()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    exit(main())
