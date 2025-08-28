@echo off
echo Starting Airline Invoice Workflow Application...
echo.

echo Starting Backend Server...
cd backend
start "Backend Server" cmd /k "pip install -r requirements.txt && uvicorn app:app --reload --host 0.0.0.0 --port 8000"

echo.
echo Starting Frontend Server...
cd ../frontend
start "Frontend Server" cmd /k "npm install && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit this window...
pause > nul 