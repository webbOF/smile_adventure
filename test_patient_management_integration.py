#!/usr/bin/env python3
"""
🎯 TASK 38: Patient Management Integration Test
Simple test to verify patient management components integration
"""

import os
import re

def test_component_exists(component_path):
    """Test if component file exists"""
    return os.path.exists(component_path)

def test_routing_integration(app_path):
    """Test if routing is properly configured"""
    with open(app_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check for patient management routes
    routes_check = {
        'patient_list_route': bool(re.search(r"path.*patients.*component.*PatientList", content)),
        'patient_profile_route': bool(re.search(r"path.*patients/:id.*component.*PatientProfile", content)),
        'patient_new_route': bool(re.search(r"path.*patients/new", content)),
        'imports_exist': bool(re.search(r"import.*PatientList", content)) and bool(re.search(r"import.*PatientProfile", content))
    }
    
    return routes_check

def test_navigation_integration(dashboard_path):
    """Test if navigation is properly integrated"""
    with open(dashboard_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    navigation_check = {
        'navigate_import': bool(re.search(r"import.*useNavigate", content)),
        'navigate_hook': bool(re.search(r"const navigate = useNavigate", content)),
        'patient_navigation': bool(re.search(r"navigate.*professional/patients", content)),
        'quick_actions_updated': bool(re.search(r"navigate.*patients.*new", content))
    }
    
    return navigation_check

def test_component_features(component_path):
    """Test if component has expected features"""
    with open(component_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'PatientList' in component_path:
        features = {
            'search_functionality': bool(re.search(r"searchTerm.*useState", content)),
            'filter_functionality': bool(re.search(r"statusFilter.*useState", content)),
            'navigation_calls': bool(re.search(r"navigate.*patients", content)),
            'patient_cards': bool(re.search(r"patient-card-", content)),
            'quick_actions': bool(re.search(r"handleQuickAction", content))
        }
    elif 'PatientProfile' in component_path:
        features = {
            'tab_navigation': bool(re.search(r"activeTab.*setActiveTab", content)),
            'patient_data': bool(re.search(r"patient.*useState", content)),
            'progress_charts': bool(re.search(r"LineChart.*PieChart", content)),
            'clinical_notes': bool(re.search(r"clinicalNotes.*setClinicalNotes", content)),
            'session_history': bool(re.search(r"sessionHistory", content))
        }
    else:
        features = {}
    
    return features

def main():
    print("🎯 TASK 38: Patient Management Integration Test")
    print("=" * 60)
    
    # File paths
    base_path = "frontend/src/components/professional"
    patient_list_path = os.path.join(base_path, "PatientList.jsx")
    patient_profile_path = os.path.join(base_path, "PatientProfile.jsx")
    dashboard_path = os.path.join(base_path, "ProfessionalDashboard.jsx")
    app_path = "frontend/src/App.jsx"
    
    # Test results
    results = {}
    
    # 1. Component Existence
    print("\n📋 Component Existence Test:")
    results['patient_list_exists'] = test_component_exists(patient_list_path)
    results['patient_profile_exists'] = test_component_exists(patient_profile_path)
    results['dashboard_exists'] = test_component_exists(dashboard_path)
    
    print(f"   PatientList.jsx: {'✅' if results['patient_list_exists'] else '❌'}")
    print(f"   PatientProfile.jsx: {'✅' if results['patient_profile_exists'] else '❌'}")
    print(f"   ProfessionalDashboard.jsx: {'✅' if results['dashboard_exists'] else '❌'}")
    
    # 2. Routing Integration
    print("\n🚀 Routing Integration Test:")
    if os.path.exists(app_path):
        routing_results = test_routing_integration(app_path)
        results.update(routing_results)
        
        for key, value in routing_results.items():
            print(f"   {key.replace('_', ' ').title()}: {'✅' if value else '❌'}")
    else:
        print("   ❌ App.jsx not found")
    
    # 3. Navigation Integration
    print("\n🧭 Navigation Integration Test:")
    if results['dashboard_exists']:
        nav_results = test_navigation_integration(dashboard_path)
        results.update(nav_results)
        
        for key, value in nav_results.items():
            print(f"   {key.replace('_', ' ').title()}: {'✅' if value else '❌'}")
    
    # 4. Component Features
    print("\n⚙️ Component Features Test:")
    
    if results['patient_list_exists']:
        print("   PatientList Features:")
        list_features = test_component_features(patient_list_path)
        results.update({f"list_{k}": v for k, v in list_features.items()})
        
        for key, value in list_features.items():
            print(f"     {key.replace('_', ' ').title()}: {'✅' if value else '❌'}")
    
    if results['patient_profile_exists']:
        print("   PatientProfile Features:")
        profile_features = test_component_features(patient_profile_path)
        results.update({f"profile_{k}": v for k, v in profile_features.items()})
        
        for key, value in profile_features.items():
            print(f"     {key.replace('_', ' ').title()}: {'✅' if value else '❌'}")
    
    # 5. Summary
    total_tests = len(results)
    passed_tests = sum(1 for v in results.values() if v)
    success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
    
    print(f"\n📊 Test Summary:")
    print(f"   Total Tests: {total_tests}")
    print(f"   Passed: {passed_tests}")
    print(f"   Success Rate: {success_rate:.1f}%")
    
    if success_rate >= 90:
        print("   Status: 🎉 EXCELLENT - Integration Complete!")
    elif success_rate >= 75:
        print("   Status: ✅ GOOD - Minor issues to resolve")
    elif success_rate >= 50:
        print("   Status: ⚠️ FAIR - Some features missing")
    else:
        print("   Status: ❌ POOR - Major integration issues")
    
    return results

if __name__ == "__main__":
    main()
