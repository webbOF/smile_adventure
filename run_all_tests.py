#!/usr/bin/env python3
"""
Comprehensive test runner for Smile Adventure
Executes all test suites with platform-specific considerations
"""

import os
import sys
import subprocess
import time
import argparse
import platform
from pathlib import Path

# Import portable test helpers if available
try:
    from portable_test_helpers import (
        detect_platform, find_npm_executable, find_python_executable, 
        find_webdriver
    )
    PORTABLE_HELPERS = True
except ImportError:
    PORTABLE_HELPERS = False
    print("⚠️ Portable test helpers not found, using default configuration")

# Project paths
PROJECT_ROOT = Path(__file__).resolve().parent
FRONTEND_DIR = PROJECT_ROOT / "frontend"
BACKEND_DIR = PROJECT_ROOT / "backend"
TESTS_DIR = PROJECT_ROOT

# Define test categories
TEST_CATEGORIES = {
    "frontend": [
        "test_frontend_services.py", 
        "task28_verification_suite.py"
    ],
    "backend": [
        "test_auth_models.py",
        "test_auth_services.py",
        "test_auth_dependencies.py",
        "test_auth_middleware.py"
    ],
    "integration": [
        "frontend_backend_integration_test.py",
        "selenium_complete_test_suite.py"
    ],
    "validation": [
        "test_password_validation.py",
        "test_auto_verification.py",
        "test_login_debug.py"
    ]
}

# Collect all test files
ALL_TESTS = []
for category, tests in TEST_CATEGORIES.items():
    ALL_TESTS.extend(tests)

def print_banner(text):
    """Print a formatted banner text"""
    width = 80
    print("\n" + "=" * width)
    print(f"{text}".center(width))
    print("=" * width + "\n")

def detect_system_info():
    """Detect and print system information"""
    system_info = {
        "os": platform.system(),
        "os_version": platform.version(),
        "python": platform.python_version(),
        "machine": platform.machine(),
    }
    
    print_banner("SYSTEM INFORMATION")
    print(f"OS:          {system_info['os']}")
    print(f"Version:     {system_info['os_version']}")
    print(f"Python:      {system_info['python']}")
    print(f"Machine:     {system_info['machine']}")
    
    # Check for important tools
    if PORTABLE_HELPERS:
        npm_path, npm_version, npm_found = find_npm_executable()
        python_path, python_version, python_found = find_python_executable()
        
        print("\nTool Detection:")
        print(f"npm:         {'✅ ' + npm_version if npm_found else '❌ Not found'}")
        print(f"python:      {'✅ ' + python_version if python_found else '❌ Not found'}")
        
        # Check for webdrivers
        chrome_path, chrome_version, chrome_found = find_webdriver('chrome')
        print(f"chromedriver: {'✅ ' + chrome_version if chrome_found else '❌ Not found'}")
    
    print("\n")

def check_services():
    """Check if required services are running"""
    print_banner("SERVICE CHECK")
    
    services = []
    
    # Check frontend server (React)
    try:
        import requests
        frontend_url = "http://localhost:3000"
        response = requests.get(frontend_url, timeout=2)
        if response.status_code == 200:
            services.append(("Frontend (React)", True, "Running"))
        else:
            services.append(("Frontend (React)", False, f"Status code: {response.status_code}"))
    except Exception as e:
        services.append(("Frontend (React)", False, "Not running"))
    
    # Check backend server (FastAPI)
    try:
        backend_url = "http://localhost:8000/health"
        response = requests.get(backend_url, timeout=2)
        if response.status_code == 200:
            services.append(("Backend (FastAPI)", True, "Running"))
        else:
            services.append(("Backend (FastAPI)", False, f"Status code: {response.status_code}"))
    except Exception as e:
        services.append(("Backend (FastAPI)", False, "Not running"))
    
    # Check database connection through backend
    try:
        db_check_url = "http://localhost:8000/health/db"
        response = requests.get(db_check_url, timeout=2)
        if response.status_code == 200 and response.json().get("status") == "ok":
            services.append(("Database", True, "Connected"))
        else:
            services.append(("Database", False, "Connection issue"))
    except Exception as e:
        services.append(("Database", False, "Not connected"))
    
    # Print service status
    for service, status, message in services:
        status_icon = "✅" if status else "❌"
        print(f"{status_icon} {service}: {message}")
    
    # Check if we have enough services to run tests
    essential_services_running = any(status for service, status, _ in services)
    return essential_services_running

