# 🚀 SMILE ADVENTURE - QUICK TEST REFERENCE

## ⚡ Quick Commands

### Run All Tests
```powershell
cd frontend
.\run-all-backend-tests.ps1
```

### Individual Test Suites
```powershell
# Main API endpoints (16 test)
.\complete-api-test.ps1

# Advanced security scenarios (23 test)  
.\test-specific-endpoints.ps1
```

### Start Backend
```bash
cd backend
python main.py
```

## 📊 Current Status

✅ **ALL TESTS PASSING**: 39/39 (100%)
- Main API: 16/16 ✅
- Advanced: 23/23 ✅

## 🔗 Quick Links

- **Swagger UI**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **API Base**: http://localhost:8000/api/v1

## 📋 Test Categories

| Category | Tests | Status |
|----------|-------|--------|
| Authentication | 6 | ✅ 100% |
| Registration | 4 | ✅ 100% |
| Password Security | 7 | ✅ 100% |
| RBAC | 6 | ✅ 100% |
| Token Security | 4 | ✅ 100% |
| Input Validation | 6 | ✅ 100% |
| Error Handling | 6 | ✅ 100% |

## 🛠️ Prerequisites

1. ✅ Backend running on port 8000
2. ✅ PowerShell execution policy set
3. ✅ Clean database (optional, for consistent results)

## 🔧 Troubleshooting

### Common Issues
- **Connection refused**: Start backend first
- **401 Unauthorized**: Check token format
- **422 Validation**: Verify request body
- **Encoding issues**: Use ASCII-only characters

---
**Last Updated**: 16 Giugno 2025 | **Version**: 1.0 | **Status**: PRODUCTION READY ✅
