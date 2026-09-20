@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Нужен Node.js, чтобы открыть Январь.редактор по http://127.0.0.1:8766
  pause
  exit /b 1
)
start "" cmd /c "timeout /t 1 /nobreak >nul & start http://127.0.0.1:8766/"
echo Январь.редактор  http://127.0.0.1:8766
node server.js
pause
