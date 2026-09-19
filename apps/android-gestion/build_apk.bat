@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0android"

echo ================================================
echo  Compilando Cherry Bloom Gestion (Android)
echo ================================================
echo.

REM --- Verifica si Java ya esta disponible ---
java -version >nul 2>&1
if not errorlevel 1 goto :build

echo No se detecto Java en el PATH. Buscando el que trae Android Studio...

set "FOUND_JAVA="
for %%P in (
  "%ProgramFiles%\Android\Android Studio\jbr"
  "%ProgramFiles%\Android\Android Studio\jre"
  "%LOCALAPPDATA%\Android\Android Studio\jbr"
  "%LOCALAPPDATA%\Programs\Android Studio\jbr"
  "%ProgramFiles(x86)%\Android\Android Studio\jbr"
) do (
  if exist "%%~P\bin\java.exe" (
    set "FOUND_JAVA=%%~P"
  )
)

if defined FOUND_JAVA (
  echo Encontrado: !FOUND_JAVA!
  set "JAVA_HOME=!FOUND_JAVA!"
  set "PATH=!FOUND_JAVA!\bin;%PATH%"
) else (
  echo.
  echo No se encontro Java ni el de Android Studio en las rutas usuales.
  echo Instala Android Studio ^(que ya trae Java incluido^) desde:
  echo https://developer.android.com/studio
  echo o instala un JDK 17 desde https://adoptium.net
  echo y vuelve a ejecutar este archivo.
  echo.
  pause
  exit /b 1
)

:build
echo.
echo Compilando...
call gradlew.bat assembleDebug
set BUILD_RESULT=%errorlevel%

echo.
if exist "app\build\outputs\apk\debug\app-debug.apk" (
  echo ================================================
  echo Listo. El APK esta en:
  echo %~dp0android\app\build\outputs\apk\debug\app-debug.apk
  echo ================================================
) else (
  echo ================================================
  echo Algo fallo durante la compilacion ^(codigo %BUILD_RESULT%^).
  echo Revisa el mensaje de error de arriba y mandaselo a Claude.
  echo ================================================
)
pause
