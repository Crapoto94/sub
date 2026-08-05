@echo off
title Subventions - Lancement dev
cd /d "%~dp0"

echo ============================================
echo   Subventions - Lancement en dev
echo   Backend  : http://localhost:3261  (API)
echo   Frontend : http://localhost:3260  (BO)
echo ============================================
echo.
echo  Deploye dans des fenetres separees. Fermer les
echo  fenetres pour arreter chaque processus.
echo.

start "Subventions Backend" cmd /k "cd /d %~dp0backend && npm run dev"
start "Subventions Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo  Les deux processus sont lances.
timeout /t 3 >nul
exit
