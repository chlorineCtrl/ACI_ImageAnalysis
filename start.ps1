# YOLO Object Detection - Quick Start Script for PowerShell

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "YOLO Object Detection - Quick Start" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Docker not running"
    }
    Write-Host "[OK] Docker is running" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "[WARNING] .env file not found!" -ForegroundColor Yellow
    Write-Host "Creating .env from template..." -ForegroundColor Yellow
    
    if (Test-Path "env.template") {
        Copy-Item "env.template" ".env"
        Write-Host ""
        Write-Host "[ACTION REQUIRED] Please edit .env file and add your API keys:" -ForegroundColor Yellow
        Write-Host "  1. SECRET_KEY - A long random string" -ForegroundColor White
        Write-Host "  2. GEMINI_API_KEY - Your Google Gemini API key" -ForegroundColor White
        Write-Host ""
        Write-Host "After editing .env, run this script again." -ForegroundColor Yellow
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    } else {
        Write-Host "[ERROR] env.template not found!" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host "[OK] .env file found" -ForegroundColor Green
Write-Host ""

# Check if YOLO model exists
if (-not (Test-Path "backend\app\yolov8n.pt")) {
    Write-Host "[ERROR] YOLO model file not found!" -ForegroundColor Red
    Write-Host "Please ensure backend\app\yolov8n.pt exists." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[OK] YOLO model found" -ForegroundColor Green
Write-Host ""

Write-Host "Starting application with Docker Compose..." -ForegroundColor Cyan
Write-Host "This may take a few minutes on first run..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Once started, access the application at:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "  API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the application" -ForegroundColor Yellow
Write-Host ""

docker compose up --build


