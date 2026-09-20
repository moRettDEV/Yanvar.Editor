@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Нужен Node.js
  pause
  exit /b 1
)
if not exist "node_modules\electron" (
  echo Ставлю Electron...
  call npm install
)
echo Январь.редактор
call npx electron .
