# 🧪 SMILE ADVENTURE - BACKEND API TEST SUITE
# Test completo delle rotte di autenticazione con PowerShell
# Data: 16 giugno 2025

Write-Host "🚀 SMILE ADVENTURE - Backend API Test Suite" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

$BASE_URL = "http://localhost:8000"
$API_URL = "$BASE_URL/api/v1"

# Funzione helper per fare richieste HTTP
function Invoke-ApiTest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Description,
        [hashtable]$Body = $null,
        [hashtable]$Headers = @{"Content-Type" = "application/json"}
    )
    
    Write-Host "📍 Test: $Description" -ForegroundColor Cyan
    Write-Host "   $Method $Endpoint" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = "$API_URL$Endpoint"
            Method = $Method
            Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-WebRequest @params
        
        $statusCode = $response.StatusCode
        $content = $response.Content
        
        if ($statusCode -ge 200 -and $statusCode -lt 300) {
            Write-Host "   ✅ SUCCESS ($statusCode)" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  WARNING ($statusCode)" -ForegroundColor Yellow
        }
        
        # Parse JSON se possibile
        try {
            $jsonContent = $content | ConvertFrom-Json
            Write-Host "   Response:" -ForegroundColor Gray
            $jsonContent | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor White
        } catch {
            Write-Host "   Response: $content" -ForegroundColor White
        }
        
        return @{
            Success = $true
            StatusCode = $statusCode
            Content = $content
            Data = $jsonContent
        }
        
    } catch {
        $errorDetails = $_.Exception.Message
        if ($_.Exception.Response) {
            $errorStatus = $_.Exception.Response.StatusCode
            $errorContent = ""
            try {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $errorContent = $reader.ReadToEnd()
                $reader.Close()
            } catch {}
            
            Write-Host "   ❌ ERROR ($errorStatus)" -ForegroundColor Red
            if ($errorContent) {
                try {
                    $errorJson = $errorContent | ConvertFrom-Json
                    Write-Host "   Error:" -ForegroundColor Gray
                    $errorJson | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Red
                } catch {
                    Write-Host "   Error: $errorContent" -ForegroundColor Red
                }
            }
        } else {
            Write-Host "   ❌ NETWORK ERROR: $errorDetails" -ForegroundColor Red
        }
        
        return @{
            Success = $false
            Error = $errorDetails
        }
    }
    
    Write-Host ""
}

# 🏥 1. HEALTH CHECK
Write-Host "🏥 1. TESTING HEALTH & STATUS" -ForegroundColor Yellow
Write-Host "------------------------------" -ForegroundColor Yellow

Invoke-ApiTest -Method "GET" -Endpoint "/health" -Description "Backend Health Check"

# 🔐 2. AUTHENTICATION ENDPOINTS
Write-Host "🔐 2. TESTING AUTHENTICATION" -ForegroundColor Yellow
Write-Host "-----------------------------" -ForegroundColor Yellow

# Test registrazione parent
$parentData = @{
    email = "test.parent@email.com"
    password = "TestPassword123!"
    password_confirm = "TestPassword123!"
    first_name = "Mario"
    last_name = "Rossi"
    role = "parent"
}

$regResult = Invoke-ApiTest -Method "POST" -Endpoint "/auth/register" -Description "Register New Parent" -Body $parentData

# Test registrazione professional
$professionalData = @{
    email = "test.doctor@clinic.com"
    password = "DoctorPass123!"
    password_confirm = "DoctorPass123!"
    first_name = "Dott. Maria"
    last_name = "Bianchi"
    role = "professional"
    license_number = "MD123456"
    specialization = "Pediatric Dentistry"
    clinic_name = "Smile Clinic"
}

$profResult = Invoke-ApiTest -Method "POST" -Endpoint "/auth/register" -Description "Register New Professional" -Body $professionalData

# Test login parent (se registrazione riuscita)
if ($regResult.Success) {
    $loginData = @{
        email = "test.parent@email.com"
        password = "TestPassword123!"
    }
    
    $loginResult = Invoke-ApiTest -Method "POST" -Endpoint "/auth/login" -Description "Parent Login" -Body $loginData
    
    # Se login riuscito, salva il token per test successivi
    if ($loginResult.Success -and $loginResult.Data.access_token) {
        $authToken = $loginResult.Data.access_token
        Write-Host "🔑 Token salvato per test autenticati" -ForegroundColor Green
        Write-Host ""
    }
}

