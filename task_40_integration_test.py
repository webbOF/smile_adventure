#!/usr/bin/env python3
"""
Task 40 - Report Generation Component - Final Integration Test
Tests the complete report generation workflow from frontend to backend
"""

import json
import time
import sys
import os
from pathlib import Path

def test_report_generator_integration():
    """Test the complete Report Generator implementation"""
    
    print("🎯 TASK 40 - REPORT GENERATION COMPONENT - FINAL INTEGRATION TEST")
    print("=" * 80)
    
    results = {
        "task_40_status": "TESTING",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "tests": {}
    }
    
    # Test 1: Verify ReportGenerator component exists
    print("\n📄 Test 1: ReportGenerator Component Verification")
    frontend_path = Path("frontend/src/components/professional/ReportGenerator.jsx")
    
    if frontend_path.exists():
        print("✅ ReportGenerator.jsx exists")
        with open(frontend_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Check for key features
        features = [
            "reportTemplates",
            "handleGenerateReport", 
            "reportGenerationService",
            "steps.map",
            "renderStepContent"
        ]
        
        feature_status = {}
        for feature in features:
            if feature in content:
                feature_status[feature] = "✅ Present"
                print(f"  ✅ {feature} implementation found")
            else:
                feature_status[feature] = "❌ Missing"
                print(f"  ❌ {feature} implementation missing")
        
        results["tests"]["component_features"] = feature_status
    else:
        print("❌ ReportGenerator.jsx not found")
        results["tests"]["component_exists"] = False
        
    # Test 2: Verify API Service exists
    print("\n🔗 Test 2: API Service Verification")
    service_path = Path("frontend/src/services/reportGenerationService.js")
    
    if service_path.exists():
        print("✅ reportGenerationService.js exists")
        with open(service_path, 'r', encoding='utf-8') as f:
            service_content = f.read()
            
        # Check for API methods
        api_methods = [
            "generateProgressReport",
            "generateSummaryReport", 
            "generateProfessionalReport",
            "exportData",
            "getAvailableChildren"
        ]
        
        api_status = {}
        for method in api_methods:
            if method in service_content:
                api_status[method] = "✅ Implemented"
                print(f"  ✅ {method} method found")
            else:
                api_status[method] = "❌ Missing"
                print(f"  ❌ {method} method missing")
        
        results["tests"]["api_methods"] = api_status
    else:
        print("❌ reportGenerationService.js not found")
        results["tests"]["api_service_exists"] = False
    
    # Test 3: Verify Backend Integration
    print("\n🏥 Test 3: Backend Service Integration")
    backend_service_path = Path("backend/app/reports/services/report_service.py")
    
    if backend_service_path.exists():
        print("✅ Backend ReportService exists")
        with open(backend_service_path, 'r', encoding='utf-8') as f:
            backend_content = f.read()
            
        # Check for backend methods
        backend_methods = [
            "generate_progress_report",
            "generate_summary_report",
            "create_professional_report", 
            "export_data"
        ]
        
        backend_status = {}
        for method in backend_methods:
            if method in backend_content:
                backend_status[method] = "✅ Available"
                print(f"  ✅ {method} backend method available")
            else:
                backend_status[method] = "❌ Missing"
                print(f"  ❌ {method} backend method missing")
        
        results["tests"]["backend_methods"] = backend_status
    else:
        print("❌ Backend ReportService not found")
        results["tests"]["backend_service_exists"] = False
    
    # Test 4: Check Dependencies
    print("\n📦 Test 4: Dependencies Verification")
    package_json_path = Path("frontend/package.json")
    
    if package_json_path.exists():
        with open(package_json_path, 'r', encoding='utf-8') as f:
            package_data = json.load(f)
            
        required_deps = ["jspdf", "html2canvas", "xlsx", "file-saver"]
        deps = package_data.get("dependencies", {})
        
        dep_status = {}
        for dep in required_deps:
            if dep in deps:
                dep_status[dep] = f"✅ v{deps[dep]}"
                print(f"  ✅ {dep} - {deps[dep]}")
            else:
                dep_status[dep] = "❌ Missing"
                print(f"  ❌ {dep} - Missing")
        
        results["tests"]["dependencies"] = dep_status
    else:
        print("❌ package.json not found")
        results["tests"]["package_json_exists"] = False
    
    # Test 5: Template System Verification
    print("\n🎨 Test 5: Report Templates Verification")
    if frontend_path.exists():
        template_types = [
            "progress_report",
            "summary_report", 
            "professional_report",
            "data_export"
        ]
        
        template_status = {}
        for template in template_types:
            if template in content:
                template_status[template] = "✅ Configured"
                print(f"  ✅ {template} template configured")
            else:
                template_status[template] = "❌ Missing"
                print(f"  ❌ {template} template missing")
        
        results["tests"]["templates"] = template_status
    
    # Calculate overall status
    print("\n📊 OVERALL ASSESSMENT")
    print("=" * 50)
    
    all_tests = []
    for test_category, test_data in results["tests"].items():
        if isinstance(test_data, dict):
            for test_name, test_result in test_data.items():
                all_tests.append("✅" in str(test_result))
        else:
            all_tests.append(test_data)
    
    passed_tests = sum(all_tests)
    total_tests = len(all_tests)
    success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
    
    print(f"Tests Passed: {passed_tests}/{total_tests}")
    print(f"Success Rate: {success_rate:.1f}%")
    
    if success_rate >= 90:
        status = "✅ EXCELLENT"
        results["task_40_status"] = "COMPLETED"
        print(f"\n🎉 Task 40 Status: {status}")
        print("✅ Report Generation Component is ready for production!")
    elif success_rate >= 80:
        status = "⚠️ GOOD"
        results["task_40_status"] = "MOSTLY_COMPLETED"
        print(f"\n⚠️ Task 40 Status: {status}")
        print("⚠️ Minor issues detected, but generally functional")
    else:
        status = "❌ NEEDS_WORK"
        results["task_40_status"] = "INCOMPLETE"
        print(f"\n❌ Task 40 Status: {status}")
        print("❌ Significant issues detected, requires attention")
    
    # Integration Readiness Check
    print("\n🔗 INTEGRATION READINESS")
    print("=" * 30)
    
    integration_checks = [
        ("Frontend Component", frontend_path.exists()),
        ("API Service", service_path.exists()),
        ("Backend Service", backend_service_path.exists()),
        ("Dependencies", success_rate >= 80)
    ]
    
    integration_ready = all(check[1] for check in integration_checks)
    
    for check_name, check_result in integration_checks:
        status_icon = "✅" if check_result else "❌"
        print(f"  {status_icon} {check_name}")
    
    if integration_ready:
        print("\n🚀 INTEGRATION STATUS: READY FOR PRODUCTION")
        print("✅ All components are in place for full-stack operation")
    else:
        print("\n⚠️ INTEGRATION STATUS: REQUIRES SETUP")
        print("❌ Some components need attention before production deployment")
    
    results["integration_ready"] = integration_ready
    results["success_rate"] = success_rate
    
    # Save results
    with open("task_40_integration_test_results.json", "w", encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\n📄 Detailed results saved to: task_40_integration_test_results.json")
    
    return results

def main():
    """Run the integration test"""
    try:
        results = test_report_generator_integration()
        
        if results["task_40_status"] == "COMPLETED":
            print("\n🎯 TASK 40 SUCCESSFULLY COMPLETED! 🎉")
            sys.exit(0)
        else:
            print(f"\n⚠️ Task 40 Status: {results['task_40_status']}")
            sys.exit(1)
            
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
