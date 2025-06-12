#!/usr/bin/env python3
"""
Comprehensive verification of Tasks 28-31 implementation
"""
import os
import json
import time
import requests
from pathlib import Path

class TaskVerificationSuite:
    def __init__(self):
        self.base_path = Path("c:/Users/arman/Desktop/WebSimpl/smile_adventure")
        self.frontend_path = self.base_path / "frontend"
        self.results = {
            'task28': {'completed': False, 'tests': []},
            'task29': {'completed': False, 'tests': []},
            'task30': {'completed': False, 'tests': []},
            'task31': {'completed': False, 'tests': []}
        }
        
    def verify_task_28_react_setup(self):
        """Task 28: React Project Setup & Core Components"""
        print("\n🎯 TASK 28: REACT PROJECT SETUP")
        print("=" * 60)
        
        tests = []
        
        # 1. Project structure verification
        structure_test = self.check_project_structure()
        tests.append(structure_test)
        
        # 2. Package.json dependencies
        deps_test = self.check_dependencies()
        tests.append(deps_test)
        
        # 3. Component folders structure
        components_test = self.check_component_folders()
        tests.append(components_test)
        
        # 4. Tailwind configuration
        tailwind_test = self.check_tailwind_config()
        tests.append(tailwind_test)
        
        # 5. Core files existence
        core_files_test = self.check_core_files()
        tests.append(core_files_test)
        
        passed = sum(1 for test in tests if test['passed'])
        total = len(tests)
        completion = (passed / total) * 100
        
        self.results['task28'] = {
            'completed': completion >= 90,
            'tests': tests,
            'completion_percentage': completion
        }
        
        print(f"\n📊 TASK 28 RESULTS: {passed}/{total} tests passed ({completion:.1f}%)")
        return completion >= 90
        
    def verify_task_29_api_services(self):
        """Task 29: API Services Layer"""
        print("\n🎯 TASK 29: API SERVICES LAYER")
        print("=" * 60)
        
        tests = []
        
        # 1. Base API client
        api_test = self.check_api_service()
        tests.append(api_test)
        
        # 2. Auth Service
        auth_service_test = self.check_auth_service()
        tests.append(auth_service_test)
        
        # 3. User Service
        user_service_test = self.check_user_service()
        tests.append(user_service_test)
        
        # 4. Report Service
        report_service_test = self.check_report_service()
        tests.append(report_service_test)
        
        # 5. API Types
        types_test = self.check_api_types()
        tests.append(types_test)
        
        # 6. Services index
        index_test = self.check_services_index()
        tests.append(index_test)
        
        passed = sum(1 for test in tests if test['passed'])
        total = len(tests)
        completion = (passed / total) * 100
        
        self.results['task29'] = {
            'completed': completion >= 90,
            'tests': tests,
            'completion_percentage': completion
        }
        
        print(f"\n📊 TASK 29 RESULTS: {passed}/{total} tests passed ({completion:.1f}%)")
        return completion >= 90
        
    def verify_task_30_authentication(self):
        """Task 30: Authentication System"""
        print("\n🎯 TASK 30: AUTHENTICATION SYSTEM")
        print("=" * 60)
        
        tests = []
        
        # 1. Login components
        login_test = self.check_login_components()
        tests.append(login_test)
        
        # 2. Register components
        register_test = self.check_register_components()
        tests.append(register_test)
        
        # 3. Auth hooks
        hooks_test = self.check_auth_hooks()
        tests.append(hooks_test)
        
        # 4. Token manager
        token_test = self.check_token_manager()
        tests.append(token_test)
        
        # 5. Protected routes
        protected_test = self.check_protected_routes()
        tests.append(protected_test)
        
        passed = sum(1 for test in tests if test['passed'])
        total = len(tests)
        completion = (passed / total) * 100
        
        self.results['task30'] = {
            'completed': completion >= 90,
            'tests': tests,
            'completion_percentage': completion
        }
        
        print(f"\n📊 TASK 30 RESULTS: {passed}/{total} tests passed ({completion:.1f}%)")
        return completion >= 90
        
    def verify_task_31_app_routing(self):
        """Task 31: App Routing Setup"""
        print("\n🎯 TASK 31: APP ROUTING SETUP")
        print("=" * 60)
        
        tests = []
        
        # 1. App.jsx structure
        app_test = self.check_app_jsx()
        tests.append(app_test)
        
        # 2. Role-based routing
        routing_test = self.check_role_routing()
        tests.append(routing_test)
        
        # 3. Protected routes implementation
        protected_impl_test = self.check_protected_implementation()
        tests.append(protected_impl_test)
        
        # 4. Error boundaries
        error_test = self.check_error_boundaries()
        tests.append(error_test)
        
        # 5. Loading states
        loading_test = self.check_loading_states()
        tests.append(loading_test)
        
        # 6. Navigation hooks
        nav_hooks_test = self.check_navigation_hooks()
        tests.append(nav_hooks_test)
        
        passed = sum(1 for test in tests if test['passed'])
        total = len(tests)
        completion = (passed / total) * 100
        
        self.results['task31'] = {
            'completed': completion >= 90,
            'tests': tests,
            'completion_percentage': completion
        }
        
        print(f"\n📊 TASK 31 RESULTS: {passed}/{total} tests passed ({completion:.1f}%)")
        return completion >= 90
    
    # Helper methods for individual checks
    def check_project_structure(self):
        """Check basic React project structure"""
        required_files = [
            "package.json",
            "src/index.js",
            "src/App.jsx",
            "src/index.css",
            "tailwind.config.js",
            "public/index.html"
        ]
        
        missing = []
        for file_path in required_files:
            if not (self.frontend_path / file_path).exists():
                missing.append(file_path)
        
        passed = len(missing) == 0
        return {
            'name': 'Project Structure',
            'passed': passed,
            'details': f"Missing files: {missing}" if missing else "All required files present"
        }
        
    def check_dependencies(self):
        """Check package.json dependencies"""
        package_file = self.frontend_path / "package.json"
        if not package_file.exists():
            return {
                'name': 'Dependencies Check',
                'passed': False,
                'details': 'package.json not found'
            }
            
        with open(package_file, 'r') as f:
            package_data = json.load(f)
            
        required_deps = [
            'react', 'react-dom', 'react-router-dom', 'axios',
            'react-hook-form', 'react-hot-toast', 'zustand'
        ]
        
        deps = package_data.get('dependencies', {})
        missing = [dep for dep in required_deps if dep not in deps]
        
        passed = len(missing) == 0
        return {
            'name': 'Dependencies Check',
            'passed': passed,
            'details': f"Missing dependencies: {missing}" if missing else "All dependencies present"
        }
        
    def check_component_folders(self):
        """Check component folder structure"""
        required_folders = [
            "src/components/auth",
            "src/components/parent", 
            "src/components/professional",
            "src/components/common",
            "src/services",
            "src/hooks",
            "src/types"
        ]
        
        missing = []
        for folder in required_folders:
            if not (self.frontend_path / folder).exists():
                missing.append(folder)
        
        passed = len(missing) == 0
        return {
            'name': 'Component Folders',
            'passed': passed,
            'details': f"Missing folders: {missing}" if missing else "All component folders present"
        }
        
    def check_tailwind_config(self):
        """Check Tailwind CSS configuration"""
        config_file = self.frontend_path / "tailwind.config.js"
        css_file = self.frontend_path / "src/index.css"
        
        config_exists = config_file.exists()
        css_exists = css_file.exists()
        
        tailwind_directives = False
        if css_exists:
            with open(css_file, 'r') as f:
                content = f.read()
                tailwind_directives = all(directive in content for directive in 
                                        ['@tailwind base', '@tailwind components', '@tailwind utilities'])
        
        passed = config_exists and css_exists and tailwind_directives
        return {
            'name': 'Tailwind Configuration',
            'passed': passed,
            'details': f"Config: {config_exists}, CSS: {css_exists}, Directives: {tailwind_directives}"
        }
        
    def check_core_files(self):
        """Check core React files"""
        core_files = [
            "src/App.jsx",
            "src/index.js",
            "src/components/common/Layout.jsx",
            "src/components/common/Header.jsx",
            "src/components/common/Footer.jsx"
        ]
        
        existing = []
        for file_path in core_files:
            if (self.frontend_path / file_path).exists():
                existing.append(file_path)
        
        passed = len(existing) >= 4  # At least 4 out of 5 core files
        return {
            'name': 'Core Files',
            'passed': passed,
            'details': f"Found {len(existing)}/{len(core_files)} core files"
        }
        
    def check_api_service(self):
        """Check base API service implementation"""
        api_file = self.frontend_path / "src/services/api.js"
        
        if not api_file.exists():
            return {
                'name': 'Base API Service',
                'passed': False,
                'details': 'api.js not found'
            }
            
        with open(api_file, 'r') as f:
            content = f.read()
            
        required_patterns = ['axios', 'interceptors', 'baseURL', 'Authorization']
        found_patterns = [pattern for pattern in required_patterns if pattern in content]
        
        passed = len(found_patterns) >= 3
        return {
            'name': 'Base API Service', 
            'passed': passed,
            'details': f"Found patterns: {found_patterns}"
        }
        
    def check_auth_service(self):
        """Check authentication service"""
        auth_file = self.frontend_path / "src/services/authService.js"
        
        if not auth_file.exists():
            return {
                'name': 'Auth Service',
                'passed': False,
                'details': 'authService.js not found'
            }
            
        with open(auth_file, 'r') as f:
            content = f.read()
            
        required_methods = ['login', 'register', 'logout', 'getCurrentUser']
        found_methods = [method for method in required_methods if method in content]
        
        passed = len(found_methods) >= 3
        return {
            'name': 'Auth Service',
            'passed': passed, 
            'details': f"Found methods: {found_methods}"
        }
        
    def check_user_service(self):
        """Check user service implementation"""
        user_file = self.frontend_path / "src/services/userService.js"
        
        if not user_file.exists():
            return {
                'name': 'User Service',
                'passed': False,
                'details': 'userService.js not found'
            }
            
        with open(user_file, 'r') as f:
            content = f.read()
            
        required_methods = ['getProfile', 'updateProfile', 'getChildren', 'createChild']
        found_methods = [method for method in required_methods if method in content]
        
        passed = len(found_methods) >= 3
        return {
            'name': 'User Service',
            'passed': passed,
            'details': f"Found methods: {found_methods}"
        }
        
    def check_report_service(self):
        """Check report service implementation"""
        report_file = self.frontend_path / "src/services/reportService.js"
        
        if not report_file.exists():
            return {
                'name': 'Report Service',
                'passed': False,
                'details': 'reportService.js not found'
            }
            
        with open(report_file, 'r') as f:
            content = f.read()
            
        required_patterns = ['getChildProgress', 'analytics', 'session']
        found_patterns = [pattern for pattern in required_patterns if pattern in content]
        
        passed = len(found_patterns) >= 2
        return {
            'name': 'Report Service',
            'passed': passed,
            'details': f"Found patterns: {found_patterns}"
        }
        
    def check_api_types(self):
        """Check API types definition"""
        types_file = self.frontend_path / "src/types/api.js"
        
        if not types_file.exists():
            return {
                'name': 'API Types',
                'passed': False,
                'details': 'api.js types not found'
            }
            
        with open(types_file, 'r') as f:
            content = f.read()
            
        required_types = ['API_ENDPOINTS', 'UserProfile', 'Child', 'AuthResponse']
        found_types = [type_name for type_name in required_types if type_name in content]
        
        passed = len(found_types) >= 3
        return {
            'name': 'API Types',
            'passed': passed,
            'details': f"Found types: {found_types}"
        }
        
    def check_services_index(self):
        """Check services index file"""
        index_file = self.frontend_path / "src/services/index.js"
        
        if not index_file.exists():
            return {
                'name': 'Services Index',
                'passed': False,
                'details': 'services/index.js not found'
            }
            
        with open(index_file, 'r') as f:
            content = f.read()
            
        required_exports = ['authService', 'userService', 'api']
        found_exports = [export for export in required_exports if export in content]
        
        passed = len(found_exports) >= 2
        return {
            'name': 'Services Index',
            'passed': passed,
            'details': f"Found exports: {found_exports}"
        }
        
    def check_login_components(self):
        """Check login components"""
        login_files = [
            "src/components/auth/LoginPage.jsx",
            "src/components/auth/LoginForm.jsx"
        ]
        
        existing = []
        for file_path in login_files:
            if (self.frontend_path / file_path).exists():
                existing.append(file_path)
        
        passed = len(existing) >= 1
        return {
            'name': 'Login Components',
            'passed': passed,
            'details': f"Found {len(existing)} login components"
        }
        
    def check_register_components(self):
        """Check register components"""
        register_files = [
            "src/components/auth/RegisterPage.jsx",
            "src/components/auth/RegisterForm.jsx"
        ]
        
        existing = []
        for file_path in register_files:
            if (self.frontend_path / file_path).exists():
                existing.append(file_path)
        
        passed = len(existing) >= 1
        return {
            'name': 'Register Components',
            'passed': passed,
            'details': f"Found {len(existing)} register components"
        }
        
    def check_auth_hooks(self):
        """Check authentication hooks"""
        hook_files = [
            "src/hooks/useAuth.js",
            "src/hooks/useAuthStore.js"
        ]
        
        existing = []
        for file_path in hook_files:
            if (self.frontend_path / file_path).exists():
                existing.append(file_path)
        
        passed = len(existing) >= 1
        return {
            'name': 'Auth Hooks',
            'passed': passed,
            'details': f"Found {len(existing)} auth hooks"
        }
        
    def check_token_manager(self):
        """Check token manager utility"""
        token_file = self.frontend_path / "src/utils/tokenManager.js"
        
        if not token_file.exists():
            return {
                'name': 'Token Manager',
                'passed': False,
                'details': 'tokenManager.js not found'
            }
            
        with open(token_file, 'r') as f:
            content = f.read()
            
        required_functions = ['setToken', 'getToken', 'removeToken']
        found_functions = [func for func in required_functions if func in content]
        
        passed = len(found_functions) >= 2
        return {
            'name': 'Token Manager',
            'passed': passed,
            'details': f"Found functions: {found_functions}"
        }
        
    def check_protected_routes(self):
        """Check protected route implementation"""
        protected_file = self.frontend_path / "src/components/auth/ProtectedRoute.jsx"
        
        if not protected_file.exists():
            return {
                'name': 'Protected Routes',
                'passed': False,
                'details': 'ProtectedRoute.jsx not found'
            }
            
        with open(protected_file, 'r') as f:
            content = f.read()
            
        required_patterns = ['useAuth', 'Navigate', 'isAuthenticated']
        found_patterns = [pattern for pattern in required_patterns if pattern in content]
        
        passed = len(found_patterns) >= 2
        return {
            'name': 'Protected Routes',
            'passed': passed,
            'details': f"Found patterns: {found_patterns}"
        }
        
    def check_app_jsx(self):
        """Check App.jsx implementation"""
        app_file = self.frontend_path / "src/App.jsx"
        
        if not app_file.exists():
            return {
                'name': 'App.jsx Structure',
                'passed': False,
                'details': 'App.jsx not found'
            }
            
        with open(app_file, 'r') as f:
            content = f.read()
            
        required_patterns = ['BrowserRouter', 'Routes', 'Route', 'lazy', 'Suspense']
        found_patterns = [pattern for pattern in required_patterns if pattern in content]
        
        passed = len(found_patterns) >= 4
        return {
            'name': 'App.jsx Structure',
            'passed': passed,
            'details': f"Found patterns: {found_patterns}"
        }
        
    def check_role_routing(self):
        """Check role-based routing implementation"""
        app_file = self.frontend_path / "src/App.jsx"
        
        if not app_file.exists():
            return {
                'name': 'Role-based Routing',
                'passed': False,
                'details': 'App.jsx not found'
            }
            
        with open(app_file, 'r') as f:
            content = f.read()
            
        role_patterns = ['/parent', '/professional', '/admin', 'ProtectedRoute']
        found_patterns = [pattern for pattern in role_patterns if pattern in content]
        
        passed = len(found_patterns) >= 3
        return {
            'name': 'Role-based Routing',
            'passed': passed,
            'details': f"Found role patterns: {found_patterns}"
        }
        
    def check_protected_implementation(self):
        """Check protected routes implementation in App"""
        app_file = self.frontend_path / "src/App.jsx"
        
        if not app_file.exists():
            return {
                'name': 'Protected Implementation',
                'passed': False,
                'details': 'App.jsx not found'
            }
            
        with open(app_file, 'r') as f:
            content = f.read()
            
        protection_patterns = ['ProtectedRoute', 'roles=', 'allowedRoles']
        found_patterns = [pattern for pattern in protection_patterns if pattern in content]
        
        passed = len(found_patterns) >= 2
        return {
            'name': 'Protected Implementation',
            'passed': passed,
            'details': f"Found protection patterns: {found_patterns}"
        }
        
    def check_error_boundaries(self):
        """Check error boundaries implementation"""
        error_file = self.frontend_path / "src/components/common/ErrorBoundary.jsx"
        
        if not error_file.exists():
            return {
                'name': 'Error Boundaries',
                'passed': False,
                'details': 'ErrorBoundary.jsx not found'
            }
            
        with open(error_file, 'r') as f:
            content = f.read()
            
        error_patterns = ['componentDidCatch', 'getDerivedStateFromError', 'hasError']
        found_patterns = [pattern for pattern in error_patterns if pattern in content]
        
        passed = len(found_patterns) >= 2
        return {
            'name': 'Error Boundaries',
            'passed': passed,
            'details': f"Found error patterns: {found_patterns}"
        }
        
    def check_loading_states(self):
        """Check loading states implementation"""
        loading_file = self.frontend_path / "src/components/common/Loading.jsx"
        
        if not loading_file.exists():
            return {
                'name': 'Loading States',
                'passed': False,
                'details': 'Loading.jsx not found'
            }
            
        with open(loading_file, 'r') as f:
            content = f.read()
            
        loading_patterns = ['LoadingSpinner', 'PageLoading', 'spinner']
        found_patterns = [pattern for pattern in loading_patterns if pattern in content]
        
        passed = len(found_patterns) >= 2
        return {
            'name': 'Loading States',
            'passed': passed,
            'details': f"Found loading patterns: {found_patterns}"
        }
        
    def check_navigation_hooks(self):
        """Check navigation hooks implementation"""
        nav_file = self.frontend_path / "src/hooks/useAppRouter.js"
        
        if not nav_file.exists():
            return {
                'name': 'Navigation Hooks',
                'passed': False,
                'details': 'useAppRouter.js not found'
            }
            
        with open(nav_file, 'r') as f:
            content = f.read()
            
        nav_patterns = ['useNavigate', 'goToDashboard', 'navigateWithAuth']
        found_patterns = [pattern for pattern in nav_patterns if pattern in content]
        
        passed = len(found_patterns) >= 2
        return {
            'name': 'Navigation Hooks',
            'passed': passed,
            'details': f"Found navigation patterns: {found_patterns}"
        }
    
    def run_comprehensive_verification(self):
        """Run all task verifications"""
        print("🔍 COMPREHENSIVE TASK VERIFICATION")
        print("=" * 80)
        
        # Check if frontend server is running
        try:
            response = requests.get('http://localhost:3000', timeout=5)
            print("✅ Frontend server is running")
        except:
            print("⚠️  Frontend server not detected - some tests may be limited")
        
        # Verify all tasks
        task28_result = self.verify_task_28_react_setup()
        task29_result = self.verify_task_29_api_services()
        task30_result = self.verify_task_30_authentication()
        task31_result = self.verify_task_31_app_routing()
        
        # Generate summary
        self.generate_summary_report()
        
        return {
            'task28': task28_result,
            'task29': task29_result,
            'task30': task30_result,
            'task31': task31_result
        }
        
    def generate_summary_report(self):
        """Generate comprehensive summary report"""
        print("\n🎯 COMPREHENSIVE VERIFICATION SUMMARY")
        print("=" * 80)
        
        total_tasks = 4
        completed_tasks = sum(1 for task in self.results.values() if task['completed'])
        
        for task_name, task_data in self.results.items():
            status = "✅ COMPLETED" if task_data['completed'] else "❌ INCOMPLETE"
            percentage = task_data.get('completion_percentage', 0)
            print(f"{task_name.upper()}: {status} ({percentage:.1f}%)")
            
            if not task_data['completed']:
                failed_tests = [test['name'] for test in task_data['tests'] if not test['passed']]
                if failed_tests:
                    print(f"   📋 Failed tests: {', '.join(failed_tests)}")
        
        print(f"\n📊 OVERALL COMPLETION: {completed_tasks}/{total_tasks} tasks completed")
        
        if completed_tasks == total_tasks:
            print("🎉 ALL TASKS SUCCESSFULLY IMPLEMENTED!")
        else:
            print(f"⚠️  {total_tasks - completed_tasks} tasks need attention")
        
        # Save detailed report
        report_file = self.base_path / "comprehensive_verification_report.json"
        with open(report_file, 'w') as f:
            json.dump({
                'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
                'summary': {
                    'total_tasks': total_tasks,
                    'completed_tasks': completed_tasks,
                    'overall_completion': (completed_tasks / total_tasks) * 100
                },
                'detailed_results': self.results
            }, f, indent=2)
            
        print(f"\n📄 Detailed report saved: {report_file}")

def main():
    verifier = TaskVerificationSuite()
    results = verifier.run_comprehensive_verification()
    
    # Return exit code based on results
    all_completed = all(results.values())
    return 0 if all_completed else 1

if __name__ == "__main__":
    exit(main())
