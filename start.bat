@echo off
echo Starting CommuniSense Backend...
start cmd /k "cd backend && call venv\Scripts\activate.bat && uvicorn main:app --reload"

echo Starting CommuniSense Frontend...
start cmd /k "npm run dev"

echo Both servers are starting in separate windows!
echo Feel free to close this window.
pause
