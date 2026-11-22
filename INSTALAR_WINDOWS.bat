@echo off
chcp 65001 >nul
title Instalar ORBITA
echo.
echo   ==============================
echo      Instalando ORBITA
echo   ==============================
echo.
set "ORIGEN=%~dp0vault"
set "DESTINO=%USERPROFILE%\Documents\ORBITA"
set "OBS=%LOCALAPPDATA%\Programs\Obsidian\Obsidian.exe"

if not exist "%ORIGEN%\ORBITA" (
  echo No encuentro la carpeta "vault". Descomprime el zip entero y vuelve a abrir este archivo.
  pause & exit /b 1
)

rem 1. Obsidian
if exist "%OBS%" (
  echo [1/3] Obsidian ya esta instalado.
) else (
  echo [1/3] Instalando Obsidian...
  winget install -e --id Obsidian.Obsidian --accept-source-agreements --accept-package-agreements
  if not exist "%OBS%" (
    echo.
    echo No he podido instalarlo solo. Descargalo de https://obsidian.md , instalalo y vuelve a abrir este archivo.
    start "" https://obsidian.md/download
    pause & exit /b 1
  )
)

rem 2. Copiar la boveda (si ya existe, no se toca nada)
if exist "%DESTINO%\ORBITA" (
  echo [2/3] Ya tienes una boveda en %DESTINO%. No la toco.
  echo       Solo actualizo el plugin...
  robocopy "%ORIGEN%\.obsidian\plugins\orbita" "%DESTINO%\.obsidian\plugins\orbita" main.js styles.css manifest.json >nul
) else (
  echo [2/3] Creando tu boveda en %DESTINO%...
  robocopy "%ORIGEN%" "%DESTINO%" /E >nul
)

rem 3. Registrar la boveda en Obsidian y abrirla
echo [3/3] Abriendo Obsidian...
taskkill /IM Obsidian.exe /F >nul 2>nul
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$f = Join-Path $env:APPDATA 'obsidian\obsidian.json'; $p = Join-Path $env:USERPROFILE 'Documents\ORBITA';" ^
  "New-Item -ItemType Directory -Force (Split-Path $f) | Out-Null;" ^
  "$j = if (Test-Path $f) { Get-Content $f -Raw | ConvertFrom-Json } else { [pscustomobject]@{ vaults = [pscustomobject]@{} } };" ^
  "if (-not $j.vaults) { $j | Add-Member -Force vaults ([pscustomobject]@{}) };" ^
  "foreach ($v in $j.vaults.PSObject.Properties) { $v.Value | Add-Member -Force open $false };" ^
  "$ya = $j.vaults.PSObject.Properties | Where-Object { $_.Value.path -eq $p };" ^
  "if ($ya) { $ya.Value | Add-Member -Force open $true } else { $id = -join ((48..57)+(97..102) | Get-Random -Count 16 | ForEach-Object {[char]$_}); $j.vaults | Add-Member -Force $id ([pscustomobject]@{ path = $p; ts = [DateTimeOffset]::Now.ToUnixTimeMilliseconds(); open = $true }) };" ^
  "$j | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 $f"
start "" "%OBS%"

echo.
echo   Listo. En Obsidian pulsa "Confiar en el autor y activar plugins".
echo   Se abrira la Bienvenida de ORBITA.
echo.
echo   Si no se abre tu boveda: en Obsidian, "Abrir carpeta como boveda" y elige
echo   %DESTINO%
echo.
pause
