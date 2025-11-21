# Stop YOLO Object Detection Application

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Stopping YOLO Object Detection App" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

docker compose down

Write-Host ""
Write-Host "Application stopped successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "To remove all data (including database), run:" -ForegroundColor Yellow
Write-Host "  docker compose down -v" -ForegroundColor White
Write-Host ""


