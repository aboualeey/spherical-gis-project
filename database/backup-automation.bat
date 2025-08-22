@echo off
REM Spherical GIS Database Backup Automation Script
REM This script handles automated backups with logging and error handling

setlocal enabledelayedexpansion

REM Configuration
set "DB_NAME=spherical_gis"
set "DB_USER=spherical_backup"
set "DB_HOST=localhost"
set "DB_PORT=5432"
set "BACKUP_BASE_DIR=C:\Backups\spherical_gis"
set "LOG_DIR=%BACKUP_BASE_DIR%\logs"
set "POSTGRES_BIN=C:\Program Files\PostgreSQL\17\bin"
set "SEVEN_ZIP=C:\Program Files\7-Zip\7z.exe"

REM Get current date and time
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YEAR=%dt:~0,4%"
set "MONTH=%dt:~4,2%"
set "DAY=%dt:~6,2%"
set "HOUR=%dt:~8,2%"
set "MINUTE=%dt:~10,2%"
set "SECOND=%dt:~12,2%"
set "TIMESTAMP=%YEAR%-%MONTH%-%DAY%_%HOUR%-%MINUTE%-%SECOND%"

REM Determine backup type based on day of week
for /f "skip=1" %%a in ('wmic path win32_localtime get dayofweek /value') do (
    for /f "tokens=2 delims==" %%b in ("%%a") do set "DOW=%%b"
)

if "%DOW%"=="0" (
    set "BACKUP_TYPE=full"
    set "BACKUP_DIR=%BACKUP_BASE_DIR%\full"
) else (
    set "BACKUP_TYPE=incremental"
    set "BACKUP_DIR=%BACKUP_BASE_DIR%\incremental"
)

set "LOG_FILE=%LOG_DIR%\backup_%BACKUP_TYPE%_%TIMESTAMP%.log"
set "BACKUP_FILE=%BACKUP_DIR%\%DB_NAME%_%BACKUP_TYPE%_%TIMESTAMP%.sql"
set "COMPRESSED_FILE=%BACKUP_FILE%.gz"

REM Create directories if they don't exist
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

REM Start logging
echo ================================================ > "%LOG_FILE%"
echo Spherical GIS Database Backup Log >> "%LOG_FILE%"
echo ================================================ >> "%LOG_FILE%"
echo Start Time: %DATE% %TIME% >> "%LOG_FILE%"
echo Backup Type: %BACKUP_TYPE% >> "%LOG_FILE%"
echo Database: %DB_NAME% >> "%LOG_FILE%"
echo Output File: %BACKUP_FILE% >> "%LOG_FILE%"
echo ================================================ >> "%LOG_FILE%"
echo.

REM Function to log messages
:log_message
echo %DATE% %TIME% - %~1 >> "%LOG_FILE%"
echo %~1
goto :eof

REM Check if PostgreSQL service is running
call :log_message "Checking PostgreSQL service status..."
sc query "postgresql-x64-17" | find "RUNNING" >nul
if errorlevel 1 (
    call :log_message "ERROR: PostgreSQL service is not running"
    call :log_message "Attempting to start PostgreSQL service..."
    net start "postgresql-x64-17"
    if errorlevel 1 (
        call :log_message "CRITICAL: Failed to start PostgreSQL service"
        goto :error_exit
    )
    call :log_message "PostgreSQL service started successfully"
)

REM Check if pg_dump exists
if not exist "%POSTGRES_BIN%\pg_dump.exe" (
    call :log_message "ERROR: pg_dump.exe not found at %POSTGRES_BIN%\pg_dump.exe"
    goto :error_exit
)

REM Set password from environment variable or prompt
if "%PGPASSWORD%"=="" (
    call :log_message "WARNING: PGPASSWORD environment variable not set"
    call :log_message "Please set PGPASSWORD before running this script"
    goto :error_exit
)

REM Perform the backup
call :log_message "Starting %BACKUP_TYPE% backup..."

