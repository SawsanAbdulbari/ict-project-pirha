@echo off
:: PIRHA Rehabilitation Guide - Setup Script for Windows
:: This script sets up the development environment and installs all dependencies

echo.
echo 🏥 PIRHA Rehabilitation Guide - Setup Script
echo =============================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected: 
node --version

:: Check if pnpm is installed
pnpm --version >nul 2>&1
if %errorlevel% equ 0 (
    set PACKAGE_MANAGER=pnpm
    echo ✅ pnpm detected
    pnpm --version
) else (
    set PACKAGE_MANAGER=npm
    echo ⚠️  pnpm not found, using npm (consider installing pnpm for better performance)
    echo    Install pnpm: npm install -g pnpm
)

echo.
echo 🔧 Installing dependencies...
echo ================================

:: Install dependencies
if "%PACKAGE_MANAGER%"=="pnpm" (
    pnpm install
) else (
    npm install
)

if %errorlevel% neq 0 (
    echo.
    echo ❌ Failed to install dependencies. Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo ✅ Dependencies installed successfully!
echo.
echo 🚀 Setup complete! You can now:
echo ================================
echo.
echo   Development server:
if "%PACKAGE_MANAGER%"=="pnpm" (
    echo     pnpm dev
) else (
    echo     npm run dev
)
echo.
echo   Production build:
if "%PACKAGE_MANAGER%"=="pnpm" (
    echo     pnpm build
) else (
    echo     npm run build
)
echo.
echo   Preview build:
if "%PACKAGE_MANAGER%"=="pnpm" (
    echo     pnpm preview
) else (
    echo     npm run preview
)
echo.

:: Ask if user wants to start development server
set /p START_DEV="Start development server now? (y/n): "
if /i "%START_DEV%"=="y" (
    echo.
    echo Starting development server...
    echo Press Ctrl+C to stop the server
    echo.
    if "%PACKAGE_MANAGER%"=="pnpm" (
        pnpm dev
    ) else (
        npm run dev
    )
)

echo.
echo 🎉 Ready to develop! Happy coding!
pause