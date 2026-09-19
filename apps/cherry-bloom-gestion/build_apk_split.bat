@echo off
cd /d "%~dp0"
echo ================================================
echo  Cherry Bloom Gestion - APK liviano (por procesador)
echo ================================================
echo.
call flutter pub get
call dart run flutter_launcher_icons
echo.
echo Compilando APKs separados por arquitectura...
call flutter build apk --release --split-per-abi
echo.
if exist "build\app\outputs\flutter-apk\app-arm64-v8a-release.apk" (
  echo ================================================
  echo Listo. El APK para la mayoria de celulares esta en:
  echo %~dp0build\app\outputs\flutter-apk\app-arm64-v8a-release.apk
  echo ================================================
) else (
  echo ================================================
  echo Algo fallo durante la compilacion.
  echo Revisa el mensaje de arriba y mandaselo a Claude.
  echo ================================================
)
pause