if "%BACKUP_TYPE%"=="full" (
    "%POSTGRES_BIN%\pg_dump.exe" -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f "%BACKUP_FILE%" --verbose --no-password
) else (
    REM For incremental backup, we'll do a full dump but with different retention
    "%POSTGRES_BIN%\pg_dump.exe" -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f "%BACKUP_FILE%" --verbose --no-password
)

if errorlevel 1 (
    call :log_message "ERROR: Backup failed with exit code %errorlevel%"
    goto :error_exit
)

call :log_message "Backup completed successfully"

REM Check if backup file was created and has reasonable size
if not exist "%BACKUP_FILE%" (
    call :log_message "ERROR: Backup file was not created"
    goto :error_exit
)

for %%A in ("%BACKUP_FILE%") do set "FILE_SIZE=%%~zA"
if %FILE_SIZE% LSS 1024 (
    call :log_message "WARNING: Backup file size is suspiciously small (%FILE_SIZE% bytes)"
)

call :log_message "Backup file size: %FILE_SIZE% bytes"

REM Compress the backup if 7-Zip is available
if exist "%SEVEN_ZIP%" (
    call :log_message "Compressing backup file..."
    "%SEVEN_ZIP%" a -tgzip "%COMPRESSED_FILE%" "%BACKUP_FILE%" >> "%LOG_FILE%" 2>&1
    if errorlevel 1 (
        call :log_message "WARNING: Compression failed, keeping uncompressed backup"
    ) else (
        del "%BACKUP_FILE%"
        call :log_message "Backup compressed successfully"
        for %%A in ("%COMPRESSED_FILE%") do set "COMPRESSED_SIZE=%%~zA"
        call :log_message "Compressed file size: %COMPRESSED_SIZE% bytes"
    )
) else (
    call :log_message "7-Zip not found, keeping uncompressed backup"
)

REM Cleanup old backups based on retention policy
call :log_message "Cleaning up old backups..."

if "%BACKUP_TYPE%"=="full" (
    REM Keep full backups for 90 days
    forfiles /p "%BACKUP_DIR%" /s /m *.sql* /d -90 /c "cmd /c del @path" 2>nul
    call :log_message "Cleaned up full backups older than 90 days"
) else (
    REM Keep incremental backups for 7 days
    forfiles /p "%BACKUP_DIR%" /s /m *.sql* /d -7 /c "cmd /c del @path" 2>nul
    call :log_message "Cleaned up incremental backups older than 7 days"
)

REM Log backup to database (if possible)
call :log_message "Logging backup to database..."

set "SQL_LOG=INSERT INTO backup.backup_log (backup_type, start_time, end_time, status, file_path, file_size) VALUES ('%BACKUP_TYPE%', '%TIMESTAMP%', '%TIMESTAMP%', 'success', '%BACKUP_FILE%', %FILE_SIZE%);"

echo %SQL_LOG% | "%POSTGRES_BIN%\psql.exe" -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% --no-password >> "%LOG_FILE%" 2>&1

if errorlevel 1 (
    call :log_message "WARNING: Failed to log backup to database"
) else (
    call :log_message "Backup logged to database successfully"
)

REM Success completion
call :log_message "Backup process completed successfully"
echo ================================================ >> "%LOG_FILE%"
echo End Time: %DATE% %TIME% >> "%LOG_FILE%"
echo ================================================ >> "%LOG_FILE%"

REM Send success notification (if configured)
if defined NOTIFICATION_EMAIL (
    call :send_notification "SUCCESS" "Backup completed successfully"
)

exit /b 0

:error_exit
call :log_message "Backup process failed"
echo ================================================ >> "%LOG_FILE%"
echo End Time: %DATE% %TIME% >> "%LOG_FILE%"
echo Status: FAILED >> "%LOG_FILE%"
echo ================================================ >> "%LOG_FILE%"

REM Send error notification (if configured)
if defined NOTIFICATION_EMAIL (
    call :send_notification "ERROR" "Backup process failed"
)

exit /b 1

:send_notification
REM Simple notification function (can be extended with email/SMS)
echo %DATE% %TIME% - NOTIFICATION [%~1]: %~2 >> "%LOG_DIR%\notifications.log"
REM Add email sending logic here if needed
goto :eof

REM Cleanup
endlocal