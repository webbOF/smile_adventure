# Test specifico per il login - Debug degli errori
Write-Host "DEBUG: Testing Login with detailed error info" -ForegroundColor Yellow

$BASE_URL = "http://localhost:8000"
$API_URL = "$BASE_URL/api/v1"

# Test login con dettagli errore
$loginData = @{
    email = "test.parent@email.com"
    password = "TestPassword123!"
}

Write-Host "Attempting login with data:" -ForegroundColor Cyan
$loginData | ConvertTo-Json | Write-Host

try {
    $response = Invoke-WebRequest -Uri "$API_URL/auth/login" -Method POST -Body ($loginData | ConvertTo-Json -Depth 10) -ContentType "application/json"
    
    Write-Host "SUCCESS: $($response.StatusCode)" -ForegroundColor Green
    $response.Content | Write-Host
    
} catch {
    Write-Host "ERROR Details:" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    
    # Leggi il contenuto dell'errore
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorContent = $reader.ReadToEnd()
        $reader.Close()
        
        Write-Host "Error Response:" -ForegroundColor Red
        Write-Host $errorContent -ForegroundColor Red
        
        # Prova a parsare come JSON
        try {
            $errorJson = $errorContent | ConvertFrom-Json
            Write-Host "Parsed Error:" -ForegroundColor Yellow
            $errorJson | ConvertTo-Json -Depth 5 | Write-Host
        } catch {
            Write-Host "Could not parse error as JSON" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "Let's also test the backend docs endpoint:" -ForegroundColor Cyan

try {
    $docsResponse = Invoke-WebRequest -Uri "$BASE_URL/docs" -Method GET
    Write-Host "Docs endpoint accessible: $($docsResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Docs endpoint error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Testing OpenAPI spec:" -ForegroundColor Cyan

try {
    $openApiResponse = Invoke-WebRequest -Uri "$BASE_URL/openapi.json" -Method GET
    Write-Host "OpenAPI spec accessible: $($openApiResponse.StatusCode)" -ForegroundColor Green
    
    # Parse and look for login endpoint details
    $openApi = $openApiResponse.Content | ConvertFrom-Json
    
    if ($openApi.paths."/api/v1/auth/login") {
        Write-Host "Login endpoint found in OpenAPI spec:" -ForegroundColor Green
        $loginSpec = $openApi.paths."/api/v1/auth/login"
        $loginSpec | ConvertTo-Json -Depth 10 | Write-Host
    }
    
} catch {
    Write-Host "OpenAPI spec error: $($_.Exception.Message)" -ForegroundColor Red
}
