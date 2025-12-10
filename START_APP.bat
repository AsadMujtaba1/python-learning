@echo off
REM Cost Saver App - Quick Start Script
REM Double-click this file to start the app

echo.
echo ================================================
echo   Starting Cost Saver App...
echo ================================================
echo.

cd /d "%~dp0"

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Please make sure this script is in the cost-saver-app folder.
    pause
    exit /b 1
)

REM Kill any process on port 3000
echo Checking for existing server on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    echo Stopping existing server (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo Starting development server...
echo.

REM Start the server
call npm run dev

REM If npm run dev fails
if errorlevel 1 (
    echo.
    echo ERROR: Failed to start server!
    echo Please check that Node.js and npm are installed.
    pause
)
