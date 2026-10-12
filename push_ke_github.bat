@echo off
title Upload LapakUPI ke GitHub
cls
echo ========================================================
echo          MENGUNGGAH PROYEK LAPAKUPI KE GITHUB
echo ========================================================
echo.
echo Menghubungkan ke https://github.com/MuhammadRomdhonIndraGaluh/lapakupi ...
echo.
"%USERPROFILE%\.mingit\cmd\git.exe" push -u origin main
echo.
echo ========================================================
echo  SELESAI! Silakan buka:
echo  https://github.com/MuhammadRomdhonIndraGaluh/lapakupi
echo ========================================================
echo.
pause
