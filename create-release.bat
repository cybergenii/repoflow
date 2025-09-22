@echo off
echo 🚀 RepoFlow Release Creator
echo ========================

if "%1"=="" (
    echo Usage: create-release.bat [version]
    echo Example: create-release.bat v1.0.0
    echo.
    echo If no version is provided, v1.0.0 will be used.
    set /p version="Enter version (or press Enter for v1.0.0): "
    if "!version!"=="" set version=v1.0.0
) else (
    set version=%1
)

echo.
echo Creating release %version%...
echo.

node create-release.js %version%

echo.
echo ✅ Release creation complete!
echo 📁 Check the release-%version% folder for files
echo.
pause
