#!/usr/bin/env python3
"""
Final verification test for Tasks 28-31 implementation
Tests the complete application functionality
"""
import requests
import time
import json

def run_final_verification():
    print("🚀 FINAL API VERIFICATION")
    print("=" * 50)
    
    results = {
        'backend_health': False,
        'frontend_accessible': False,
        'registration_works': False,
        'login_works': False,
        'protected_access': False,
        'auto_verification': False
    }
    
    # 1. Backend health check
    print("1. Testing backend health...")
    try:
        response = requests.get('http://localhost:8000/health', timeout=5)
        if response.status_code == 200:
            status = response.json().get('status', 'unknown')
            print(f"   ✅ Backend Health: {response.status_code} - {status}")
            results['backend_health'] = True
        else:
            print(f"   ❌ Backend Health: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Backend Health: Failed - {e}")
    
    # 2. Frontend accessibility
    print("2. Testing frontend accessibility...")
    try:
        frontend_response = requests.get('http://localhost:3000', timeout=5)
        if frontend_response.status_code == 200:
            content_check = 'Smile Adventure' in frontend_response.text
            print(f"   ✅ Frontend: {frontend_response.status_code} - Content loaded: {content_check}")
            results['frontend_accessible'] = True
        else:
            print(f"   ❌ Frontend: {frontend_response.status_code}")
    except Exception as e:
        print(f"   ❌ Frontend: Failed - {e}")
    
    # 3. User registration and authentication flow
    print("3. Testing complete authentication flow...")
    test_email = f'final.test.{int(time.time())}@example.com'
    user_data = {
        'email': test_email,
        'password': 'FinalTest123!',
        'password_confirm': 'FinalTest123!',
        'first_name': 'Final',
        'last_name': 'Test',
        'role': 'parent'
    }
    
    try:
        # Register user
        print("   3a. Testing user registration...")
        reg_response = requests.post(
            'http://localhost:8000/api/v1/auth/register', 
            json=user_data, 
            timeout=10
        )
        
        if reg_response.status_code == 201:
            user = reg_response.json().get('user', {})
            is_verified = user.get('is_verified', False)
            print(f"      ✅ Registration: {reg_response.status_code} - User verified: {is_verified}")
            results['registration_works'] = True
            results['auto_verification'] = is_verified
            
            # Login immediately (test auto-verification)
            print("   3b. Testing immediate login...")
            login_data = {'username': test_email, 'password': 'FinalTest123!'}
            login_response = requests.post(
                'http://localhost:8000/api/v1/auth/login', 
                data=login_data, 
                timeout=10
            )
            
            if login_response.status_code == 200:
                token_data = login_response.json().get('token', {})
                token = token_data.get('access_token', '')
                print(f"      ✅ Login: {login_response.status_code} - Token received: {len(token) > 0}")
                results['login_works'] = True
                
                # Test protected endpoint
                print("   3c. Testing protected endpoint access...")
                headers = {'Authorization': f'Bearer {token}'}
                profile_response = requests.get(
                    'http://localhost:8000/api/v1/auth/me', 
                    headers=headers, 
                    timeout=10
                )
                
                if profile_response.status_code == 200:
                    profile = profile_response.json().get('user', profile_response.json())
                    user_name = f"{profile.get('first_name', 'Unknown')} {profile.get('last_name', 'Unknown')}"
                    print(f"      ✅ Protected Access: {profile_response.status_code} - User: {user_name}")
                    results['protected_access'] = True
                else:
                    print(f"      ❌ Protected Access: {profile_response.status_code}")
            else:
                error_detail = login_response.json().get('detail', 'Unknown error')
                print(f"      ❌ Login: {login_response.status_code} - {error_detail}")
        else:
            error_detail = reg_response.json().get('detail', 'Unknown error')
            print(f"      ❌ Registration: {reg_response.status_code} - {error_detail}")
            
    except Exception as e:
        print(f"   ❌ Authentication Flow Error: {e}")
    
    # 4. Generate summary
    print("\n📊 FINAL VERIFICATION SUMMARY")
    print("=" * 50)
    
    total_tests = len(results)
    passed_tests = sum(1 for result in results.values() if result)
    
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
    
    print(f"\n🎯 OVERALL SCORE: {passed_tests}/{total_tests} tests passed ({(passed_tests/total_tests)*100:.1f}%)")
    
    if passed_tests == total_tests:
        print("🎉 ALL SYSTEMS OPERATIONAL!")
        print("✅ Tasks 28-31: FULLY FUNCTIONAL")
        print("✅ Authentication: WORKING")
        print("✅ API Integration: COMPLETE")
        print("✅ Frontend-Backend: CONNECTED")
    else:
        print("⚠️  Some systems need attention")
    
    # Save results
    report_file = 'final_verification_report.json'
    with open(report_file, 'w') as f:
        json.dump({
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
            'test_results': results,
            'summary': {
                'total_tests': total_tests,
                'passed_tests': passed_tests,
                'success_rate': (passed_tests/total_tests)*100
            }
        }, f, indent=2)
    
    print(f"\n📄 Report saved: {report_file}")
    return passed_tests == total_tests

if __name__ == "__main__":
    success = run_final_verification()
    exit(0 if success else 1)
