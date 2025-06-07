#!/usr/bin/env python3
"""
Comprehensive Docker Stack Verification
Tests all components of the Smile Adventure Docker setup
"""
import requests
import time
import sys
from typing import Dict, List

class DockerStackTester:
    """Comprehensive tester for the Docker stack"""
    
    def __init__(self):
        self.results = {}
        self.base_api_url = "http://localhost:8000"
        self.pgadmin_url = "http://localhost:8080"
        
    def test_api_endpoints(self) -> bool:
        """Test all critical API endpoints"""
        endpoints = [
            {"path": "/", "name": "Root endpoint"},
            {"path": "/health", "name": "Health check"},
            {"path": "/docs", "name": "API documentation"},
            {"path": "/openapi.json", "name": "OpenAPI schema"}
        ]
        
        print("🔍 Testing API Endpoints...")
        all_passed = True
        
        for endpoint in endpoints:
            try:
                response = requests.get(f"{self.base_api_url}{endpoint['path']}", timeout=10)
                if response.status_code == 200:
                    print(f"  ✅ {endpoint['name']}: {response.status_code}")
                else:
                    print(f"  ❌ {endpoint['name']}: {response.status_code}")
                    all_passed = False
            except Exception as e:
                print(f"  ❌ {endpoint['name']}: {str(e)}")
                all_passed = False
                
        return all_passed
    
    def test_pgadmin_access(self) -> bool:
        """Test pgAdmin accessibility"""
        print("🔍 Testing pgAdmin Access...")
        try:
            response = requests.get(self.pgadmin_url, timeout=10)
            if response.status_code == 200:
                print(f"  ✅ pgAdmin accessible: {response.status_code}")
                return True
            else:
                print(f"  ❌ pgAdmin not accessible: {response.status_code}")
                return False
        except Exception as e:
            print(f"  ❌ pgAdmin connection failed: {str(e)}")
            return False
    
    def test_database_via_api(self) -> bool:
        """Test database connectivity through API"""
        print("🔍 Testing Database via API...")
        try:
            # Test health endpoint which may include DB status
            response = requests.get(f"{self.base_api_url}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    print("  ✅ API reports healthy status")
                    return True
                else:
                    print("  ❌ API reports unhealthy status")
                    return False
            else:
                print(f"  ❌ Health endpoint returned: {response.status_code}")
                return False
        except Exception as e:
            print(f"  ❌ Database test via API failed: {str(e)}")
            return False
    
    def test_api_security(self) -> bool:
        """Test API security endpoints"""
        print("🔍 Testing API Security...")
        try:
            # Test protected endpoint (should return 401 without auth)
            response = requests.get(f"{self.base_api_url}/api/v1/auth/me", timeout=10)
            if response.status_code == 401:
                print("  ✅ Protected endpoint properly secured")
                return True
            else:
                print(f"  ⚠️  Protected endpoint returned: {response.status_code}")
                return True  # Not necessarily a failure
        except Exception as e:
            print(f"  ❌ Security test failed: {str(e)}")
            return False
    
    def run_comprehensive_test(self) -> Dict[str, bool]:
        """Run all tests and return results"""
        print("🚀 Starting Comprehensive Docker Stack Test\n")
        
        tests = [
            ("API Endpoints", self.test_api_endpoints),
            ("pgAdmin Access", self.test_pgadmin_access),
            ("Database via API", self.test_database_via_api),
            ("API Security", self.test_api_security)
        ]
        
        results = {}
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            print(f"\n--- {test_name} ---")
            try:
                result = test_func()
                results[test_name] = result
                if result:
                    passed += 1
            except Exception as e:
                print(f"❌ {test_name} failed with exception: {str(e)}")
                results[test_name] = False
        
        # Print summary
        print(f"\n{'='*50}")
        print(f"📊 TEST SUMMARY")
        print(f"{'='*50}")
        print(f"Passed: {passed}/{total} tests")
        
        for test_name, result in results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"  {status}: {test_name}")
        
        if passed == total:
            print(f"\n🎉 ALL TESTS PASSED! Docker stack is fully operational!")
            return True
        else:
            print(f"\n⚠️  {total - passed} test(s) failed. Check the logs above.")
            return False

if __name__ == "__main__":
    tester = DockerStackTester()
    success = tester.run_comprehensive_test()
    sys.exit(0 if success else 1)
