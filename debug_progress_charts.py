#!/usr/bin/env python3
"""
Debug script per analizzare gli errori JavaScript e migliorare i test ProgressCharts
"""

import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

def setup_driver():
    """Setup Chrome driver with enhanced debugging"""
    chrome_options = Options()
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1280,720")
    chrome_options.add_argument("--enable-logging")
    chrome_options.add_argument("--log-level=0")
    
    # Enable console logging
    chrome_options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        return driver
    except Exception as e:
        print(f"Error setting up Chrome driver: {e}")
        return None

def analyze_javascript_errors():
    """Analyze JavaScript errors in detail"""
    driver = setup_driver()
    if not driver:
        return {"error": "Could not setup driver"}
    
    analysis = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "console_logs": [],
        "dom_analysis": {},
        "network_errors": [],
        "recommendations": []
    }
    
    try:
        print("🔍 Analyzing JavaScript console errors...")
        
        # Navigate to progress dashboard
        driver.get("http://localhost:3000/parent/progress")
        time.sleep(5)  # Wait for full load
        
        # Get all console logs
        logs = driver.get_log('browser')
        
        # Categorize logs
        errors = []
        warnings = []
        info = []
        
        for log in logs:
            log_entry = {
                "level": log['level'],
                "message": log['message'],
                "source": log.get('source', 'unknown'),
                "timestamp": log['timestamp']
            }
            
            if log['level'] == 'SEVERE':
                errors.append(log_entry)
            elif log['level'] == 'WARNING':
                warnings.append(log_entry)
            else:
                info.append(log_entry)
        
        analysis["console_logs"] = {
            "errors": errors,
            "warnings": warnings,
            "info": info,
            "total_errors": len(errors),
            "total_warnings": len(warnings)
        }
        
        print(f"📊 Found {len(errors)} errors, {len(warnings)} warnings")
        
        # Analyze DOM structure for ProgressCharts
        print("🔍 Analyzing ProgressCharts DOM structure...")
        
        # Check for ProgressDashboard elements
        progress_containers = driver.find_elements(By.CSS_SELECTOR, "[class*='dental-card'], [class*='progress'], [class*='chart']")
        recharts_elements = driver.find_elements(By.CSS_SELECTOR, ".recharts-wrapper, .recharts-surface, svg")
        filter_elements = driver.find_elements(By.CSS_SELECTOR, "select, input[type='range'], button[class*='filter']")
        
        analysis["dom_analysis"] = {
            "progress_containers": len(progress_containers),
            "recharts_elements": len(recharts_elements),
            "filter_elements": len(filter_elements),
            "page_title": driver.title,
            "current_url": driver.current_url
        }
        
        # Test specific ProgressCharts functionality
        print("🧪 Testing ProgressCharts specific elements...")
        
        # Look for specific elements that should be present
        key_elements = {
            "period_selector": driver.find_elements(By.CSS_SELECTOR, "select[id*='period'], select[class*='period']"),
            "metric_selector": driver.find_elements(By.CSS_SELECTOR, "select[id*='metric'], select[class*='metric']"),
            "chart_type_selector": driver.find_elements(By.CSS_SELECTOR, "select[id*='chart'], select[class*='type']"),
            "key_metrics_cards": driver.find_elements(By.CSS_SELECTOR, "[class*='dental-card'] [class*='text-2xl']"),
            "charts_containers": driver.find_elements(By.CSS_SELECTOR, ".recharts-wrapper"),
            "loading_states": driver.find_elements(By.CSS_SELECTOR, "[class*='animate-pulse']"),
            "error_states": driver.find_elements(By.CSS_SELECTOR, "[class*='error'], [class*='alert-red']")
        }
        
        analysis["progress_charts_elements"] = {key: len(elements) for key, elements in key_elements.items()}
        
        # Test interaction capabilities
        print("🎮 Testing filter interactions...")
        interaction_results = {}
        
        try:
            # Test period selector
            period_selectors = driver.find_elements(By.CSS_SELECTOR, "select[id*='period'], select[class*='period']")
            if period_selectors:
                period_selector = period_selectors[0]
                original_value = period_selector.get_attribute('value')
                driver.execute_script("arguments[0].value = '7';", period_selector)
                driver.execute_script("arguments[0].dispatchEvent(new Event('change'));", period_selector)
                time.sleep(1)
                new_value = period_selector.get_attribute('value')
                interaction_results["period_selector"] = {
                    "found": True,
                    "original_value": original_value,
                    "new_value": new_value,
                    "interaction_success": new_value == '7'
                }
            else:
                interaction_results["period_selector"] = {"found": False}
                
        except Exception as e:
            interaction_results["period_selector"] = {"error": str(e)}
        
        analysis["interaction_tests"] = interaction_results
        
        # Check for React-specific errors
        print("⚛️ Checking React-specific issues...")
        react_analysis = {
            "react_devtools_detected": bool(driver.execute_script("return window.React")),
            "react_errors": [],
            "recharts_loaded": bool(driver.execute_script("return window.Recharts")),
        }
        
        # Look for common React error patterns in console
        for log in errors + warnings:
            message = log["message"].lower()
            if any(keyword in message for keyword in ["react", "jsx", "hook", "component", "render"]):
                react_analysis["react_errors"].append(log)
        
        analysis["react_analysis"] = react_analysis
        
        # Generate recommendations
        recommendations = []
        
        if len(errors) > 0:
            recommendations.append("🔧 Fix critical JavaScript errors to improve stability")
        
        if analysis["progress_charts_elements"]["period_selector"] == 0:
            recommendations.append("🎛️ Add data-testid attributes to filter selectors for better testing")
        
        if analysis["progress_charts_elements"]["charts_containers"] == 0:
            recommendations.append("📊 Ensure Recharts components are properly rendered")
        
        if len(warnings) > 10:
            recommendations.append("⚠️ Review and reduce JavaScript warnings")
        
        if not react_analysis["recharts_loaded"]:
            recommendations.append("📈 Verify Recharts library is properly loaded")
        
        analysis["recommendations"] = recommendations
        
    except Exception as e:
        analysis["error"] = f"Analysis failed: {str(e)}"
    
    finally:
        driver.quit()
    
    return analysis

