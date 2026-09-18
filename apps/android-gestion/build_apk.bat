@echo off
cd /d "%~dp0android"
echo Compilando Cherry Bloom Gestion (Android)...
call gradlew.bat assembleDebug
echo.
echo ================================================
echo Listo. El APK esta en:
echo %~dp0android\app\build\outputs\apk\debug\app-debug.apk
echo ================================================
pause
