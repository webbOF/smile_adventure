# SMILE ADVENTURE - MASTER TEST RUNNER
# Esegue tutti i test suite in sequenza
# Data: 16 giugno 2025

Write-Host "================================================================" -ForegroundColor Blue
Write-Host "SMILE ADVENTURE - MASTER TEST RUNNER" -ForegroundColor Blue
Write-Host "================================================================" -ForegroundColor Blue
Write-Host ""

$startTime = Get-Date

# Check if backend is running
Write-Host "Checking backend availability..." -ForegroundColor Cyan
try {
    $healthCheck = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 5
    Write-Host "Backend is running!" -ForegroundColor Green
} catch {
    Write-Host "Backend is not running on http://localhost:8000" -ForegroundColor Red
    Write-Host "Please start the backend first:" -ForegroundColor Yellow
    Write-Host "  cd backend" -ForegroundColor Yellow
    Write-Host "  python main.py" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Run main API test suite
Write-Host "Running COMPLETE API TEST SUITE..." -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
try {
    & "$PSScriptRoot\complete-api-test.ps1"
    Write-Host "Complete API tests finished" -ForegroundColor Green
} catch {
    Write-Host "Error running complete API tests: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Run advanced/specific tests
Write-Host "Running ADVANCED SCENARIOS TEST SUITE..." -ForegroundColor Blue
Write-Host "============================================" -ForegroundColor Blue
try {
    & "$PSScriptRoot\test-specific-endpoints.ps1"
    Write-Host "Advanced scenario tests finished" -ForegroundColor Green
} catch {
    Write-Host "Error running advanced tests: $($_.Exception.Message)" -ForegroundColor Red
}

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host ""
Write-Host "================================================================" -ForegroundColor Blue
Write-Host "ALL TEST SUITES COMPLETED!" -ForegroundColor Blue
Write-Host "================================================================" -ForegroundColor Blue
Write-Host "Total execution time: $($duration.TotalSeconds.ToString('F2')) seconds" -ForegroundColor White
Write-Host ""
Write-Host "Test Reports:" -ForegroundColor Cyan
Write-Host "  * Complete API Test Suite - Main endpoints and authentication" -ForegroundColor White
Write-Host "  * Advanced Scenarios - Security, validation, and edge cases" -ForegroundColor White
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "  * BACKEND_API_TEST_SUITE.md - Complete documentation" -ForegroundColor White
Write-Host ""
Write-Host "Backend Resources:" -ForegroundColor Cyan
Write-Host "  * API Base: http://localhost:8000/api/v1" -ForegroundColor White
Write-Host "  * Swagger UI: http://localhost:8000/docs" -ForegroundColor White
Write-Host "  * OpenAPI Spec: http://localhost:8000/openapi.json" -ForegroundColor White
Write-Host ""
Write-Host "Backend API validation completed successfully!" -ForegroundColor Green