def enhance_progress_charts_testability():
    """Add data-testid attributes to improve testing"""
    print("🔧 Enhancing ProgressCharts testability...")
    
    # The main improvement would be to add data-testid attributes
    # This is a recommendation for the component
    improvements = {
        "data_testids_to_add": [
            "progress-period-selector",
            "progress-metric-selector", 
            "progress-chart-type-selector",
            "progress-key-metrics",
            "progress-main-chart",
            "progress-emotional-chart",
            "progress-game-performance-chart",
            "progress-engagement-chart",
            "progress-activity-heatmap",
            "progress-insights-panel"
        ],
        "css_classes_to_add": [
            "progress-dashboard-container",
            "progress-filters-panel",
            "progress-charts-grid"
        ]
    }
    
    return improvements

if __name__ == "__main__":
    print("🔍 Starting ProgressCharts Debug Analysis...")
    print("=" * 60)
    
    # Run JavaScript error analysis
    analysis = analyze_javascript_errors()
    
    # Get testability improvements
    improvements = enhance_progress_charts_testability()
    analysis["testability_improvements"] = improvements
    
    # Print results
    print("\n📊 ANALYSIS RESULTS:")
    print("=" * 60)
    
    if "console_logs" in analysis:
        logs = analysis["console_logs"]
        print(f"🚨 JavaScript Errors: {logs['total_errors']}")
        print(f"⚠️ JavaScript Warnings: {logs['total_warnings']}")
        
        if logs["errors"]:
            print("\n🔴 Critical Errors:")
            for error in logs["errors"][:3]:  # Show first 3 errors
                print(f"  - {error['message'][:100]}...")
        
        if logs["warnings"]:
            print("\n🟡 Warnings (first 3):")
            for warning in logs["warnings"][:3]:
                print(f"  - {warning['message'][:100]}...")
    
    if "dom_analysis" in analysis:
        dom = analysis["dom_analysis"]
        print(f"\n🏗️ DOM Analysis:")
        print(f"  Progress Containers: {dom['progress_containers']}")
        print(f"  Recharts Elements: {dom['recharts_elements']}")
        print(f"  Filter Elements: {dom['filter_elements']}")
    
    if "progress_charts_elements" in analysis:
        elements = analysis["progress_charts_elements"]
        print(f"\n📊 ProgressCharts Elements:")
        for element_type, count in elements.items():
            status = "✅" if count > 0 else "❌"
            print(f"  {status} {element_type}: {count}")
    
    if "recommendations" in analysis:
        print(f"\n💡 Recommendations:")
        for i, rec in enumerate(analysis["recommendations"], 1):
            print(f"  {i}. {rec}")
    
    if "testability_improvements" in analysis:
        print(f"\n🔧 Testability Improvements:")
        improvements = analysis["testability_improvements"]
        print(f"  Data TestIDs to add: {len(improvements['data_testids_to_add'])}")
        print(f"  CSS Classes to add: {len(improvements['css_classes_to_add'])}")
    
    # Save detailed analysis
    with open("progress_charts_debug_analysis.json", "w") as f:
        json.dump(analysis, f, indent=2)
    
    print(f"\n📄 Detailed analysis saved to: progress_charts_debug_analysis.json")
    print("\n🎉 Debug analysis completed!")
