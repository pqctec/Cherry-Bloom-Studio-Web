@echo off
cd /d "%~dp0"
echo ================================================
echo  Compilando Cherry Bloom Gestion (Flutter/Android)
echo ================================================
echo.
echo Instalando dependencias...
call flutter pub get
echo.
echo Generando icono de la app...
call dart run flutter_launcher_icons
echo.
echo Compilando APK (release)...
call flutter build apk --release
echo.
if exist "build\app\outputs\flutter-apk\app-release.apk" (
  echo ================================================
  echo Listo. El APK esta en:
  echo %~dp0build\app\outputs\flutter-apk\app-release.apk
  echo ================================================
) else (
  echo ================================================
  echo Algo fallo durante la compilacion.
  echo Revisa el mensaje de arriba y mandaselo a Claude.
  echo ================================================
)
pause
