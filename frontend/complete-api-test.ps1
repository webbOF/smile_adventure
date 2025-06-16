# SMILE ADVENTURE - COMPLETE API VALIDATION SUITE
# Versione finale con formato login corretto
# Data: 16 giugno 2025

Write-Host "==================================================" -ForegroundColor Green
Write-Host "SMILE ADVENTURE - COMPLETE API VALIDATION SUITE" -ForegroundColor Green  
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""

$BASE_URL = "http://localhost:8000"
$API_URL = "$BASE_URL/api/v1"

$testResults = @{
    Total = 0
    Passed = 0
    Failed = 0
    Tests = @()
}

function Test-ApiEndpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Description,
        [hashtable]$Body = $null,
        [hashtable]$Headers = @{"Content-Type" = "application/json"},
        [string]$ContentType = "application/json",
        [string]$FormData = $null,
        [int[]]$ExpectedStatus = @(200, 201)
    )
    
    $testResults.Total++
    
    Write-Host "Test: $Description" -ForegroundColor Cyan
    Write-Host "   $Method $Endpoint" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = "$API_URL$Endpoint"
            Method = $Method
            Headers = $Headers
        }
        
        if ($FormData) {
            $params.Body = $FormData
            $params.ContentType = "application/x-www-form-urlencoded"
        } elseif ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
            $params.ContentType = $ContentType
        }
        
        $response = Invoke-WebRequest @params
        $statusCode = $response.StatusCode
        
        if ($statusCode -in $ExpectedStatus) {
            Write-Host "   SUCCESS ($statusCode)" -ForegroundColor Green
            $testResults.Passed++
            $result = @{ Success = $true; StatusCode = $statusCode; Content = $response.Content }
        } else {
            Write-Host "   UNEXPECTED STATUS ($statusCode)" -ForegroundColor Yellow
            $testResults.Failed++
            $result = @{ Success = $false; StatusCode = $statusCode; Content = $response.Content }
        }
        
        # Parse JSON se possibile
        try {
            $jsonContent = $response.Content | ConvertFrom-Json
            $result.Data = $jsonContent
            
            # Show key info only
            if ($jsonContent.user) {
                Write-Host "   User: $($jsonContent.user.email) [$($jsonContent.user.role)]" -ForegroundColor White
            }
            if ($jsonContent.token -and $jsonContent.token.access_token) {
                Write-Host "   Token: $($jsonContent.token.access_token.Substring(0,20))..." -ForegroundColor White
            }
            if ($jsonContent.message) {
                Write-Host "   Message: $($jsonContent.message)" -ForegroundColor White
            }
        } catch {
            # Not JSON, show first 100 chars
            $preview = $response.Content.Substring(0, [Math]::Min(100, $response.Content.Length))
            Write-Host "   Response: $preview..." -ForegroundColor White
        }
        
        $testResults.Tests += @{
            Name = $Description
            Status = "PASSED"
            StatusCode = $statusCode
        }
        
        return $result
        
    } catch {
        $testResults.Failed++
        $errorStatus = "Unknown"
        $errorContent = "No details"
        
        if ($_.Exception.Response) {
            $errorStatus = $_.Exception.Response.StatusCode
            try {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $errorContent = $reader.ReadToEnd()
                $reader.Close()
            } catch {}
        }
        
        if ($errorStatus -in $ExpectedStatus) {
            Write-Host "   EXPECTED ERROR ($errorStatus)" -ForegroundColor Yellow
            $testResults.Passed++
            $testResults.Failed--
        } else {
            Write-Host "   ERROR ($errorStatus)" -ForegroundColor Red
        }
        
        $testResults.Tests += @{
            Name = $Description
            Status = if ($errorStatus -in $ExpectedStatus) { "PASSED" } else { "FAILED" }
            StatusCode = $errorStatus
        }
        
        return @{ Success = $false; StatusCode = $errorStatus; Error = $errorContent }
    }
    
    Write-Host ""
}

# 1. HEALTH CHECK
Write-Host "1. HEALTH & STATUS CHECKS" -ForegroundColor Yellow
Write-Host "-------------------------" -ForegroundColor Yellow

Test-ApiEndpoint -Method "GET" -Endpoint "/health" -Description "Backend Health Check"

# 2. REGISTRATION TESTS
Write-Host "2. USER REGISTRATION" -ForegroundColor Yellow
Write-Host "--------------------" -ForegroundColor Yellow

# Generate random data for testing
$randomId = Get-Random -Maximum 999999
$timestamp = (Get-Date).ToString("HHmmss")

$parentData = @{
    email = "genitore.test.$randomId.$timestamp@famiglia.com"
    password = "FamigliaSecura2025!"
    password_confirm = "FamigliaSecura2025!"
    first_name = "Laura"
    last_name = "Verdi"
    role = "parent"
}

$regResult = Test-ApiEndpoint -Method "POST" -Endpoint "/auth/register" -Description "Register New Parent" -Body $parentData

$professionalData = @{
    email = "dottore.specialista.$randomId.$timestamp@clinica.com"
    password = "ClinicaForte2025!"
    password_confirm = "ClinicaForte2025!"
    first_name = "Dr. Alessandro"
    last_name = "Marchetti"
    role = "professional"
    license_number = "MD$randomId"
    specialization = "Odontoiatria Pediatrica"
    clinic_name = "Centro Sorriso Bambini"
}

$profRegResult = Test-ApiEndpoint -Method "POST" -Endpoint "/auth/register" -Description "Register New Professional" -Body $professionalData

# 3. LOGIN TESTS (formato corretto)
Write-Host "3. AUTHENTICATION LOGIN" -ForegroundColor Yellow
Write-Host "-----------------------" -ForegroundColor Yellow

