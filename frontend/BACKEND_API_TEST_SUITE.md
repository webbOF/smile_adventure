# SMILE ADVENTURE - BACKEND API TEST SUITE

## Overview
Questo test suite valida completamente tutte le API del backend Smile Adventure utilizzando chiamate HTTP dirette, evitando le complessità di integrazione Jest/React.

## Files Structure
```
frontend/
├── complete-api-test.ps1           # Suite completa PowerShell
├── test-specific-endpoints.ps1     # Test specifici per funzionalità avanzate
├── test-performance.ps1            # Test di performance (opzionale)
└── BACKEND_API_TEST_SUITE.md      # Questa documentazione
```

## Test Coverage

### 1. Health & Connectivity
- ✅ Backend health check (`/health`)
- ✅ API endpoint availability
- ✅ Base URL validation

### 2. Authentication & Registration
- ✅ Parent registration (`/auth/register`)
- ✅ Professional registration (`/auth/register`)
- ✅ Login with form-encoded data (`/auth/login`)
- ✅ Token extraction and validation
- ✅ Invalid credentials handling
- ✅ Duplicate email validation

### 3. Authenticated Parent Endpoints
- ✅ Parent dashboard (`/users/dashboard`)
- ✅ Parent profile (`/users/profile`)
- ✅ Children list (`/users/children`)
- ✅ Reports dashboard (`/reports/dashboard`)

### 4. Authenticated Professional Endpoints
- ✅ Professional dashboard (`/users/dashboard`)
- ✅ Professional profile (`/users/profile`)
- ✅ Extended professional profile (`/professional/profile`)

### 5. Error Handling & Edge Cases
- ✅ 404 errors on invalid endpoints
- ✅ 401 unauthorized access
- ✅ 422 validation errors
- ✅ Malformed requests

### 6. Advanced Scenarios (NEW)
- 🆕 Password validation scenarios
- 🆕 Token expiration simulation
- 🆕 Role-based access control
- 🆕 CORS validation
- 🆕 Rate limiting tests

## Usage

### Quick Test
```powershell
# Run complete test suite
./complete-api-test.ps1
```

### Advanced Testing
```powershell
# Run specific scenarios
./test-specific-endpoints.ps1

# Run performance tests
./test-performance.ps1
```

## Prerequisites

1. **Backend Running**: Ensure the backend is running on `http://localhost:8000`
   ```bash
   cd backend
   python main.py
   ```

2. **PowerShell Execution Policy**: If needed, allow script execution:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. **Clean Database** (Optional): For consistent results, start with a fresh database

## Expected Results

### Success Criteria
- **Health Check**: 200 OK
- **Registration**: 201 Created (new users) or 400/409 (duplicates)
- **Login**: 200 OK with valid token
- **Authenticated Endpoints**: 200 OK with valid Bearer token
- **Error Cases**: Appropriate 4xx status codes

### Performance Targets
- Health check: < 100ms
- Registration: < 500ms
- Login: < 300ms
- Dashboard loads: < 200ms

## Troubleshooting

### Common Issues

1. **Connection Refused**
   ```
   Solution: Ensure backend is running on port 8000
   ```

2. **401 Unauthorized**
   ```
   Solution: Check token format and Bearer prefix
   ```

3. **422 Validation Error**
   ```
   Solution: Verify request body format and required fields
   ```

4. **Form Data Issues**
   ```
   Solution: Ensure login uses application/x-www-form-urlencoded
   ```

## Integration with CI/CD

This test suite can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions step
- name: Backend API Tests
  run: |
    cd frontend
    powershell -File complete-api-test.ps1
```

## Extension Points

### Adding New Tests
1. Add new test function in `test-specific-endpoints.ps1`
2. Use the `Test-ApiEndpoint` helper function
3. Update this documentation

### Custom Assertions
```powershell
# Example custom validation
function Test-PasswordValidation {
    param([string]$password, [bool]$shouldPass)
    
    $body = @{ password = $password }
    $result = Test-ApiEndpoint -Method "POST" -Endpoint "/auth/validate-password" -Body $body
    
    if ($shouldPass -and $result.Success) {
        Write-Host "✅ Password validation passed as expected" -ForegroundColor Green
    } elseif (!$shouldPass -and !$result.Success) {
        Write-Host "✅ Password validation failed as expected" -ForegroundColor Green
    } else {
        Write-Host "❌ Unexpected password validation result" -ForegroundColor Red
    }
}
```

## Maintenance Notes

- Update test data when backend schemas change
- Add new endpoints as they're implemented
- Review and update expected status codes
- Monitor test execution time and add performance alerts

---

**Last Updated**: 16 Giugno 2025  
**Version**: 1.0  
**Maintainer**: Development Team