# 👤 3. USER MANAGEMENT
Write-Host "👤 3. TESTING USER MANAGEMENT" -ForegroundColor Yellow
Write-Host "------------------------------" -ForegroundColor Yellow

# Test dashboard (richiede autenticazione)
if ($authToken) {
    $authHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $authToken"
    }
    
    Invoke-ApiTest -Method "GET" -Endpoint "/users/dashboard" -Description "User Dashboard (Authenticated)" -Headers $authHeaders
    Invoke-ApiTest -Method "GET" -Endpoint "/users/profile" -Description "User Profile (Authenticated)" -Headers $authHeaders
    Invoke-ApiTest -Method "GET" -Endpoint "/users/children" -Description "User Children List (Authenticated)" -Headers $authHeaders
} else {
    Write-Host "   ⚠️  SKIPPED: No auth token available" -ForegroundColor Yellow
    Write-Host ""
}

# 📊 4. REPORTS & ANALYTICS  
Write-Host "📊 4. TESTING REPORTS & ANALYTICS" -ForegroundColor Yellow
Write-Host "----------------------------------" -ForegroundColor Yellow

if ($authToken) {
    $authHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $authToken"
    }
    
    Invoke-ApiTest -Method "GET" -Endpoint "/reports/dashboard" -Description "Reports Dashboard (Authenticated)" -Headers $authHeaders
} else {
    Write-Host "   ⚠️  SKIPPED: No auth token available" -ForegroundColor Yellow
    Write-Host ""
}

# 🩺 5. PROFESSIONAL ENDPOINTS
Write-Host "🩺 5. TESTING PROFESSIONAL ENDPOINTS" -ForegroundColor Yellow
Write-Host "------------------------------------" -ForegroundColor Yellow

# Test login professional (se registrazione riuscita)
if ($profResult.Success) {
    $profLoginData = @{
        email = "test.doctor@clinic.com"
        password = "DoctorPass123!"
    }
    
    $profLoginResult = Invoke-ApiTest -Method "POST" -Endpoint "/auth/login" -Description "Professional Login" -Body $profLoginData
    
    if ($profLoginResult.Success -and $profLoginResult.Data.access_token) {
        $profToken = $profLoginResult.Data.access_token
        
        $profHeaders = @{
            "Content-Type" = "application/json"
            "Authorization" = "Bearer $profToken"
        }
        
        Invoke-ApiTest -Method "GET" -Endpoint "/professional/profile" -Description "Professional Profile" -Headers $profHeaders
        Invoke-ApiTest -Method "GET" -Endpoint "/professional/search" -Description "Search Professionals" -Headers $profHeaders
    }
} else {
    Write-Host "   ⚠️  SKIPPED: Professional registration failed" -ForegroundColor Yellow
    Write-Host ""
}

# 🧪 6. ERROR HANDLING TESTS
Write-Host "🧪 6. TESTING ERROR HANDLING" -ForegroundColor Yellow
Write-Host "-----------------------------" -ForegroundColor Yellow

# Test endpoint inesistente
Invoke-ApiTest -Method "GET" -Endpoint "/nonexistent" -Description "404 Error Test"

# Test login con credenziali sbagliate
$badLoginData = @{
    email = "wrong@email.com"
    password = "wrongpassword"
}

Invoke-ApiTest -Method "POST" -Endpoint "/auth/login" -Description "Invalid Login Test" -Body $badLoginData

# Test registrazione con email duplicata
if ($regResult.Success) {
    Invoke-ApiTest -Method "POST" -Endpoint "/auth/register" -Description "Duplicate Email Test" -Body $parentData
}

# 📋 SUMMARY
Write-Host "📋 TEST SUITE COMPLETION" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host "✅ Backend API Testing completato!" -ForegroundColor Green
Write-Host "🌐 Backend URL: $BASE_URL" -ForegroundColor Cyan
Write-Host "📡 API Base: $API_URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Per test manuali aggiuntivi:" -ForegroundColor Yellow
Write-Host "   - Apri browser su http://localhost:8000/docs (Swagger UI)" -ForegroundColor Gray
Write-Host "   - O usa Postman con la collection generata" -ForegroundColor Gray
Write-Host ""
