# Cost Saver App - Quick Start Script for PowerShell
# Right-click and "Run with PowerShell" or run: .\START_APP.ps1

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Starting Cost Saver App..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to script directory
Set-Location $PSScriptRoot

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: package.json not found!" -ForegroundColor Red
    Write-Host "Please make sure this script is in the cost-saver-app folder." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Kill any process using port 3000
Write-Host "Checking for existing server on port 3000..." -ForegroundColor Yellow
try {
    $connection = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($connection) {
        $processId = $connection.OwningProcess
        Write-Host "Stopping existing server (PID: $processId)..." -ForegroundColor Yellow
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
    }
} catch {
    # Port not in use, continue
}

Write-Host ""
Write-Host "Starting development server..." -ForegroundColor Green
Write-Host "The app will open at: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
npm run dev

# If npm run dev fails
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Failed to start server!" -ForegroundColor Red
    Write-Host "Please check that Node.js and npm are installed." -ForegroundColor Red
    Read-Host "Press Enter to exit"
}
