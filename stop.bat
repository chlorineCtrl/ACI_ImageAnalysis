@echo off
echo ======================================
echo Stopping YOLO Object Detection App
echo ======================================
echo.

docker compose down

echo.
echo Application stopped successfully!
echo.
echo To remove all data (including database), run:
echo   docker compose down -v
echo.
pause


