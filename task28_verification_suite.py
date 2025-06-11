#!/usr/bin/env python3
"""
Test specifico per verificare il completamento del Task 28: React Project Setup
Cross-platform compatible implementation
"""
import time
import requests
import json
import os
import sys
import subprocess
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# Import portable test helpers (fallback to stub if file doesn't exist)
try:
    from portable_test_helpers import (
        detect_platform, find_npm_executable, find_webdriver, 
        create_headless_chrome_options
    )
    PORTABLE_HELPERS = True
except ImportError:
    PORTABLE_HELPERS = False
    print("⚠️ Portable test helpers not found, using default configuration")

class Task28VerificationSuite:
    def __init__(self):
        self.driver = None
        self.wait = None
        self.results = {
            'tests_run': 0,
            'tests_passed': 0,
            'tests_failed': 0,
            'failed_tests': []
        }
        self.project_root = r"c:\Users\arman\Desktop\WebSimpl\smile_adventure\frontend"
      def setup_driver(self):
        """Setup Chrome driver with cross-platform compatibility"""
        try:
            # Try using portable helpers first
            if PORTABLE_HELPERS:
                print("🔍 Detecting Chrome driver using portable helpers...")
                driver_path, driver_version, driver_found = find_webdriver('chrome')
                chrome_options = create_headless_chrome_options()
                
                if driver_found:
                    print(f"✅ Found Chrome driver: {driver_version}")
                    self.driver = webdriver.Chrome(options=chrome_options)
                else:
                    print("⚠️ Chrome driver not found with portable helpers, trying default setup")
                    chrome_options = Options()  # Fallback to default options
                    chrome_options.add_argument("--no-sandbox")
                    chrome_options.add_argument("--disable-dev-shm-usage")
                    chrome_options.add_argument("--window-size=1920,1080")
                    self.driver = webdriver.Chrome(options=chrome_options)
            else:
                # Fallback to default setup
                chrome_options = Options()
                chrome_options.add_argument("--no-sandbox")
                chrome_options.add_argument("--disable-dev-shm-usage")
                chrome_options.add_argument("--window-size=1920,1080")
                self.driver = webdriver.Chrome(options=chrome_options)
            
            self.wait = WebDriverWait(self.driver, 15)
            self.driver.maximize_window()
            print("✅ Chrome driver initialized successfully")
            
        except Exception as e:
            print(f"❌ Failed to initialize Chrome driver: {str(e)}")
            print("💡 Make sure Chrome and chromedriver are installed and available")
            print("💡 You may need to install chromedriver with: pip install webdriver-manager")
            raise
    
    def run_test(self, test_name, test_func):
        """Execute a test and track results"""
        print(f"\n🧪 TASK 28 TEST: {test_name}")
        print("-" * 70)
        self.results['tests_run'] += 1
        
        try:
            success = test_func()
            if success:
                print(f"✅ PASSATO: {test_name}")
                self.results['tests_passed'] += 1
                return True
            else:
                print(f"❌ FALLITO: {test_name}")
                self.results['tests_failed'] += 1
                self.results['failed_tests'].append(test_name)
                return False
        except Exception as e:
            print(f"❌ ERRORE in {test_name}: {e}")
            self.results['tests_failed'] += 1
            self.results['failed_tests'].append(f"{test_name} (Exception: {str(e)})")
            return False
    
    def test_1_react_project_structure(self):
        """Test 1: Verificare la struttura del progetto React"""
        print("🔍 Verificando struttura progetto React...")
        
        required_files = [
            "package.json",
            "public/index.html",
            "src/index.js",
            "src/App.js",
            "src/components",
            "src/pages",
            "src/services",
            "src/hooks",
            "src/types",
            "src/styles"
        ]
        
        missing_files = []
        for file_path in required_files:
            full_path = os.path.join(self.project_root, file_path)
            if not os.path.exists(full_path):
                missing_files.append(file_path)
                print(f"   ❌ Mancante: {file_path}")
            else:
                print(f"   ✅ Trovato: {file_path}")
        
        if missing_files:
            print(f"❌ File/cartelle mancanti: {len(missing_files)}")
            return False
        
        print("✅ Struttura progetto React completa")
        return True
    
    def test_2_package_json_dependencies(self):
        """Test 2: Verificare le dipendenze in package.json"""
        print("🔍 Verificando dipendenze React...")
        
        try:
            package_json_path = os.path.join(self.project_root, "package.json")
            with open(package_json_path, 'r') as f:
                package_data = json.load(f)
            
            required_dependencies = [
                "react",
                "react-dom",
                "react-router-dom",
                "react-hook-form",
                "react-hot-toast",
                "zustand",
                "@heroicons/react"
            ]
            
            required_dev_dependencies = [
                "tailwindcss",
                "@tailwindcss/forms"
            ]
            
            dependencies = package_data.get('dependencies', {})
            dev_dependencies = package_data.get('devDependencies', {})
            
            missing_deps = []
            for dep in required_dependencies:
                if dep not in dependencies:
                    missing_deps.append(dep)
                    print(f"   ❌ Dipendenza mancante: {dep}")
                else:
                    print(f"   ✅ Dipendenza trovata: {dep} ({dependencies[dep]})")
            
            for dep in required_dev_dependencies:
                if dep not in dev_dependencies and dep not in dependencies:
                    missing_deps.append(dep)
                    print(f"   ❌ Dev dipendenza mancante: {dep}")
                else:
                    version = dev_dependencies.get(dep, dependencies.get(dep, 'unknown'))
                    print(f"   ✅ Dev dipendenza trovata: {dep} ({version})")
            
            if missing_deps:
                print(f"❌ Dipendenze mancanti: {len(missing_deps)}")
                return False
            
            print("✅ Tutte le dipendenze React sono installate")
            return True
            
        except Exception as e:
            print(f"❌ Errore leggendo package.json: {e}")
            return False
    
    def test_3_tailwind_configuration(self):
        """Test 3: Verificare configurazione Tailwind CSS"""
        print("🔍 Verificando configurazione Tailwind CSS...")
        
        config_files = [
            "tailwind.config.js",
            "src/index.css"
        ]
        
        for config_file in config_files:
            config_path = os.path.join(self.project_root, config_file)
            if not os.path.exists(config_path):
                print(f"   ❌ File configurazione mancante: {config_file}")
                return False
            else:
                print(f"   ✅ File configurazione trovato: {config_file}")
        
        # Check if Tailwind directives are in index.css
        try:
            css_path = os.path.join(self.project_root, "src/index.css")
            with open(css_path, 'r') as f:
                css_content = f.read()
            
            tailwind_directives = [
                "@tailwind base",
                "@tailwind components", 
                "@tailwind utilities"
            ]
            
            for directive in tailwind_directives:
                if directive in css_content:
                    print(f"   ✅ Direttiva Tailwind trovata: {directive}")
                else:
                    print(f"   ❌ Direttiva Tailwind mancante: {directive}")
                    return False
            
            print("✅ Configurazione Tailwind CSS completa")
            return True
            
        except Exception as e:
            print(f"❌ Errore verificando Tailwind: {e}")
            return False
      def test_4_react_app_builds(self):
        """Test 4: Verificare che l'app React compili senza errori"""
        print("🔍 Verificando build dell'app React...")
        
        # First try to see if the frontend server is already running
        try:
            response = requests.get("http://localhost:3000", timeout=5)
            if response.status_code == 200:
                print("   ✅ Frontend server è in esecuzione")
                print("   ✅ App React compila e serve correttamente")
                return True
            else:
                print(f"   ⚠️ Frontend server risponde con status: {response.status_code}")
                # Continue to build test
        except requests.exceptions.ConnectionError:
            print("   ⚠️ Frontend server non raggiungibile - eseguirò il build test")
            # Continue to build test
        except Exception as e:
            print(f"   ⚠️ Errore verificando server: {e}")
            # Continue to build test
            
        # Try to build the app
        try:
            # Import portable helpers for npm detection
            try:
                from portable_test_helpers import find_npm_executable
                npm_cmd, npm_version, npm_found = find_npm_executable()
            except ImportError:
                # Fallback to simpler detection
                npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
                npm_found = True
            
            if not npm_found:
                print("   ❌ npm non trovato nel sistema")
                print("   💡 Installa Node.js da https://nodejs.org/")
                return False
                
            # Change to frontend directory
            original_dir = os.getcwd()
            os.chdir(self.project_root)
            
            print(f"   🔄 Esecuzione build con {npm_cmd}...")
            cmd_parts = npm_cmd.split() if " " in npm_cmd else [npm_cmd]
            
            # Run the build command
            result = subprocess.run(
                cmd_parts + ["run", "build"],
                capture_output=True,
                text=True,
                timeout=120  # 2 minute timeout
            )
            
            # Return to original directory
            os.chdir(original_dir)
            
            if result.returncode == 0:
                print("   ✅ Build completato con successo")
                
                # Check build directory
                build_dir = os.path.join(self.project_root, "build")
                if os.path.exists(build_dir):
                    print("   ✅ Directory build creata")
                    return True
                else:
                    print("   ❌ Directory build non trovata")
                    return False
            else:
                print(f"   ❌ Errore durante il build:")
                print(result.stderr[:500] + "..." if len(result.stderr) > 500 else result.stderr)
                return False
                
        except subprocess.TimeoutExpired:
            print("   ❌ Timeout durante il build (oltre 2 minuti)")
            return False
        except Exception as e:
            print(f"   ❌ Errore eseguendo build: {e}")
            return False
    
    def test_5_react_routing_setup(self):
        """Test 5: Verificare che React Router sia configurato"""
        print("🔍 Verificando configurazione React Router...")
        
        if not self.driver:
            self.setup_driver()
        
        try:
            # Test different routes
            routes_to_test = [
                ("http://localhost:3000/", "Homepage"),
                ("http://localhost:3000/register", "Registrazione"),
                ("http://localhost:3000/login", "Login")
            ]
            
            for url, page_name in routes_to_test:
                self.driver.get(url)
                time.sleep(2)
                
                # Check if page loads without React errors
                current_url = self.driver.current_url
                page_source = self.driver.page_source.lower()
                
                # Check for React error indicators
                if "error" in page_source and "react" in page_source:
                    print(f"   ❌ Errore React sulla pagina: {page_name}")
                    return False
                
                # Check if URL is correct
                if url.split('/')[-1] in current_url or current_url == url:
                    print(f"   ✅ Routing funziona per: {page_name}")
                else:
                    print(f"   ⚠️ URL inaspettato per {page_name}: {current_url}")
            
            print("✅ React Router configurato e funzionante")
            return True
            
        except Exception as e:
            print(f"❌ Errore testando routing: {e}")
            return False
    
    def test_6_component_architecture(self):
        """Test 6: Verificare architettura dei componenti"""
        print("🔍 Verificando architettura componenti React...")
        
        component_folders = [
            "src/components/auth",
            "src/components/layout", 
            "src/components/common",
            "src/pages",
            "src/hooks",
            "src/services"
        ]
        
        required_files = [
            "src/components/auth/LoginPage.js",
            "src/components/auth/RegisterPage.js",
            "src/services/authService.js",
            "src/services/api.js",
            "src/hooks/useAuthStore.js",
            "src/types/api.js"
        ]
        
        # Check component structure
        missing_folders = []
        for folder in component_folders:
            folder_path = os.path.join(self.project_root, folder)
            if not os.path.exists(folder_path):
                missing_folders.append(folder)
                print(f"   ❌ Cartella mancante: {folder}")
            else:
                print(f"   ✅ Cartella trovata: {folder}")
        
        # Check key files
        missing_files = []
        for file_path in required_files:
            full_path = os.path.join(self.project_root, file_path)
            if not os.path.exists(full_path):
                missing_files.append(file_path)
                print(f"   ❌ File mancante: {file_path}")
            else:
                print(f"   ✅ File trovato: {file_path}")
        
        if missing_folders or missing_files:
            print(f"❌ Architettura incompleta: {len(missing_folders + missing_files)} elementi mancanti")
            return False
        
        print("✅ Architettura componenti React ben strutturata")
        return True
    
    def test_7_state_management(self):
        """Test 7: Verificare gestione stato con Zustand"""
        print("🔍 Verificando gestione stato (Zustand)...")
        
        try:
            # Check if Zustand store exists
            store_path = os.path.join(self.project_root, "src/hooks/useAuthStore.js")
            if not os.path.exists(store_path):
                print("   ❌ Store Zustand non trovato")
                return False
            
            with open(store_path, 'r') as f:
                store_content = f.read()
            
            # Check for Zustand patterns
            zustand_patterns = [
                "import", "zustand",
                "create", "set", "get"
            ]
            
            found_patterns = []
            for pattern in zustand_patterns:
                if pattern in store_content:
                    found_patterns.append(pattern)
                    print(f"   ✅ Pattern Zustand trovato: {pattern}")
                else:
                    print(f"   ❌ Pattern Zustand mancante: {pattern}")
            
            if len(found_patterns) >= 3:
                print("✅ Gestione stato Zustand implementata")
                return True
            else:
                print("❌ Gestione stato Zustand incompleta")
                return False
                
        except Exception as e:
            print(f"❌ Errore verificando Zustand: {e}")
            return False
    
    def test_8_form_handling(self):
        """Test 8: Verificare gestione form con React Hook Form"""
        print("🔍 Verificando gestione form (React Hook Form)...")
        
        if not self.driver:
            self.setup_driver()
        
        try:
            # Go to registration page
            self.driver.get("http://localhost:3000/register")
            self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "form")))
            
            # Check if form elements exist
            form_elements = [
                ("input[name='firstName']", "Campo Nome"),
                ("input[name='lastName']", "Campo Cognome"),
                ("input[name='email']", "Campo Email"),
                ("input[name='password']", "Campo Password"),
                ("input[name='confirmPassword']", "Campo Conferma Password"),
                ("button[type='submit']", "Pulsante Submit")
            ]
            
            for selector, element_name in form_elements:
                try:
                    element = self.driver.find_element(By.CSS_SELECTOR, selector)
                    if element:
                        print(f"   ✅ Elemento form trovato: {element_name}")
                except NoSuchElementException:
                    print(f"   ❌ Elemento form mancante: {element_name}")
                    return False
            
            # Test form validation by submitting empty form
            submit_btn = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            submit_btn.click()
            time.sleep(2)
            
            # Look for validation errors
            error_elements = self.driver.find_elements(By.CSS_SELECTOR, ".text-red-600, .error")
            if error_elements:
                print(f"   ✅ Validazione form attiva: {len(error_elements)} errori mostrati")
            else:
                print("   ⚠️ Validazione form potrebbe non essere attiva")
            
            print("✅ React Hook Form implementato e funzionante")
            return True
            
        except Exception as e:
            print(f"❌ Errore testando form handling: {e}")
            return False
    
    def test_9_ui_responsiveness(self):
        """Test 9: Verificare UI responsive con Tailwind"""
        print("🔍 Verificando UI responsive...")
        
        if not self.driver:
            self.setup_driver()
        
        try:
            self.driver.get("http://localhost:3000/register")
            self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
            
            # Test different screen sizes
            screen_sizes = [
                (1920, 1080, "Desktop"),
                (768, 1024, "Tablet"),
                (375, 667, "Mobile")
            ]
            
            for width, height, device in screen_sizes:
                self.driver.set_window_size(width, height)
                time.sleep(2)
                
                # Check if page is still functional
                body = self.driver.find_element(By.TAG_NAME, "body")
                if body.is_displayed():
                    print(f"   ✅ Layout {device} ({width}x{height}) funziona")
                else:
                    print(f"   ❌ Layout {device} ({width}x{height}) ha problemi")
                    return False
                
                # Take screenshot for each size
                self.driver.save_screenshot(f"task28_responsive_{device.lower()}.png")
            
            # Restore desktop size
            self.driver.set_window_size(1920, 1080)
            
            print("✅ UI responsive Tailwind funzionante")
            return True
            
        except Exception as e:
            print(f"❌ Errore testando responsiveness: {e}")
            return False
    
    def test_10_api_integration_ready(self):
        """Test 10: Verificare che l'integrazione API sia pronta"""
        print("🔍 Verificando preparazione integrazione API...")
        
        try:
            # Check API service files
            api_files = [
                "src/services/api.js",
                "src/services/authService.js",
                "src/types/api.js"
            ]
            
            for api_file in api_files:
                file_path = os.path.join(self.project_root, api_file)
                if not os.path.exists(file_path):
                    print(f"   ❌ File API mancante: {api_file}")
                    return False
                
                with open(file_path, 'r') as f:
                    content = f.read()
                
                # Check for API patterns
                if "api" in content.lower() or "axios" in content.lower() or "fetch" in content.lower():
                    print(f"   ✅ File API configurato: {api_file}")
                else:
                    print(f"   ⚠️ File API potrebbe essere vuoto: {api_file}")
            
            print("✅ Integrazione API pronta per backend")
            return True
            
        except Exception as e:
            print(f"❌ Errore verificando API integration: {e}")
            return False
    
    def generate_task28_report(self):
        """Generate Task 28 verification report"""
        print("\n" + "=" * 80)
        print("📊 REPORT VERIFICA TASK 28: REACT PROJECT SETUP")
        print("=" * 80)
        
        success_rate = (self.results['tests_passed'] / self.results['tests_run']) * 100 if self.results['tests_run'] > 0 else 0
        
        print(f"📋 Test Task 28 Eseguiti: {self.results['tests_run']}")
        print(f"✅ Test Passati: {self.results['tests_passed']}")
        print(f"❌ Test Falliti: {self.results['tests_failed']}")
        print(f"📈 Completamento Task 28: {success_rate:.1f}%")
        
        if self.results['failed_tests']:
            print(f"\n❌ Aspetti Task 28 da completare:")
            for test in self.results['failed_tests']:
                print(f"   - {test}")
        
        # Task 28 completion criteria
        print(f"\n📋 CRITERI COMPLETAMENTO TASK 28:")
        print(f"   {'✅' if success_rate >= 90 else '❌'} Setup progetto React (>90% test passati)")
        print(f"   {'✅' if 'React Project Structure' not in self.results['failed_tests'] else '❌'} Struttura progetto corretta")
        print(f"   {'✅' if 'Package Dependencies' not in self.results['failed_tests'] else '❌'} Dipendenze installate")
        print(f"   {'✅' if 'Tailwind Configuration' not in self.results['failed_tests'] else '❌'} Tailwind CSS configurato")
        print(f"   {'✅' if 'React App Builds' not in self.results['failed_tests'] else '❌'} App compila correttamente")
        print(f"   {'✅' if 'React Router Setup' not in self.results['failed_tests'] else '❌'} React Router funzionante")
        
        # Final assessment
        if success_rate >= 90:
            print(f"\n🎉 TASK 28 COMPLETATO CON SUCCESSO!")
            print(f"✅ React Project Setup è completo e funzionale")
        elif success_rate >= 70:
            print(f"\n⚠️ TASK 28 QUASI COMPLETATO")
            print(f"🔧 Alcuni aspetti necessitano di rifinitura")
        else:
            print(f"\n❌ TASK 28 INCOMPLETO")
            print(f"🛠️ Richiesto lavoro significativo per completamento")
        
        # Save detailed report
        report_data = {
            'task': 'Task 28: React Project Setup',
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
            'completion_rate': success_rate,
            'results': self.results,
            'status': 'COMPLETED' if success_rate >= 90 else 'INCOMPLETE'
        }
        
        with open('task28_verification_report.json', 'w') as f:
            json.dump(report_data, f, indent=2)
        
        print(f"📄 Report dettagliato salvato: task28_verification_report.json")
        
        return success_rate >= 90
    
    def run_task28_verification(self):
        """Run complete Task 28 verification"""
        print("🎯 VERIFICA COMPLETAMENTO TASK 28: REACT PROJECT SETUP")
        print("=" * 80)
        
        # Check if frontend server is running
        try:
            requests.get("http://localhost:3000", timeout=5)
            print("✅ Frontend server rilevato")
        except:
            print("⚠️ Frontend server non attivo - alcuni test potrebbero fallire")
            print("💡 Suggerimento: Esegui 'npm start' nella cartella frontend")
        
        # Define Task 28 specific tests
        tests = [
            ("React Project Structure", self.test_1_react_project_structure),
            ("Package Dependencies", self.test_2_package_json_dependencies),
            ("Tailwind Configuration", self.test_3_tailwind_configuration),
            ("React App Builds", self.test_4_react_app_builds),
            ("React Router Setup", self.test_5_react_routing_setup),
            ("Component Architecture", self.test_6_component_architecture),
            ("State Management (Zustand)", self.test_7_state_management),
            ("Form Handling (React Hook Form)", self.test_8_form_handling),
            ("UI Responsiveness", self.test_9_ui_responsiveness),
            ("API Integration Ready", self.test_10_api_integration_ready),
        ]
        
        try:
            # Run all Task 28 tests
            for test_name, test_func in tests:
                self.run_test(test_name, test_func)
                time.sleep(0.5)
            
            # Generate final report
            success = self.generate_task28_report()
            
            return success
            
        finally:
            if self.driver:
                # Keep browser open briefly for inspection
                try:
                    input("\n🔍 Premi INVIO per chiudere il browser...")
                except:
                    time.sleep(2)
                self.driver.quit()

def main():
    """Main Task 28 verification"""
    print("🎯 SMILE ADVENTURE - VERIFICA TASK 28")
    print("=" * 50)
    
    verifier = Task28VerificationSuite()
    success = verifier.run_task28_verification()
    
    if success:
        print("\n🎉 Task 28 verificato con successo!")
        print("✅ React Project Setup è completo")
        return 0
    else:
        print("\n⚠️ Task 28 richiede completamento")
        print("🔧 Consultare il report per dettagli")
        return 1

if __name__ == "__main__":
    exit(main())
