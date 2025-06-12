#!/usr/bin/env python3
"""
Test suite migliorato per ProgressCharts con data-testid attributes
"""

import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

def setup_driver():
    """Setup Chrome driver with options"""
    chrome_options = Options()
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1280,720")
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        return driver
    except Exception as e:
        print(f"Error setting up Chrome driver: {e}")
        return None

def test_progress_charts_enhanced():
    """Enhanced test suite using data-testid attributes"""
    driver = setup_driver()
    if not driver:
        return {"success": False, "error": "Could not setup driver"}
    
    results = {
        "test_start_time": time.strftime("%Y-%m-%d %H:%M:%S"),
        "tests": {},
        "summary": {}
    }
    
    try:
        # Navigate to application
        print("📱 Opening Smile Adventure application...")
        driver.get("http://localhost:3000")
        
        # Wait for app to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        results["tests"]["app_load"] = {
            "status": "✅ PASS",
            "message": "Application loaded successfully"
        }
        
        # Navigate to progress dashboard
        print("📊 Navigating to Progress Dashboard...")
        try:
            driver.get("http://localhost:3000/parent/progress")
            time.sleep(3)
            
            # Check for ProgressCharts container using data-testid
            progress_container = driver.find_elements(By.CSS_SELECTOR, "[data-testid='progress-charts-container']")
            
            if progress_container:
                results["tests"]["progress_dashboard_load"] = {
                    "status": "✅ PASS",
                    "message": "Progress dashboard loaded with main container"
                }
            else:
                results["tests"]["progress_dashboard_load"] = {
                    "status": "⚠️ PARTIAL",
                    "message": "Progress dashboard loaded but main container not found"
                }
            
        except Exception as e:
            results["tests"]["progress_dashboard_load"] = {
                "status": "❌ FAIL",
                "message": f"Failed to load progress dashboard: {str(e)}"
            }
        
        # Test Key Metrics Cards
        print("📊 Testing Key Metrics Cards...")
        try:
            key_metrics = driver.find_elements(By.CSS_SELECTOR, "[data-testid='progress-key-metrics']")
            metric_cards = driver.find_elements(By.CSS_SELECTOR, "[data-testid^='metric-']")
            
            expected_metrics = ["metric-total-sessions", "metric-average-score", "metric-play-time", "metric-trend"]
            found_metrics = []
            
            for metric in expected_metrics:
                elements = driver.find_elements(By.CSS_SELECTOR, f"[data-testid='{metric}']")
                if elements:
                    found_metrics.append(metric)
            
            results["tests"]["key_metrics_cards"] = {
                "status": "✅ PASS" if len(found_metrics) == len(expected_metrics) else "⚠️ PARTIAL",
                "message": f"Found {len(found_metrics)}/{len(expected_metrics)} metric cards: {', '.join(found_metrics)}"
            }
            
        except Exception as e:
            results["tests"]["key_metrics_cards"] = {
                "status": "❌ FAIL",
                "message": f"Error testing metric cards: {str(e)}"
            }
        
        # Test Filter Panel
        print("🎛️ Testing Filter Panel...")
        try:
            filter_panel = driver.find_elements(By.CSS_SELECTOR, "[data-testid='progress-filters-panel']")
            period_selector = driver.find_elements(By.CSS_SELECTOR, "[data-testid='progress-period-selector']")
            metric_selector = driver.find_elements(By.CSS_SELECTOR, "[data-testid='progress-metric-selector']")
            chart_type_selector = driver.find_elements(By.CSS_SELECTOR, "[data-testid='progress-chart-type-selector']")
            
            filters_found = {
                "filter_panel": len(filter_panel),
                "period_selector": len(period_selector),
                "metric_selector": len(metric_selector),
                "chart_type_selector": len(chart_type_selector)
            }
            
            filters_working = sum(1 for v in filters_found.values() if v > 0)
            
            results["tests"]["filter_panel"] = {
                "status": "✅ PASS" if filters_working >= 3 else "⚠️ PARTIAL" if filters_working > 0 else "❌ FAIL",
                "message": f"Filter components: {filters_found}"
            }
            
        except Exception as e:
            results["tests"]["filter_panel"] = {
                "status": "❌ FAIL",
                "message": f"Error testing filter panel: {str(e)}"
            }
        
        # Test Charts Grid
        print("📈 Testing Charts Grid...")
        try:
            charts_grid = driver.find_elements(By.CSS_SELECTOR, "[data-testid='progress-charts-grid']")
            main_chart = driver.find_elements(By.CSS_SELECTOR, "[data-testid='progress-main-chart']")
            emotional_chart = driver.find_elements(By.CSS_SELECTOR, "[data-testid='progress-emotional-chart']")
            game_performance_chart = driver.find_elements(By.CSS_SELECTOR, "[data-testid='progress-game-performance-chart']")
            engagement_chart = driver.find_elements(By.CSS_SELECTOR, "[data-testid='progress-engagement-chart']")
            activity_heatmap = driver.find_elements(By.CSS_SELECTOR, "[data-testid='progress-activity-heatmap']")
            insights_panel = driver.find_elements(By.CSS_SELECTOR, "[data-testid='progress-insights-panel']")
            
            chart_components = {
                "charts_grid": len(charts_grid),
                "main_chart": len(main_chart),
                "emotional_chart": len(emotional_chart),
                "game_performance_chart": len(game_performance_chart),
                "engagement_chart": len(engagement_chart),
                "activity_heatmap": len(activity_heatmap),
                "insights_panel": len(insights_panel)
            }
            
            charts_found = sum(1 for v in chart_components.values() if v > 0)
            
            results["tests"]["charts_grid"] = {
                "status": "✅ PASS" if charts_found >= 6 else "⚠️ PARTIAL" if charts_found >= 3 else "❌ FAIL",
                "message": f"Chart components: {chart_components}"
            }
            
        except Exception as e:
            results["tests"]["charts_grid"] = {
                "status": "❌ FAIL",
                "message": f"Error testing charts grid: {str(e)}"
            }
        
        # Test Filter Interactivity
        print("🎮 Testing Filter Interactivity...")
        try:
            interactions_tested = 0
            
            # Test period selector
            period_selectors = driver.find_elements(By.CSS_SELECTOR, "[data-testid='progress-period-selector']")
            if period_selectors:
                period_selector = period_selectors[0]
                original_value = period_selector.get_attribute('value')
                
                # Change value
                driver.execute_script("arguments[0].value = '7';", period_selector)
                driver.execute_script("arguments[0].dispatchEvent(new Event('change'));", period_selector)
                time.sleep(1)
                
                new_value = period_selector.get_attribute('value')
                if new_value == '7':
                    interactions_tested += 1
            
            # Test metric selector
            metric_selectors = driver.find_elements(By.CSS_SELECTOR, "[data-testid='progress-metric-selector']")
            if metric_selectors:
                metric_selector = metric_selectors[0]
                
                # Change value
                driver.execute_script("arguments[0].value = 'score';", metric_selector)
                driver.execute_script("arguments[0].dispatchEvent(new Event('change'));", metric_selector)
                time.sleep(1)
                
                new_value = metric_selector.get_attribute('value')
                if new_value == 'score':
                    interactions_tested += 1
            
            # Test chart type selector
            chart_type_selectors = driver.find_elements(By.CSS_SELECTOR, "[data-testid='progress-chart-type-selector']")
            if chart_type_selectors:
                chart_type_selector = chart_type_selectors[0]
                
                # Change value
                driver.execute_script("arguments[0].value = 'area';", chart_type_selector)
                driver.execute_script("arguments[0].dispatchEvent(new Event('change'));", chart_type_selector)
                time.sleep(1)
                
                new_value = chart_type_selector.get_attribute('value')
                if new_value == 'area':
                    interactions_tested += 1
            
            results["tests"]["filter_interactivity"] = {
                "status": "✅ PASS" if interactions_tested >= 2 else "⚠️ PARTIAL" if interactions_tested > 0 else "❌ FAIL",
                "message": f"Successfully tested {interactions_tested}/3 filter interactions"
            }
            
        except Exception as e:
            results["tests"]["filter_interactivity"] = {
                "status": "❌ FAIL",
                "message": f"Error testing filter interactivity: {str(e)}"
            }
        
        # Test Recharts Integration
        print("📊 Testing Recharts Integration...")
        try:
            recharts_wrappers = driver.find_elements(By.CSS_SELECTOR, ".recharts-wrapper")
            recharts_surfaces = driver.find_elements(By.CSS_SELECTOR, ".recharts-surface")
            svg_elements = driver.find_elements(By.CSS_SELECTOR, "svg")
            
            recharts_integration = {
                "recharts_wrappers": len(recharts_wrappers),
                "recharts_surfaces": len(recharts_surfaces),
                "svg_elements": len(svg_elements)
            }
            
            recharts_working = len(recharts_wrappers) > 0 or len(svg_elements) > 0
            
            results["tests"]["recharts_integration"] = {
                "status": "✅ PASS" if recharts_working else "❌ FAIL",
                "message": f"Recharts components: {recharts_integration}"
            }
            
        except Exception as e:
            results["tests"]["recharts_integration"] = {
                "status": "❌ FAIL",
                "message": f"Error testing Recharts integration: {str(e)}"
            }
        
        # Test Child Profile Integration
        print("👶 Testing Child Profile Integration...")
        try:
            driver.get("http://localhost:3000/parent/child/1")
            time.sleep(3)
            
            # Look for embedded progress charts
            embedded_charts = driver.find_elements(By.CSS_SELECTOR, "[data-testid='progress-charts-container']")
            progress_tabs = driver.find_elements(By.CSS_SELECTOR, "[role='tab'], [class*='tab']")
            
            progress_tab_found = False
            for tab in progress_tabs:
                if "progress" in tab.text.lower() or "progressi" in tab.text.lower():
                    progress_tab_found = True
                    # Click the progress tab
                    driver.execute_script("arguments[0].click();", tab)
                    time.sleep(2)
                    break
            
            results["tests"]["child_profile_integration"] = {
                "status": "✅ PASS" if embedded_charts or progress_tab_found else "⚠️ PARTIAL",
                "message": f"Embedded charts: {len(embedded_charts)}, Progress tab: {progress_tab_found}"
            }
            
        except Exception as e:
            results["tests"]["child_profile_integration"] = {
                "status": "❌ FAIL",
                "message": f"Error testing child profile integration: {str(e)}"
            }
        
        # Test Error Handling
        print("🔧 Testing Error Handling...")
        try:
            logs = driver.get_log('browser')
            js_errors = [log for log in logs if log['level'] == 'SEVERE' and 'prop' not in log['message'].lower()]
            
            results["tests"]["error_handling"] = {
                "status": "✅ PASS" if len(js_errors) == 0 else "⚠️ PARTIAL" if len(js_errors) < 3 else "❌ FAIL",
                "message": f"JavaScript errors (excluding prop warnings): {len(js_errors)}"
            }
            
        except Exception as e:
            results["tests"]["error_handling"] = {
                "status": "⚠️ PARTIAL",
                "message": f"Could not check console logs: {str(e)}"
            }
        
    except Exception as e:
        results["tests"]["general_error"] = {
            "status": "❌ FAIL",
            "message": f"General test error: {str(e)}"
        }
    
    finally:
        driver.quit()
    
    # Calculate summary
    total_tests = len(results["tests"])
    passed_tests = len([t for t in results["tests"].values() if t["status"].startswith("✅")])
    partial_tests = len([t for t in results["tests"].values() if t["status"].startswith("⚠️")])
    failed_tests = len([t for t in results["tests"].values() if t["status"].startswith("❌")])
    
    success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
    
    results["summary"] = {
        "total_tests": total_tests,
        "passed": passed_tests,
        "partial": partial_tests,
        "failed": failed_tests,
        "success_rate": f"{success_rate:.1f}%",
        "overall_status": "✅ SUCCESS" if success_rate >= 80 else "⚠️ GOOD" if success_rate >= 60 else "❌ NEEDS_WORK"
    }
    
    results["test_end_time"] = time.strftime("%Y-%m-%d %H:%M:%S")
    
    return results

if __name__ == "__main__":
    print("🧪 Starting Enhanced ProgressCharts Test Suite...")
    print("=" * 60)
    
    results = test_progress_charts_enhanced()
    
    # Print results
    print("\n📊 ENHANCED TEST RESULTS:")
    print("=" * 60)
    
    for test_name, test_result in results["tests"].items():
        print(f"{test_result['status']} {test_name}: {test_result['message']}")
    
    print("\n📈 SUMMARY:")
    print("=" * 60)
    summary = results["summary"]
    print(f"Total Tests: {summary['total_tests']}")
    print(f"Passed: {summary['passed']}")
    print(f"Partial: {summary['partial']}")
    print(f"Failed: {summary['failed']}")
    print(f"Success Rate: {summary['success_rate']}")
    print(f"Overall Status: {summary['overall_status']}")
    
    # Save results
    with open("progress_charts_enhanced_test_report.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📄 Detailed report saved to: progress_charts_enhanced_test_report.json")
    print("\n🎉 Enhanced test suite completed!")
