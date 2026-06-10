@echo off
setlocal enabledelayedexpansion

REM Mordin Backend Deployment Script
REM Description: Builds, packages, and deploys the application to remote server
REM Author: KU Development Team
REM Last Modified: %date%

REM Configuration
set REMOTE_HOST=mordin-server
set REMOTE_PATH=~/mordin-backend
set ARCHIVE_NAME=mordin-backend.tar.gz
set TEMP_DIR=.\temp

REM Main deployment process
echo [INFO] === Mordin Backend Deployment Started ===
echo [INFO] Timestamp: %date% %time%

REM Ensure temp directory exists
if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"

REM Build process
echo [INFO] Building application...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed
    exit /b 1
)
echo [SUCCESS] Build completed successfully

REM Create archive using tar (available in Windows 10+)
echo [INFO] Creating deployment archive...
tar -czf "%TEMP_DIR%\%ARCHIVE_NAME%" dist node_modules package.json migrations scripts DB_MIGRATIONS.md
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create archive
    exit /b 1
)
echo [SUCCESS] Archive created: %TEMP_DIR%\%ARCHIVE_NAME%

REM Get archive size
for %%I in ("%TEMP_DIR%\%ARCHIVE_NAME%") do set size=%%~zI
set /a sizeMB=!size!/1024/1024
echo [INFO] Archive size: !sizeMB! MB

REM Transfer to remote server using scp
echo [INFO] Transferring archive to remote server...
scp "%TEMP_DIR%\%ARCHIVE_NAME%" "%REMOTE_HOST%:%REMOTE_PATH%/"
if %errorlevel% neq 0 (
    echo [ERROR] File transfer failed
    goto cleanup
)
echo [SUCCESS] File transferred successfully

REM Execute remote deployment script
echo [INFO] Executing remote deployment script...
ssh "%REMOTE_HOST%" "bash -c 'source ~/.bashrc && cd %REMOTE_PATH%/script && bash auto.sh && rm -f %REMOTE_PATH%/%ARCHIVE_NAME%'"
if %errorlevel% neq 0 (
    echo [ERROR] Remote deployment failed
    goto cleanup
)
echo [SUCCESS] Remote deployment completed successfully

echo [SUCCESS] === Deployment completed successfully ===
echo [INFO] Deployment finished at: %date% %time%

:cleanup
REM Cleanup function
if exist "%TEMP_DIR%\%ARCHIVE_NAME%" (
    echo [INFO] Cleaning up local archive...
    del "%TEMP_DIR%\%ARCHIVE_NAME%"
)

exit /b 0
