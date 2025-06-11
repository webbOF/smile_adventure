# Cross-Platform Testing Infrastructure for Smile Adventure

This document explains how to use the cross-platform testing infrastructure developed for the Smile Adventure application.

## Overview

The testing infrastructure has been designed to work consistently across different operating systems (Windows, macOS, and Linux) by implementing platform-independent helpers and utilities.

## Key Components

1. `portable_test_helpers.py` - Core platform-agnostic utilities
2. `run_all_tests.py` - Comprehensive test runner
3. Updated test files with cross-platform compatibility

## How to Run Tests

### Option 1: Run All Tests

```bash
# Windows
python run_all_tests.py

# Linux/macOS
python3 run_all_tests.py
```

### Option 2: Run a Specific Test Category

```bash
# Run only frontend tests
python run_all_tests.py --category frontend

# Run only integration tests
python run_all_tests.py --category integration

# Available categories: frontend, backend, integration, validation
```

### Option 3: Run a Specific Test File

```bash
# Run a specific test file
python run_all_tests.py --test test_frontend_services.py
```

### Additional Options

- `--verbose` or `-v`: Show detailed test output
- `--skip-checks` or `-s`: Skip service and environment checks

## Platform-Specific Considerations

### Windows

- Automatically detects and uses npm.cmd instead of npm
- Handles Windows-specific path formats
- Works with PowerShell or Command Prompt

### Linux

- Adds necessary flags for headless Chrome testing
- Searches common Linux package installation paths
- Handles permission issues for WebDriver

### macOS

- Searches homebrew and standard macOS paths
- Handles macOS-specific WebDriver configuration

## Prerequisites

1. **Python 3.7+**: Required on all platforms
2. **Node.js/npm**: Required for frontend tests
3. **Chrome/Chromium**: Required for Selenium tests
4. **ChromeDriver**: Will be auto-detected if in PATH

## Troubleshooting

### WebDriver Issues

If you're experiencing WebDriver issues, you can install webdriver-manager:

```bash
pip install webdriver-manager
```

This will automatically manage the correct driver version for your browser.

### npm Not Found

If npm is not being found automatically, make sure it's installed and in your PATH. Alternatively, you can:

1. Install Node.js from https://nodejs.org/
2. Restart your terminal/command prompt
3. Try running tests again

### Connection Errors

If you see connection errors to localhost services, make sure:

1. The frontend is running (`npm start` in the frontend directory)
2. The backend is running (or use the mock backend)

## Adding New Tests

When adding new tests to the framework, ensure they:

1. Use `portable_test_helpers` for platform-specific operations
2. Handle paths using `os.path` or `pathlib.Path` for cross-platform compatibility
3. Add the test to the appropriate category in `run_all_tests.py`
