@echo off
REM SunGazer Setup Script for Windows

echo Setting up SunGazer...

REM Check Node.js
echo Checking Node.js version...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)
echo Node.js version:
node -v

REM Install dependencies
echo Installing dependencies...
call npm install

REM Create .env if it doesn't exist
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo .env file created
) else (
    echo .env file already exists
)

REM Create necessary directories
if not exist dist mkdir dist
if not exist build mkdir build

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Configure your backend URL in .env
echo 2. Run 'npm run dev' to start development server
echo 3. Run 'npm run electron:dev' to start Electron app
echo.
echo For more information, see README.md or QUICKSTART.md

