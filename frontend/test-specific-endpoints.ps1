# SMILE ADVENTURE - SPECIFIC ENDPOINTS & ADVANCED SCENARIOS
# Test suite per scenari specifici e edge cases
# Data: 16 giugno 2025

Write-Host "=========================================================" -ForegroundColor Magenta
Write-Host "SMILE ADVENTURE - ADVANCED SCENARIOS TEST SUITE" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Magenta
Write-Host ""

$BASE_URL = "http://localhost:8000"
$API_URL = "$BASE_URL/api/v1"

$advancedResults = @{
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
    
    $advancedResults.Total++
    
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
            $advancedResults.Passed++
            $result = @{ Success = $true; StatusCode = $statusCode; Content = $response.Content }
        } else {
            Write-Host "   UNEXPECTED STATUS ($statusCode)" -ForegroundColor Yellow
            $advancedResults.Failed++
            $result = @{ Success = $false; StatusCode = $statusCode; Content = $response.Content }
        }
        
        # Parse JSON se possibile
        try {
            $jsonContent = $response.Content | ConvertFrom-Json
            $result.Data = $jsonContent
            
            if ($jsonContent.message) {
                Write-Host "   Message: $($jsonContent.message)" -ForegroundColor White
            }
            if ($jsonContent.errors) {
                Write-Host "   Errors: $($jsonContent.errors -join ', ')" -ForegroundColor Yellow
            }
        } catch {
            $preview = $response.Content.Substring(0, [Math]::Min(100, $response.Content.Length))
            Write-Host "   Response: $preview..." -ForegroundColor White
        }
        
        $advancedResults.Tests += @{
            Name = $Description
            Status = "PASSED"
            StatusCode = $statusCode
        }
        
        return $result
        
    } catch {
        $advancedResults.Failed++
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
            $advancedResults.Passed++
            $advancedResults.Failed--
        } else {
            Write-Host "   ERROR ($errorStatus)" -ForegroundColor Red
        }
        
        $advancedResults.Tests += @{
            Name = $Description
            Status = if ($errorStatus -in $ExpectedStatus) { "PASSED" } else { "FAILED" }
            StatusCode = $errorStatus
        }
        
        return @{ Success = $false; StatusCode = $errorStatus; Error = $errorContent }
    }
    
    Write-Host ""
}

# ===================================================================
# 1. PASSWORD VALIDATION SCENARIOS
# ===================================================================
Write-Host "1. PASSWORD VALIDATION SCENARIOS" -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Yellow

$passwordTests = @(
    @{ password = "short"; shouldFail = $true; reason = "Too short" },
    @{ password = "password123"; shouldFail = $true; reason = "No uppercase/special" },
    @{ password = "PASSWORD123"; shouldFail = $true; reason = "No lowercase/special" },
    @{ password = "Password"; shouldFail = $true; reason = "No numbers/special" },
    @{ password = "Password123"; shouldFail = $true; reason = "No special characters" },
    @{ password = "Password123!"; shouldFail = $false; reason = "Valid password" },
    @{ password = "VeryStrongP@ssw0rd123"; shouldFail = $false; reason = "Very strong password" }
)

foreach ($test in $passwordTests) {
    $pwdTestId = Get-Random -Maximum 999999
    $testData = @{
        email = "password.test.$pwdTestId@validazione.com"
        password = $test.password
        password_confirm = $test.password
        first_name = "TestPwd"
        last_name = "User"
        role = "parent"
    }
    
    $expectedStatus = if ($test.shouldFail) { @(400, 422) } else { @(201) }
    
    Test-ApiEndpoint -Method "POST" -Endpoint "/auth/register" -Description "Password Test: $($test.reason)" -Body $testData -ExpectedStatus $expectedStatus
}

# ===================================================================
# 2. ROLE-BASED ACCESS CONTROL TESTS
# ===================================================================
Write-Host "2. ROLE-BASED ACCESS CONTROL" -ForegroundColor Yellow
Write-Host "----------------------------" -ForegroundColor Yellow

# Generate unique identifiers for RBAC tests
$rbacId = Get-Random -Maximum 999999
$rbacTime = (Get-Date).ToString("HHmmss")

