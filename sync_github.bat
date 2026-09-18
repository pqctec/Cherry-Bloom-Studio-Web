@echo off
setlocal
cd /d "%~dp0"

echo ================================================
echo  Cherry Bloom Studio - Sincronizar todo a GitHub
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

echo Verificando datos de Git...
git config --get user.email >nul 2>&1
if errorlevel 1 git config --global user.email "pqctec@gmail.com"
git config --get user.name >nul 2>&1
if errorlevel 1 git config --global user.name "Cherry Bloom Studio"

echo Preparando archivos que NO deben subirse (node_modules, .next, claves secretas)...
if not exist ".gitignore" (
  (
    echo node_modules/
    echo .next/
    echo .env.local
    echo .env*.local
    echo *.log
  ) > .gitignore
) else (
  echo Ya existe un .gitignore. Verifica que incluya: node_modules/, .next/, .env.local
)

if not exist ".git" (
  echo Inicializando repositorio local...
  git init
  git branch -M main
)

git remote remove origin >nul 2>&1
git remote add origin https://github.com/pqctec/Cherry-Bloom-Studio-Web.git

echo.
echo Agregando todos los archivos del proyecto...
git add -A
git commit -m "Sincronizacion completa del proyecto (todo lo que ya esta en produccion)"

echo.
echo Subiendo a GitHub...
echo NOTA: esto reemplaza el contenido/historial anterior del repo en GitHub
echo con la version actual de esta PC (que es la que ya esta funcionando en Vercel).
echo Si aparece una ventana del navegador pidiendo iniciar sesion, entra con la
echo cuenta de GitHub "pqctec".
echo.
git push -f origin main

echo.
echo ================================================
echo Listo. Avisale a Claude que ya se ejecuto este
echo archivo para que verifique que todo quedo bien.
echo ================================================
pause
