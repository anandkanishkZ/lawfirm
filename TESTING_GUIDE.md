# 🧪 Testing Guide: Backend API Integration

This guide will help you test the integrated backend authentication system.

## 🚀 Quick Start Testing

### 1. Backend Health Check
```bash
# Test if backend is running
curl http://localhost:5000/api/health

# Expected response:
# {
#   "status": "success",
#   "message": "Law Firm Management API is running",
#   "timestamp": "2025-10-09T16:22:52.787Z",
#   "environment": "development"
# }
```

### 2. Frontend Access
Open your browser and go to: `http://localhost:3000`

You should see the Law Firm Management System login page.

## 🔐 Authentication Testing

### Test Accounts
Use these pre-seeded accounts to test the system:

| Role   | Email                | Password  | Access Level |
|--------|---------------------|-----------|--------------|
| Admin  | admin@lawfirm.com   | password  | Full access  |
| Lawyer | lawyer@lawfirm.com  | password  | Case management |
| Staff  | staff@lawfirm.com   | password  | Limited access |
| Client | client@example.com  | password  | View only |

### Manual Testing Steps

1. **Login Test**
   - Go to `http://localhost:3000`
   - Try logging in with: `admin@lawfirm.com` / `password`
   - Should redirect to dashboard on success

2. **Invalid Login Test**
   - Try with wrong password
   - Should show error message
   - Should not redirect

3. **Dashboard Access Test**
   - After successful login, check if user data displays correctly
   - User name and role should match the logged-in account

4. **Logout Test**
   - Click logout
   - Should redirect to login page
   - Should clear authentication state

## 🔧 API Testing with PowerShell

### Test User Registration
```powershell
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "TestPassword123"
    role = "CLIENT"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

### Test User Login
```powershell
$loginData = @{
    email = "admin@lawfirm.com"
    password = "password"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
$token = $response.data.token
Write-Host "Token: $token"
```

### Test Protected Endpoint
```powershell
# Use the token from login response
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" -Method GET -Headers $headers
```

## 🐛 Troubleshooting

### Common Issues

#### 1. CORS Errors
**Problem:** Browser shows CORS policy errors
**Solution:** 
- Ensure backend is running on port 5000
- Check `.env` file has correct `FRONTEND_URL=http://localhost:3000`

#### 2. Database Connection Errors
**Problem:** Backend shows database connection errors
**Solution:**
- Ensure PostgreSQL is running
- Check database credentials in `backend/.env`
- Verify database `lawfirm_db` exists

#### 3. Token/Authentication Issues
**Problem:** Login works but user data doesn't load
**Solution:**
- Check browser developer tools for API errors
- Verify token is being stored in localStorage
- Check backend logs for authentication errors

#### 4. Network Errors
**Problem:** Frontend can't connect to backend
**Solution:**
- Verify backend is running: `http://localhost:5000/api/health`
- Check firewall settings
- Ensure no other service is using port 5000

### Debug Commands

```bash
# Check if ports are in use
netstat -an | findstr :3000
netstat -an | findstr :5000

# Check backend logs
# (Backend logs appear in the terminal where you ran `npm run dev`)

# Check frontend logs
# (Frontend logs appear in browser developer tools console)
```

## 📊 Expected Behavior

### Successful Login Flow
1. User enters valid credentials
2. Frontend sends POST request to `/api/auth/login`
3. Backend validates credentials against database
4. Backend returns user data and JWT token
5. Frontend stores token and user data
6. Frontend redirects to dashboard
7. Dashboard displays user-specific content

### Error Handling
- Invalid credentials → Show error message
- Network issues → Show connection error
- Server errors → Show generic error message
- Token expiry → Auto-redirect to login

## 🔄 Next Steps After Successful Testing

Once authentication is working properly, the next modules to implement would be:

1. **Case Management API**
   - CRUD operations for cases
   - Case assignment and status updates
   
2. **Client Management API**
   - Client registration and KYC
   - Document upload for clients

3. **Document Management API**
   - File upload and storage
   - Document categorization and search

4. **Calendar/Hearing Management API**
   - Hearing scheduling
   - Calendar integration

## 📈 Performance Testing

### Load Testing (Optional)
```bash
# Install artillery for load testing
npm install -g artillery

# Create a simple load test
artillery quick --count 10 --num 5 http://localhost:5000/api/health
```

## 🔐 Security Testing

### Basic Security Checks
1. Test SQL injection protection (try malicious inputs)
2. Test XSS protection (try script tags in inputs)
3. Test rate limiting (try multiple rapid requests)
4. Test JWT token validation (try modified tokens)

---

**✅ Success Criteria:** 
- All four test accounts can login successfully
- Dashboard loads with correct user information
- Logout works properly
- Error messages display for invalid credentials
- No console errors in browser developer tools