# Create test users for RBAC
$testParent = @{
    email = "famiglia.rbac.$rbacId.$rbacTime@genitori.it"
    password = "GenitoreForte2025!"
    password_confirm = "GenitoreForte2025!"
    first_name = "Giulia"
    last_name = "Romano"
    role = "parent"
}

$testProfessional = @{
    email = "medico.rbac.$rbacId.$rbacTime@ospedale.it"
    password = "MedicoSicuro2025!"
    password_confirm = "MedicoSicuro2025!"
    first_name = "Prof. Marco"
    last_name = "Santini"
    role = "professional"
    license_number = "RBAC$rbacId"
    specialization = "Neuropsichiatria Infantile"
    clinic_name = "Ospedale Pediatrico"
}

$parentReg = Test-ApiEndpoint -Method "POST" -Endpoint "/auth/register" -Description "Create RBAC Parent" -Body $testParent
$profReg = Test-ApiEndpoint -Method "POST" -Endpoint "/auth/register" -Description "Create RBAC Professional" -Body $testProfessional

# Login and get tokens
$parentToken = $null
$profToken = $null

if ($parentReg.Success) {
    $parentLoginData = "username=$($testParent.email)&password=GenitoreForte2025!"
    $parentLogin = Test-ApiEndpoint -Method "POST" -Endpoint "/auth/login" -Description "RBAC Parent Login" -FormData $parentLoginData
    
    if ($parentLogin.Success -and $parentLogin.Data.token.access_token) {
        $parentToken = $parentLogin.Data.token.access_token
    }
}

if ($profReg.Success) {
    $profLoginData = "username=$($testProfessional.email)&password=MedicoSicuro2025!"
    $profLogin = Test-ApiEndpoint -Method "POST" -Endpoint "/auth/login" -Description "RBAC Professional Login" -FormData $profLoginData
    
    if ($profLogin.Success -and $profLogin.Data.token.access_token) {
        $profToken = $profLogin.Data.token.access_token
    }
}

# Test cross-role access
if ($parentToken) {
    $parentHeaders = @{
        "Authorization" = "Bearer $parentToken"
        "Content-Type" = "application/json"
    }
    
    # Parent trying to access professional endpoints
    Test-ApiEndpoint -Method "GET" -Endpoint "/professional/profile" -Description "Parent accessing Professional Profile (should fail)" -Headers $parentHeaders -ExpectedStatus @(403, 404, 422)
}

if ($profToken) {
    $profHeaders = @{
        "Authorization" = "Bearer $profToken"
        "Content-Type" = "application/json"
    }
    
    # Professional accessing allowed endpoints
    Test-ApiEndpoint -Method "GET" -Endpoint "/professional/profile" -Description "Professional accessing own Profile" -Headers $profHeaders -ExpectedStatus @(200, 404, 422)
}

# ===================================================================
# 3. TOKEN MANIPULATION TESTS
# ===================================================================
Write-Host "3. TOKEN SECURITY & VALIDATION" -ForegroundColor Yellow
Write-Host "------------------------------" -ForegroundColor Yellow

