@echo off
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
  echo Python was not found. Install Python 3.11 or later from python.org and add it to PATH.
  pause
  exit /b 1
)
if not exist .venv (python -m venv .venv)
call .venv\Scripts\activate.bat
python -m pip install -r requirements.txt
if errorlevel 1 (
  echo Dependency installation failed.
  pause
  exit /b 1
)
echo.
echo AgentVerse starts at http://127.0.0.1:8000
start "" http://127.0.0.1:8000
python -m uvicorn agentverse.app:app --host 127.0.0.1 --port 8000
pause
