@echo off
setlocal
cd /d "%~dp0"

echo ================================================
echo  Cherry Bloom Studio - Subir cambios a GitHub
echo ================================================
echo.

git --version >nul 2>&1
if errorlevel 1 (
  echo No se encontro Git instalado en esta PC.
  echo Instalalo desde https://git-scm.com/download/win
  echo y luego vuelve a hacer doble clic en este archivo.
  echo.
  pause
  exit /b 1
)

git config --get user.email >nul 2>&1
if errorlevel 1 git config --global user.email "pqctec@gmail.com"
git config --get user.name >nul 2>&1
if errorlevel 1 git config --global user.name "Cherry Bloom Studio"

if not exist ".git" (
  echo Esta carpeta todavia no es un repositorio Git.
  echo Ejecuta primero "sync_github.bat" una sola vez, y despues
  echo ya puedes usar este archivo normalmente.
  echo.
  pause
  exit /b 1
)

echo Agregando y subiendo los cambios actuales...
git add -A
git commit -m "Actualizacion desde Claude"
git push origin main

echo.
echo ================================================
echo Listo. Si Vercel esta conectado a este repo,
echo el despliegue nuevo deberia empezar solo.
echo ================================================
pause
