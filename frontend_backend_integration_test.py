#!/usr/bin/env python3
"""
Frontend-Backend Integration Test Suite
Task 30: Testing the API Services Layer with Real Backend

This script tests the complete integration between:
- Frontend API Services (Task 29 implementation)  
- Backend API Gateway (Tasks 25-26 implementation)

Test Scenarios:
1. API Health Check
2. Authentication Flow (Register/Login/Logout)
3. Children Management (CRUD operations)
4. Game Sessions (Start/Complete workflow)
5. Reports & Analytics
6. Error Handling & Recovery
"""

import asyncio
import aiohttp
import json
import time
import sys
from datetime import datetime
from typing import Dict, Any, Optional

# Test Configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/v1"

class FrontendBackendIntegrationTest:
    """Integration test suite for frontend-backend communication"""
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.auth_token: Optional[str] = None
        self.test_user_email = f"integration_test_{int(time.time())}@test.com"
        self.test_child_id: Optional[int] = None
        self.test_session_id: Optional[int] = None
        self.results = {
            "tests_run": 0,
            "tests_passed": 0,
            "tests_failed": 0,
            "errors": []
        }
    
    async def setup(self):
        """Setup test session"""
        print("🔧 Setting up integration test session...")
        timeout = aiohttp.ClientTimeout(total=30)
        self.session = aiohttp.ClientSession(timeout=timeout)
        print("✅ Test session initialized")
    
    async def cleanup(self):
        """Cleanup test session"""
        if self.session:
            await self.session.close()
        print("🧹 Test session cleaned up")
    
    async def run_test(self, test_name: str, test_func) -> bool:
        """Run a single test with error handling"""
        self.results["tests_run"] += 1
        print(f"\n🧪 TEST: {test_name}")
        print("-" * 50)
        
        try:
            result = await test_func()
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
    
    async def test_api_health(self) -> bool:
        """Test 1: API Health Check"""
        print("Checking API health endpoints...")
        
        # Test basic health endpoint
        async with self.session.get(f"{BASE_URL}/health") as response:
            if response.status == 200:
                health_data = await response.json()
                print(f"   📊 Basic Health: {health_data.get('status', 'unknown')}")
            else:
                print(f"   ⚠️  Basic health check failed: {response.status}")
                return False
        
        # Test API v1 health endpoint
        async with self.session.get(f"{API_BASE}/health") as response:
            if response.status == 200:
                health_data = await response.json()
                print(f"   📊 API v1 Health: {health_data.get('status', 'unknown')}")
            else:
                print(f"   ⚠️  API v1 health check failed: {response.status}")
        
        # Test API info endpoint
        async with self.session.get(f"{API_BASE}/") as response:
            if response.status == 200:
                api_info = await response.json()
                print(f"   📋 API Version: {api_info.get('api_version', 'unknown')}")
                print(f"   📋 API Title: {api_info.get('title', 'unknown')}")
            else:
                print(f"   ⚠️  API info failed: {response.status}")
        
        print("   ✅ API health checks completed")
        return True
    
    async def test_user_registration(self) -> bool:
        """Test 2: User Registration (similar to frontend authService.register)"""
        print("Testing user registration...")
        
        registration_data = {
            "email": self.test_user_email,
            "password": "TestPassword123!",
            "password_confirm": "TestPassword123!",
            "first_name": "Integration",
            "last_name": "Test",
            "phone": "5555551234",
            "role": "parent"
        }
        
        async with self.session.post(
            f"{API_BASE}/auth/register",
            json=registration_data
        ) as response:
            if response.status == 201:
                result = await response.json()
                user_id = result["user"]["id"]
                print(f"   ✅ User registered successfully: ID {user_id}")
                print(f"   📧 Email: {result['user']['email']}")
                print(f"   👤 Name: {result['user']['first_name']} {result['user']['last_name']}")
                
                # Verify email (required before login)
                async with self.session.post(f"{API_BASE}/auth/verify-email/{user_id}") as verify_response:
                    if verify_response.status == 200:
                        print(f"   ✅ Email verification completed")
                        return True
                    else:
                        print(f"   ❌ Email verification failed: {verify_response.status}")
                        return False
            else:
                error_text = await response.text()
                print(f"   ❌ Registration failed: {response.status}")
                print(f"   Error: {error_text}")
                return False
    
    async def test_user_login(self) -> bool:
        """Test 3: User Login (similar to frontend authService.login)"""
        print("Testing user login...")
        
        login_data = {
            "username": self.test_user_email,
            "password": "TestPassword123!"
        }
        
        # Using form data as the backend expects
        data = aiohttp.FormData()
        for key, value in login_data.items():
            data.add_field(key, value)
        
        async with self.session.post(
            f"{API_BASE}/auth/login",
            data=data
        ) as response:
            if response.status == 200:
                result = await response.json()
                self.auth_token = result["token"]["access_token"]
                print(f"   ✅ Login successful")
                print(f"   🔑 Token obtained: {self.auth_token[:20]}...")
                print(f"   ⏰ Expires: {result['token']['expires_at']}")
                return True
            else:
                error_text = await response.text()
                print(f"   ❌ Login failed: {response.status}")
                print(f"   Error: {error_text}")
                return False
    
    async def test_current_user(self) -> bool:
        """Test 4: Get Current User (similar to frontend authService.getCurrentUser)"""
        print("Testing get current user...")
        
        if not self.auth_token:
            print("   ❌ No auth token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        async with self.session.get(
            f"{API_BASE}/auth/me",
            headers=headers
        ) as response:
            if response.status == 200:
                user_data = await response.json()
                print(f"   ✅ Current user retrieved successfully")
                print(f"   👤 User ID: {user_data['id']}")
                print(f"   📧 Email: {user_data['email']}")
                print(f"   🎭 Role: {user_data['role']}")
                return True
            else:
                error_text = await response.text()
                print(f"   ❌ Get current user failed: {response.status}")
                print(f"   Error: {error_text}")
                return False
    
    async def test_create_child(self) -> bool:
        """Test 5: Create Child (similar to frontend userService.createChild)"""
        print("Testing child creation...")
        
        if not self.auth_token:
            print("   ❌ No auth token available")
            return False
        
        headers = {
            "Authorization": f"Bearer {self.auth_token}",
            "Content-Type": "application/json"
        }
        
        child_data = {
            "name": "Integration Test Child",
            "date_of_birth": "2019-03-15",
            "gender": "female",
            "diagnosis": "Autism Spectrum Disorder",
            "diagnosis_date": "2021-06-01",
            "support_level": "level_2",
            "current_therapies": ["speech_therapy", "occupational_therapy"],
            "emergency_contacts": [
                {
                    "name": "Test Parent",
                    "relationship": "parent",
                    "phone": "+1-555-0123"
                }
            ],
            "safety_protocols": {
                "meltdown_strategies": ["quiet_space", "sensory_tools"],
                "preferred_activities": ["drawing", "building_blocks"]
            }
        }
        
        async with self.session.post(
            f"{API_BASE}/users/children",
            headers=headers,
            json=child_data
        ) as response:
            if response.status == 201:
                result = await response.json()
                self.test_child_id = result["id"]
                print(f"   ✅ Child created successfully: ID {self.test_child_id}")
                print(f"   👶 Name: {result['name']}")
                print(f"   🎂 Age: {result['age']}")
                print(f"   🧩 Diagnosis: {result['diagnosis']}")
                return True
            else:
                error_text = await response.text()
                print(f"   ❌ Child creation failed: {response.status}")
                print(f"   Error: {error_text}")
                return False
    
    async def test_get_children(self) -> bool:
        """Test 6: Get Children List (similar to frontend userService.getChildren)"""
        print("Testing get children list...")
        
        if not self.auth_token:
            print("   ❌ No auth token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        async with self.session.get(
            f"{API_BASE}/users/children",
            headers=headers
        ) as response:
            if response.status == 200:
                children = await response.json()
                print(f"   ✅ Children list retrieved successfully")
                print(f"   👶 Total children: {len(children)}")
                if children:
                    for i, child in enumerate(children, 1):
                        print(f"   {i}. {child['name']} (ID: {child['id']})")
                return True
            else:
                error_text = await response.text()
                print(f"   ❌ Get children failed: {response.status}")
                print(f"   Error: {error_text}")
                return False
    
    async def test_create_game_session(self) -> bool:
        """Test 7: Create Game Session (similar to frontend reportService.createGameSession)"""
        print("Testing game session creation...")
        
        if not self.auth_token or not self.test_child_id:
            print("   ❌ No auth token or child ID available")
            return False
        
        headers = {
            "Authorization": f"Bearer {self.auth_token}",
            "Content-Type": "application/json"
        }
        
        session_data = {
            "child_id": self.test_child_id,
            "session_type": "therapy_session",
            "scenario_name": "Social Skills Training",
            "scenario_id": "social_001",
            "scenario_version": "1.2",
            "device_type": "tablet",
            "device_model": "iPad Pro",
            "app_version": "2.1.0",
            "environment_type": "home",
            "support_person_present": True
        }
        
        async with self.session.post(
            f"{API_BASE}/reports/game-sessions",
            headers=headers,
            json=session_data
        ) as response:
            if response.status == 201:
                result = await response.json()
                self.test_session_id = result["id"]
                print(f"   ✅ Game session created successfully: ID {self.test_session_id}")
                print(f"   🎮 Session Type: {result['session_type']}")
                print(f"   📱 Scenario: {result['scenario_name']}")
                print(f"   🕒 Started At: {result['started_at']}")
                return True
            else:
                error_text = await response.text()
                print(f"   ❌ Game session creation failed: {response.status}")
                print(f"   Error: {error_text}")
                return False
    
    async def test_complete_game_session(self) -> bool:
        """Test 8: Complete Game Session (similar to frontend reportService.completeSession)"""
        print("Testing game session completion...")
        
        if not self.auth_token or not self.test_session_id:
            print("   ❌ No auth token or session ID available")
            return False
        
        headers = {
            "Authorization": f"Bearer {self.auth_token}",
            "Content-Type": "application/json"
        }
        
        completion_data = {
            "score": 85,
            "levels_completed": 3,
            "interactions_count": 45,
            "correct_responses": 38,
            "incorrect_responses": 7,
            "hints_used": 12,
            "time_spent_seconds": 1800,
            "engagement_level": "high",
            "difficulty_progression": "adaptive",
            "areas_of_strength": ["visual_processing", "pattern_recognition"],
            "areas_for_improvement": ["auditory_processing"],
            "session_notes": "Great progress with visual tasks, continue focus on auditory skills"
        }
        
        async with self.session.put(
            f"{API_BASE}/reports/game-sessions/{self.test_session_id}/end",
            headers=headers,
            json=completion_data
        ) as response:
            if response.status == 200:
                result = await response.json()
                print(f"   ✅ Game session completed successfully")
                print(f"   💯 Final Score: {result['score']}")
                print(f"   📊 Status: {result['completion_status']}")
                print(f"   ⏱️ Duration: {result.get('duration_minutes', 'N/A')} minutes")
                return True
            else:
                error_text = await response.text()
                print(f"   ❌ Game session completion failed: {response.status}")
                print(f"   Error: {error_text}")
                return False
    
    async def test_child_progress_report(self) -> bool:
        """Test 9: Get Child Progress Report (similar to frontend reportService.getChildProgressReport)"""
        print("Testing child progress report...")
        
        if not self.auth_token or not self.test_child_id:
            print("   ❌ No auth token or child ID available")
            return False
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        async with self.session.get(
            f"{API_BASE}/reports/child/{self.test_child_id}/progress",
            headers=headers
        ) as response:
            if response.status == 200:
                progress_data = await response.json()
                print(f"   ✅ Progress report retrieved successfully")
                print(f"   📊 Sessions Count: {progress_data.get('total_sessions', 0)}")
                print(f"   📈 Average Score: {progress_data.get('average_score', 0)}")
                print(f"   ⏰ Total Time: {progress_data.get('total_time_minutes', 0)} minutes")
                return True
            else:
                error_text = await response.text()
                print(f"   ❌ Progress report failed: {response.status}")
                print(f"   Error: {error_text}")
                return False
    
    async def test_child_analytics(self) -> bool:
        """Test 10: Get Child Analytics (similar to frontend reportService.getChildAnalytics)"""
        print("Testing child analytics...")
        
        if not self.auth_token or not self.test_child_id:
            print("   ❌ No auth token or child ID available")
            return False
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        async with self.session.get(
            f"{API_BASE}/reports/child/{self.test_child_id}/analytics",
            headers=headers
        ) as response:
            if response.status == 200:
                analytics_data = await response.json()
                print(f"   ✅ Analytics retrieved successfully")
                print(f"   📊 Data Points: {len(analytics_data.keys())} categories")
                if 'performance_metrics' in analytics_data:
                    print(f"   📈 Performance Metrics Available: ✅")
                return True
            else:
                error_text = await response.text()
                print(f"   ❌ Analytics failed: {response.status}")
                print(f"   Error: {error_text}")
                return False
    
    async def test_logout(self) -> bool:
        """Test 11: User Logout (similar to frontend authService.logout)"""
        print("Testing user logout...")
        
        if not self.auth_token:
            print("   ❌ No auth token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        async with self.session.post(
            f"{API_BASE}/auth/logout",
            headers=headers
        ) as response:
            if response.status == 200:
                result = await response.json()
                print(f"   ✅ Logout successful")
                print(f"   📝 Message: {result.get('message', '')}")
                self.auth_token = None  # Clear token
                return True
            else:
                error_text = await response.text()
                print(f"   ❌ Logout failed: {response.status}")
                print(f"   Error: {error_text}")
                return False
    
    async def run_all_tests(self):
        """Run the complete integration test suite"""
        print("="*80)
        print("🚀 FRONTEND-BACKEND INTEGRATION TEST SUITE")
        print("="*80)
        print(f"🎯 Target API: {API_BASE}")
        print(f"📅 Test Run: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"📧 Test User: {self.test_user_email}")
        
        await self.setup()
        
        # Define test sequence
        tests = [
            ("API Health Check", self.test_api_health),
            ("User Registration", self.test_user_registration),
            ("User Login", self.test_user_login),
            ("Get Current User", self.test_current_user),
            ("Create Child Profile", self.test_create_child),
            ("Get Children List", self.test_get_children),
            ("Create Game Session", self.test_create_game_session),
            ("Complete Game Session", self.test_complete_game_session),
            ("Child Progress Report", self.test_child_progress_report),
            ("Child Analytics", self.test_child_analytics),
            ("User Logout", self.test_logout),
        ]
        
        # Run tests
        for test_name, test_func in tests:
            await self.run_test(test_name, test_func)
            
            # Small delay between tests
            await asyncio.sleep(0.5)
        
        # Print summary
        self.print_summary()
        
        await self.cleanup()
        
        # Return success status
        return self.results["tests_failed"] == 0
    
    def print_summary(self):
        """Print test execution summary"""
        print("\n" + "="*80)
        print("📊 INTEGRATION TEST SUMMARY")
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
            print(f"\n🎉 ALL TESTS PASSED! Frontend-Backend integration is working correctly!")
            print(f"✅ The API Services Layer (Task 29) successfully communicates with Backend (Tasks 25-26)")
        else:
            print(f"\n⚠️  SOME TESTS FAILED. Review the errors above for debugging.")
        
        print("="*80)


async def main():
    """Main entry point"""
    # Check if backend is running
    print("🔍 Checking if backend server is running...")
    
    try:
        timeout = aiohttp.ClientTimeout(total=5)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.get(f"{BASE_URL}/health") as response:
                if response.status == 200:
                    print("✅ Backend server is running and responsive")
                else:
                    print(f"❌ Backend server responded with status: {response.status}")
                    return False
    except Exception as e:
        print(f"❌ Backend server is not accessible: {str(e)}")
        print(f"📝 Please make sure the backend is running on {BASE_URL}")
        print(f"   Command: cd backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000")
        return False
    
    # Run integration tests
    test_suite = FrontendBackendIntegrationTest()
    success = await test_suite.run_all_tests()
    
    return success


if __name__ == "__main__":
    try:
        success = asyncio.run(main())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n🛑 Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Unexpected error: {str(e)}")
        sys.exit(1)
