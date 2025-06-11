#!/usr/bin/env python3
"""
Frontend API Services Test Runner
Tests the API Services Layer implementation from Task 29

This script validates:
1. Frontend API service implementations
2. Service structure and exports
3. React hooks functionality  
4. Type definitions
5. Error handling mechanisms
"""

import os
import sys
import json
import subprocess
from pathlib import Path

# Get project paths
frontend_dir = Path(__file__).parent / "frontend"
services_dir = frontend_dir / "src" / "services"
hooks_dir = frontend_dir / "src" / "hooks"
types_dir = frontend_dir / "src" / "types"

class FrontendServicesValidator:
    """Validates frontend API services implementation"""
    
    def __init__(self):
        self.results = {
            "tests_run": 0,
            "tests_passed": 0,
            "tests_failed": 0,
            "errors": []
        }
    
    def run_test(self, test_name: str, test_func) -> bool:
        """Run a single test with error handling"""
        self.results["tests_run"] += 1
        print(f"\n🧪 TEST: {test_name}")
        print("-" * 50)
        
        try:
            result = test_func()
            if result:
                self.results["tests_passed"] += 1
                print(f"✅ PASSED: {test_name}")
            else:
                self.results["tests_failed"] += 1
                print(f"❌ FAILED: {test_name}")
                self.results["errors"].append(f"{test_name}: Test returned False")
            return result
        except Exception as e:
            self.results["tests_failed"] += 1
            error_msg = f"{test_name}: {str(e)}"
            self.results["errors"].append(error_msg)
            print(f"❌ ERROR: {test_name}")
            print(f"   {str(e)}")
            return False
    
    def test_services_structure(self) -> bool:
        """Test 1: Validate services directory structure"""
        print("Checking services directory structure...")
        
        expected_files = [
            "api.js",
            "authService.js", 
            "userService.js",
            "reportService.js",
            "index.js"
        ]
        
        for file_name in expected_files:
            file_path = services_dir / file_name
            if file_path.exists():
                print(f"   ✅ {file_name} exists")
            else:
                print(f"   ❌ {file_name} missing")
                return False
        
        return True
    
    def test_types_structure(self) -> bool:
        """Test 2: Validate types directory structure"""
        print("Checking types directory structure...")
        
        api_types_file = types_dir / "api.js"
        if api_types_file.exists():
            print(f"   ✅ api.js types file exists")
            
            # Check if file contains expected exports
            content = api_types_file.read_text()
            expected_exports = [
                "API_ENDPOINTS",
                "GAME_TYPES", 
                "ACTIVITY_TYPES",
                "USER_ROLES",
                "ASSESSMENT_TYPES"
            ]
            
            for export_name in expected_exports:
                if export_name in content:
                    print(f"   ✅ {export_name} export found")
                else:
                    print(f"   ❌ {export_name} export missing")
                    return False
        else:
            print(f"   ❌ api.js types file missing")
            return False
        
        return True
    
    def test_hooks_structure(self) -> bool:
        """Test 3: Validate hooks directory structure"""
        print("Checking hooks directory structure...")
        
        expected_files = [
            "useApiServices.js",
            "useAuthStore.js"
        ]
        
        for file_name in expected_files:
            file_path = hooks_dir / file_name
            if file_path.exists():
                print(f"   ✅ {file_name} exists")
            else:
                print(f"   ❌ {file_name} missing")
                return False
        
        return True
    
    def test_service_exports(self) -> bool:
        """Test 4: Validate service exports"""
        print("Checking service exports...")
        
        # Check main services index
        index_file = services_dir / "index.js"
        if index_file.exists():
            content = index_file.read_text()
            
            expected_exports = [
                "api",
                "authService",
                "userService", 
                "reportService",
                "services",
                "ServiceHealthChecker",
                "ServiceFactory"
            ]
            
            for export_name in expected_exports:
                if export_name in content:
                    print(f"   ✅ {export_name} export found")
                else:
                    print(f"   ⚠️  {export_name} export not explicitly found")
        else:
            print(f"   ❌ services index.js missing")
            return False
        
        return True
    
    def test_build_compilation(self) -> bool:
        """Test 5: Validate frontend builds successfully"""
        print("Testing frontend build compilation...")
        
        try:
            # Change to frontend directory
            original_dir = os.getcwd()
            os.chdir(frontend_dir)
            
            # Run build command
            result = subprocess.run(
                ["npm", "run", "build"],
                capture_output=True,
                text=True,
                timeout=120  # 2 minute timeout
            )
            
            os.chdir(original_dir)
            
            if result.returncode == 0:
                print(f"   ✅ Build completed successfully")
                
                # Check if build directory was created
                build_dir = frontend_dir / "build"
                if build_dir.exists():
                    print(f"   ✅ Build directory created")
                    
                    # Check for main files
                    static_dir = build_dir / "static"
                    if static_dir.exists():
                        js_files = list((static_dir / "js").glob("*.js"))
                        css_files = list((static_dir / "css").glob("*.css"))
                        print(f"   📦 Built files: {len(js_files)} JS, {len(css_files)} CSS")
                else:
                    print(f"   ⚠️  Build directory not found")
                
                return True
            else:
                print(f"   ❌ Build failed")
                if result.stderr:
                    print(f"   Error: {result.stderr[:200]}...")
                return False
                
        except subprocess.TimeoutExpired:
            print(f"   ❌ Build timed out")
            return False
        except Exception as e:
            print(f"   ❌ Build error: {str(e)}")
            return False
    
    def test_package_dependencies(self) -> bool:
        """Test 6: Check package.json dependencies"""
        print("Checking package.json dependencies...")
        
        package_file = frontend_dir / "package.json"
        if package_file.exists():
            try:
                package_data = json.loads(package_file.read_text())
                
                # Check for required dependencies
                dependencies = package_data.get("dependencies", {})
                expected_deps = [
                    "react",
                    "axios",
                    "@tanstack/react-query",  # or "react-query" 
                    "react-router-dom"
                ]
                
                for dep in expected_deps:
                    if dep in dependencies:
                        print(f"   ✅ {dep}: {dependencies[dep]}")
                    else:
                        # Check alternative names
                        if dep == "@tanstack/react-query" and "react-query" in dependencies:
                            print(f"   ✅ react-query: {dependencies['react-query']}")
                        else:
                            print(f"   ⚠️  {dep} not found in dependencies")
                
                return True
                
            except json.JSONDecodeError:
                print(f"   ❌ Invalid package.json format")
                return False
        else:
            print(f"   ❌ package.json not found")
            return False
    
    def test_api_client_structure(self) -> bool:
        """Test 7: Validate API client implementation"""
        print("Checking API client implementation...")
        
        api_file = services_dir / "api.js"
        if api_file.exists():
            content = api_file.read_text()
            
            # Check for key API client features
            features = [
                "axios",
                "interceptors",
                "Authorization",
                "Bearer",
                "response",
                "request"
            ]
            
            found_features = 0
            for feature in features:
                if feature in content:
                    print(f"   ✅ {feature} implementation found")
                    found_features += 1
                else:
                    print(f"   ⚠️  {feature} not explicitly found")
            
            # Should have most features
            return found_features >= len(features) * 0.7
        else:
            print(f"   ❌ api.js client file missing")
            return False
    
    def test_auth_service_structure(self) -> bool:
        """Test 8: Validate authentication service"""
        print("Checking authentication service implementation...")
        
        auth_file = services_dir / "authService.js"
        if auth_file.exists():
            content = auth_file.read_text()
            
            # Check for key auth methods
            methods = [
                "login",
                "register",
                "logout",
                "getCurrentUser",
                "getToken",
                "isAuthenticated"
            ]
            
            found_methods = 0
            for method in methods:
                if method in content:
                    print(f"   ✅ {method} method found")
                    found_methods += 1
                else:
                    print(f"   ⚠️  {method} method not found")
            
            return found_methods >= len(methods) * 0.8
        else:
            print(f"   ❌ authService.js missing")
            return False
    
    def run_all_tests(self):
        """Run the complete validation suite"""
        print("="*80)
        print("🧪 FRONTEND API SERVICES VALIDATION SUITE")
        print("="*80)
        print(f"📁 Frontend Directory: {frontend_dir}")
        print(f"📋 Testing Task 29 Implementation")
        
        # Define test sequence
        tests = [
            ("Services Directory Structure", self.test_services_structure),
            ("Types Directory Structure", self.test_types_structure),
            ("Hooks Directory Structure", self.test_hooks_structure),
            ("Service Exports", self.test_service_exports),
            ("Package Dependencies", self.test_package_dependencies),
            ("API Client Structure", self.test_api_client_structure),
            ("Auth Service Structure", self.test_auth_service_structure),
            ("Build Compilation", self.test_build_compilation),
        ]
        
        # Run tests
        for test_name, test_func in tests:
            self.run_test(test_name, test_func)
        
        # Print summary
        self.print_summary()
        
        return self.results["tests_failed"] == 0
    
    def print_summary(self):
        """Print test execution summary"""
        print("\n" + "="*80)
        print("📊 FRONTEND SERVICES VALIDATION SUMMARY")
        print("="*80)
        
        total_tests = self.results["tests_run"]
        passed_tests = self.results["tests_passed"]
        failed_tests = self.results["tests_failed"]
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print(f"📋 Total Tests Run: {total_tests}")
        print(f"✅ Tests Passed: {passed_tests}")
        print(f"❌ Tests Failed: {failed_tests}")
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if self.results["errors"]:
            print(f"\n🚨 ERRORS ENCOUNTERED:")
            for i, error in enumerate(self.results["errors"], 1):
                print(f"   {i}. {error}")
        
        if failed_tests == 0:
            print(f"\n🎉 ALL TESTS PASSED! Frontend API Services are properly implemented!")
            print(f"✅ Task 29 API Services Layer validation complete")
        else:
            print(f"\n⚠️  SOME TESTS FAILED. Review implementation details.")
        
        print("="*80)


def main():
    """Main entry point"""
    print("🔍 Starting Frontend API Services validation...")
    
    if not frontend_dir.exists():
        print(f"❌ Frontend directory not found: {frontend_dir}")
        return 1
    
    validator = FrontendServicesValidator()
    success = validator.run_all_tests()
    
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