def setup_environment():
    """Set up testing environment if needed"""
    print_banner("ENVIRONMENT SETUP")
    
    # Check for mock backend if real backend is not available
    try:
        import requests
        response = requests.get("http://localhost:8000/health", timeout=2)
        if response.status_code != 200:
            print("🔄 Backend server not detected, starting mock backend...")
            
            mock_backend_path = PROJECT_ROOT / "mock_backend_fixed.py"
            if mock_backend_path.exists():
                # Start mock backend in background
                if sys.platform == "win32":
                    subprocess.Popen(["start", "python", str(mock_backend_path)], 
                                     shell=True, stdout=subprocess.DEVNULL)
                else:
                    subprocess.Popen(["python3", str(mock_backend_path)], 
                                    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                
                print("✅ Started mock backend server")
                time.sleep(1)  # Give it time to start
            else:
                print("❌ Could not find mock_backend_fixed.py")
        else:
            print("✅ Backend server already running")
    except:
        print("❌ Could not check backend server status")
    
    # Create any necessary test directories
    test_output_dir = PROJECT_ROOT / "test_results"
    test_output_dir.mkdir(exist_ok=True)
    print(f"✅ Created test output directory: {test_output_dir}")
    
    return True

def run_test(test_file, verbose=False):
    """Run a single test file and return success status"""
    test_path = PROJECT_ROOT / test_file
    
    if not test_path.exists():
        print(f"❌ Test file not found: {test_file}")
        return False
    
    print(f"\n🧪 Running test: {test_file}")
    print("-" * 70)
    
    try:
        # Determine which Python executable to use
        if PORTABLE_HELPERS:
            python_path, _, python_found = find_python_executable()
            if not python_found:
                python_path = "python" if sys.platform == "win32" else "python3"
        else:
            python_path = "python" if sys.platform == "win32" else "python3"
        
        # Run the test with the appropriate Python executable
        cmd = [python_path, str(test_path)]
        
        if verbose:
            # Show output directly for verbose mode
            result = subprocess.run(cmd)
            success = result.returncode == 0
        else:
            # Capture output for non-verbose mode
            result = subprocess.run(cmd, capture_output=True, text=True)
            success = result.returncode == 0
            
            # Print a summary
            if success:
                print(f"✅ Test passed: {test_file}")
            else:
                print(f"❌ Test failed: {test_file}")
                print("\nError output:")
                print(result.stderr[-500:] if len(result.stderr) > 500 else result.stderr)
        
        return success
        
    except Exception as e:
        print(f"❌ Error running test: {e}")
        return False

def run_test_category(category, verbose=False):
    """Run all tests in a category"""
    if category not in TEST_CATEGORIES:
        print(f"❌ Unknown test category: {category}")
        return False
    
    tests = TEST_CATEGORIES[category]
    print_banner(f"RUNNING {category.upper()} TESTS")
    
    results = []
    for test_file in tests:
        success = run_test(test_file, verbose)
        results.append((test_file, success))
    
    # Print category summary
    passed = sum(1 for _, success in results if success)
    total = len(results)
    print(f"\n📊 {category.upper()} TEST SUMMARY: {passed}/{total} passed")
    
    return passed == total

def run_all_tests(verbose=False):
    """Run all test categories"""
    print_banner("RUNNING ALL TESTS")
    
    category_results = []
    for category in TEST_CATEGORIES:
        success = run_test_category(category, verbose)
        category_results.append((category, success))
    
    # Print overall summary
    passed = sum(1 for _, success in category_results if success)
    total = len(category_results)
    
    print_banner("TEST RESULTS SUMMARY")
    for category, success in category_results:
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"{category.ljust(15)}: {status}")
    
    print(f"\n📊 Overall: {passed}/{total} test categories passed")
    
    return passed == total

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="Smile Adventure Test Runner")
    parser.add_argument("--category", "-c", choices=list(TEST_CATEGORIES.keys()) + ["all"],
                        default="all", help="Test category to run")
    parser.add_argument("--test", "-t", help="Run a specific test file")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    parser.add_argument("--skip-checks", "-s", action="store_true", 
                        help="Skip service and environment checks")
    
    args = parser.parse_args()
    
    # Show system information
    detect_system_info()
    
    # Check for required services
    if not args.skip_checks:
        services_ok = check_services()
        if not services_ok:
            print("\n⚠️ Warning: Some essential services are not running")
            confirm = input("Continue with testing anyway? (y/N): ")
            if confirm.lower() != 'y':
                print("Exiting test runner.")
                return 1
        
        # Set up environment
        setup_ok = setup_environment()
        if not setup_ok:
            print("❌ Failed to set up testing environment")
            return 1
    
    # Execute tests based on arguments
    if args.test:
        # Run a single specific test
        success = run_test(args.test, args.verbose)
    elif args.category != "all":
        # Run a specific category
        success = run_test_category(args.category, args.verbose)
    else:
        # Run all test categories
        success = run_all_tests(args.verbose)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