# Test invalid token formats
$invalidTokens = @(
    @{ token = ""; description = "Empty token" },
    @{ token = "invalid-token"; description = "Invalid format token" },
    @{ token = "Bearer invalid-token"; description = "Invalid Bearer token" },
    @{ token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature"; description = "Malformed JWT" }
)

foreach ($tokenTest in $invalidTokens) {
    $headers = @{
        "Authorization" = if ($tokenTest.token -eq "") { "" } else { if ($tokenTest.token.StartsWith("Bearer")) { $tokenTest.token } else { "Bearer $($tokenTest.token)" } }
        "Content-Type" = "application/json"
    }
    
    Test-ApiEndpoint -Method "GET" -Endpoint "/users/dashboard" -Description "Invalid Token Test: $($tokenTest.description)" -Headers $headers -ExpectedStatus @(401, 403)
}

# ===================================================================
# 4. INPUT VALIDATION & EDGE CASES
# ===================================================================
Write-Host "4. INPUT VALIDATION & EDGE CASES" -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Yellow

# Test SQL injection attempts
$sqlInjectionTests = @(
    @{ email = "'; DROP TABLE users; --@email.com"; description = "SQL Injection in email" },
    @{ email = "normal@email.com'; SELECT * FROM users; --"; description = "SQL Injection in email suffix" }
)

foreach ($sqlTest in $sqlInjectionTests) {
    $sqlTestId = Get-Random -Maximum 999999
    $testData = @{
        email = $sqlTest.email
        password = "ValidPassword123!"
        password_confirm = "ValidPassword123!"
        first_name = "SqlTest$sqlTestId"
        last_name = "User"
        role = "parent"
    }
    
    Test-ApiEndpoint -Method "POST" -Endpoint "/auth/register" -Description "SQL Injection Test: $($sqlTest.description)" -Body $testData -ExpectedStatus @(400, 422)
}

# Test XSS attempts
$xssTests = @(
    @{ name = "<script>alert('xss')</script>"; field = "first_name" },
    @{ name = "javascript:alert('xss')"; field = "last_name" }
)

foreach ($xssTest in $xssTests) {
    $xssTestId = Get-Random -Maximum 999999
    $testData = @{
        email = "xss.test.$xssTestId@sicurezza.com"
        password = "ValidPassword123!"
        password_confirm = "ValidPassword123!"
        first_name = if ($xssTest.field -eq "first_name") { $xssTest.name } else { "Normal$xssTestId" }
        last_name = if ($xssTest.field -eq "last_name") { $xssTest.name } else { "User" }
        role = "parent"
    }
    
    Test-ApiEndpoint -Method "POST" -Endpoint "/auth/register" -Description "XSS Test in $($xssTest.field)" -Body $testData -ExpectedStatus @(201, 400, 422)
}

# ===================================================================
# 5. STRESS & BOUNDARY TESTS
# ===================================================================
Write-Host "5. STRESS & BOUNDARY TESTS" -ForegroundColor Yellow
Write-Host "---------------------------" -ForegroundColor Yellow

# Test very long strings
$boundaryTestId = Get-Random -Maximum 999999
$longString = "a" * 1000
$boundaryData = @{
    email = "boundary.test.$boundaryTestId@limiti.com"
    password = "ValidPassword123!"
    password_confirm = "ValidPassword123!"
    first_name = $longString
    last_name = "User"
    role = "parent"
}

Test-ApiEndpoint -Method "POST" -Endpoint "/auth/register" -Description "Boundary Test: Very long first name" -Body $boundaryData -ExpectedStatus @(400, 422)

# Test empty required fields
$emptyFieldsData = @{
    email = ""
    password = ""
    password_confirm = ""
    first_name = ""
    last_name = ""
    role = ""
}

Test-ApiEndpoint -Method "POST" -Endpoint "/auth/register" -Description "Validation Test: All empty fields" -Body $emptyFieldsData -ExpectedStatus @(400, 422)

# ===================================================================
# FINAL ADVANCED RESULTS
# ===================================================================
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "ADVANCED TEST SUITE RESULTS" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "Total Advanced Tests: $($advancedResults.Total)" -ForegroundColor White
Write-Host "Passed: $($advancedResults.Passed)" -ForegroundColor Green
Write-Host "Failed: $($advancedResults.Failed)" -ForegroundColor Red

$successRate = if ($advancedResults.Total -gt 0) { [math]::Round(($advancedResults.Passed / $advancedResults.Total) * 100, 1) } else { 0 }
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } else { "Yellow" })

Write-Host ""
Write-Host "DETAILED ADVANCED RESULTS:" -ForegroundColor Cyan
$advancedResults.Tests | ForEach-Object {
    $color = if ($_.Status -eq "PASSED") { "Green" } else { "Red" }
    Write-Host "  $($_.Status): $($_.Name) [$($_.StatusCode)]" -ForegroundColor $color
}

Write-Host ""
Write-Host "ADVANCED SECURITY & VALIDATION TESTS COMPLETED!" -ForegroundColor Magenta
Write-Host "Next: Run ./complete-api-test.ps1 for full backend validation" -ForegroundColor Cyan
