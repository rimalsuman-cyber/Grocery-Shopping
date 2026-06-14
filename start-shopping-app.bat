@echo off
set "APP_DIR=%~dp0"
set "PYTHON=C:\Users\hari\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
cd /d "%APP_DIR%"
start "Shopping List Reminder" "%PYTHON%" -m http.server 8080 --bind 0.0.0.0
start http://127.0.0.1:8080/
