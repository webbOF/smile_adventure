#!/usr/bin/env python3
"""
Setup testing environment for Smile Adventure
This script prepares the environment for testing across platforms
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

# Try to import portable helpers
try:
    from portable_test_helpers import detect_platform, find_npm_executable
    PORTABLE_HELPERS = True
except ImportError:
    PORTABLE_HELPERS = False

# Project paths
PROJECT_ROOT = Path(__file__).resolve().parent
FRONTEND_DIR = PROJECT_ROOT / "frontend"
BACKEND_DIR = PROJECT_ROOT / "backend"

def print_banner(text):
    """Print a formatted banner text"""
    width = 80
    print("\n" + "=" * width)
    print(f"{text}".center(width))
    print("=" * width + "\n")

def setup_python_dependencies():
    """Install Python dependencies needed for testing"""
    print_banner("INSTALLING PYTHON DEPENDENCIES")
    
    # Core testing requirements
    test_requirements = [
        "selenium",         # For UI testing
        "requests",         # For API testing
        "aiohttp",          # For async HTTP calls
        "webdriver-manager", # For WebDriver management
        "pytest",           # For unit testing
    ]
    
    # Install each requirement
    python_cmd = sys.executable
    for req in test_requirements:
        print(f"Installing {req}...")
        try:
            subprocess.run([python_cmd, "-m", "pip", "install", req], check=True)
            print(f"✅ Installed {req}")
        except subprocess.CalledProcessError:
            print(f"❌ Failed to install {req}")
    
    return True

def setup_frontend_dependencies():
    """Install frontend dependencies needed for testing"""
    print_banner("INSTALLING FRONTEND DEPENDENCIES")
    
    if not FRONTEND_DIR.exists():
        print(f"❌ Frontend directory not found: {FRONTEND_DIR}")
        return False
        
    # Change to frontend directory
    original_dir = os.getcwd()
    os.chdir(FRONTEND_DIR)
    
    try:
        # Find npm executable
        if PORTABLE_HELPERS:
            npm_cmd, npm_version, npm_found = find_npm_executable()
            if not npm_found:
                print("❌ npm not found, can't install frontend dependencies")
                return False
        else:
            # Fallback to simple detection
            npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
        
        # Install dependencies
        cmd_parts = npm_cmd.split() if " " in npm_cmd else [npm_cmd]
        print(f"Running '{npm_cmd} install'...")
        
        result = subprocess.run(cmd_parts + ["install"], 
                             capture_output=True, text=True, timeout=300)
                             
        if result.returncode != 0:
            print("❌ Failed to install frontend dependencies:")
            print(result.stderr)
            return False
        
        print("✅ Frontend dependencies installed")
        return True
        
    except Exception as e:
        print(f"❌ Error setting up frontend dependencies: {e}")
        return False
    finally:
        os.chdir(original_dir)
        
def setup_mock_backend():
    """Set up mock backend for testing"""
    print_banner("SETTING UP MOCK BACKEND")
    
    mock_backend_path = PROJECT_ROOT / "mock_backend_fixed.py"
    if not mock_backend_path.exists():
        print(f"❌ Mock backend file not found: {mock_backend_path}")
        return False
    
    # Make sure mock backend is executable
    try:
        if not sys.platform.startswith("win"):
            # Make executable on Unix-like systems
            os.chmod(mock_backend_path, 0o755)
        
        print("✅ Mock backend setup complete")
        print("To start mock backend, run:")
        
        if sys.platform == "win32":
            print("    python mock_backend_fixed.py")
        else:
            print("    python3 mock_backend_fixed.py")
            
        return True
    except Exception as e:
        print(f"❌ Error setting up mock backend: {e}")
        return False

def create_portable_test_helpers():
    """Create portable_test_helpers.py if it doesn't exist"""
    helpers_path = PROJECT_ROOT / "portable_test_helpers.py"
    
    if helpers_path.exists():
        print("✅ portable_test_helpers.py already exists")
        return True
    
    print("Creating portable_test_helpers.py...")
    
    # Helper script content (basic version)
    helpers_content = '''#!/usr/bin/env python3
"""
Portable test helpers for Smile Adventure
This module provides platform-independent utilities for testing
"""

import os
import sys
import subprocess
import platform
import shutil

def detect_platform():
    """Detect the current platform with more detail than sys.platform"""
    system = platform.system().lower()
    if system == "linux":
        return "linux"
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
        "win32": ["npm.cmd", "npm", "npx.cmd npm"],
        "darwin": ["npm", "/usr/local/bin/npm", "/opt/homebrew/bin/npm"],
        "linux": ["npm", "/usr/bin/npm", "/usr/local/bin/npm"],
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
            # Check if python is working
            proc = subprocess.run(
                [python_path, "--version"],
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
    # Try using PATH
    if browser_name == 'chrome':
        names = ['chromedriver', 'chromedriver.exe']
    else:
        return None, None, False
        
    # Check if driver is in PATH
    for name in names:
        driver_path = shutil.which(name)
        if driver_path:
            return driver_path, "unknown", True
                
    # Driver not found
    return None, None, False

def create_headless_chrome_options():
    """Create Chrome options suitable for headless CI/CD environments"""
    from selenium.webdriver.chrome.options import Options
    
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")
    
    return options
'''
    
    with open(helpers_path, "w") as f:
        f.write(helpers_content)
    
    print("✅ Created portable_test_helpers.py")
    return True

def setup_complete_environment():
    """Set up complete test environment"""
    print_banner("SMILE ADVENTURE TEST ENVIRONMENT SETUP")
    print(f"Platform: {platform.system()} {platform.release()}")
    print(f"Python: {platform.python_version()}")
    
    # Create portable test helpers first (needed by other steps)
    create_portable_test_helpers()
    
    # Run all setup steps
    steps = [
        ("Python dependencies", setup_python_dependencies),
        ("Frontend dependencies", setup_frontend_dependencies),
        ("Mock backend", setup_mock_backend),
    ]
    
    results = []
    for step_name, step_func in steps:
        print(f"\nSetting up {step_name}...")
        try:
            success = step_func()
            results.append((step_name, success))
        except Exception as e:
            print(f"❌ Error during {step_name} setup: {e}")
            results.append((step_name, False))
    
    # Print summary
    print_banner("SETUP SUMMARY")
    
    all_success = True
    for step_name, success in results:
        status = "✅ SUCCESS" if success else "❌ FAILED"
        print(f"{step_name.ljust(20)}: {status}")
        all_success = all_success and success
    
    if all_success:
        print("\n🎉 All components set up successfully!")
        print("\nYou can now run tests with:")
        print("  python run_all_tests.py")
    else:
        print("\n⚠️ Some components failed to set up")
        print("Please resolve the issues above and try again")
    
    return all_success

if __name__ == "__main__":
    setup_complete_environment()
