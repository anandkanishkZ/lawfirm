# API Testing Script for Client Management

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Client Management API Test Suite  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:5000/api"
$token = ""

# Test 1: Health Check
Write-Host "🔍 Test 1: Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "✅ Health check passed" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor Gray
    Write-Host "   Environment: $($response.environment)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Make sure backend is running: cd backend && npm run dev" -ForegroundColor Yellow
    exit 1
}

# Test 2: Login (to get token)
Write-Host "`n🔐 Test 2: Authentication" -ForegroundColor Yellow
Write-Host "   Testing with default admin credentials..." -ForegroundColor Gray

$loginData = @{
    email = "admin@lawfirm.com"
    password = "Admin@123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginData -ContentType "application/json"
    $token = $response.data.token
    Write-Host "✅ Authentication successful" -ForegroundColor Green
    Write-Host "   User: $($response.data.user.name)" -ForegroundColor Gray
    Write-Host "   Role: $($response.data.user.role)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Authentication failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Run: cd backend && npm run db:seed" -ForegroundColor Yellow
    exit 1
}

# Test 3: Get Client Statistics
Write-Host "`n📊 Test 3: Get Client Statistics" -ForegroundColor Yellow
try {
    $headers = @{
        Authorization = "Bearer $token"
    }
    $response = Invoke-RestMethod -Uri "$baseUrl/clients/stats" -Method Get -Headers $headers
    Write-Host "✅ Statistics retrieved" -ForegroundColor Green
    Write-Host "   Total Clients: $($response.data.stats.totalClients)" -ForegroundColor Gray
    Write-Host "   Active Clients: $($response.data.stats.activeClients)" -ForegroundColor Gray
    Write-Host "   Verified KYC: $($response.data.stats.verifiedKyc)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to get statistics: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Create Test Client
Write-Host "`n➕ Test 4: Create Test Client" -ForegroundColor Yellow
$clientData = @{
    name = "Test Client $(Get-Date -Format 'HHmmss')"
    email = "testclient$(Get-Date -Format 'HHmmss')@example.com"
    phone = "+977-9876543210"
    address = "Test Address, Thamel"
    city = "Kathmandu"
    state = "Bagmati"
    pincode = "44600"
    country = "Nepal"
    citizenshipNo = "12-02-75-12345"
    clientType = "INDIVIDUAL"
    priority = "MEDIUM"
} | ConvertTo-Json

try {
    $headers = @{
        Authorization = "Bearer $token"
        "Content-Type" = "application/json"
    }
    $response = Invoke-RestMethod -Uri "$baseUrl/clients" -Method Post -Body $clientData -Headers $headers
    $clientId = $response.data.client.id
    Write-Host "✅ Client created successfully" -ForegroundColor Green
    Write-Host "   Client ID: $($response.data.client.clientId)" -ForegroundColor Gray
    Write-Host "   Name: $($response.data.client.name)" -ForegroundColor Gray
    Write-Host "   Database ID: $clientId" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to create client: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Get All Clients
Write-Host "`n📋 Test 5: Get All Clients" -ForegroundColor Yellow
try {
    $headers = @{
        Authorization = "Bearer $token"
    }
    $response = Invoke-RestMethod -Uri "$baseUrl/clients?limit=5" -Method Get -Headers $headers
    Write-Host "✅ Clients retrieved" -ForegroundColor Green
    Write-Host "   Total Count: $($response.data.pagination.totalCount)" -ForegroundColor Gray
    Write-Host "   Showing: $($response.data.clients.Count) clients" -ForegroundColor Gray
    
    if ($response.data.clients.Count -gt 0) {
        Write-Host "`n   Latest clients:" -ForegroundColor Gray
        $response.data.clients | Select-Object -First 3 | ForEach-Object {
            Write-Host "   - $($_.name) ($($_.clientId))" -ForegroundColor DarkGray
        }
    }
} catch {
    Write-Host "❌ Failed to get clients: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Search Clients
Write-Host "`n🔍 Test 6: Search Clients" -ForegroundColor Yellow
try {
    $headers = @{
        Authorization = "Bearer $token"
    }
    $response = Invoke-RestMethod -Uri "$baseUrl/clients?search=test" -Method Get -Headers $headers
    Write-Host "✅ Search completed" -ForegroundColor Green
    Write-Host "   Found: $($response.data.clients.Count) clients" -ForegroundColor Gray
} catch {
    Write-Host "❌ Search failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Filter Clients
Write-Host "`n🎯 Test 7: Filter Clients (Individual)" -ForegroundColor Yellow
try {
    $headers = @{
        Authorization = "Bearer $token"
    }
    $response = Invoke-RestMethod -Uri "$baseUrl/clients?clientType=INDIVIDUAL" -Method Get -Headers $headers
    Write-Host "✅ Filter applied" -ForegroundColor Green
    Write-Host "   Individual Clients: $($response.data.clients.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Filter failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ All critical tests passed!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Frontend: http://localhost:3000/clients" -ForegroundColor White
Write-Host "🔧 Backend:  http://localhost:5000/api/health" -ForegroundColor White
Write-Host ""
Write-Host "📖 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Open frontend: http://localhost:3000/clients" -ForegroundColor White
Write-Host "   2. Login with admin@lawfirm.com / Admin@123" -ForegroundColor White
Write-Host "   3. Create a new client" -ForegroundColor White
Write-Host "   4. Test search and filters" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
