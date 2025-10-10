# Quick Start Script for Law Firm Management System

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Law Firm Management System - Setup  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
node --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js not found. Please install Node.js v18+" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js installed" -ForegroundColor Green

# Check PostgreSQL
Write-Host "`nChecking PostgreSQL..." -ForegroundColor Yellow
psql --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  PostgreSQL not found. Please install PostgreSQL" -ForegroundColor Yellow
    Write-Host "   Download: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
} else {
    Write-Host "✅ PostgreSQL installed" -ForegroundColor Green
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  SETUP INSTRUCTIONS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n📊 Step 1: Database Setup" -ForegroundColor Yellow
Write-Host "   Run this SQL command in PostgreSQL:" -ForegroundColor White
Write-Host "   CREATE DATABASE lawfirm_db;" -ForegroundColor Gray

Write-Host "`n🔧 Step 2: Backend Setup" -ForegroundColor Yellow
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   npm install" -ForegroundColor Gray
Write-Host "   npm run db:generate" -ForegroundColor Gray
Write-Host "   npm run db:push" -ForegroundColor Gray
Write-Host "   npm run db:seed (optional)" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray

Write-Host "`n🎨 Step 3: Frontend Setup (in new terminal)" -ForegroundColor Yellow
Write-Host "   npm install" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  AUTOMATED SETUP (Y/N)?" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$response = Read-Host "`nWould you like to run automated setup? (Y/N)"

if ($response -eq 'Y' -or $response -eq 'y') {
    Write-Host "`n🚀 Starting automated setup..." -ForegroundColor Green
    
    # Backend setup
    Write-Host "`n📦 Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location -Path ".\backend"
    npm install
    
    Write-Host "`n🔨 Generating Prisma client..." -ForegroundColor Yellow
    npm run db:generate
    
    Write-Host "`n📊 Pushing schema to database..." -ForegroundColor Yellow
    Write-Host "⚠️  Make sure PostgreSQL is running and database 'lawfirm_db' exists" -ForegroundColor Yellow
    npm run db:push
    
    Write-Host "`n🌱 Seeding database..." -ForegroundColor Yellow
    npm run db:seed
    
    # Frontend setup
    Set-Location -Path ".."
    Write-Host "`n📦 Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
    
    Write-Host "`n✅ Setup complete!" -ForegroundColor Green
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  NEXT STEPS" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "`n1. Start backend:  cd backend && npm run dev" -ForegroundColor White
    Write-Host "2. Start frontend: npm run dev (in new terminal)" -ForegroundColor White
    Write-Host "3. Open browser:   http://localhost:3000" -ForegroundColor White
    Write-Host "`n📖 See CLIENT_MANAGEMENT_SETUP.md for details" -ForegroundColor Cyan
    
} else {
    Write-Host "`n📖 Please follow the manual steps above" -ForegroundColor Yellow
    Write-Host "   Or refer to CLIENT_MANAGEMENT_SETUP.md" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host ""
