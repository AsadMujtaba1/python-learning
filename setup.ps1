# Cost Saver App - Installation Script
# Run this script to set up your project

Write-Host "🚀 Cost Saver App - Setup Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Node.js is installed
Write-Host "✓ Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  Node.js $nodeVersion installed" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Node.js not found. Please install Node.js from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Step 2: Install dependencies
Write-Host ""
Write-Host "✓ Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "  ✓ Dependencies installed successfully" -ForegroundColor Green

# Step 3: Install Firebase
Write-Host ""
Write-Host "✓ Installing Firebase..." -ForegroundColor Yellow
npm install firebase

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ⚠ Warning: Failed to install Firebase. You can install it manually later with: npm install firebase" -ForegroundColor Yellow
} else {
    Write-Host "  ✓ Firebase installed successfully" -ForegroundColor Green
}

# Step 4: Create .env.local from .env.example
Write-Host ""
Write-Host "✓ Setting up environment variables..." -ForegroundColor Yellow

if (Test-Path .env.local) {
    Write-Host "  ⚠ .env.local already exists. Skipping..." -ForegroundColor Yellow
} else {
    if (Test-Path .env.example) {
        Copy-Item .env.example .env.local
        Write-Host "  ✓ Created .env.local from template" -ForegroundColor Green
        Write-Host "  ⚠ IMPORTANT: Edit .env.local and add your API keys!" -ForegroundColor Yellow
    } else {
        Write-Host "  ⚠ .env.example not found. You'll need to create .env.local manually" -ForegroundColor Yellow
    }
}

# Step 5: Summary
Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "✓ Setup Complete!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Edit .env.local and add your API keys:" -ForegroundColor White
Write-Host "   - Firebase: Get from https://console.firebase.google.com" -ForegroundColor Gray
Write-Host "   - OpenWeather: Get from https://openweathermap.org/api" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Run the development server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Open your browser:" -ForegroundColor White
Write-Host "   http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - README.md        : Complete documentation" -ForegroundColor Gray
Write-Host "   - SETUP_GUIDE.md   : Quick start guide" -ForegroundColor Gray
Write-Host "   - .env.example     : Environment variables template" -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 Happy coding!" -ForegroundColor Green