$parentToken = $null
if ($regResult.Success) {
    $loginFormData = "username=$($parentData.email)&password=FamigliaSecura2025!"
    $loginResult = Test-ApiEndpoint -Method "POST" -Endpoint "/auth/login" -Description "Parent Login (Form)" -FormData $loginFormData
    
    if ($loginResult.Success -and $loginResult.Data.token.access_token) {
        $parentToken = $loginResult.Data.token.access_token
        Write-Host "   PARENT TOKEN SAVED FOR AUTHENTICATED TESTS" -ForegroundColor Green
    }
}

$profToken = $null
if ($profRegResult.Success) {
    $profLoginFormData = "username=$($professionalData.email)&password=ClinicaForte2025!"
    $profLoginResult = Test-ApiEndpoint -Method "POST" -Endpoint "/auth/login" -Description "Professional Login (Form)" -FormData $profLoginFormData
    
    if ($profLoginResult.Success -and $profLoginResult.Data.token.access_token) {
        $profToken = $profLoginResult.Data.token.access_token
        Write-Host "   PROFESSIONAL TOKEN SAVED FOR AUTHENTICATED TESTS" -ForegroundColor Green
    }
}

Write-Host ""

# 4. AUTHENTICATED ENDPOINTS - PARENT
Write-Host "4. PARENT AUTHENTICATED ENDPOINTS" -ForegroundColor Yellow
Write-Host "---------------------------------" -ForegroundColor Yellow

if ($parentToken) {
    $authHeaders = @{
        "Authorization" = "Bearer $parentToken"
        "Content-Type" = "application/json"
    }
    
    Test-ApiEndpoint -Method "GET" -Endpoint "/users/dashboard" -Description "Parent Dashboard" -Headers $authHeaders
    Test-ApiEndpoint -Method "GET" -Endpoint "/users/profile" -Description "Parent Profile" -Headers $authHeaders
    Test-ApiEndpoint -Method "GET" -Endpoint "/users/children" -Description "Parent Children List" -Headers $authHeaders
    Test-ApiEndpoint -Method "GET" -Endpoint "/reports/dashboard" -Description "Parent Reports Dashboard" -Headers $authHeaders
} else {
    Write-Host "   SKIPPED: No parent token available" -ForegroundColor Yellow
    Write-Host ""
}

# 5. AUTHENTICATED ENDPOINTS - PROFESSIONAL
Write-Host "5. PROFESSIONAL AUTHENTICATED ENDPOINTS" -ForegroundColor Yellow
Write-Host "---------------------------------------" -ForegroundColor Yellow

if ($profToken) {
    $profHeaders = @{
        "Authorization" = "Bearer $profToken"
        "Content-Type" = "application/json"
    }
    
    Test-ApiEndpoint -Method "GET" -Endpoint "/users/dashboard" -Description "Professional Dashboard" -Headers $profHeaders
    Test-ApiEndpoint -Method "GET" -Endpoint "/users/profile" -Description "Professional Profile" -Headers $profHeaders
    Test-ApiEndpoint -Method "GET" -Endpoint "/professional/profile" -Description "Professional Extended Profile" -Headers $profHeaders -ExpectedStatus @(200, 404, 422)
} else {
    Write-Host "   SKIPPED: No professional token available" -ForegroundColor Yellow
    Write-Host ""
}

# 6. ERROR HANDLING TESTS
Write-Host "6. ERROR HANDLING & VALIDATION" -ForegroundColor Yellow
Write-Host "-------------------------------" -ForegroundColor Yellow

# Test 404
Test-ApiEndpoint -Method "GET" -Endpoint "/nonexistent" -Description "404 Not Found Test" -ExpectedStatus @(404)

# Test invalid login
$badLoginFormData = "username=wrong@email.com&password=wrongpassword"
Test-ApiEndpoint -Method "POST" -Endpoint "/auth/login" -Description "Invalid Login Test" -FormData $badLoginFormData -ExpectedStatus @(401, 422)

# Test duplicate registration
if ($regResult.Success) {
    Test-ApiEndpoint -Method "POST" -Endpoint "/auth/register" -Description "Duplicate Email Test" -Body $parentData -ExpectedStatus @(400, 409)
}

# Test unauthorized access
Test-ApiEndpoint -Method "GET" -Endpoint "/users/dashboard" -Description "Unauthorized Access Test" -ExpectedStatus @(401, 403)

# FINAL SUMMARY
Write-Host "======================================" -ForegroundColor Green
Write-Host "FINAL TEST SUITE RESULTS" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host "Total Tests: $($testResults.Total)" -ForegroundColor White
Write-Host "Passed: $($testResults.Passed)" -ForegroundColor Green
Write-Host "Failed: $($testResults.Failed)" -ForegroundColor Red

$successRate = [math]::Round(($testResults.Passed / $testResults.Total) * 100, 1)
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } else { "Yellow" })

Write-Host ""
Write-Host "DETAILED RESULTS:" -ForegroundColor Cyan
$testResults.Tests | ForEach-Object {
    $color = if ($_.Status -eq "PASSED") { "Green" } else { "Red" }
    Write-Host "  $($_.Status): $($_.Name) [$($_.StatusCode)]" -ForegroundColor $color
}

Write-Host ""
Write-Host "🎯 BACKEND API VALIDATION COMPLETED!" -ForegroundColor Green
Write-Host "Backend URL: $BASE_URL" -ForegroundColor Cyan
Write-Host "Swagger UI: $BASE_URL/docs" -ForegroundColor Cyan
Write-Host "OpenAPI Spec: $BASE_URL/openapi.json" -ForegroundColor Cyan
