#!/usr/bin/env python3
"""
Portable test helpers for Smile Adventure
This module provides platform-independent utilities for testing
"""

import os
import sys
import subprocess
import shutil
import platform
from pathlib import Path

def detect_platform():
    """Detect the current platform with more detail than sys.platform"""
    system = platform.system().lower()
    if system == "linux":
        # Check for different Linux distributions
        try:
            with open("/etc/os-release") as f:
                os_info = {}
                for line in f:
                    if "=" in line:
                        key, value = line.rstrip().split("=", 1)
                        os_info[key] = value.strip('"')
                distro = os_info.get("ID", "unknown").lower()
                return f"linux-{distro}"
        except:
            return "linux-unknown"
    elif system == "darwin":
        return "macos"
    elif system == "windows":
        return "windows"
    else:
        return system

def find_npm_executable():
    """Find npm executable across different platforms
    Returns: (executable_path, version, success)
    """
    # Common search paths for npm by platform
    possible_locations = {
        "win32": [
            "npm.cmd",                      # Standard Windows PATH 
            "npm",                          # Alternative PATH
            "npx.cmd npm",                  # npx fallback
            "npx npm",                      # Another npx format
            r"C:\Program Files\nodejs\npm.cmd", 
            r"C:\Program Files (x86)\nodejs\npm.cmd",
            # Add user-specific locations
            os.path.expanduser("~\\AppData\\Roaming\\npm\\npm.cmd"),
            # Add NVM paths
            os.path.expanduser("~\\AppData\\Roaming\\nvm\\current\\npm.cmd"),
        ],
        "darwin": [  # macOS
            "npm",
            "/usr/local/bin/npm",
            "/opt/homebrew/bin/npm", 
            "/usr/bin/npm",
            "npx npm",
            # NVM or Node version managers
            os.path.expanduser("~/.nvm/current/bin/npm"),
            os.path.expanduser("~/.nvm/versions/node/*/bin/npm"),
        ],
        "linux": [
            "npm",
            "/usr/bin/npm",
            "/usr/local/bin/npm", 
            "npx npm",
            # NVM or Node version managers
            os.path.expanduser("~/.nvm/current/bin/npm"),
            os.path.expanduser("~/.nvm/versions/node/*/bin/npm"),
            # Add snap location
            "/snap/bin/npm",
        ]
    }
    
    # Get locations for current platform
    platform_options = possible_locations.get(sys.platform, possible_locations["linux"])
    
    # Try to find npm
    for npm_path in platform_options:
        try:
            # Split command for complex paths with spaces or arguments
            npm_parts = npm_path.split() if " " in npm_path else [npm_path]
            
            # Check if npm is working
            proc = subprocess.run(
                npm_parts + ["--version"],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if proc.returncode == 0:
                version = proc.stdout.strip()
                return npm_path, version, True
        except Exception:
            continue
            
    # No working npm found
    return None, None, False

def find_python_executable():
    """Find python executable across different platforms
    Returns: (executable_path, version, success)
    """
    # Common search paths for python by platform
    possible_names = ["python3", "python", sys.executable]
    
    # Try to find python
    for python_path in possible_names:
        try:
            # Split command for complex paths with spaces or arguments
            python_parts = python_path.split() if " " in python_path else [python_path]
            
            # Check if python is working
            proc = subprocess.run(
                python_parts + ["--version"],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if proc.returncode == 0:
                version = proc.stdout.strip()
                return python_path, version, True
        except Exception:
            continue
            
    # No working python found
    return None, None, False

def find_webdriver(browser_name='chrome'):
    """Find WebDriver executable for specified browser
    Returns: (executable_path, version, success)
    """
    browser_name = browser_name.lower()
    
    # Try using webdriver-manager if it's installed
    try:
        if browser_name == 'chrome':
            from webdriver_manager.chrome import ChromeDriverManager
            from selenium import webdriver
            driver_path = ChromeDriverManager().install()
            return driver_path, "managed", True
        elif browser_name == 'firefox':
            from webdriver_manager.firefox import GeckoDriverManager
            driver_path = GeckoDriverManager().install()
            return driver_path, "managed", True
        elif browser_name == 'edge':
            from webdriver_manager.microsoft import EdgeChromiumDriverManager
            driver_path = EdgeChromiumDriverManager().install()
            return driver_path, "managed", True
    except ImportError:
        # Webdriver manager not installed, try manual detection
        pass
    
    # Search in PATH
    if browser_name == 'chrome':
        names = ['chromedriver', 'chromedriver.exe']
    elif browser_name == 'firefox':
        names = ['geckodriver', 'geckodriver.exe']
    elif browser_name == 'edge':
        names = ['msedgedriver', 'msedgedriver.exe']
    else:
        return None, None, False
        
    # Check if driver is in PATH
    for name in names:
        driver_path = shutil.which(name)
        if driver_path:
            # Try to get version
            try:
                proc = subprocess.run(
                    [driver_path, "--version"],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                version = proc.stdout.strip() if proc.returncode == 0 else "unknown"
                return driver_path, version, True
            except Exception:
                return driver_path, "unknown", True
                
    # Driver not found
    return None, None, False

def create_headless_chrome_options():
    """Create Chrome options suitable for headless CI/CD environments with cross-platform support"""
    from selenium.webdriver.chrome.options import Options
    
    options = Options()
    
    # Universal options
    options.add_argument("--headless=new")  # New headless mode
    options.add_argument("--no-sandbox")  # Required for Linux without display
    options.add_argument("--disable-dev-shm-usage")  # Overcome limited resource problems
    options.add_argument("--disable-gpu")  # Applicable to windows os only
    options.add_argument("--disable-extensions")  # Disable extensions
    options.add_argument("--window-size=1920,1080")  # Set window size
    
    # Platform-specific options
    if sys.platform.startswith('linux'):
        options.add_argument("--disable-software-rasterizer")
        # Add fix for running in CI/CD environments
        options.add_argument("--disable-setuid-sandbox")
        options.add_argument("--disable-dev-tools")
    elif sys.platform.startswith('darwin'):  # macOS
        options.add_argument("--disable-web-security")
    
    return options

def create_chrome_driver(headless=False):
    """Create a Chrome WebDriver with appropriate configuration for the platform
    Returns: (driver, success)
    """
    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.service import Service
        
        # Find Chrome driver
        driver_path, driver_version, driver_found = find_webdriver('chrome')
        
        # Configure options based on headless mode
        if headless:
            options = create_headless_chrome_options()
        else:
            from selenium.webdriver.chrome.options import Options
            options = Options()
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument("--window-size=1920,1080")
            
            # Platform-specific options
            if sys.platform.startswith('linux'):
                options.add_argument("--disable-software-rasterizer")
                
        # Create service if driver path is found
        if driver_found:
            service = Service(executable_path=driver_path)
            driver = webdriver.Chrome(service=service, options=options)
        else:
            # Let Selenium find the driver automatically
            driver = webdriver.Chrome(options=options)
            
        return driver, True
        
    except Exception as e:
        print(f"Error creating Chrome driver: {e}")
        return None, False

if __name__ == "__main__":
    # Test utility functions if script is run directly
    print(f"Platform detected: {detect_platform()}")
    
    npm_path, npm_version, npm_found = find_npm_executable()
    print(f"npm found: {npm_found}")
    if npm_found:
        print(f"npm path: {npm_path}")
        print(f"npm version: {npm_version}")
    
    python_path, python_version, python_found = find_python_executable()
    print(f"python found: {python_found}")
    if python_found:
        print(f"python path: {python_path}")
        print(f"python version: {python_version}")
    
    chrome_path, chrome_version, chrome_found = find_webdriver('chrome')
    print(f"chromedriver found: {chrome_found}")
    if chrome_found:
        print(f"chromedriver path: {chrome_path}")
        print(f"chromedriver version: {chrome_version}")
