@echo off
setlocal

echo ==========================================
echo   CommuniSense - Startup 🚀
echo ==========================================

REM Check for environment variables
if "%GEMINI_API_KEY%"=="" (
    if "%GOOGLE_API_KEY%"=="" (
        echo [WARNING] GEMINI_API_KEY or GOOGLE_API_KEY is not set!
        echo The system will start, but moderation inference may fail.
        echo.
    )
)

echo Starting CommuniSense Backend...
REM Open backend in a new window: enters folder, activates venv (or creates it if missing), installs reqs, and runs
start "CommuniSense Backend" cmd /k "cd backend && (if not exist venv (echo Creating venv... && python -m venv venv)) && call venv\Scripts\activate.bat && pip install -r requirements.txt && playwright install chromium && uvicorn main:app --reload"

echo Starting CommuniSense Frontend...
REM Open frontend in a new window
start "CommuniSense Frontend" cmd /k "npm install && npm run dev"

echo.
echo ==========================================
echo Backend (Port 8000) and Frontend (Port 3000) are launching...
echo Close this window once they are both running.
echo ==========================================
pause
