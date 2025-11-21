@echo off
echo ======================================
echo YOLO Object Detection - Quick Start
echo ======================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [OK] Docker is running
echo.

REM Check if .env file exists
if not exist ".env" (
    echo [WARNING] .env file not found!
    echo Creating .env from template...
    if exist "env.template" (
        copy "env.template" ".env" >nul
        echo.
        echo [ACTION REQUIRED] Please edit .env file and add your API keys:
        echo   1. SECRET_KEY - A long random string
        echo   2. GEMINI_API_KEY - Your Google Gemini API key
        echo.
        echo After editing .env, run this script again.
        echo.
        pause
        exit /b 1
    ) else (
        echo [ERROR] env.template not found!
        pause
        exit /b 1
    )
)

echo [OK] .env file found
echo.

REM Check if YOLO model exists
if not exist "backend\app\yolov8n.pt" (
    echo [ERROR] YOLO model file not found!
    echo Please ensure backend\app\yolov8n.pt exists.
    pause
    exit /b 1
)

echo [OK] YOLO model found
echo.

echo Starting application with Docker Compose...
echo This may take a few minutes on first run...
echo.

docker compose up --build

pause


