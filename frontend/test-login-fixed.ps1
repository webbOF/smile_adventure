# Test login con formato corretto (form-urlencoded)
Write-Host "Testing Login with correct format (form-urlencoded)" -ForegroundColor Yellow

$BASE_URL = "http://localhost:8000"
$API_URL = "$BASE_URL/api/v1"

# Formato corretto per il login (form-urlencoded)
$formData = "username=test.parent@email.com&password=TestPassword123!"

Write-Host "Attempting login with form data:" -ForegroundColor Cyan
Write-Host $formData

try {
    $response = Invoke-WebRequest -Uri "$API_URL/auth/login" -Method POST -Body $formData -ContentType "application/x-www-form-urlencoded"
    
    Write-Host "SUCCESS: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    $response.Content | Write-Host
    
    # Parse JSON response
    $loginResult = $response.Content | ConvertFrom-Json
    if ($loginResult.access_token) {
        Write-Host ""
        Write-Host "ACCESS TOKEN OBTAINED!" -ForegroundColor Green
        Write-Host "Token: $($loginResult.access_token.Substring(0,20))..." -ForegroundColor Cyan
        
        # Test an authenticated endpoint
        Write-Host ""
        Write-Host "Testing authenticated endpoint with token..." -ForegroundColor Yellow
        
        $authHeaders = @{
            "Authorization" = "Bearer $($loginResult.access_token)"
        }
        
        $dashResponse = Invoke-WebRequest -Uri "$API_URL/users/dashboard" -Method GET -Headers $authHeaders
        Write-Host "Dashboard SUCCESS: $($dashResponse.StatusCode)" -ForegroundColor Green
        Write-Host "Dashboard Response:" -ForegroundColor Green
        $dashResponse.Content | Write-Host
    }
    
} catch {
    Write-Host "ERROR Details:" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorContent = $reader.ReadToEnd()
        $reader.Close()
        
        Write-Host "Error Response:" -ForegroundColor Red
        Write-Host $errorContent -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Testing professional login too..." -ForegroundColor Yellow

$profFormData = "username=test.doctor@clinic.com&password=DoctorPass123!"

try {
    $profResponse = Invoke-WebRequest -Uri "$API_URL/auth/login" -Method POST -Body $profFormData -ContentType "application/x-www-form-urlencoded"
    
    Write-Host "PROFESSIONAL LOGIN SUCCESS: $($profResponse.StatusCode)" -ForegroundColor Green
    
    $profResult = $profResponse.Content | ConvertFrom-Json
    if ($profResult.access_token) {
        Write-Host "Professional token obtained!" -ForegroundColor Green
        
        # Test professional endpoint
        $profHeaders = @{
            "Authorization" = "Bearer $($profResult.access_token)"
        }
        
        try {
            $profDashResponse = Invoke-WebRequest -Uri "$API_URL/users/dashboard" -Method GET -Headers $profHeaders
            Write-Host "Professional Dashboard SUCCESS: $($profDashResponse.StatusCode)" -ForegroundColor Green
            Write-Host "Professional Dashboard Response:" -ForegroundColor Green
            $profDashResponse.Content | Write-Host
        } catch {
            Write-Host "Professional dashboard error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
} catch {
    Write-Host "Professional login error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorContent = $reader.ReadToEnd()
        $reader.Close()
        Write-Host $errorContent -ForegroundColor Red
    }
}
